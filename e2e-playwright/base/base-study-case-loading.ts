import { Page, expect } from '@playwright/test';

export async function baseStudyCaseLoading(page: Page, studyGroup: string, studyName: string, openWithButton: boolean= true) {
  await page.goto('/');
  // Go to study management
  await page.click('id=main-menu-button');
  await page.hover('id=study-menu-button');
  await page.click('id=study_management-menu-button');

  // Hover on specific row to show actions buttons
  const rowToHover = `id=row-study-management-${studyGroup}-${studyName}`;
  await page.hover(rowToHover);

  if (openWithButton) {
  const loadButton = `id=btn-study-management-load-${studyGroup}-${studyName}`;
  // Start loading of studycase
  await page.click(loadButton);
  } else {
    const loadTitle = `id=title-study-management-load-${studyGroup}-${studyName}`;
    // Start loading of studycase
    await page.click(loadTitle);
  }

  // Check if the study is loaded
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/data/study-case/'))
  ]);
    /***
    * Update 19/10/2022
    * Add log if the status of the response is not 200
    */
  if (response.status() !== 200) {
    const body = await response.body();
    console.log(`Study-loading: ${studyName}\nResponse = ${body} `);
}
  // Verifying correct redirection to study workspace
  await page.waitForURL('**/study-workspace**', { timeout: 90000 });

  // Verifying correct study name for My current study place
  const currentStudyNameTextLocator = page.locator('id=text-sidenav-study-loaded-name');
  await expect(currentStudyNameTextLocator).toHaveText(`: ${studyName}`);

  // Verifying root node is present
  const rootNodeButton = `id=btn-treeview-node-${studyName}`;
  await page.waitForSelector(rootNodeButton);

  // Check readonly mode
  const treeviewTitle = page.locator(`id=text-sidenav-study-loaded-name`);
  await expect(treeviewTitle).toHaveText(`: ${studyName}`);

}
