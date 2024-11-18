import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { ValidationDialogData, UserCreateDialogData, EditionDialogData } from 'src/app/models/dialog-data.model';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { CreateUserComponent } from '../user-creation/user-creation.component';
import { UserProfile } from 'src/app/models/user-profile';
import { MatSort } from '@angular/material/sort';
import { EditionFormDialogComponent } from 'src/app/shared/edition-form-dialog/edition-form-dialog.component';
import { ColumnName, DialogEditionName } from 'src/app/models/enumeration.model';
import { KeycloakOAuthService } from 'src/app/services/keycloak-oauth/keycloak-oauth.service';
import { FilterTableService } from 'src/app/services/filter-table/filter-table.service';


class UpdateUserResponse {
  newProfile: boolean;
  mailSend: boolean;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  public isLoading: boolean;
  public displayedColumns = [
    ColumnName.USERNAME, 
    ColumnName.FIRST_NAME, 
    ColumnName.LAST_NAME,
    ColumnName.EMAIL,
    ColumnName.USER_PROFILE_NAME,
    ColumnName.ACTION
  ];
  public colummnsFilter = [
    ColumnName.USERNAME, 
    ColumnName.FIRST_NAME, 
    ColumnName.LAST_NAME,
    ColumnName.EMAIL,
    ColumnName.USER_PROFILE_NAME  
  ];
  public columnValuesDict = new Map <ColumnName, string[]>();
  public colummnsDictForTitleSelection = new Map <ColumnName, string>();
  public dataSourceUsers = new MatTableDataSource<User>();
  public usersList: User[];
  public usersProfilesList: UserProfile[];
  public keycloakAvailable: boolean;
  public columnName = ColumnName;

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceUsers.sort = v;
  }

  constructor(
    private dialog: MatDialog,
    public userService: UserService,
    private snackbarService: SnackbarService,
    private keycloakOauthService: KeycloakOAuthService,
    private loadingDialogService: LoadingDialogService,
    private filterTableService: FilterTableService
  ) {
    this.usersList = [];
    this.usersProfilesList = [];
    this.isLoading = true;
    this.keycloakAvailable = false;
  }

  ngOnInit(): void {
    this.keycloakOauthService.getKeycloakOAuthAvailable().subscribe(
      response => {
        this.keycloakAvailable = response
      }
    )

    // Retrieving user list
    this.userService.loadAllUsers().subscribe({
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
            this.columnValuesDict = this.filterTableService.setColumnValuesDict(this.displayedColumns);
            this.colummnsDictForTitleSelection = this.filterTableService.setcolummnsDictForTitleSelection(this.colummnsFilter);
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
      data: validationDialogData
    });

    dialogRefValidate.afterClosed().subscribe(result => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if ((validationData !== null) && (validationData !== undefined)) {
        if (validationData.cancel === false) {
          this.loadingDialogService.showLoading(`Deletion of user "${user.username}"`);
          this.userService.deleteUserFromAuthorizedList(user.id).subscribe({
            next: () => {
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
            data: validationDialogData
          });
        }
      }
    });
  }

  updateUser(user: User) {
    const dialogData: EditionDialogData = new EditionDialogData();
    dialogData.userUpdated = user;
    dialogData.editionDialogName = DialogEditionName.EDITION_USER;


    const dialogRef = this.dialog.open(EditionFormDialogComponent, {
      disableClose: true,
      width: '350px',
      height: '450px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      
      const resultUpdateUser = result as EditionDialogData;
      if ((resultUpdateUser !== null) && (resultUpdateUser !== undefined)) {
        if (resultUpdateUser.cancel === false && resultUpdateUser.userUpdated !== null && resultUpdateUser.userUpdated !== undefined) {

          this.userService.updateUser(resultUpdateUser.userUpdated).subscribe({
            
            next: (res) => {
              const resUpdate = res as UpdateUserResponse;
              this.loadingDialogService.closeLoading();
              if (user.userprofile === null) {
                user.userprofilename = 'No profile';
              } else {
                user.userprofilename = this.usersProfilesList.filter(x => x.id === user.userprofile)[0].name;
              }
              if (resUpdate.newProfile) {
                if (resUpdate.mailSend) {
                  // eslint-disable-next-line max-len
                  this.snackbarService.showInformation(`Update of user "${resultUpdateUser.userUpdated.username}" successfull, and notification mail successfully sent.`);
                } else {
                  // eslint-disable-next-line max-len
                  this.snackbarService.showWarning(`Update of user "${resultUpdateUser.userUpdated.username}" successfull, but server was unable to notify user by mail.`);
                }
              } else {
                this.snackbarService.showInformation(`Update of user "${resultUpdateUser.userUpdated.username}" successfull`);
              }
              user.username = resultUpdateUser.userUpdated.username;
              user.email = resultUpdateUser.userUpdated.email;
              user.firstname = resultUpdateUser.userUpdated.firstname;
              user.lastname = resultUpdateUser.userUpdated.lastname;
              user.userprofile = resultUpdateUser.userUpdated.userprofile;
            
            },
            error: (errorReceived) => {
              this.loadingDialogService.closeLoading();
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.snackbarService.showError(error.description);
              } else {
                this.snackbarService.showError(`Error updating user : ${error.description}`);
              }
            }
          });
        }
      }
    

      
    });
  }
}
