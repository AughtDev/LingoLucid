import {MessageType, UpdateProgressPayload} from "../../types/comms.ts";
import {textToEvalStats} from "../../ai/evaluate.ts";

interface TextComprehensionStats {
    engagement_time_ms: number // in ms
    text_difficulty: number // 0-5
    num_words: number
    translations: {
        text_difficulty: number // 0-5
        num_words: number
    }[]
}

let performance: Map<string, TextComprehensionStats> = new Map()

export async function instantiateTextNode(id: string, text: string, lang_code: string): Promise<boolean> {
    // get the difficulty and num words
    const eval_stats = await textToEvalStats(text, lang_code)
    if (!eval_stats) {
        console.error("Could not evaluate text for comprehension stats:", text);
        return false;
    }
    performance.set(id, {
        engagement_time_ms: 0,
        text_difficulty: eval_stats.difficulty,
        num_words: eval_stats.word_count,
        translations: []
    })
    return true;
}

export function recordTextEngagement(text_id: string, engagement_time_ms: number, lang_code: string) {
    const stats = performance.get(text_id)
    if (!stats) {
        console.error("No performance stats found for text id:", text_id);
        return;
    }
    stats.engagement_time_ms += engagement_time_ms;
    // performance.set(text_id, stats);
    updateProgressInLocalStorage(lang_code, text_id, stats)
}

export async function recordTextTranslation(text_id: string, text: string, lang_code: string): Promise<boolean> {
    const stats = performance.get(text_id)
    if (!stats) {
        console.error("No performance stats found for text id:", text_id);
        return false;
    }
    const eval_stats = await textToEvalStats(text, lang_code)
    if (!eval_stats) {
        console.error("Could not evaluate translated text for comprehension stats:", text);
        return false;
    }
    stats.translations.push({
        text_difficulty: eval_stats.difficulty,
        num_words: eval_stats.word_count
    })
    updateProgressInLocalStorage(lang_code, text_id, stats)
    return true
}

export function updateProgressInLocalStorage(lang_code: string, text_id: string, stats: TextComprehensionStats) {
    performance.set(text_id, stats);
    chrome.runtime.sendMessage({
        type: MessageType.UPDATE_PROGRESS,
        payload: {
            lang_code,
            deltas: [[text_id, statsToDelta(stats)]]
        } satisfies UpdateProgressPayload
    }).then(res => {
        if (!res.is_success) {
            console.error("Failed to update progress in local storage:", res.error_message);
        } else {
            console.log("Successfully updated progress in local storage for language:", lang_code);
        }
    })

}

/**
 * --- Tunable Constants for Proficiency Calculation ---
 * These values determine the sensitivity and scaling of the proficiency score changes.
 */

// 1. Average Reading Speed in Words Per Minute (WPM). Used to calculate expected reading time.
// This is crucial for determining how confident we are that the user actually read the text.
const AVG_WPM = 200;

// 2. Minimum Engagement Confidence Threshold (0.0 to 1.0).
// If the actual engagement time is less than 10% of the expected time, we treat it as a drive-by/skim
// and ignore the data by returning a delta of 0.
const MIN_CONFIDENCE_THRESHOLD = 0.10;

// 3. Scaling Factors (Determines the maximum size of the delta)
// These are applied to a normalized score (0-5) to produce the final small delta.
const SUCCESS_SCALE = 0.005; // Maximum positive boost for reading a C2 (5.0) level text successfully
const STRUGGLE_SCALE = 0.015; // Maximum negative impact for a struggle event

// 4. Time conversion
const MINUTE_IN_MS = 60 * 1000;

// --- Helper Functions ---

/**
 * Calculates a confidence score (0.0 to 1.0) based on actual time spent vs. expected time.
 * @param stats The comprehension statistics for the node.
 * @returns A value between 0.0 and 1.0, where 1.0 means the user spent at least the expected time.
 */
function calculateReadingConfidence(stats: TextComprehensionStats): number {
    if (stats.num_words === 0) return 0;

    // Expected time (in ms) = (Word Count / WPM) * 60,000 ms
    const expected_time_ms = (stats.num_words / AVG_WPM) * MINUTE_IN_MS;

    if (expected_time_ms === 0) return 0;

    // Confidence is the ratio of actual time to expected time, capped at 1.0
    const confidence = stats.engagement_time_ms / expected_time_ms;

    return Math.min(1.0, confidence);
}


// --- Main Delta Function ---

/**
 * Converts text comprehension statistics into a proficiency score delta (positive or negative).
 * The delta is scaled by the reading confidence and the difficulty of the text.
 *
 * @param stats The accumulated statistics for a single text node.
 * @returns A number (the delta) to be added to the user's proficiency score.
 */
function statsToDelta(stats: TextComprehensionStats): number {
    if (stats.num_words === 0) return 0;

    // 1. Calculate reading confidence
    const confidence = calculateReadingConfidence(stats);

    // If confidence is too low, treat it as irrelevant data (they scrolled past too fast).
    if (confidence < MIN_CONFIDENCE_THRESHOLD) {
        return 0.0;
    }

    let base_delta = 0.0;

    if (stats.translations.length === 0) {
        // --- SCENARIO A: SUCCESS (Positive Delta) ---
        // If no translations were made, the user successfully read the text.
        // The boost is proportional to the difficulty of the text they understood.

        // Delta = SUCCESS_SCALE * Text_Difficulty (0-5)
        base_delta = SUCCESS_SCALE * stats.text_difficulty;

    } else {
        // --- SCENARIO B: STRUGGLE (Negative Delta) ---
        // Translations occurred, indicating a struggle. The score reduction is based on:
        // 1. How much they translated (ratio).
        // 2. The difficulty of the translated words.

        // a. Calculate total translated words and their average difficulty
        const total_translated_words = stats.translations.reduce((sum, t) => sum + t.num_words, 0);
        const sum_of_difficulty_times_words = stats.translations.reduce((sum, t) => sum + (t.text_difficulty * t.num_words), 0);

        // This is the average difficulty of the words they struggled with.
        const avg_struggle_difficulty = total_translated_words > 0
            ? sum_of_difficulty_times_words / total_translated_words
            : 0;

        // b. Calculate the ratio of words translated relative to the whole text
        const struggle_ratio = Math.min(1.0, total_translated_words / stats.num_words);

        // Delta = -STRUGGLE_SCALE * Struggle_Ratio * Avg_Struggle_Difficulty (0-5)
        // Note the negative sign: this reduces the score.
        base_delta = -STRUGGLE_SCALE * struggle_ratio * avg_struggle_difficulty;
    }

    // 4. Final Delta: Apply the confidence score to the base delta.
    // Low confidence mitigates both positive (we're not sure they read it) and negative (we're not sure they struggled with it) effects.
    return base_delta * confidence;
}
