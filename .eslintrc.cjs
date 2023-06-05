module.exports = {
    env: {
        browser: true,
        node: true,
    },
    globals: {
        // I don't know why this doesn't get detected (?)
        GeoJSON: true,
    },
    rules: {
        // This makes lines like let x: number = 5; valid. I *do* want the type there even if it's obvious!
        '@typescript-eslint/no-inferrable-types': 'off',
        // This allows you to use @ts-ignore as long as it's followed by a colon and a description
        '@typescript-eslint/ban-ts-comment': [
            'error',
            {'ts-ignore': 'allow-with-description'},
        ],
    },
    ignorePatterns: ['vite.config.ts', 'dist/*', 'svelte.config.js', 'node_modules/*', '.eslintrc.cjs'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', "plugin:svelte/recommended"],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: "tsconfig.eslint.json",
        extraFileExtensions: [".svelte"], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
    },
    overrides: [
        {
            files: ["*.svelte"],
            parser: "svelte-eslint-parser",
            // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
            parserOptions: {
                parser: "@typescript-eslint/parser",
            },
        },
    ],
    plugins: ['@typescript-eslint'],
    root: true,
};
