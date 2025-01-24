import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Routing } from 'src/app/models/enumeration.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';


@Component({
  selector: 'app-no-server',
  templateUrl: './no-server.component.html',
  styleUrls: ['./no-server.component.scss']
})
export class NoServerComponent implements OnInit {

  public platform : string;
  public isLoading: boolean;
  private connectionStatusTimer: any;
  constructor(
    private router: Router,
    private appDataService: AppDataService,
    private snackbarService: SnackbarService,
  ) {
    this.platform = '';
    this.isLoading = false;
    this.connectionStatusTimer = null;
   }

  ngOnInit() {
    if ((this.appDataService.platformInfo !== null && this.appDataService.platformInfo !== undefined) && this.appDataService.platformInfo.platform.trim() !== "") {
      this.platform = this.appDataService.platformInfo.platform
    } else {
      const host = window.location.host;
      if (host.includes('localhost:')) {
        this.platform = 'Local'
      } else {
        const urlPart = host.split('.');
        this.platform = urlPart[0].charAt(0).toUpperCase() + urlPart[0].slice(1);
      }
    }
    
    this.startConnectionStatusTimer();
  }

  private startConnectionStatusTimer() {

    this.connectionStatusTimer = setTimeout(() => {
      this.appDataService.getAppInfo().subscribe({
        next: (platformInfo) => {
          if (platformInfo !== null && platformInfo !== undefined) {
            this.stopConnectionStatusTimer();
            this.router.navigate([Routing.LOGIN]);
            this.snackbarService.showInformation(`The platform "${this.platform.charAt(0).toUpperCase() + this.platform.slice(1)}" turn on`);
          }
        },
        error: (error) => {
          if (error.status == 502 || error.status == 0) {
            this.startConnectionStatusTimer();
          } else {
            this.snackbarService.showError('Error getting application info : ' + error.statusText);
          }
        }
      });
    }, 5000);
  }

  private stopConnectionStatusTimer() {
    if (this.connectionStatusTimer) {
      clearTimeout(this.connectionStatusTimer);
      this.connectionStatusTimer = null;
    }
  }

  goToLogin(){
    this.isLoading = true;
    this.appDataService.getAppInfo().subscribe({
      next: (platformInfo) => {
        if (platformInfo !== null && platformInfo !== undefined) {
          this.platform = platformInfo.platform;
          this.snackbarService.showInformation(`The platform "${this.platform.charAt(0).toUpperCase() + this.platform.slice(1)}" turned on`);
          this.router.navigate([Routing.LOGIN]);
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackbarService.showWarning(`The platform is still down, you will be redirected to the Login page in a few minutes.`);
        this.isLoading = false;
      }
    });
  }
}
