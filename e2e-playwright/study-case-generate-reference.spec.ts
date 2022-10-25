import { test } from '@playwright/test';
import { baseStudyCaseGenerateReference } from './base/base-study-case-generate-reference';

test('Generate reference -> test_driver_build_doe_eval_empty', async ({ page }) => {

    const studyName = 'usecase_Hessian_with_input_setup';
    const processName = 'test_driver_build_doe_eval_empty';

    await baseStudyCaseGenerateReference(page, studyName, processName);
});
