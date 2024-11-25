import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'

const clientPort = Number(process?.env?.HMR_PORT) || 443
const host = process?.env?.HOST

export default defineConfig({
    plugins: [sveltekit()],

    server: {
        hmr: {
            clientPort,
            host
        },
        origin: host
    },

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
})
