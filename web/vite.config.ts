import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/",
  build: {
    target: "esnext",
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          // Built by curlconverter's prepare script
          src: "node_modules/curlconverter/dist/tree-sitter-bash.wasm",
          dest: ".",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["web-tree-sitter"],
  },
});
