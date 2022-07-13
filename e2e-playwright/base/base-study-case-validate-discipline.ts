import { Page, expect } from '@playwright/test';

export async function baseStudyCaseValidateDiscipline(page: Page, studyName: string) {
  // This function consider study case is already loaded
  // Test Validation
  await page.click('id=validation-page');
  await page.click('id=validate-data');
  await page.click('id=show-validation-state');
  // Verifying root node is validated
  const validatedNode = `id=node-validated-${studyName}`;
  await page.waitForSelector(validatedNode, { timeout: 30000 });
  // Test Invalidation
  await page.click('id=validation-page');
  await page.click('id=validate-data');
  // Verifying root node is unvalidated
  const invalidatedNode = `id=node-invalidated-${studyName}`;
  await page.waitForSelector(invalidatedNode, { timeout: 30000 });
}
