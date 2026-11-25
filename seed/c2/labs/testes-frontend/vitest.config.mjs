import { defineConfig } from 'vitest/config';
export default defineConfig({ esbuild: { jsx: 'automatic' }, test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setup.js'], coverage: { provider: 'v8', include: ['src/*.jsx'], exclude: ['src/*.test.jsx'] } } });
