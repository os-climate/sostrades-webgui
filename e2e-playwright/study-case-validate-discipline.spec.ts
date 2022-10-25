import { test } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCaseSwitchToEditionMode } from './base/base-study-case-switch-to-edition-mode';
import { baseStudyCaseValidateDiscipline } from './base/base-study-case-validate-discipline';

test('Validate discipline -> study: test_ratatouille_e2e', async ({ page }) => {

    const studyName = 'test_ratatouille_e2e';
    await baseStudyCaseLoading(page, 'group_test_e2e', studyName);
    await baseStudyCaseSwitchToEditionMode(page);
    await baseStudyCaseValidateDiscipline(page, studyName);

});
