import React from 'react';
import {PRIMARY_COLOR} from "../constants/styling.ts";

interface ProgressLoaderProps {
    progress: number; // progress value between 0 and 1
    color?: string; // color of the progress bar
    height?: string | number
    width?: string | number
}

export default function ProgressLoader({progress,color = PRIMARY_COLOR,height = "8px",width = "100%"} : ProgressLoaderProps) {
    return (
        <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{width: width, height: height}}>
            <div
                className="h-full transition-all duration-500 ease-in-out"
                style={{
                    width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
                    backgroundColor: color,
                }}
            />
        </div>
    )
 }
