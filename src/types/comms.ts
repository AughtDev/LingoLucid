import {LanguageCards, ProficiencyLevel} from "./core.ts";

export enum MessageType {
    TRANSLATE_PAGE,
    HIGHLIGHT_PAGE,
    GET_PAGE_LANG_CODE,
    SAVE_CARD,
    GET_CARDS,

    UPDATE_PROGRESS,
}

export enum Port {
    PAGE_TRANSLATE = "PAGE_TRANSLATE",
}

export enum PortMessage {
    PAGE_TRANSLATE_PROGRESS = "PAGE_TRANSLATE_PROGRESS",
}

export interface PageTranslateProgressPayload {
    status: "success" | "in_progress" | "error";
    progress: number; // progress value between 0 and 1
    error_message?: string
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

export interface GetCardsPayload {
    lang_code: string;
}

export interface UpdateProgressPayload {
    lang_code: string;
    deltas: [string,number][]
}

export interface Message<T = TranslationPayload | SaveCardPayload | UpdateProgressPayload> {
    type: MessageType;
    payload?: T
}

export interface MessageResponse<T = any> {
    is_success: boolean;
    data?: T;
    error_message?: string;
}
