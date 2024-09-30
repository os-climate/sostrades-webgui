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
  public currentStep: LoadingDialogStep;
  public title:string;
  public isInError: boolean;
  public errorMessage: string;

  public steps = [
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
    this.currentStep = this.data.step;
    this.title = this.data.title;
    this.errorMessage = '';
    this.isInError = false;
  }

  
  updateCurrentStep(value: LoadingDialogStep) {
      this.currentStep = value;
      if (this.currentStep >= LoadingDialogStep.LOADING_ONTOLOGY){
        this.disableCancelLoading = true;
      }

  }

  setError(error:string){
    this.errorMessage = error;
    this.dialogRef.updateSize('260');
    this.isInError = true;
  }
  

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}


