export enum PopupType {
    NONE, FULL, HOVER
}

// 1. Define the shape of your state
export interface PopupState {
    type: PopupType;
    // isVisible: boolean;
    text: string;
    changeText: (newText: string) => void;
    onSave: () => void;
    top: number;
    left: number;
}

// 2. Initial state
let state: PopupState = {
    type: PopupType.NONE,
    text: '',
    changeText: (_txt: string) => null,
    onSave: () => null,
    top: 0,
    left: 0,
};

// 3. Simple list of subscribers (for force-updating the React component)
const listeners: (() => void)[] = [];

// 4. Getter
export function getPopupState(): PopupState {
    return state;
}

// 5. Setter
export function updatePopupState(newState: Partial<PopupState>) {
    state = { ...state, ...newState };
    // Notify all listeners that the state has changed
    listeners.forEach(listener => listener());
}

// 6. Subscription mechanism for the component
export function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
        // Return a function to unsubscribe
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
}
