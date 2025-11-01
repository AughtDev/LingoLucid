export function chromeHasLanguageDetector(): boolean {
    return 'LanguageDetector' in self
}

export async function languageDetectorIsAvailable(): Promise<boolean> {
    const status = await LanguageDetector.availability();
    return status == "available";
}
export async function downloadLanguageDetectorModel(onProgress: (progress: number) => void): Promise<boolean> {
    if (!chromeHasLanguageDetector()) {
        console.warn("Cannot Download, Language Detector not available in this Chrome version");
        onProgress(1)
        return false
    }
    if (await languageDetectorIsAvailable()) {
        onProgress(1)
        return true
    }

    let success = true;

    await LanguageDetector.create({
        monitor(m: any) {
            m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                onProgress(e.loaded)
            });
        },
    }).catch(err => {
        console.error("Error downloading Language Detector model:", err);
        success = false;
    });

    return success;
}


export async function detectLanguage(text: string): Promise<string | null> {
    if (!chromeHasLanguageDetector()) {
        console.error("Language Detector not available in this Chrome version");
        return null
    }

    if (!await languageDetectorIsAvailable()) {
        console.error("Language Detector model not available");
        return null
    }
    const detector = await LanguageDetector.create({});
    const result = await detector.detect(text);
    return result[0]?.detectedLanguage;
}
