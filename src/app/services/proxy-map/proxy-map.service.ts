import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { BaseHttpService } from '../http/base-http/base-http.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProxyMapService extends BaseHttpService {

  constructor(
      location: Location,
      private serviceName: string) {
        super(location, 'proxy-map', '');
    }
  
    public get apiRoute(): string {
      return `${super.apiRoute}/${this.serviceName}`;
    }
  
}
