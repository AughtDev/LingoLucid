import {Language} from "../types/core.ts";


const createDefaultLang = (): Language => ({
    code: "",
    label: "",
    flag_href: "",
    cards: {
        saved: [],
        recent: []
    },
    settings: {
        skill_level: "a1",
        learning_pace: "medium"
    },
    progress: {
        started: false,
        delta_queue: {},
        mastery: 0
    }
})

export const INITIAL_LANGUAGES = {
    FRENCH: {
        ...createDefaultLang(),
        code: "fr",
        label: "French",
        flag_href: "https://flagcdn.com/w320/fr.png",
    },
    SPANISH: {
        ...createDefaultLang(),
        code: "es",
        label: "Spanish",
        flag_href: "https://flagcdn.com/w320/es.png",
    },
    GERMAN: {
        ...createDefaultLang(),
        code: "de",
        label: "German",
        flag_href: "https://flagcdn.com/w320/de.png",
    },
    PORTUGUESE: {
        ...createDefaultLang(),
        code: "pt",
        label: "Portuguese",
        flag_href: "https://flagcdn.com/w320/pt.png",
    },
    ITALIAN: {
        ...createDefaultLang(),
        code: "it",
        label: "Italian",
        flag_href: "https://flagcdn.com/w320/it.png",
    }
} as const satisfies { [key: string]: Language };
