import { test, expect } from '@playwright/test';
import { baseStudyCaseLoading } from './base/base-study-case-loading';
import { baseStudyCasePostProcessing } from './base/base-study-case-post-processing';
import { baseStudyCaseTreenodeExpand } from './base/base-study-case-treenode-expand';

test('Test Post-Processing -> Business case level 3', async ({ page }) => {

  const studyName = 'test_load_bc_lvl_3_demo'

  await baseStudyCaseLoading(page, 'group_test_e2e', studyName);

  // Verifying BC level 3 Energy post-processing
  const energyNamespace = `${studyName}.Energy`

  const postProcessingTitlesEnergy = ['global prices', 'kerosene technology mix over the year',
    'hydrogen technology mix over the year', 'methane technology mix over the year'];

  await baseStudyCaseTreenodeExpand(page, energyNamespace);

  await baseStudyCasePostProcessing(page, energyNamespace, postProcessingTitlesEnergy);

  // Verifying BC level 3 Manufacturer Aircraft post-processing
  const manufacturerAircraftNamespace = `${studyName}.Manufacturer.Aircraft`

  const postProcessingTitlesManufacturerAircraft = ['Fuel quantity vs range for all aircrafts',
    'Flight time vs range for all aircrafts', 'Altitude of the mission vs flight time'];

  await baseStudyCaseTreenodeExpand(page, manufacturerAircraftNamespace);

  await baseStudyCasePostProcessing(page, manufacturerAircraftNamespace, postProcessingTitlesManufacturerAircraft);

  // Verifying BC level 3 Electrolysis post-processing
  const electrolysisNamespace = `${studyName}.Energy.Energy_detail.Hydrogene.Electrolysis`

  const postProcessingTitlesElectrolysis = ['LH2_Eltlyse detail price over the years'];

  await baseStudyCaseTreenodeExpand(page, electrolysisNamespace);

  await baseStudyCasePostProcessing(page, electrolysisNamespace, postProcessingTitlesElectrolysis);

});
