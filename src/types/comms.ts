import {LanguageCards} from "./core.ts";

export enum MessageType {
    TRANSLATE_PAGE,
    SAVE_CARD
}

export interface TranslationPayload {
    // this is meant to be the language codes like 'en', 'es', 'fr', etc.
    tgt_lang_code: string;
}

export interface SaveCardPayload {
    lang_code: string;
    text: string;
    translation: string;
    type: keyof LanguageCards
}

export interface Message<T = TranslationPayload | SaveCardPayload> {
    type: MessageType;
    payload?: T
}

export interface MessageResponse<T = any> {
    is_success: boolean;
    data?: T;
    error_message?: string;
}
