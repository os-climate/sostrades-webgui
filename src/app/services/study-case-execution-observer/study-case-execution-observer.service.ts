import { Injectable } from '@angular/core';
import { StudyCaseExecutionObserver, StudyCaseStatus } from 'src/app/models/study-case-execution-observer.model';
import { CalculationService } from '../calculation/calculation.service';
import { LoggerService } from '../logger/logger.service';

const POLLING_DELAY = 1000;

@Injectable({
  providedIn: 'root'
})
export class StudyCaseExecutionObserverService {

  private registeredStudyCase: StudyCaseExecutionObserver[];
  private timeOut;

  constructor(private calculationService: CalculationService,
              private loggerService: LoggerService) {
    this.registeredStudyCase = [];
  }

  getStudyCaseObserver(studyCaseId: number): StudyCaseExecutionObserver {
    let index = this.registeredStudyCase.findIndex(sco => sco.studyCaseId === studyCaseId);

    if (index < 0) {
      index = this.registeredStudyCase.length;
      this.registeredStudyCase.push(new StudyCaseExecutionObserver(studyCaseId));
    }

    return this.registeredStudyCase[index];
  }

  removeStudyCaseObserver(studyCaseId: number) {
    const index = this.registeredStudyCase.findIndex(sco => sco.studyCaseId === studyCaseId);

    if (index > -1) {
      this.registeredStudyCase.splice(index, 1);
    }
  }

  private startTimeOut() {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }

    if (this.registeredStudyCase.some(sco => sco.getStatus() === StudyCaseStatus.STARTED)) {
      this.timeOut = setTimeout(() => {
        this.getStudyCaseStatus();
      }, POLLING_DELAY);
    }
  }

  private getStudyCaseStatus() {

    const queryList = this.registeredStudyCase.filter(sco => sco.getStatus() === StudyCaseStatus.STARTED);

    queryList.forEach(sco => {
      this.calculationService.getStatus(sco.studyCaseId).subscribe(sceo => {
        this.getStudyCaseObserver(sceo.studyCaseId).setStatus(sceo);
        this.startTimeOut();
      }, error => {
        this.loggerService.log(error);
      });
    });
  }

  public startStudyCaseExecutionObserver(studyCaseId: number) {
    this.getStudyCaseObserver(studyCaseId).start();
    this.startTimeOut();
  }
}
