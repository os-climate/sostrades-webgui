import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakOAuthService extends DataHttpService {

  constructor(
    private http: HttpClient,
    private location: Location) {
      super(location, 'keycloak/oauth');
   }

  getKeycloakOAuthAvailable(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiRoute}/available`);
  }

  getKeycloakOAuthUrl(): Observable<string> {
    return this.http.get<string>(`${this.apiRoute}/authenticate`);
  } 
}
