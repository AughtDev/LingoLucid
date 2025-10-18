import {Language} from "../../types/types.ts";
import React from "react";
import {getLanguageService} from "../../utils/data/services.ts";

interface LanguageHookReturn {
    lang: Language | null;
    loading: boolean;
}

export function useLanguage(slug: string): LanguageHookReturn {
    const [lang, setLang] = React.useState<Language | null>(null)
    const [loading, setLoading] = React.useState<boolean>(true)


    const storageChangeListener: (
        changes: { [p: string]: chrome.storage.StorageChange },
        areaName: chrome.storage.AreaName
    ) => void =
        React.useCallback((changes, area_name) => {
            if (area_name === 'local' && changes[slug]) {
                const newData = changes[slug].newValue as Language;
                setLang(newData);
            }
        }, [slug, setLang]);

    React.useEffect(() => {
        getLanguageService(slug).then((res) => {
            if (res) {
                setLang(res)
            }
        }).finally(() => {
            setLoading(false)
        })

        chrome.storage.onChanged.addListener(storageChangeListener)

        return () => {
            // Cleanup listener on unmount
            chrome.storage.onChanged.removeListener(storageChangeListener);
        };
    }, [slug]);

    return {lang, loading};
}
