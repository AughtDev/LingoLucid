export function chromeHasTranslator() {
    return 'Translator' in self
}

export async function downloadTranslationModel(tgt_lang_code: string, onProgress: (progress: number) => void): Promise<boolean> {
    if (!chromeHasTranslator()) {
        return false
    }

    await Translator.create({
        sourceLanguage: "en", // english by default
        targetLanguage: tgt_lang_code,
        monitor(m: any) {
            m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                console.log(`Downloaded ${e.loaded * 100}%`);
                onProgress(e.loaded)
            });
        },
    });
    return true;
}


export async function translateToTargetLanguage(text: string, target_lang_code: string): Promise<string | null> {
    if (!chromeHasTranslator()) {
        return null
    }

    const translator = await Translator.create({
        sourceLanguage: 'en',
        targetLanguage: target_lang_code,
    });
    return await translator.translate(text)
}
