import { test } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCaseUnitParameterName } from './base/base-study-case-parameter-unit';


test('Test Unit In Parameter Name -> Launch Load Witness', async ({ page }) => {

    const studyName = 'test_load_witness'
    const ParameterName = "CO2 damage price [$/tCO2]"
  
    await baseStudyCaseLoading(page, 'group_test_e2e', studyName);
  
    await baseStudyCaseUnitParameterName(page, ParameterName);
  });