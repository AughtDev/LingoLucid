import React from 'react';
import {IconHoverEffects, IconHoverEffectsProps} from "../constants/icons.tsx";

interface NumberedIconProps extends Omit<IconHoverEffectsProps,"size"> {
    num: number
    size?: number
}

export default function NumberedIcon({num,...props} : NumberedIconProps) {
    const size = props.size || 24
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
                        }}>{num}</p>
                </div>
            </div>
            <IconHoverEffects {...props}/>
        </div>
    )
 }
