import {Message, MessageResponse, MessageType, TranslationPayload} from "./types/comms.ts";
import {translateToTargetLanguage} from "./ai/translation.ts";
import {createRoot} from "react-dom/client";
import {InspectTextPopup} from "./ui/inspect";
import tailwind from "./popup/main.css?inline"
import React from "react";
import {getPopupState, PopupType, updatePopupState} from "./ui/inspect/store.ts";
import {SnippetHighlightType} from "./ai/highlight.ts";
import "./ai/highlight.css"

console.log("Hello everybody, this is LingoLucid")

const ll_root = document.createElement("div")
ll_root.id = "lingolucid-root"
// ll_root.style.display = "none"
ll_root.style.position = "absolute"
ll_root.style.top = "0"
ll_root.style.left = "0"
ll_root.style.zIndex = "99999"
document.body.appendChild(ll_root)

export const SHADOW_ROOT = ll_root.attachShadow({mode: "open"})

// inject tailwind styles into shadow root
const style = document.createElement("style")
style.textContent = tailwind
SHADOW_ROOT.appendChild(style)

const root = createRoot(SHADOW_ROOT)

root.render(React.createElement(InspectTextPopup))

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse: (response?: MessageResponse) => void) => {
    console.log("Messaging", "Content script received message:", message, "from", sender);

    let payload;
    switch (message.type) {
        case MessageType.TRANSLATE_PAGE:
            payload = message.payload as TranslationPayload
            console.log("Translating page to", payload.tgt_lang_code)
            // sendResponse({is_success: result});
            translatePage(payload.tgt_lang_code, new Map(payload.highlight_map)).then((result) => {
                if (result) {
                    console.log("Page translated successfully");
                    addListenersToArticles()
                }
                sendResponse({is_success: result});
            }).catch((error) => {
                console.error("Error translating page:", error);
                sendResponse({is_success: false, error_message: error.message});
            });
            return true

        case MessageType.CHECK_IF_TRANSLATED:
            const is_translated = document.body.getAttribute('data-target-lang') !== null;
            sendResponse({is_success: true, data: is_translated});
            break;

        default:
            console.warn('Content Script: Unknown message type:', message.type);
            sendResponse({is_success: false, error_message: 'Unknown message type'});
            break;
    }
})


// region PAGE FULL
// ? ........................

export async function translatePage(tgt_lang_code: string, word_map: Map<string, SnippetHighlightType>): Promise<boolean> {
    console.log("the word map is ", word_map);
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
                    text_node.nodeValue = translation;
                }
            } catch (error) {
                console.error("Translation error for text:", og_text, error);
            }
        }
        highlightArticleKeywords(article, word_map);

        // add translated class to article to prevent re-text
        article.classList.add('lingolucid-translated');
    }
    document.body.setAttribute("data-target-lang", tgt_lang_code);
    return true
}

function highlightArticleKeywords(article: HTMLElement, word_map: Map<string, SnippetHighlightType>) {
    const text_nodes = [];
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
    let node;
    while (node = walker.nextNode()) {
        text_nodes.push(node as Text);
    }

    const highlighted_ranges: Map<SnippetHighlightType,Range[]> = new Map();

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

// ? ........................
// endregion ........................


// region UI INJECTION ON SELECTION
// ? ........................

function addListenersToArticles() {
    const articles = document.getElementsByTagName('article');
    for (let article of articles) {
        article.addEventListener('mouseup', (_e) => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                console.log("User selected text:", selection.toString());

                // set the position of the popup near the selection
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // root.render(React.createElement(InspectTextPopup, {
                //     text: selection.toString(),
                //     top: rect.bottom + window.scrollY,
                //     left: rect.left + window.scrollX,
                //     closePopup: closePopup
                // }))
                updatePopupState({
                    type: PopupType.FULL,
                    text: selection.toString(),
                    changeText: () => null,
                    onSave: () => {
                        chrome.runtime.sendMessage({
                            type: MessageType.GET_CARDS,
                            payload: {
                                lang_code: document.body.getAttribute('data-target-lang') || '',
                                type: "saved"
                            }
                        }).then((response: MessageResponse) => {
                            console.log("response is ", response);
                            if (response.is_success && response.data) {
                                const map = new Map<string, SnippetHighlightType>();
                                for (let card of response.data) {
                                    map.set(card.text, SnippetHighlightType.SAVED);
                                }
                                highlightArticleKeywords(article, map)
                            }
                        }).catch((error) => {
                            console.error("Error getting saved cards:", error);
                        });
                    },
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX
                });
            }
        })
        article.addEventListener("mouseover", wordHoverListener);
        article.addEventListener("mousemove", wordHoverListener);
    }
}


