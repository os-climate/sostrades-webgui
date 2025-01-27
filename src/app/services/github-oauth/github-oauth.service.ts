import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class GithubOAuthService extends DataHttpService {

  constructor(
    private http: HttpClient,
    private location: Location) {
      super(location, 'github/oauth');
   }

  getGithubOAuthAvailable(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiRoute}/available`);
  }

  getGithubOAuthUrl(): Observable<string> {
    return this.http.get<string>(`${this.apiRoute}/authorize`);
  } 
}
