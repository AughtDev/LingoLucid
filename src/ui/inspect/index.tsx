import React from "react";
import {BACKGROUND_COLOR} from "../../constants/styling.ts";
import {CloseIcon, SaveIcon, SimplifyIcon, TranslateIcon} from "../../constants/icons.tsx";
import {translateFromTargetLanguage} from "../../ai/translation.ts";
import {MessageType, SaveCardPayload} from "../../types/comms.ts";
import {LanguageCards} from "../../types/core.ts";
import {getPopupState, PopupState, PopupType, subscribe, updatePopupState} from "./store.ts";
import {SHADOW_ROOT} from "../../content.ts";
import Button from "../../components/Button.tsx";

// interface InspectTextPopupProps {
//     text: string;
//     top: number;
//     left: number;
//     closePopup: () => void;
// }

async function saveCardToLocalStorage(
    lang_code: string, text: string, translation: string, type: keyof LanguageCards
) {
    console.log("service", `Saving card to local storage: [${lang_code}] ${text} -> ${translation} as ${type}`);
    return await chrome.runtime.sendMessage({
        type: MessageType.SAVE_CARD,
        payload: {
            lang_code,
            text, translation, type
        } satisfies SaveCardPayload
    });
}

export function InspectTextPopup() {
    const [state, setState] = React.useState<PopupState>(getPopupState())


    const [translation_loading, setTranslationLoading] = React.useState<boolean>(true)
    const [text, setText] = React.useState<string>("")

    const closePopup = React.useCallback(() => {
        try {
            window.getSelection()?.removeAllRanges()
            updatePopupState({
                type: PopupType.NONE
            })
        } catch (e) {
            console.error("Error clearing selection:", e);
        }
    }, []);
    const saveCard = React.useCallback(() => {
        const target_lang = document.body.getAttribute('data-target-lang') || undefined;
        console.log("Saving card to target lang :", target_lang);
        if (!target_lang) return;
        saveCardToLocalStorage(target_lang, state.text, text, "saved").then(() => {
            state.onSave()
            console.log("Saved Card saved successfully");
        }).catch((error) => {
            console.error("Error saving card:", error);
        });
    }, [text, state]);

    // 2. Subscribe to the external store on mount
    React.useEffect(() => {
        const unsubscribe = subscribe(() => {
            setState(getPopupState()); // Update local state when store changes
        });
        return () => unsubscribe(); // Unsubscribe on unmount
    }, []);
    React.useEffect(() => {
        const target_lang = document.body.getAttribute('data-target-lang') || undefined;
        // translate the text text to the target language
        if (!target_lang) return

        if (state.type !== PopupType.FULL) return;
        translateFromTargetLanguage(state.text, target_lang).then((original_text) => {
            console.log("Translated ", text, " to Original text:", original_text);
            if (original_text !== null) {
                setText(original_text);
                saveCardToLocalStorage(target_lang, state.text, original_text, "recent").then(() => {
                    console.log("Card saved successfully among recents");
                }).catch((error) => {
                    console.error("Error saving card:", error);
                });
            }
        }).finally(() => {
            setTranslationLoading(false)
        });
    }, [state.text]);

    // add on click listeners to close the popup when clicking outside of it of scrolling the page
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const popup = SHADOW_ROOT.getElementById("lingolucid-root");
            if (popup && !popup.contains(event.target as Node)) {
                console.log("Clicked outside the popup, closing it.", event.target);
                closePopup();
            }
        };

        const handleScroll = () => {
            closePopup();
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [closePopup]);

    switch (state.type) {
        case PopupType.NONE:
            return null;
        case PopupType.FULL:
            return (
                <div
                    id={"inspect-popup-container"}
                    className={"flex flex-col items-start justify-center"}
                    style={{
                        position: "absolute",
                        backgroundColor: BACKGROUND_COLOR,
                        borderRadius: "1rem",
                        padding: "1rem",
                        paddingLeft: "2rem",
                        paddingRight: "2rem",
                        width: "300px",
                        top: state.top,
                        left: state.left,
                    }}>
                    {/* close button */}
                    <div
                        style={{
                            top: "-10px",
                            left: 0
                        }}
                        className={"absolute m-2.5"}>
                        <Button variant={"icon"} onClick={closePopup} icon={CloseIcon} size={12}/>
                    </div>
                    {/* save button */}
                    <div className={"absolute top-0 right-0 m-2"}>
                        <Button variant={"icon"} onClick={saveCard} icon={SaveIcon} size={24}/>
                    </div>

                    <p className={"text-sm font-semibold p-1 text-center"}>{state.text}</p>
                    <hr style={{width: "70%", opacity: 0.1}}/>
                    {!translation_loading ? (
                        text !== "" ? (
                            <p className={"text-sm text-gray-600 p-1 text-center"}>{text}</p>
                        ) : (
                            <p className={"text-sm text-gray-600 p-1 text-center"}>Translate Error</p>
                        )
                    ) : <p>...</p>}
                </div>
            )

        case PopupType.HOVER:
            return (
                <div
                    id={"hover-inspect-popup-container"}
                    className={"flex flex-row justify-center items-center gap-2"}
                    style={{
                        position: "absolute",
                        backgroundColor: BACKGROUND_COLOR,
                        top: state.top,
                        left: state.left,
                    }}>
                    <Button variant={"icon"} onClick={() => {
                        state.changeText("cheese")
                    }} tooltip_label={"Simplify"} icon={SimplifyIcon} size={18}/>

                    <Button variant={"icon"} onClick={() => {
                        updatePopupState({
                            ...state,
                            type: PopupType.FULL
                        })
                    }} tooltip_label={"Translate"} icon={TranslateIcon} size={18}/>
                </div>
            )
        default:
            return null
    }
}
