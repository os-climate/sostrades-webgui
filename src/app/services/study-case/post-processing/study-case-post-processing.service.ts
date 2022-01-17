import { Injectable, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import { Location } from '@angular/common';
import { PostProcessingHttpService } from '../../http/post-processing-http/post-processing-http.service';

@Injectable({
  providedIn: 'root'
})
export class StudyCasePostProcessingService extends PostProcessingHttpService {


  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'study-case');
  }

  clearCache() {

  }


  //#region Load study
  loadStudy(studyId: number, reload: boolean): Observable<boolean> {

    const loaderObservable = new Observable<boolean>((observer) => {
      //start study case loading to other services
      this.loadStudyTimeout(studyId, observer, reload);
    });
    return loaderObservable;
  }

  private loadStudyTimeout(studyId: number, loaderObservable: Subscriber<boolean>, reload: boolean) {
    this.internalLoadStudy(studyId, reload).subscribe(loaded => {
      if (loaded === false) {
        console.log('new timer');
        setTimeout(() => {
          this.loadStudyTimeout(studyId,loaderObservable, false);
        }, 2000);
      } else {
        console.log('found');
        loaderObservable.next(loaded);
      }
    },
      error => {
      loaderObservable.error(error);
    });
  }

  private internalLoadStudy(studyId: number, reload: boolean): Observable<boolean> {
    if(reload){
      return this.http.get<boolean>(`${this.apiRoute}/${studyId}/reload`).pipe(map(
        response => {
          return response;
        }));
    }
    else{
      return this.http.get<boolean>(`${this.apiRoute}/${studyId}`).pipe(map(
        response => {
          return response;
        }));
    }
  }
  //#endregion Load study
}