export function chromeHasTranslator() {
    return 'Translator' in self
}

export async function translatorIsAvailable(tgt_lang_code: string): Promise<boolean> {
    const to = await Translator.availability({
        sourceLanguage: "en",
        targetLanguage: tgt_lang_code,
    }) == "available"
    const from = await Translator.availability({
        sourceLanguage: tgt_lang_code,
        targetLanguage: "en",
    }) == "available"
    return to && from
}

export async function downloadTranslationModel(tgt_lang_code: string, onProgress: (progress: number) => void): Promise<boolean> {
    if (!chromeHasTranslator()) {
        console.warn("Cannot Download, Translator not available in this Chrome version");
        onProgress(1)
        return false
    }

    if (await translatorIsAvailable(tgt_lang_code)) {
        console.log("Cannot download, Translator models already available for", tgt_lang_code);
        onProgress(1)
        return true
    }

    let success = true;

    await Translator.create({
        sourceLanguage: "en", // english by default
        targetLanguage: tgt_lang_code,
        monitor(m: any) {
            m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                console.log(`Downloaded ${e.loaded * 100}%`);
                onProgress(e.loaded * 0.5)
            });
        },
    }).catch(err => {
        console.error("Error downloading translator model to", tgt_lang_code, ":", err);
        success = false;
    });

    await Translator.create({
        sourceLanguage: tgt_lang_code,
        targetLanguage: "en",
        monitor(m: any) {
            m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                console.log(`Downloaded ${e.loaded * 100}%`);
                onProgress(e.loaded * 0.5 + 0.5)
            });
        },
    }).catch(err => {
        console.error("Error downloading translator model from", tgt_lang_code, ":", err);
        success = false;
    });

    return success;
}


export async function translateToTargetLanguage(text: string, target_lang_code: string): Promise<string | null> {
    if (!chromeHasTranslator()) {
        console.error("Translator not available in this Chrome version");
        return null
    }

    if (!await translatorIsAvailable(target_lang_code)) {
        console.error("Translator model not available to target language:", target_lang_code);
        return null
    }

    const translator = await Translator.create({
        sourceLanguage: 'en',
        targetLanguage: target_lang_code,
    });
    return await translator.translate(text)
}

export async function translateFromTargetLanguage(translation: string, tgt_lang_code: string): Promise<string | null> {
    if (!chromeHasTranslator()) {
        console.error("Translator not available in this Chrome version");
        return null
    }

    if (!await translatorIsAvailable(tgt_lang_code)) {
        console.error("Translator model not available from target language:", tgt_lang_code);
        return null
    }

    const translator = await Translator.create({
        sourceLanguage: tgt_lang_code,
        targetLanguage: 'en',
    });
    return await translator.translate(translation)
}
