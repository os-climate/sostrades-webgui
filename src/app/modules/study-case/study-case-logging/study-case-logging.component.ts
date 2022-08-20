import { Component, OnInit, OnDestroy, EventEmitter, LOCALE_ID, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CoeditionNotification, CoeditionType } from 'src/app/models/coedition-notification.model';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { CoeditionDialogData, ExecutionDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseNotificationsChangesDialogComponent } from '../study-case-notifications-changes-dialog/study-case-notifications-changes-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';
import { StudyCaseExecutionDialogComponent } from '../study-case-execution-dialog/study-case-execution-dialog.component';
import { formatDate } from '@angular/common';
import { LoadedStudy } from 'src/app/models/study.model';
import { StudyCaseLogging } from 'src/app/models/study-case-logging.model';
import { StudyCaseExecutionExceptionDialogComponent } from '../study-case-execution-exception-dialog/study-case-execution-exception-dialog.component';

const POLLING_DELAY = 1000;

@Component({
  selector: 'app-study-case-logging',
  templateUrl: './study-case-logging.component.html',
  styleUrls: ['./study-case-logging.component.scss']
})
export class StudyCaseLoggingComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('table', { static: false }) table: any;

  public dataSourceStudyCaseLogging = new MatTableDataSource<StudyCaseLogging>();
  displayedColumns = ['name', 'level', 'created', 'message', 'exception'];

  private studyCaseSubscription: Subscription;
  private logsSubscription: Subscription;
  private studyCaseId: number;
  private timeOut;
  private logList: StudyCaseLogging[];
  public bottomAnchorLog: boolean;
  private scrollContainer: any;

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private socketService: SocketService,
    private studyCaseDataService: StudyCaseDataService,
    private appDataService: AppDataService) {

      this.studyCaseSubscription = null;
      this.studyCaseId = -1;
      this.timeOut = null;
      this.logList = [];
      this.bottomAnchorLog = false;
  }

  ngOnInit(): void {

    // Subscribe to log change in order to update view
    if (this.logsSubscription === null || this.logsSubscription === undefined) {
      this.logsSubscription = this.studyCaseDataService.logs$.subscribe(logs => {
        this.setLogToView(logs);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.studyCaseSubscription !== null && this.studyCaseSubscription !== undefined) {
      this.studyCaseSubscription.unsubscribe();
      this.studyCaseSubscription = null;
    }

    if (this.logsSubscription !== null && this.logsSubscription !== undefined) {
      this.logsSubscription.unsubscribe();
      this.logsSubscription = null;
    }
  }

  ngAfterViewInit() {
    this.scrollContainer = this.table._elementRef.nativeElement;
  }

  private initializeLogger() {

    this.studyCaseId = this.studyCaseDataService.loadedStudy.studyCase.id;
    this.startTimeOut();
    this.getLogs();
  }

  private startTimeOut() {
    this.stopTimeOut();

    if (this.timeOut === null) {
      this.timeOut = setTimeout(() => {
        this.getLogs();
      }, POLLING_DELAY);
    }
  }

  private stopTimeOut() {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
      this.timeOut = null;
    }
  }

  private getLogs() {
    //get studylog only if logger is initialized
    if (this.studyCaseDataService.loadedStudy !== undefined && this.studyCaseDataService.loadedStudy !== null){
      this.studyCaseId = this.studyCaseDataService.loadedStudy.studyCase.id;
    }
    
    if (this.studyCaseId !== -1){
      this.studyCaseDataService.getLog(this.studyCaseId);
    }
  }

  private setLogToView(logs: StudyCaseLogging[]) {

    this.logList = logs;
    this.dataSourceStudyCaseLogging = new MatTableDataSource<StudyCaseLogging>(this.logList);

    this.scrollToBottom();
    this.startTimeOut();
  }

  public anchorToBottom() {
    this.bottomAnchorLog = !this.bottomAnchorLog;
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if ((this.bottomAnchorLog === true) && ((this.scrollContainer !== null) && (this.scrollContainer !== undefined))) {
      this.scrollContainer.scrollTop = Math.max(0, this.scrollContainer.scrollHeight - this.scrollContainer.offsetHeight);
    }
  }

  showException(message: string) {

    const dialogRef = this.dialog.open(StudyCaseExecutionExceptionDialogComponent, {
      disableClose: false,
      width: '80vw',
      height: '80vh',
      panelClass: 'csvDialog',
      data: message
    });
  }
}
