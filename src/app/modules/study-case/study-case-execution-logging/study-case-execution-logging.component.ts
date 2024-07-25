import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { StudyCaseExecutionObserverService } from 'src/app/services/study-case-execution-observer/study-case-execution-observer.service';
import { Subscription } from 'rxjs';
import { LoadedStudy } from 'src/app/models/study.model';
import { MatTableDataSource } from '@angular/material/table';
import { StudyCaseExecutionLogging } from 'src/app/models/study-case-execution-logging.model';
import { StudyCaseExecutionExceptionDialogComponent } from '../study-case-execution-exception-dialog/study-case-execution-exception-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { FilterService } from 'src/app/services/filter/filter.service';

const POLLING_DELAY = 1000;

@Component({
  selector: 'app-study-case-execution-logging',
  templateUrl: './study-case-execution-logging.component.html',
  styleUrls: ['./study-case-execution-logging.component.scss']
})
export class StudyCaseExecutionLoggingComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('scrollframe', { static: false }) scrollFrame: ElementRef;
  @ViewChild('table', { static: false }) table: any;

  private studyCaseSubscription: Subscription;
  private executionStartedSubscription: Subscription;
  private executionStoppedSubscription: Subscription;
  private logsSubscription: Subscription;
  private calculationChangeSubscription: Subscription;
  private calculationSystemLoadChangeSubscription: Subscription;
  private studyCaseId: number;
  private timeOut: any;
  private scrollContainer: any;
  private logList: StudyCaseExecutionLogging[];
  public cpuLoad: string;
  public memoryLoad: string;
  public memoryUnit: string;
  public displayMemoryCpu: boolean;
  public displayIconInfoMemoryCpu: boolean;
  public isCalculationRunning: boolean;

  public bottomAnchorLog: boolean;
  public executionViewActive: boolean;
  public dataSourceRef = new MatTableDataSource<StudyCaseExecutionLogging>();
  displayedColumns = [ 'message'];
  private dialogRef: MatDialogRef<StudyCaseExecutionExceptionDialogComponent>;


  constructor(
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseExecutionObserverService: StudyCaseExecutionObserverService,
    public calculationService: CalculationService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    public filterService: FilterService) {

    this.studyCaseSubscription = null;
    this.executionStartedSubscription = null;
    this.executionStoppedSubscription = null;
    this.logsSubscription = null;
    this.calculationChangeSubscription = null;
    this.calculationSystemLoadChangeSubscription = null;
    this.studyCaseId = -1;
    this.dataSourceRef = null;
    this.timeOut = null;
    this.logList = [];
    this.bottomAnchorLog = false;
    this.cpuLoad = '----';
    this.memoryLoad = '----';
    this.isCalculationRunning = false;
    this.displayMemoryCpu = false;
    this.displayIconInfoMemoryCpu = false;
    this.memoryUnit = "";
  }

  ngOnInit(): void {

    if (this.logsSubscription === null || this.logsSubscription === undefined) {
      this.logsSubscription = this.calculationService.logs$.subscribe(logs => {
        this.setLogToView(logs);
      });
    }

    if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
      this.studyCaseId = this.studyCaseDataService.loadedStudy.studyCase.id;
      // Applying rights, to start logging or not
      if (!this.studyCaseDataService.loadedStudy.noData) {
        this.getLogs();
      } else {
        this.dataSourceRef = null;
      }
      this.displayLastCpuAndMemoryRecorded(this.studyCaseDataService.loadedStudy);
    }

    this.studyCaseSubscription = this.studyCaseDataService.onStudyCaseChange.subscribe(loadedStudy => {
      if (loadedStudy !== null && loadedStudy !== undefined) {
        this.studyCaseId = (loadedStudy as LoadedStudy).studyCase.id;
        if (!loadedStudy.noData) {
          this.getLogs();
        } else {
        this.dataSourceRef = null;
        }
      }
      this.displayLastCpuAndMemoryRecorded(loadedStudy);
    });

    this.calculationChangeSubscription = this.calculationService.onCalculationChange.subscribe(calculationRunning => {
      this.isCalculationRunning = calculationRunning;
      const sco = this.studyCaseExecutionObserverService.getStudyCaseObserver(this.studyCaseId);
      if (sco !== null && sco !== undefined) {
        // Start calculation timeout to get logs
        this.executionStartedSubscription = sco.executionUpdate.subscribe(_ => {
          this.startTimeOut();
        });
        // Stop calculation timeout to get logs
        this.executionStoppedSubscription = sco.executionStopped.subscribe(_ => {
          this.stopTimeOut();
        });
      }
    });

    this.calculationSystemLoadChangeSubscription = this.calculationService.onCalculationSystemLoadChange.subscribe(systemLoad => {
      this.cpuLoad = systemLoad.cpu;
      this.memoryLoad = systemLoad.memory;
    });
  }

  ngOnDestroy(): void {
    if (this.studyCaseSubscription !== null && this.studyCaseSubscription !== undefined) {
      this.studyCaseSubscription.unsubscribe();
      this.studyCaseSubscription = null;
    }

    if (this.calculationChangeSubscription !== null && this.calculationChangeSubscription !== undefined) {
      this.calculationChangeSubscription.unsubscribe();
      this.calculationChangeSubscription = null;
    }

    if (this.calculationSystemLoadChangeSubscription !== null && this.calculationSystemLoadChangeSubscription !== undefined) {
      this.calculationSystemLoadChangeSubscription.unsubscribe();
      this.calculationSystemLoadChangeSubscription = null;
    }

    if (this.logsSubscription !== null && this.logsSubscription !== undefined) {
      this.logsSubscription.unsubscribe();
      this.logsSubscription = null;
    }

    if (this.executionStartedSubscription !== null && this.executionStartedSubscription !== undefined) {
      this.executionStartedSubscription.unsubscribe();
      this.executionStartedSubscription = null;
    }

    if (this.executionStoppedSubscription !== null && this.executionStoppedSubscription !== undefined) {
      this.executionStoppedSubscription.unsubscribe();
      this.executionStoppedSubscription = null;
    }
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  ngAfterViewInit() {
    this.scrollContainer = this.scrollFrame.nativeElement;
    this.scrollContainer = this.table._elementRef.nativeElement;
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
    this.calculationService.getLog(this.studyCaseId);
  }

  private setLogToView(logs: StudyCaseExecutionLogging[]) {
    if (logs !== null && logs !== undefined) {
      this.logList = logs;
      this.dataSourceRef = new MatTableDataSource<StudyCaseExecutionLogging>(this.logList);
      this.scrollToBottom();
    }
  }

  public anchorToBottom() {
    this.bottomAnchorLog = !this.bottomAnchorLog;
    this.scrollToBottom();
  }

  public changeLogZoneSize() {
    this.calculationService.logFullSizeViewActive = !this.calculationService.logFullSizeViewActive;
  }

  private scrollToBottom() {
    if ((this.bottomAnchorLog === true) && ((this.scrollContainer !== null) && (this.scrollContainer !== undefined))) {
      this.scrollContainer.scrollTop = Math.max(0, this.scrollContainer.scrollHeight - this.scrollContainer.offsetHeight);
    }
  }

  displayException(message: string) {

    this.dialogRef = this.dialog.open(StudyCaseExecutionExceptionDialogComponent, {
      disableClose: false,
      width: '80vw',
      height: '80vh',
      panelClass: 'csvDialog',
      data: message
    });
  }

  downloadRawStudyLogs() {

    const studyId = this.studyCaseId;
    this.studyCaseDataService.getRawStudyLogs(studyId).subscribe(file => {

      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(file);
      downloadLink.setAttribute('download', 'raw-sc-' + this.studyCaseId + '-logs.log');
      document.body.appendChild(downloadLink);
      downloadLink.click();
    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error downloading log file :  No raw logs found for this study. You should run it first.');
      }
    });
  }

  private displayLastCpuAndMemoryRecorded(loadedStudy: LoadedStudy) {
    this.cpuLoad = loadedStudy.studyCase.last_cpu_usage;
    this.memoryLoad = loadedStudy.studyCase.last_memory_usage;
    if ((this.cpuLoad !== null && this.cpuLoad !== undefined && this.cpuLoad.length > 0) && (this.memoryLoad !== null && this.memoryLoad !== undefined && this.memoryLoad.length > 0)) {
      this.displayMemoryCpu = true;
      if (this.memoryLoad !== "----") {
        this.displayIconInfoMemoryCpu = true;
        if (this.memoryLoad.includes("MB")) {
          this.memoryUnit = "Megabyte"
        }
        else {
          this.memoryUnit = "Gigabyte"
        }
      }
    }
  }
}
