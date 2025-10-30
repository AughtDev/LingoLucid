import React from "react";
import {ICON_COLOR, ICON_HOVER_COLOR} from "./styling.ts";
import useAppContext from "../popup/context.tsx";

export interface IconProps {
    size?: number | string;
    color?: string;
}


export function HomeIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
                    stroke-width="1.5" stroke-linecap="round" stroke={color}></path>
                <path d="M15 18H9" stroke-width="1.5" stroke-linecap="round" stroke={color}></path>
            </g>
        </svg>
    )
}

export function SettingsIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <circle cx="12" cy="12" r="3" stroke-width="1.5" stroke={color}></circle>
                <path
                    d="M3.66122 10.6392C4.13377 10.9361 4.43782 11.4419 4.43782 11.9999C4.43781 12.558 4.13376 13.0638 3.66122 13.3607C3.33966 13.5627 3.13248 13.7242 2.98508 13.9163C2.66217 14.3372 2.51966 14.869 2.5889 15.3949C2.64082 15.7893 2.87379 16.1928 3.33973 16.9999C3.80568 17.8069 4.03865 18.2104 4.35426 18.4526C4.77508 18.7755 5.30694 18.918 5.83284 18.8488C6.07287 18.8172 6.31628 18.7185 6.65196 18.5411C7.14544 18.2803 7.73558 18.2699 8.21895 18.549C8.70227 18.8281 8.98827 19.3443 9.00912 19.902C9.02332 20.2815 9.05958 20.5417 9.15224 20.7654C9.35523 21.2554 9.74458 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8478 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.9021C15.0117 19.3443 15.2977 18.8281 15.7811 18.549C16.2644 18.27 16.8545 18.2804 17.3479 18.5412C17.6837 18.7186 17.9271 18.8173 18.1671 18.8489C18.693 18.9182 19.2249 18.7756 19.6457 18.4527C19.9613 18.2106 20.1943 17.807 20.6603 17C20.8677 16.6407 21.029 16.3614 21.1486 16.1272M20.3387 13.3608C19.8662 13.0639 19.5622 12.5581 19.5621 12.0001C19.5621 11.442 19.8662 10.9361 20.3387 10.6392C20.6603 10.4372 20.8674 10.2757 21.0148 10.0836C21.3377 9.66278 21.4802 9.13092 21.411 8.60502C21.3591 8.2106 21.1261 7.80708 20.6601 7.00005C20.1942 6.19301 19.9612 5.7895 19.6456 5.54732C19.2248 5.22441 18.6929 5.0819 18.167 5.15113C17.927 5.18274 17.6836 5.2814 17.3479 5.45883C16.8544 5.71964 16.2643 5.73004 15.781 5.45096C15.2977 5.1719 15.0117 4.6557 14.9909 4.09803C14.9767 3.71852 14.9404 3.45835 14.8478 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74458 2.35523 9.35523 2.74458 9.15224 3.23463C9.05958 3.45833 9.02332 3.71848 9.00912 4.09794C8.98826 4.65566 8.70225 5.17191 8.21891 5.45096C7.73557 5.73002 7.14548 5.71959 6.65205 5.4588C6.31633 5.28136 6.0729 5.18269 5.83285 5.15108C5.30695 5.08185 4.77509 5.22436 4.35427 5.54727C4.03866 5.78945 3.80569 6.19297 3.33974 7C3.13231 7.35929 2.97105 7.63859 2.85138 7.87273"
                    stroke-width="1.5" stroke-linecap="round" stroke={color}></path>
            </g>
        </svg>
    )
}

export function BookIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M4 8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8Z"
                    stroke-width="1.5" stroke={color}></path>
                <path
                    d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235"
                    stroke-width="1.5" stroke={color}></path>
                <path d="M8 7H16" stroke-width="1.5" stroke-linecap="round" stroke={color}></path>
                <path d="M8 10.5H13" stroke-width="1.5" stroke-linecap="round" stroke={color}></path>
            </g>
        </svg>
    )
}

