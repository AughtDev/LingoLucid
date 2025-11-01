import React from "react";
import FullInspectPopup from "./full";
import HoverInspectPopup from "./hover";
import {highlightPage} from "../content/page_actions.ts";
import {simplifyTranslatedText} from "../../ai/simplify.ts";
import {getPopupState, PopupState, PopupType, subscribe} from "../store/popup.ts";

// Helper to capture and strip only the outer non-alphanumeric characters
interface Sides { left: string; right: string }

function extractOuterSides(input: string): { core: string; left: string; right: string } {
    // Unicode-aware: letters (L) or numbers (N)
    const ALNUM = /[\p{L}\p{N}]/gu;
    let first = -1;
    let last = -1;
    let lastLen = 0;

    for (const m of input.matchAll(ALNUM)) {
        const idx = m.index ?? -1;
        if (idx === -1) continue;
        if (first === -1) first = idx;
        last = idx;
        lastLen = m[0].length;
    }

    if (first === -1) {
        // No alphanumeric content
        return { core: "", left: input, right: "" };
    }

    const left = input.slice(0, first);
    const right = input.slice(last + lastLen);
    const core = input.slice(first, last + lastLen);
    return { core, left, right };
}

export async function simplifyText(
    lang_code: string,
    text: string, text_node: Text | null, range: Range | null,
): Promise<{ sides: Sides; simplified: string } | null> {
    // Clean only the outer parts and keep what was removed
    const { core, left, right } = extractOuterSides(text);

    if (!core) {
        console.error("Cannot simplify text: empty after removing outer characters");
        return null;
    }

    const simplified_text = await simplifyTranslatedText(lang_code, core, {
        level: "a1"
    });

    if (!simplified_text) {
        console.error("Cannot simplify text: simplifier returned null");
        return null;
    }

    if (!text_node || !range) {
        console.error("Cannot simplify text: missing text node or range");
        return { sides: { left, right }, simplified: simplified_text };
    }

    // Replace the selected text with left + simplified + right
    const full_text = text_node.textContent || "";
    const start_offset = range.startOffset;
    const end_offset = range.endOffset;

    const before_text = full_text.slice(0, start_offset);
    const after_text = full_text.slice(end_offset);

    const reattached = `${left}${simplified_text}${right}`;

    text_node.textContent = before_text + reattached + after_text;
    highlightPage().then();

    return { sides: { left, right }, simplified: simplified_text.trim().toLowerCase() };
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
