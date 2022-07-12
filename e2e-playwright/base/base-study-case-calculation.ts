import { Page, expect } from '@playwright/test';

export async function baseStudyCaseStartCalculation(page: Page, studyName: string) {
  // This function consider study case is already loaded

  // Launch calculation
  const startCalculationId = `id=btn-treeview-start-calculation`;
  await page.click(startCalculationId);

  // Verify study case successfully submitted after run clicked
  const snackBarLocator = page.locator('snack-bar-container');
  await expect(snackBarLocator).toHaveText(/Study case successfully submitted/, { timeout: 15000 });

  // Verify root node status change to running
  const rootNodeStatusLocator = page.locator(`id=text-treeview-status-${studyName}`);
  await expect(rootNodeStatusLocator).toHaveText(/R/, { timeout: 15000 });

  // Verify stop calculation button visible on page
  await page.waitForSelector('id=btn-treeview-stop-calculation', { timeout: 15000 });
}