export function ShuffleIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M2 16.25C1.58579 16.25 1.25 16.5858 1.25 17C1.25 17.4142 1.58579 17.75 2 17.75V16.25ZM5.60286 17.75C6.01707 17.75 6.35286 17.4142 6.35286 17C6.35286 16.5858 6.01707 16.25 5.60286 16.25V17.75ZM10.7478 14.087L10.1047 13.7011L10.7478 14.087ZM13.2522 9.91303L13.8953 10.2989L13.2522 9.91303ZM22 7L22.5303 7.53033C22.8232 7.23744 22.8232 6.76256 22.5303 6.46967L22 7ZM19.4697 8.46967C19.1768 8.76256 19.1768 9.23744 19.4697 9.53033C19.7626 9.82322 20.2374 9.82322 20.5303 9.53033L19.4697 8.46967ZM20.5303 4.46967C20.2374 4.17678 19.7626 4.17678 19.4697 4.46967C19.1768 4.76256 19.1768 5.23744 19.4697 5.53033L20.5303 4.46967ZM15.2205 7.3894L14.851 6.73675V6.73675L15.2205 7.3894ZM8.72031 15.7276C8.41765 16.0103 8.40154 16.4849 8.68432 16.7876C8.96711 17.0903 9.44171 17.1064 9.74437 16.8236L8.72031 15.7276ZM2 17.75H5.60286V16.25H2V17.75ZM11.3909 14.4728L13.8953 10.2989L12.6091 9.52716L10.1047 13.7011L11.3909 14.4728ZM18.3971 7.75H22V6.25H18.3971V7.75ZM21.4697 6.46967L19.4697 8.46967L20.5303 9.53033L22.5303 7.53033L21.4697 6.46967ZM22.5303 6.46967L20.5303 4.46967L19.4697 5.53033L21.4697 7.53033L22.5303 6.46967ZM13.8953 10.2989C14.3295 9.57518 14.6286 9.07834 14.9013 8.70996C15.1644 8.35464 15.3692 8.16707 15.59 8.04205L14.851 6.73675C14.384 7.00113 14.0315 7.36397 13.6958 7.8174C13.3697 8.25778 13.0285 8.82806 12.6091 9.52716L13.8953 10.2989ZM18.3971 6.25C17.5819 6.25 16.9173 6.24918 16.3719 6.30219C15.8104 6.35677 15.3179 6.47237 14.851 6.73675L15.59 8.04205C15.8108 7.91703 16.077 7.83793 16.517 7.79516C16.9733 7.75082 17.5531 7.75 18.3971 7.75V6.25ZM10.1047 13.7011C9.42774 14.8294 9.08492 15.3869 8.72031 15.7276L9.74437 16.8236C10.3006 16.3038 10.7639 15.518 11.3909 14.4728L10.1047 13.7011Z"
                    stroke={color}
                ></path>
                <path
                    d="M2 6.25C1.58579 6.25 1.25 6.58579 1.25 7C1.25 7.41421 1.58579 7.75 2 7.75V6.25ZM22 17L22.5303 17.5303C22.8232 17.2374 22.8232 16.7626 22.5303 16.4697L22 17ZM20.5303 14.4697C20.2374 14.1768 19.7626 14.1768 19.4697 14.4697C19.1768 14.7626 19.1768 15.2374 19.4697 15.5303L20.5303 14.4697ZM19.4697 18.4697C19.1768 18.7626 19.1768 19.2374 19.4697 19.5303C19.7626 19.8232 20.2374 19.8232 20.5303 19.5303L19.4697 18.4697ZM16.1254 16.9447L16.2687 16.2086H16.2687L16.1254 16.9447ZM14.4431 14.6141C14.23 14.2589 13.7693 14.1438 13.4141 14.3569C13.0589 14.57 12.9438 15.0307 13.1569 15.3859L14.4431 14.6141ZM14.4684 16.0065L15.0259 15.5049V15.5049L14.4684 16.0065ZM7.8746 7.05526L8.01789 6.31908L7.8746 7.05526ZM9.55688 9.38587C9.76999 9.74106 10.2307 9.85623 10.5859 9.64312C10.9411 9.43001 11.0562 8.96931 10.8431 8.61413L9.55688 9.38587ZM9.53163 7.99346L8.97408 8.49509L8.97408 8.49509L9.53163 7.99346ZM2 7.75H6.66762V6.25H2V7.75ZM17.3324 17.75H22V16.25H17.3324V17.75ZM22.5303 16.4697L20.5303 14.4697L19.4697 15.5303L21.4697 17.5303L22.5303 16.4697ZM21.4697 16.4697L19.4697 18.4697L20.5303 19.5303L22.5303 17.5303L21.4697 16.4697ZM17.3324 16.25C16.6867 16.25 16.4648 16.2467 16.2687 16.2086L15.9821 17.6809C16.3538 17.7533 16.7473 17.75 17.3324 17.75V16.25ZM13.1569 15.3859C13.4579 15.8875 13.6575 16.2267 13.9108 16.5082L15.0259 15.5049C14.8923 15.3564 14.7753 15.1678 14.4431 14.6141L13.1569 15.3859ZM16.2687 16.2086C15.789 16.1152 15.3528 15.8682 15.0259 15.5049L13.9108 16.5082C14.4556 17.1137 15.1826 17.5253 15.9821 17.6809L16.2687 16.2086ZM6.66762 7.75C7.31332 7.75 7.53519 7.75328 7.73131 7.79145L8.01789 6.31908C7.64616 6.24672 7.25267 6.25 6.66762 6.25V7.75ZM10.8431 8.61413C10.5421 8.11245 10.3425 7.77335 10.0892 7.49182L8.97408 8.49509C9.10771 8.64362 9.22467 8.83219 9.55688 9.38587L10.8431 8.61413ZM7.73131 7.79145C8.21098 7.88481 8.64722 8.13181 8.97408 8.49509L10.0892 7.49182C9.54442 6.88635 8.81735 6.47469 8.01789 6.31908L7.73131 7.79145Z"
                    stroke={color}
                ></path>
            </g>
        </svg>
    )
}


