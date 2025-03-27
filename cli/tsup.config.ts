import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: ["fs-extra", "chalk", "prompts", "axios"], // Mark dependencies as external
  platform: "node",
  shims: true,
});
