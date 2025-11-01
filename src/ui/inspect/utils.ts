import {LanguageCards} from "../../types/core.ts";
import {MessageType, SaveCardPayload} from "../../types/comms.ts";

export async function saveCardToLocalStorage(
    lang_code: string, text: string, translation: string, type: keyof LanguageCards
) {
    return await chrome.runtime.sendMessage({
        type: MessageType.SAVE_CARD,
        payload: {
            lang_code,
            text, translation, type
        } satisfies SaveCardPayload
    });
}

