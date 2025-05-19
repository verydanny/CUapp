// import { mdsvex } from 'mdsvex'
// import adapter from '@sveltejs/adapter-auto'
// import adapter from 'svelte-adapter-bun'
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
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
        alias: {
            $root: 'src',
            $layout: 'src/routes/(layout)',
            $types: '.svelte-kit/types/src'
        },
        adapter: adapter()
    }
};

export default config;
