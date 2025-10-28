import React from 'react';
import {ProficiencyLevel} from "../types/core.ts";

interface ProficiencyBadgeProps {
    proficiency: ProficiencyLevel
    size: number
}

export default function ProficiencyBadge({proficiency, size}: ProficiencyBadgeProps) {
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

    return (
        <div className={"flex justify-center items-center"}>
            <p className={"font-semibold"}
               style={{
                   fontSize: size,
                   color: color,
               }}>
                {label}
            </p>
        </div>
    )
}
