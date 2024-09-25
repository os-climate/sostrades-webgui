import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogData, LoadingStudyDialogData } from 'src/app/models/dialog-data.model';
import { LoadingDialogStep } from 'src/app/models/loading-study-dialog.model';

@Component({
  selector: 'app-loading-study-dialog',
  templateUrl: './loading-study-dialog.component.html',
  styleUrls: ['./loading-study-dialog.component.scss']
})
export class LoadingStudyDialogComponent {
  public disableCancelLoading: boolean;
  public _currentStep: LoadingDialogStep;
  steps = [
    { 
      step: LoadingDialogStep.ACCESSING_STUDY_SERVER, 
      labelBefore: 'Accessing Study server', labelAfter:'Study Server Running'
    },
    { 
      step: LoadingDialogStep.LOADING_STUDY, 
      labelBefore: 'Loading Study', labelAfter:'Study loaded'
    },
    { 
      step: LoadingDialogStep.LOADING_ONTOLOGY,
      labelBefore: 'Loading ontology', labelAfter:'Study Ready' 
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<LoadingStudyDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingStudyDialogData,
  ) {
  }

  ngOnInit(): void {
    this._currentStep = this.data.step;
  }


  updateCurrentStep(value: LoadingDialogStep) {
      this._currentStep = value;
      if (this._currentStep >= LoadingDialogStep.LOADING_ONTOLOGY){
        this.disableCancelLoading = true;
      }

  }

  get currentStep() {
    return this._currentStep;
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}

