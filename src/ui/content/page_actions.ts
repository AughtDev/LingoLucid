import {cardsToHighlightMap, SnippetHighlightType} from "../../ai/highlight.ts";
import {translateToTargetLanguage} from "../../ai/translation.ts";
import {GetCardsPayload, MessageResponse, MessageType} from "../../types/comms.ts";
import {LanguageCards, ProficiencyLevel} from "../../types/core.ts";
import {simplifyTranslatedText} from "../../ai/simplify.ts";

export async function translatePage(tgt_lang_code: string, tgt_level: ProficiencyLevel): Promise<boolean> {
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
        // only the first 200 words for testing
        let word_count = 0;
        while (node = walker.nextNode()) {
            text_nodes.push(node as Text);
            word_count += (node.nodeValue || '').split(' ').length;
            if (word_count >= 200) {
                console.log("Reached word limit for text, stopping");
                break;
            }
        }

        for (let text_node of text_nodes) {
            const og_text = text_node.nodeValue || '';
            if (og_text.trim().length === 0) continue;

            try {
                const translation = await translateToTargetLanguage(og_text, tgt_lang_code);
                if (translation && translation.trim().length > 0) {
                    console.log("Translating text:", og_text, "to", translation);
                    // simplify
                    const simplified = await simplifyTranslatedText(translation, {
                        level: tgt_level
                    })

                    if (simplified && simplified.trim().length > 0) {
                        console.log("Simplified translation:", translation, "to", simplified);
                        text_node.nodeValue = simplified;
                    } else {
                        console.warn("Simplification failed or empty, using original translation");
                        text_node.nodeValue = translation;
                    }
                }
            } catch (error) {
                console.error("Translation error for text:", og_text, error);
            }
        }
        // highlightArticleKeywords(article, word_map);

        // add translated class to article to prevent re-text
        article.classList.add('lingolucid-translated');
    }
    document.body.setAttribute("data-target-lang", tgt_lang_code);
    return true
}


export async function highlightPage(): Promise<void> {
    const target_lang = document.body.getAttribute('data-target-lang') || '';
    if (!target_lang) {
        console.warn("No target language set, cannot highlight page");
        return;
    }

    const articles = document.getElementsByTagName('article');

    const word_map = await chrome.runtime.sendMessage({
        type: MessageType.GET_CARDS,
        payload: {
            lang_code: target_lang
        } satisfies GetCardsPayload
    }).then((response: MessageResponse<LanguageCards>) => {
        console.log("response is ", response);
        if (response.is_success && response.data) {
            return cardsToHighlightMap(response.data)
        }
        return null
    }).catch((error) => {
        console.error("Error getting saved cards:", error);
    });

    if (!word_map) {
        console.warn("No saved cards found for language", target_lang);
        return;
    }

    for (let article of articles) {
        const text_nodes: Text[] = [];
        const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
        let node;
        // only the first 200 words for testing
        let word_count = 0;
        while (node = walker.nextNode()) {
            text_nodes.push(node as Text);
            word_count += (node.nodeValue || '').split(' ').length;
            if (word_count >= 200) {
                console.log("Reached word limit for text, stopping");
                break;
            }
        }

        const highlighted_ranges: Map<SnippetHighlightType, Range[]> = new Map();

        for (let text_node of text_nodes) {
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
