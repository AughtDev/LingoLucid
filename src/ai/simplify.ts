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


export async function simplifyTranslatedText(translation: string, specs: SimplifySpecs): Promise<string | null> {
    if (!chromeHasRewriter()) {
        console.error("Rewriter not available in this Chrome version");
        return null
    }
    console.log("Rewriter is available in this Chrome version");

    if (!await rewriterIsAvailable()) {
        console.error("Rewriter model not available");
        return null
    }

    const rewriter = await Rewriter.create({
        sharedContext: "These are meant to take translated texts and adapt them to a language learner's proficiency level.",
        expectedContextLanguages: ["en"],
        expectedInputLanguages: Object.values(INITIAL_LANGUAGES).map(lang => lang.code),
        tone: "as-is",
        format: "as-is",
        length: "as-is",
    });

    return await rewriter.rewrite(translation,{
        context: `Simplify the following text to the ${specs.level.toUpperCase()} proficiency level according to the Common European Framework of Reference for Languages (CEFR): ${translation}`
    })
}
