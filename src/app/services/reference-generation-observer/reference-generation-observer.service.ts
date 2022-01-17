import { Injectable } from '@angular/core';
import { ReferenceGenerationStatusObserver, GenerationStatus } from 'src/app/models/reference-generation-status-observer.model';
import { LoggerService } from '../logger/logger.service';
import { ReferenceDataService } from '../reference/data/reference-data.service';

const POLLING_DELAY = 1000;

@Injectable({
  providedIn: 'root'
})
export class ReferenceGenerationObserverService {

  private registeredGeneration: ReferenceGenerationStatusObserver[];
  private timeOut;

  constructor(private referenceDataService: ReferenceDataService,
              private loggerService: LoggerService) {
    this.registeredGeneration = [];
  }

  getReferenceGenerationObserver(refGenId: number): ReferenceGenerationStatusObserver {
    let index = this.registeredGeneration.findIndex(sco => sco.refGenId === refGenId);

    if (index < 0) {
      index = this.registeredGeneration.length;
      this.registeredGeneration.push(new ReferenceGenerationStatusObserver(refGenId));
    }

    return this.registeredGeneration[index];
  }

  removeReferenceGenerationObserver(refGenId: number) {
    const index = this.registeredGeneration.findIndex(sco => sco.refGenId === refGenId);

    if (index > -1) {
      this.registeredGeneration.splice(index, 1);
    }
  }

  private startTimeOut() {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }

    if (this.registeredGeneration.some(sco => sco.getStatus() === GenerationStatus.STARTED)) {
      this.timeOut = setTimeout(() => {
        this.getReferenceGenerationStatus();
      }, POLLING_DELAY);
    }
  }

  private getReferenceGenerationStatus() {

    const queryList = this.registeredGeneration.filter(sco => sco.getStatus() === GenerationStatus.STARTED);

    queryList.forEach(sco => {
      this.referenceDataService.getRefGenStatus(sco.refGenId).subscribe(sceo => {
        this.getReferenceGenerationObserver(sceo.refGenId).setStatus(sceo);
        this.startTimeOut();
      }, error => {
        this.loggerService.log(error);
      });
    });
  }

  public startStudyCaseExecutionObserver(refGenId: number) {
    this.getReferenceGenerationObserver(refGenId).start();
    this.startTimeOut();
  }
}
