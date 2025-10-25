import {Message, MessageResponse, MessageType, TranslationPayload} from "./types/comms.ts";
import {translateToTargetLanguage} from "./ai/translation.ts";
import {createRoot} from "react-dom/client";
import {InspectTextPopup} from "./ui/inspect";
import tailwind from "./popup/main.css?inline"
import React from "react";
import {updatePopupState} from "./ui/inspect/store.ts";

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
            translatePage(payload.tgt_lang_code).then((result) => {
                if (result) {
                    console.log("Page translated successfully");
                    addSelectionListenerToArticles()
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


// region PAGE TRANSLATION
// ? ........................

export async function translatePage(tgt_lang_code: string): Promise<boolean> {
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
                console.log("Reached word limit for translation, stopping");
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
        // add translated class to article to prevent re-translation
        article.classList.add('lingolucid-translated');
    }
    document.body.setAttribute("data-target-lang", tgt_lang_code);
    return true
}

// ? ........................
// endregion ........................


// region UI INJECTION ON SELECTION
// ? ........................

function addSelectionListenerToArticles() {
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
                //     translation: selection.toString(),
                //     top: rect.bottom + window.scrollY,
                //     left: rect.left + window.scrollX,
                //     closePopup: closePopup
                // }))
                updatePopupState({
                    isVisible: true,
                    translation: selection.toString(),
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX
                });
            }
        })
    }
}

// on clicking outside the popup, hide the popup
// document.addEventListener('click', (e) => {
//     const ll_root_elem = SHADOW_ROOT.host;
//     if (!ll_root_elem.contains(e.target as Node)) {
//         // hide the popup
//         updatePopupState({
//             isVisible: false
//         });
//     }
// })
// // or scrolling the page
// window.addEventListener("scroll", () => {
//     updatePopupState({
//         isVisible: false
//     });
// });


// ? ........................
// endregion ........................

