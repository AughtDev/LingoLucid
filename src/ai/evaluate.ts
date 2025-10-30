import {PROFICIENCY_LEVELS, ProficiencyLevel} from "../types/core.ts";

const FREQ_MAP_CACHE: Map<string,Record<string,number>> = new Map();

async function getFrequencyMap(lang_code: string): Promise<Record<string,number> | null> {
    if (FREQ_MAP_CACHE.has(lang_code)) {
        return FREQ_MAP_CACHE.get(lang_code)!;
    }
    const url = chrome.runtime.getURL(`word_freqs/${lang_code}.json`)
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Failed to fetch frequency map for language code:", lang_code);
            return null;
        }
        const freqMap: Record<string,number> = await response.json();
        FREQ_MAP_CACHE.set(lang_code, freqMap);
        return freqMap;
    } catch (error) {
        console.error("Error fetching frequency map for language code:", lang_code, error);
        return null;
    }
}

function normalizeTextToTokens(raw: string): string[] {
    if (!raw) return [];

    // 1. Lowercase and normalize:
    // Convert all text to lowercase.
    let clean = raw.toLowerCase();

    // 2. Separate Apostrophe-based Clitics (FR, IT)
    clean = clean.replace(/(\p{L})'(\p{L})/gu, '$1\' $2');


    // 3. Remove general punctuation, but KEEP hyphens (-) as they are now single tokens.
    clean = clean.replace(/[.,?!:;“”"(){}[\]\n\r]/g, ' ');

    // 4. Split by whitespace to get final tokens
    return clean.split(/\s+/).filter(t => t.length > 0);
}

function getCefrFromRank(rank: number): ProficiencyLevel {
    if (rank <= 1000) return "a1";
    if (rank <= 2000) return "a2";
    if (rank <= 4000) return "b1";
    if (rank <= 8000) return "b2";
    if (rank <= 15000) return "c1";
    return "c2"; // Anything higher than list boundary
}

export interface TextEvalStats {
    max_rank: number;
    word_count: number;
    cefr_level: ProficiencyLevel;
    difficulty: number;
}

export async function textToEvalStats(text: string, lang_code: string): Promise<TextEvalStats | null> {
    const freq_map = await getFrequencyMap(lang_code);

    if (!freq_map) {
        console.error("Frequency map not found for language code:", lang_code);
        return null;
    }

    const words = normalizeTextToTokens(text)
    if (!words || words.length === 0) {
        console.error("No words found in text for CEFR evaluation");
        return null;
    }
    console.log(`tokens of text: ${text} are `, words);

    let max_rank = 0;
    let valid_word_count = 0;

    for (const word of words) {
        const rank = freq_map[word];
        if (rank) {
            valid_word_count++;
            if (rank > max_rank) {
                max_rank = rank;
            }
        }
    }
    if (valid_word_count === 0) {
        console.error("No valid words found in frequency map for CEFR evaluation");
        return null;
    }

    return {
        max_rank: max_rank,
        word_count: words.length,
        cefr_level: getCefrFromRank(max_rank),
        difficulty: PROFICIENCY_LEVELS.indexOf(getCefrFromRank(max_rank))
    };
}







