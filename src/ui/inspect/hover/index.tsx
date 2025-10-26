import React from 'react';
import {PopupState, PopupType, updatePopupState} from "../store.ts";
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import Button from "../../../components/Button.tsx";
import {SimplifyIcon, TranslateIcon} from "../../../constants/icons.tsx";
import {highlightPage} from "../../content/page_actions.ts";

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

    const simplifyText = React.useCallback(() => {
        // get the text node and range from state and simplify the text
        // const text = state.content.focus_text
        const simplified_text = "cheese"

        const text_node = state.content.focus_text_node;
        const range = state.content.focus_range;

        if (!simplified_text || !text_node || !range) return;

        // replace the matching text in the text node with the simplified text
        const full_text = text_node.textContent || "";
        const start_offset = range.startOffset;
        const end_offset = range.endOffset;

        const before_text = full_text.slice(0, start_offset);
        const after_text = full_text.slice(end_offset);

        text_node.textContent = before_text + simplified_text + after_text;
        highlightPage().then()

    }, [state.content.focus_range, state.content.focus_text_node]);

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
    },[])

    return (
        <div
            ref={popup_ref}
            id={"hover-inspect-popup-container"}
            className={"flex flex-row justify-center items-center gap-2"}
            style={{
                position: "absolute",
                backgroundColor: BACKGROUND_COLOR,
                top: state.position.top,
                left: state.position.left,
            }}>
            <Button variant={"icon"} onClick={simplifyText}
                    tooltip_label={"Simplify"} icon={SimplifyIcon} size={18}/>

            <Button variant={"icon"} onClick={() => {
                updatePopupState({
                    ...state,
                    type: PopupType.FULL
                })
            }} tooltip_label={"Translate"} icon={TranslateIcon} size={18}/>
        </div>
    )
}
