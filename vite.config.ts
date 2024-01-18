import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // Required for top-level await
        target: 'esnext',
    },
    worker: { format: 'es' },
    plugins: [svelte(), tsconfigPaths()],
    resolve: {
        alias: {
            'node-fetch': 'isomorphic-fetch',
        },
    },
    // Prevent Vite from reloading the first time Pyodide is requested,
    // which is annoying as it cancels the custom scenario calculation.
    optimizeDeps: {
        exclude: ['pyodide', 'node-fetch'],
    }
})
