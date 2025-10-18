declare const Translator: {
    availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<any>;
    create(options: {
        sourceLanguage: string;
        targetLanguage: string;
        monitor?: (m: any) => void;
    }): Promise<{
        translate(text: string): Promise<any>;
    }>;
};
