import { Page } from '@playwright/test';

export async function baseStudyCaseGenerateReference(page: Page, studyName: string, processName: string) {
  const rowToHover = `id=row-reference-management-${studyName}-${processName}`;
  const generateRefButton = `id=btn-generate-reference-${studyName}-${processName}`;
  const generateRefStatusPending = `id=execution-bullet-${studyName}-${processName}-PENDING`;
  const generateRefStatusFinished = `id=execution-bullet-${studyName}-${processName}-FINISHED`;

  await page.goto('/');
  // Go to reference management
  await page.click('id=main-menu-button');
  await page.hover('id=study_management-menu-button');
  await page.click('id=reference-menu-button');

  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/data/reference') && resp.status() === 200),
  ]);
  // Research the study to regenerate ref
  await page.click('id=filter-bar');
  await page.fill('id=filter-bar', `${studyName}`);

  // Hover on specific row to show actions buttons
  await page.hover(rowToHover);

  // Start reference generation
  await page.click(generateRefButton);

  // Verify if the generation is pending
  await page.waitForSelector(generateRefStatusPending);

  // Then verify if the generation is finished
  await page.waitForSelector(generateRefStatusFinished);
}
