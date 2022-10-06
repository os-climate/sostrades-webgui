import { baseStudyCaseCreation } from './base/base-study-case-create-study';
import { test } from '@playwright/test';
import { baseStudyCaseProcessBuilder } from './base/base-study-case-process-builer';
import { baseStudyCaseDeletion } from './base/base-study-case-delete';

const studyProcBuilder = 'Test_procBuilder';
const processProcBuidler = 'test_driver_build_doe_eval_empty';
const subprocess = 'Airbus Product Development Strategy Manual Simple v1 Process';
const referenceStudy = 'test_load_bsl';
const studyGroup = 'group_test_e2e';
const referenceEmpty = 'Empty Study';
const node = 'DoE_Eval';


/**
 * Test sub process widget.
 */
test.only('Test process Builder', async ({page}) => {
    await baseStudyCaseCreation(page, studyProcBuilder, processProcBuidler, referenceEmpty, studyGroup, true);
    await baseStudyCaseProcessBuilder(page, studyProcBuilder, node, subprocess, referenceStudy);
    // List of nodes
    const namespacesList = [
        `${studyProcBuilder}.Supply_constraint`,
        `${studyProcBuilder}.Economics`,
        `${studyProcBuilder}.Market Explore`,
        `${studyProcBuilder}.Business`,
        `${studyProcBuilder}.Aircraft`,
        `${studyProcBuilder}.Services`,
        `${studyProcBuilder}.Outputs`,
        `${studyProcBuilder}.NTP_BRN_BSL`
    ];

    // Verifying that all nodes are presents in the page
    await Promise.all(namespacesList.map(async (nsp) => {
    await page.waitForSelector(`id=btn-treeview-node-${nsp}`);
  }));

    // Delete the study
    const studyToDelete = { copieStudy: [studyProcBuilder, studyGroup]};
    await baseStudyCaseDeletion(page, studyToDelete);
});
