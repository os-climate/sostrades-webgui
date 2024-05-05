import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ValidationDialogData } from 'src/app/models/dialog-data.model';
import { DialogEditionName, LabelFormName } from 'src/app/models/enumeration.model';
import { LoadedGroup } from 'src/app/models/group.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { FlavorsService } from 'src/app/services/flavors/flavors.service';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';
import { ValidationDialogComponent } from '../validation-dialog/validation-dialog.component';
import { UserService } from 'src/app/services/user/user.service';
import { UserProfile } from 'src/app/models/user-profile';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';


@Component({
  selector: 'app-edition-form-dialog',
  templateUrl: './edition-form-dialog.component.html',
  styleUrls: ['./edition-form-dialog.component.scss']
})
export class EditionFormDialogComponent {
  
  public editForm : FormGroup;
  public dialogEditionName = DialogEditionName;
  public labelFormName = LabelFormName;
  public disableForm : boolean;
  public groupList: LoadedGroup[];
  public flavorList: string[];
  public hasFlavors: boolean;
  public isLoading: boolean;
  public idName: string;
  public labelName: string;
  public userProfileList: UserProfile[];



  constructor(
    public dialogRef: MatDialogRef<EditionFormDialogComponent>,
    private userService: UserService,
    private loadingDialogService: LoadingDialogService,
    public groupDataService: GroupDataService,
    private snackbarService: SnackbarService,
    private flavorsService: FlavorsService,
    private dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data) {
    this.disableForm = false;
    this.isLoading = true;
    this.groupList = [];
    this.userProfileList = [];
    this.idName = "";
    this.flavorList = [];
    this.hasFlavors = false;
    this.labelName = "";
  }

  ngOnInit(): void {  
    this.setFormRules(this.data.editionDialogName);
    if(this.data.editionDialogName == DialogEditionName.EDITION_STUDY) {
      this.loadGroup();
      this.loadFlavor();
    }
    if(this.data.editionDialogName == DialogEditionName.EDITION_USER) {
      this.loadUserProfiles();
    }
  }
  
