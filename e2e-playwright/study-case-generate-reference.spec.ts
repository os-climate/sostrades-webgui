import { test } from '@playwright/test';
import { baseStudyCaseGenerateReference } from './base/base-study-case-generate-reference';

test('Generate reference', async ({ page }) => {

    const studyName = 'usecase_ZEROe_grid_search_sensitivity';
    const repositoryName = 'business_case.v3.sos_processes.business_case';

    await baseStudyCaseGenerateReference(page, studyName, repositoryName);
});
