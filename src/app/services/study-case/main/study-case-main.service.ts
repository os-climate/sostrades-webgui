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
import { ValidationTreeNodeState } from 'src/app/models/study-case-validation.model';
import { Routing } from 'src/app/models/routing.model';
import { StudyCaseExecutionObserverService } from 'src/app/services/study-case-execution-observer/study-case-execution-observer.service';


@Injectable({
  providedIn: 'root'
})
export class StudyCaseMainService extends MainHttpService {

  onCloseStudy: EventEmitter<boolean> = new EventEmitter();
  onCreateStudy: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private http: HttpClient,
    private router: Router,
    private studyCaseValidationService: StudyCaseValidationService,
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseExecutionObserverService: StudyCaseExecutionObserverService,
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
        return LoadedStudy.Create(response);
      })).subscribe(loadedStudy => {
        if (loadedStudy.loadInProgress === true) {

          setTimeout(() => {
            this.loadStudyTimeout(loadedStudy.studyCase.id, false, loaderObservable, true);
          }, 2000);
        } else {

          // Assign study to data service
          this.updateStudyCaseDataService(loadedStudy);

          // Reload parameter ontology
          this.studyCaseDataService.updateParameterOntology(loadedStudy);

          // Add study case to study management list
          this.onCreateStudy.emit(true);
          // this.studyCaseDataService.studyManagementData.unshift(loadedStudy.studyCase);
          loaderObservable.next(loadedStudy);
        }
      },
      error => {
        loaderObservable.error(error);
      });
  }

  updateStudy(studyId: number, studyName: string, groupId: number): Observable<LoadedStudy> {
    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.updateStudyTimeout(studyId, studyName, groupId, observer);
    });
    return loaderObservable;
  }

  private updateStudyTimeout(studyId: number, studyName: string, groupId: number, loaderObservable: Subscriber<LoadedStudy>) {
    const payload = {
      study_id : studyId,
      new_study_name: studyName,
      group_id: groupId
    };
    const url = `${this.apiRoute}/${studyId}`;
    return this.http.post<LoadedStudy>(url, payload, this.options).pipe(map(
      response => {
        return LoadedStudy.Create(response);
      }))
      .subscribe(loadedStudy => {
        if (loadedStudy.loadInProgress === true) {
          setTimeout(() => {
            this.loadStudyTimeout(studyId, false, loaderObservable, true);
          }, 2000);
        } else {
          loaderObservable.next(loadedStudy);
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
        return Study.Create(response);
      })).subscribe(study => {
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
      // Start study case loading to other services
      this.loadStudyTimeout(studyId, withEmit, observer, false);
    });
    return loaderObservable;
  }

  private loadStudyTimeout(studyId: number, withEmit: boolean, loaderObservable: Subscriber<LoadedStudy>, addToStudyManagement: boolean) {
    this.internalLoadStudy(studyId).subscribe(loadedStudy => {
      if (loadedStudy.loadInProgress === true) {
        setTimeout(() => {
          this.loadStudyTimeout(studyId, withEmit, loaderObservable, addToStudyManagement);
        }, 2000);
      } else {

        // Assign study to data service
        this.updateStudyCaseDataService(loadedStudy);

        if (addToStudyManagement === true) {

          this.studyCaseDataService.getStudies().subscribe(studies => {
            this.studyCaseDataService.studyManagementData = studies;
          });
        }

        // Reload ontology parameters
        this.studyCaseDataService.updateParameterOntology(loadedStudy);

        if (withEmit === true) {
          this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
        }

        this.studyCaseDataService.tradeScenarioList = [];

        this.studyCaseValidationService.loadStudyValidationData(studyId).subscribe(
          res => {
            this.validatedUpdated();
            loaderObservable.next(loadedStudy);
          }, error => {
            loaderObservable.next(loadedStudy);
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
        return LoadedStudy.Create(response);
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
        return LoadedStudy.Create(response);
      })).subscribe(loadedStudy => {
        if (loadedStudy.loadInProgress === true) {
          setTimeout(() => {
            this.loadStudyTimeout(loadedStudy.studyCase.id, true, loaderObservable, true);
          }, 2000);
        } else {

          // Assign study to data service
          this.updateStudyCaseDataService(loadedStudy);

          // Reload parameter ontology
          this.studyCaseDataService.updateParameterOntology(loadedStudy);
          loaderObservable.next(loadedStudy);
        }
      },
        error => {
          loaderObservable.error(error);
        });
  }

  closeStudy(close: boolean) {
      this.onCloseStudy.emit(close);
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
            this.updateStudyCaseDataService(null);
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
            variable_id: parameter.variableId,
            discipline: parameter.discipline,
            namespace: parameter.namespace,
          };
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
      return LoadedStudy.Create(response);
    })).subscribe(loadedStudy => {
      if (loadedStudy.loadInProgress === true) {
        setTimeout(() => {
          this.loadStudyTimeout(studyId, false, loaderObservable, false);
        }, 2000);
      } else {
        this.updateStudyCaseDataService(null);
        // Reload parameter ontology
        this.studyCaseDataService.updateParameterOntology(loadedStudy);
        loaderObservable.next(loadedStudy);
      }
    },
      error => {
        loaderObservable.error(error);
      });
  }
  //#endregion update study

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

  getStudyRaw(studyId: string): Observable<Blob> {
    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'blob';
    } = {
      responseType: 'blob'
    };
    const url = `${this.apiRoute}/${studyId}/download/raw`;
    const data = {
      study_id: studyId
    };

    return this.http.post(url, data, options);
  }

  uploadStudyRaw(studyId: string, files: FileList): Observable<string> {
    const formData = new FormData();

    if (files.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (let fileIndex = 0; fileIndex < files.length; ++fileIndex) {

        const file = files[fileIndex];
        formData.append(file.name, file);
      }
      const url = `${this.apiRoute}/${studyId}/upload/raw`;
      return this.http.post<string>(url, formData);
    }
  }

  private updateStudyCaseDataService(loadedStudy: LoadedStudy) {
    const currentLoadedStudy = this.studyCaseDataService.loadedStudy;

    if ((currentLoadedStudy !== null) && (currentLoadedStudy !== undefined)) {
      this.studyCaseExecutionObserverService.removeStudyCaseObserver(currentLoadedStudy.studyCase.id);
    }

    this.studyCaseDataService.setCurrentStudy(loadedStudy);
  }

  public validatedUpdated() {
    const studyId = this.studyCaseDataService.loadedStudy.studyCase.id;

    Object.values(this.studyCaseDataService.loadedStudy.treeview.rootDict).forEach(
      element => {
        const studyCaseValidation = this.studyCaseValidationService.studyValidationDict[element.fullNamespace];

        if ((studyCaseValidation !== undefined) &&  (studyCaseValidation !== null)) {
            element.isValidated = studyCaseValidation[0].validationState === ValidationTreeNodeState.VALIDATED;
          }
     });
  }
}
