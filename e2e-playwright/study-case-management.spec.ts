import { test } from '@playwright/test';
import { baseStudyCaseStartCalculation } from './base/base-study-case-calculation';
import { baseStudyCaseDeletion } from './base/base-study-case-delete';
import { baseStudyCaseEdition } from './base/base-study-case-edit';
import { baseStudyCaseCreation } from './base/base-study-case-create-study';
import { baseStudyCaseSwitchToEditionMode } from './base/base-study-case-switch-to-edition-mode';

const studyNameEmpty = 'Test_witness_empty_from_study_management';
const studyNameUsecase = 'Test_witness_usecase_from_study_management';
const studyNameCopie = 'Test_witness_copie_from_study_management';
const studyNameEmptyFromProcess = 'Test_witness_empty_from_processes';
const studyNameUsecaseFromProcess = 'Test_witness_usecase_from_processes';
const studyNameCopieFromProcess = 'Test_witness_copie_from_processes';
const studyGroup = 'group_test_e2e';
const processWitness = 'Airbus Product Development Strategy Manual Simple v1 Process';
const referenceEmpty = 'Empty Study';
const referenceUsecase = 'usecase_reference_ZEROe_CSR3_BRN_BSL';
const editStudyName = 'Test_witness_copie_edit';
const editStudyGroup = 'All users';


/**
 * Test creation from study management page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from study management -> Test_creation empty, usecase, copie', async ({ page }) => {

  // Creation study Empty
  await baseStudyCaseCreation(page, studyNameEmpty, processWitness, referenceEmpty, studyGroup, true);

  // Creation usecase
  await baseStudyCaseCreation(page, studyNameUsecase, processWitness, referenceUsecase, studyGroup, true);

  // Creation copie
  await baseStudyCaseCreation(page, studyNameCopie, processWitness, studyNameUsecase, studyGroup, true);

});

/**
 * Test creation from process page
 * The study creation is divided in 2 tests so that the timeout of 5m is not reached.
 */
test('Test Create Study from process-> Test_creation empty, usecase, copie', async ({ page }) => {

  // Creation study Empty from process
  await baseStudyCaseCreation(page, studyNameEmptyFromProcess, processWitness, referenceEmpty, studyGroup, false);

  // Creation usecase from process
  await baseStudyCaseCreation(page, studyNameUsecaseFromProcess, processWitness, referenceUsecase, studyGroup, false);

  // Creation copie from process
  await baseStudyCaseCreation(page, studyNameCopieFromProcess, processWitness, studyNameEmptyFromProcess, studyGroup, false);

});


test('Test Edition Study -> Test_edition + Test_calculation', async ({ page }) => {

  await baseStudyCaseEdition(page, studyNameCopie, editStudyName, studyGroup, editStudyGroup);
  await baseStudyCaseSwitchToEditionMode(page);
  await baseStudyCaseStartCalculation(page, editStudyName);

});



test('Test Deletion -> Test_deletion_one_by_one', async ({page}) => {
  const copieStudy = { copieStudy: [editStudyName, editStudyGroup]};
  await baseStudyCaseDeletion(page, copieStudy);

  const emptyStudy = { emptyStudy: [studyNameEmpty, studyGroup]};
  await baseStudyCaseDeletion(page, emptyStudy);

  const usecase = { usecase: [studyNameUsecase, studyGroup]};
  await baseStudyCaseDeletion(page, usecase);

  const copieStudyProcess = { copieStudyProcess: [studyNameCopieFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, copieStudyProcess);

  const emptyStudyProcess = { emptyStudyProcess: [studyNameEmptyFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, emptyStudyProcess);

  const usecaseProcess = { usecaseProcess: [studyNameUsecaseFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, usecaseProcess);
});

