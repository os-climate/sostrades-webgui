import { Component } from '@angular/core';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { KeycloakOAuthService } from 'src/app/services/keycloak-oauth/keycloak-oauth.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-authentication-error',
  templateUrl: './authentication-error.component.html',
  styleUrls: ['./authentication-error.component.scss']
})
export class AuthenticationErrorComponent {

  public keycloakAvailable: boolean;
  environment = environment;
  public platform: string;
  constructor(
    private keycloakOauthService:KeycloakOAuthService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private appDataService: AppDataService,
  ) {
    this.platform = '';
    this.keycloakAvailable = false;
    }
  OnInit(): void {
    this.keycloakOauthService.getKeycloakOAuthAvailable().subscribe(
      response => {
        this.keycloakAvailable = response;
      }
    );
    if (this.appDataService.platformInfo !== null && this.appDataService.platformInfo !== undefined) {
      this.platform = this.appDataService.platformInfo.platform;
    } else {
        this.appDataService.getAppInfo().subscribe(platformInfo => {
          if (platformInfo !== null && platformInfo !== undefined) {
            this.platform = platformInfo.platform;
          }
        });
    }
  }

  logout() {
      this.keycloakOauthService.logout_url().subscribe({
        next: (keycloakLogoutURL) => {
          document.location.href = keycloakLogoutURL;
        },
        error: (error) => {
          if (error.statusCode == 502 || error.statusCode == 0) {
            this.snackbarService.showError('No response from server');
          } else {
            this.snackbarService.showError('Error Keycloak logout : ' + error.description);
          }
        }
      });

    }
  }


