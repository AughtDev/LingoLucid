export type ProficiencyLevel = "a1" | "a2" | "b1" | "b2" | "c1" | "c2"

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
    code: string
    label: string
    flag_href: string
    cards: LanguageCards
    settings: LanguageSettings
    progress: LanguageProgress
}

export interface Card {
    text: string
    translation: string
    created_at_t: number
    reviews: CardReview[]
}


export interface CardReview {
    dateT: number
    review: "easy" | "medium" | "hard"
}

export interface AppConfig {
    curr_language: string | null
}
