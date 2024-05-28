import { Component, OnInit, OnDestroy, EventEmitter, LOCALE_ID } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CoeditionNotification, CoeditionType } from 'src/app/models/coedition-notification.model';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { CoeditionDialogData, ExecutionDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseNotificationsChangesDialogComponent } from '../study-case-notifications-changes-dialog/study-case-notifications-changes-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';
import { StudyCaseExecutionDialogComponent } from '../study-case-execution-dialog/study-case-execution-dialog.component';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-study-case-notifications',
  templateUrl: './study-case-notifications.component.html',
  styleUrls: ['./study-case-notifications.component.scss']
})
export class StudyCaseNotificationsComponent implements OnInit, OnDestroy {

  public onNewNotificationSubscription: Subscription;

  public dataSourceNotifications = new MatTableDataSource<CoeditionNotification>();
  displayedColumns = ['created', 'author', 'type', 'message', 'changes'];
  private dialogRef: MatDialogRef<StudyCaseExecutionDialogComponent>;
  private dialogRefNotificationChanges: MatDialogRef<StudyCaseNotificationsChangesDialogComponent>;


  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private socketService: SocketService,
    private studyCaseDataService: StudyCaseDataService,
    private appDataService: AppDataService,
  ) {
    this.onNewNotificationSubscription = null;
  }

  ngOnInit(): void {
    this.dataSourceNotifications = new MatTableDataSource<CoeditionNotification>(this.studyCaseDataService.studyCoeditionNotifications);
    this.onNewNotificationSubscription = this.socketService.onNewNotification.subscribe(notification => {
      this.onNotificationAction(notification);
    });
  }

  ngOnDestroy() {
    if (this.onNewNotificationSubscription !== null) {
      this.onNewNotificationSubscription.unsubscribe();
      this.onNewNotificationSubscription = null;
    }

    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }

    if (this.dialogRefNotificationChanges !== null && this.dialogRefNotificationChanges !== undefined) {
      this.dialogRefNotificationChanges.close();
      this.dialogRefNotificationChanges = null;
    }
  }

  onNotificationAction(notification: CoeditionNotification) {

    // Refreshing notifications
    this.studyCaseDataService.getStudyNotifications(this.studyCaseDataService.loadedStudy.studyCase.id).subscribe(notifications => {
      this.dataSourceNotifications = new MatTableDataSource<CoeditionNotification>(notifications);
    });

    // Handle submission or execution
    if (this.userService.getFullUsername() !== notification.author) {
      switch (notification.type) {
        case CoeditionType.SUBMISSION:
          const executionDialogData = new ExecutionDialogData();
          executionDialogData.message = notification.author + ' just submitted study case to execution, please wait.';

          this.dialogRef = this.dialog.open(StudyCaseExecutionDialogComponent, {
            disableClose: true,
            width: '500px',
            height: '220px',
            data: executionDialogData
          });
          break;
        case CoeditionType.EXECUTION:
          this.socketService.onStudySubmissionEnd.emit(true);
          break;
        default:
          break;
      }
      this.dataSourceNotifications = new MatTableDataSource<CoeditionNotification>(this.studyCaseDataService.studyCoeditionNotifications);
    }

  }

  seeNotificationChanges(notification: CoeditionNotification) {
    const codeditData = new CoeditionDialogData();

    codeditData.title = notification.type + ', ' + formatDate(notification.created, 'short', 'Fr-fr');
    codeditData.message = 'Done by ' + notification.author;
    codeditData.buttonText = 'OK';
    codeditData.changes = notification.changes;

    this.dialogRefNotificationChanges = this.dialog.open(StudyCaseNotificationsChangesDialogComponent, {
      disableClose: true,
      data: codeditData
    });
  }

}
