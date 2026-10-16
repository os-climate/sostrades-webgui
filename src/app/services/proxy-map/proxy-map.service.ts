import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { BaseHttpService } from '../http/base-http/base-http.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProxyMapService extends BaseHttpService {

  constructor(
      location: Location) {
        super(location, 'proxy-map', environment.API_DATA_URL);
    }
  
    public get apiRoute(): string {
      return `${super.apiRoute}`;
    }

  
}
