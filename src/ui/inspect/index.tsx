import React from "react";
import {getPopupState, PopupState, PopupType, subscribe} from "./store.ts";
import FullInspectPopup from "./full";
import HoverInspectPopup from "./hover";
import {highlightPage} from "../content/page_actions.ts";
import {simplifyTranslatedText} from "../../ai/simplify.ts";

export async function simplifyText(
    text: string, text_node: Text | null, range: Range | null,
) {
    // get the text node and range from state and simplify the text
    // const text = state.content.focus_text
    const simplified_text = await simplifyTranslatedText(text, {
        level: "a1"
    })

    if (!simplified_text || !text_node || !range) {
        console.error("Cannot simplify text: missing data");
        return;
    }

    // replace the matching text in the text node with the simplified text
    const full_text = text_node.textContent || "";
    const start_offset = range.startOffset;
    const end_offset = range.endOffset;

    const before_text = full_text.slice(0, start_offset);
    const after_text = full_text.slice(end_offset);

    text_node.textContent = before_text + simplified_text + after_text;
    highlightPage().then()
}

export function InspectTextPopup() {
    const [state, setState] = React.useState<PopupState>(getPopupState())

    React.useEffect(() => {
        const unsubscribe = subscribe(() => {
            setState(getPopupState()); // Update local state when store changes
        });
        return () => unsubscribe(); // Unsubscribe on unmount
    }, []);


    switch (state.type) {
        case PopupType.NONE:
            return null;

        case PopupType.FULL:
            return <FullInspectPopup state={state}/>

        case PopupType.HOVER:
            return <HoverInspectPopup state={state}/>

        default:
            return null
    }
}
