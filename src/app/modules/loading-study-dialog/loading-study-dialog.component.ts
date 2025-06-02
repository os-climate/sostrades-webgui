import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingStudyDialogData } from 'src/app/models/dialog-data.model';
import { DEFAULT_DIALOG_STEPS, LoadingDialogStep } from 'src/app/models/loading-study-dialog.model';

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

  public steps: any;  

  constructor(
    public dialogRef: MatDialogRef<LoadingStudyDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingStudyDialogData,
  ) {
    this.tootipTitle = "";
    this.tooltipErrorMessage = "";
    this.steps = DEFAULT_DIALOG_STEPS;
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

  setSteps(steps) {
      this.steps = steps;
         
  }

  setError(error:string){
    this.errorMessage = error;
    if(this.errorMessage.length > 200) {
      this.dialogRef.updateSize('500px','350px')
    } else {
      this.dialogRef.updateSize('500px','260px');
    }
    
    this.isInError = true;
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
    this.dialogRef = null;
  }
}


