import React from 'react';
import { IconProps} from "../constants/icons.tsx";
import useAppContext from "../popup/context.tsx";
import ConfirmationModal from "../popup/modals/confirmation";
import SpinLoader from "./SpinLoader.tsx";
import {
    ICON_COLOR,
    ICON_DISABLED_COLOR,
    ICON_HOVER_COLOR,
    PRIMARY_COLOR,
    SECONDARY_COLOR
} from "../constants/styling.ts";

interface ButtonProps {
    label?: string
    icon?: React.ComponentType<IconProps>
    variant: "outline" | "solid" | "icon" | "ghost"
    confirmation_prompt?: string
    onClick: () => void | Promise<void>
    size?: number,
    tooltip_label?: string
    style?: React.CSSProperties
    class_name?: string
    disabled?: boolean
}

interface ButtonStyling {
    // background color
    bg: string,
    // border thickness
    b: number,
    // border color
    bc: string,
    // text color
    tc: string,
    // padding y
    py: number,
    // padding x
    px: number,
    // font size
    fs: number,
    // border radius
    br: number,
    // icon size
    is: number,
    ic: string
}

export default function Button({
                                   label,
                                   icon: Icon,
                                   size = 14,
                                   tooltip_label,
                                   variant,
                                   confirmation_prompt,
                                   onClick,
                                   style,
                                   class_name,
    disabled
                               }: ButtonProps) {
    if (!Icon && !label) {
        throw new Error("Button component requires at least an icon or a label.");
    }

    const button_ref = React.useRef<HTMLButtonElement | null>(null);
    const {modal: {openModal}} = useAppContext()
    const [loading, setLoading] = React.useState<boolean>(false)
    const [hovering, setHovering] = React.useState<boolean>(false)

    const onClickHandler = React.useCallback(() => {
        // if confirmation_prompt is set, show a confirmation dialog
        if (confirmation_prompt) {
            openModal(
                <ConfirmationModal
                    prompt={confirmation_prompt}
                    onAccept={onClick}
                    onReject={() => {
                    }}/>
            )
        } else {
            // if a promise, set loading state
            const result = onClick();
            if (result instanceof Promise) {
                setLoading(true);
                result.finally(() => {
                    setLoading(false);
                });
            }
        }
    }, [confirmation_prompt, openModal, onClick, setLoading]);

    // on hover
    React.useEffect(() => {
        const button_elem = button_ref.current;
        if (!button_elem) return;

        const handleMouseEnter = () => setHovering(true);
        const handleMouseLeave = () => setHovering(false);

        button_elem.addEventListener("mouseenter", handleMouseEnter);
        button_elem.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button_elem.removeEventListener("mouseenter", handleMouseEnter);
            button_elem.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [button_ref, setHovering]);

    const {
        bg, b, bc, tc, py, px, fs, br, is, ic
    }: ButtonStyling = React.useMemo(() => {
        const base_color = !disabled ? (hovering ? PRIMARY_COLOR : SECONDARY_COLOR) : '#666';
        const default_styling: ButtonStyling = {
            bg: base_color,
            b: 0,
            bc: 'transparent',
            tc: '#fff',
            py: size / 2,
            px: size,
            fs: size,
            br: size,
            is: size,
            ic: !disabled ? hovering ? ICON_HOVER_COLOR : ICON_COLOR : ICON_DISABLED_COLOR,
        }

        switch (variant) {
            case "solid":
                return {
                    ...default_styling,
                    py: size / 2 + 4,
                    px: size + 4,
                };
            case "outline":
                return {
                    ...default_styling,
                    bg: 'transparent',
                    b: 2,
                    bc: base_color,
                    tc: base_color,
                };
            case "icon":
                return {
                    ...default_styling,
                    bg: 'transparent',
                    px: 1, py: 1,
                };
            case "ghost":
                return {
                    ...default_styling,
                    bg: 'transparent',
                    tc: base_color
                };
            default:
                return default_styling;
        }
    }, [variant, hovering, size, disabled]);

    return (
        <button
            ref={button_ref}
            onClick={onClickHandler}
            className={class_name}
            title={tooltip_label}
            disabled={disabled}
            style={{
                backgroundColor: bg,
                borderWidth: `${b}px`,
                borderColor: bc,
                paddingTop: `${py}px`,
                paddingBottom: `${py}px`,
                paddingLeft: `${px}px`,
                paddingRight: `${px}px`,
                borderRadius: `${br}px`,
                ...style
            }}>
            <div className={"flex flex-row justify-center items-center gap-2"}>
                {label && <p
                    style={{
                        color: tc,
                        fontSize: `${fs}px`,
                        fontWeight: 500,
                    }}>
                    {label}
                </p>}
                {loading ? <SpinLoader size={`${is}px`}/> : Icon ? (
                    <Icon color={ic} size={`${is}px`}/>
                ) : null}
            </div>
        </button>
    )
}
