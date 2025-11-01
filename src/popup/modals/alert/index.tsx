import React from 'react';
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";

interface AlertModalProps {
    title: string
    details: string
}

export default function AlertModal({title,details} : AlertModalProps) {
    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }} className={"w-80 flex flex-col items-center justify-center gap-2 px-4 py-6"}>
            <div className={"w-full flex flex-col justify-center items-center pb-4 gap-4"}>
                <h2
                    style={{fontSize: "16px"}}
                    className={"text-center text-gray-900 font-bold"}>{title}</h2>
                <p
                    style={{fontSize: "14px"}}
                    className={"text-center text-gray-800 font-semibold"}>{details}</p>
            </div>
        </div>
    )
 }
