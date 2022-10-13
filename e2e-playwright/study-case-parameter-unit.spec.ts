import { test } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCaseUnitParameterName } from './base/base-study-case-parameter-unit';


test('Test Unit In Parameter Name -> Launch test_ratatouille_e2e', async ({ page }) => {

    const studyName = 'test_load_witness';
    const ParameterName = 'Ending year [year]';

    await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

    await baseStudyCaseUnitParameterName(page, ParameterName);
  });
