import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.tsx'],
            refresh: true,
        }), 
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        // Target ES2020+ agar Vite tidak inject polyfill Array.at, findLast, dll
        // yang sudah native di semua modern browser sejak 2022
        target: 'es2020',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Split motion/react menjadi chunk terpisah (lazy load friendly)
                    if (id.includes('node_modules/motion')) {
                        return 'vendor-motion';
                    }
                    // Split lucide icons
                    if (id.includes('node_modules/lucide-react')) {
                        return 'vendor-icons';
                    }
                    // Split tanstack router + query
                    if (id.includes('node_modules/@tanstack')) {
                        return 'vendor-tanstack';
                    }
                    // Split radix UI
                    if (id.includes('node_modules/@radix-ui')) {
                        return 'vendor-radix';
                    }
                    // React core
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                },
            },
        },
    },
});