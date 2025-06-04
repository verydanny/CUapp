await Bun.build({
    entrypoints: ['build/index.js'],
    outdir: 'build/bun',
    minify: {
        identifiers: true,
        syntax: true,
        whitespace: true
    },
    sourcemap: 'external',
    target: 'bun',
    format: 'esm',
    packages: 'external'
});
