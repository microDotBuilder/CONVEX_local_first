import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "server/index": "server/index.ts",
    "react/index": "react/index.ts",
  },
  format: ["esm"],
  dts: false,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ["convex", "react", "react-dom"],
});
