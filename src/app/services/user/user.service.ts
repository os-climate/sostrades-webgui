import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserApplicationRight } from 'src/app/models/user.model';
import { UserProfile } from 'src/app/models/user-profile';
import { Location } from '@angular/common';
import { DataHttpService } from '../http/data-http/data-http.service';


@Injectable({
  providedIn: 'root'
})
export class UserService extends DataHttpService {

  private currentUser: UserApplicationRight;
  public allUsers: User[];
  public newUser: boolean;
  public mailSend: boolean;

  constructor(private http: HttpClient, private location: Location) {
    super(location, 'user');
    this.currentUser = null;
    this.newUser = false;
    this.mailSend = false;
    this.allUsers = [];
  }

  createUser(user: User): Observable<any> {
    return this.http.post<User>(`${this.apiRoute}`, JSON.stringify(user), this.options);
  }

  updateUser(user: User): Observable<any> {
    return this.http.post( `${this.apiRoute}/${user.id}`, JSON.stringify(user), this.options);

  }

  loadAllUsers(): Observable<User[]> {
    const userList: User[] = [];

    return this.http.get<User[]>(`${this.apiRoute}`).pipe(map(
      usList => {
        usList.forEach(user => {
          const newUser = User.Create(user);
          userList.push(newUser);
        });
        this.allUsers = userList;
        return userList;
      }));
  }

  getUserList(): Observable<User[]> {
    const userList: User[] = [];

    return this.http.get<User[]>(`${this.apiRoute}`).pipe(map(
      usList => {
        usList.forEach(user => {
          const newUser = User.Create(user);
          userList.push(newUser);
        });
        return userList;
      }));
  }

  getUserProfiles(): Observable<UserProfile[]> {
    const userProfileList: UserProfile[] = [];

    return this.http.get<UserProfile[]>(`${this.apiRoute}/profile`).pipe(map(
      usProfileList => {
        usProfileList.forEach(userProfile => {
          userProfileList.push(userProfile);
        });
        return userProfileList;
      }));
  }

  setCurrentUser(user: UserApplicationRight) {
    this.currentUser = user;
  }

  getCurrentUser(): Observable<UserApplicationRight> {
    return this.http.get<UserApplicationRight>(`${this.apiRoute}/current-user`);
  }

  changePassword(password: String, token: String): Observable<void> {

    const changeOptions = {
      headers: this.httpHeaders
    };

    const body = {
      password: password,
      token: token
    };

    return this.http.post<void>(`${this.apiRoute}/change-password`, body, changeOptions);
  }

  resetPassword(userId: number): Observable<string> {

    const resetOptions = {
      headers: this.httpHeaders,
    };

    const body = {
      user_identifier: userId
    };

    return this.http.post<string>(`${this.apiRoute}/reset-password`, body, resetOptions);
  }

  deleteUserFromAuthorizedList(userId: number): Observable<any> {

    const deleteOptions = {
      headers: this.httpHeaders,
      body: JSON.stringify({ user_id: userId })
    };

    return this.http.delete(`${this.apiRoute}`, deleteOptions);
  }

  hasAccessToAdmin(): boolean {
    let isAdmin = false;

    if (this.currentUserExist()) {
      if (this.currentUser.modules.filter(x => x === 'ADMIN').length === 1) {
        isAdmin = true;
      }
    }

    return isAdmin;
  }

  hasAccessToStudy(): boolean {
    let isStudyAuth = false;
    if (this.currentUserExist()) {
      if (this.currentUser.modules.filter(x => x === 'STUDY').length === 1) {
        isStudyAuth = true;
      }
    }

    return isStudyAuth;
  }

  hasAccessToStudyManager(): boolean {
    let isStudyAuth = false;
    if (this.currentUserExist()) {
      if (this.currentUser.modules.filter(x => x === 'STUDY_MANAGER').length === 1) {
        isStudyAuth = true;
      }
    }

    return isStudyAuth;
  }

  getFullUsername(): string {
    if (this.currentUserExist()) {
      return `${this.currentUser.user.firstname} ${this.currentUser.user.lastname}`;
    } else {
      return '';
    }
  }

  getFirstname(): string {
    if (this.currentUserExist()) {
      return `${this.currentUser.user.firstname}`;
    } else {
      return '';
    }
  }

  currentUserExist(): boolean {
    if (this.currentUser !== null && this.currentUser !== undefined) {
      return true;
    } else {
      return false;
    }
  }

  getCurrentUserId(): number {
    return this.currentUser.user.id;
  }
}
