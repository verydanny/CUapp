import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isStorybook = !!(process.env.STORYBOOK === 'true');


/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: [vitePreprocess()],

    compilerOptions: {
        preserveComments: false,
        preserveWhitespace: false,
        runes: !isStorybook,
        css: 'external'
    },

    kit: {
        ...(!isStorybook ? {
            alias: {
                $root: 'src',
                $layout: 'src/routes/(layout)',
                $types: '.svelte-kit/types/src'
            }
        } : {
            alias: {
                $root: 'src',
                $layout: 'src/routes/(layout)',
            }
        }),
        adapter: adapter(),
        output: {
            preloadStrategy: 'preload-mjs'
        }
    }
};

export default config;
