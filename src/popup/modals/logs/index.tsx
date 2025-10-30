import React from 'react';
import {BACKGROUND_COLOR} from "../../../constants/styling.ts";
import {WarningIcon} from "../../../constants/icons.tsx";
import useAppContext, {Log} from "../../context.tsx";
import NumberedIcon from "../../../components/NumberedIcon.tsx";

interface LogsModalProps {
    warnings: Log[]
    errors: Log[]
}

// interface WarningIconProps {
//     size: number
//     num_warnings: number
// }

// export function NumberedWarningIcon({size, num_warnings}: WarningIconProps) {
//     return (
//         <div className={"relative flex flex-col items-center justify-center"}>
//             <div className={"absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3"}>
//                 <div
//                     className={"bg-red-600 rounded-full flex justify-center items-center"}
//                     style={{width: size / 1.5, height: size / 1.5,}}>
//                     <p
//                         className={"text-white font-bold"}
//                         style={{
//                             fontSize: size ? size / 2.5 : 8,
//                             lineHeight: 1,
//                         }}>{num_warnings}</p>
//                 </div>
//             </div>
//             <IconHoverEffects icon={WarningIcon} size={size} color={"#F78554"}/>
//             {/*<WarningIcon size={size} color={"#F78554"}/>*/}
//         </div>
//     )
// }

interface WarningsButtonProps {
    warnings: Log[]
    errors: Log[]
    size: number
}

export function LogsButton({warnings, errors, size}: WarningsButtonProps) {
    const {modal: {openModal}} = useAppContext()

    const count = warnings.length + errors.length;

    return (
        count > 0 && <button
            onClick={() => {
                openModal(<LogsModal warnings={warnings} errors={errors}/>)
            }}>
            <NumberedIcon
                num={count}
                color={"#f78554"} icon={WarningIcon} size={size}/>
        </button>
    )
}

interface LogDisplayProps {
    type: "warning" | "error"
    log: Log
}

function LogDisplay({type, log}: LogDisplayProps) {
    return (
        <div
            style={{
                backgroundColor: BACKGROUND_COLOR,
                borderRadius: "12px"
            }}
            className={"relative w-full flex flex-row items-start gap-2 px-2 py-4"}>
            <div
                className={`w-2.5 h-2.5 absolute top-2 left-2 rounded-full ${type == "warning" ? "bg-yellow-400" : "bg-red-400"}`}>
                {/*<p className={"text-white font-semibold text-xs"}>{index + 1}</p>*/}
            </div>
            <div className={"w-full px-2 flex flex-col gap-1 justify-center items-center"}>
                <p className={"text-sm text-gray-700 text-center"}>{log.title}</p>
                <hr
                    style={{
                        borderColor: "rgba(0,0,0,0.2)",
                        width: "60%"
                    }}/>
                <p
                    style={{
                        fontSize: "11px"
                    }}
                    className={"text-amber-700 text-center"}>{log.details}</p>
            </div>
        </div>
    )
}

export default function LogsModal({warnings, errors}: LogsModalProps) {
    return (
        <div className={"relative w-full flex flex-col items-center justify-center gap-4 p-2"}>
            {warnings.map((warning, index) => (
                <LogDisplay
                    key={`warning-${index}`}
                    type={"warning"}
                    log={warning}/>
            ))}
            {errors.map((error, index) => (
                <LogDisplay
                    key={`error-${index}`}
                    type={"error"}
                    log={error}/>
            ))}
        </div>
    )
}
