import React from 'react';
import {getActiveTabId, setCurrentLanguageService, updateLanguageMasteryService} from "../../../utils/data/services.ts";
import useAppContext from "../../context.tsx";
import CardsView from "./CardsView.tsx";
import {HomeIcon, IconHoverEffects, SettingsIcon, TranslateIcon} from "../../../constants/icons.tsx";
import LanguageSettingsModal from "../../modals/language-settings";
import {CheckIfTranslatedPayload, MessageResponse, MessageType, TranslationPayload} from "../../../types/comms.ts";
import Button from "../../../components/Button.tsx";
import {Language, PROFICIENCY_LEVELS, ProficiencyLevel} from "../../../types/core.ts";
import {SnippetHighlightType} from "../../../ai/highlight.ts";
import {LogsButton} from "../../modals/logs";
import ProficiencyBadge from "../../../components/ProficiencyBadge.tsx";

interface LangPageProps {
    code: string
}

enum PageStatus {
    Loading,
    Untranslated,
    Translating,
    Ready,
    Error
}

function masteryToProficiencyLevel(mastery: number): ProficiencyLevel {
    const levels = ["a1", "a2", "b1", "b2", "c1", "c2"] as ProficiencyLevel[];
    const index = Math.min(Math.floor(mastery * levels.length), levels.length - 1);
    return levels[index];
}

function translatePageService(lang: Language, onSuccess: () => void, onFailure: () => void) {
    getActiveTabId().then((activeTabId) => {
        if (activeTabId === null) {
            return false;
        }

        const highlight_map = new Map<string, SnippetHighlightType>();

        lang.cards.saved.forEach(card => {
            highlight_map.set(card.text, SnippetHighlightType.SAVED);
        })

        // for each recent card if not already in highlight_map, add it as RECENT
        lang.cards.recent.forEach(card => {
            if (!highlight_map.has(card.text)) {
                highlight_map.set(card.text, SnippetHighlightType.NEW);
            }
        })

        console.log("passing in highlight_map:", highlight_map);

        console.log("service", `Requesting translation of page to ${lang.code}`);
        return chrome.tabs.sendMessage(activeTabId, {
            type: MessageType.TRANSLATE_PAGE,
            payload: {
                tgt_lang_code: lang.code,
                tgt_proficiency: masteryToProficiencyLevel(lang.progress.mastery),
            } satisfies TranslationPayload
        }, (res: MessageResponse) => {
            if (res.is_success) {
                console.log('service', `Translation model for ${lang.code} downloaded successfully`);
                onSuccess()
            } else {
                console.error('service', `Failed to download translation model for ${lang.code}:`, res.error_message);
                onFailure()
            }
        })
    })
}


export function highlightPageService(): Promise<void> {
    return new Promise((resolve, reject) => {
        getActiveTabId().then((activeTabId) => {
            if (activeTabId === null) {
                reject('No active tab');
                return;
            }
            console.log("service", `Requesting page highlight`);
            chrome.tabs.sendMessage(activeTabId, {
                type: MessageType.HIGHLIGHT_PAGE
            }, (res: MessageResponse) => {
                if (res.is_success) {
                    console.log('service', `Page highlighted successfully`);
                    resolve();
                } else {
                    console.error('service', `Failed to highlight page:`, res.error_message);
                    reject(res.error_message);
                }
            })
        })
    })
}

async function checkIfPageTranslatedService(code: string): Promise<boolean> {
    return new Promise((resolve) => {
        getActiveTabId().then((activeTabId) => {
            if (activeTabId === null) {
                resolve(false);
                return;
            }
            console.log("service", `Checking if page is already translated`);
            chrome.tabs.sendMessage(activeTabId, {
                type: MessageType.CHECK_IF_TRANSLATED,
                payload: {
                    lang_code: code
                } satisfies CheckIfTranslatedPayload
            }, (res: MessageResponse<boolean>) => {
                if (res.is_success && res.data !== undefined) {
                    console.log('service', `Page translation status: ${res.data}`);
                    resolve(res.data);
                } else {
                    console.error('service', `Failed to check page translation status:`, res.error_message);
                    resolve(false);
                }
            })
        })
    })
}


