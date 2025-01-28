import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadedStudy } from 'src/app/models/study.model';
import { StudyCaseExecutionStatus } from 'src/app/models/study-case-execution-status.model';
import { StudyCaseExecutionLogging } from 'src/app/models/study-case-execution-logging.model';
import { Location } from '@angular/common';
import { CalculationDashboard } from 'src/app/models/calculation-dashboard.model';
import { LoggerService } from '../logger/logger.service';
import { DataHttpService } from '../http/data-http/data-http.service';
import { StudyCaseExecutionSystemLoad } from 'src/app/models/study-case-execution-system-load.model';


@Injectable({
  providedIn: 'root'
})
export class CalculationService extends DataHttpService {

  public onCalculationChange: EventEmitter<boolean> = new EventEmitter();
  public onCalculationSystemLoadChange: EventEmitter<StudyCaseExecutionSystemLoad> = new EventEmitter();
  public logFullSizeViewActive: boolean;

  // Make innerLogs private so it's not accessible from the outside,
  // expose it as logs$ observable (read-only) instead.
  // Write to innerLogs only through specified store methods below.
  private readonly innerLogs = new BehaviorSubject<StudyCaseExecutionLogging[]>([]);

  // Exposed observable (read-only).
  readonly logs$ = this.innerLogs.asObservable();

  constructor(private http: HttpClient,
    private location: Location,
    private loggerService: LoggerService) {
    super(location, 'calculation');
    this.logFullSizeViewActive = false;
  }

  execute(loadedstudy: LoadedStudy): Observable<void> {
    return this.http.post(this.apiRoute + '/execute/' + loadedstudy.studyCase.id, null)
      .pipe(map(
        () => {
          // TODO : Implement model calculation and return
          // this.loggerService.log(response);
        }));
  }

  stop(studyCaseId: number, studyCaseExecutionId: number = null): Observable<void> {

    let route = `${this.apiRoute}/stop/${studyCaseId}`;

    if (studyCaseExecutionId !== null) {
      route = `${route}/${studyCaseExecutionId}`;
    }

    return this.http.post(route, null)
      .pipe(map(
        () => {
          // TODO : Implement model calculation and return
          // this.loggerService.log(response);
        }));
  }

  getStatus(studyCaseId: number): Observable<StudyCaseExecutionStatus> {
    return this.http.get<any>(this.apiRoute + '/status/' + studyCaseId)
      .pipe(map(response => StudyCaseExecutionStatus.Create(response)));
  }

  getDashboard(): Observable<CalculationDashboard[]> {
    return this.http.get<CalculationDashboard[]>(this.apiRoute + '/dashboard')
      .pipe(map(calcDb => {

        const result: CalculationDashboard[] = [];

        calcDb.forEach(cdb => {
          result.push(CalculationDashboard.Create(cdb));
        });

        return result;

      }));
  }

  /**
   * Request server to get log regarding an execution of a study
   *
   * @param studyCaseId - Study case identifier for whoch logs are requested
   * @param studyCaseExecutionId - Study case execution identifier
   *
   */
  getExecutionLogs(studyCaseId: number, studyCaseExecutionId: number): Observable<StudyCaseExecutionLogging[]> {

    let route = `${this.apiRoute}/logs/${studyCaseId}`;

    if (studyCaseExecutionId !== null) {
      route = `${route}/${studyCaseExecutionId}`;
    }

    return this.http.get<StudyCaseExecutionLogging[]>(route)
      .pipe(map(logs => {

        const result: StudyCaseExecutionLogging[] = [];

        logs.forEach(log => {
          result.push(StudyCaseExecutionLogging.Create(log));
        });

        return result;

      }));
  }

  /**
   * Request server to get raw log regarding an execution of a study
   *
   * @param studyCaseId - Study case identifier for whoch logs are requested
   * @param studyCaseExecutionId - Study case execution identifier
   *
   */
   getExecutionRawLogs(studyCaseId: number, studyCaseExecutionId: number): Observable<Blob> {

    const route = `${this.apiRoute}/raw-logs/${studyCaseId}/${studyCaseExecutionId}`;

    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'blob';
    } = {
      responseType: 'blob'
    };

    return this.http.get(route, options);
  }

  deleteStudycaseExecutionEntry(studyCaseId: number, studyCaseExecutionId: number): Observable<void> {

    const route = `${this.apiRoute}/delete/${studyCaseId}/${studyCaseExecutionId}`;

    return this.http.delete<void>(route);
  }

  //#region logs

  private setLogs(logs: StudyCaseExecutionLogging[]): void {
    this.innerLogs.next(logs);
  }

  /**
   * Return the current logs store in the service without any update from server
   *
   * @returns list of {@link src/app/models/study-case-log.model#StudyCaseLog | the StudyCaseLog class}
   *
   */
  getLogs(): StudyCaseExecutionLogging[] {

    return this.innerLogs.getValue();
  }

  /**
   * Request server to update log regarding the study identifier given as parameter
   *
   * @param studyCaseId - Study case identifier for whoch logs are requested
   *
   */
  getLog(studyCaseId: number) {

    const route = `${this.apiRoute}/logs/${studyCaseId}`;

    this.http.get<StudyCaseExecutionLogging[]>(route)
      .pipe(map(logs => {

        const result: StudyCaseExecutionLogging[] = [];

        logs.forEach(log => {
          result.push(StudyCaseExecutionLogging.Create(log));
        });

        this.setLogs(result);

      })).subscribe();
  }
}
