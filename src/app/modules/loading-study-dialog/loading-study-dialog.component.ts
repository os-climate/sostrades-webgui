import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingStudyDialogData } from 'src/app/models/dialog-data.model';
import { LoadingDialogStep } from 'src/app/models/loading-study-dialog.model';

@Component({
  selector: 'app-loading-study-dialog',
  templateUrl: './loading-study-dialog.component.html',
  styleUrls: ['./loading-study-dialog.component.scss']
})
export class LoadingStudyDialogComponent implements OnInit {
  public disableCancelLoading: boolean;
  public currentStep: LoadingDialogStep;
  public title:string;
  public isInError: boolean;
  public errorMessage: string;
  public tootipTitle: string;
  public tooltipErrorMessage: string;

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
    this.tootipTitle = ""
    this.tooltipErrorMessage = ""
  }

  ngOnInit(): void {
    this.currentStep = this.data.step;
    this.title = this.data.title;

    // Transform title and add tooltip on title if lenght > 20
    const prefixCreation = 'Create study case '
    if (this.data.title.toLocaleLowerCase().startsWith(prefixCreation.toLocaleLowerCase())) {
      const remainingText = this.data.title.slice(prefixCreation.length); 
      if (remainingText.length > 20) {
        this.title = prefixCreation + remainingText.slice(0, 20) + '...';
        this.tootipTitle = remainingText;
      } 
    }
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
    if (error.length > 110) {
        this.errorMessage = error.slice(0, 110) + '...';
        this.tooltipErrorMessage = error;  
    } 
    
    
    this.dialogRef.updateSize('260');
    this.isInError = true;
  }
  

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}


