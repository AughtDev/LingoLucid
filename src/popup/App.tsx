import React from 'react';
import {getAppConfigService} from "../utils/data/services.ts";
import HomePage from "./pages/home";
import {AppContext, AppContextProps} from "./context.tsx";
import {INITIAL_LANGUAGES} from "../constants/languages.ts";
import LangPage from "./pages/lang";
import {useLanguages} from "./hooks/useLanguages.tsx";


const PAGES: { id: string, content: () => React.ReactElement }[] = [
    {id: "home", content: HomePage},
    ...(Object.values(INITIAL_LANGUAGES).map(({code}) => ({
        id: `lang/${code}`,
        content: () => <LangPage code={code}/>
    })))
]

console.log("PAGES:", PAGES);

const getCurrentUrl = async (): Promise<string | null> => {
    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        return tab.url || null;
    } catch (error) {
        console.error('Error getting current URL:', error);
        return null;
    }
};
export default function App() {
    const {languages, loading} = useLanguages()

    const [curr_page, setCurrPage] = React.useState<string>(PAGES[0].id);
    const [modal, setModal] = React.useState<React.ReactElement | null>(null)

    React.useEffect(() => {
        getCurrentUrl().then(url => {
            if (url) {
                // confirm valid url
            }
        });
        getAppConfigService().then(config => {
            if (config.curr_language) {
                setCurrPage(`lang/${config.curr_language}`)
            }
        })
    }, []);

    const app_context: AppContextProps = React.useMemo(() => ({
        meta: {
            app_loading: loading
        },
        nav: {
            curr_page: curr_page,
            goToPage: (page: string) => {
                setCurrPage(page)
            }
        },
        modal: {
            openModal: (modal_element: React.ReactElement) => {
                setModal(modal_element)
            },
            closeModal: () => {
                setModal(null)
            }
        },
        data: {languages}
    }), [loading, curr_page, setCurrPage, setModal, languages]);

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
                    <div style={{height: '600px', zIndex: 40}}
                         onClick={onClickModalBackground}
                         className={"absolute w-full flex flex-col justify-center items-center backdrop-blur-sm bg-black/10"}>
                        {modal}
                    </div>
                ) : null}
                {PAGES.map((page) => {
                    if (page.id === curr_page) {
                        const PageComponent = page.content;
                        return <PageComponent key={page.id}/>;
                    }
                    return null;
                })
                }
            </div>
        </AppContext.Provider>
    )
}
