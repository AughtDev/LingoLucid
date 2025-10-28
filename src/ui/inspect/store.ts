import {LanguageCards} from "../../types/core.ts";
import {textToEvalStats} from "../../ai/evaluate.ts";

// region POPUP STATE
// ? ........................

export enum PopupType {
    NONE, FULL, HOVER
}

// 1. Define the shape of your state
export interface PopupState {
    type: PopupType;
    content: {
        focus_text: string;
        focus_range: Range | null;
        focus_text_node: Text | null;
    }
    actions: {
        changeFocusText: (newText: string) => void;
        onSaveCard: () => void;
    }
    position: {
        top: number;
        left: number;
    }
}

// 2. Initial state
let state: PopupState = {
    type: PopupType.NONE,
    content: {
        focus_text: '',
        focus_range: null,
        focus_text_node: null
    },
    actions: {
        changeFocusText: (_txt: string) => null,
        onSaveCard: () => null,
    },
    position: {
        top: 0,
        left: 0,
    }
};

// 3. Simple list of subscribers (for force-updating the React component)
const listeners: (() => void)[] = [];

// 4. Getter
export function getPopupState(): PopupState {
    return state;
}

// 5. Setter
export function updatePopupState(newState: Partial<PopupState>) {
    state = {...state, ...newState};
    // Notify all listeners that the state has changed
    listeners.forEach(listener => listener());
}

// 6. Subscription mechanism for the component
export function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
        // Return a function to unsubscribe
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
}

// ? ........................
// endregion ........................


// region CARDS
// ? ........................

let cached_cards: LanguageCards = {
    saved: [],
    recent: []
}

export function getCachedCards(): LanguageCards {
    console.log("fetching cached cards:", cached_cards);
    return cached_cards;
}

export function updateCachedCards(new_cards: LanguageCards) {
    console.log("updating cached cards to ", new_cards);
    cached_cards = new_cards;
}

// ? ........................
// endregion ........................


// region PERFORMANCE
// ? ........................

interface TextComprehensionStats {
    engagement_time_ms: number // in ms
    text_difficulty: number // 0-6
    num_words: number
    translations: {
        text_difficulty: number // 0-5
        num_words: number
    }[]
}

let performance: Map<string, TextComprehensionStats> = new Map()

export function instantiateTextNode(id: string, text: string, lang_code: string): boolean {
    // get the difficulty and num words
    const eval_stats = textToEvalStats(text, lang_code)
    if (!eval_stats) {
        console.error("Could not evaluate text for comprehension stats:", text);
        return false;
    }
    performance.set(id, {
        engagement_time_ms: 0,
        text_difficulty: eval_stats.difficulty,
        num_words: eval_stats.word_count,
        translations: []
    })
    return true;
}

export function recordTextEngagement(text_id: string, engagement_time_ms: number) {
    const stats = performance.get(text_id)
    if (!stats) {
        console.error("No performance stats found for text id:", text_id);
        return;
    }
    stats.engagement_time_ms += engagement_time_ms;
    performance.set(text_id, stats);
}

export function recordTextTranslation(text_id: string, text: string, lang_code: string) {
    const stats = performance.get(text_id)
    if (!stats) {
        console.error("No performance stats found for text id:", text_id);
        return;
    }
    const eval_stats = textToEvalStats(text, lang_code)
    if (!eval_stats) {
        console.error("Could not evaluate translated text for comprehension stats:", text);
        return;
    }
    stats.translations.push({
        text_difficulty: eval_stats.difficulty,
        num_words: eval_stats.word_count
    })
    performance.set(text_id, stats);
}

// ? ........................
// endregion ........................
