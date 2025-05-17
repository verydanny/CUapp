// import { mdsvex } from 'mdsvex'
// import adapter from '@sveltejs/adapter-auto'
// import adapter from 'svelte-adapter-bun'
import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
// import type { Config } from '@sveltejs/kit'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [vitePreprocess()],

    compilerOptions: {
        runes: true,
        css: 'external'
    },

    kit: {
        env: { dir: '.' },
        alias: {
            $root: 'src',
            $layout: 'src/routes/(layout)',
            $types: '.svelte-kit/types/src'
        },
        moduleExtensions: ['.svelte', '.ts'],
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        // adapter: adapter({
        //     development: process.env.NODE_ENV === 'development',
        //     precompress: {
        //         brotli: true
        //     }
        // })

        adapter: adapter()
    },

    extensions: ['.svelte']
}

export default config
