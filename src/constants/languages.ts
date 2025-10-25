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
        skill_level: 0,
        learning_pace: "medium"
    },
    progress: {
        started: false,
        mastery: 0
    }
})

export const INITIAL_LANGUAGES = {
    FRENCH: {
        ...createDefaultLang(),
        code: "fr",
        label: "French",
        flag_href: "https://flagcdn.com/w320/fr.png",
        cards: {
            recent: [
                {text: "Bonjour", translation: "Hello", reviews: [], created_at_t: Date.now()},
                {text: "Merci", translation: "Thank you", reviews: [], created_at_t: Date.now()},
                {text: "Au revoir", translation: "Goodbye", reviews: [], created_at_t: Date.now()},
                {text: "S'il vous plaît", translation: "Please", reviews: [], created_at_t: Date.now()},
                {text: "Excusez-moi", translation: "Excuse me", reviews: [], created_at_t: Date.now()},
                {text: "Comment ça va?", translation: "How are you?", reviews: [], created_at_t: Date.now()},
                {text: "Je ne comprends pas", translation: "I don't understand", reviews: [], created_at_t: Date.now()},
                {
                    text: "Parlez-vous anglais?",
                    translation: "Do you speak English?",
                    reviews: [],
                    created_at_t: Date.now()
                },
                {
                    text: "Où est la gare?",
                    translation: "Where is the train station?",
                    reviews: [],
                    created_at_t: Date.now()
                },
                {
                    text: "Combien ça coûte?",
                    translation: "How much does it cost?",
                    reviews: [],
                    created_at_t: Date.now()
                }
            ],
            saved: [
                {text: "Oui", translation: "Yes", reviews: [],created_at_t: Date.now()},
                {text: "Non", translation: "No", reviews: [],created_at_t: Date.now()},
                {text: "Peut-être", translation: "Maybe", reviews: [],created_at_t: Date.now()},
                {text: "Je t'aime", translation: "I love you", reviews: [],created_at_t: Date.now()},
                {text: "Bonne nuit", translation: "Good night", reviews: [],created_at_t: Date.now()},
                {text: "Bon appétit", translation: "Enjoy your meal", reviews: [],created_at_t: Date.now()},
                {text: "Je suis désolé", translation: "I'm sorry", reviews: [],created_at_t: Date.now()},
                {text: "À bientôt", translation: "See you soon", reviews: [],created_at_t: Date.now()},
                {text: "Bienvenue", translation: "Welcome", reviews: [],created_at_t: Date.now()},
                {text: "Félicitations", translation: "Congratulations", reviews: [],created_at_t: Date.now()}
            ]
        }
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
