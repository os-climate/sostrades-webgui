import { test } from '@playwright/test';
import { baseStudyCaseStartCalculation } from './base/base-study-case-calculation';
import { baseStudyCaseDeletion } from './base/base-study-case-delete';
import { baseStudyCaseEdition } from './base/base-study-case-edit';
import { baseStudyCaseCreation } from './base/base-study-case-create-study';

const studyNameEmpty = 'Test_witness_empty_from_study_management';
const studyNameUsecase = 'Test_witness_usecase_from_study_management';
const studyNameCopie = 'Test_witness_copie_from_study_management';
const studyNameEmptyFromProcess = 'Test_witness_empty_from_processes';
const studyNameUsecaseFromProcess = 'Test_witness_usecase_from_processes';
const studyNameCopieFromProcess = 'Test_witness_copie_from_processes';
const studyGroup = 'group_test_e2e';
const processWitness = 'WITNESS Process';
const referenceEmpty = 'Empty Study';
const referenceUsecase = 'usecase_witness';
const editStudyName = 'Test_witness_copie_edit';
const editStudyGroup = 'SoSTrades_Dev';



test('Test Create Study -> Test creation empty, usecase, copie from study management and processes', async ({ page }) => {

  // Creation study Empty
  await baseStudyCaseCreation(page, studyNameEmpty, processWitness, referenceEmpty, studyGroup, true);

  // Creation usecase
  await baseStudyCaseCreation(page, studyNameUsecase, processWitness, referenceUsecase, studyGroup, true);

  // Creation copie
  await baseStudyCaseCreation(page, studyNameCopie, processWitness, studyNameUsecase, studyGroup, true);

  // Creation study Empty from process
  await baseStudyCaseCreation(page, studyNameEmptyFromProcess, processWitness, referenceEmpty, studyGroup, false);

  // Creation usecase from process
  await baseStudyCaseCreation(page, studyNameUsecaseFromProcess, processWitness, referenceUsecase, studyGroup, false);

  // Creation copie from process
  await baseStudyCaseCreation(page, studyNameCopieFromProcess, processWitness, studyNameEmptyFromProcess, studyGroup, false);

});

test('Test Edition Study -> Test_edition + Test_calculation', async ({ page }) => {

  await baseStudyCaseEdition(page, studyNameCopie, editStudyName, studyGroup, editStudyGroup);
  await baseStudyCaseStartCalculation(page, editStudyName);

});

// test('Test Deletion -> Test_multiple_deletion', async ({page}) => {

//   const listStudiesToDelete = {
//     copieStudyProcess: [studyNameCopieFromProcess, studyGroup],
//     usecaseProcess: [studyNameUsecaseFromProcess, studyGroup],
//     emptyStudyProcess: [studyNameEmptyFromProcess, studyGroup],
//     copieStudy: [editStudyName, editStudyGroup],
//     emptyStudy: [studyNameEmpty, studyGroup],
//     usecase: [studyNameUsecase, studyGroup],
//   };
//   await baseStudyCaseDeletion(page, listStudiesToDelete);
// });


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

