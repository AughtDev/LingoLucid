
import {getPopupState, PopupType, updatePopupState} from "../store/popup.ts";


let popup_delay_timer: number | null = null;
const HOVER_DELAY = 1000; // milliseconds
const HOVER_DETECT_PADDING = 3 // 5px

export function wordHoverListener(e: MouseEvent) {
    if (popup_delay_timer) {
        clearTimeout(popup_delay_timer);
        popup_delay_timer = null;
    }

    if (getPopupState().type !== PopupType.NONE) {
        // do not show hover popup if another popup is already shown
        return;
    }
    const coords = {x: e.clientX, y: e.clientY};

    const caret_pos = document.caretPositionFromPoint(coords.x, coords.y);
    if (caret_pos && caret_pos.offsetNode && caret_pos.offsetNode.nodeType === Node.TEXT_NODE) {
        const text_node = caret_pos.offsetNode as Text;
        if (!text_node.textContent) return;

        const range_check = document.createRange();
        const r_offset = Math.max(0, Math.min(caret_pos.offset, text_node.length - 1));

        range_check.setStart(text_node, r_offset);
        range_check.setEnd(text_node, r_offset + 1);

        const rects = Array.from(range_check.getClientRects());

        if (rects.length === 0) {
            console.log("No visible rects for hovered text");
            return;
        }
        const pd = HOVER_DETECT_PADDING
        const hit = rects.find(r => coords.x >= r.left - pd && coords.x <= r.right + pd && coords.y >= r.top - pd && coords.y <= r.bottom + pd);

        if (!hit) {
            console.log("Not actually hovering over visible text");
            return;
        }

        popup_delay_timer = setTimeout(() => {
            if (getPopupState().type !== PopupType.NONE) {
                console.log("Popup already shown, not showing hover popup");
                return; // popup already shown, do nothing
            }

            // expand to full word
            const offset = caret_pos.offset;
            const text_content = text_node.textContent || '';
            const right_part = text_content.slice(offset);
            const left_part = text_content.slice(0, offset);

            const left_word_match = left_part.match(/(\S+)$/);
            const right_word_match = right_part.match(/^(\S+)/);

            const left_word = left_word_match ? left_word_match[0] : '';
            const right_word = right_word_match ? right_word_match[0] : '';

            let hovered_word = left_word + right_word;

            // remove any punctuation from hovered word
            hovered_word = hovered_word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

            if (hovered_word.trim().length > 0) {
                console.log("Hovered word:", hovered_word);
                const start = offset - left_word.length;
                const end = start + hovered_word.length;

                // get the word bounds and get the top and left of the popup as the bottom and left of the word
                // respectively
                const hovered_word_range = document.createRange();
                hovered_word_range.setStart(text_node, start);
                hovered_word_range.setEnd(text_node, end);
                const hovered_word_rects = Array.from(hovered_word_range.getClientRects());
                const hovered_word_hit = hovered_word_rects.find(r => coords.x >= r.left - 1 && coords.x <= r.right + 1 && coords.y >= r.top - 1 && coords.y <= r.bottom + 1);
                const hit = hovered_word_hit || hovered_word_rects[0];
                if (!hit) {
                    console.warn("Could not find rect for hovered word");
                    return;
                }

                // show hover popup near the word
                updatePopupState({
                    type: PopupType.HOVER,
                    content: {
                        focus_text: hovered_word,
                        focus_range: hovered_word_range,
                        focus_text_node: text_node
                    },
                    actions: {
                        changeFocusText: () => null,
                        onSaveCard: () => null,
                    },
                    position: {
                        top: hit.bottom + window.scrollY,
                        left: hit.left + window.scrollX
                    }
                });
            }
        }, HOVER_DELAY);
    }
}


export function textSelectListener(_e: MouseEvent) {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
        console.log("User selected text:", selection.toString());

        // set the position of the popup near the selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // get the text_node of the selection
        const text_node = range.startContainer;
        if (text_node.nodeType !== Node.TEXT_NODE) {
            console.warn("Selected text is not in a text node");
            return;
        }

        updatePopupState({
            type: PopupType.FULL,
            content: {
                focus_text: selection.toString(),
                focus_range: range,
                focus_text_node: text_node as Text
            },
            actions: {
                changeFocusText: () => null,
                onSaveCard: () => null,

            },
            position: {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            }
        });
    }
}
