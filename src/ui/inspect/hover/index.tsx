import React from 'react';
import {getCachedCards, PopupState, PopupType, updatePopupState} from "../store.ts";
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import Button from "../../../components/Button.tsx";
import {SimplifyIcon, TranslateIcon} from "../../../constants/icons.tsx";
import {simplifyText} from "../index.tsx";

interface HoverInspectPopupProps {
    state: PopupState
}

const RANGE_HOVER_PADDING = 5; // pixels

export default function HoverInspectPopup({state}: HoverInspectPopupProps) {
    const popup_ref = React.useRef<HTMLDivElement | null>(null);
    const closePopup = React.useCallback(() => {
        updatePopupState({
            type: PopupType.NONE
        })
    }, []);

    const onClickSimplify = React.useCallback(async () => {
        await simplifyText(
            state.content.focus_text,
            state.content.focus_text_node,
            state.content.focus_range
        )
    }, [state.content.focus_range, state.content.focus_text]);

    const onClickTranslate = React.useCallback(() => {
        updatePopupState({
            ...state,
            type: PopupType.FULL
        })
    }, [state]);

    React.useEffect(() => {
        const handleMoveOutsidePopupAndRange = (event: MouseEvent) => {
            if (!popup_ref.current) return;

            // check if the mouse event is outside the popup and outside the selected range
            const path = event.composedPath()

            if (path.includes(popup_ref.current)) return;

            const pd = RANGE_HOVER_PADDING
            const range_rects = state.content.focus_range?.getClientRects();
            if (range_rects) {
                for (let i = 0; i < range_rects.length; i++) {
                    const rect = range_rects[i];
                    if (event.clientX >= rect.left - pd && event.clientX <= rect.right + pd &&
                        event.clientY >= rect.top - pd && event.clientY <= rect.bottom + pd) {
                        return; // inside the range
                    }
                }
            }

            // if we reach here, the mouse is outside both the popup and the range
            closePopup();
        }

        const handleScroll = () => {
            closePopup();
        }

        document.addEventListener("mousemove", handleMoveOutsidePopupAndRange);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousemove", handleMoveOutsidePopupAndRange);
            window.removeEventListener("scroll", handleScroll, true);
        }
    }, [])

    const hover_type: string | undefined = React.useMemo(() => {
        const cards = getCachedCards()
        if (cards.saved.map(card => card.text).includes(state.content.focus_text)) {
            return "SAVED"
        } else if (cards.recent.map(card => card.text).includes(state.content.focus_text)) {
            return "RECENT"
        } else {
            return undefined
        }
    }, [state.content.focus_text]);

    return (
        <div
            ref={popup_ref}
            id={"hover-inspect-popup-container"}
            className={"flex flex-col justify-center items-start gap-2 rounded-md p-1"}
            style={{
                position: "absolute",
                backgroundColor: BACKGROUND_COLOR,
                top: state.position.top,
                left: state.position.left,
                border: "1px solid rgba(0,0,0,0.1)",
            }}>
            {hover_type && (
                <div
                    style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        padding: "2px 4px"
                    }}
                    className={"bg-amber-600 text-white rounded-md"}>
                    {hover_type}
                </div>
            )}
            <div
                className={"flex flex-row justify-center items-center gap-1.5"}>

                <Button variant={"icon"} onClick={onClickSimplify}
                        tooltip_label={"Simplify"} icon={SimplifyIcon} size={18}/>

                <Button variant={"icon"} onClick={onClickTranslate}
                        tooltip_label={"Translate"} icon={TranslateIcon} size={18}/>
            </div>
        </div>
    )
}
