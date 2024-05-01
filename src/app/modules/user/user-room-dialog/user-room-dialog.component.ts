import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UsersRoomDialogData } from 'src/app/models/dialog-data.model';
import { User } from 'src/app/models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';

import { UserService } from 'src/app/services/user/user.service';
import { CoeditionNotification, CoeditionType } from 'src/app/models/coedition-notification.model';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

@Component({
  selector: 'app-user-room-dialog',
  templateUrl: './user-room-dialog.component.html',
  styleUrls: ['./user-room-dialog.component.scss']
})

export class UserRoomDialogComponent implements OnInit, OnDestroy {

  private onRoomUserUpdateSubscription: Subscription;
  private onNewNotificationSubscription: Subscription;

  public displayedColumns = ['firstname', 'lastname', 'execution'];
  public dataSourceUsers = new MatTableDataSource<User>();

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceUsers.sort = v;
  }

  constructor(
    private socketService: SocketService,
    public userService: UserService,
    public studyCaseDataService: StudyCaseDataService,
    public dialogRef: MatDialogRef<UserRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsersRoomDialogData) {
    this.onRoomUserUpdateSubscription = null;
    this.onNewNotificationSubscription = null;
  }

  ngOnInit(): void {
    this.dataSourceUsers = new MatTableDataSource<User>(this.data.users);
    this.dataSourceUsers.sortingDataAccessor = (item, property) => {
      return typeof item[property] === 'string' ? item[property].toLowerCase() : item[property];
    };
    this.dataSourceUsers.sort = this.sort;

    this.onRoomUserUpdateSubscription = this.socketService.onRoomUserUpdate.subscribe(users => {
      this.dataSourceUsers = new MatTableDataSource<User>(users);
    });

    this.onNewNotificationSubscription = this.socketService.onNewNotification.subscribe(notification => {
      const notif = notification as CoeditionNotification;

      if (notification.type === CoeditionType.CLAIM) {
        this.dataSourceUsers = new MatTableDataSource<User>(this.dataSourceUsers.data);
      }
    });
  }
  ngOnDestroy() {
    if (this.onRoomUserUpdateSubscription !== null) {
      this.onRoomUserUpdateSubscription.unsubscribe();
      this.onRoomUserUpdateSubscription = null;
    }
    if (this.onNewNotificationSubscription !== null && this.onNewNotificationSubscription !== undefined) {
      this.onNewNotificationSubscription.unsubscribe();
      this.onNewNotificationSubscription = null;
    }
  }

  okClick() {
    this.dialogRef.close();
  }
}
