import {Card} from "../../../types/core.ts";

// Map your options to the standard SM-2 quality (q) scale (0-5).
const QUALITY_MAP: Record<"easy" | "medium" | "hard" | "fail", number> = {
    // Standard SM-2 mapping for successful recall:
    easy: 5,     // Perfect recall, full advance
    medium: 4,   // Correct recall but with slight difficulty
    hard: 3,     // Correct recall with significant effort (or on the boundary of a fail)

    // Standard SM-2 mapping for a failed/incorrect recall:
    fail: 0,     // Failed recall (0, 1, or 2 all act as a full reset)
};

// --- Helper Functions ---

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EASINESS_FACTOR = 2.5;
const MIN_EASINESS_FACTOR = 1.3;

/**
 * Calculates the new Easiness Factor (EF) for a card based on
 * the quality of the last review.
 * @param currentEF The card's easiness factor before this review.
 * @param quality A number from 0-5 representing review quality.
 * @returns The new easiness factor (never below MIN_EASINESS_FACTOR).
 */
function getNewEasinessFactor(currentEF: number, quality: number): number {
    const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    return Math.max(MIN_EASINESS_FACTOR, newEF);
}

/**
 * Calculates the next review interval in days.
 * @param repetition The number of successful reviews (n).
 * @param lastInterval The previous interval (I(n-1)).
 * @param easinessFactor The card's current easiness factor.
 * @returns The next interval (I(n)) in days.
 */
function getNextInterval(
    repetition: number,
    lastInterval: number,
    easinessFactor: number
): number {
    if (repetition === 1) {
        return 1; // 1 day
    }
    if (repetition === 2) {
        return 6; // 6 days
    }
    // I(n) = I(n-1) * EF
    return Math.ceil(lastInterval * easinessFactor);
}

/**
 * Processes a card's entire history to find its next due date.
 * This is the core logic that handles both pass and fail states.
 * @param card The card to process.
 * @returns A Unix timestamp of when the card is next due for review.
 */
function calculateNextReviewTimestamp(card: Card): number {
    if (card.reviews.length === 0) {
        return card.created_at_t;
    }

    let easinessFactor = DEFAULT_EASINESS_FACTOR;
    let repetition = 0; // Number of *consecutive successful* repetitions
    let lastIntervalDays = 0;
    let lastReviewDate = card.created_at_t;

    const sortedReviews = [...card.reviews].sort((a, b) => a.dateT - b.dateT);

    for (const review of sortedReviews) {
        lastReviewDate = review.dateT;
        const quality = QUALITY_MAP[review.review];

        if (quality < 3) {
            // --- FAILURE LOGIC (q = 0, 1, 2) ---
            repetition = 0; // Reset consecutive successful repetitions
            lastIntervalDays = 0; // Next interval is based on the new repetition count (1 day)
            // EF is still updated to model that the word is harder than previously thought
            easinessFactor = getNewEasinessFactor(easinessFactor, quality);

        } else {
            // --- SUCCESS LOGIC (q = 3, 4, 5) ---
            repetition++;
            easinessFactor = getNewEasinessFactor(easinessFactor, quality);

            const currentIntervalDays = getNextInterval(
                repetition,
                lastIntervalDays,
                easinessFactor
            );
            lastIntervalDays = currentIntervalDays;
        }
    }

    // New cards that failed on their first review are set to be reviewed tomorrow (1 day)
    const nextIntervalDays = repetition === 0 ? 1 : lastIntervalDays;

    return lastReviewDate + (nextIntervalDays * DAY_IN_MS);
}

/**
 * Gets all cards that are due for review.
 * It calculates the next review date for each card based on its history
 * and returns a sorted list of cards due on or before "now".
 *
 * @param cards The entire list of all user cards.
 * @returns An array of Card objects due for review, sorted by due date (oldest first).
 */
export function getReviewCards(cards: Card[]): Card[] {
    const now = Date.now();

    // 1. Map each card to an object containing the card and its next due date
    const cardsWithDueDate = cards.map(card => {
        const nextReviewDate = calculateNextReviewTimestamp(card);
        return { card, nextReviewDate };
    });

    // 2. Filter for cards that are due now or in the past
    const dueCards = cardsWithDueDate.filter(item => item.nextReviewDate <= now);

    // 3. Sort by the due date (oldest first) so the user reviews the most "late" cards
    dueCards.sort((a, b) => a.nextReviewDate - b.nextReviewDate);

    // 4. Return just the Card objects
    return dueCards.map(item => item.card);
}
