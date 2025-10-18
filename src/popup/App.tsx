import React from 'react';
import {getAppConfigService, initializeLanguagesService} from "../utils/data/services.ts";
import HomePage from "./pages/home";
import {AppContext, AppContextProps} from "./context.tsx";
import {INITIAL_LANGUAGES} from "../constants/languages.ts";
import LangPage from "./pages/lang";

// async function _runAIPrompt(promptText: string, setModelDownloadProgress: (progress: number) => void) {
//
//     if (!('Translator' in self)) {
//         return
//     }
//     const translatorCapabilities = await Translator.availability({
//         sourceLanguage: 'en',
//         targetLanguage: 'fr',
//
//     });
//     console.log('Translator capabilities:', translatorCapabilities);
//
//     const translator = await Translator.create({
//         sourceLanguage: 'es',
//         targetLanguage: 'fr',
//         monitor(m: any) {
//             m.addEventListener('downloadprogress', (e: { loaded: number }) => {
//                 console.log(`Downloaded ${e.loaded * 100}%`);
//                 setModelDownloadProgress(e.loaded)
//             });
//         },
//     });
//     return await translator.translate(promptText)
// }


const PAGES: { id: string, content: () => React.ReactElement }[] = [
    {id: "home", content: HomePage},
    ...(Object.values(INITIAL_LANGUAGES).map(({slug}) => ({
        id: `lang/${slug}`,
        content: () => <LangPage slug={slug}/>
    })))
]


export default function App() {
    const [curr_page, setCurrPage] = React.useState<string>(PAGES[0].id);
    const [loading, setLoading] = React.useState<boolean>(true)
    const [modal, setModal] = React.useState<React.ReactElement | null>(null)

    React.useEffect(() => {
        initializeLanguagesService().then(async () => {
            console.log('All Languages initialized')
            return await getAppConfigService()
        }).then(config => {
            // if there is a current language set, set curr_page to that language page
            if (config.curr_language) {
                setCurrPage(`lang/${config.curr_language}`)
            }
            setLoading(false)
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
        }
    }), [loading, curr_page, setCurrPage, setModal]);

    return (
        <AppContext.Provider value={app_context}>
            <div style={{height: '590px'}} className={"relative w-full"}>
                {modal ? (
                    <div style={{height: '600px',zIndex: 10}}
                         className={"absolute w-full flex flex-col justify-center items-center backdrop-blur-sm bg-white/10"}>
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
