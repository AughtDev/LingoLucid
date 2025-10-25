import {LanguageCards} from "./core.ts";
import {SnippetHighlightType} from "../ai/highlight.ts";

export enum MessageType {
    TRANSLATE_PAGE,
    CHECK_IF_TRANSLATED,
    SAVE_CARD,
    GET_CARDS
}


export interface TranslationPayload {
    // this is meant to be the language codes like 'en', 'es', 'fr', etc.
    tgt_lang_code: string;
    highlight_map: [string, SnippetHighlightType][];
}

export interface SaveCardPayload {
    lang_code: string;
    text: string;
    translation: string;
    type: keyof LanguageCards
}

export interface GetCardsPayload {
    lang_code: string;
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
