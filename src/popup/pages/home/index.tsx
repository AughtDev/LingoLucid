import React from 'react';
import {INITIAL_LANGUAGES} from "../../../constants/languages.ts";
import useAppContext from "../../context.tsx";
import LanguageSetupModal from "../../modals/language-setup";

export default function HomePage() {
    const {meta: {app_loading}, nav: {goToPage}, modal: {openModal, closeModal}} = useAppContext()

    return (
        <div className={"flex flex-col w-full h-full"}>
            <div className={"flex justify-center items-center h-2/5 w-full"}>
                <img src={"./icons/icon128.png"} alt={"LingoLucid Logo"} className={"h-30 w-30"}/>
            </div>
            {app_loading ? (
                <div className={"flex justify-center items-center h-2/3 w-full"}>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className={"flex flex-col justify-center items-center h-3/5 w-full"}>
                    <div className={"flex flex-col justify-center items-center w-full h-1/3"}>
                        <h1
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                            }}
                            className={"align-center"}>
                            Welcome To LingoLucid
                        </h1>
                        <h3
                            style={{
                                fontSize: "1rem",
                                fontWeight: "normal",
                            }}>
                            Select one of the languages below to begin.
                        </h3>
                    </div>
                    <div className={"flex flex-col items-center justify-center w-full h-2/3"}>
                        <div
                            style={{rowGap: "1rem"}}
                            className={"flex flex-row flex-wrap gap-6 justify-center items-center w-70"}>
                            {Object.values(INITIAL_LANGUAGES).map(lang => (
                                <button
                                    key={lang.slug}
                                    onClick={() => {
                                        openModal(<LanguageSetupModal slug={lang.slug} proceed={() => {
                                            closeModal();
                                            goToPage(`lang/${lang.slug}`);
                                        }}/>)
                                    }}
                                    className={"hover:brightness-50 transition-all"}>
                                    <img src={lang.flag_href} alt={lang.label} className={"h-10 m-1 rounded-md"}/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
