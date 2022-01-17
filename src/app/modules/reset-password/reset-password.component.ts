import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user/user.service';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})


export class ResetPasswordComponent implements OnInit {

  error: SoSTradesError;
  public processingResetPassword: boolean;
  public resetPasswordForm: FormGroup;
  public matcher = new MyErrorStateMatcher();

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private snackbarService: SnackbarService,
    private dialog: MatDialog) {

    let token = '';
    this.route.queryParams.subscribe(params => {
      if ('token' in params) {
        token = params['token']
      }
    });

    this.processingResetPassword = false;
    this.resetPasswordForm = new FormGroup({
      token: new FormControl(token, Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(8), this.policiesPasswords]),
      confirmPassword: new FormControl('')
    }, { validators: this.checkPasswords });
  }

  ngOnInit() {
    this.dialog.closeAll();

    // Reset all existing token
    localStorage.clear();
  }

  checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirmPassword').value
    return pass === confirmPass ? null : { notSame: true }
  }

  policiesPasswords: ValidatorFn = (form: FormControl): ValidationErrors | null => {
    const password: string = form.value;
    const passwordArray: string[] = Array.from(password);


    const policiesLowerCase = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    const policiesUpperCase = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    const policiesDigits = ['0','1','2','3','4','5','6','7','8','9'];
    const policiesPunctuation = ['!','"','#','$','%','&','\'','(',')','*','+',',','-','.','/',':',';','<','=','>','?','@','[','\\',']','^','_','`','{','|','}','~'];

    const lowerCaseNumber = passwordArray.filter(x => policiesLowerCase.includes(x)).length;
    const upperCaseNumber = passwordArray.filter(x => policiesUpperCase.includes(x)).length;
    const policiesDigitsNumber = passwordArray.filter(x => policiesDigits.includes(x)).length;
    const policiesPunctuationNumber = passwordArray.filter(x => policiesPunctuation.includes(x)).length;

    // Check compliance
    const compliance = lowerCaseNumber >= 1 && upperCaseNumber >= 1 && policiesDigitsNumber >= 1 && policiesPunctuationNumber >= 1;

    return compliance === true ? null : { notValid: true }
  }

  submit() {
    this.processingResetPassword = true;
    const token = this.resetPasswordForm.get('token').value;
    const password = this.resetPasswordForm.get('password').value;

    this.processingResetPassword = false;
      this.userService.changePassword(password, token).subscribe(
      () => {
        this.snackbarService.closeSnackbarIfOpened();
        this.router.navigate(['/login']);
        this.processingResetPassword = false;
      },
      (err) => {
        this.snackbarService.showError('Error while changing password : ' + err);
        this.processingResetPassword = false;
      }
    );
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return control.parent.errors && control.parent.errors['notSame']
  }
}
