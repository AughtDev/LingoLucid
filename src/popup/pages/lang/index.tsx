import React from 'react';
import {setCurrentLanguageService} from "../../../utils/data/services.ts";
import useAppContext from "../../context.tsx";
import CardsView from "./CardsView.tsx";
import {HomeIcon, SettingsIcon} from "../../../constants/icons.tsx";
import {useLanguage} from "../../hooks/useLanguage.tsx";
import LanguageSettingsModal from "../../modals/language-settings";

interface LangPageProps {
    slug: string
}

export default function LangPage({slug}: LangPageProps) {
    const {nav: {goToPage},modal: {openModal}} = useAppContext()

    const {lang, loading} = useLanguage(slug)
    React.useEffect(() => {
        // set lang as current language
        if (!lang) return;
        setCurrentLanguageService(slug).then()
    }, [lang]);

    return (
        <div className={"relative flex flex-col w-full h-full"}>
            <div className={"absolute top-0 left-0 p-2"}>
                <img src={"./icons/icon128.png"} alt={"LingoLucid Logo"} className={"h-14 w-14"}/>
            </div>
            <div className={"absolute flex flex-row gap-4 items-center justify-center top-0 right-0 p-2"}>
                <button
                    onClick={() => {
                        if (!lang) return;
                        openModal(<LanguageSettingsModal language={lang}/>);
                    }}>
                    <SettingsIcon size={"20px"}/>
                </button>
                <button
                    onClick={() => goToPage("home")}>
                    <HomeIcon size={"20px"}/>
                </button>
            </div>

            {!loading ? lang ? (
                <>
                    <div className={"flex flex-row items-center justify-center w-full h-12 gap-2"}>
                        <img src={lang.flag_href} alt={lang.label} className={"h-4 m-1 rounded-sm"}/>
                        <h1 className={"text-lg font-semibold"}>
                            {lang.slug.toUpperCase()}
                        </h1>
                    </div>
                    <div className={"flex-grow w-full items-center"}>
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
