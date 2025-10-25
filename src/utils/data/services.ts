import {INITIAL_LANGUAGES} from "../../constants/languages.ts";
import {getLanguageFromLocalStorage, saveLanguageToLocalStorage} from "./core.ts";
import {AppConfig, Card, LanguageSettings} from "../../types/core.ts";

// region STORAGE
// ? ........................

export async function initializeService() {
    // for each language, check if it's there, if not, create it with default settings
    for (const lang of Object.values(INITIAL_LANGUAGES)) {
        const storedLang = await getLanguageFromLocalStorage(lang.code)
        if (!storedLang) {
            await saveLanguageToLocalStorage(lang.code, lang)
            console.log("service", `Language ${lang.label} initialized`)
        } else {
            console.log("service", `Language ${lang.label} already initialized`)
        }
    }
    // check if app config exists, if not, create it
    await getAppConfigService()
}

export async function getLanguageService(code: string) {
    return await getLanguageFromLocalStorage(code)
}


export async function saveLanguageSettingsService(code: string, data: LanguageSettings) {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        return await saveLanguageToLocalStorage(code, {
            ...lang,
            settings: {
                ...lang.settings,
                ...data
            }
        })
    }
    return false
}


export async function saveLanguageCardService(code: string, data: Card, type: 'saved' | 'recent') {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        // make sure that a card with the same text doesn't already exist in the specified type
        const existing_card = lang.cards[type].find(c => c.text === data.text)
        if (existing_card) {
            console.log("service", `Card with text "${data.text}" already exists in ${type} cards for language ${code}`)
            return false
        }
        return await saveLanguageToLocalStorage(code, {
            ...lang,
            cards: {
                ...lang.cards,
                [type]: [...lang.cards[type], data]
            }
        })
    }
    return false
}

export async function recordCardReviewService(code: string, cardText: string, review: "easy" | "medium" | "hard") {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        for (const type of ['saved', 'recent'] as ('saved' | 'recent')[]) {
            const card = lang.cards[type].find(c => c.text === cardText)
            if (card) {
                const now = Date.now()
                // card.reviews.push({dateT: now, review})
                return await saveLanguageToLocalStorage(code, {
                    ...lang,
                    cards: {
                        ...lang.cards,
                        [type]: lang.cards[type].map(c => c.text === cardText ? {
                            ...c,
                            reviews: [...c.reviews, {dateT: now, review}]
                        } : c)
                    }
                })
            }
        }
    }
    return false
}

export async function deleteLanguageCardService(code: string, cardText: string, type: 'saved' | 'recent') {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        // lang.cards[type] = lang.cards[type].filter(c => c.text !== cardText)
        return await saveLanguageToLocalStorage(code, {
            ...lang,
            cards: {
                ...lang.cards,
                [type]: lang.cards[type].filter(c => c.text !== cardText)
            }
        })
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
        // create default app config
        const default_config: AppConfig = {
            curr_language: null
        }
        await chrome.storage.local.set({'app_config': default_config});
        console.log('service', 'Default app config created in local storage:', default_config);
        return default_config
    }
}

export async function setCurrentLanguageService(code: string) {
    const app_config_result = await chrome.storage.local.get('app_config');
    const app_config = app_config_result['app_config'] as AppConfig | undefined || {
        curr_language: null
    }
    app_config.curr_language = code
    await chrome.storage.local.set({'app_config': app_config});
    console.log('service', 'Current language set to', code, 'in app config');
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

// ? ........................
// endregion ........................

// region CONTENT
// ? ........................

export async function getActiveTabId(): Promise<number | null> {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    if (tabs.length === 0 || !tabs[0].id) {
        console.error('service', 'No active tab found');
        return null;
    }
    console.log('service', 'Active tab ID:', tabs[0].id);
    return tabs[0].id;
}



// ? ........................
// endregion ........................



