// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 300000,
  globalTimeout: 0,
  reporter: 'list',
  testDir: 'e2e-playwright',
  globalSetup: require.resolve('./global-setup'),
  use: {
    // Tell all tests to load signed-in state from 'storageState.json'.
    storageState: 'storageState.json',
    baseURL: process.env.BASE_URL_TEST,
    launchOptions: {
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
/*       headless: false,
      slowMo: 200, */
    },
    ignoreHTTPSErrors: true
  }
};
export default config;
