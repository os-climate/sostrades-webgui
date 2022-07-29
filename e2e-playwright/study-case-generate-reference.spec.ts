import { test } from '@playwright/test';
import { baseStudyCaseGenerateReference } from './base/base-study-case-generate-reference';

test('Generate reference', async ({ page }) => {

    const studyName = 'usecase_reference_ZEROe_CSR3_FC_BSL';
    const processName = 'apds_manual_simple';

    await baseStudyCaseGenerateReference(page, studyName, processName);
});
