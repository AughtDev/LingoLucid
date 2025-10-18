import React from 'react';
import {Language} from "../../../types/types.ts";
import {getLanguageService} from "../../../utils/data/services.ts";
import useAppContext from "../../context.tsx";
import CardsView from "./CardsView.tsx";

interface LangPageProps {
    slug: string
}

export default function LangPage({slug}: LangPageProps) {
    const [lang, setLang] = React.useState<Language | null>(null)
    const [loading, setLoading] = React.useState<boolean>(true)

    const [_rfr, _reloadLang] = React.useReducer(x => x + 1, 0);

    const {
        nav: {goToPage}
    } = useAppContext()

    React.useEffect(() => {
        // fetch language data from local storage
        getLanguageService(slug).then(res => {
            if (res) {
                setLang(res)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [_rfr]);

    return (
        <div className={"flex flex-col w-full h-full"}>
            {!loading ? lang ? (
                <>
                    <div className={"flex flex-row justify-between w-full h-8"}>
                        <div/>
                        <h1>
                            {lang.slug}
                        </h1>
                        <div className={"flex flex-row gap-4 items-center justify-center"}>
                            <button>
                                stngs
                            </button>
                            <button
                                onClick={() => goToPage("home")}>
                                home
                            </button>
                        </div>
                    </div>
                    <div className={"flex-grow w-full"}>
                        <CardsView lang_slug={slug} cards={lang.cards}/>
                    </div>
                </>
            ) : (
                <div className={"flex justify-center items-center h-full w-full"}>
                    <p>Language not found.</p>
                </div>
            ) : (
                <div className={"flex justify-center items-center h-full w-full"}>
                    <p>Loading...</p>
                </div>
            )}
        </div>
    )
}
