import {INITIAL_LANGUAGES} from "../constants/languages.ts";
import {ProficiencyLevel} from "../types/core.ts";

export interface SimplifySpecs {
    level: ProficiencyLevel
}


export function chromeHasRewriter() {
    return 'Rewriter' in self
}

export async function rewriterIsAvailable(): Promise<boolean> {
    const status = await Rewriter.availability();
    return status == "available";
}

const SUPPORTED_LANGUAGES = ["en", "jp", "es"]

const REWRITER_OPTIONS: RewriterOptions = {
    sharedContext: "This is translated text for language learners meant to be adapted to their CEFR proficiency level. Only simplify the text without changing its meaning even if it is only a single word. Do not question it. Return the normal simplified plain text as is, no additional formatting or clarifications needed.",
    expectedContextLanguages: ["en"],
    expectedInputLanguages: Object.values(INITIAL_LANGUAGES)
        .map(lang => lang.code)
        .filter(code => SUPPORTED_LANGUAGES.includes(code)),
    tone: "as-is",
    format: "as-is",
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
                console.log(`Downloaded ${e.loaded * 100}%`);
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
    console.log("Rewriter is available in this Chrome version");

    if (!await rewriterIsAvailable()) {
        console.error("Rewriter model not available");
        return null
    }

    if (!SUPPORTED_LANGUAGES.includes(lang_code)) {
        console.error("Rewriter does not support language code:", lang_code);
        return null
    }

    const rewriter = await Rewriter.create({...REWRITER_OPTIONS, outputLanguage: lang_code});

    console.log(`attempting to simplify text ${translation} to level:`, specs.level);
    return await rewriter.rewrite(
        `
        Rewrite the following text to the ${specs.level.toUpperCase()} proficiency level according to the Common European Framework of Reference for Languages (CEFR) (A1 to C2):
         DO NOT ADD ANYTHING TO THIS TEXT. DO NOT EXPLAIN THIS TEXT. DO NOT ELABORATE ON THIS TEXT. DO NOT ADD ANY DETAILS THAT ARE NOT IN THE ORIGINAL TEXT. YOU HAVE ONLY ONE JOB, REFORMAT IT TO THE REQUESTED PROFICIENCY LEVEL. IF IT IS ALREADY AT OR BELOW THE LEVEL, RETURN IT AS IS.
        "${translation}"
        `
        , {
        context: `
        Simplify the text to the ${specs.level.toUpperCase()} proficiency level according to the Common European Framework of Reference for Languages (CEFR) (A1 to C2).
         If it is already at or below the level given, do not make it any more complex you may return it as it is.
         If you judge it as above the level given, rewrite it in simpler vocabulary or grammar such that a ${specs.level.toUpperCase()} learner can likely understand it.
         Example: 
            // english
            Original: "The quick brown fox leaps over the vagrant canine."
            Simplified (B1): "The fast brown fox jumps over the stray dog."
            Simplified (A2): "The fast brown fox jumps over the dog that has no home."
            
            // spanish
            Original: "El zorro marrón rápido salta sobre el perro vagabundo."
            Simplified (B1): "El zorro marrón rápido brinca sobre el perro callejero."
            Simplified (A2): "El zorro marrón rápido salta sobre el perro que no tiene hogar."
        `,
        outputLanguage: lang_code
    })
}
