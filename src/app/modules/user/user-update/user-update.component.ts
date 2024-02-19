import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserProfile } from 'src/app/models/user-profile';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user/user.service';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateUserComponent } from '../user-creation/user-creation.component';
import { UserUpdateDialogData } from 'src/app/models/dialog-data.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';

class UpdateUserResponse {
  newProfile: boolean;
  mailSend: boolean;
}

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.scss']
})
export class UserUpdateComponent implements OnInit {

  public updateUserForm: FormGroup;
  public isLoading: boolean;
  public userProfileList: UserProfile[];

  constructor(
    private snackbarService: SnackbarService,
    private userService: UserService,
    private loadingDialogService: LoadingDialogService,
    public dialogRef: MatDialogRef<CreateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserUpdateDialogData) {
    this.isLoading = true;
    this.userProfileList = [];
  }

  ngOnInit(): void {

    this.updateUserForm = new FormGroup({
      username: new FormControl(this.data.userUpdated.username, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      firstname: new FormControl(this.data.userUpdated.firstname, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      lastname: new FormControl(this.data.userUpdated.lastname, [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      email: new FormControl(this.data.userUpdated.email, [Validators.required, Validators.pattern(TypeCheckingTools.EMAIL_REGEX)]),
      profile: new FormControl(this.data.userUpdated.userprofile === null ? 0 : this.data.userUpdated.userprofile, [Validators.required])
    });

    this.userService.getUserProfiles().subscribe(res => {
      this.userProfileList = res;
      const nullProfile = new UserProfile();
      nullProfile.id = 0;
      nullProfile.name = 'No profile';
      nullProfile.description = 'User without profile';
      this.userProfileList.unshift(nullProfile);

      this.isLoading = false;
    }, errorReceived => {
      this.isLoading = false;
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError(`Error retrieving user profile list : ${error.description}`);
      }
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.updateUserForm.controls[controlName].hasError(errorName);
  }

  submitForm() {
    this.loadingDialogService.showLoading(`Updating user "${this.updateUserForm.value.username}"`);
    this.data.cancel = false;

    this.data.userUpdated.username = this.updateUserForm.value.username;
    this.data.userUpdated.firstname = this.updateUserForm.value.firstname;
    this.data.userUpdated.lastname = this.updateUserForm.value.lastname;
    this.data.userUpdated.email = this.updateUserForm.value.email;
    if (this.updateUserForm.value.profile === 0) {
      this.data.userUpdated.userprofile = null;
    } else {
      this.data.userUpdated.userprofile = this.updateUserForm.value.profile;
    }

    this.userService.updateUser(this.data.userUpdated).subscribe(res => {
      const resUpdate = res as UpdateUserResponse;
      this.loadingDialogService.closeLoading();
      this.dialogRef.close(this.data);
      if (resUpdate.newProfile) {
        if (resUpdate.mailSend) {
          // eslint-disable-next-line max-len
          this.snackbarService.showInformation(`Update of user "${this.updateUserForm.value.username}" successfull, and notification mail successfully sent.`);
        } else {
          // eslint-disable-next-line max-len
          this.snackbarService.showWarning(`Update of user "${this.updateUserForm.value.username}" successfull, but server was unable to notify user by mail.`);
        }
      } else {
        this.snackbarService.showInformation(`Update of user "${this.updateUserForm.value.username}" successfull`);
      }
    }, errorReceived => {
      this.loadingDialogService.closeLoading();
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError(`Error updating user : ${error.description}`);
      }
    });
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }


}
