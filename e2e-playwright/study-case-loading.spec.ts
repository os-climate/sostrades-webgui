import { test } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';


test('Test loading -> Witness Full', async ({ page }) => {
  const studyName = 'test_load_witness';
  await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

  // List of nodes to tests
  const namespacesList = [
    `${studyName}.Resources`,
    `${studyName}.Energy_demand`,
    `${studyName}.EnergyMix`,
    `${studyName}.Macroeconomics`,
    `${studyName}.Carboncycle`,
    `${studyName}.Carbon_emissions`,
    `${studyName}.Damage`,
    `${studyName}.Temperature_change`,
    `${studyName}.CCUS`,
    `${studyName}.Land`,
    `${studyName}.Utility`,
  ];

  // Verifying that all nodes are presents in the page
  await Promise.all(namespacesList.map(async (nsp) => {
    await page.waitForSelector(`id=btn-treeview-node-${nsp}`);
  }));
});

// test('Test loading -> Business case level 3', async ({ page }) => {
//   const studyName = 'test_load_bc_lvl_3_demo';
//   await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

//   // List of nodes to tests
//   const namespacesList = [
//     `${studyName}.Manufacturer`,
//     `${studyName}.Operator`,
//     `${studyName}.Energy`,
//     `${studyName}.Market`,
//     `${studyName}.LCA`,
//     `${studyName}.Business`,
//     `${studyName}.Charlie_H2`,
//     `${studyName}.Charlie_Kero`
//   ];

//   // Verifying that all nodes are presents in the page
//   await Promise.all(namespacesList.map(async (nsp) => {
//     await page.waitForSelector(`id=btn-treeview-node-${nsp}`, { timeout: 60000 })
//   }));
// });

test('Test loading -> BC Product Development Strategy', async ({ page }) => {
  const studyName = 'test_load_bsl';
  await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

  // List of nodes to tests
  const namespacesList = [
    `${studyName}.Supply_constraint`,
    `${studyName}.Economics`,
    `${studyName}.Market Explore`,
    `${studyName}.Business`,
    `${studyName}.Aircraft`,
    `${studyName}.Services`,
    `${studyName}.Outputs`,
    `${studyName}.NTP_BRN_BSL`
  ];

  // Verifying that all nodes are presents in the page
  await Promise.all(namespacesList.map(async (nsp) => {
    await page.waitForSelector(`id=btn-treeview-node-${nsp}`);
  }));
});



test('Test loading by click on title-> Witness Full', async ({ page }) => {
  const studyName = 'test_load_witness';
  await baseStudyCaseLoading(page, 'group_test_e2e', studyName, false);

  // List of nodes to tests
  const namespacesList = [
    `${studyName}.Resources`,
    `${studyName}.Energy_demand`,
    `${studyName}.EnergyMix`,
    `${studyName}.Macroeconomics`,
    `${studyName}.Carboncycle`,
    `${studyName}.Carbon_emissions`,
    `${studyName}.Damage`,
    `${studyName}.Temperature_change`,
    `${studyName}.CCUS`,
    `${studyName}.Land`,
    `${studyName}.Utility`,
  ];

  // Verifying that all nodes are presents in the page
  await Promise.all(namespacesList.map(async (nsp) => {
    await page.waitForSelector(`id=btn-treeview-node-${nsp}`);
  }));
});

test('Test loading  by click on title-> BC Product Development Strategy', async ({ page }) => {
  const studyName = 'test_load_bsl';
  await baseStudyCaseLoading(page, 'group_test_e2e', studyName, false);

  // List of nodes to tests
  const namespacesList = [
    `${studyName}.Supply_constraint`,
    `${studyName}.Economics`,
    `${studyName}.Market Explore`,
    `${studyName}.Business`,
    `${studyName}.Aircraft`,
    `${studyName}.Services`,
    `${studyName}.Outputs`,
    `${studyName}.NTP_BRN_BSL`
  ];

  // Verifying that all nodes are presents in the page
  await Promise.all(namespacesList.map(async (nsp) => {
    await page.waitForSelector(`id=btn-treeview-node-${nsp}`);
  }));
});
