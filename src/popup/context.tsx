import React from "react";
import {Language} from "../types/core.ts";

export interface AppContextProps {
    meta: {
        app_loading: boolean
    }
    nav: {
        curr_page: string
        goToPage: (page: string) => void
    },
    modal: {
        openModal: (modal: React.ReactElement) => void
        closeModal: () => void
    },
    data: {
        languages: Map<string, Language>
    }
}

export const AppContext = React.createContext<AppContextProps>({
    meta: {
        app_loading: true
    },
    modal: {
        openModal: (_modal: React.ReactElement) => null,
        closeModal: () => null
    },
    nav: {
        curr_page: "",
        goToPage: (_page: string) => null
    },
    data: {
        languages: new Map(),
    }
})


export default function useAppContext() {
    return React.useContext(AppContext);
}
