export interface LanguageSettings {
    skill_level: number // 0 to 10
    learning_pace: "slow" | "medium" | "fast"
}

export interface LanguageCards {
    saved: Card[],
    recent: Card[]
}

export interface LanguageProgress {
    started: boolean
    mastery: number // 0 - 1
}


export interface Language {
    slug: string
    label: string
    flag_href: string
    cards: LanguageCards
    settings: LanguageSettings
    progress: LanguageProgress
}

export interface Card {
    text: string
    translation: string
    reviews: CardReview[]
}


export interface CardReview {
    dateT: number
    review: "easy" | "medium" | "hard"
}

export interface AppConfig {
    curr_language: string | null
}
