import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            // Global imports to register
            imports: [
                'vue',
                'vue-router',
                // Custom composables autodiscovery could go here, 
                // but explicit directory mapping is safer for now.
            ],
            // Auto-import composables from these directories
            dirs: [
                './core/components/composable',
                './core/components/services',
                './core/components/utils'
            ],
            // Check for changes in these files for hot updates
            dts: false, // Disable TS declaration file generation to keep it simple for JS
            eslintrc: {
                enabled: false,
            },
        })
    ],

    // Define Vue feature flags
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },

    // Set the root to the JS source directory
    root: 'static/js',

    // Base public path
    base: '/static/',

    // Build configuration
    build: {
        // Output directory relative to root
        outDir: '../../static/dist',

        // Empty output directory before build
        emptyOutDir: true,

        // Generate manifest for Django integration
        manifest: true,

        // Rollup options
        rollupOptions: {
            // Entry point for the application
            input: {
                app: fileURLToPath(new URL('./static/js/core/app.js', import.meta.url)),
                login: fileURLToPath(new URL('./static/js/core/login_app.js', import.meta.url)),
                user_list: fileURLToPath(new URL('./static/js/accounts/UserList.js', import.meta.url)),
                settings: fileURLToPath(new URL('./static/js/accounts/Settings.js', import.meta.url)),
                website: fileURLToPath(new URL('./static/js/website/app.ts', import.meta.url)),
                contact_form: fileURLToPath(new URL('./static/js/website/contact_form.js', import.meta.url))
            },
            output: {
                // Output format
                format: 'es',
                // Asset file names
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },

        // Source maps for debugging
        sourcemap: true,

        // Minification
        minify: 'esbuild',

        // Target browsers
        target: 'es2015'
    },

    // Development server configuration
    server: {
        port: 5173,
        host: 'localhost',

        // CORS for Django integration
        cors: true,

        // Serve static files
        origin: 'http://localhost:5173',

        // Watch options
        watch: {
            usePolling: true
        }
    },

    // Resolve configuration
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./static/js', import.meta.url)),
            '@core': fileURLToPath(new URL('./static/js/core', import.meta.url)),
            '@components': fileURLToPath(new URL('./static/js/core/components', import.meta.url)),
            // Use full build with runtime compiler for template strings
            'vue': 'vue/dist/vue.esm-bundler.js'
        },
        extensions: ['.js', '.ts', '.vue', '.json']
    },

    // Optimize dependencies
    optimizeDeps: {
        include: ['vue', 'axios']
    }
});
