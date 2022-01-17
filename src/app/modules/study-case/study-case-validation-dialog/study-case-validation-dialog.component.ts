import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { StudyCaseValidationDialogData } from 'src/app/models/dialog-data.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { StudyCaseValidation, ValidationState } from 'src/app/models/study-case-validation.model';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

@Component({
  selector: 'app-study-case-validation-dialog',
  templateUrl: './study-case-validation-dialog.component.html',
  styleUrls: ['./study-case-validation-dialog.component.scss']
})
export class StudyCaseValidationDialogComponent implements OnInit {

  public validationForm: FormGroup;
  public validationStates = ValidationState;


  public displayedColumns = ['userName', 'userDepartment', 'validationState', 'validationDate', 'validationComment'];
  public dataSourceChanges = new MatTableDataSource<StudyCaseValidation>();
  public buttonValidationText: string;

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceChanges.sort = v;
  }


  constructor(
    private studyCaseDataService: StudyCaseDataService,
    public snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService,
    private studyCaseValidationService: StudyCaseValidationService,
    public dialogRef: MatDialogRef<StudyCaseValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudyCaseValidationDialogData) {
    this.buttonValidationText = '';
  }

  ngOnInit(): void {
    this.validationForm = new FormGroup({
      validationComment: new FormControl('',),
    });


    this.dataSourceChanges = new MatTableDataSource<StudyCaseValidation>(this.data.validationList);
    this.dataSourceChanges.sortingDataAccessor = (item, property) => {
      return typeof item[property] === 'string' ? item[property].toLowerCase() : item[property];
    };
    this.dataSourceChanges.sort = this.sort;


    if (this.data.validationList !== undefined
      && this.data.validationList !== null
      && this.data.validationList.length > 0
      && this.data.validationList[0].validationState == ValidationState.VALIDATED) {
      this.buttonValidationText = "Invalidate Data"
    } else {
      this.buttonValidationText = "Validate Data"
    }

  }

  validateData() {
    const validComment = this.validationForm.value.validationComment;
    let newState = '';

    this.loadingDialogService.showLoading(`Saving discipline validation change`);

    if (this.data.validationList !== undefined
      && this.data.validationList !== null
      && this.data.validationList.length > 0
      && this.data.validationList[0].validationState == ValidationState.VALIDATED) {
      newState = ValidationState.NOT_VALIDATED
    } else {
      newState = ValidationState.VALIDATED
    }

    this.studyCaseValidationService.createStudyValidationData(
      this.studyCaseDataService.loadedStudy.studyCase.id,
      this.data.validationType,
      this.data.namespace,
      this.data.disciplineName,
      validComment,
      newState
    ).subscribe(res => {
      this.loadingDialogService.closeLoading();
      this.dialogRef.close(this.data);
      this.snackbarService.showInformation(`Saving discipline validation change successfully done`);
    }, errorReceived => {
      this.loadingDialogService.closeLoading();
      this.dialogRef.close(this.data);
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error claiming study case execution : ' + error.description);
      }
    })


  }



  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }

}
