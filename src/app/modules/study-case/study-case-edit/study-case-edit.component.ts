import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditStudyCaseDialogData, ValidationDialogData } from 'src/app/models/dialog-data.model';
import { LoadedGroup } from 'src/app/models/group.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';

@Component({
  selector: 'app-study-case-edit',
  templateUrl: './study-case-edit.component.html',
  styleUrls: ['./study-case-edit.component.scss']
})
export class StudyCaseEditComponent implements OnInit {
  
  public editForm : FormGroup;
  public groupList: LoadedGroup[];
  public isLoading: boolean;
  public disableForm : boolean;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<StudyCaseEditComponent>,
    private snackbarService: SnackbarService,
    private groupDataService: GroupDataService,
    @Inject(MAT_DIALOG_DATA) public data: EditStudyCaseDialogData) 
    {
      this.isLoading = true;
      this.groupList = [];
      this.disableForm = false;
    }

  ngOnInit(): void {

    this.editForm = new FormGroup({
      studyName: new FormControl(this.data.studyName, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      groupId: new FormControl(this.data.groupId, [Validators.required]),
    })

    // Get group list 
    this.groupDataService.getUserGroups().subscribe(response => {
      const grpList: LoadedGroup[] = response;
      grpList.forEach(group => {
        this.groupList.push(group);
      });
      this.isLoading = false;
      }, errorReceived => {
          const error = errorReceived as SoSTradesError;
          this.onCancelClick();
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.snackbarService.showError('Error loading group list for form : ' + error.description);
          }
      });
  }
  public onChange(event : any){
    console.log(event)
    this.editForm.valueChanges.subscribe(() => {
      if (this.data.studyName === this.editForm.value.studyName && this.data.groupId === this.editForm.value.groupId ){
        this.disableForm = true
      }
      else {
        this.disableForm = false
      }
      
    })
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.editForm.controls[controlName].hasError(errorName);
  }

  submitForm() {
    this.data.cancel = false;
   
    if(this.data.groupId != this.editForm.value.groupId)
    {
      const validationDialogData = new ValidationDialogData();
      validationDialogData.message = `You will change the group of the study "${this.editForm.value.studyName}", users will no more be able to access this study because they may not have access to the new group.`;
      validationDialogData.title = " Warning"
      validationDialogData.buttonOkText = 'Ok';
      validationDialogData.secondaryActionConfirmationNeeded = false;
      

      const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
        disableClose: true,
        width: '500px',
        height: '240px',
        data: validationDialogData,
      });
      dialogRefValidate.afterClosed().subscribe(result =>{
        const validationData : ValidationDialogData = result as ValidationDialogData
        if ((validationData !== null) && (validationData !== undefined)) {
          if (validationData.cancel !== true) {
            this.data.cancel = false;
            this.data.studyName = this.editForm.value.studyName;      
            this.data.groupId = this.editForm.value.groupId;
            this.dialogRef.close(this.data);
          }
          else{
            this.data.cancel = true;
          }
        }
      })
    }
    else {
      this.data.studyName = this.editForm.value.studyName;      
      this.data.groupId = this.editForm.value.groupId;
      this.dialogRef.close(this.data);
    }
    
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}
