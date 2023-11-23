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
  private url : string;
  public isLoading: boolean;
  constructor(
    private router: Router,
    private appDataService: AppDataService,
    private snackbarService: SnackbarService,
  ) {
    this.platform = '';
    this.url = '';
    this.isLoading = false;
   }

  ngOnInit() {
    this.url = window.location.href;
    if (this.url.includes('http://localhost:')) {
      this.platform = 'local'
    } else {
      this.url = this.router.url;
      console.log(this.url);
      const urlPart = this.url.split('.');
      console.log(urlPart);
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
      this.snackbarService.showWarning(`The platform is still down, please restart in few minutes.`);
      this.isLoading =false;
    }
  )}
}
