import { test, expect } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCasePostProcessing } from './base/base-study-case-post-processing';
import { baseStudyCaseSwitchToEditionMode } from './base/base-study-case-switch-to-edition-mode';
import { baseStudyCaseTreenodeExpand } from './base/base-study-case-treenode-expand';

test('Test Post-Processing -> Airbus Product Development Strategy Manual Simple v1 Process', async ({ page }) => {

  const studyName = 'test_load_bsl';

  await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

  // Verifying Outputs post-processing
  const OutputsNamespace = `${studyName}.Outputs`;

  const postProcessingTitlesOutputs = ['Outputs Hypothesis Summary', 'Outputs Cashflow Summary',
    'Outputs Total Summary', 'Total Cashflows Outputs', 'Cash in / Cash out Outputs',
    'Detailed Cashflows Outputs', 'Sales Price and Costs', 'Profit & Loss Sales', 'Value Assessment Outputs'];

  await baseStudyCaseTreenodeExpand(page, OutputsNamespace);

  await baseStudyCaseSwitchToEditionMode(page);

  await baseStudyCasePostProcessing(page, OutputsNamespace, postProcessingTitlesOutputs);
});
