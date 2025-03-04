export enum LoadingDialogStep{
  NOT_STARTED = 0,
  ACCESSING_STUDY_SERVER = 1,
  LOADING_STUDY = 2,
  LOADING_ONTOLOGY = 3,
  READY = 4
}

export class DialogStep {
  step: LoadingDialogStep;
  labelBefore: string;
  labelAfter: string;
}

export const DEFAULT_DIALOG_STEPS: DialogStep[] = [
  {
    step: LoadingDialogStep.ACCESSING_STUDY_SERVER,
    labelBefore: 'Accessing Study server',
    labelAfter: 'Study Server Running'
  },
  {
    step: LoadingDialogStep.LOADING_STUDY,
    labelBefore: 'Loading Study',
    labelAfter: 'Study loaded'
  },
  {
    step: LoadingDialogStep.LOADING_ONTOLOGY,
    labelBefore: 'Loading ontology',
    labelAfter: 'Study Ready'
  }
];

export const READONLY_DIALOG_STEPS: DialogStep[] = [
  {
    step: LoadingDialogStep.ACCESSING_STUDY_SERVER,
    labelBefore: 'Accessing read-only',
    labelAfter: 'Read only mode recieved'
  },
  {
    step: LoadingDialogStep.LOADING_STUDY,
    labelBefore: 'Loading read only',
    labelAfter: 'Read only loaded'
  },
  {
    step: LoadingDialogStep.LOADING_ONTOLOGY,
    labelBefore: 'Loading ontology',
    labelAfter: 'Study Ready'
  }
];