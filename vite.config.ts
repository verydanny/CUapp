/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

// import { loadEnv } from 'vite';

export default defineConfig(({ mode: _mode }) => {
    // const env = loadEnv(mode, process.cwd());
    // const _clientPort = Number(env['VITE_HMR_PORT']) || 443;
    // const _host = env['VITE_HOST'];

    return {
        plugins: [sveltekit(), tailwindcss()],

        // Faster resolve operations
        resolve: {
            extensions: ['.svelte', '.js', '.ts'] // Limit file extensions to search
        },

        test: {
            include: ['src/**/*.{test,spec}.{js,ts}'],
            browser: {
                provider: 'playwright',
                enabled: true,
                headless: true,
                instances: [{ browser: 'chromium' }]
            }
        },

        optimizeDeps: {
            exclude: ['clsx']
        }

        // server: {
        //     hmr: {
        //         clientPort,
        //         host
        //     },
        //     origin: `https://${host}`
        // }
    };
});
