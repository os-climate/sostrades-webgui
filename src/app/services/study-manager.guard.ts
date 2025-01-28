import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user/user.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { Routing } from '../models/enumeration.model';

@Injectable({
  providedIn: 'root'
})
export class StudyManagerGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router, private snackbarService: SnackbarService) {
  }

  canActivate(): boolean {

    if (this.userService.hasAccessToStudyManager()) {
      return true;
    } else {
      this.router.navigate([Routing.HOME]);
      this.snackbarService.showError('You don\'t have the permission to access this ressource');
    }
  }
}
