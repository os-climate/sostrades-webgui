import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { SoSTradesError } from '../models/sos-trades-error.model';
import { LoggerService } from './logger/logger.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { Routing } from '../models/routing.model';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private auth: AuthService,
    private router: Router,
    private loggerService: LoggerService,
    private snackBarService: SnackbarService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // tslint:disable-next-line: max-line-length
    if (!/.*\/api\/data\/auth\/.*/.test(request.url) && !/.*\/api\/data\/application\/info.*/.test(request.url) && !/.*\/api\/data\/saml\/.*/.test(request.url)) {
      if (this.auth.isAuthenticated()) {
        request = this.addToken(request, this.auth.getJwtToken());
      }
      return next.handle(request).pipe(
        catchError((err) => {
          const error = this.convertToSoSTradesError(err);


          if (error.statusCode === 401) { // User not authenticated
            return this.handle401Error(request, next);
          }
          this.loggerService.log(err);
          // Let caller manage the error, as if the router route to another page
          // Keep in mind this is to avoid undefined return on this observable and
          // that service caller  has something to manage
          // 'redirect' on SoSTradesError object allow to know if the router has already been engage
          return throwError(error);

        })
      );
    } else {
      return next.handle(request);
    }
  }

  private addToken(request: HttpRequest<any>, accessToken: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.auth.refreshAccessToken().pipe(
        switchMap(_ => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(this.auth.getJwtToken());
          return next.handle(this.addToken(request, this.auth.getJwtToken()));
        }),
        catchError(err => {
          const error = this.convertToSoSTradesError(err)
          this.router.navigate([Routing.LOGIN]);
          this.auth.deauthenticate();
          error.redirect = true;
          this.snackBarService.showError(error.description);
          return of(error);
        }));

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }

  private convertToSoSTradesError(err: any): SoSTradesError {
    let error: SoSTradesError = null;

    if (err instanceof SoSTradesError) {
      error = err;
    } else if (err.error.statusCode) {
      error = SoSTradesError.Create(err.error);
    } else if (err.error instanceof ArrayBuffer) { // Case request with arraybuffer response type
      const decodedErr = String.fromCharCode.apply(null, new Uint8Array(err.error));
      const errContent = JSON.parse(decodedErr);
      if (errContent.statusCode && errContent.description && errContent.name) {
        error = new SoSTradesError(errContent.statusCode, errContent.name, errContent.description);
      } else { // Error Unknown
        if (err instanceof HttpErrorResponse) {
          const errHttp = err as HttpErrorResponse;
          error = new SoSTradesError(errHttp.status, 'Unknown error', errHttp.message);
        } else {
          error = new SoSTradesError(err.status, 'Unknown error', err.error);
        }
      }
    } else { // Error Unknown
      if (err instanceof HttpErrorResponse) {
        const errHttp = err as HttpErrorResponse;
        error = new SoSTradesError(errHttp.status, 'Unknown error', errHttp.message);
      } else {
        error = new SoSTradesError(err.status, 'Unknown error', err.error);
      }
    }
    return error;
  }
}
