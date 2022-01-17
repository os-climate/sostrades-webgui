import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {

  const { baseURL, storageState } = config.projects[0].use;

  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // Go to base URL (set by environment variable)
  await page.goto(`${baseURL}/login`);
  // Fill input[name="username"]
  await page.fill('id=input-login-username', process.env.USERNAME_TEST);
  // Fill input[name="password"]
  await page.fill('id=input-login-password', process.env.USERNAME_PASSWORD);
  // Press Enter
  await Promise.all([
    page.click('id=btn-login-log-in'),
    page.waitForNavigation(),
  ]);

  // Save signed-in state to 'storageState.json'.
  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

export default globalSetup;
