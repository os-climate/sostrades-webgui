import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadedStudy, Study } from 'src/app/models/study.model';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostProcessingFilter } from 'src/app/models/post-processing-filter.model';
import { Location } from '@angular/common';
import { PostProcessingBundle } from 'src/app/models/post-processing-bundle.model';
import { LoggerService } from '../logger/logger.service';
import { PendingPostProcessingRequest } from 'src/app/models/post-processing.model';
import { CalculationService } from '../calculation/calculation.service';
import { PostProcessingHttpService } from '../http/post-processing-http/post-processing-http.service';


@Injectable({
  providedIn: 'root'
})
export class PostProcessingService extends PostProcessingHttpService {

  private keepPoolingProcessing: boolean;
  private postProcessingQueue: PendingPostProcessingRequest[];

  constructor(
    private http: HttpClient,
    private loggerService: LoggerService,
    private calculationService: CalculationService,
    private location: Location) {
    super(location, 'post-processing');
    this.keepPoolingProcessing = true;
    this.postProcessingQueue = [];
  }

  getDisciplineGraphFilters(study: LoadedStudy, disciplineKey: string): Observable<PostProcessingFilter[]> {
    const request = {
      discipline_key: disciplineKey,
      study_id: study.studyCase.id
    };

    return this.http.post<PostProcessingFilter[]>(`${this.apiRoute}`, request, this.options).pipe(map(
      response => {
        const result: PostProcessingFilter[] = [];
        response.forEach(postProcessingFilter => {
          result.push(PostProcessingFilter.Create(postProcessingFilter));
        });
        return result;
      }));
  }

  // tslint:disable-next-line: max-line-length
  getPostProcessing(study: LoadedStudy, disciplineKey: string, moduleName: string, postProcessingFilters: PostProcessingFilter[]): Observable<any[]> {

    if (disciplineKey !== null && disciplineKey !== undefined && disciplineKey !== '') {
      const request = {
        discipline_key: disciplineKey,
        module_name: moduleName,
        filters: postProcessingFilters.map(cf => cf.toServerDTO())
      };

      // Regarding post-processing, returned values can contains token that are not compatible
      // with the json parser (specific numeric values regarding the numerical framewor used on server side to generate
      // data)
      // So to be able to manage result stream, response type is forced on 'text' to avoid xhr to manage by
      // itself the json parsing.
      // Next we directly manage the json parsing in this code after some filtering of the result
      const options = {
        headers: this.httpHeaders,
        responseType: 'text' as const
      };

      // tslint:disable-next-line: max-line-length
      return this.http.post(`${this.apiRoute}/${study.studyCase.id}`, request, options).pipe(map(response => {

        // Add check regarding numpy python type that are not manage by the JSON parser
        // At least NaN and Infinity values are converted to null in order to avoid parsing error
        const cleanedData =  response.replace(new RegExp('NaN', 'g'), 'null').replace(new RegExp('Infinity', 'g'), 'null');
        return JSON.parse(cleanedData);
      }));
    } else {
      return of(null);
    }
  }

  //
  // POST PROCESSING QUEUE - BEGIN
  // Handle post processing background loading queue
  //
  private executePostProcessingRequest(requestData: PendingPostProcessingRequest) {

    if (requestData !== undefined && requestData !== null) {
      const req = this.getPostProcessing(
        requestData.loadedStudy,
        requestData.disciplineKey,
        requestData.postProcessingBundle.name,
        requestData.postProcessingBundle.filters).subscribe(postProcessing => {
          this.setPostProcessingBundle(requestData, postProcessing);
          const sub = requestData.subscription;
          sub.next(postProcessing);
          this.postProcessingQueue.shift();
          this.calculationService.getLog(requestData.loadedStudy.studyCase.id);
          this.startNextPostProcessingRequest();
        }, errorReceived => {
          this.loggerService.log(errorReceived);
        });
    }
  }

  public addPostProcessingRequestToQueue(
    study: LoadedStudy,
    disciplineKey: string,
    postProcessingBundle: PostProcessingBundle) {
    const sub = new Subject<any>();
    const request = new PendingPostProcessingRequest(study, disciplineKey, postProcessingBundle, sub);

    this.postProcessingQueue.push(request);
    if (this.postProcessingQueue.length === 1) {
      this.startNextPostProcessingRequest();
    }
    return sub;
  }

  private startNextPostProcessingRequest() {
    if (this.postProcessingQueue.length > 0 && this.keepPoolingProcessing) {
      this.executePostProcessingRequest(this.postProcessingQueue[0]);
    }
  }

  public pausePostProcessingRequestQueue() {
    this.keepPoolingProcessing = false;
  }

  public resumePostProcessingRequestQueue() {
    this.keepPoolingProcessing = true;
    this.startNextPostProcessingRequest();
  }

  public removePostProcessingRequestFromQueue(disciplineKey: string, bundleName: string) {

    if (this.postProcessingQueue.length > 0) {
      this.postProcessingQueue.forEach((req, index, object) => {
        if (req.disciplineKey === disciplineKey && req.postProcessingBundle.name === bundleName) {
          object.splice(index, 1);
        }
      });
    }
  }

  public resetPostProcessingQueue() {
    this.postProcessingQueue = [];
  }

  private setPostProcessingBundle(requestData: PendingPostProcessingRequest, postProcessing) {
    requestData.postProcessingBundle.UpdatePlots(postProcessing);
  }
  //
  // POST PROCESSING QUEUE - END
  //


}
