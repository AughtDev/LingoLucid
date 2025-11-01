export function chromeHasTranslator() {
    return 'Translator' in self
}

export async function translatorIsAvailable(src_lang_code: string, tgt_lang_code: string): Promise<boolean> {
    const ret = await Translator.availability({
        sourceLanguage: src_lang_code,
        targetLanguage: tgt_lang_code,
    })
    return ret === "available"
}

export async function downloadTranslationModel(
    src_lang_code: string,
    tgt_lang_code: string,
    onProgress: (progress: number) => void,
): Promise<boolean> {
    if (!chromeHasTranslator()) {
        console.warn("Cannot Download, Translator not available in this Chrome version");
        onProgress(1)
        return false
    }

    if (await translatorIsAvailable(src_lang_code, tgt_lang_code)) {
        onProgress(1)
        return true
    }
    return await Translator.create({
        sourceLanguage: src_lang_code,
        targetLanguage: tgt_lang_code,
        monitor(m: any) {
            m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                onProgress(e.loaded)
            });
        },
    }).then(() => {
        return true
    }).catch(err => {
        console.error("Error downloading translator model to", tgt_lang_code, ":", err);
        return false
    })

}


export async function translateToTargetLanguage(text: string, target_lang_code: string): Promise<string | null> {
    if (!chromeHasTranslator()) {
        console.error("Translator not available in this Chrome version");
        return null
    }

    if (!await translatorIsAvailable("en", target_lang_code)) {
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

    if (!await translatorIsAvailable(tgt_lang_code, "en")) {
        console.error("Translator model not available from target language:", tgt_lang_code);
        return null
    }

    const translator = await Translator.create({
        sourceLanguage: tgt_lang_code,
        targetLanguage: 'en',
    });
    return await translator.translate(translation)
}
