import { Study, LoadedStudy, StudyCaseInitialSetupPayload, LoadStatus } from 'src/app/models/study.model';
import { Injectable, EventEmitter } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable, Subscriber, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { Location } from '@angular/common';
import { TypeConversionTools } from 'src/app/tools/type-conversion.tool';
import { StudyCaseValidationService } from '../../study-case-validation/study-case-validation.service';
import { MainHttpService } from '../../http/main-http/main-http.service';
import { StudyCaseDataService } from '../data/study-case-data.service';
import { StudyCaseExecutionObserverService } from 'src/app/services/study-case-execution-observer/study-case-execution-observer.service';
import { Routing } from 'src/app/models/enumeration.model';
import { StudyCaseAllocation, StudyCaseAllocationStatus } from 'src/app/models/study-case-allocation.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';


@Injectable({
  providedIn: 'root'
})
export class StudyCaseMainService extends MainHttpService {

  onCloseStudy: EventEmitter<boolean> = new EventEmitter();
  onNoStudyServer: EventEmitter<boolean> = new EventEmitter();

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
  createStudy(studyInformation: StudyCaseInitialSetupPayload, withEmit: boolean): Observable<LoadedStudy> {
    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.createStudytimeout(studyInformation, withEmit, observer);
    });
    return loaderObservable;
  }

  private createStudytimeout(studyInformation: StudyCaseInitialSetupPayload, withEmit: boolean, loaderObservable: Subscriber<LoadedStudy>) {
    const url = `${this.apiRoute}/${studyInformation.studyCaseIdentifier}`;
    return this.http.post(url, JSON.stringify(studyInformation), this.options).pipe(map(
      response => {
        return LoadedStudy.Create(response);
      })).subscribe({
        next:(loadedStudy) => {

        if (loadedStudy.loadStatus === LoadStatus.IN_PROGESS) {
          setTimeout(() => {
            this.loadStudyInReadOnlyModeIfNeededTimeout(loadedStudy.studyCase.id, false, loaderObservable);
          }, 2000);
        } else {
          // Add study case to study management list
          this.studyCaseDataService.studyManagementData.unshift(loadedStudy.studyCase);
          loaderObservable.next(loadedStudy);
        }
      },
      error:(error) => {
        //just try another time to be sure server is not available
        setTimeout(() => {
          console.log("Try to create study after first failure")
          this.http.post(url, JSON.stringify(studyInformation), this.options).pipe(map(
            response => {
              return LoadedStudy.Create(response);
            })).subscribe({
              next:(loadedStudy) => {
                if (loadedStudy.loadStatus === LoadStatus.IN_PROGESS) {
                  setTimeout(() => {
                    this.loadStudyInReadOnlyModeIfNeededTimeout(loadedStudy.studyCase.id, false, loaderObservable);
                  }, 2000);
                } else {
                  // Add study case to study management list
                  this.studyCaseDataService.studyManagementData.unshift(loadedStudy.studyCase);
                  loaderObservable.next(loadedStudy);
                }
              },
            error:(error) => {
              loaderObservable.error(error);
            }
          });
        }, 2000);
      }
    });
  }

  //#endregion create study

  //#region copy study
  copyStudy(sourceStudyCaseIdentifier: number, targetStudyCaseIdentifier: number): Observable<LoadedStudy> {
    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.copyStudytimeout(sourceStudyCaseIdentifier, targetStudyCaseIdentifier, observer);
    });
    return loaderObservable;
  }

  private copyStudytimeout(
                          sourceStudyCaseIdentifier: number,
                          targetStudyCaseIdentifier: number,
                          loaderObservable: Subscriber<LoadedStudy>) {
    const request = {
      source_study_case: sourceStudyCaseIdentifier
    };
    return this.http.post(`${this.apiRoute}/${targetStudyCaseIdentifier}/copy`, request, this.options).pipe(map(
      response => {
        return Study.Create(response);
      })).subscribe({
        next:(study) => {

        setTimeout(() => {
          this.loadStudyInReadOnlyModeIfNeededTimeout(study.id, false, loaderObservable);
        }, 2000);
      },
        error:(error) => {
          loaderObservable.error(error);
        }
      });
  }
  //#endregion copy study

  //#region Load study
  loadStudy(studyId: number, withEmit: boolean, withTimeout = true): Observable<LoadedStudy> {
    if (withTimeout) {
      const loaderObservable = new Observable<LoadedStudy>((observer) => {
        // Start study case loading to other services
        this.loadStudyTimeout(studyId, withEmit, observer, false);
      });
      return loaderObservable;

    }
    else {
      return this.internalLoadStudy(studyId);
    }

  }

  private loadStudyTimeout(studyId: number, withEmit: boolean, loaderObservable: Subscriber<LoadedStudy>, addToStudyManagement: boolean) {
    this.internalLoadStudy(studyId).subscribe(
      {next:(loadedStudy) => {
        if (loadedStudy.loadStatus === LoadStatus.IN_PROGESS) {
          setTimeout(() => {
            this.loadStudyTimeout(studyId, withEmit, loaderObservable, addToStudyManagement);
          }, 2000);
        } else {
          if(withEmit){
            this.updateStudyCaseDataService(loadedStudy);
            this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
          }

          loaderObservable.next(loadedStudy);
        }
      },
      error:(error) => {
        //just try another time to be sure server is not available
        setTimeout(() => {
          console.log("Try to load study after first failure")
          this.internalLoadStudy(studyId).subscribe(
            {next: (loadedStudy) => {
              this.loadStudyTimeout(studyId, withEmit, loaderObservable, addToStudyManagement);
            },
            error:(error) => {
              loaderObservable.error(error);
            }
          });
        },2000);
      }
    });
        
  }

  private internalLoadStudy(studyId: number): Observable<LoadedStudy> {
    return this.http.get(`${this.apiRoute}/${studyId}`).pipe(map(
      response => {
        return LoadedStudy.Create(response);
      }));
  }

  loadStudyInReadOnlyModeIfNeeded(studyId: number, withEmit: boolean, withTimeout = true): Observable<LoadedStudy> {
    if (withTimeout) {
      const loaderObservable = new Observable<LoadedStudy>((observer) => {
        // Start study case loading to other services
        this.loadStudyInReadOnlyModeIfNeededTimeout(studyId, withEmit, observer);
      });
      return loaderObservable;

    }
    else {
      return this.internalloadStudyInReadOnlyModeIfNeeded(studyId);
    }

  }

  private loadStudyInReadOnlyModeIfNeededTimeout(studyId: number, withEmit: boolean, loaderObservable: Subscriber<LoadedStudy>) {
    this.internalloadStudyInReadOnlyModeIfNeeded(studyId).subscribe(
      {next: (loadedStudy) => {
        if (loadedStudy.loadStatus === LoadStatus.IN_PROGESS) {
          setTimeout(() => {
            this.loadStudyInReadOnlyModeIfNeededTimeout(studyId, withEmit, loaderObservable);
          }, 2000);
        } else {
          if(withEmit){
            this.updateStudyCaseDataService(loadedStudy);
            this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
          }

          loaderObservable.next(loadedStudy);
        }
      },
        error:(error) => {
          //just try another time to be sure server is not available
          setTimeout(() => {
            console.log("Try to load study in read only mode after first failure")
            this.internalloadStudyInReadOnlyModeIfNeeded(studyId).subscribe(
              {next: (loadedStudy) => {
                this.loadStudyInReadOnlyModeIfNeededTimeout(studyId, withEmit, loaderObservable);
              },
              error:(error) => {
                loaderObservable.error(error);
              }
            });
          },2000);
      }
    });
        
  }

  private internalloadStudyInReadOnlyModeIfNeeded(studyId: number): Observable<LoadedStudy> {
    return this.http.get(`${this.apiRoute}/${studyId}/read-only-mode`).pipe(map(
      response => {
        if (response !== null && response !== undefined) {
          return LoadedStudy.Create(response);
        } else {
          return undefined;
        }
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
    return this.http.get(`${this.apiRoute}/${studyid}/reload`, this.options).subscribe(
        { next:(isReloaded) => {
          setTimeout(() => {
            this.loadStudyTimeout(studyid, true, loaderObservable, true);
          }, 2000);
        
      },
      error:(error) => {
        loaderObservable.error(error);
      }
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
            const url = this.router.url;
            if (url.includes(Routing.STUDY_MANAGEMENT)) {
              this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
              } else {
              this.router.navigate([url]);
            }
          }
        }
      }));
  }

  importDatasetFromJsonFile(studyId: number, formData: any, notification_id: number) {
    const url = `${this.apiRoute}/${studyId}/${notification_id}/import-datasets-mapping`;
    const loaderObservable = new Observable<LoadedStudy>((observer) => {
      this.updateStudyParametersTimeout(+studyId, url, formData, observer);
    });
    return loaderObservable;
  }

  exportDatasetFromJsonFile(studyId: number, formData: any, notification_id: number) {
    const url = `${this.apiRoute}/${studyId}/${notification_id}/export-datasets-mapping`;
    const loaderObservable = new Observable<string>((observer) => {
      this.http.post<string>(url, formData).subscribe({
        next:(exportStatus) => {
          if (exportStatus === LoadStatus.IN_PROGESS) {
              this.exportDatasetTimeout(+studyId, notification_id, observer);
          }
        },
        error:(error) => {
          observer.error(error);
        }
      });
    });
    return loaderObservable;
  }

  getDatasetExportErrorStatus(studyId: number, notification_id: number) {
    const url = `${this.apiRoute}/${studyId}/${notification_id}/export-datasets-status`;
    return this.http.get<string>(url);
  }

  private exportDatasetTimeout(studyId: number, notification_id: number, observable: Subscriber<string>) {
    this.getDatasetExportErrorStatus(studyId, notification_id).subscribe(
      {next:(exportStatus) => {
        if (exportStatus === LoadStatus.IN_PROGESS) {
          setTimeout(() => {
            this.exportDatasetTimeout(studyId, notification_id, observable);
          }, 2000);
        } else {
          observable.next(exportStatus);
        }
      },
      error:(error) => {
       
        observable.error(error);
       
      }
    });
  }

  getDatasetImportErrorMessage(studyId: number) {
    const url = `${this.apiRoute}/${studyId}/import-datasets-error-message`;
    return this.http.get<string>(url);
  }

  getDatasetExportErrorMessage(studyId: number, notification_id:number) {
    const url = `${this.apiRoute}/${studyId}/${notification_id}/export-datasets-error`;
    return this.http.get<string>(url);
  }

  //#region update study
  // eslint-disable-next-line max-len
  updateStudyParameters(parametersList: StudyUpdateParameter[], studyId: string): Observable<LoadedStudy> {
    const url = `${this.apiRoute}/${studyId}/parameters`;

    const formData = new FormData();
    const stringParameters: StudyUpdateParameter[] = [];
    const fileInfos = {};

    if (parametersList.length > 0) {
      parametersList.forEach(parameter => {
        if (parameter.changeType === UpdateParameterType.CSV) { // Case file uploaded
          formData.append('file', TypeConversionTools.b64StringToFile(parameter.newValue, parameter.variableId + '.csv'));
          // Check if columns has been deleded
          if (parameter.columnDeleted !== undefined && parameter.columnDeleted !== null && parameter.columnDeleted.length > 0) {
           formData.append('column_deleted', JSON.stringify(parameter.columnDeleted));
          }
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

  // eslint-disable-next-line max-len
  private updateStudyParametersTimeout(studyId: number, requestUrl: string, formData: FormData,  loaderObservable: Subscriber<LoadedStudy>) {
    this.http.post(requestUrl, formData).pipe(map(response => {
      return LoadedStudy.Create(response);
    })).subscribe({
      next:(loadedStudy) => {
      if (loadedStudy.loadStatus === LoadStatus.IN_PROGESS) {
        setTimeout(() => {
          this.loadStudyTimeout(studyId, false, loaderObservable, false);
        }, 2000);
      } else {
        this.updateStudyCaseDataService(null);
        loaderObservable.next(loadedStudy);
      }
    },
      error:(error) => {
        loaderObservable.error(error);
      }
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
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let fileIndex = 0; fileIndex < files.length; ++fileIndex) {

        const file = files[fileIndex];
        formData.append(file.name, file);
      }
      const url = `${this.apiRoute}/${studyId}/upload/raw`;
      return this.http.post<string>(url, formData);
    }
  }

  setStudyIsActive(){
    // save the date of the last user activity on the study
    const url = `${this.apiRoute}/${this.studyCaseDataService.loadedStudy.studyCase.id}/is-active`;
    return this.http.post(url,{}).subscribe({
      next: (sOK) => {
      }, error: (error) => {
        console.log(error);
      }
    });
  }

  checkStudyIsUpAndLoaded(){
    //Check if the study pod server is up and if the study is loaded
    const study_id = this.studyCaseDataService.loadedStudy.studyCase.id;
    const url = `${this.apiRoute}/${study_id}/is-up-and-loaded`;
    return this.http.get<boolean>(url).subscribe({
      next: (isLoaded) => {
      this.setNoStudyHeader(isLoaded);
      }, error: (error) => {
        if (error.statusCode === 502 || error.statusCode === 0){
          this.setNoStudyHeader(false);
        }
      }
    });
  }

  setNoStudyHeader(isLoaded: boolean){
    this.onNoStudyServer.emit(isLoaded);
  }
  

  private updateStudyCaseDataService(loadedStudy: LoadedStudy) {
    const currentLoadedStudy = this.studyCaseDataService.loadedStudy;

    if ((currentLoadedStudy !== null) && (currentLoadedStudy !== undefined)) {
      this.studyCaseExecutionObserverService.removeStudyCaseObserver(currentLoadedStudy.studyCase.id);
    }

    this.studyCaseDataService.setCurrentStudy(loadedStudy);
  }



}
