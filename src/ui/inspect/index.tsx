import React from "react";
import {BACKGROUND_COLOR} from "../../constants/styling.ts";
import {CloseIcon, SaveIcon} from "../../constants/icons.tsx";
import {translateFromTargetLanguage} from "../../ai/translation.ts";
import {MessageType, SaveCardPayload} from "../../types/comms.ts";
import {LanguageCards} from "../../types/core.ts";
import {getPopupState, PopupState, subscribe, updatePopupState} from "./store.ts";

// interface InspectTextPopupProps {
//     translation: string;
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

    const target_lang = document.body.getAttribute('data-target-lang') || undefined;

    const [translation_loading, setTranslationLoading] = React.useState<boolean>(true)
    const [text, setText] = React.useState<string>("")

    const closePopup = React.useCallback(() => {
        updatePopupState({
            isVisible: false
        })
    }, []);
    const saveCard = React.useCallback(() => {
        if (!target_lang) return;
        saveCardToLocalStorage(target_lang, state.translation, text, "saved").then(() => {
            console.log("Card saved successfully");
        }).catch((error) => {
            console.error("Error saving card:", error);
        });
    }, [text, state.translation]);

    // 2. Subscribe to the external store on mount
    React.useEffect(() => {
        const unsubscribe = subscribe(() => {
            setState(getPopupState()); // Update local state when store changes
        });
        return () => unsubscribe(); // Unsubscribe on unmount
    }, []);
    React.useEffect(() => {
        // translate the translation text to the target language
        if (!target_lang) return
        translateFromTargetLanguage(state.translation, target_lang).then((original_text) => {
            console.log("Translated ", text, " to Original text:", original_text);
            if (original_text !== null) {
                setText(original_text);
                saveCardToLocalStorage(target_lang, state.translation, original_text, "recent").then(() => {
                    console.log("Card saved successfully among recents");
                }).catch((error) => {
                    console.error("Error saving card:", error);
                });
            }
        }).finally(() => {
            setTranslationLoading(false)
        });
    }, [state.translation]);

    // add on click listeners to close the popup when clicking outside of it of scrolling the page
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const popup = document.getElementById("inspect-popup");
            if (popup && !popup.contains(event.target as Node)) {
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

    if (!state.isVisible) {
        return null;
    }

    return (
        <div
            id={"inspect-popup-container"}
            className={"flex flex-col items-start justify-center pl-2"}
            style={{
                position: "absolute",
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "1rem",
                padding: "1rem",
                width: "300px",
                top: state.top,
                left: state.left,
            }}>
            {/* close button */}
            <div className={"absolute top-0 left-0 m-2"}>
                <button
                    className={"text-sm text-gray-500 hover:text-gray-700"}
                    onClick={closePopup}>
                    <CloseIcon size={12}/>
                </button>
            </div>
            {/* save button */}
            <div className={"absolute top-0 right-0 m-2"}>
                <button
                    onClick={saveCard}>
                    <div className={"flex flex-row gap-2"}>
                        <SaveIcon size={24}/>
                    </div>
                </button>
            </div>

            <p className={"text-sm font-semibold p-1 text-center"}>{state.translation}</p>
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
}
