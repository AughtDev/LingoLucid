import {Message, MessageResponse, MessageType, TranslationPayload} from "./types/comms.ts";
import {translateToTargetLanguage} from "./ai/translation.ts";
import {createRoot} from "react-dom/client";
import {InspectTextPopup} from "./ui/inspect";
// import "./ui/inspect/index.tsx"

console.log("Hello everybody, this is LingoLucid")

const ll_root = document.createElement("div")
ll_root.id = "lingolucid-root"
ll_root.style.display = "none"
ll_root.style.position = "absolute"
ll_root.style.zIndex = "99999"  // maximum z-index to ensure it's on top
document.body.appendChild(ll_root)

export const SHADOW_ROOT = ll_root.attachShadow({mode: "open"})
const root = createRoot(SHADOW_ROOT)

root.render(InspectTextPopup())

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
        const text_nodes: Text[] = [];
        const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
        let node;
        while (node = walker.nextNode()) {
            text_nodes.push(node as Text);
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
    }
    return true
}

// ? ........................
// endregion ........................


// region UI INJECTION ON SELECTION
// ? ........................

function addSelectionListenerToArticles() {
    const ll_root = document.getElementById("lingolucid-root");
    if (!ll_root) {
        console.error("LingoLucid root element not found");
        return;
    }
    const articles = document.getElementsByTagName('article');
    for (let article of articles) {
        article.addEventListener('mouseup', (_e) => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                console.log("User selected text:", selection.toString());
                ll_root.style.display = "block";
            }
        })
    }
}


// ? ........................
// endregion ........................