export function CloseIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    stroke={color}
                    fill={color}
                    d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                ></path>
            </g>
        </svg>
    )
}

export function SaveIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M4 13V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16M4 8V6C4 4.89543 4.89543 4 6 4H14.1716C14.702 4 15.2107 4.21071 15.5858 4.58579L19.4142 8.41421C19.7893 8.78929 20 9.29799 20 9.82843V12M15 20V15H9V20"
                    stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
        </svg>
    )
}

export function InfoIcon({size, color}: IconProps) {
    return (
        <svg
            height={size} width={size}
            viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path d="M12 17V11" stroke={color} stroke-width="2px" stroke-linecap="round"></path>
                <circle cx="1" cy="1" r="1" transform="matrix(1 0 0 -1 11 9)" fill={color} stroke={color}></circle>
                <path
                    d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                    stroke={color} stroke-width="2px" stroke-linecap="round"></path>
            </g>
        </svg>
    )
}


export function PlayIcon({size, color}: IconProps) {
    return (
        <svg
            height={size} width={size}
            viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M3 12L3 18.9671C3 21.2763 5.53435 22.736 7.59662 21.6145L10.7996 19.8727M3 8L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L14.0026 18.131"
                    stroke={color ?? "#1C274C"} stroke-width="1.5" stroke-linecap="round"></path>
            </g>
        </svg>
    )
}

export function FilledPlayIcon({size, color}: IconProps) {
    return (
        <svg height={size} width={size}
             viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
                    fill={color ?? "#1C274C"}></path>
            </g>
        </svg>
    )
}

export function DeleteIcon({size, color}: IconProps) {
    return (
        <svg height={size} width={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path d="M10 12V17" stroke={color} stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                <path d="M14 12V17" stroke={color} stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                <path d="M4 7H20" stroke={color} stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke={color}
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke={color}
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
        </svg>
    )
}

export function TranslateIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path d="M16.99 8.95996H7.01001" stroke={color ?? "#292D32"} stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                <path d="M12 7.28003V8.96002" stroke={color ?? "#292D32"} stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                <path d="M14.5 8.93994C14.5 13.2399 11.14 16.7199 7 16.7199" stroke={color ?? "#292D32"}
                      stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M16.9999 16.72C15.1999 16.72 13.6 15.76 12.45 14.25" stroke={color ?? "#292D32"}
                      stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                      stroke={color ?? "#292D32"}
                      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
        </svg>
    )
}

