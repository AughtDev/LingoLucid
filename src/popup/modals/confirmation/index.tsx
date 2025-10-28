import React from 'react';
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import useAppContext from "../../context.tsx";
import Button from "../../../components/Button.tsx";

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
            }} className={"w-80 flex flex-col items-center justify-center gap-2 px-4 py-6"}>
            <div className={"w-full flex flex-col justify-center items-center pb-4"}>
                <p
                    style={{fontSize: "14px"}}
                    className={"text-center text-gray-800 font-semibold"}>{prompt}</p>
            </div>
            <div className={"w-full flex flex-row justify-around items-center"}>
                <Button variant={"outline"} onClick={() => {
                    onReject()
                    closeModal()
                }} label={"Cancel"}/>

                <Button variant={"solid"} onClick={() => {
                    onAccept()
                    closeModal()
                }} label={"Confirm"}/>
            </div>
        </div>
    )
}
