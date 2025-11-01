import {
    GetCardsPayload,
    Message,
    MessageResponse,
    MessageType,
    SaveCardPayload,
    UpdateProgressPayload
} from "../types/comms.ts";
import {
    getLanguageService,
    saveLanguageCardService, updateLanguageProgressService
} from "../utils/data/services.ts";
import {textToEvalStats} from "../ai/evaluate.ts";


async function saveCard(payload: SaveCardPayload) {
    const proficiency_level = await textToEvalStats(payload.text, payload.lang_code)
    return saveLanguageCardService(payload.lang_code, {
        text: payload.text,
        translation: payload.translation,
        difficulty: proficiency_level?.cefr_level ?? "a1",
        reviews: [],
        created_at_t: Date.now()
    }, payload.type)

}

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse: (response?: MessageResponse) => void) => {

    let payload;
    switch (message.type) {
        case MessageType.SAVE_CARD:
            payload = message.payload as SaveCardPayload
            saveCard(payload)
                .then(() => {
                    console.log("Background: Card saved successfully");
                    sendResponse({is_success: true});
                }).catch((error) => {
                console.error("Background: Error saving card:", error);
                sendResponse({is_success: false, error_message: error.message});
            });
            return true

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

        case MessageType.UPDATE_PROGRESS:
            payload = message.payload as UpdateProgressPayload
            updateLanguageProgressService(payload.lang_code, payload.delta).then(res => {
                payload = message.payload as UpdateProgressPayload
                if (!res) {
                    sendResponse({is_success: false, error_message: `Language ${payload.lang_code} not found`});
                    return;
                }
                // also update local storage
                sendResponse({is_success: true});
            })
            return true

        default:
            console.warn('Background: Unknown message type:', message.type);
            sendResponse({is_success: false, error_message: 'Unknown message type'});
            return;
    }
})
