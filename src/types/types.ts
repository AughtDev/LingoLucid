export interface LanguageSettings {
    skill_level: number // 0 to 10
    learning_pace: "slow" | "medium" | "fast"
}

export interface LanguageCards {
    saved: Card[],
    recent: Card[]
}


export interface Language {
    slug: string
    label: string
    flag_href: string
    cards: LanguageCards
    settings: LanguageSettings
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
