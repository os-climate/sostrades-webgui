import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user/user.service';
import { SnackbarService } from './snackbar/snackbar.service';
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router, private snackbarService: SnackbarService) {
  }

  canActivate(): boolean {

    if (this.userService.hasAccessToAdmin()) {
      return true;
    } else {
      this.snackbarService.showError('You don\'t have the permission to access this ressource');
    }
  }
}
