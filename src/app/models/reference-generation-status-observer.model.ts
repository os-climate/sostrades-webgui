import { EventEmitter } from '@angular/core';
import { ReferenceGenerationStatus } from './reference-generation-status.model';


export enum GenerationStatus {
  STARTED = 0,
  STOPPED = 1
}


export enum ProcessGenerationStatus {
  STATUS_RUNNING = 'RUNNING',
  STATUS_FINISHED = 'FINISHED',
  STATUS_FAILED = 'FAILED',
  STATUS_STOPPED = 'STOPPED',
  STATUS_POD_ERROR = 'POD ERROR'
}

export class ReferenceGenerationStatusObserver {

  public regenerationDone: EventEmitter<ReferenceGenerationStatus>;
  public regenerationUpdate: EventEmitter<ReferenceGenerationStatus>;
  private _refGenId: number;

  private status: GenerationStatus;
  private currentStatus: ReferenceGenerationStatus;


  constructor(refGenId: number) {
    this._refGenId = refGenId;
    this.regenerationDone = new EventEmitter<ReferenceGenerationStatus>();
    this.regenerationUpdate = new EventEmitter<ReferenceGenerationStatus>();
    this.status = GenerationStatus.STOPPED;
    this.currentStatus = null;
  }

  get refGenId(): number {
    return this._refGenId;
  }

  public start() {
    this.status = GenerationStatus.STARTED;
  }
  public stop() {
    this.status = GenerationStatus.STOPPED;
    this.regenerationDone.emit(this.currentStatus);
  }

  public getStatus(): GenerationStatus {
    return this.status;
  }

  public setStatus(executionStatus: ReferenceGenerationStatus) {
    this.currentStatus = executionStatus;

    if ((this.currentStatus.referenceGenerationStatus === ProcessGenerationStatus.STATUS_FINISHED) ||
      (this.currentStatus.referenceGenerationStatus === ProcessGenerationStatus.STATUS_FAILED) ||
      (this.currentStatus.referenceGenerationStatus === ProcessGenerationStatus.STATUS_STOPPED) ||
      (this.currentStatus.referenceGenerationStatus === ProcessGenerationStatus.STATUS_POD_ERROR)) {
      this.stop();
    } else {
      this.regenerationUpdate.emit(this.currentStatus);
    }
  }

}
