import {Language} from "../types/types.ts";


const createDefaultLang = (): Language => ({
    slug: "",
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
        slug: "french",
        label: "French",
        flag_href: "https://flagcdn.com/w320/fr.png",
        cards: {
            recent: [
                { text: "Bonjour", translation: "Hello", reviews: [] },
                { text: "Merci", translation: "Thank you", reviews: [] },
                { text: "Au revoir", translation: "Goodbye", reviews: [] },
                { text: "S'il vous plaît", translation: "Please", reviews: [] },
                { text: "Excusez-moi", translation: "Excuse me", reviews: [] },
                { text: "Comment ça va?", translation: "How are you?", reviews: [] },
                { text: "Je ne comprends pas", translation: "I don't understand", reviews: [] },
                { text: "Parlez-vous anglais?", translation: "Do you speak English?", reviews: [] },
                { text: "Où est la gare?", translation: "Where is the train station?", reviews: [] },
                { text: "Combien ça coûte?", translation: "How much does it cost?", reviews: [] }
            ],
            saved: [
                { text: "Oui", translation: "Yes", reviews: [] },
                { text: "Non", translation: "No", reviews: [] },
                { text: "Peut-être", translation: "Maybe", reviews: [] },
                { text: "Je t'aime", translation: "I love you", reviews: [] },
                { text: "Bonne nuit", translation: "Good night", reviews: [] },
                { text: "Bon appétit", translation: "Enjoy your meal", reviews: [] },
                { text: "Je suis désolé", translation: "I'm sorry", reviews: [] },
                { text: "À bientôt", translation: "See you soon", reviews: [] },
                { text: "Bienvenue", translation: "Welcome", reviews: [] },
                { text: "Félicitations", translation: "Congratulations", reviews: [] }
            ]
        }
    },
    SPANISH: {
        ...createDefaultLang(),
        slug: "spanish",
        label: "Spanish",
        flag_href: "https://flagcdn.com/w320/es.png",
    },
    GERMAN: {
        ...createDefaultLang(),
        slug: "german",
        label: "German",
        flag_href: "https://flagcdn.com/w320/de.png",
    },
    PORTUGUESE: {
        ...createDefaultLang(),
        slug: "portuguese",
        label: "Portuguese",
        flag_href: "https://flagcdn.com/w320/pt.png",
    },
    ITALIAN: {
        ...createDefaultLang(),
        slug: "italian",
        label: "Italian",
        flag_href: "https://flagcdn.com/w320/it.png",
    }
} as const satisfies { [key: string]: Language };
