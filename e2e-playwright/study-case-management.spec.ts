import { test } from '@playwright/test';
import { baseStudyCaseStartCalculation } from './base/base-study-case-calculation';
import { baseStudyCaseDeletion } from './base/base-study-case-delete';
import { baseStudyCaseEdition } from './base/base-study-case-edit';
import { baseStudyCaseCreation } from './base/base-study-case-create-study';
import { baseStudyCaseSwitchToEditionMode } from './base/base-study-case-switch-to-edition-mode';
import { baseStudyCasePostProcessing } from './base/base-study-case-post-processing';
import { baseCloseStudyCase } from './base/base-close-study';


const studyNameEmpty = 'Test_ratatouille_empty_from_study_management';
const studyNameUsecase = 'Test_ratatouille_usecase_from_study_management';
const studyNameCopie = 'Test_ratatouille_copie_from_study_management';
const studyNameEmptyFromProcess = 'Test_ratatouille_empty_from_processes';
const studyNameUsecaseFromProcess = 'Test_ratatouille_usecase_from_processes';
const studyNameCopieFromProcess = 'Test_ratatouille_copie_from_processes';
const studyGroup = 'group_test_e2e';
const processRatatouille = 'Generic Value Assessment Process';
const referenceEmpty = 'Empty Study';
const referenceUsecase = 'usecase_RATATOUILLE';
const editStudyName = 'Test_ratatouille_copie_edit';
const editStudyGroup = 'All users';
const urlStudyManagement = '/study-management';


/**
 * Test creation from study management page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from study management -> Test_creation empty', async ({ page }) => {

  // Creation study Empty
  await baseStudyCaseCreation(page, studyNameEmpty, processRatatouille, referenceEmpty, true, false);

  /**
   * Update 07/09/2022
   * Moving the fonction to close a study in the file base-close-study
   */
  // Close study
  await baseCloseStudyCase(page);

  // Verifying correct redirection to study management
  await page.waitForURL(urlStudyManagement, { timeout: 40000 });

});

/**
 * Test creation from study management page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from study management -> Test_creation  usecase', async ({ page }) => {

  // Creation usecase
  await baseStudyCaseCreation(page, studyNameUsecase, processRatatouille, referenceUsecase, true, false);

  /**
   * Update 07/09/2022
   * Moving the fonction to close a study in the file base-close-study
   */
  // Close study
  await baseCloseStudyCase(page);

  // Verifying correct redirection to study management
  await page.waitForURL(urlStudyManagement, { timeout: 40000 });
  });

/**
 * Test creation from study management page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from study management -> Test_creation  copy', async ({ page }) => {

  // Creation copie
  await baseStudyCaseCreation(page, studyNameCopie, processRatatouille, studyNameUsecase, true, false);

  /**
   * Update 07/09/2022
   * Moving the fonction to close a study in the file base-close-study
   */
  // Close study
  await baseCloseStudyCase(page);

  // Verifying correct redirection to study management
  await page.waitForURL(urlStudyManagement, { timeout: 40000 });

});


/**
 * Test creation from process page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from process-> Test_creation empty', async ({ page }) => {

  // Creation study Empty from process
  await baseStudyCaseCreation(page, studyNameEmptyFromProcess, processRatatouille, referenceEmpty, false, false);

  /**
   * Update 07/09/2022
   * Moving the fonction to close a study in the file base-close-study
   */
  // Close study
  await baseCloseStudyCase(page);

  // Verifying correct redirection to study management
  await page.waitForURL(urlStudyManagement, { timeout: 40000 });

});

/**
 * Test creation from process page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from process-> Test_creation usecase', async ({ page }) => {


  // Creation usecase from process
  await baseStudyCaseCreation(page, studyNameUsecaseFromProcess, processRatatouille, referenceUsecase, false, false);

  /**
   * Update 07/09/2022
   * Moving the fonction to close a study in the file base-close-study
   */
  // Close study
  await baseCloseStudyCase(page);

  // Verifying correct redirection to study management
  await page.waitForURL(urlStudyManagement, { timeout: 40000 });

});

/**
 * Test creation from process page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from process-> Test_creation copie', async ({ page }) => {

  // Creation copie from process
  await baseStudyCaseCreation(page, studyNameCopieFromProcess, processRatatouille, studyNameEmptyFromProcess, false, false);

  /**
   * Update 07/09/2022
   * Moving the fonction to close a study in the file base-close-study
   */
  // Close study
  await baseCloseStudyCase(page);

  // Verifying correct redirection to study management
  await page.waitForURL(urlStudyManagement, { timeout: 40000 });

});

test('Test Edition Study -> Test_edition + Test_calculation', async ({ page }) => {

  await baseStudyCaseEdition(page, studyNameCopie, editStudyName, studyGroup, editStudyGroup);
  await baseStudyCaseSwitchToEditionMode(page);
  await baseStudyCaseStartCalculation(page, editStudyName);

  // Verifying Outputs post-processing
  const OutputsNamespace = `${editStudyName}.OpEx`;

  const postProcessingTitlesOutputs = ['Operating Expenditure per product', 'Total Operating Expenditure (all products)'];
  await baseStudyCasePostProcessing(page, OutputsNamespace, postProcessingTitlesOutputs);

});



test('Test Deletion -> Test_deletion_one_by_one', async ({page}) => {
  const copieStudy = { copieStudy: [editStudyName, editStudyGroup]};
  await baseStudyCaseDeletion(page, copieStudy, false);

  const emptyStudy = { emptyStudy: [studyNameEmpty, studyGroup]};
  await baseStudyCaseDeletion(page, emptyStudy, false);

  const usecase = { usecase: [studyNameUsecase, studyGroup]};
  await baseStudyCaseDeletion(page, usecase, false);

  const copieStudyProcess = { copieStudyProcess: [studyNameCopieFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, copieStudyProcess, false);

  const emptyStudyProcess = { emptyStudyProcess: [studyNameEmptyFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, emptyStudyProcess, false);

  const usecaseProcess = { usecaseProcess: [studyNameUsecaseFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, usecaseProcess, false);
});

