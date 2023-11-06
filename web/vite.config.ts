import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // Required for top-level await
        target: 'esnext',
    },
    plugins: [svelte(), tsconfigPaths()],
    define: {
      requireFromFile: null,
      'process.platform': null,
      'process.version': null,
      'process.env':{}
    },
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
