import { test } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCasePostProcessing } from './base/base-study-case-post-processing';
import { baseStudyCaseSwitchToEditionMode } from './base/base-study-case-switch-to-edition-mode';
import { baseStudyCaseTreenodeExpand } from './base/base-study-case-treenode-expand';

test('Test Post-Processing -> Generic Value Assessment Process', async ({ page }) => {

  const studyName = 'test_ratatouille_e2e';

  await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

  // Verifying Outputs post-processing
  const OutputsNamespace = `${studyName}.OpEx`;

  const postProcessingTitlesOutputs = ['Operating Expenditure per product', 'Total Operating Expenditure (all products)'];

  await baseStudyCaseTreenodeExpand(page, OutputsNamespace);

  await baseStudyCaseSwitchToEditionMode(page);

  await baseStudyCasePostProcessing(page, OutputsNamespace, postProcessingTitlesOutputs);
});
