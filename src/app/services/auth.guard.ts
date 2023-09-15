import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { UserService } from './user/user.service';
import { map, finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { UserApplicationRight } from '../models/user.model';
import { StudyCaseLocalStorageService } from './study-case-local-storage/study-case-local-storage.service';
import { Routing } from '../models/routing.model';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  public isLoadingCurrentUser: boolean;

  constructor(
    private auth: AuthService,
    private location: Location,
    private userService: UserService,
    private studyCaseLocalStorage: StudyCaseLocalStorageService,
    private snackbarService: SnackbarService,
    private router: Router) {
    this.isLoadingCurrentUser = false;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.auth.isAuthenticated()) {
      if (!this.userService.currentUserExist()) {
        this.isLoadingCurrentUser = true;
        return this.userService.getCurrentUser().pipe(
          map(user => {
            const currentUser = UserApplicationRight.Create(user);
            this.userService.setCurrentUser(currentUser);
            this.isLoadingCurrentUser = false;

            return true;
          }), finalize(() => {
            if (!this.userService.currentUserExist()) {
              this.router.navigate([Routing.LOGIN]);
              this.snackbarService.showError('Error at reloading your credentials, please log in again');
              this.isLoadingCurrentUser = false;
            }
            
          }));
      } else {

          // Retrieving study access url if it exists and rerouting if appropriated
          const studyUrlRequested = this.studyCaseLocalStorage.getStudyUrlRequestedFromLocalStorage();

          if (studyUrlRequested !== null && studyUrlRequested !== undefined && studyUrlRequested.length > 0) {
            this.studyCaseLocalStorage.removeStudyUrlRequestedFromLocalStorage();
            this.router.navigate([studyUrlRequested]);
          }
          this.studyCaseLocalStorage.removeStudyUrlRequestedFromLocalStorage();
        
          return true;
      }
    } else {
      // Case user try to load study from link and not authenticated
      if (this.location.path().includes('/study/')) {
        // Saving in local storage study requested url
        this.studyCaseLocalStorage.setStudyUrlRequestedInLocalStorage(this.location.path());
      }
      this.router.navigate([Routing.LOGIN], { queryParams: { autologon: '' } });
      // tslint:disable-next-line: max-line-length
      this.snackbarService.showError('Authentication needed : Your access token has expired or you are not authenticated, please login again');
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate([Routing.LOGIN]);
      // tslint:disable-next-line: max-line-length
      this.snackbarService.showError('Authentication needed : Your access token has expired or you are not authenticated, please login again');
    }
  }
}
