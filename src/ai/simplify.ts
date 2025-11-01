import {INITIAL_LANGUAGES} from "../constants/languages.ts";
import {ProficiencyLevel} from "../types/core.ts";

export interface SimplifySpecs {
    level: ProficiencyLevel
}

const SUPPORTED_LANGUAGES = ["en", "jp", "es"]

export function chromeHasRewriter() {
    return 'Rewriter' in self
}

export async function rewriterIsAvailable(): Promise<boolean> {
    const status = await Rewriter.availability();
    return status == "available";
}

export function rewriterSupportsLanguage(lang_code: string): boolean {
    return SUPPORTED_LANGUAGES.includes(lang_code);
}


const REWRITER_OPTIONS: RewriterOptions = {
    sharedContext: `
        You are a strict, rule-based text simplification engine.
        Your only function is to rewrite text to a target CEFR level.
        You MUST NOT add conversational text, explanations, or labels (like 'Input:', 'Output:').
        Your output must ONLY be the rewritten text.
        This context applies to all rewrite requests.
    `,
    expectedContextLanguages: ["en"],
    expectedInputLanguages: Object.values(INITIAL_LANGUAGES)
        .map(lang => lang.code)
        .filter(code => SUPPORTED_LANGUAGES.includes(code)),
    tone: "as-is",
    format: "plain-text",
    length: "as-is",
}

export async function downloadRewriterModel(onProgress: (progress: number) => void): Promise<boolean> {
    if (!('Rewriter' in self)) {
        console.warn("Cannot download, Rewriter not available in this Chrome version");
        onProgress(1)
        return false
    }

    if (await rewriterIsAvailable()) {
        console.log("Cannot redownload, Rewriter model already available");
        onProgress(1)
        return true
    }

    let success = true;

    await Rewriter.create({
        ...REWRITER_OPTIONS,
        monitor(m: any) {
            m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                onProgress(e.loaded)
            });
        },
    }).catch(err => {
        console.error("Error downloading Rewriter model:", err);
        success = false;
    });

    return success;
}


export async function simplifyTranslatedText(lang_code: string, translation: string, specs: SimplifySpecs): Promise<string | null> {
    if (!chromeHasRewriter()) {
        console.error("Rewriter not available in this Chrome version");
        return null
    }

    if (!await rewriterIsAvailable()) {
        console.error("Rewriter model not available");
        return null
    }

    if (!SUPPORTED_LANGUAGES.includes(lang_code)) {
        console.error("Rewriter does not support language code:", lang_code);
        return null
    }

    const rewriter = await Rewriter.create({...REWRITER_OPTIONS, outputLanguage: lang_code});

    // const prompt = `
    //     ### REWRITE INSTRUCTION ###
    //
    //     GOAL: Rewrite the TARGET TEXT below to exactly match the ${specs.level.toUpperCase()} proficiency level according to the Common European Framework of Reference for Languages (CEFR) (A1 to C2).
    //
    //     RULES:
    //     1. **OUTPUT ONLY THE REWRITTEN TEXT.** Do not include any headers, labels, explanations, elaborations, definitions, or introductions (e.g., do not output 'Input:', 'Output:', or 'Simplified Text:').
    //     2. If the text is already at or below the requested level, return the TARGET TEXT exactly as it is.
    //     3. Maintain the meaning and original punctuation of the TARGET TEXT.
    //
    //     TARGET TEXT: "${translation}"
    // `;

    const prompt = `
    ### TASK ###
    Rewrite the text inside "### TARGET TEXT ###" to match the ${specs.level.toUpperCase()} proficiency level (CEFR).

    ### RULES ###
    1. **MOST IMPORTANT: YOUR ONLY JOB IS TO REWRITE. DO NOT ADD, EXPLAIN, OR ELABORATE.**
    2. **DO NOT** output any text before or after the rewritten text (e.g., no 'Input:', 'Output:', 'Simplified:').
    3. **If the text is a single word, a proper noun (like a name), or cannot be simplified (like 'Virgil'), RETURN THE TEXT AS-IS.**
    4. If the text is already at or below the target level, RETURN THE TEXT AS-IS.
    5. Maintain the original meaning, capitalization and punctuation.

    ### EXAMPLES OF TASK ###

    // Example 1: Complex Sentence (Spanish)
    Input: "El zorro marrón rápido salta sobre el perro vagabundo."
    Output (B1): "El zorro marrón rápido brinca sobre el perro callejero."

    // Example 2: Single Word Simplification (Spanish)
    Input: "Automóvil"
    Output (A2): "Coche"

    // Example 3: Proper Noun 
    Input: "Virgil"
    Output: "Virgil"

    // Example 4: Already Simple
    Input: "El perro es grande."
    Output (B2): "El perro es grande."

    ### TASK EXECUTION ###
    TARGET TEXT: "${translation}"
    `;

    // const context = `
    //     You are a language simplification engine for the CEFR framework. Your only function is to rewrite text to a specified proficiency level.
    // `;



    // Pass the combined prompt and context to the API
    return await rewriter.rewrite(prompt, {
        // context: context,
        outputLanguage: lang_code
    });
}
