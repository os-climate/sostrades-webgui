import { EventEmitter } from '@angular/core';
import { StudyCaseExecutionStatus } from './study-case-execution-status.model';

export enum StudyCaseStatus {
  STARTED = 0,
  STOPPED = 1
}

export enum DisciplineStatus {
  STATUS_NONE = '',
  STATUS_VIRTUAL = 'VIRTUAL',
  STATUS_PENDING = 'PENDING',
  STATUS_DONE = 'DONE',
  STATUS_RUNNING = 'RUNNING',
  STATUS_FAILED = 'FAILED',
  STATUS_CONFIGURE = 'CONFIGURE',
  STATUS_INPUT_DATA = 'INPUT_DATA'
}

export enum StudyCalculationStatus {
  STATUS_RUNNING = 'RUNNING',
  STATUS_FINISHED = 'FINISHED',
  STATUS_FAILED = 'FAILED',
  STATUS_STOPPED = 'STOPPED'
}

export class StudyCaseExecutionObserver {

  public executionStarted: EventEmitter<StudyCaseExecutionStatus>;
  public executionStopped: EventEmitter<StudyCaseExecutionStatus>;
  public executionUpdate: EventEmitter<StudyCaseExecutionStatus>;

  private _studyCaseId: number;

  private status: StudyCaseStatus;
  private currentStatus: StudyCaseExecutionStatus;


  constructor(studyCaseId: number) {
    this._studyCaseId = studyCaseId;
    this.executionStarted = new EventEmitter<StudyCaseExecutionStatus>();
    this.executionStopped = new EventEmitter<StudyCaseExecutionStatus>();
    this.executionUpdate = new EventEmitter<StudyCaseExecutionStatus>();
    this.status = StudyCaseStatus.STOPPED;
    this.currentStatus = null;
  }

  get studyCaseId(): number {
    return this._studyCaseId;
  }

  public start() {
    this.status = StudyCaseStatus.STARTED;
    this.executionStarted.emit(this.currentStatus);
  }

  public stop() {
    this.status = StudyCaseStatus.STOPPED;
    this.executionStopped.emit(this.currentStatus);
  }

  public getStatus(): StudyCaseStatus {
    return this.status;
  }

  public setStatus(executionStatus: StudyCaseExecutionStatus) {
    this.currentStatus = executionStatus;

    if ((this.currentStatus.studyCalculationStatus === StudyCalculationStatus.STATUS_FINISHED) ||
      (this.currentStatus.studyCalculationStatus === StudyCalculationStatus.STATUS_FAILED) ||
      (this.currentStatus.studyCalculationStatus === StudyCalculationStatus.STATUS_STOPPED)) {
      this.stop();
    } else {
      this.executionUpdate.emit(this.currentStatus);
    }
  }

}
