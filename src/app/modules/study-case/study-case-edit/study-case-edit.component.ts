import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditStudyCaseDialogData, ValidationDialogData } from 'src/app/models/dialog-data.model';
import { LoadedGroup } from 'src/app/models/group.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { FlavorsService } from 'src/app/services/flavors/flavors.service';
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
  public flavorList: string[];
  public isLoading: boolean;
  public disableForm : boolean;
  public hasFlavors: boolean;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<StudyCaseEditComponent>,
    private snackbarService: SnackbarService,
    private groupDataService: GroupDataService,
    private flavorsService: FlavorsService,
    @Inject(MAT_DIALOG_DATA) public data: EditStudyCaseDialogData) 
    {
      this.isLoading = true;
      this.groupList = [];
      this.flavorList = [];
      this.disableForm = false;
      this.hasFlavors = false;
    }

  ngOnInit(): void {

    this.editForm = new FormGroup({
      studyName: new FormControl(this.data.studyName, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      groupId: new FormControl(this.data.groupId, [Validators.required])
    })

    // Get group list 
    this.groupDataService.getUserGroups(true).subscribe(response => {
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
    
      //get flavors in config api
    this.flavorsService.getAllFlavors().subscribe(flavorList =>
      {
        this.flavorList = flavorList;
        this.onChange(null);
         //select flavor if it is already set for the study
        
        if (flavorList !== null && flavorList !== undefined && flavorList.length > 0){
          this.hasFlavors = true;
          this.editForm.addControl("flavor", new FormControl(flavorList[0], [Validators.required]))

          this.editForm.value.flavor = flavorList[0];
          if (this.data.flavor !== null && this.data.flavor !== undefined && this.data.flavor in flavorList) {
            this.editForm.patchValue({
              flavor: this.data.flavor,
            });
            this.editForm.value.flavor = this.data.flavor;
          }
          
        }
      
      }
    );
  }

  public onChange(event : any){
    this.editForm.valueChanges.subscribe(() => {
      if (this.data.studyName === this.editForm.value.studyName && this.data.groupId === this.editForm.value.groupId  && (this.hasFlavors && this.data.flavor === this.editForm.value.flavor )){
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
            this.data.flavor = this.editForm.value.flavor;
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
      this.data.flavor = this.editForm.value.flavor;
      this.dialogRef.close(this.data);
    }
    
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}
