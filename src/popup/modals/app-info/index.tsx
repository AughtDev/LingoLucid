import React from 'react';
import {CloseIcon} from "../../../constants/icons.tsx";
import useAppContext from "../../context.tsx";


function Snippet({text}: { text: string }) {
    return <p className={"text-md text-gray-800 text-center"}> {text} </p>
}

export default function AppInfoModal() {
    const {modal: {closeModal}} = useAppContext()

    return (
        <div className={"w-full h-full flex flex-col items-center justify-center p-4 gap-2"}>
            <div className={"absolute top-0 right-0 m-4"}>
                <button
                    className={"text-sm text-gray-500 hover:text-gray-700"}
                    onClick={closeModal}>
                    <CloseIcon size={16}/>
                </button>
            </div>
            <Snippet text={"LingoLucid is a browser extension designed to help users learn new languages while browsing the web. It provides vocabulary practice and language learning tools integrated directly into your browsing experience."}/>
        </div>
    )
}
