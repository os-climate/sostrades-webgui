import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SoSTradesError } from "src/app/models/sos-trades-error.model";
import {StudyCaseValidation,ValidationTreeNodeState} from "src/app/models/study-case-validation.model";
import { TreeNode } from "src/app/models/tree-node.model";
import { LoadingDialogService } from "src/app/services/loading-dialog/loading-dialog.service";
import { SnackbarService } from "src/app/services/snackbar/snackbar.service";
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
    "userName",
    "userDepartment",
    "validationState",
    "validationDate",
    "validationComment",
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
    private loadingDialogService: LoadingDialogService,
    private studyCaseValidationService: StudyCaseValidationService,
    public dialogRef: MatDialogRef<StudyCaseValidationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public treeNodedata: TreeNode
  ) {
    this.buttonValidationText = "";
  }

  ngOnInit(): void {
    this.validationForm = new FormGroup({
      validationComment: new FormControl(""),
    });
    this.dataSourceChanges = new MatTableDataSource<StudyCaseValidation>(this.studyCaseValidationService.studyValidationDict[this.studyCaseDataService.loadedStudy.studyCase.id, this.treeNodedata.fullNamespace])
    this.dataSourceChanges.sortingDataAccessor = (item, property) => {
      return typeof item[property] === "string"
        ? item[property].toLowerCase()
        : item[property];
    };
    this.dataSourceChanges.sort = this.sort;
    if (this.treeNodedata.isValidated) {
      this.buttonValidationText = "Invalidate data";
    } else {
      this.buttonValidationText = "Validate data";
    }
  }

  validateData() {
    const validComment = this.validationForm.value.validationComment;
    let validation = ""

    if(this.treeNodedata.isValidated){
      validation = this.validationStates.INVALIDATED
    }
    else{
      validation = this.validationStates.VALIDATED
    } 
        this.loadingDialogService.showLoading(
      `Saving discipline validation change`
    );
    this.studyCaseValidationService
      .createStudyValidationData(
        this.studyCaseDataService.loadedStudy.studyCase.id,
        this.treeNodedata.fullNamespace,
        validComment,
        validation   
        
        )
      .subscribe(
        (res) => {
          this.loadingDialogService.closeLoading();
          this.dialogRef.close(this.treeNodedata);
          if (validation == ValidationTreeNodeState.VALIDATED) {
            this.snackbarService.showInformation(`${this.treeNodedata.name} datas' validation successfully done`);
          } else {
            this.snackbarService.showInformation(`${this.treeNodedata.name} datas' invalidation successfully done`);
          }
      
        },
        (errorReceived) => {
          this.loadingDialogService.closeLoading();
          this.dialogRef.close(this.treeNodedata);
          const error = errorReceived as SoSTradesError;
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.snackbarService.showError("Error claiming study case execution : " + error.description);
          }
        }
      );
  }

  onCancelClick() {
    if (this.treeNodedata.isValidated) {
      this.treeNodedata.isValidated = false
    } else {
      this.treeNodedata.isValidated = true
    }
    this.dialogRef.close(this.treeNodedata);
  
  }
}
