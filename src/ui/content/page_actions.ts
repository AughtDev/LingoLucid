import {cardsToHighlightMap, SnippetHighlightType} from "../../ai/highlight.ts";
import {translateToTargetLanguage} from "../../ai/translation.ts";
import {GetCardsPayload, MessageResponse, MessageType} from "../../types/comms.ts";
import {LanguageCards, ProficiencyLevel} from "../../types/core.ts";
import {simplifyTranslatedText} from "../../ai/simplify.ts";
import {detectLanguage} from "../../ai/detect.ts";
import {generateUniqueId} from "../../helpers/strings.ts";
import {initEngagementTracking} from "./engagement.ts";
import {updateCachedCards} from "../store/cards.ts";
import {instantiateTextNode} from "../store/performance.ts";
import {getSimplifications} from "../store/simplifications.ts";

export async function translatePage(tgt_lang_code: string, tgt_level: ProficiencyLevel, setProgress: (progress: number) => void): Promise<boolean> {
    // convert all text nodes within any article tags to the target language
    const articles = document.getElementsByTagName('article');
    for (let article of articles) {
        // check if article has already been translated
        if (article.classList.contains('lingolucid-translated')) {
            console.log("Article already translated, skipping");
            continue;
        }
        const text_nodes: Text[] = [];
        const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
        let node;
        while (node = walker.nextNode()) {
            text_nodes.push(node as Text);
        }

        let i = 0
        for (let text_node of text_nodes.slice(0, 30)) {
            // save the start and ending whitespace,
            const l_pad = text_node.nodeValue?.match(/^\s*/)?.[0] || '';
            const r_pad = text_node.nodeValue?.match(/\s*$/)?.[0] || '';
            const og_text = text_node.nodeValue?.trim() || '';
            if (og_text.length === 0) continue;

            try {
                // confirm that text is either in english or in the target language already
                const detected_lang = await detectLanguage(og_text)
                if (!detected_lang) {
                    console.error("Could not detect language for text:", og_text, "skipping translation");
                    continue
                }
                let translation: string | null = null;
                if (detected_lang === tgt_lang_code) {
                    console.warn("Text already in target language:", og_text, "skipping translation");
                    translation = og_text
                } else if (detected_lang === 'en') {
                    console.log("Text detected as English, translating to target language:", og_text);
                    translation = await translateToTargetLanguage(og_text, tgt_lang_code);
                    console.log("Translating text:", og_text, "to", translation);
                } else {
                    console.error("Text detected in unsupported language:", detected_lang, "for text:", og_text, "skipping this article");
                    continue
                }


                if (translation && translation.trim().length > 0) {
                    // simplify
                    const simplified = await simplifyTranslatedText(tgt_lang_code, translation, {
                        level: tgt_level
                    })

                    if (simplified && simplified.trim().length > 0) {
                        console.log("Simplified translation:", translation, "to", simplified);
                        text_node.nodeValue = l_pad + simplified + r_pad;
                    } else {
                        console.warn("Simplification failed or empty, using original translation");
                        text_node.nodeValue = l_pad + translation + r_pad;
                    }
                }

                // add unique id to text node attributes for later tracking
                if (text_node.parentElement && text_node.nodeValue?.trim() && !text_node.parentElement.getAttribute('ll_id')) {
                    const node_id = generateUniqueId();
                    text_node.parentElement?.setAttribute('ll_id', node_id);
                    instantiateTextNode(node_id, text_node.nodeValue ?? "", tgt_lang_code).then()
                }
            } catch (error) {
                console.error("Translation error for text:", og_text, error);
            }

            i += 1;
            setProgress((i / Math.min(text_nodes.length,30)) / articles.length);
        }
        // highlightArticleKeywords(article, word_map);

        // add translated class to article to prevent re-text
        article.classList.add('lingolucid-translated');
    }
    document.body.setAttribute("data-target-lang", tgt_lang_code);
    initEngagementTracking()
    return true
}


export async function highlightPage(): Promise<void> {
    const target_lang = document.body.getAttribute('data-target-lang') || '';
    if (!target_lang) {
        console.warn("No target language set, cannot highlight page");
        return;
    }

    const articles = document.getElementsByTagName('article');

    const word_map = new Map<string,SnippetHighlightType>()

    await chrome.runtime.sendMessage({
        type: MessageType.GET_CARDS,
        payload: {
            lang_code: target_lang
        } satisfies GetCardsPayload
    }).then((response: MessageResponse<LanguageCards>) => {
        console.log("response is ", response);
        if (response.is_success && response.data) {
            updateCachedCards(response.data)
            const map = cardsToHighlightMap(response.data)
            for (let [word, highlight_type] of map.entries()) {
                word_map.set(word, highlight_type);
            }
        }
        return null
    }).catch((error) => {
        console.error("Error getting saved cards:", error);
    });

    // add simplifications
    getSimplifications().forEach(txt => {
        word_map.set(txt, SnippetHighlightType.SIMPLIFIED);
    })

    if (!word_map) {
        console.warn("No saved cards found for language", target_lang);
        return;
    }

    for (let article of articles) {
        const text_nodes: Text[] = [];
        const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
        let node;
        // only the first 200 words for testing
        while (node = walker.nextNode()) {
            text_nodes.push(node as Text);
        }

        const highlighted_ranges: Map<SnippetHighlightType, Range[]> = new Map();

        for (let text_node of text_nodes.slice(0,30)) {
            const og_text = text_node.nodeValue || '';
            if (og_text.trim().length === 0) continue;

            for (let [word, highlight_type] of word_map.entries()) {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                let match;
                while ((match = regex.exec(og_text)) !== null) {
                    const range = document.createRange();
                    range.setStart(text_node, match.index);
                    range.setEnd(text_node, match.index + word.length);
                    if (!highlighted_ranges.has(highlight_type)) {
                        highlighted_ranges.set(highlight_type, []);
                    }
                    highlighted_ranges.get(highlight_type)!.push(range);
                }
            }
        }

        // Now apply highlights for each type
        highlighted_ranges.forEach((ranges, highlight_type) => {
            const underlines = new Highlight(...ranges)
            CSS.highlights.set(`lingolucid-highlight-${highlight_type}`, underlines);
        })
    }
}
