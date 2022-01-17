import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class SamlService extends DataHttpService {

  constructor(
    private http: HttpClient,
    private location: Location) {
      super(location, 'saml');
   }

  getSSOUrl(): Observable<string> {
    return this.http.get<string>(`${this.apiRoute}/sso`);
  }

  loginWithSSO() {
    this.http.get(`${this.apiRoute}/sso`).subscribe();
  }
}
