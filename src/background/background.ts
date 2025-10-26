import {GetCardsPayload, Message, MessageResponse, MessageType, SaveCardPayload} from "../types/comms.ts";
import {getLanguageService, saveLanguageCardService} from "../utils/data/services.ts";

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse: (response?: MessageResponse) => void) => {
    console.log("Background: Received message:", message, "from", sender);

    let payload;
    switch (message.type) {
        case MessageType.SAVE_CARD:
            payload = message.payload as SaveCardPayload
            saveLanguageCardService(payload.lang_code, {
                text: payload.text,
                translation: payload.translation,
                reviews: [],
                created_at_t: Date.now()
            }, payload.type).then(() => {
                console.log("Background: Card saved successfully");
                sendResponse({is_success: true});
            }).catch((error) => {
                console.error("Background: Error saving card:", error);
                sendResponse({is_success: false, error_message: error.message});
            });
            break;

        case MessageType.GET_CARDS:
            payload = message.payload as GetCardsPayload
            getLanguageService(payload.lang_code).then((lang) => {
                payload = message.payload as GetCardsPayload
                if (!lang) {
                    sendResponse({is_success: false, error_message: `Language ${payload.lang_code} not found`});
                    return;
                }
                sendResponse({is_success: true, data: lang.cards});
            }).catch((error) => {
                console.error("Background: Error getting cards:", error);
                sendResponse({is_success: false, error_message: error.message});
            });
            return true;

        default:
            console.warn('Background: Unknown message type:', message.type);
            sendResponse({is_success: false, error_message: 'Unknown message type'});
            return;
    }
})
