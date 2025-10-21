import {Message, MessageResponse, MessageType, SaveCardPayload} from "../types/comms.ts";
import {saveLanguageCardService} from "../utils/data/services.ts";

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse: (response?: MessageResponse) => void) => {
    console.log("Background: Received message:", message, "from", sender);

    let payload;
    switch (message.type) {
        case MessageType.SAVE_CARD:
            payload = message.payload as SaveCardPayload
            saveLanguageCardService(payload.lang_code, {
                text: payload.text,
                translation: payload.translation,
                reviews: []
            }, payload.type).then(() => {
                console.log("Background: Card saved successfully");
                sendResponse({is_success: true});
            }).catch((error) => {
                console.error("Background: Error saving card:", error);
                sendResponse({is_success: false, error_message: error.message});
            });
            break;

        default:
            console.warn('Background: Unknown message type:', message.type);
            sendResponse({is_success: false, error_message: 'Unknown message type'});
            return;
    }
})
