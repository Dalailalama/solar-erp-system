// vite.config.js
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  // Load .env, .env.development, .env.production etc.
  // Third arg '' loads *all* env vars (including non-VITE_ ones) if you ever need them.
  const env = loadEnv(mode, process.cwd(), "");

  const isDev = mode === "development";

  // If you want a single source of truth for dev server url:
  // - put in .env.development: VITE_DEV_SERVER_URL=http://localhost:5173
  // - or leave empty and it will fallback.
  const devServerUrl = env.VITE_DEV_SERVER_URL || "http://localhost:5173";

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router"],
        dirs: [
          "./static/js/core/components/composable",
          "./static/js/core/components/services",
          "./static/js/core/components/utils",
        ],
        dts: false,
        eslintrc: { enabled: false },
      }),
    ],

    // Vue feature flags
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },

    // Vite root: keys in manifest.json are relative to this directory.
    // e.g. static/js/website/app.ts → manifest key: "website/app.ts"
    root: "static/js",

    // Important for Django:
    // - Dev: /static/ (Vite serves static/js/* at /static/*)
    // - Prod: /static/dist/ (manifest-based asset paths)
    base: isDev ? "/static/" : "/static/dist/",

    build: {
      // Relative to root (static/js), so ../../static/dist = static/dist at project root
      outDir: "../../static/dist",
      emptyOutDir: true,
      manifest: true,

      rollupOptions: {
        input: {
          "core/app.js": fileURLToPath(new URL("./static/js/core/app.js", import.meta.url)),
          "core/login_app.js": fileURLToPath(new URL("./static/js/core/login_app.js", import.meta.url)),
          "accounts/UserList.js": fileURLToPath(new URL("./static/js/accounts/UserList.js", import.meta.url)),
          "accounts/Settings.js": fileURLToPath(new URL("./static/js/accounts/Settings.js", import.meta.url)),
          "website/app.ts": fileURLToPath(new URL("./static/js/website/app.ts", import.meta.url)),
          "website/contact_form.js": fileURLToPath(new URL("./static/js/website/contact_form.js", import.meta.url)),
        },
        output: {
          format: "es",
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },

      // I suggest keeping sourcemap off in prod unless you really need it
      sourcemap: isDev,

      minify: "esbuild",
      target: "es2015",
    },

    server: {
      port: 5173,
      host: "0.0.0.0",

      cors: true,

      // This is only used when running the Vite dev server (DJANGO_VITE_DEV_MODE=True)
      // Helps Django know exact origin for HMR/client, especially on LAN/Docker.
      origin: devServerUrl,

      // Optional but useful for Render/Docker/VM file watching
      watch: {
        usePolling: true,
      },

      // If your Django runs on a different port (ex: 8000), you can add:
      // strictPort: true,
    },

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./static/js", import.meta.url)),
        "@core": fileURLToPath(new URL("./static/js/core", import.meta.url)),
        "@components": fileURLToPath(
          new URL("./static/js/core/components", import.meta.url)
        ),
        vue: "vue/dist/vue.esm-bundler.js",
      },
      extensions: [".js", ".ts", ".vue", ".json"],
    },

    optimizeDeps: {
      include: ["vue", "axios"],
    },
  };
});