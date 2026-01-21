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
      external: (id: string) => {
        // Externalize server-side modules
        return (
          id.includes("@trpc/server") ||
          id === "express" ||
          id === "drizzle-orm" ||
          id.includes("node_modules") && (
            id.includes("@trpc/server") ||
            id.includes("express")
          )
        );
      },
      output: {
        manualChunks: undefined,
      },
    },
  },
});
