import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.ts", "src/app.ts"],
  outDir: "lib",
  format: "cjs",
  clean: true,
  dts: false,
  target: "node18",
});
