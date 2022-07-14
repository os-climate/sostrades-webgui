import { test } from '@playwright/test';
import { baseStudyCaseStartCalculation } from './base/base-study-case-calculation';
import { baseStudyCaseDeletion } from './base/base-study-case-delete';
import { baseStudyCaseEdition } from './base/base-study-case-edit';
import { baseStudyCaseCreation } from './base/study-case-create-study';

const studyNameEmpty = 'Test_biodiesel_empty_from_study_management';
const studyNameUsecase = 'Test_ratatouille_usecase_from_study_management';
const studyNameCopie = 'Test_ratatouille_copie_from_study_management';
const studyNameEmptyFromProcess = 'Test_biodiesel_empty_from_processes';
const studyNameUsecaseFromProcess = 'Test_ratatouille_usecase_from_processes';
const studyNameCopieFromProcess = 'Test_biodiesel_copie_from_processes';
const studyGroup = 'group_test_e2e';
const processBiodiesel = 'biodiesel_mix';
const searchProcessBiodiesel = 'Energy Technology Mix - Biodiesel Mix';
const searchProcessValueAssessment = 'Generic Value Assessment Process';
const processValueAssessment = 'Generic Value Assessment Process';
const referenceUsecase = 'usecase_RATATOUILLE';
const editStudyName = 'Test_ratatouille_copie_edit';
const editStudyGroup = 'SoSTrades_Dev';


test('Test Create Study -> Test_creation_empty_from_study_management', async ({ page }) => {

  // Creation from Empty
  const referenceEmpty = 'Empty Study';
  await baseStudyCaseCreation(page, studyNameEmpty, processBiodiesel, searchProcessBiodiesel, referenceEmpty, true);
});

test('Test Create Study -> Test_creation_usecase_from_study_management', async ({ page }) => {

  // Creation from Usecase
  await baseStudyCaseCreation(page, studyNameUsecase, processValueAssessment, searchProcessValueAssessment, referenceUsecase, true);

});

test('Test Create Study -> Test_creation_copie_from_study_management', async ({ page }) => {

  // Creation from Study
  const referenceCopie = studyNameUsecase;
  await baseStudyCaseCreation(page, studyNameCopie, processValueAssessment, searchProcessValueAssessment, referenceCopie, true);

});


test('Test Create Study -> Test_creation_empty_from_processes', async ({ page }) => {

  // Creation from Empty
  const referenceEmpty = 'Empty Study';
  await baseStudyCaseCreation(page, studyNameEmptyFromProcess, processBiodiesel, searchProcessBiodiesel, referenceEmpty, false);

});

test('Test Create Study -> Test_creation_usecase_from_processes', async ({ page }) => {

  // Creation from Usecase
  await baseStudyCaseCreation(
    page, studyNameUsecaseFromProcess, processValueAssessment, searchProcessValueAssessment, referenceUsecase, false);

});

test('Test Create Study -> Test_creation_copie_from_processes', async ({ page }) => {

  // Creation from Study
  const referenceCopie = studyNameEmptyFromProcess;
  await baseStudyCaseCreation(page, studyNameCopieFromProcess, processBiodiesel, searchProcessBiodiesel, referenceCopie, false);

});


test('Test Edition Study -> Test_edition', async ({ page }) => {

  await baseStudyCaseEdition(page, studyNameCopie, editStudyName, studyGroup, editStudyGroup);
  await baseStudyCaseStartCalculation(page, editStudyName);

});

// test.only('Test Deletion -> Test_multiple_deletion', async ({page}) => {

//   // const listStudiesFromProcess = {
//   //   study4: [studyNameCopieFromProcess, studyGroup],
//   //   study6: [studyNameUsecaseFromProcess, studyGroup],
//   //   study5: [studyNameEmptyFromProcess, studyGroup],
//   // };
//   // await baseStudyCaseDeletion(page, listStudiesFromProcess);

//   const listStudiesFromStudyManagement = {
//     study1: [editStudyName, editStudyGroup],
//     study2: [studyNameEmpty, studyGroup],
//     study3: [studyNameUsecase, studyGroup],
//   };
//   await baseStudyCaseDeletion(page, listStudiesFromStudyManagement);
// });


test('Test Deletion -> Test_deletion', async ({page}) => {
  const study1 = {
    study1: [editStudyName, editStudyGroup]};
  await baseStudyCaseDeletion(page, study1);

  const study2 = {
    study2: [studyNameEmpty, studyGroup]};
  await baseStudyCaseDeletion(page, study2);

  const study3 = {
    study3: [studyNameUsecase, studyGroup]};
  await baseStudyCaseDeletion(page, study3);

  const study4 = {
    study4: [studyNameCopieFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, study4);

  const study5 = {
    study5: [studyNameEmptyFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, study5);

  const study6 = {
    study6: [studyNameUsecaseFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, study6);
});

