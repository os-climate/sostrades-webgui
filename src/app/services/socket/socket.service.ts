import { Injectable, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import {io} from 'socket.io-client';

import { User } from 'src/app/models/user.model';
import { CoeditionNotification, CoeditionType } from 'src/app/models/coedition-notification.model';

import { StudyUpdateParameter } from 'src/app/models/study-update.model';
import { UserService } from '../user/user.service';
import { StudyCaseDataService } from '../study-case/data/study-case-data.service';
import { LoggerService } from '../logger/logger.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../snackbar/snackbar.service';
import { Routing } from 'src/app/models/enumeration.model';
import { ValidationDialogData } from 'src/app/models/dialog-data.model';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StudyCaseMainService } from '../study-case/main/study-case-main.service';
import { StudyCaseValidation } from 'src/app/models/study-case-validation.model';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  public onLogReceived: EventEmitter<string>;
  public onRoomUserUpdate: EventEmitter<User[]>;
  public onNewNotification: EventEmitter<CoeditionNotification>;
  public onStudySubmissionEnd: EventEmitter<boolean>;
  public onCurrentStudyDeleted: EventEmitter<boolean>;
  public onCurrentStudyEdited: EventEmitter<boolean>;
  public onNodeValidatationChange: EventEmitter<StudyCaseValidation>;


  private notificationQueue: CoeditionNotification[];

  private socket: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    private loggerService: LoggerService) {
    this.socket = null;
    this.onLogReceived = new EventEmitter<string>();
    this.onRoomUserUpdate = new EventEmitter<User[]>();
    this.onNewNotification = new EventEmitter<CoeditionNotification>();
    this.onStudySubmissionEnd = new EventEmitter<boolean>();
    this.onCurrentStudyDeleted = new EventEmitter<boolean>();
    this.onCurrentStudyEdited = new EventEmitter<boolean>();
    this.onNodeValidatationChange = new EventEmitter<StudyCaseValidation>();
    this.notificationQueue = [];
  }


  closeConnection() {
    if (this.socket !== null && this.socket !== undefined) {
      this.socket.disconnect();
      this.socket = null;
    }
  }


  openConnection(path: string) {

    let url = '';

    if (environment.production === false) {
      url = `${environment.API_MESSAGE_URL}/${path}`;
    }

    this.socket = io(url, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${localStorage.getItem('refreshToken')}`
          }
        }
      }
    });

    this.socket.on('connect', (data) => {
      this.loggerService.log('ok connect', data);
      if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
        this.loggerService.log('join-room', this.studyCaseDataService.loadedStudy.studyCase.id);
        this.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
      }
    });

    this.socket.on('connect_error', (data) => {
      this.loggerService.log('connect_error', data);
      this.loggerService.log(this.socket.io.opts.transportOptions.polling.extraHeaders.Authorization);
    });

    this.socket.on('reconnect', (data) => {
      this.loggerService.log('reconnect', data);
    });

    this.socket.on('reconnect_attempt', (data) => {
      this.loggerService.log('reconnect_attempt', data);
      // Try to update bearer token to revalidate the connection authorization


      if (data === 5) {
        this.closeConnection();
      }
    });

    this.socket.on('reconnecting', (data) => {
      this.loggerService.log('reconnecting', data);
    });

    this.socket.on('reconnect_failed', (data) => {
      this.loggerService.log('reconnect_failed', data);
    });

    this.socket.on('disconnect', (data) => {
      this.loggerService.log('ok disconnect', data);
    });

    this.socket.on('log-message', (data) => {
      this.loggerService.log('log-message', data);
      this.onLogReceived.emit(data.message);
    });

    this.socket.on('join', (data) => {
      this.loggerService.log('join', data);
    });

    this.socket.on('room-user-update', (data) => {
      const users = data.users as User[];
      this.onRoomUserUpdate.emit(users);
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, null, false);
      this.addNewNotificationOnList(notification)
      this.addNotificationToQueue(notification);
    });

    this.socket.on('study-saved', (data) => {
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, data.changes, false);
      this.addNewNotificationOnList(notification)
      this.addNotificationToQueue(notification);
    });

    this.socket.on('study-exported', (data) => {
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, data.changes, false);
      this.addNewNotificationOnList(notification)
      this.addNotificationToQueue(notification);
    });

    this.socket.on('study-submitted', (data) => {
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, null, false);
      this.addNewNotificationOnList(notification)
      this.addNotificationToQueue(notification);
    });

    this.socket.on('study-executed', (data) => {
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, null, false);
      this.addNewNotificationOnList(notification)
      this.addNotificationToQueue(notification);
    });

    this.socket.on('study-stopped', (data) => {
        const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, null, false);
        this.addNewNotificationOnList(notification)
        this.addNotificationToQueue(notification);
    });

    this.socket.on('study-claimed', (data) => {
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, null, false);
      this.addNewNotificationOnList(notification)
      this.studyCaseDataService.loadedStudy.userIdExecutionAuthorized = data.user_id_execution_authorized;
      this.addNotificationToQueue(notification);
    });

    this.socket.on('study-reloaded', (data) => {
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, null, false);
      this.addNewNotificationOnList(notification)
      this.addNotificationToQueue(notification);
    });

    this.socket.on('validation-change', (data) => {
      const notification = new CoeditionNotification(new Date(), data.author, data.type, data.message, null, false);
      this.addNewNotificationOnList(notification)
      this.addNotificationToQueue(notification);
      this.onNodeValidatationChange.emit(data.study_case_validation);
    });

    this.socket.on('study-edited', (data) => {
      if (this.userService.getFullUsername() !== data.author) {
        if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
          this.studyCaseMainService.closeStudy(true);
          const validationDialogData = new ValidationDialogData();
          validationDialogData.message = `The study you are working on has been modified by "${data.author}". \nFor security purpose study has been closed without saving changes.`;
          validationDialogData.title = 'Warning';
          validationDialogData.buttonOkText = 'Ok';
          validationDialogData.showCancelButton = false;
          validationDialogData.secondaryActionConfirmationNeeded = false;

          const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
            disableClose: true,
            width: '550px',
            height: '200px',
            data: validationDialogData,
          });
          dialogRefValidate.afterClosed().subscribe(result => {
            const validationData: ValidationDialogData = result as ValidationDialogData;
            if ((validationData !== null) && (validationData !== undefined)) {
              this.onCurrentStudyEdited.emit(true);
            }
          });
        }
      }
    });

    this.socket.on('study-deleted', (data) => {
      if (this.userService.getFullUsername() !== data.author) {
        if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
          this.studyCaseDataService.studyManagementData = this.studyCaseDataService.studyManagementData
            .filter(x => x.id !== this.studyCaseDataService.loadedStudy.studyCase.id);
          this.studyCaseDataService.setCurrentStudy(null);
          this.studyCaseDataService.onStudyCaseChange.emit(null);
          this.onCurrentStudyDeleted.emit(true);
          this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
          this.snackbarService.showWarning(`The current study case you were working in has been deleted by "${data.author}"`);
        }
      }
    });
  }

  joinRoom(studyCaseId: number) {
    if (this.socket) {
      this.socket.emit('join', { study_case_id: studyCaseId });
    }
  }

  leaveRoom(studyCaseId: number) {
    if (this.socket) {
      this.socket.emit('leave', { study_case_id: studyCaseId });
    }
  }

  saveStudy(studyCaseId: number, changes: StudyUpdateParameter[]) {
    if (this.socket) {
      this.socket.emit('save', { study_case_id: studyCaseId, changes });
    }
  }

  exportedStudy(studyCaseId: number, changes: StudyUpdateParameter[]) {
    if (this.socket) {
      this.socket.emit('export', { study_case_id: studyCaseId, changes });
    }
  }

  reloadStudy(studyCaseId: number) {
    if (this.socket) {
      this.socket.emit('reload', { study_case_id: studyCaseId });
    }
  }

  claimStudyExecution(studyCaseId: number) {
    if (this.socket) {
      this.socket.emit('claim', { study_case_id: studyCaseId });
    }
  }

  submitStudy(studyCaseId: number) {
    if (this.socket) {
      this.socket.emit('submit', { study_case_id: studyCaseId });
    }
  }

  updateStudy(studyId: number) {
    if (this.socket) {
      this.socket.emit('edit', { study_case_id: studyId });
    }
  }

  executeStudy(studyCaseId: number, submitted: boolean) {
    if (this.socket) {
      this.loggerService.log(this.socket.io.opts.transportOptions.polling.extraHeaders.Authorization);
      this.socket.emit('execute', { study_case_id: studyCaseId, submitted });
    }
  }

  stopStudyExecution(studyCaseId: number, stopped: boolean) {
    if (this.socket) {
      this.loggerService.log(this.socket.io.opts.transportOptions.polling.extraHeaders.Authorization);
      this.socket.emit('stopped', { study_case_id: studyCaseId, stopped });
    }
  }

  deleteStudy(studyCaseId: number) {
    if (this.socket) {
      this.socket.emit('delete', { study_case_id: studyCaseId });
    }
  }

  validationChange(studyCaseId: number, treeNodedataName: string, studyCaseValidation: StudyCaseValidation) {
    if (this.socket) {
      this.socket.emit('validation-change',
      { study_case_id: studyCaseId, study_case_validation: studyCaseValidation, treenode_data_name: treeNodedataName});
    }
  }

  addNotificationToQueue(notification: CoeditionNotification) {
    if (notification.type === CoeditionType.CONNECTION ||
      notification.type === CoeditionType.DISCONNECTION ||
      notification.type === CoeditionType.CLAIM ||
      notification.type === CoeditionType.VALIDATION_CHANGE) {
      this.onNewNotification.emit(notification);
    } else {
      if (this.userService.getFullUsername() !== notification.author) {
        if (notification.type === CoeditionType.EXECUTION || notification.type === CoeditionType.EXECUTION_STOPPED) {
          this.notificationQueue.pop();
          this.notificationQueue.push(notification);
          this.onNewNotification.emit(notification);
        } else {
          if (this.notificationQueue.length === 0) {
            this.notificationQueue.push(notification);
            this.onNewNotification.emit(notification);
          } else if (this.notificationQueue.length === 1) {
            this.notificationQueue.push(notification);
          } else {
            if (notification.type === CoeditionType.SUBMISSION) {
              this.notificationQueue.pop();
              this.notificationQueue.push(notification);
            }
          }
        }
      } else {
        notification.isOnlyMessage = true;
        this.onNewNotification.emit(notification);
      }
    }
  }

  private addNewNotificationOnList(notification : CoeditionNotification) {
    const notifications = this.studyCaseDataService.studyCoeditionNotifications
    if (notifications !== null && notifications !== undefined) {
      this.studyCaseDataService.studyCoeditionNotifications.unshift(notification)
    }
  }

  onUpdateFinished() {
    this.notificationQueue.shift();
    if (this.notificationQueue.length > 0) {
      this.onNewNotification.emit(this.notificationQueue[0]);
    }
  }

  getParameterChangesList(parameterName: string): StudyUpdateParameter[] {
    const changes: StudyUpdateParameter[] = [];

    const notificationWithChanges = this.studyCaseDataService.studyCoeditionNotifications.filter(x => x.type === CoeditionType.SAVE);

    notificationWithChanges.forEach(notif => {
      if (notif.changes !== null && notif.changes !== undefined && notif.changes.length > 0) {
        notif.changes.filter(y => y.variableId === parameterName).forEach(relatedChange => {
          relatedChange.author = notif.author;
          changes.push(relatedChange);
        });
      }
    });
    return changes;
  }



}
