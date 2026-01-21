import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "@trpc/server/observable",
        "@trpc/server/shared",
        "@trpc/server",
        "express",
      ],
      onwarn(warning, warn) {
        // Suppress warnings for external modules
        if (warning.code === 'EXTERNAL_NO_RESOLVABLE_ID') {
          return;
        }
        warn(warning);
      },
    },
  },
});
