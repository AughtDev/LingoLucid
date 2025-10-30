import React from 'react';
import {
    getActiveTabId,
} from "../utils/data/services.ts";
import HomePage from "./pages/home";
import {AppContext, AppContextProps} from "./context.tsx";
import {INITIAL_LANGUAGES} from "../constants/languages.ts";
import LangPage from "./pages/lang";
import {useLanguages} from "./hooks/useLanguages.tsx";
import Button from "../components/Button.tsx";
import {CloseIcon} from "../constants/icons.tsx";
import LogsModal from "./modals/logs";
import {MessageResponse, MessageType} from "../types/comms.ts";


const PAGES: { id: string, content: () => React.ReactElement }[] = [
    {id: "home", content: HomePage},
    ...(Object.values(INITIAL_LANGUAGES).map(({code}) => ({
        id: `lang/${code}`,
        content: () => <LangPage code={code}/>
    })))
]

console.log("PAGES:", PAGES);

export async function getPageLangCodeService(): Promise<string | null> {
    return new Promise((resolve) => {
        getActiveTabId().then((activeTabId) => {
            if (activeTabId === null) {
                resolve(null);
                return;
            }
            console.log("service", `Checking if page is already translated`);
            chrome.tabs.sendMessage(activeTabId, {
                type: MessageType.GET_PAGE_LANG_CODE,
            }, (res: MessageResponse<string | null>) => {
                if (res.is_success && res.data !== undefined) {
                    console.log('service', `Page translation status: ${res.data}`);
                    resolve(res.data);
                } else {
                    console.error('service', `Failed to check page translation status:`, res.error_message);
                    resolve(null);
                }
            })
        })
    })
}

const getCurrentUrl = async (): Promise<string | null> => {
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        return tab.url || null;
    } catch (error) {
        console.error('Error getting current URL:', error);
        return null;
    }
};

const SUPPORTED_SITES = [
    "substack.com"
]
export default function App() {
    const {languages, init_log, makeLog} = useLanguages()

    const [curr_page, setCurrPage] = React.useState<string>(PAGES[0].id);
    const [modal, setModal] = React.useState<React.ReactElement | null>(null)

    React.useEffect(() => {
        getCurrentUrl().then(url => {
            if (url) {
                console.log("Current URL:", url);
                // check using regex if the url matches any of the supported sites, if not, add a warning
                const is_supported = SUPPORTED_SITES.some(site => {
                    return url.includes(site)
                });
                if (!is_supported) {
                    makeLog("warning", "Unsupported Site",
                        `The current site (${url}) is not officially supported.
                         Some features may not work as expected.`);
                }
            }
        });
        getPageLangCodeService().then(lang_code => {
            if (lang_code) {
                setCurrPage(`lang/${lang_code}`)
            }
        })

    }, []);

    // when progress is 1, display errors and warnings, if there are any
    React.useEffect(() => {
        if (init_log.progress >= 1) {
            if (init_log.errors.length > 0 || init_log.warnings.length > 0) {
                // if the page has not yet been translated
                getPageLangCodeService().then(lang_code => {
                    if (!lang_code) {
                        setModal(<LogsModal warnings={init_log.warnings} errors={init_log.errors}/>)
                    }
                })
            }
        }
    }, [init_log.progress, init_log.errors, init_log.warnings]);

    const app_context: AppContextProps = React.useMemo(() => ({
        meta: init_log,
        nav: {
            curr_page: curr_page,
            goToPage: (page: string) => {
                setCurrPage(page)
            }
        },
        modal: {
            modal_open: modal !== null,
            openModal: (modal_element: React.ReactElement) => {
                setModal(modal_element)
            },
            closeModal: () => {
                setModal(null)
            }
        },
        data: {languages}
    }), [curr_page, setCurrPage, setModal, languages, init_log, modal]);

    const onClickModalBackground = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // make sure that it's not the modal being clicked
        if (e.target === e.currentTarget) {
            setModal(null)
        }
    }, [setModal]);

    return (
        <AppContext.Provider value={app_context}>
            <div style={{height: '590px'}} className={"relative w-full"}>
                {modal ? (
                    <>
                        <div style={{height: '600px', zIndex: 40}}
                             onClick={onClickModalBackground}
                             className={"absolute w-full flex flex-col justify-center items-center backdrop-blur-sm bg-black/10"}>
                            <div className={"absolute top-0 right-0 m-4"}>
                                <Button variant={"icon"} onClick={() => {
                                    setModal(null)
                                }} size={16} icon={CloseIcon}/>
                            </div>
                            {modal}
                        </div>
                    </>
                ) : null}
                {PAGES.map((page) => {
                    if (page.id === curr_page) {
                        const PageComponent = page.content;
                        return <PageComponent key={page.id}/>;
                    }
                    return null;
                })}
            </div>
        </AppContext.Provider>
    )
}
