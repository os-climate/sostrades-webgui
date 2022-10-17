import { test } from '@playwright/test';
import { baseStudyCaseProcessBuilder } from './base/base-study-case-process-builer';
import { baseStudyCaseDeletion } from './base/base-study-case-delete';
import { baseStudyCaseCreation } from './base/base-study-case-create-study';
import { baseCloseStudyCase } from './base/base-close-study';

const studyProcessBuilder = 'Test_process_builder';
const processProcBuidler = 'Process DoE_Eval driver creation';
const subprocess = 'Core Test Architecture Process';
const referenceStudy = 'usecase_simple_architecture';
const studyGroup = 'group_test_e2e';
const referenceEmpty = 'Empty Study';
const nodeDOE = 'DoE_Eval';


/**
 * Test sub process widget.
 */
test('Test process Builder', async ({page}) => {

  await baseStudyCaseCreation(page, studyProcessBuilder, processProcBuidler, referenceEmpty, true, false);
  await baseStudyCaseProcessBuilder(page, studyProcessBuilder, nodeDOE, subprocess, referenceStudy);

   // List of nodes to tests
  const namespacesList = [
    `${studyProcessBuilder}.${nodeDOE}.Business`,
  ];

  const iconChevron = page.locator(`id="chevron-right-${studyProcessBuilder}.${nodeDOE}"`);
  if (iconChevron.isVisible()) {

    // Click on DoE_Eval node
    const clickOnNode =  page.locator(`id=btn-treeview-expand-${studyProcessBuilder}.${nodeDOE}`);
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
  // Close study
  await baseCloseStudyCase(page);

  // Verifying correct redirection to study management
  await page.waitForURL('/study-management', { timeout: 30000 });
});

test('Test Deletion -> Test_process_builder ', async ({page}) => {

    // Delete the study
    const studyToDelete = { copieStudy: [studyProcessBuilder, studyGroup]};
    await baseStudyCaseDeletion(page, studyToDelete, true);
    });
