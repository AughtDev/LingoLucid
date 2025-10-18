import {Language} from "../../types/types.ts";

export async function getLanguageFromLocalStorage(slug: string): Promise<Language | undefined> {
    const result = await chrome.storage.local.get(slug);
    const data = result[slug] as Language | undefined;
    if (data) {
        console.log('storage', 'data', data, 'retrieved from slug', slug, 'in local storage');
        return data;
    } else {
        console.warn('storage', 'No data found for key', slug, 'in local storage');
        return undefined;
    }
}


export async function saveLanguageToLocalStorage(
    slug: string, data: Language,
    onSuccess?: () => void, onFailure?: () => void
): Promise<boolean> {
    return chrome.storage.local.set({[slug]: data}).then(() => {
        console.log('storage', 'data', data, 'saved to slug', slug, 'in local storage');
        onSuccess?.();
        return true;
    }).catch((error) => {
        console.error('storage', 'Error saving Language data to local storage:', error);
        onFailure?.();
        return false
    });
}
