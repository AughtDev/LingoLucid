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

interface RewriterOptions {
    sharedContext?: string,
    expectedInputLanguages?: string[],
    expectedContextLanguages?: string[],
    outputLanguage?: string,
    tone?: string;
    format?: string;
    length?: string;
    monitor?: (m: any) => void;
}

declare const Rewriter: {
    availability(): Promise<any>;
    create(options: RewriterOptions): Promise<{
        rewrite(text: string,options?: {
            context: string;
        }): Promise<any>;
    }>;
};

declare const LanguageDetector: {
    availability(): Promise<any>;
    create(options: {
        monitor?: (m: any) => void;
    }): Promise<{
        detect(text: string): Promise<{
            detectedLanguage: string,
            confidence: number
        }[]>;
    }>;
};

