export type ProficiencyLevel = "a1" | "a2" | "b1" | "b2" | "c1" | "c2"

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = ["a1", "a2", "b1", "b2", "c1", "c2"];

export interface LanguageSettings {
    skill_level: ProficiencyLevel // 0 to 10
    learning_pace: "slow" | "medium" | "fast"
}

export interface LanguageCards {
    saved: Card[],
    recent: Card[]
}

export interface LanguageProgress {
    started: boolean
    mastery: number // 0-5: 0 is a1, 5 is c2
    delta_queue: Record<string, {
        datetime_t: number,
        delta: number
    }>
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
    difficulty: ProficiencyLevel
    created_at_t: number
    reviews: CardReview[]
}


export interface CardReview {
    dateT: number
    review: "easy" | "medium" | "hard" | "fail"
}

export interface AppConfig {
    curr_language: string | null
}