  private setFormRules(dialogEditionName: DialogEditionName) { 
    switch (dialogEditionName) {
      case DialogEditionName.EDITION_GROUP:
        this.dialogRef.updateSize("400px", "350px");
        this.idName = "group-name";
        this.labelName = LabelFormName.GROUP_NAME;
        this.editForm = new FormGroup({
          name : new FormControl(this.data.name,[Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
          groupDescription : new FormControl(this.data.description,[Validators.required])
        });
        break;
        case DialogEditionName.EDITION_STUDY:
          this.dialogRef.updateSize("400px", "400px");
          this.idName = "study-name";
          this.labelName = LabelFormName.STUDY_NAME;
          this.editForm = new FormGroup({
            name: new FormControl(this.data.name, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
            groupId: new FormControl(this.data.groupId, [Validators.required]),
          });
        break;
        case DialogEditionName.EDITION_USER:
        this.dialogRef.updateSize('350px','450px');
        this.editForm = new FormGroup({
          username: new FormControl(this.data.userUpdated.username, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
          firstname: new FormControl(this.data.userUpdated.firstname, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
          lastname: new FormControl(this.data.userUpdated.lastname, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
          email: new FormControl(this.data.userUpdated.email, [Validators.required, Validators.pattern(TypeCheckingTools.EMAIL_REGEX)]),
          profile: new FormControl(this.data.userUpdated.userprofile === null ? 0 : this.data.userUpdated.userprofile, [Validators.required])
        });
        break;
    }
  }

  public onChange(event : any, dialogEditionName: DialogEditionName){
    this.editForm.valueChanges.subscribe(() => {
      switch (dialogEditionName) {
        case DialogEditionName.EDITION_GROUP:
          if (this.data.name === this.editForm.value.name && this.data.description === this.editForm.value.groupDescription){
            this.disableForm = true;
          }
          else {
            this.disableForm = false;
          }
          break;
          case DialogEditionName.EDITION_STUDY:
            if (this.data.name === this.editForm.value.name && this.data.groupId === this.editForm.value.groupId && (this.hasFlavors && this.data.flavor === this.editForm.value.flavor)){
              this.disableForm = true;
            }
            else {
              this.disableForm = false;
            }
            break;
          case DialogEditionName.EDITION_USER:
            if (this.data.userUpdated.username === this.editForm.value.username && this.data.userUpdated.firstname === this.editForm.value.firstname &&
              this.data.userUpdated.lastname === this.editForm.value.lastname && this.data.userUpdated.email === this.editForm.value.email &&
              this.data.userUpdated.userprofile === this.editForm.value.profile) {
              this.disableForm = true;
            }
            else {
              this.disableForm = false;
            }
          
          break;
     
    }
   });
  }

  private loadUserProfiles() {
    this.userService.getUserProfiles().subscribe({
      next: (res) => {
        this.userProfileList = res;
        const nullProfile = new UserProfile();
        nullProfile.id = 0;
        nullProfile.name = 'No profile';
        nullProfile.description = 'User without profile';
        this.userProfileList.unshift(nullProfile);
        this.isLoading = false;
      },
      error: (errorReceived) => {
        this.isLoading = false;
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError(`Error retrieving user profile list : ${error.description}`);
        }
      }
    });
  }

  private loadFlavor() {
    //get flavors in config api
    this.flavorsService.getAllFlavorsStudy().subscribe(flavorList =>
      {
        this.flavorList = flavorList;
        this.onChange(null, this.data.editionDialogName);
          //select flavor if it is already set for the study
        
        if (flavorList !== null && flavorList !== undefined && flavorList.length > 0){
          this.hasFlavors = true;
          this.editForm.addControl("flavor", new FormControl(flavorList[0], [Validators.required]));
          this.editForm.value.flavor = flavorList[0];
          if (this.data.flavor !== null && this.data.flavor !== undefined && flavorList.includes(this.data.flavor)) {
            this.editForm.patchValue({flavor: this.data.flavor});
            this.editForm.value.flavor = this.data.flavor;
          }
        }
      }
    );
  }

  private loadGroup(){
    // Get group list 
    this.groupDataService.getUserGroups(true).subscribe({
      next: (response) => {
        response.forEach(group => {
          this.groupList.push(group);
        });
        this.isLoading = false;
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading group list for form : ' + error.description);
        }
      }
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.editForm.controls[controlName].hasError(errorName);
  }

  submitForm(dialogEditionName: DialogEditionName) {
    this.data.cancel = false;
    switch (dialogEditionName) {
      case DialogEditionName.EDITION_GROUP:
        this.data.name = this.editForm.value.name;
        this.data.description = this.editForm.value.groupDescription;
        this.dialogRef.close(this.data);

        break;
        case DialogEditionName.EDITION_STUDY:
          if(this.data.groupId != this.editForm.value.groupId) {
            const validationDialogData = new ValidationDialogData();
            validationDialogData.message = `You will change the group of the study "${this.editForm.value.name}", users will no more be able to access this study because they may not have access to the new group.`;
            validationDialogData.title = " Warning"
            validationDialogData.buttonOkText = 'Ok';
            validationDialogData.secondaryActionConfirmationNeeded = false;
            
      
            const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
              disableClose: true,
              data: validationDialogData,
            });
            dialogRefValidate.afterClosed().subscribe(result =>{
              const validationData : ValidationDialogData = result as ValidationDialogData
              if ((validationData !== null) && (validationData !== undefined)) {
                if (validationData.cancel !== true) {
                  this.data.cancel = false;
                  this.data.name = this.editForm.value.name;      
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
            this.data.name = this.editForm.value.name;    
            this.data.groupId = this.editForm.value.groupId;
            this.data.flavor = this.editForm.value.flavor;
            this.dialogRef.close(this.data);
          }
          break;
        case DialogEditionName.EDITION_USER:
          this.loadingDialogService.showLoading(`Updating user "${this.editForm.value.username}"`);
          this.data.cancel = false;
      
          this.data.userUpdated.username = this.editForm.value.username;
          this.data.userUpdated.firstname = this.editForm.value.firstname;
          this.data.userUpdated.lastname = this.editForm.value.lastname;
          this.data.userUpdated.email = this.editForm.value.email;
          if (this.editForm.value.profile === 0) {
            this.data.userUpdated.userprofile = null;
          } else {
            this.data.userUpdated.userprofile = this.editForm.value.profile;
          }
          this.dialogRef.close(this.data);

        break;
    }
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}
