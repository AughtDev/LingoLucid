import React from 'react';
import {PopupState, PopupType, updatePopupState} from "../store.ts";
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import Button from "../../../components/Button.tsx";
import {CloseIcon, SaveIcon} from "../../../constants/icons.tsx";
import {saveCardToLocalStorage} from "../utils.ts";
import {translateFromTargetLanguage} from "../../../ai/translation.ts";
import {highlightPage} from "../../content/page_actions.ts";

interface FullInspectPopupProps {
    state: PopupState
}


export default function FullInspectPopup({state} : FullInspectPopupProps) {
    const popup_ref = React.useRef<HTMLDivElement | null>(null);

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
        saveCardToLocalStorage(target_lang, state.content.focus_text, text, "saved").then(() => {
            // state.actions.onSaveCard()
            highlightPage().then()
            console.log("Saved Card saved successfully");
        }).catch((error) => {
            console.error("Error saving card:", error);
        });
    }, [text, state.content.focus_text]);


    React.useEffect(() => {
        if (state.type !== PopupType.FULL) return;

        const target_lang = document.body.getAttribute('data-target-lang') || undefined;
        // translate the text text to the target language
        if (!target_lang) return
        translateFromTargetLanguage(state.content.focus_text, target_lang).then((original_text) => {
            console.log("Translated ", text, " to Original text:", original_text);
            if (original_text !== null) {
                setText(original_text);
                saveCardToLocalStorage(target_lang, state.content.focus_text, original_text, "recent").then(() => {
                    console.log("Card saved successfully among recents");
                }).catch((error) => {
                    console.error("Error saving card:", error);
                });
            }
        }).finally(() => {
            setTranslationLoading(false)
        });
    }, [state.type]);

    // add on click listeners to close the popup when clicking outside of it of scrolling the page
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const path = event.composedPath()

            if (popup_ref.current && !path.includes(popup_ref.current)) {
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

    return (
        <div
            ref={popup_ref}
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
                top: state.position.top,
                left: state.position.left,
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

            <p className={"text-sm font-semibold p-1 text-center"}>{state.content.focus_text}</p>
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
