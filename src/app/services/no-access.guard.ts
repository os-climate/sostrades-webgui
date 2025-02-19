import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user/user.service';
import { Routing } from '../models/enumeration.model';

@Injectable({
  providedIn: 'root'
})
export class NoAccessGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(): boolean {
    if (!this.userService.hasAccessToStudy()) {
      return true;
    } else {
      this.router.navigate([Routing.HOME]);
    }
  }
}
