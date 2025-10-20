import {Language} from "../../types/types.ts";
import React from "react";
import {getAppConfigService, getLanguageService, initializeLanguagesService} from "../../utils/data/services.ts";
import {INITIAL_LANGUAGES} from "../../constants/languages.ts";

interface LanguagesHookReturn {
    languages: Map<string, Language>;
    getLanguage: (slug: string) => Language | null;
    loading: boolean;
}

export function useLanguages(): LanguagesHookReturn {
    const [languages, setLanguages] = React.useState<Map<string, Language>>(new Map())
    const [loading, setLoading] = React.useState<boolean>(true)

    React.useEffect(() => {
        initializeLanguagesService().then(async () => {
            console.log('All Languages initialized')
            return await getAppConfigService()
        })
    }, []);

    const storageChangeListener: (
        changes: { [p: string]: chrome.storage.StorageChange },
        areaName: chrome.storage.AreaName
    ) => void =
        React.useCallback((changes, area_name) => {
            if (area_name === 'local') {
                for (const key of Object.values(INITIAL_LANGUAGES).map(l => l.slug)) {
                    if (changes[key]) {
                        const newData = changes[key].newValue as Language;
                        setLanguages(prev => new Map(prev).set(key, newData));
                    }
                }
            }
        }, [setLanguages]);


    React.useEffect(() => {
        const map = new Map<string, Language>();
        Promise.all(
            Object.values(INITIAL_LANGUAGES)
                .map(l => getLanguageService(l.slug))
            ).then(res => {
            res.forEach(lang => {
                if (lang) {
                    map.set(lang.slug, lang)
                }
            })
            setLanguages(map)
        }).finally(() => {

            setLoading(false)
        })

        chrome.storage.onChanged.addListener(storageChangeListener)

        return () => {
            // Cleanup listener on unmount
            chrome.storage.onChanged.removeListener(storageChangeListener);
        };
    }, []);

    const getLanguage = React.useCallback((slug: string): Language | null => {
        return languages.get(slug) || null;
    }, [languages]);

    return {languages, getLanguage, loading};
}
