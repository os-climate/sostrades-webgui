import { test } from '@playwright/test';
import { baseStudyCaseStartCalculation } from './base/base-study-case-calculation';
import { baseStudyCaseDeletion } from './base/base-study-case-delete';
import { baseStudyCaseEdition } from './base/base-study-case-edit';
import { baseStudyCaseCreation } from './base/base-study-case-create-study';

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
const referenceEmpty = 'Empty Study';
const referenceUsecase = 'usecase_RATATOUILLE';
const editStudyName = 'Test_ratatouille_copie_edit';
const editStudyGroup = 'SoSTrades_Dev';



test('Test Create Study -> Test creation empty, usecase, copie from study management and processes', async ({ page }) => {

  // Creation study Empty
  await baseStudyCaseCreation(page, studyNameEmpty, processBiodiesel, searchProcessBiodiesel, referenceEmpty, true);

  // Creation usecase
  await baseStudyCaseCreation(page, studyNameUsecase, processValueAssessment, searchProcessValueAssessment, referenceUsecase, true);

  // Creation copie
  await baseStudyCaseCreation(page, studyNameCopie, processValueAssessment, searchProcessValueAssessment, studyNameUsecase, true);

  // Creation study Empty from process
  await baseStudyCaseCreation(page, studyNameEmptyFromProcess, processBiodiesel, searchProcessBiodiesel, referenceEmpty, false);

  // Creation usecase from process
  await baseStudyCaseCreation(
  page, studyNameUsecaseFromProcess, processValueAssessment, searchProcessValueAssessment, referenceUsecase, false
  );

  // Creation copie from process
  await baseStudyCaseCreation(page, studyNameCopieFromProcess, processBiodiesel, searchProcessBiodiesel, studyNameEmptyFromProcess, false);

});

test('Test Edition Study -> Test_edition', async ({ page }) => {

  await baseStudyCaseEdition(page, studyNameCopie, editStudyName, studyGroup, editStudyGroup);
  await baseStudyCaseStartCalculation(page, editStudyName);

});

// test.only('Test Deletion -> Test_multiple_deletion', async ({page}) => {

//   // const listStudiesFromProcess = {
//   //   copieStudyProcess: [studyNameCopieFromProcess, studyGroup],
//   //   usecaseProcess: [studyNameUsecaseFromProcess, studyGroup],
//   //   emptyStudyProcess: [studyNameEmptyFromProcess, studyGroup],
//   // };
//   // await baseStudyCaseDeletion(page, listStudiesFromProcess);

//   const listStudiesFromStudyManagement = {
//     copieStudy: [editStudyName, editStudyGroup],
//     emptyStudy: [studyNameEmpty, studyGroup],
//     usecase: [studyNameUsecase, studyGroup],
//   };
//   await baseStudyCaseDeletion(page, listStudiesFromStudyManagement);
// });


test('Test Deletion -> Test_deletion_one_by_one', async ({page}) => {
  const copieStudy = {
    copieStudy: [editStudyName, editStudyGroup]};
  await baseStudyCaseDeletion(page, copieStudy);

  const emptyStudy = {
    emptyStudy: [studyNameEmpty, studyGroup]};
  await baseStudyCaseDeletion(page, emptyStudy);

  const usecase = {
    usecase: [studyNameUsecase, studyGroup]};
  await baseStudyCaseDeletion(page, usecase);

  const copieStudyProcess = {
    copieStudyProcess: [studyNameCopieFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, copieStudyProcess);

  const emptyStudyProcess = {
    emptyStudyProcess: [studyNameEmptyFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, emptyStudyProcess);

  const usecaseProcess = {
    usecaseProcess: [studyNameUsecaseFromProcess, studyGroup]};
  await baseStudyCaseDeletion(page, usecaseProcess);
});

