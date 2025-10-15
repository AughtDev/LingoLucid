import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    resolve: {
        extensions: ['.ts','.tsx'],
    },
    plugins: [
        react(),
        crx({ manifest }),
        tailwindcss()
    ],
})
