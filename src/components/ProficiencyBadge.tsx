import React from 'react';
import {ProficiencyLevel} from "../types/core.ts";

interface ProficiencyBadgeProps {
    proficiency: ProficiencyLevel
    size: number
    variant?: "solid" | "ghost"
    tooltip_label?: string
}

export default function ProficiencyBadge({proficiency, size, variant = "ghost", tooltip_label}: ProficiencyBadgeProps) {
    const {color, label} = React.useMemo(() => {
        switch (proficiency) {
            case "a1":
                return {color: "#6B7280", label: "A1"};
            case "a2":
                return {color: "#10B981", label: "A2"};
            case "b1":
                return {color: "#3B82F6", label: "B1"};
            case "b2":
                return {color: "#8B5CF6", label: "B2"};
            case "c1":
                return {color: "#F59E0B", label: "C1"};
            case "c2":
                return {color: "#EF4444", label: "C2"};
            default:
                return {color: "#6B7280", label: "N/A"};
        }
    }, [proficiency]);

    const {bg, col} = React.useMemo(() => {
        switch (variant) {
            case "solid":
                return {bg: color, col: "#FFFFFF"};
            case "ghost":
                return {bg: "transparent", col: color};
            default:
                return {bg: color, col: "#FFFFFF"};
        }
    }, [variant, color]);

    return (
        <div
            style={{
                backgroundColor: bg,
                padding: size / 4,
                borderRadius: size / 2,
                lineHeight: 1,
            }}
            className={"relative flex justify-center items-center overflow-hidden"}>
            <div
                style={{
                    cursor: "pointer",
                }}
                title={tooltip_label}
                className={"absolute z-50 w-full h-full top-0 left-0"}/>
            <p
                className={"font-semibold"}
                style={{
                    fontSize: size,
                    color: col,
                }}>
                {label}
            </p>
        </div>
    )
}
