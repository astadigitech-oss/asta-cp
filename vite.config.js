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
        // Target ES2020+ — tidak inject polyfill Array.at, findLast, dll
        // yang sudah native di semua browser modern sejak 2022
        target: 'es2020',
        chunkSizeWarningLimit: 1000,
        // Minify lebih agresif
        minify: 'esbuild',
        rollupOptions: {
            output: {
                // Nama file yang predictable untuk caching
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
                manualChunks(id) {
                    // React core — paling critical, dimuat duluan
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                        return 'vendor-react';
                    }
                    // Motion — lazy loaded via LazyMotion, boleh chunk tersendiri
                    if (id.includes('node_modules/motion')) {
                        return 'vendor-motion';
                    }
                    // Lucide icons — sering dipakai tapi bisa split
                    if (id.includes('node_modules/lucide-react')) {
                        return 'vendor-icons';
                    }
                    // TanStack (router + query)
                    if (id.includes('node_modules/@tanstack')) {
                        return 'vendor-tanstack';
                    }
                    // Radix UI
                    if (id.includes('node_modules/@radix-ui')) {
                        return 'vendor-radix';
                    }
                    // Axios
                    if (id.includes('node_modules/axios')) {
                        return 'vendor-axios';
                    }
                    // React Hook Form + resolvers
                    if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
                        return 'vendor-forms';
                    }
                    // Google Maps
                    if (id.includes('node_modules/@googlemaps')) {
                        return 'vendor-maps';
                    }
                },
            },
        },
    },
    // Optimisasi deps yang sering berubah
    optimizeDeps: {
        include: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query'],
        exclude: ['motion'],
    },
});