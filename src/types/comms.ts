import {LanguageCards, ProficiencyLevel} from "./core.ts";

export enum MessageType {
    TRANSLATE_PAGE,
    HIGHLIGHT_PAGE,
    CHECK_IF_TRANSLATED,
    SAVE_CARD,
    GET_CARDS
}


export interface TranslationPayload {
    // this is meant to be the language codes like 'en', 'es', 'fr', etc.
    tgt_lang_code: string;
    tgt_proficiency: ProficiencyLevel
}

export interface SaveCardPayload {
    lang_code: string;
    text: string;
    translation: string;
    type: keyof LanguageCards
}

export interface CheckIfTranslatedPayload {
    lang_code: string
}

export interface GetCardsPayload {
    lang_code: string;
}

export interface Message<T = TranslationPayload | SaveCardPayload | CheckIfTranslatedPayload> {
    type: MessageType;
    payload?: T
}

export interface MessageResponse<T = any> {
    is_success: boolean;
    data?: T;
    error_message?: string;
}
