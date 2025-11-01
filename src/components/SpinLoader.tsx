import React from 'react';
import { SECONDARY_COLOR} from "../constants/styling.ts";

interface SpinLoaderProps {
    size: string | number
    thickness?: string | number
    spinner_color?: string
    track_color?: string
}

export default function SpinLoader({
    size,
    thickness = '4px',
    spinner_color = SECONDARY_COLOR,
    track_color = '#e5e7eb'
}: SpinLoaderProps) {
    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    const thicknessValue = typeof thickness === 'number' ? `${thickness}px` : thickness;

    return (
        <div
            style={{
                width: sizeValue,
                height: sizeValue,
                border: `${thicknessValue} solid ${track_color}`,
                borderTop: `${thicknessValue} solid ${spinner_color}`,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }}
        >
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
