import {LanguageCards} from "../types/core.ts";

export interface SnippetHighlight {
    color: string; // e.g. '#FF0000'
    opacity: number; // e.g. 0.5
    thickness: number; // e.g. 2 (in pixels)
}

export enum SnippetHighlightType {
    SAVED = "saved", NEW = "new"
}

export function highlightTypeToStyle(type: SnippetHighlightType): SnippetHighlight {
    switch (type) {
        case SnippetHighlightType.SAVED:
            return {
                color: '#00FF00', // Green
                opacity: 0.3,
                thickness: 2
            };
        case SnippetHighlightType.NEW:
            return {
                color: '#FFFF00', // Yellow
                opacity: 0.3,
                thickness: 2
            };
        default:
            return {
                color: '#0000FF', // Blue as default
                opacity: 0.3,
                thickness: 2
            };
    }
}


export function cardsToHighlightMap(cards: LanguageCards): Map<string, SnippetHighlightType> {
    const map = new Map<string, SnippetHighlightType>();

    cards.saved.forEach(card => {
        map.set(card.text, SnippetHighlightType.SAVED);
    })

    // cards.recent.forEach(card => {
    //     map.set(card.text, SnippetHighlightType.NEW);
    // })

    return map;
}
