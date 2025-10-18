import React from 'react';
import {INITIAL_LANGUAGES} from "../../../constants/languages.ts";
import useAppContext from "../../context.tsx";

export default function HomePage() {
    const {meta: {app_loading}, nav: {goToPage}} = useAppContext()

    return (
        <div className={"flex flex-col w-full h-full"}>
            <div className={"flex justify-center items-center h-1/3 w-full"}>
                <p>LingoLucid Logo</p>
            </div>
            {app_loading ? (
                <div className={"flex justify-center items-center h-2/3 w-full"}>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className={"flex flex-col justify-center items-center h-2/3 w-full"}>
                    <div className={"flex flex-col justify-center items-center w-full h-1/3"}>
                        <h1 className={"align-center"}>
                            Welcome To LingoLucid!
                        </h1>
                        <h3>
                            Select one of the languages below to begin.
                        </h3>
                    </div>
                    <div className={"flex flex-col items-center justify-center w-full h-2/3"}>
                        <div
                            style={{rowGap: "1rem"}}
                            className={"flex flex-row flex-wrap gap-6 justify-center items-center w-full"}>
                            {Object.values(INITIAL_LANGUAGES).map(lang => (
                                <button
                                    key={lang.slug}
                                    onClick={() => goToPage(`lang/${lang.slug}`)}
                                    className={"border rounded-lg hover:bg-gray-200"}>
                                    <img src={lang.flag_href} alt={lang.label} className={"h-10 m-1"}/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
