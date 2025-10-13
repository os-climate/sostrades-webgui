import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class ProxyMapService extends DataHttpService {

  constructor(
    private http: HttpClient,
    private location: Location) {
      super(location, 'proxy-map');
   }

  
}
