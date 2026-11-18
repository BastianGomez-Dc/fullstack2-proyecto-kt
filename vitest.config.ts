import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// Tests unitarios (API/auth) + tests de componentes con jsdom y React Testing Library.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      // Umbral global: la cobertura se mide sobre el código fuente real de src/.
      thresholds: { lines: 30, statements: 30, functions: 30, branches: 30 },
    },
  },
});
