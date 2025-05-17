import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'

import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    const _clientPort = Number(env?.VITE_HMR_PORT) || 443
    const _host = env?.VITE_HOST

    return {
        plugins: [sveltekit(), tailwindcss()],
        esbuild: {
            target: 'esnext'
        },
        // Target only modern browsers (Chrome)
        build: {
            target: 'esnext',
            minify: 'esbuild',
            sourcemap: false,
            cssMinify: 'lightningcss',
            modulePreload: {
                polyfill: false
            }
        },

        server: {
            hmr: {
                overlay: false
            },
            watch: {
                usePolling: false
            },
            fs: {
                strict: false
            },
            warmup: {
                clientFiles: ['./src/**/*.{.svelte, ts, js}']
            }
        },

        // Faster dependency optimization
        optimizeDeps: {
            exclude: [], // Dependencies that should not be pre-bundled
            esbuildOptions: {
                target: 'esnext',
                supported: {
                    bigint: true,
                    'import-meta': true
                }
            }
        },

        // Faster resolve operations
        resolve: {
            extensions: ['.svelte', '.js', '.ts'] // Limit file extensions to search
        }

        // server: {
        //     hmr: {
        //         clientPort,
        //         host
        //     },
        //     origin: `https://${host}`
        // }

        // test: {
        //     include: ['src/**/*.{test,spec}.{js,ts}']
        // }
    }
})
