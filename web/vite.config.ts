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
    server: {
        proxy: {
            // This proxies localhost:5173/api/ to localhost:5174
            '/api/': {
                target: 'http://localhost:5174',
                rewrite: (path) => path.replace(/^\/api/, ''),
            }
        }
    }
})
