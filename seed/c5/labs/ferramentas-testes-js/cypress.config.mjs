import { defineConfig } from 'cypress';
export default defineConfig({
  e2e: { baseUrl: 'http://127.0.0.1:4571', specPattern: 'cypress/e2e/**/*.cy.js', supportFile: false, video: false, screenshotOnRunFailure: false, defaultCommandTimeout: 4000 }
});