// ? ........................
// endregion ........................


// region UI INJECTION ON HOVER
// ? ........................

// function debounce(func: Function, wait: number) {
//     let timeout: number | undefined;
//     return function (this: any, ...args: any[]) {
//         const later = () => {
//             timeout = undefined;
//             func.apply(this, args);
//         };
//         clearTimeout(timeout);
//         timeout = window.setTimeout(later, wait);
//     };
// }

const HOVER_DELAY = 1000; // milliseconds

// let curr_hovered_word: string | null = null;
let curr_hover_session: number = Math.random()

function closePopup() {
    updatePopupState({
        type: PopupType.NONE,
        text: '',
        changeText: () => null,
        top: 0,
        left: 0
    })
    curr_hover_session = Math.random()
    // curr_hovered_word = null
}

function wordHoverListener(e: MouseEvent) {
    if (getPopupState().type === PopupType.FULL) {
        // full popup is shown, do not show hover popup
        return;
    }
    const coords = {x: e.clientX, y: e.clientY};
    curr_hover_session= Math.random()

    const caret_pos = document.caretPositionFromPoint(coords.x, coords.y);
    if (caret_pos && caret_pos.offsetNode && caret_pos.offsetNode.nodeType === Node.TEXT_NODE) {
        const text_node = caret_pos.offsetNode as Text;
        if (!text_node.textContent) return;
        // console.log("hovering over text node:", text_node.textContent.slice(0, 30), "...");
        // get exact word hovered over

        // check if the caret is actually over visible text
        const range_check = document.createRange();
        const r_offset = Math.max(0, Math.min(caret_pos.offset, text_node.length - 1));
        range_check.setStart(text_node, r_offset);
        range_check.setEnd(text_node, r_offset + 1);
        const rects = Array.from(range_check.getClientRects());
        if (rects.length === 0) {
            console.log("No visible rects for hovered text");
            closePopup()
            return;
        };

        const hit = rects.find(r => coords.x >= r.left - 1 && coords.x <= r.right + 1 && coords.y >= r.top - 1 && coords.y <= r.bottom + 1);
        if (!hit) {
            console.log("Not actually hovering over visible text");
            closePopup()
            return;
        }


        // set popup to show up after delay

        const this_session = curr_hover_session;
        setTimeout(() => {
            // check if the hover session is still the same
            if (this_session !== curr_hover_session) {
                console.log("Hover session changed, mouse moved, not showing popup");
                return;
            }

            if (getPopupState().type !== PopupType.NONE) {
                console.log("Popup already shown, not showing hover popup");
                return; // popup already shown, do nothing
            }

            // expand to full word
            const offset = caret_pos.offset;
            const text_content = text_node.textContent || '';
            const right_part = text_content.slice(offset);
            const left_part = text_content.slice(0, offset);

            const left_word_match = left_part.match(/(\S+)$/);
            const right_word_match = right_part.match(/^(\S+)/);

            const left_word = left_word_match ? left_word_match[0] : '';
            const right_word = right_word_match ? right_word_match[0] : '';

            let hovered_word = left_word + right_word;

            // if (hovered_word === curr_hovered_word) {
            //     console.log("Same hovered word as before:", hovered_word);
            //     return; // same word as before, do nothing
            // }
            // curr_hovered_word = hovered_word;

            // remove any punctuation from hovered word
            hovered_word = hovered_word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

            if (hovered_word.trim().length > 0 && getPopupState().text !== hovered_word) {
                console.log("Hovered word:", hovered_word);
                const start = offset - left_word.length;
                const end = start + hovered_word.length;
                // show hover popup near the word
                updatePopupState({
                    type: PopupType.HOVER,
                    text: hovered_word,
                    // update the text by changing the node value
                    changeText: (newText: string) => {
                        if (!text_node.parentNode) return;
                        // only update the specific word in the text node
                        const original_text = text_node.nodeValue || '';
                        const before_word = original_text.slice(0, start);
                        const after_word = original_text.slice(end);
                        text_node.nodeValue = before_word + newText + after_word;
                    },
                    // top and left are just below the word aligned with the start of the word
                    top: hit.bottom + window.scrollY,
                    left: hit.left + window.scrollX,
                    // top: e.pageY + 10,
                    // left: e.pageX + 10
                });
            }
        }, HOVER_DELAY);
    } else {
        // closePopup()
    }
}

// ? ........................
// endregion ........................
