import {Language} from "../../types/core.ts";
import React from "react";
import {initializeService} from "../../utils/data/services.ts";
import {INITIAL_LANGUAGES} from "../../constants/languages.ts";
// import {downloadRewriterModel} from "../../ai/simplify.ts";
import {InitLog} from "../context.tsx";


interface LanguagesHookReturn {
    init_log: InitLog;
    languages: Map<string, Language>;
    loading: boolean;
    makeLog: (type: "error" | "warning", title: string, details: string) => void;
    removeLog: (title: string) => void;
}

export function useLanguages(): LanguagesHookReturn {
    const [init_log, setInitLog] = React.useState<InitLog>({
        progress: 0, warnings: [], errors: []
    })

    const [loading, setLoading] = React.useState<boolean>(true)
    const [languages, setLanguages] = React.useState<Map<string, Language>>(new Map())

    // Listener for storage changes
    const storageChangeListener: (
        changes: { [p: string]: chrome.storage.StorageChange },
        areaName: chrome.storage.AreaName
    ) => void = React.useCallback((changes, area_name) => {
        if (area_name === 'local') {
            for (const key of Object.values(INITIAL_LANGUAGES).map(l => l.code)) {
                if (changes[key]) {
                    const newData = changes[key].newValue as Language;
                    setLanguages(prev => new Map(prev).set(key, newData));
                }
            }
        }
    }, [setLanguages]);

    // Setup function to initialize extension
    const setupExtension = React.useCallback(async () => {
        const map = new Map<string, Language>();
        await initializeService().then(res => {
            res.forEach(lang => {
                if (lang) {
                    map.set(lang.code, lang)
                }
            })
            setLanguages(map)
        })
    }, [setLanguages]);

    React.useEffect(() => {
        setupExtension().finally(() => {
            setLoading(false)
            setInitLog(prev => ({...prev, progress: 1.0}))
        })

        chrome.storage.onChanged.addListener(storageChangeListener)

        return () => {
            // Cleanup listener on unmount
            chrome.storage.onChanged.removeListener(storageChangeListener);
        };
    }, []);

    const makeLog = React.useCallback((type: "error" | "warning", title: string, details: string) => {
        if (type === "error") {
            setInitLog(prev => ({
                ...prev,
                errors: [...prev.errors, {title, details}]
            }))
        } else if (type === "warning") {
            setInitLog(prev => ({
                ...prev,
                warnings: [...prev.warnings, {title, details}]
            }))
        }
    }, [setInitLog]);

    const removeLog = React.useCallback((title: string) => {
        setInitLog(prev => ({
            ...prev,
            warnings: prev.warnings.filter(log => log.title !== title),
            errors: prev.errors.filter(log => log.title !== title),
        }))
    }, [setInitLog]);

    return {languages, init_log, loading, makeLog,removeLog};
}
