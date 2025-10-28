import {ProficiencyLevel} from "../types/core.ts";
import freqMapES from "./word_freqs/es.json";
import freqMapFR from "./word_freqs/fr.json";
import freqMapDE from "./word_freqs/de.json";
import freqMapIT from "./word_freqs/it.json";
import freqMapPT from "./word_freqs/pt.json";


function normalizeTextToTokens(raw: string): string[] {
    if (!raw) return [];

    // 1. Lowercase and normalize:
    // Convert all text to lowercase.
    let clean = raw.toLowerCase();

    // 2. Separate Apostrophe-based Clitics (FR, IT)
    clean = clean.replace(/(\w)'(\w)/g, '$1\' $2');


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

export function textToEvalStats(text: string, lang_code: string): TextEvalStats | null {
    let freqMap: Record<string,number> | null = null;
    switch (lang_code) {
        case 'es':
            freqMap = freqMapES;
            break;
        case 'fr':
            freqMap = freqMapFR;
            break;
        case 'de':
            freqMap = freqMapDE;
            break;
        case 'it':
            freqMap = freqMapIT;
            break;
        case 'pt':
            freqMap = freqMapPT;
            break;
        default:
            console.error("No frequency map available for language code:", lang_code);
            return null;
    }

    const words = normalizeTextToTokens(text)
    if (!words || words.length === 0) {
        console.error("No words found in text for CEFR evaluation");
        return null;
    }

    let max_rank = 0;
    let valid_word_count = 0;

    for (const word of words) {
        const rank = freqMap[word];
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
        difficulty: ["a1","a2","b1","b2","c1","c2"].indexOf(getCefrFromRank(max_rank))
    };
}







