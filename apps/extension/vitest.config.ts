import {
  defineConfig,
} from "vitest/config";

export default defineConfig({
  test: {
    environment:
      "jsdom",

    globals:
      true,

    clearMocks:
      true,

    restoreMocks:
      true,

    mockReset:
      true,

    setupFiles: [
      "./src/tests/setup.ts",
    ],

    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
    ],
  },
});