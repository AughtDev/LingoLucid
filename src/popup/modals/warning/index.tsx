import React from 'react';
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import {IconHoverEffects, WarningIcon} from "../../../constants/icons.tsx";
import useAppContext from "../../context.tsx";

interface WarningsModalProps {
    warnings: string[]
}

interface WarningIconProps {
    size: number
    num_warnings: number
}

export function NumberedWarningIcon({size, num_warnings}: WarningIconProps) {
    return (
        <div className={"relative flex flex-col items-center justify-center"}>
            <div className={"absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3"}>
                <div
                    className={"bg-red-600 rounded-full flex justify-center items-center"}
                    style={{width: size / 1.5, height: size / 1.5,}}>
                    <p
                        className={"text-white font-bold"}
                        style={{
                            fontSize: size ? size / 2.5 : 8,
                            lineHeight: 1,
                        }}>{num_warnings}</p>
                </div>
            </div>
            <IconHoverEffects icon={WarningIcon} size={size} color={"#F78554"}/>
            {/*<WarningIcon size={size} color={"#F78554"}/>*/}
        </div>
    )
}

interface WarningsButtonProps {
    warnings: string[]
    size: number
}

export function WarningsButton({warnings, size}: WarningsButtonProps) {
    const {modal: {openModal}} = useAppContext()

    return (
        <button
            onClick={() => {
                openModal(<WarningsModal warnings={warnings}/>)
            }}>
            <NumberedWarningIcon size={size} num_warnings={warnings.length}/>
        </button>
    )
}

export default function WarningsModal({warnings}: WarningsModalProps) {
    return (
        <div className={"w-full flex flex-col items-center justify-center gap-4 p-2"}>
            {warnings.map((warning, index) => (
                <div
                    style={{
                        backgroundColor: BACKGROUND_COLOR,
                        borderRadius: "12px"
                    }} key={index}
                    className={"relative w-full flex flex-row items-start gap-2 px-2 py-4"}>
                    {/* the warning number */}
                    <div
                        style={{
                            width: 22,
                            height: 22,
                        }}
                        className={"flex flex-col justify-center items-center rounded-full bg-red-400"}>
                        <p className={"text-white font-semibold text-xs"}>{index + 1}</p>
                    </div>
                    <div className={"grow"}>
                        <p className={"text-sm text-gray-700"}>{warning}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
