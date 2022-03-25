import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from './user/user.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { Routing } from '../models/routing.model';


@Injectable({
  providedIn: 'root'
})
export class NoAccessGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.userService.hasAccessToStudy()) {
      return true;
    } else {
      this.router.navigate([Routing.MODELS_STATUS]);
    }
  }
}
