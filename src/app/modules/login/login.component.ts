import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { SamlService } from 'src/app/services/saml/saml.service';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { RoutingState } from 'src/app/services/routing-state/routing-state.service';
import { Routing } from 'src/app/models/enumeration.model';
import { GithubOAuthService } from 'src/app/services/github-oauth/github-oauth.service';
import { environment } from 'src/environments/environment';
import { LogoPath } from 'src/app/models/logo-path.model';
import { LoginInformationDialogComponent } from './login-information-dialog/login-information-dialog.component';
import { KeycloakOAuthService } from 'src/app/services/keycloak-oauth/keycloak-oauth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  error: SoSTradesError;
  public loadingLogin: boolean;
  public platform: string;
  public showLogin: boolean;
  public showGitHubLogin: boolean;
  public ssoUrl: string;
  private autoLogon: boolean;
  public loginWithCredential: boolean;
  public environment = environment;
  public logoPath = LogoPath;
  public isLocalPlatform : boolean;

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(
    private auth: AuthService,
    private studyCaseLocalStorage: StudyCaseLocalStorageService,
    private samlService: SamlService,
    private githubOauthService: GithubOAuthService,
    private keycloakOauthService: KeycloakOAuthService,
    private routingState: RoutingState,
    private appDataService: AppDataService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private loggerService: LoggerService) {
    this.loadingLogin = false;
    this.platform = '';
    this.showLogin = false;
    this.showGitHubLogin = false;
    this.ssoUrl = '';
    this.autoLogon = false;
    this.loginWithCredential = false;
    this.isLocalPlatform = false;
  }

  ngOnInit() {

    // Clean local storage from study requested if reloading page and not redirection from study link

    if (this.routingState.getPreviousUrl() !== null
      && this.routingState.getPreviousUrl() !== undefined
      && !this.routingState.getPreviousUrl().includes('/study/')) {
      this.studyCaseLocalStorage.removeStudyUrlRequestedFromLocalStorage();
    }

    this.dialog.closeAll();

    this.route.queryParams.subscribe({
      next: (params) => {
        if (Object.keys(params).includes('autologon')) {
          this.autoLogon = true;
        }
        this.loggerService.log(`autologon : ${this.autoLogon}`);

        
        this.keycloakOauthService.getKeycloakOAuthAvailable().subscribe({
          next: (keycloakAvailable) => {  
            
            if (!keycloakAvailable) {
              this.checkGithubAvailable();
            }
            else{
              // go to keycloak login page
              this.loadingLogin = true;
              this.keycloakOauthService.getKeycloakOAuthUrl().subscribe({
                next: (keycloakOauthUrl) => {
                  this.snackbarService.closeSnackbarIfOpened();
                  document.location.href = keycloakOauthUrl;
                  this.loadingLogin = false;
                },
                error: (error) => {
                  if (error.statusCode == 502) {
                    this.router.navigate([Routing.NO_SERVER]);        
                  } else {
                    this.snackbarService.showError('Error during Keycloak redirection login : ' + error.description);
                  }
                  this.loadingLogin = false;
                }
              });
            }


        
          }, error: (errorReceived) => {
              if (errorReceived.statusCode == 502) {
                this.router.navigate([Routing.NO_SERVER]);
              } else {
                this.snackbarService.showError('Error login with keycloak: ' + errorReceived.description);
                this.router.navigate([Routing.NO_SERVER]);
              }
            
          }
        });
      },
      error:  (error) => {
        this.loggerService.log(error);
        this.snackbarService.showError(error.description);
        if (!error.redirect) {
          this.router.navigate([Routing.LOGIN]);
        }
      }
    });
  }

  checkGithubAvailable() {
    this.showLogin = true;
    this.samlService.getSSOUrl().subscribe(ssoUrl => {
      this.ssoUrl = ssoUrl;

      if (this.autoLogon === true && this.ssoUrl !== '') {
        document.location.href = this.ssoUrl;
      } else {

        this.githubOauthService.getGithubOAuthAvailable().subscribe(response => {
          this.showGitHubLogin = response;
          if(!this.showGitHubLogin){
            this.loginWithCredential = true;
            this.isLocalPlatform = true;
          }
          this.showLogin = true;
        }, () => {
          this.showLogin = true;
        });
        this.showLogin = true;
      }
    },
      () => {
        this.ssoUrl = '';
        this.showLogin = true;
      });
  }

  displayLoginWithCredential() {
    if (this.showGitHubLogin) {
      if (this.loginWithCredential) {
        this.loginWithCredential = false;
      } else {
        this.loginWithCredential = true;
      }
    }
  }
  openLoginInfos(logoPath: string) {
    const data = {logoPath: logoPath, platform: this.platform}
    this.dialog.open(LoginInformationDialogComponent, {
      data: data
    });
  }

  submit() {
    this.loadingLogin = true;
    const username = this.loginForm.get('username').value;
    const password = this.loginForm.get('password').value;
    this.auth.authenticate(username, password).subscribe(
      () => {
        this.snackbarService.closeSnackbarIfOpened();
        this.router.navigate([Routing.HOME]);
        this.loadingLogin = false;

      },
      (error) => {
        if (error.status == 502 || error.status == 0) {
          // err.status == 0 can only appear on local
          this.router.navigate([Routing.NO_SERVER]);        
        } else {
           this.snackbarService.showError('Error at login : ' + error.error.description);
        }
        this.loadingLogin = false;
      }
    );
  }

  loginWithGithub() {
    this.loadingLogin = true;
    this.githubOauthService.getGithubOAuthUrl().subscribe({
      next: (githubOauthUrl) => {
        this.snackbarService.closeSnackbarIfOpened();
        document.location.href = githubOauthUrl;
        this.loadingLogin = false;
      },
      error: (error) => {
        if (error.statusCode == 502) {
          this.router.navigate([Routing.NO_SERVER]);        
        } else {
          this.snackbarService.showError('Error at GitHub login : ' + error.name);
        }
        this.loadingLogin = false;
      }
    });
  }
}
