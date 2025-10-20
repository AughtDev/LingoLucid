import {INITIAL_LANGUAGES} from "../../constants/languages.ts";
import {getLanguageFromLocalStorage, saveLanguageToLocalStorage} from "./core.ts";
import {AppConfig, Card, LanguageSettings} from "../../types/types.ts";

export async function initializeLanguagesService() {
    // for each language, check if it's there, if not, create it with default settings
    for (const lang of Object.values(INITIAL_LANGUAGES)) {
        const storedLang = await getLanguageFromLocalStorage(lang.slug)
        if (storedLang) {
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
        lang.progress.started = true
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

export async function getAppConfigService(): Promise<AppConfig> {
    const result = await chrome.storage.local.get('app_config');
    const data = result['app_config'] as AppConfig | undefined
    if (data) {
        console.log('service', 'App config retrieved from local storage:', data);
        return data;
    } else {
        console.warn('service', 'No app config found in local storage');
        return {
            curr_language: null
        }
    }
}


export async function setCurrentLanguageService(slug: string) {
    const app_config_result = await chrome.storage.local.get('app_config');
    const app_config = app_config_result['app_config'] as AppConfig | undefined || {
        curr_language: null
    }
    app_config.curr_language = slug
    await chrome.storage.local.set({'app_config': app_config});
    console.log('service', 'Current language set to', slug, 'in app config');
}


export async function clearAppDataService() {
    return chrome.storage.local.clear().then(() => {
        console.log('service', 'All app data cleared from local storage');
        return true;
    }).catch((error) => {
        console.error('service', 'Error clearing app data from local storage:', error);
        return false;
    });
}
