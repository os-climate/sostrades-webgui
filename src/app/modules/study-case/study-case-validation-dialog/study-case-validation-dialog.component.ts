import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { TreenodeDialogData } from "src/app/models/dialog-data.model";
import { SoSTradesError } from "src/app/models/sos-trades-error.model";
import {StudyCaseValidation,ValidationTreeNodeState} from "src/app/models/study-case-validation.model";
import { TreeNode } from "src/app/models/tree-node.model";
import { LoadingDialogService } from "src/app/services/loading-dialog/loading-dialog.service";
import { SnackbarService } from "src/app/services/snackbar/snackbar.service";
import { SocketService } from "src/app/services/socket/socket.service";
import { StudyCaseValidationService } from "src/app/services/study-case-validation/study-case-validation.service";
import { StudyCaseDataService } from "src/app/services/study-case/data/study-case-data.service";

@Component({
  selector: "app-study-case-validation-dialog",
  templateUrl: "./study-case-validation-dialog.component.html",
  styleUrls: ["./study-case-validation-dialog.component.scss"],
})
export class StudyCaseValidationDialogComponent implements OnInit {
  public validationForm: FormGroup;
  public validationStates = ValidationTreeNodeState;
  public displayedColumns = [
    'userName',
    'userDepartment',
    'validationState',
    'validationDate',
    'validationComment',
  ];
  public dataSourceChanges = new MatTableDataSource<StudyCaseValidation>();
  public buttonValidationText: string;

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceChanges.sort = v;
  }

  constructor(
    private studyCaseDataService: StudyCaseDataService,
    public snackbarService: SnackbarService,
    private socketService: SocketService,
    private loadingDialogService: LoadingDialogService,
    private studyCaseValidationService: StudyCaseValidationService,
    public dialogRef: MatDialogRef<StudyCaseValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TreenodeDialogData
  ) {
    this.buttonValidationText = '';
  }

  ngOnInit(): void {
    this.validationForm = new FormGroup({
      validationComment: new FormControl(''),
    });
    this.dataSourceChanges = new MatTableDataSource<StudyCaseValidation>(
    this.studyCaseValidationService.studyValidationDict[this.data.treeNodedata.fullNamespace]);
    this.dataSourceChanges.sortingDataAccessor = (item, property) => {
      return typeof item[property] === 'string'
        ? item[property].toLowerCase()
        : item[property];
    };
    this.dataSourceChanges.sort = this.sort;
    if (this.data.treeNodedata.isValidated) {
      this.buttonValidationText = 'Invalidate data';
    } else {
      this.buttonValidationText = 'Validate data';
    }
  }

  validateData() {
    const validComment = this.validationForm.value.validationComment;
    let validation = '';

    if (this.data.treeNodedata.isValidated) {
      validation = ValidationTreeNodeState.INVALIDATED;
    } else {
      validation = ValidationTreeNodeState.VALIDATED;
    }
    this.loadingDialogService.showLoading( `Saving discipline validation change`);
    this.studyCaseValidationService
      .createStudyValidationData(
        this.studyCaseDataService.loadedStudy.studyCase.id,
        this.data.treeNodedata.fullNamespace,
        validComment,
        validation
        )
      .subscribe(
        (response) => {
          this.socketService.validationChange(
            this.studyCaseDataService.loadedStudy.studyCase.id, this.data.treeNodedata.name, response.validationState);
          this.loadingDialogService.closeLoading();
          this.dialogRef.close(this.data);
          this.snackbarService.showInformation(`${this.data.treeNodedata.name} datas has been successfully ${response.validationState}`);
        },
        (errorReceived) => {
          this.loadingDialogService.closeLoading();
          this.dialogRef.close(this.data);
          const error = errorReceived as SoSTradesError;
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.snackbarService.showError('Error validation : ' + error.description);
          }
        }
      );
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}
