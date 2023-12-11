import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, mergeMap, finalize } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserApplicationRight } from '../models/user.model';
import { StudyCaseDataService } from './study-case/data/study-case-data.service';
import { UserService } from './user/user.service';
import { Router } from '@angular/router';
import { SocketService } from './socket/socket.service';
import { LoggerService } from './logger/logger.service';
import { ProcessService } from './process/process.service';
import { GroupDataService } from './group/group-data.service';
import { StudyCaseLocalStorageService } from './study-case-local-storage/study-case-local-storage.service';
import { OntologyService } from './ontology/ontology.service';
import { ReferenceDataService } from './reference/data/reference-data.service';
import { StudyCaseValidationService } from './study-case-validation/study-case-validation.service';
import { SoSTradesError } from '../models/sos-trades-error.model';
import { DataHttpService } from './http/data-http/data-http.service';
import { Location } from '@angular/common';
import { Routing } from '../models/routing.model';
import { PostProcessingService } from './post-processing/post-processing.service';

class LoginResponse {
  accessToken: string;
  refreshToken: string;
  newUser: boolean;
  mailSend: boolean;
}

class RefreshResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService extends DataHttpService {

  private jwt: JwtHelperService = new JwtHelperService();
  private authStatus: BehaviorSubject<boolean> = new BehaviorSubject(this.isAuthenticated());

  constructor(
    private processService: ProcessService,
    private ontologyService: OntologyService,
    private groupDataService: GroupDataService,
    private referenceDataService: ReferenceDataService,
    private postProcessing: PostProcessingService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private studyCaseValidationService: StudyCaseValidationService,
    private router: Router,
    private http: HttpClient,
    private socketService: SocketService,
    private studyCaseDataService: StudyCaseDataService,
    private userService: UserService,
    private loggerService: LoggerService,
    private location: Location) {
    super(location, 'auth');
  }

  // Handle authentication errors
  // private errorHandler(error: HttpErrorResponse) {
  //   let errorMessage = '';
  //   console.log(error);
  //   if (error.error instanceof ErrorEvent) {
  //     errorMessage = `authentication error: ${error.error.message}`;
  //   } else {
  //     if (error.status === 403) {
  //       if (error.error && error.error.description) {
  //         errorMessage = error.error.description;
  //       } else {
  //         errorMessage = 'Username or password incorrect';
  //       }
  //     } else if (error.status !== 502) {
  //       if (error instanceof SoSTradesError) {
  //         errorMessage = error.description;
  //       } else {
  //         errorMessage = `bad auth response: ${error.status}: ${error.statusText} ${JSON.stringify(error.error)}`;
  //       }       
  //     }
  //   }
  //   return throwError(errorMessage);
  // }

  // subscribe to get authentication status updates
  subscribe(next: (status: boolean) => void) {
    this.authStatus.subscribe(next);
  }

  // Log user in and get refresh/access tokens
  authenticate(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiRoute}/login`, { username, password })
      .pipe(
        mergeMap(response => {
          // store JWTs

          localStorage.setItem('accessToken', response.accessToken);
          // Setting access token
          localStorage.setItem('refreshToken', response.refreshToken);
          this.userService.newUser = response.newUser;
          this.userService.mailSend = response.mailSend;

          // now get user info
          const opts = {
            headers: new HttpHeaders({
              'Authorization': 'Bearer ' + localStorage.getItem('accessToken')  // tslint:disable-line:object-literal-key-quotes
            })
          };

          return this.userService.getCurrentUser().pipe(
            map(user => {
              const currentUser = UserApplicationRight.Create(user);
              this.userService.setCurrentUser(currentUser);

              this.authStatus.next(true);
            })
          );
        }),
      );
  }

  saml(accessToken: string, refreshToken: string) {

    localStorage.setItem('accessToken', accessToken);
    // Setting access token
    localStorage.setItem('refreshToken', refreshToken);

    // now get user info
    const opts = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')  // tslint:disable-line:object-literal-key-quotes
      })
    };

    return this.userService.getCurrentUser().pipe(
      map(user => {
        const currentUser = UserApplicationRight.Create(user);
        this.userService.setCurrentUser(currentUser);

        this.authStatus.next(true);
      })
    );
  }

  // Log user out, clear stored tokens
  deauthenticate() {
    const opts = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('refreshToken')  // tslint:disable-line:object-literal-key-quotes
      })
    };

    return this.http.post(`${this.apiRoute}/logout`, {}, opts)
      .pipe(
        map(() => {
          // Removing loaded study and closing socket connection
          if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
            this.socketService.leaveRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
            this.studyCaseDataService.setCurrentStudy(null);
          }
          // Cleaning application cache
          this.clearCache();
          this.socketService.closeConnection();
          localStorage.clear();
          this.authStatus.next(false);
        }),
      );
  }

  // Get access token, automatically refresh if necessary
  refreshAccessToken(): Observable<string> {

    const refreshToken = localStorage.getItem('refreshToken');

    const opts = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + refreshToken
      })
    };
    return this.http.post<RefreshResponse>(`${this.apiRoute}/refresh`, {}, opts).pipe(
      map(response => {
        localStorage.setItem('accessToken', response.accessToken);

        this.socketService.updateAuthorization();
        return response.accessToken;
      })
    );
  }

  getJwtToken(): string {
    return localStorage.getItem('accessToken');
  }

  // User is logged in
  isAuthenticated(): boolean {
    return !this.jwt.isTokenExpired(localStorage.getItem('refreshToken'));
  }

  clearCache() {
    this.processService.clearCache();
    this.studyCaseDataService.clearCache();
    this.groupDataService.clearCache();
    this.ontologyService.clearCache();
    this.postProcessing.clearCache();
    this.referenceDataService.clearCache();
    this.studyCaseValidationService.clearCache();
    this.studyCaseLocalStorageService.removeStudiesFromLocalStorage();
    this.studyCaseLocalStorageService.removeStudyUrlRequestedFromLocalStorage();
  }

}