export default function LangPage({code}: LangPageProps) {
    const [page_status, setPageStatus] = React.useState<PageStatus>(PageStatus.Loading)

    const {meta: {warnings, errors}, nav: {goToPage}, modal: {openModal}, data: {languages}} = useAppContext()
    const lang = languages.get(code)

    React.useEffect(() => {
        // check if page is already translated
        updateLanguageMasteryService(code).then()
        checkIfPageTranslatedService(code).then((is_translated) => {
            if (is_translated) {
                setPageStatus(PageStatus.Ready);
            } else {
                setPageStatus(PageStatus.Untranslated);
            }
        }).catch(() => {
            setPageStatus(PageStatus.Error);
        })
    }, []);
    const translatePage = React.useCallback(() => {
        // set lang as current language
        if (!lang) return;
        setPageStatus(PageStatus.Translating)
        translatePageService(lang, async () => {
            await setCurrentLanguageService(code).then()
            setPageStatus(PageStatus.Ready);
        }, () => {
            setPageStatus(PageStatus.Error);
        })
    }, [lang, code, setPageStatus]);

    const onClickSettings = React.useCallback(() => {
        if (!lang) return;
        openModal(<LanguageSettingsModal language={lang}/>);
    }, [lang, openModal]);

    return (
        <div className={"relative flex flex-col w-full h-full"}>
            <div className={"absolute top-0 left-0 p-2 flex flex-row justify-center items-start gap-4"}>
                <img src={"./icons/icon128.png"} alt={"LingoLucid Logo"} className={"h-10 w-10"}/>
                <div className={"pt-1"}>
                    {warnings && (
                        <LogsButton warnings={warnings} errors={errors} size={24}/>
                    )}
                </div>
            </div>
            {lang && <div className={"absolute top-10 left-0 p-2 flex flex-row"}>
                <ProficiencyBadge proficiency={
                    PROFICIENCY_LEVELS[Math.floor(lang.progress.mastery)]
                } size={24}/>
            </div>}
            <div className={"absolute left-0 top-0 p-1"}>
            </div>
            <div className={"absolute flex flex-row gap-4 items-center justify-center top-0 right-0 p-2"}>
                <Button variant={"icon"} onClick={onClickSettings} icon={SettingsIcon} size={20}/>
                <Button variant={"icon"} onClick={() => goToPage("home")} icon={HomeIcon} size={20}/>
            </div>

            {lang ? (
                <>
                    <div className={"flex flex-row items-center justify-center w-full h-12 gap-2"}>
                        <img src={lang.flag_href} alt={lang.label} className={"h-4 m-1 rounded-sm"}/>
                        <h1 className={"text-lg font-semibold"}>
                            {lang.label.toUpperCase()}
                        </h1>
                    </div>

                    {page_status === PageStatus.Untranslated ? (
                            <div className={"flex flex-grow w-full items-center justify-center"}>
                                <button onClick={translatePage}>
                                    <div className={"flex flex-col items-center justify-center"}>
                                        <IconHoverEffects icon={TranslateIcon} size={64}/>
                                        {/*<TranslateIcon size={64} color={"black"}/>*/}
                                        <p className={"text-gray-500 text-lg text-center mt-2"}>
                                            {/*Translate Page*/}
                                            Begin
                                        </p>
                                    </div>
                                </button>
                            </div>
                        ) :
                        page_status === PageStatus.Translating ? (
                            <div className={"flex flex-grow w-full items-center justify-center"}>
                                <p className={"text-gray-500 text-lg text-center"}>
                                    Translating page...
                                </p>
                            </div>
                        ) : page_status === PageStatus.Error ? (
                            <div className={"flex flex-grow w-full items-center justify-center"}>
                                <p className={"text-gray-500 text-lg text-center"}>
                                    Error translating page. Please try again later.
                                </p>
                            </div>
                        ) : (
                            <div className={"flex-grow w-full items-center"}>
                                <CardsView lang_code={code} cards={lang.cards}/>
                            </div>
                        )}
                </>
            ) : (
                <div className={"flex justify-center items-center h-full w-full"}>
                    <p>Language not found.</p>
                </div>
            )}
        </div>
    )
}
