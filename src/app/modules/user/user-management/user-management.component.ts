import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { ValidationDialogData, UserCreateDialogData, UserUpdateDialogData } from 'src/app/models/dialog-data.model';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { CreateUserComponent } from '../user-creation/user-creation.component';
import { UserUpdateComponent } from '../user-update/user-update.component';
import { UserProfile } from 'src/app/models/user-profile';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  public isLoading: boolean;
  public displayedColumns = ['username', 'firstname', 'lastname', 'email', 'userprofilename', 'actions'];
  public colummnsFilter = ['All columns', 'Username', 'First name', 'Last name', 'Email', 'Profile'];
  public columnsFilterSelected: string;
  public dataSourceUsers = new MatTableDataSource<User>();
  public usersList: User[];
  public usersProfilesList: UserProfile[];

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceUsers.sort = v;
  }

  constructor(
    private dialog: MatDialog,
    public userService: UserService,
    private snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService) {
    this.usersList = [];
    this.usersProfilesList = [];
    this.columnsFilterSelected = 'All columns';
    this.isLoading = true;
  }

  ngOnInit(): void {
    // Initialising filter with 'All columns'
    this.onFilterChange();

    // Retrieving user list
    this.userService.getUserList().subscribe({
      next: (users) => {
        this.usersList = users;
    
        this.userService.getUserProfiles().subscribe({
          next: (userProfiles) => {
            this.usersProfilesList = userProfiles;
    
            this.usersList.forEach((user) => {
              if (user.userprofile === null) {
                user.userprofilename = 'No profile';
              } else {
                user.userprofilename = this.usersProfilesList.filter((x) => x.id === user.userprofile)[0].name;
              }
            });
            this.dataSourceUsers = new MatTableDataSource<User>(this.usersList);
            this.dataSourceUsers.sortingDataAccessor = (item, property) =>
              typeof item[property] === 'string' ? item[property].toLowerCase() : item[property];
            this.dataSourceUsers.sort = this.sort;
            this.isLoading = false;
          },
          error: (errorReceived) => {
            this.isLoading = false;
            const error = errorReceived as SoSTradesError;
            if (error.redirect) {
              this.snackbarService.showError(error.description);
            } else {
              this.snackbarService.showError('Error loading users profiles list : ' + error.description);
            }
          }
        });
      },
      error: (errorReceived) => {
        this.isLoading = false;
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading users list : ' + error.description);
        }
      }
    });
  }

  deleteUserAuthorizedList(user: User) {

    // Prevent admin from deleting user
    const validationDialogData = new ValidationDialogData();
    // eslint-disable-next-line max-len
    validationDialogData.message = `You are about to delete the user "${user.username}". This will delete user private groups (user is the only member of the group) and studies related, proceed ?`;

    const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,

      width: '500px',
      height: '220px',
      data: validationDialogData
    });

    dialogRefValidate.afterClosed().subscribe(result => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if ((validationData !== null) && (validationData !== undefined)) {
        if (validationData.cancel === false) {
          this.loadingDialogService.showLoading(`Deletion of user "${user.username}"`);
          this.userService.deleteUserFromAuthorizedList(user.id).subscribe({
            next: (res) => {
              // Update table
              this.usersList = this.usersList.filter((x) => x.id !== user.id);
              this.dataSourceUsers = new MatTableDataSource<User>(this.usersList);
              this.loadingDialogService.closeLoading();
              this.snackbarService.showInformation(`Deletion of user "${user.username}" successful`);
            },
            error: (errorReceived) => {
              this.loadingDialogService.closeLoading();
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.snackbarService.showError(error.description);
              } else {
                this.snackbarService.showError(`Error deleting user "${user.username}" : ${error.description}`);
              }
            }
          });
        }
      }
    });
  }

  resetPassword(user: User) {
    // Ask for a confirmation
    const validationDialogData = new ValidationDialogData();
    // eslint-disable-next-line max-len
    validationDialogData.message = `You are about to reset the user "${user.username}" password. proceed ?`;

    const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,

      width: '500px',
      height: '220px',
      data: validationDialogData
    });

    dialogRefValidate.afterClosed().subscribe(result => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if ((validationData !== null) && (validationData !== undefined)) {
        if (validationData.cancel === false) {
          this.loadingDialogService.showLoading(`Reset user "${user.username}" password`);
          this.userService.resetPassword(user.id).subscribe({
            next: (res) => {
              validationDialogData.title = "Informations"
              validationDialogData.message = `The following password reset link has been generated.\nSend it to the user to let him change its password.\n${res}`;
              validationDialogData.showCancelButton = false;
              this.dialog.open(ValidationDialogComponent, {
                disableClose: true,
                width: '500px',
                height: '220px',
                data: validationDialogData
              });
              this.loadingDialogService.closeLoading();
              this.snackbarService.showInformation(`${user.username} password has been successfully reset`);
            },
            error: (errorReceived) => {
              this.loadingDialogService.closeLoading();
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.snackbarService.showError(error.description);
              } else {
                this.snackbarService.showError(`Error resetting user "${user.username}" password : ${error.description}`);
              }
            }
          });
        }
      }
    });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceUsers.filter = filterValue.trim().toLowerCase();
  }

  onFilterChange() {
    this.dataSourceUsers.filterPredicate = (data: User, filter: string): boolean => {

      switch (this.columnsFilterSelected) {
        case 'Username':
          return data.username.trim().toLowerCase().includes(filter);
        case 'First name':
          return data.firstname.trim().toLowerCase().includes(filter);
        case 'Last name':
          return data.lastname.trim().toLowerCase().includes(filter);
        case 'Email':
          return data.email.trim().toLowerCase().includes(filter);
        case 'Profile':
          return data.userprofilename.trim().toLowerCase().includes(filter);
        default:
          return data.username.trim().toLowerCase().includes(filter) ||
            data.firstname.trim().toLowerCase().includes(filter) ||
            data.lastname.trim().toLowerCase().includes(filter) ||
            data.email.trim().toLowerCase().includes(filter) ||
            data.userprofilename.trim().toLowerCase().includes(filter);
      }
    };
  }

  addUser() {
    const createDialogData = new UserCreateDialogData();
    const dialogRef = this.dialog.open(CreateUserComponent, {
      disableClose: true,
      width: '350px',
      height: '450px',
      data: createDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const resultCreateUser = result as UserCreateDialogData;

      if ((resultCreateUser !== null) && (resultCreateUser !== undefined)) {
        if (resultCreateUser.cancel === false && resultCreateUser.userCreated !== null && resultCreateUser.userCreated !== undefined) {
          const user = resultCreateUser.userCreated;

          if (user.userprofile === null) {
            user.userprofilename = 'No profile';
          } else {
            user.userprofilename = this.usersProfilesList.filter(x => x.id === user.userprofile)[0].name;
          }

          this.usersList.push(user);
          this.dataSourceUsers = new MatTableDataSource<User>(this.usersList);

          const validationDialogData = new ValidationDialogData();
          validationDialogData.title = "Informations"
          validationDialogData.message = `Creation of user "${user.username}" successful.\nThe following password reset link has been generated.\nSend it to the user to let him change its password.\n${resultCreateUser.passwordLink}`;
          validationDialogData.showCancelButton = false;
          this.dialog.open(ValidationDialogComponent, {
            disableClose: true,

            width: '500px',
            height: '220px',
            data: validationDialogData
          });
        }
      }
    });
  }

  updateUser(user: User) {
    const updateDialogData = new UserUpdateDialogData();
    updateDialogData.userUpdated = user;

    const dialogRef = this.dialog.open(UserUpdateComponent, {
      disableClose: true,
      width: '350px',
      height: '450px',
      data: updateDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const resultUpdateUser = result as UserUpdateDialogData;

      if ((resultUpdateUser !== null) && (resultUpdateUser !== undefined)) {
        if (resultUpdateUser.cancel === false && resultUpdateUser.userUpdated !== null && resultUpdateUser.userUpdated !== undefined) {

          user.username = resultUpdateUser.userUpdated.username;
          user.email = resultUpdateUser.userUpdated.email;
          user.firstname = resultUpdateUser.userUpdated.firstname;
          user.lastname = resultUpdateUser.userUpdated.lastname;
          user.userprofile = resultUpdateUser.userUpdated.userprofile;

          if (user.userprofile === null) {
            user.userprofilename = 'No profile';
          } else {
            user.userprofilename = this.usersProfilesList.filter(x => x.id === user.userprofile)[0].name;
          }
        }
      }
    });
  }
}
