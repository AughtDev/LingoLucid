import React from "react";
import {getPopupState, PopupState, PopupType, subscribe} from "./store.ts";
import FullInspectPopup from "./full";
import HoverInspectPopup from "./hover";

// interface InspectTextPopupProps {
//     text: string;
//     top: number;
//     left: number;
//     closePopup: () => void;
// }


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
