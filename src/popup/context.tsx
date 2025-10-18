import React from "react";

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
})


export default function useAppContext() {
    return React.useContext(AppContext);
}
