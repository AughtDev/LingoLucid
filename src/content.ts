import {CheckIfTranslatedPayload, Message, MessageResponse, MessageType, TranslationPayload} from "./types/comms.ts";
import {createRoot} from "react-dom/client";
import {InspectTextPopup} from "./ui/inspect";
import tailwind from "./popup/main.css?inline"
import React from "react";
import "./ai/highlight.css"
import {textSelectListener, wordHoverListener} from "./ui/content/listeners.ts";
import {highlightPage, translatePage} from "./ui/content/page_actions.ts";
import {downloadTranslationModel} from "./ai/translation.ts";

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

            // make sure that model is downloaded, if it is, this will return immediately
            downloadTranslationModel(payload.tgt_lang_code, () => null,() => null).then((res) => {
                if (!res) {
                    sendResponse({is_success: false, error_message: "Failed to download translation model"})
                    return
                }
                payload = message.payload as TranslationPayload
                translatePage(payload.tgt_lang_code,payload.tgt_proficiency).then((result) => {
                    if (result) {
                        console.log("Page translated successfully");
                        highlightPage().then(() => {
                            console.log("Page highlighted successfully after translation");
                            addListenersToArticles()
                        })
                    }
                    sendResponse({is_success: result});
                }).catch((error) => {
                    console.error("Error translating page:", error);
                    sendResponse({is_success: false, error_message: error.message});
                })
            })
            return true

        case MessageType.HIGHLIGHT_PAGE:
            highlightPage().then(() => {
                console.log("Page highlighted successfully");
                sendResponse({is_success: true});
            }).catch((error) => {
                console.error("Error highlighting page:", error);
                sendResponse({is_success: false, error_message: error.message});
            })
            return true

        case MessageType.CHECK_IF_TRANSLATED:
            payload = message.payload as CheckIfTranslatedPayload
            const is_translated = document.body.getAttribute('data-target-lang') === payload.lang_code;
            sendResponse({is_success: true, data: is_translated});
            break;

        default:
            console.warn('Content Script: Unknown message type:', message.type);
            sendResponse({is_success: false, error_message: 'Unknown message type'});
            break;
    }
})


// region LISTENER INJECTION
// ? ........................

function debounce(func: Function, wait: number) {
    let timeout: number | undefined;
    return function (this: any, ...args: any[]) {
        const later = () => {
            timeout = undefined;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = window.setTimeout(later, wait);
    };
}

function addListenersToArticles() {
    const articles = document.getElementsByTagName('article');
    for (let article of articles) {
        article.addEventListener('mouseup', textSelectListener)
        article.addEventListener("mouseover", debounce(wordHoverListener, 100));
        article.addEventListener("mousemove", debounce(wordHoverListener, 100));
    }
}


// ? ........................
// endregion ........................

