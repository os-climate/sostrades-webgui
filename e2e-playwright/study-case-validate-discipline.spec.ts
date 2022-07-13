import { test } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCaseValidateDiscipline } from './base/base-study-case-validate-discipline';

test('Validate discipline', async ({ page }) => {

    const studyName = 'test_load_witness';
    await baseStudyCaseLoading(page, 'group_test_e2e', studyName);
    await baseStudyCaseValidateDiscipline(page, studyName);

});
