import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Routing } from 'src/app/models/routing.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';


@Component({
  selector: 'app-no-server',
  templateUrl: './no-server.component.html',
  styleUrls: ['./no-server.component.scss']
})
export class NoServerComponent implements OnInit {

  public platform : string;
  private host : string;
  public isLoading: boolean;
  constructor(
    private router: Router,
    private appDataService: AppDataService,
    private snackbarService: SnackbarService,
  ) {
    this.platform = '';
    this.host = '';
    this.isLoading = false;
   }

  ngOnInit() {
    this.host = window.location.host;
    if (this.host.includes('localhost:')) {
      this.platform = 'local'
    } else {
      const urlPart = this.host.split('.');
      this.platform = urlPart[0];
    }
  }

  goToLogin(){
    this.isLoading = true;
    this.appDataService.getAppInfo().subscribe(res => {
      if (res !== null && res !== undefined) {
        this.platform = res['platform'];
        this.snackbarService.showInformation(`The platform ${this.platform} turn on`);
        this.router.navigate([Routing.LOGIN]);
      }
      this.isLoading =false;
    }, 
    error => {
      if (error.statusCode == 502) {
          this.snackbarService.showWarning(`The platform is still down, please restart in few minutes.`);
      } else {
        this.router.navigate([Routing.LOGIN]);
        this.snackbarService.showError('Error getting application info : ' + error.statusText);
      }
      this.isLoading =false;
    }
  )}
}
