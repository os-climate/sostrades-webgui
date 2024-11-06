import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakOAuthService extends DataHttpService {
  public keycloakAvailable: boolean
  constructor(
    private http: HttpClient,
    private location: Location) {
      super(location, 'keycloak/oauth');
      this.keycloakAvailable = null;
   }

  getKeycloakOAuthAvailable(): Observable<boolean> {
    if (this.keycloakAvailable == null) {
      return this.http.get<boolean>(`${this.apiRoute}/available`).pipe(map(
      response => { 
        this.keycloakAvailable = response
        return this.keycloakAvailable
      }));
    }
    else {
      return of(this.keycloakAvailable)
    }
    
  }

  getKeycloakOAuthUrl(): Observable<string> {
    return this.http.get<string>(`${this.apiRoute}/authenticate`);
  }
  
  logout_url(): Observable<string> {
    return this.http.get<string>(`${this.apiRoute}/logout-url`);
  }

  gotoKeycloakProfile(): Observable<string> {
    return this.http.get<string>(`${this.apiRoute}/profile`);
  }
}
