import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom', globals: true, setupFiles: ['./setup.mjs'], reporters: ['verbose'] } });
