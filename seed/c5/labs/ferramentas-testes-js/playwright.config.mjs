import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './playwright',
  timeout: 15000,
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4571', channel: 'chrome', headless: true, trace: process.env.TRACE ? 'on' : 'off' },
  webServer: { command: 'node servidor-e2e.mjs', url: 'http://127.0.0.1:4571', reuseExistingServer: false, timeout: 15000 }
});
