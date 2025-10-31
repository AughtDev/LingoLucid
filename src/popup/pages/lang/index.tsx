import React from 'react';
import {getActiveTabId, setCurrentLanguageService, updateLanguageMasteryService} from "../../../utils/data/services.ts";
import useAppContext from "../../context.tsx";
import CardsView from "./CardsView.tsx";
import {HomeIcon, IconHoverEffects, SettingsIcon, TranslateIcon} from "../../../constants/icons.tsx";
import LanguageSettingsModal from "../../modals/language-settings";
import {
    MessageResponse,
    MessageType,
    PageTranslateProgressPayload,
    Port,
    PortMessage,
    TranslationPayload
} from "../../../types/comms.ts";
import Button from "../../../components/Button.tsx";
import {Language, PROFICIENCY_LEVELS, ProficiencyLevel} from "../../../types/core.ts";
import {LogsButton} from "../../modals/logs";
import ProficiencyBadge from "../../../components/ProficiencyBadge.tsx";
import {getPageLangCodeService} from "../../App.tsx";
import useTranslationModelsDownloader from "./useModelDownloader.tsx";
import ProgressLoader from "../../../components/ProgressLoader.tsx";

interface LangPageProps {
    code: string
}

export enum LangPageStatus {
    Loading,
    Untranslated,
    Translating,
    Ready,
    Error,
    DownloadError
}

function masteryToProficiencyLevel(mastery: number): ProficiencyLevel {
    const levels = ["a1", "a2", "b1", "b2", "c1", "c2"] as ProficiencyLevel[];
    const index = Math.min(Math.floor(mastery), levels.length - 1);
    return levels[index];
}

function translatePageService(lang: Language, setProgress: (progress: number) => void, onSuccess: () => void, onFailure: (error_message?: string) => void) {
    getActiveTabId().then((activeTabId) => {
        if (activeTabId === null) {
            return false;
        }

        const port = chrome.tabs.connect(activeTabId, {name: Port.PAGE_TRANSLATE});

        port.onMessage.addListener(message => {
            switch (message.type) {
                case PortMessage.PAGE_TRANSLATE_PROGRESS:
                    const payload = message.payload as PageTranslateProgressPayload;
                    console.log("service", `Translation progress: ${payload.progress}`);
                    switch (payload.status) {
                        case "in_progress":
                            setProgress(payload.progress);
                            break;
                        case "success":
                            onSuccess();
                            break;
                        case "error":
                            console.error("service", `Translation error: ${payload.error_message}`);
                            onFailure(payload.error_message);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        })

        console.log("service", `Requesting translation of page to ${lang.code}`);
        port.postMessage({
            type: MessageType.TRANSLATE_PAGE,
            payload: {
                tgt_lang_code: lang.code,
                tgt_proficiency: masteryToProficiencyLevel(lang.progress.mastery),
            } satisfies TranslationPayload
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


export default function LangPage({code}: LangPageProps) {
    const [page_status, setPageStatus] = React.useState<LangPageStatus>(LangPageStatus.Loading)

    const [page_translate_progress, setPageTranslateProgress] = React.useState<number>(0)
    const [page_translate_error_message, setPageTranslateErrorMessage] = React.useState<string | null>(null)

    const {meta: {warnings, errors}, nav: {goToPage}, modal: {openModal}, data: {languages}} = useAppContext()
    const lang = languages.get(code)

    const translator_availability = useTranslationModelsDownloader(lang, setPageStatus)

    React.useEffect(() => {
        if (!translator_availability[0] || !translator_availability[1]) {
            return;
        }

        // check if page is already translated
        updateLanguageMasteryService(code).then()
        getPageLangCodeService().then((page_code) => {
            if (page_code == code) {
                setPageStatus(LangPageStatus.Ready);
            } else {
                setPageStatus(LangPageStatus.Untranslated);
            }
        }).catch(() => {
            setPageStatus(LangPageStatus.Error);
        })
    }, [translator_availability]);
    const translatePage = React.useCallback(() => {
        // set lang as current language
        if (!lang) return;
        setPageStatus(LangPageStatus.Translating)
        translatePageService(lang,
            (progress) => {
                setPageTranslateProgress(progress);
            }, async () => {
                setPageStatus(LangPageStatus.Ready);
                setCurrentLanguageService(lang.code).then()
            }, (err) => {
                setPageStatus(LangPageStatus.Error);
                setPageTranslateErrorMessage(err || "Unknown error");
            })
    }, [lang, setPageStatus, setPageTranslateProgress, setPageTranslateErrorMessage]);

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
            {lang && <div
                title={lang.progress.mastery.toFixed(3)}
                className={"absolute top-12 left-0 p-2 flex flex-row"}>
                <ProficiencyBadge proficiency={
                    PROFICIENCY_LEVELS[Math.floor(lang.progress.mastery)]
                } size={20} variant={"solid"}/>
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

                    {page_status === LangPageStatus.Loading ? (
                            <div className={"flex flex-grow w-full items-center justify-center"}>
                                <p className={"text-gray-500 text-lg text-center"}>
                                    Loading...
                                </p>
                            </div>
                        ) :
                        page_status === LangPageStatus.Untranslated ? (
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
                            page_status === LangPageStatus.Translating ? (
                                <div className={"flex flex-col flex-grow w-full items-center justify-center"}>
                                    <p className={"text-gray-500 text-lg text-center"}>
                                        Translating page...
                                    </p>
                                    <ProgressLoader progress={page_translate_progress} width={"70%"} height={"16px"}/>
                                </div>
                            ) : page_status === LangPageStatus.Error ? (
                                <div className={"flex flex-grow w-full items-center justify-center"}>
                                    <p className={"text-gray-500 text-lg text-center"}>
                                        Error translating page. Please try again later. <br/>
                                        {page_translate_error_message}
                                    </p>
                                </div>
                            ) : page_status === LangPageStatus.DownloadError ? (
                                <div className={"flex flex-grow w-full items-center justify-center"}>
                                    <p className={"text-gray-500 text-lg text-center"}>
                                        Error downloading translation model. Please try again later.
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
