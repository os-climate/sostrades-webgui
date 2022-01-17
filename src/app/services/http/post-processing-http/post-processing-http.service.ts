import { Location } from '@angular/common';
import { BaseHttpService } from '../base-http/base-http.service';
import { environment } from 'src/environments/environment';

export class PostProcessingHttpService  extends BaseHttpService {

  constructor(
    location: Location,
    private serviceName: string) {

    super(location, 'post-processing', environment.API_POST_PROCESSING_URL);
  }

  public get apiRoute(): string {
    return `${super.apiRoute}/${this.serviceName}`;
  }
}
