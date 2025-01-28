import { Component } from '@angular/core';
import { LogoPath } from 'src/app/models/logo-path.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-app-loading',
  templateUrl: './user-app-loading.component.html',
  styleUrls: ['./user-app-loading.component.scss']
})
export class UserAppLoadingComponent {
  public environment = environment;
  public logoPath = LogoPath;

}
