// vite-env.d.ts or src/vite-env.d.ts

/// <reference types="vite/client" />

declare module '*.css?inline' {
    const content: string;
    export default content;
}

declare module '*.svg?inline' {
    const content: string;
    export default content;
}

// You can add other inline assets here like '*.svg?raw', etc.
