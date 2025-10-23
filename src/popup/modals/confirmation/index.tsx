import React from 'react';
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import {CloseIcon} from "../../../constants/icons.tsx";
import useAppContext from "../../context.tsx";

interface ConfirmationModalProps {
    prompt: string;
    onAccept: () => void;
    onReject: () => void;
}

export default function ConfirmationModal({prompt, onAccept, onReject}: ConfirmationModalProps) {
    const {modal: {closeModal}} = useAppContext()

    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }} className={"w-80 flex flex-col items-center justify-center gap-2 p-4"}>
            <div className={"absolute top-0 right-0 m-4"}>
                <button
                    className={"text-sm text-gray-500 hover:text-gray-700"}
                    onClick={closeModal}>
                    <CloseIcon size={16}/>
                </button>
            </div>
            <div className={"h-2/3 w-full flex flex-col justify-center items-center"}>
                <p className={"text-md text-center"}>{prompt}</p>
            </div>
            <div className={"w-full flex flex-row justify-around items-center gap-4"}>
                <button
                    className={"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"}
                    onClick={onReject}>Cancel
                </button>
                <button
                    className={"px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"}
                    onClick={onAccept}>Confirm
                </button>
            </div>
        </div>
    )
}
