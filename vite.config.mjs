import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const devServerUrl = env.VITE_DEV_SERVER_URL || "http://127.0.0.1:5173";

  return {
    root: "static/js",

    plugins: [
      vue(),
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          {
            "@core/base.js": ["ErpFramework", "container", "$fx"],
          },
        ],
        dirs: [
          "./core/components/composable",
          "./core/components/services",
          "./core/components/utils",
        ],
        dts: false,
        eslintrc: { enabled: false },
      }),
    ],

    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },

    base: "/static/dist/",

    build: {
      outDir: "../../static/dist",
      emptyOutDir: true,
      manifest: "manifest.json",
      rollupOptions: {
        input: {
          "core/app.js": fileURLToPath(new URL("./static/js/core/app.js", import.meta.url)),
          "core/login_app.js": fileURLToPath(new URL("./static/js/core/login_app.js", import.meta.url)),
          "accounts/user_list_entry.js": fileURLToPath(new URL("./static/js/accounts/user_list_entry.js", import.meta.url)),
          "accounts/settings_entry.js": fileURLToPath(new URL("./static/js/accounts/settings_entry.js", import.meta.url)),
          "video/app.js": fileURLToPath(new URL("./static/js/video/app.js", import.meta.url)),
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
      sourcemap: isDev,
      minify: "esbuild",
      target: "es2015",
    },

    server: {
      port: 5173,
      host: env.VITE_DEV_SERVER_HOST || "127.0.0.1",
      cors: true,
      origin: devServerUrl,
      watch: {
        usePolling: true,
      },
    },

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./static/js", import.meta.url)),
        "@core": fileURLToPath(new URL("./static/js/core", import.meta.url)),
        "@components": fileURLToPath(new URL("./static/js/core/components", import.meta.url)),
        "@fx": fileURLToPath(new URL("./static/js/core/framework/index.js", import.meta.url)),
        vue: "vue/dist/vue.esm-bundler.js",
      },
      extensions: [".js", ".ts", ".vue", ".json"],
    },

    optimizeDeps: {
      include: ["vue", "axios"],
    },
  };
});


