import {LanguageCards} from "../../types/core.ts";

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
