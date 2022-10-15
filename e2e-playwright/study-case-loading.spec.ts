import { test } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';


test('Test loading -> Generic Value Assessment Repository -> test_ratatouille_e2e', async ({ page }) => {
  const studyName = 'test_ratatouille_e2e';
  await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

  // List of nodes to tests
  const namespacesList = [
    `${studyName}.OpEx`,
    `${studyName}.CapEx`,
    `${studyName}.Business_Manufacturer`,
    `${studyName}.Ratatouille`,
    `${studyName}.Tomato sauce`,
  ];

  // Verifying that all nodes are presents in the page
  await Promise.all(namespacesList.map(async (nsp) => {
    await page.waitForSelector(`id=btn-treeview-node-${nsp}`, { timeout: 10000 });
  }));
});


test('Test loading by click on title-> Core Test Sellar Opt with Func Manager Multi Scenario -> test_sellar_opt_ms', async ({ page }) => {
  const studyName = 'test_sellar_opt_ms';
  const node = 'multi_scenarios';
  await baseStudyCaseLoading(page, 'group_test_e2e', studyName, false);

  // List of nodes to tests
  const namespacesList = [
    `${studyName}.${node}.scenario_1`,
    `${studyName}.${node}.scenario_2`,
    `${studyName}.${node}.scenario_3`,
    `${studyName}.${node}.scenario_4`,
    `${studyName}.${node}.scenario_5`,
    `${studyName}.${node}.scenario_6`,
    `${studyName}.${node}.scenario_7`,
    `${studyName}.${node}.scenario_8`,
    `${studyName}.${node}.scenario_9`,
    `${studyName}.${node}.scenario_10`
  ];

  /**
   * Update 14/09/2022
   * Check if the chevron of node "multi_scenarios" in the treeview is already open or down.
   */
  const iconChevron = page.locator(`id="chevron-right-${studyName}.${node}"`);
  if (iconChevron.isVisible()) {

    // Click on multi_scenarios node
    const clickOnNode = page.locator(`id=btn-treeview-expand-${studyName}.${node}`);
    await clickOnNode.click();

    // Verifying that all nodes are presents in the page
    await Promise.all(namespacesList.map(async (nsp) => {
      await page.waitForSelector(`id=btn-treeview-node-${nsp}`, { timeout: 10000 });
    }));

    // close expandable node
    await clickOnNode.click();

  } else {
    // Verifying that all nodes are presents in the page
    await Promise.all(namespacesList.map(async (nsp) => {
      await page.waitForSelector(`id=btn-treeview-node-${nsp}`, { timeout: 10000 });
    }));
  }
});
