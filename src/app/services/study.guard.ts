import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from './user/user.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { Routing } from '../models/routing';


@Injectable({
  providedIn: 'root'
})
export class StudyGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router, private snackbarService: SnackbarService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.userService.hasAccessToStudy()) {
      return true;
    } else {
      this.router.navigate([Routing.NO_ACCESS]);
    }
  }
}
