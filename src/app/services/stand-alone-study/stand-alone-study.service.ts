import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadedStudy } from 'src/app/models/study.model';
import { StudyCaseExecutionStatus } from 'src/app/models/study-case-execution-status.model';
import { StudyCaseExecutionLogging } from 'src/app/models/study-case-execution-logging.model';
import { Location } from '@angular/common';
import { CalculationDashboard } from 'src/app/models/calculation-dashboard.model';
import { LoggerService } from '../logger/logger.service';
import { DataHttpService } from '../http/data-http/data-http.service';
import { StudyCaseExecutionSystemLoad } from 'src/app/models/study-case-execution-system-load.model';
import { ProgressStatus } from 'src/app/models/progress-status.model';


@Injectable({
  providedIn: 'root'
})
export class StandAloneStudyService extends DataHttpService {

  constructor(private http: HttpClient,
    private location: Location) {
    super(location, 'stand-alone-study');
    
  }

  export(studyId:number): Observable<ProgressStatus> {
    const url = `${this.apiRoute}/${studyId}/export/start`;
    return this.http.post<ProgressStatus>(url, null)
      .pipe(map(
        (progressStatus) => {
          return ProgressStatus.Create(progressStatus);
        }));
  }

  downloadStudyStandAlone(studyId: string): Observable<Blob> {
    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'blob';
    } = {
      responseType: 'blob'
    };
    const url = `${this.apiRoute}/${studyId}/export/download`;
    const data = {
      study_id: studyId
    };

    return this.http.post(url, data, options);
  }

  getExportProgressStatus(studyId:number): Observable<ProgressStatus> {
    const url = `${this.apiRoute}/${studyId}/export/status`;
    return this.http.get<ProgressStatus>(url, null)
      .pipe(map(
        (progressStatus) => {
          return ProgressStatus.Create(progressStatus);
        }));
  }

  getExportProgressStatusTimeout(studyId:number, progressObervable: Subscriber<ProgressStatus>, progressFinishedObservable:Subscriber<ProgressStatus>){
    this.getExportProgressStatus(studyId).subscribe(
          {next:(status) => {
            if (status !== undefined && status !== null && !status.isFinished && !status.isInError) {
              progressObervable.next(status);
              setTimeout(() => {
                this.getExportProgressStatusTimeout(studyId, progressObervable, progressFinishedObservable);
              }, 2000);
            } else {
              progressFinishedObservable.next(status);
            }
          },
          error:(error) => {
            //just try another time to be sure server is not available
            progressFinishedObservable.error(error);
          }
        });
  }

}
