import React from 'react';
import useAppContext from "../../context.tsx";
import LanguageSetupModal from "../../modals/language-setup";
import {Language} from "../../../types/core.ts";
import AppInfoModal from "../../modals/app-info";
import {FilledPlayIcon, InfoIcon} from "../../../constants/icons.tsx";
import {SECONDARY_COLOR} from "../../../constants/styling.ts";
import {WarningsButton} from "../../modals/warning";

interface LanguageSelectorProps {
    lang: Language
}

function LanguageSelector({lang}: LanguageSelectorProps) {
    const [is_hovered, setIsHovered] = React.useState<boolean>(false)

    const div_ref = React.useRef<HTMLDivElement | null>(null);
    const {nav: {goToPage}, modal: {openModal}} = useAppContext()

    React.useEffect(() => {
        const div_element = div_ref.current;
        if (!div_element) return;

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        div_element.addEventListener('mouseenter', handleMouseEnter);
        div_element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            div_element.removeEventListener('mouseenter', handleMouseEnter);
            div_element.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, []);

    return (
        <div
            style={{
                cursor: "pointer"
            }}
            onClick={() => {
                if (lang.progress.started) {
                    goToPage(`lang/${lang.code}`);
                } else {
                    openModal(<LanguageSetupModal language={lang}/>)
                }
            }}
            ref={div_ref}
            className={"relative flex flex-col gap-1 items-center justify-center"}>
            <div
                className={"absolute top-0 z-10 w-full h-12 flex flex-col items-center justify-center"}>
                {is_hovered && (
                    lang.progress.started ? (
                        <span className={"text-md font-semibold text-green-300"}>
                            {Math.round((lang.progress.mastery || 0) * 100)}%
                        </span>
                    ) : (
                        <FilledPlayIcon size={20} color={"#9f9"}/>
                    )
                )}
            </div>
            <div
                style={{
                    filter: is_hovered ? 'brightness(60%)' : 'none',
                }}
                key={lang.code}
                className={""}>
                <img src={lang.flag_href} alt={lang.label} className={"h-10 m-1 rounded-md"}/>
            </div>
            {/* progress bar */}
            {lang.progress.started ? (
                <div className={"w-12 h-2 bg-gray-300 rounded-full mt-1"}>
                    <div
                        className={"h-2 bg-green-500 rounded-full"}
                        style={{width: `${(lang.progress.mastery || 0) * 100}%`}}></div>
                </div>
            ) : (
                <div className={"h-2"}/>
            )}
        </div>
    )
}

export default function HomePage() {
    const {meta: {progress, warnings}, data: {languages}, modal: {openModal}} = useAppContext()

    console.log("languages are ", languages);

    return (
        <div className={"flex flex-col w-full h-full"}>
            <div className={"absolute top-4 right-4"}>
                <div className={"flex flex-col justify-center items-center gap-4"}>
                    <button
                        onClick={() => openModal(<AppInfoModal/>)}>
                        <InfoIcon size={24} color={SECONDARY_COLOR}/>
                    </button>
                    {warnings && (
                        <WarningsButton warnings={warnings} size={24}/>
                    )}
                </div>
            </div>
            <div className={"flex justify-center items-center h-2/5 w-full"}>
                <img src={"./icons/icon128.png"} alt={"LingoLucid Logo"} className={"h-30 w-30"}/>
            </div>
            {progress < 1 ? (
                <div className={"flex justify-center items-center h-2/3 w-full"}>
                    <p>Loading... {(progress * 100).toFixed(2)}%</p>
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
                            {Array.from(languages.values()).map(lang => (
                                <LanguageSelector key={lang.code} lang={lang}/>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
