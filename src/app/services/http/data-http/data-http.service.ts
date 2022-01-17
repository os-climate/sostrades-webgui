import { BaseHttpService } from '../base-http/base-http.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

export class DataHttpService extends BaseHttpService {

  constructor(
    location: Location,
    private serviceName: string) {
      super(location, 'data', environment.API_DATA_URL);
  }

  public get apiRoute(): string {
    return `${super.apiRoute}/${this.serviceName}`;
  }
}
