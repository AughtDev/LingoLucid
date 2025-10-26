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

declare const Rewriter: {
    availability(): Promise<any>;
    create(options: {
        sharedContext?: string,
        expectedInputLanguages?: string[],
        expectedContextLanguages?: string[],
        tone?: string;
        format?: string;
        length?: string;
        monitor?: (m: any) => void;
    }): Promise<{
        rewrite(text: string,options?: {
            context: string;
        }): Promise<any>;
    }>;
};
