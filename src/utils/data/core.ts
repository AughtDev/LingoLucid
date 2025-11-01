import {Language} from "../../types/core.ts";

export async function getLanguageFromLocalStorage(code: string): Promise<Language | undefined> {
    const result = await chrome.storage.local.get(code);
    const data = result[code] as Language | undefined;
    if (data) {
        return data;
    } else {
        console.warn('storage', 'No data found for key', code, 'in local storage');
        return undefined;
    }
}


export async function saveLanguageToLocalStorage(
    code: string, data: Language,
    onSuccess?: () => void, onFailure?: () => void
): Promise<boolean> {
    return chrome.storage.local.set({[code]: data}).then(() => {
        onSuccess?.();
        return true;
    }).catch((error) => {
        console.error('storage', 'Error saving Language data to local storage:', error);
        onFailure?.();
        return false
    });
}
