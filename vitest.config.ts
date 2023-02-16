import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/*.{test,spec}.ts"],
    exclude: [...configDefaults.exclude, "client/**"],
  },
});
