import React from 'react';
import {getActiveTabId, setCurrentLanguageService} from "../../../utils/data/services.ts";
import useAppContext from "../../context.tsx";
import CardsView from "./CardsView.tsx";
import {HomeIcon, SettingsIcon, TranslateIcon} from "../../../constants/icons.tsx";
import LanguageSettingsModal from "../../modals/language-settings";
import {MessageResponse, MessageType, TranslationPayload} from "../../../types/comms.ts";

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

function translatePageService(lang_code: string, onSuccess: () => void, onFailure: () => void) {
    getActiveTabId().then((activeTabId) => {
        if (activeTabId === null) {
            return false;
        }
        console.log("service", `Requesting translation of page to ${lang_code}`);
        return chrome.tabs.sendMessage(activeTabId, {
            type: MessageType.TRANSLATE_PAGE,
            payload: {
                tgt_lang_code: lang_code
            } satisfies TranslationPayload
        }, (res: MessageResponse) => {
            if (res.is_success) {
                console.log('service', `Translation model for ${lang_code} downloaded successfully`);
                onSuccess()
            } else {
                console.error('service', `Failed to download translation model for ${lang_code}:`, res.error_message);
                onFailure()
            }
        })
    })
}

async function checkIfPageTranslatedService(): Promise<boolean> {
    return new Promise((resolve) => {
        getActiveTabId().then((activeTabId) => {
            if (activeTabId === null) {
                resolve(false);
                return;
            }
            console.log("service", `Checking if page is already translated`);
            chrome.tabs.sendMessage(activeTabId, {
                type: MessageType.CHECK_IF_TRANSLATED
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

    const {nav: {goToPage}, modal: {openModal}, data: {languages}} = useAppContext()
    const lang = languages.get(code)

    React.useEffect(() => {
        // check if page is already translated
        checkIfPageTranslatedService().then((is_translated) => {
            if (is_translated) {
                setPageStatus(PageStatus.Ready);
            } else {
                setPageStatus(PageStatus.Untranslated);
            }
        })
    }, []);
    const translatePage = React.useCallback(() => {
        // set lang as current language
        if (!lang) return;
        setPageStatus(PageStatus.Translating)
        translatePageService(code, async () => {
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
            <div className={"absolute top-0 left-0 p-2"}>
                <img src={"./icons/icon128.png"} alt={"LingoLucid Logo"} className={"h-14 w-14"}/>
            </div>
            <div className={"absolute flex flex-row gap-4 items-center justify-center top-0 right-0 p-2"}>
                {/*<button*/}
                {/*    onClick={translate}>*/}
                {/*    <PlayIcon size={"20px"}/>*/}
                {/*</button>*/}
                <button
                    onClick={onClickSettings}>
                    <SettingsIcon size={"20px"}/>
                </button>
                <button
                    onClick={() => goToPage("home")}>
                    <HomeIcon size={"20px"}/>
                </button>
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
                                        <TranslateIcon size={64} color={"black"}/>
                                        <p className={"text-gray-500 text-lg text-center mt-2"}>
                                            Translate Page
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
