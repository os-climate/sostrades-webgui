import { test } from '@playwright/test';
import { baseStudyCaseGenerateReference } from './base/base-study-case-generate-reference';

test('Generate reference', async ({ page }) => {

    const studyName = 'usecase_simple_mda';
    const processName = 'test_simple_mda';

    await baseStudyCaseGenerateReference(page, studyName, processName);
});
