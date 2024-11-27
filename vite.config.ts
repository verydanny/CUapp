import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'

import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    const clientPort = Number(env?.VITE_HMR_PORT) || 443
    const host = env?.VITE_HOST

    return {
        plugins: [sveltekit()],

        server: {
            hmr: {
                clientPort,
                host
            },
            origin: `https://${host}`
        }

        // test: {
        //     include: ['src/**/*.{test,spec}.{js,ts}']
        // }
    }
})
