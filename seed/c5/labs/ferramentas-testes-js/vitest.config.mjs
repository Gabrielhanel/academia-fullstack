import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['vitest/**/*.test.mjs', 'api/**/*.test.mjs'],
    coverage: { provider: 'v8', include: ['src/dominio.mjs', 'src/servico.mjs', 'src/app.mjs'], reporter: ['text-summary', 'text'] }
  }
});
