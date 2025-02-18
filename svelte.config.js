// import { mdsvex } from 'mdsvex'
// import adapter from '@sveltejs/adapter-auto'
// import adapter from 'svelte-adapter-bun'
import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [
        vitePreprocess()
        // mdsvex()
    ],
    compilerOptions: {
        runes: true
    },

    kit: {
        alias: {
            $routes: './src/routes'
        },
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        // adapter: adapter({
        //     development: process.env.NODE_ENV === 'development',
        //     precompress: {
        //         brotli: true
        //     }
        // })

        adapter: adapter(),
        csrf: {
            checkOrigin: process.env.NODE_ENV === 'production'
        }
    },

    extensions: ['.svelte', '.svx']
}

export default config
