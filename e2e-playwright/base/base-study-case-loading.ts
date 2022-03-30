import { Page, expect } from "@playwright/test";

export async function baseStudyCaseLoading(page: Page, studyGroup: string, studyName: string) {
  await page.goto('/');
  // Go to study management
  await page.click('id=main-menu-button');
  await page.click('id=study_management-menu-button');
  await page.click('id=study_case-menu-button');
  

  // Hover on specific row to show actions buttons
  const rowToHover = `id=row-study-management-${studyGroup}-${studyName}`;
  await page.hover(rowToHover);

  const loadButton = `id=btn-study-management-load-${studyGroup}-${studyName}`;
  // Start loading of studycase
  await page.click(loadButton);

  // Verifying correct redirection to study workspace
  await page.waitForURL('/study-workspace');

  // Verifying correct study name for My current study place
  const currentStudyNameTextLocator = page.locator('id=text-sidenav-study-loaded-name');
  await expect(currentStudyNameTextLocator).toHaveText(`: ${studyName}`);

  // Verifying root node is present
  const rootNodeButton = `id=btn-treeview-node-${studyName}`;
  await page.waitForSelector(rootNodeButton);
}
