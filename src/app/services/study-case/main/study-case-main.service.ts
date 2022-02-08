import { Study, PostStudy, LoadedStudy } from 'src/app/models/study.model';
import { Injectable, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpEvent, HttpParams } from '@angular/common/http';
import { NodeData } from 'src/app/models/node-data.model';
import { Observable, Subscriber } from 'rxjs';
import { Router } from '@angular/router';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { Location } from '@angular/common';
import { TypeConversionTools } from 'src/app/tools/type-conversion.tool';
import { StudyCaseValidationService } from '../../study-case-validation/study-case-validation.service';
import { MainHttpService } from '../../http/main-http/main-http.service';
import { StudyCaseDataService } from '../data/study-case-data.service';

@Injectable({
  providedIn: 'root'
})
export class StudyCaseMainService extends MainHttpService {

  public onStudyCaseStartLoading: EventEmitter<number> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private router: Router,
    private studyCaseValidationService: StudyCaseValidationService,
    private studyCaseDataService: StudyCaseDataService,
    private location: Location) {
    super(location, 'study-case');
  }



  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API MAIN          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------

  //#region Create study
  createStudy(study: PostStudy, withEmit: boolean): Observable<LoadedStudy> {
    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.createStudytimeout(study, withEmit, observer);
    });
    return loaderObservable;
  }

  private createStudytimeout(postStudy: PostStudy, withEmit: boolean, loaderObservable: Subscriber<LoadedStudy>) {
    return this.http.post(this.apiRoute, JSON.stringify(postStudy), this.options).pipe(map(
      response => {
        this.studyCaseDataService.loadedStudy = LoadedStudy.Create(response);

        //start study case loading to other services
        this.onStudyCaseStartLoading.emit(this.studyCaseDataService.loadedStudy.studyCase.id);

        return this.studyCaseDataService.loadedStudy;
      })).subscribe(study => {
        if (study.loadInProgress === true) {
          console.log('new timer');
          setTimeout(() => {
            this.loadStudyTimeout(study.studyCase.id, false, loaderObservable, true);
          }, 2000);
        } else {
          console.log('found');
          // Add study case to study management list
          this.studyCaseDataService.studyManagementData.unshift(this.studyCaseDataService.loadedStudy.studyCase);
          loaderObservable.next(study);
        }
      },
        error => {
          loaderObservable.error(error);
        });
  }

  //#endregion create study

  //#region copy study
  copyStudy(studyId: number, newName: string, groupId: number): Observable<LoadedStudy> {   
    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.copyStudytimeout(studyId, newName, groupId, observer);
    });
    return loaderObservable;
  }

  private copyStudytimeout(studyId: number, newName: string, groupId: number, loaderObservable: Subscriber<LoadedStudy>) {
    const request = {
      new_name: newName,
      group_id: groupId
    };
    return this.http.post(`${this.apiRoute}/${studyId}/copy`, request, this.options).pipe(map(
      response => {
        
        const newStudy = Study.Create(response);
        console.log('copy created from '+studyId+ ' to '+newStudy.id)
        return newStudy;
      })).subscribe(study => {
        
        console.log('new timer');
        setTimeout(() => {
          this.loadStudyTimeout(study.id, false, loaderObservable, true);
        }, 2000);
      },
        error => {
          loaderObservable.error(error);
        });
  }
  //#endregion copy study

  //#region Load study
  loadStudy(studyId: number, withEmit: boolean): Observable<LoadedStudy> {

    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      //start study case loading to other services
      //this.onStudyCaseStartLoading.emit(studyId);
      this.loadStudyTimeout(studyId, withEmit, observer, false);
    });
    return loaderObservable;
  }

  private loadStudyTimeout(studyId: number, withEmit: boolean, loaderObservable: Subscriber<LoadedStudy>, addToStudyManagement: boolean) {
    this.internalLoadStudy(studyId).subscribe(study => {
      if (study.loadInProgress === true) {
        console.log('new timer');
        setTimeout(() => {
          this.loadStudyTimeout(studyId, withEmit, loaderObservable, addToStudyManagement);
        }, 2000);
      } else {
        console.log('found');
        if (addToStudyManagement === true) {
          // Add study case to study management list
          this.studyCaseDataService.studyManagementData.unshift(this.studyCaseDataService.loadedStudy.studyCase);
        }
        if (withEmit === true) {
          this.studyCaseDataService.onStudyCaseChange.emit(this.studyCaseDataService.loadedStudy);
        }
        this.studyCaseDataService.tradeScenarioList = [];

        this.studyCaseValidationService.loadStudyValidationData(studyId).subscribe(
          res => {
            loaderObservable.next(study);
          }, error => {
            loaderObservable.next(study);
          }
        );
      }
    },
      error => {
        loaderObservable.error(error);
      });
  }

  private internalLoadStudy(studyId: number): Observable<LoadedStudy> {
    return this.http.get(`${this.apiRoute}/${studyId}`).pipe(map(
      response => {
        this.studyCaseDataService.loadedStudy = LoadedStudy.Create(response);
        return this.studyCaseDataService.loadedStudy;
      }));
  }
  //#endregion Load study

  //#region Reload study
  reloadStudy(studyid: number): Observable<LoadedStudy> {
    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.reloadStudytimeout(studyid, observer);
    });
    return loaderObservable;
  }

  private reloadStudytimeout(studyid: number, loaderObservable: Subscriber<LoadedStudy>) {
    return this.http.get(`${this.apiRoute}/${studyid}/reload`, this.options).pipe(map(
      response => {
        this.studyCaseDataService.loadedStudy = LoadedStudy.Create(response);
        return this.studyCaseDataService.loadedStudy;
      })).subscribe(study => {
        if (study.loadInProgress === true) {
          console.log('new timer');
          setTimeout(() => {
            this.loadStudyTimeout(study.studyCase.id, true, loaderObservable, true);
          }, 2000);
        } else {
          console.log('found');
          loaderObservable.next(study);
        }
      },
        error => {
          loaderObservable.error(error);
        });
  }


  deleteStudy(studies: Study[]): Observable<void> {
    const studiesIdList = [];
    studies.forEach(s => {
      studiesIdList.push(s.id);
    });
    const deleteOptions = {
      headers: this.httpHeaders,
      body: JSON.stringify({ studies: studiesIdList })
    };
    return this.http.delete(`${this.apiRoute}`, deleteOptions).pipe(map(
      response => {
        // Check user removed currentLoadedStudy
        if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
          if (studies.filter(x => x.id === this.studyCaseDataService.loadedStudy.studyCase.id).length > 0) {
            this.studyCaseDataService.loadedStudy = null;
            this.studyCaseDataService.onStudyCaseChange.emit(null);
            this.router.navigate(['']);
          }
        }
      }));
  }

  //#region update study
  // tslint:disable-next-line: max-line-length
  updateStudyParameters(parametersList: StudyUpdateParameter[], studyId: string): Observable<LoadedStudy> {
    const url = `${this.apiRoute}/${studyId}/parameters`;

    const formData = new FormData();
    const stringParameters: StudyUpdateParameter[] = [];
    const fileInfos = {};

    if (parametersList.length > 0) {
      parametersList.forEach(parameter => {
        if (parameter.changeType === UpdateParameterType.CSV) { // Case file uploaded
          formData.append('file', TypeConversionTools.b64StringToFile(parameter.newValue, parameter.variableId + '.csv'));
          fileInfos[parameter.variableId + '.csv'] = {
            'variable_id': parameter.variableId,
            'discipline': parameter.discipline,
            'namespace': parameter.namespace,
          }
        } else {
          stringParameters.push(parameter);
        }
      });
    }

    formData.append('parameters', JSON.stringify(stringParameters));
    formData.append('file_info', JSON.stringify(fileInfos));

    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.updateStudyParametersTimeout(+studyId, url, formData, observer);
    });
    return loaderObservable;
  }

  // tslint:disable-next-line: max-line-length
  private updateStudyParametersTimeout(studyId: number, requestUrl: string, formData: FormData, loaderObservable: Subscriber<LoadedStudy>) {
    this.http.post(requestUrl, formData).pipe(map(response => {
      this.studyCaseDataService.loadedStudy = LoadedStudy.Create(response);
      return this.studyCaseDataService.loadedStudy;
    })).subscribe(study => {
      if (study.loadInProgress === true) {
        console.log('new timer');
        setTimeout(() => {
          this.loadStudyTimeout(studyId, false, loaderObservable, false);
        }, 2000);
      } else {
        console.log('found');
        loaderObservable.next(study);
      }
    },
      error => {
        loaderObservable.error(error);
      });
  }
  //#endregion update study

  upload(file: any, parameterKey: string): Observable<HttpEvent<NodeData>> {

    // Reference info for upload progress observer : https://angular.io/guide/http#listening-to-progress-events
    const url = `${this.apiRoute}/${this.studyCaseDataService.loadedStudy.studyCase.id}/parameter/upload`;

    const formData = new FormData();
    formData.append('file', file.data);
    formData.append('parameter_key', parameterKey);
    file.inProgress = true;

    return this.http.post<any>(url, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getFile(parameterKey: string): Observable<ArrayBuffer> {

    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
    } = {
      responseType: 'arraybuffer'
    };
    const url = `${this.apiRoute}/${this.studyCaseDataService.loadedStudy.studyCase.id}/parameter/download`;
    const data = {
      parameter_key: parameterKey
    };

    return this.http.post(url, data, options);
  }

  getStudyZip(studyId: string): Observable<Blob> {
    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'blob';
    } = {
      responseType: 'blob'
    };
    const url = `${this.apiRoute}/${studyId}/download`;
    const data = {
      study_id: studyId
    };

    return this.http.post(url, data, options);
  }
}
