// In global.d.ts

declare global {
    interface Window {
        ai?: {
            createTextSession: (options?: {
                topK?: number;
                temperature?: number;
            }) => Promise<AITextSession>;
            canCreateTextSession: () => Promise<"readily" | "after-download" | "no">;
        };
    }

    interface AITextSession {
        prompt: (prompt: string) => Promise<string>;
        destroy: () => void;
    }
}

// This empty export statement is crucial to treat this as a module
// and have the global declarations applied correctly.
export {};
