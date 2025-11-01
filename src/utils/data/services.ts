import {INITIAL_LANGUAGES} from "../../constants/languages.ts";
import {getLanguageFromLocalStorage, saveLanguageToLocalStorage} from "./core.ts";
import {
    AppConfig,
    Card,
    CardReview,
    Language,
    LanguageSettings,
    PROFICIENCY_LEVELS,
    ProficiencyLevel
} from "../../types/core.ts";

// region STORAGE
// ? ........................

const RECENT_CARDS_EXPIRY_DAYS = 7

export async function initializeService(): Promise<Language[]> {
    const langs: Language[] = []
    // for each language, check if it's there, if not, create it with default settings
    for (const lang of Object.values(INITIAL_LANGUAGES)) {
        const storedLang = await getLanguageFromLocalStorage(lang.code)
        if (!storedLang) {
            await saveLanguageToLocalStorage(lang.code, lang)
            langs.push(lang)
        } else {
            // check if any of recent cards are expired, if so, remove them and save the new language data
            const now = Date.now()
            const expiry_time = RECENT_CARDS_EXPIRY_DAYS * 24 * 60 * 60 * 1000
            const filtered_recent_cards = storedLang.cards.recent.filter(card => {
                if (card.reviews.length === 0) return true
                const last_review_date = card.reviews[card.reviews.length - 1].dateT
                return (now - last_review_date) <= expiry_time
            })
            if (filtered_recent_cards.length !== storedLang.cards.recent.length) {
                const updated_lang: Language = {
                    ...storedLang,
                    cards: {
                        ...storedLang.cards,
                        recent: filtered_recent_cards
                    }
                }
                const success = await saveLanguageToLocalStorage(lang.code, updated_lang)
                if (success) {
                    langs.push(updated_lang)
                } else {
                    langs.push(storedLang)
                }
            } else {
                langs.push(storedLang)
            }
        }
    }
    // check if app config exists, if not, create it
    await getAppConfigService()
    return langs
}

export async function getLanguageService(code: string) {
    return await getLanguageFromLocalStorage(code)
}


// region SETTINGS
// ? ........................

export async function saveLanguageSettingsService(code: string, data: Partial<LanguageSettings>) {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        return await saveLanguageToLocalStorage(code, {
            ...lang,
            progress: {
                ...lang.progress,
                started: true,
                mastery: data.skill_level ? PROFICIENCY_LEVELS.indexOf(data.skill_level) : lang.progress.mastery
            },
            settings: {
                ...lang.settings,
                ...data
            }
        })
    }
    return false
}

export async function getLanguageProficiencyLevelService(code: string): Promise<ProficiencyLevel | null> {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        return lang.settings.skill_level
    }
    return null
}

// ? ........................
// endregion ........................


// region CARDS
// ? ........................

export async function saveLanguageCardService(code: string, data: Card, type: 'saved' | 'recent') {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        // make sure that a card with the same text doesn't already exist in the specified type
        const existing_card = lang.cards[type].find(c => c.text === data.text)
        if (existing_card) {
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

export async function recordCardReviewService(code: string, cardText: string, review: CardReview["review"]) {
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

// ? ........................
// endregion ........................


export async function getAppConfigService(): Promise<AppConfig> {
    const result = await chrome.storage.local.get('app_config');
    const data = result['app_config'] as AppConfig | undefined
    if (data) {
        return data;
    } else {
        // create default app config
        const default_config: AppConfig = {
            curr_language: null
        }
        await chrome.storage.local.set({'app_config': default_config});
        return default_config
    }
}

export async function clearAppDataService() {
    return chrome.storage.local.clear().then(() => {
        return true;
    }).catch((error) => {
        console.error('service', 'Error clearing app data from local storage:', error);
        return false;
    });
}

// region LANGUAGE
// ? ........................

export async function setCurrentLanguageService(code: string) {
    const app_config_result = await chrome.storage.local.get('app_config');
    const app_config = app_config_result['app_config'] as AppConfig | undefined || {
        curr_language: null
    }
    app_config.curr_language = code
    await chrome.storage.local.set({'app_config': app_config});
}

export async function clearLanguageDataService(code: string) {
    const init_lang = Object.values(INITIAL_LANGUAGES).find(lang => lang.code === code)
    if (!init_lang) {
        console.error('service', `Language with code ${code} not found in INITIAL_LANGUAGES`);
        return false;
    }

    return await saveLanguageToLocalStorage(code, init_lang).then(() => {
        return true;
    }).catch((error) => {
        console.error('service', `Error resetting language data for ${code}:`, error);
        return false;
    });
}

// ? ........................
// endregion ........................


// region PROGRESS
// ? ........................


export async function updateLanguageProgressService(code: string, delta: number) {
    const lang = await getLanguageFromLocalStorage(code)
    if (lang) {
        const updated_progress = {...lang.progress}
        updated_progress.mastery += delta * learningPaceToMultiplier(lang.settings.learning_pace)
        updated_progress.mastery = Math.min(Math.max(updated_progress.mastery, 0), 5)
        return await saveLanguageToLocalStorage(code, {
            ...lang,
            progress: updated_progress
        })
    }
    return false
}

// const MASTERY_UPDATE_DELAY = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

function learningPaceToMultiplier(learning_pace: LanguageSettings["learning_pace"]): number {
    switch (learning_pace) {
        case 'slow':
            return 0.08
        case 'medium':
            return 0.10
        case 'fast':
            return 0.12
        default:
            return 0.1
    }
}
// export async function updateLanguageMasteryService(code: string) {
//     // use any deltas in the queue saved more than 2 hours ago to update mastery then delete them
//     const lang = await getLanguageFromLocalStorage(code)
//     if (lang) {
//         const updated_progress = {...lang.progress}
//         const now = Date.now()
//         let total_delta = 0
//         for (const [text_id, entry] of Object.entries(updated_progress.delta_queue)) {
//             if ((now - entry.datetime_t) >= MASTERY_UPDATE_DELAY) {
//                 total_delta += entry.delta
//                 delete updated_progress.delta_queue[text_id]
//             }
//         }
//         if (Math.abs(total_delta) > 0) {
//             updated_progress.mastery += total_delta * learningPaceToMultiplier(lang.settings.learning_pace)
//             updated_progress.mastery = Math.min(Math.max(updated_progress.mastery, 0), 5)
//             console.log("service", `Language ${code} mastery updated by ${total_delta} to ${updated_progress.mastery}`)
//             return await saveLanguageToLocalStorage(code, {
//                 ...lang,
//                 progress: updated_progress
//             })
//         } else {
//             console.log("service", `No mastery update needed for language ${code}`)
//             return true;
//         }
//     }
//     return false
// }

// ? ........................
// endregion ........................


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
    return tabs[0].id;
}


// ? ........................
// endregion ........................