export function SimplifyIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M8.71597 3.20277C8.98843 2.93241 9.43017 2.93241 9.70263 3.20277L11.5631 5.04893C11.7626 5.24692 11.8223 5.5447 11.7143 5.8034C11.6063 6.06209 11.352 6.23077 11.0698 6.23077H9.2093C5.99834 6.23077 3.39535 8.81374 3.39535 12C3.39535 15.1862 5.99857 17.7692 9.20956 17.7692H9.67442C10.0597 17.7692 10.3721 18.0792 10.3721 18.4615C10.3721 18.8439 10.0597 19.1538 9.67442 19.1538H9.20956C5.22801 19.1538 2 15.951 2 12C2 8.04904 5.22771 4.84615 9.2093 4.84615H9.38543L8.71597 4.18184C8.44351 3.91148 8.44351 3.47314 8.71597 3.20277Z"
                      fill={color ?? "#292D32"} stroke={color ?? "#292D32"}></path>
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M13.6279 5.53846C13.6279 5.15611 13.9403 4.84615 14.3256 4.84615H14.7907C18.7723 4.84615 22 8.04904 22 12C22 15.951 18.7723 19.1538 14.7907 19.1538H14.6146L15.284 19.8182C15.5565 20.0885 15.5565 20.5269 15.284 20.7972C15.0116 21.0676 14.5698 21.0676 14.2974 20.7972L12.4369 18.9511C12.2374 18.7531 12.1777 18.4553 12.2857 18.1966C12.3937 17.9379 12.648 17.7692 12.9302 17.7692H14.7907C18.0017 17.7692 20.6047 15.1863 20.6047 12C20.6047 8.81374 18.0017 6.23077 14.7907 6.23077H14.3256C13.9403 6.23077 13.6279 5.92081 13.6279 5.53846Z"
                      fill={color ?? "#292D32"} stroke={color ?? "#292D32"}></path>
                <path
                    d="M5.48837 12C5.48837 9.96079 7.15429 8.30769 9.2093 8.30769H14.7907C16.8457 8.30769 18.5116 9.96079 18.5116 12C18.5116 14.0392 16.8457 15.6923 14.7907 15.6923H9.2093C7.15429 15.6923 5.48837 14.0392 5.48837 12Z"
                    fill={color ?? "#292D32"} stroke={color ?? "#292D32"}></path>
            </g>
        </svg>
    )
}

export function WarningIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <circle cx="12" cy="17" r="1" fill={color} stroke={color}></circle>
                <path d="M12 10L12 14" stroke={color} stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                <path
                    d="M3.44722 18.1056L10.2111 4.57771C10.9482 3.10361 13.0518 3.10362 13.7889 4.57771L20.5528 18.1056C21.2177 19.4354 20.2507 21 18.7639 21H5.23607C3.7493 21 2.78231 19.4354 3.44722 18.1056Z"
                    stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
        </svg>
    )
}

export function DownloadIcon({size, color}: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke={color} stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round"></path>
                <path
                    d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                    stroke={color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
        </svg>
    )
}

export interface IconHoverEffectsProps extends IconProps {
    hover_color?: string
    icon: React.ComponentType<IconProps>
}

export function IconHoverEffects({
                                     color = ICON_COLOR,
                                     size,
                                     hover_color = ICON_HOVER_COLOR,
                                     icon: Icon
                                 }: IconHoverEffectsProps) {
    const {modal: {modal_open}} = useAppContext()
    const [hovered, setHovered] = React.useState<boolean>(false)

    const icon_ref = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (modal_open) {
            setHovered(false);
        }
    }, [modal_open]);
    React.useEffect(() => {
        const handleMouseEnter = () => setHovered(true);
        const handleMouseLeave = () => setHovered(false);

        const currentRef = icon_ref.current;
        if (currentRef) {
            currentRef.addEventListener('mouseenter', handleMouseEnter);
            currentRef.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('mouseenter', handleMouseEnter);
                currentRef.removeEventListener('mouseleave', handleMouseLeave);
            }
        }
    }, []);

    return (
        <div ref={icon_ref}>
            <Icon size={size} color={hovered ? hover_color : color}/>
        </div>
    )
}
