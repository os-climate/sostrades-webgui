import { test, expect } from '@playwright/test';
import { baseStudyCaseStartCalculation } from './base/base-study-case-calculation';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCaseSwitchToEditionMode } from './base/base-study-case-switch-to-edition-mode';

test('Test Start Calculation -> Run Sellar Opt Multi Scenario', async ({ page }) => {

  const studyName = 'test_sellar_opt_ms';

  await baseStudyCaseLoading(page, 'group_test_e2e', studyName);
  // await baseStudyCaseSwitchToEditionMode(page);
  await baseStudyCaseStartCalculation(page, studyName);
});
