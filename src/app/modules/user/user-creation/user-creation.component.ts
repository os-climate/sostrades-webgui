import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserCreateDialogData } from 'src/app/models/dialog-data.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';
import { UserProfile } from 'src/app/models/user-profile';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';


@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.component.html',
  styleUrls: ['./user-creation.component.scss']
})
export class CreateUserComponent implements OnInit {
  public createUserForm: FormGroup;
  public isLoading: boolean;
  public userProfileList: UserProfile[];

  constructor(
    private snackbarService: SnackbarService,
    private userService: UserService,
    private loadingDialogService: LoadingDialogService,
    public dialogRef: MatDialogRef<CreateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserCreateDialogData) {
    this.isLoading = true;
    this.userProfileList = [];
  }

  ngOnInit(): void {

    this.createUserForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      firstname: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      lastname: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      email: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.EMAIL_REGEX)]),
      profile: new FormControl(0)
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
    return this.createUserForm.controls[controlName].hasError(errorName);
  }

  submitForm() {
    this.loadingDialogService.showLoading(`Creation of user "${this.createUserForm.value.username}"`);
    this.data.cancel = false;

    let usProfile = null;

    if (this.createUserForm.value.profile === 0) {
      usProfile = null;
    } else {
      usProfile = this.createUserForm.value.profile;
    }

    this.data.userCreated = new User(
      null,
      this.createUserForm.value.username,
      this.createUserForm.value.firstname,
      this.createUserForm.value.lastname,
      this.createUserForm.value.email,
      null,
      usProfile,
      true
    );

    this.userService.createUser(this.data.userCreated).subscribe(creationResult => {
      const user = User.Create(creationResult['user']);
      const passwordLink = creationResult['password_link'];

      this.loadingDialogService.closeLoading();
      this.data.userCreated = user;
      this.data.passwordLink = passwordLink;
      this.dialogRef.close(this.data);
      this.snackbarService.showInformation(`Creation of user "${this.createUserForm.value.username}" successful`);
    }, errorReceived => {
      this.loadingDialogService.closeLoading();
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError(`Error creating user : ${error.description}`);
      }
    });
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }


}
