import { Page, expect } from "@playwright/test";

export async function baseStudyCaseGenerateReference(page: Page, studyName: string, repositoryName: string) {
  const rowToHover = `id=row-reference-management-${studyName}-${repositoryName}`;
  const generate_ref_button = `id=btn-generate-reference-${studyName}-${repositoryName}`;
  const generate_ref_status = `id=execution-bullet-${studyName}-${repositoryName}-DONE`;
  await page.goto('/');
  // Go to study management
  await page.click('id=main-menu-button');
  await page.hover('id=study_management-menu-button');
  // Go to reference management
  await page.click('id=reference-menu-button');
  // Research the study to regenerate ref
  await page.click('id=filter-bar');
  await page.fill('id=filter-bar', `${studyName}`);
  // Hover on specific row to show actions buttons
  await page.hover(rowToHover);
  // Start reference generation
  await page.click(generate_ref_button);
  await page.waitForSelector(generate_ref_status)
}
