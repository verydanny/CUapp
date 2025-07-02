import nodeAdapter from '@sveltejs/adapter-node';
// import bunAdapter from '@eslym/sveltekit-adapter-bun';
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
        alias: {
            $root: 'src',
            $layout: 'src/routes/(layout)'
        },
        // ...(!isStorybook
        //     ? {
        //           alias: {
        //               $root: 'src',
        //               $layout: 'src/routes/(layout)',
        //               $types: '.svelte-kit/types/src'
        //           }
        //       }
        //     : {
        //           alias: {
        //               $root: 'src',
        //               $layout: 'src/routes/(layout)'
        //           }
        //       }),
        env: {
            privatePrefix: 'SECRET_',
            publicPrefix: ''
        },
        // adapter: bunAdapter({
        //     bundler: 'bun',
        //     precompress: {
        //         brotli: true,
        //         files: ['htm', 'html', 'css', 'js', 'json', 'svg', 'xml', 'txt', 'md', 'markdown']
        //     },
        //     serveStatic: true,
        //     exportPrerender: false,
        //     bunBuildMinify: {
        //         whitespace: true,
        //         syntax: true,
        //         identifiers: true
        //     }
        // }),
        adapter: nodeAdapter(),
        output: {
            preloadStrategy: 'preload-mjs'
        }
    }
};

export default config;
