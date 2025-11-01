import {LanguageCards} from "../../types/core.ts";

let cached_cards: LanguageCards = {
    saved: [],
    recent: []
}

export function getCachedCards(): LanguageCards {
    return cached_cards;
}

export function updateCachedCards(new_cards: LanguageCards) {
    cached_cards = new_cards;
}
