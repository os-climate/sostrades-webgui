import { HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';


export abstract class BaseHttpService {

  private static BASE_API_ROUTE = 'api';

  httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  });

  protected options = {
    headers: this.httpHeaders
  };

  private baseApiRoute: string;

  constructor(location: Location,
    serviceName: string,
    baseUrl: string) {
    if (baseUrl === '') {
      this.baseApiRoute = location.prepareExternalUrl(`${BaseHttpService.BASE_API_ROUTE}/${serviceName}`);
    } else {
      this.baseApiRoute = `${baseUrl}/${BaseHttpService.BASE_API_ROUTE}/${serviceName}`;
    }
  }


  public get apiRoute(): string {
    return this.baseApiRoute;
  }
}
