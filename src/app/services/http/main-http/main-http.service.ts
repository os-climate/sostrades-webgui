import { Location } from '@angular/common';
import { BaseHttpService } from '../base-http/base-http.service';
import { environment } from 'src/environments/environment';

export class MainHttpService  extends BaseHttpService {

  constructor(
    location: Location,
    private serviceName: string) {

    super(location, 'main', environment.API_MAIN_URL);
  }

  public get apiRoute(): string {
    return `${super.apiRoute}/${this.serviceName}`;
  }
}
