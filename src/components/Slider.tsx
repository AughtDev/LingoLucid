import React, {useRef, useState} from 'react';
import {PRIMARY_COLOR, SECONDARY_COLOR} from '../constants/styling';

interface ValueSliderProps<T> {
    val: T
    setVal: (newVal: T) => void
    options: {
        label: string
        value: T
    }[]
    // visible options indexes, by default all options are visible
    visible_options: number[]
}

export function Slider<T>({val, setVal, options, visible_options}: ValueSliderProps<T>) {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const currentIndex = options.findIndex(opt => opt.value === val);
    const totalOptions = options.length;

    const handleInteraction = React.useCallback((clientX: number) => {
        if (!trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));

        // Calculate the closest option index
        const index = Math.round(percentage * (totalOptions - 1));
        const newValue = options[index].value;

        setVal(newValue);
    }, [options, totalOptions]);

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientX);
    }, [handleInteraction]);

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (isDragging) {
            handleInteraction(e.clientX);
        }
    }, [isDragging, handleInteraction]);

    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    const thumbPosition = React.useMemo(() => {
        return totalOptions > 1 ? (currentIndex / (totalOptions - 1)) * 100 : 0;
    }, [currentIndex, totalOptions]);


    return (
        <div className="slider-container">
            <div
                ref={trackRef}
                className={`slider-track ${isDragging ? 'dragging' : ''} ${isHovering ? 'hovering' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                    backgroundColor: SECONDARY_COLOR,
                }}
            >
                {/* Markers for each option */}
                {options.map((_, index) => {
                    const position = totalOptions > 1 ? (index / (totalOptions - 1)) * 100 : 50;
                    return (
                        <div
                            key={index}
                            className="slider-marker"
                            style={{
                                left: `${position}%`,
                            }}
                        />
                    );
                })}

                {/* Thumb */}
                <div
                    className={`slider-thumb ${isDragging ? 'dragging' : ''} ${isHovering ? 'hovering' : ''}`}
                    style={{
                        left: `${thumbPosition}%`,
                        backgroundColor: PRIMARY_COLOR,
                    }}
                />
            </div>

            {/* Labels */}
            <div className="slider-labels">
                {options.map((option, index) => {
                    const position = totalOptions > 1 ? (index / (totalOptions - 1)) * 100 : 50;
                    const isVisible = visible_options.includes(index);

                    return (
                        <div
                            key={index}
                            className={`slider-label ${isVisible ? '' : 'hidden'}`}
                            style={{
                                left: `${position}%`,
                            }}
                        >
                            {option.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
