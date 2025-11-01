import {
    Message,
    MessageResponse,
    MessageType,
    PageTranslateProgressPayload,
    Port,
    PortMessage,
    TranslationPayload
} from "./types/comms.ts";
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

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === Port.PAGE_TRANSLATE) {

        port.onMessage.addListener((message: Message) => {
            switch (message.type) {
                case MessageType.TRANSLATE_PAGE:
                    let payload = message.payload as TranslationPayload
                    console.log("Translating page to", payload.tgt_lang_code)

                    // make sure that model is downloaded, if it is, this will return immediately
                    downloadTranslationModel("en", payload.tgt_lang_code, () => null).then((res) => {
                        if (!res) {
                            // sendResponse({is_success: false, error_message: "Failed to download translation model"})
                            try {
                                port.postMessage({
                                    type: PortMessage.PAGE_TRANSLATE_PROGRESS,
                                    payload: {
                                        progress: 0.5,
                                        status: "error",
                                        error_message: "Failed to download translation model"
                                    } satisfies PageTranslateProgressPayload
                                })
                            } catch (err) {
                                console.error("Error sending error message on port:", err);
                            }
                            return
                        }
                        translatePage(payload.tgt_lang_code, payload.tgt_proficiency, (progress) => {
                            try {
                                port.postMessage({
                                    type: PortMessage.PAGE_TRANSLATE_PROGRESS,
                                    payload: {
                                        progress, status: "in_progress"
                                    } satisfies PageTranslateProgressPayload
                                })
                            } catch (error) {
                                console.error("Error sending progress message on port:", error);
                            }
                        }).then((result) => {
                            if (result) {
                                console.log("Page translated successfully");
                                highlightPage().then(() => {
                                    console.log("Page highlighted successfully after translation");
                                    addListenersToArticles()
                                })
                            }
                            // sendResponse({is_success: result});
                            try {
                                port.postMessage({
                                    type: PortMessage.PAGE_TRANSLATE_PROGRESS,
                                    payload: {
                                        progress: 1, status: "success"
                                    } satisfies PageTranslateProgressPayload
                                })
                            } catch (error) {
                                console.error("Error sending success message on port:", error);
                            }

                        }).catch((error) => {
                            console.error("Error translating page:", error);
                            // sendResponse({is_success: false, error_message: error.message});
                            try {
                                port.postMessage({
                                    type: PortMessage.PAGE_TRANSLATE_PROGRESS,
                                    payload: {
                                        progress: 0.5, status: "error", error_message: "Error translating page"
                                    } satisfies PageTranslateProgressPayload
                                })
                            } catch (err) {
                                console.error("Error sending error message on port:", err);
                            }
                        })
                    })
                    return true
                default:
                    console.warn('Content Script: Unknown message type on port:', message.type);
                    break;
            }
        })
    }
})

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse: (response?: MessageResponse) => void) => {

    switch (message.type) {

        case MessageType.HIGHLIGHT_PAGE:
            highlightPage().then(() => {
                console.log("Page highlighted successfully");
                sendResponse({is_success: true});
            }).catch((error) => {
                console.error("Error highlighting page:", error);
                sendResponse({is_success: false, error_message: error.message});
            })
            return true

        case MessageType.GET_PAGE_LANG_CODE:
            const code = document.body.getAttribute('data-target-lang');
            sendResponse({is_success: true, data: code});
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
    // const articles = document.getElementsByTagName('article');
    // for (let article of articles) {
    //     article.addEventListener('mouseup', textSelectListener)
    //     article.addEventListener("mouseover", debounce(wordHoverListener, 50));
    //     article.addEventListener("mousemove", debounce(wordHoverListener, 50));
    // }
    document.body.addEventListener('mouseup', textSelectListener)
    document.body.addEventListener("mouseover", debounce(wordHoverListener, 100));
    document.body.addEventListener("mousemove", debounce(wordHoverListener, 25));
}


// ? ........................
// endregion ........................

