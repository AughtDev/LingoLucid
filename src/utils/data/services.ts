import {INITIAL_LANGUAGES} from "../../constants/languages.ts";
import {getLanguageFromLocalStorage, saveLanguageToLocalStorage} from "./core.ts";
import {Card, LanguageSettings} from "../../types/types.ts";

export async function initializeLanguagesService() {
    // for each language, check if it's there, if not, create it with default settings
    for (const lang of Object.values(INITIAL_LANGUAGES)) {
        // const storedLang = await getLanguageFromLocalStorage(lang.slug)
        if (true) {
            await saveLanguageToLocalStorage(lang.slug, lang)
            console.log("service", `Language ${lang.label} initialized`)
        } else {
            console.log("service", `Language ${lang.label} already initialized`)
        }
    }
}

export async function getLanguageService(slug: string) {
    return await getLanguageFromLocalStorage(slug)
}


export async function saveLanguageSettingsService(slug: string, data: LanguageSettings) {
    const lang = await getLanguageFromLocalStorage(slug)
    if (lang) {
        lang.settings = data
        return await saveLanguageToLocalStorage(slug, lang)
    }
    return false
}


export async function saveLanguageCardService(slug: string, data: Card, type: 'saved' | 'recent') {
    const lang = await getLanguageFromLocalStorage(slug)
    if (lang) {
        lang.cards[type].push(data)
        return await saveLanguageToLocalStorage(slug, lang)
    }
    return false
}

export async function recordCardReviewService(slug: string, cardText: string, review: "easy" | "medium" | "hard") {
    const lang = await getLanguageFromLocalStorage(slug)
    if (lang) {
        for (const type of ['saved', 'recent'] as ('saved' | 'recent')[]) {
            const card = lang.cards[type].find(c => c.text === cardText)
            if (card) {
                const now = Date.now()
                card.reviews.push({dateT: now, review})
                return await saveLanguageToLocalStorage(slug, lang)
            }
        }
    }
    return false
}
