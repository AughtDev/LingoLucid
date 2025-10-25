import {Language} from "../../types/core.ts";
import React from "react";
import {getAppConfigService, getLanguageService, initializeService} from "../../utils/data/services.ts";
import {INITIAL_LANGUAGES} from "../../constants/languages.ts";

interface LanguagesHookReturn {
    languages: Map<string, Language>;
    loading: boolean;
}

export function useLanguages(): LanguagesHookReturn {
    const [languages, setLanguages] = React.useState<Map<string, Language>>(new Map())
    const [loading, setLoading] = React.useState<boolean>(true)

    React.useEffect(() => {
        initializeService().then(async () => {
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
                for (const key of Object.values(INITIAL_LANGUAGES).map(l => l.code)) {
                    if (changes[key]) {
                        const newData = changes[key].newValue as Language;
                        setLanguages(prev => new Map(prev).set(key, newData));
                        console.log("service", `Language ${key} updated from storage change`)
                    }
                }
            }
        }, [setLanguages]);


    React.useEffect(() => {
        const map = new Map<string, Language>();
        Promise.all(
            Object.values(INITIAL_LANGUAGES)
                .map(l => getLanguageService(l.code))
            ).then(res => {
            res.forEach(lang => {
                if (lang) {
                    map.set(lang.code, lang)
                }
            })
            console.log("initializing languages hook", map)
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


    return {languages, loading};
}
