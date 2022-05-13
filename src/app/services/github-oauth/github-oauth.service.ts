import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  isGithubOAuthAvailable(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiRoute}`);
  }

  loginWithGitHubOAuth() {
    this.http.get(`${this.apiRoute}/authorize`).subscribe();
  }
}
