import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Target a specific environment that supports top-level await
    target: "esnext",
  },
});
