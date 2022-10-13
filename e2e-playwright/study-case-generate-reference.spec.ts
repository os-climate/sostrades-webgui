import { test } from '@playwright/test';
import { baseStudyCaseGenerateReference } from './base/base-study-case-generate-reference';

test('Generate reference', async ({ page }) => {

    const studyName = 'usecase';
    const processName = 'test_multiscenario';

    await baseStudyCaseGenerateReference(page, studyName, processName);
});
