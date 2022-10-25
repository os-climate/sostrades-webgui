import { Page, expect } from '@playwright/test';

export async function baseStudyCasePostProcessing(page: Page, nodeNameSpace: string, postProcessingTitleList: string[]) {
  // This function consider study case is already loaded

  // Navigating to namespace where we want to check post-processing
  const nodeNameSpaceId = `id=btn-treeview-node-${nodeNameSpace}`;
  await page.click(nodeNameSpaceId);

  // Navigating to post-processing tab
  await page.click('[aria-label="tab-study-workspace-post-processing"]');

  // Navigating to post-processing tab
  await page.click('button:has-text("Update chart(s)")');

  // Waiting for post processing zone to finish loading
  await page.waitForSelector('#zone-post-processing-bundle');

  // Verifying that all post processing title are presents in the page
  await Promise.all(postProcessingTitleList.map(async (ppTitle) => {
    await expect(page.locator('#zone-post-processing-bundle')).toContainText(ppTitle, {timeout: 15000 });
  }));
}
