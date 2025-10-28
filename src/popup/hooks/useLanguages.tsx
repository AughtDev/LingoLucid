import {Language} from "../../types/core.ts";
import React from "react";
import {initializeService} from "../../utils/data/services.ts";
import {INITIAL_LANGUAGES} from "../../constants/languages.ts";
import {downloadRewriterModel} from "../../ai/simplify.ts";
import {InitLog} from "../context.tsx";


interface LanguagesHookReturn {
    init_log: InitLog;
    languages: Map<string, Language>;
    loading: boolean;
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
                    console.log("service", `Language ${key} updated from storage change`)
                }
            }
        }
    }, [setLanguages]);

    // Setup function to initialize extension
    const setupExtension = React.useCallback(async () => {
        await downloadRewriterModel((progress) => {
            setInitLog(prev => ({...prev, progress: progress * 0.9}))
        }).then(res => {
            if (!res) {
                setInitLog(prev => ({
                    ...prev,
                    progress: 0.9,
                    warnings: [...prev.warnings, {
                        title: "Rewriter model could not be downloaded.",
                        details: "The text will not be able to be simplified based on your proficiency level but if the translation models are available," +
                            "you may still translate text, save cards and review them."
                    }]
                }))
            } else {
                console.log("Rewriter model downloaded successfully.")
                setInitLog(prev => ({
                    ...prev,
                }))
            }
        }).catch(err => {
            console.error("Error downloading Rewriter model:", err);
            setInitLog(prev => ({
                ...prev,
                progress: 0.9,
                warnings: [...prev.warnings, {
                    title: `Error downloading Rewriter model: ${err.message}`,
                    details: "The text will not be able to be simplified based on your proficiency level but if the translation models are available," +
                        "you may still translate text, save cards and review them."
                }]
            }))
        })

        const map = new Map<string, Language>();
        await initializeService().then(res => {
            res.forEach(lang => {
                if (lang) {
                    map.set(lang.code, lang)
                }
            })
            console.log("initializing languages hook", map)
            setLanguages(map)
        })
    }, [setInitLog, setLanguages]);

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


    return {languages, init_log: init_log, loading};
}
