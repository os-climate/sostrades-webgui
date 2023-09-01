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
  private postProcessingBundleDict: Map <string, PostProcessingBundle[]>;

  constructor(
    private http: HttpClient,
    private loggerService: LoggerService,
    private calculationService: CalculationService,
    private location: Location) {
    super(location, 'study-case');
    this.postProcessingBundleDict = new Map <string, PostProcessingBundle[]>();
    this.postProcessingBundleDict.clear();
    this.keepPoolingProcessing = true;
    this.postProcessingQueue = [];
  }
  clearCache() {
    this.postProcessingBundleDict.clear();
  }

  getDisciplineGraphFilters(study: LoadedStudy, disciplineKey: string): Observable<PostProcessingFilter[]> {
    const request = {
      discipline_key: disciplineKey
    };

    return this.http.post<PostProcessingFilter[]>(`${this.apiRoute}/${study.studyCase.id}/filter/by/discipline`, request, this.options)
    .pipe(map(
      response => {
        const result: PostProcessingFilter[] = [];
        response.forEach(postProcessingFilter => {
          result.push(PostProcessingFilter.Create(postProcessingFilter));
        });
        return result;
      }));
  }

  // tslint:disable-next-line: max-line-length
  getPostProcessing(needToUpdate: boolean, study: LoadedStudy, disciplineKey: string, moduleName: string, postProcessingFilters: PostProcessingFilter[]): Observable<any[]> {

    let postProcessingBundle: any = null;
    let postProcessing: PostProcessingBundle = null;
    postProcessingBundle = this.getPostProcessingDict(disciplineKey);
    if (postProcessingBundle !== null && postProcessingBundle !== undefined && !needToUpdate) {
      
      postProcessingBundle.forEach(postProc => {
        if (postProc.name === moduleName){
          postProcessing = postProc;
        }
      });
      if (postProcessing !== null  &&  postProcessing !== undefined){
        return of (postProcessing.plotly);
      }
    }
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
      return this.http.post(`${this.apiRoute}/${study.studyCase.id}/post-processing`, request, options).pipe(map(response => {

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
        true,
        requestData.loadedStudy,
        requestData.disciplineKey,
        requestData.postProcessingBundle.name,
        requestData.postProcessingBundle.filters).subscribe(postProcessing => {
          this.setPostProcessingBundle(requestData, postProcessing);
          const sub = requestData.subscription;
          sub.next(postProcessing);
          this.postProcessingQueue.shift();
          this.startNextPostProcessingRequest();
        }, errorReceived => {
          this.loggerService.log(errorReceived);
        });
    }
  }

  /**
   * Created 27/10/2022
   * Set the post processing dictionnary with post processind from loaded study on read only mode.
   * That allows to not load post processing with the server when post processing are already available.
   */

  public setPostProcessing(loadedStudy: LoadedStudy) {
    // Retrieve all post processing from loaded study
    Object.keys(loadedStudy.treeview.rootDict).forEach(key => {
      const rootDict = loadedStudy.treeview.rootDict;
      const postProcessingBundle = rootDict[key].postProcessingBundle;
      if (postProcessingBundle !== undefined && postProcessingBundle !== null) {
        // Set post processing dictionnary
        this.postProcessingBundleDict.set(rootDict[key].fullNamespace, postProcessingBundle);
      }
    });
  }

  /**
   * Created 27/10/2022
   * Retrieve dictionnary's values of a discipline.
   */
  public getPostProcessingDict(disciplineKey: string) {
    return this.postProcessingBundleDict.get(disciplineKey);
  }
  /**
   * Created 27/10/2022
   * Clear post processing dictionnary.
   */
  public clearPostProcessingDict() {
    this.postProcessingBundleDict.clear();
  }
  /**
   * Created 27/10/2022
   * Add post processing retrieved by dictionnary in the loadStudy after a switch on edition mode.
   */
  public addPostProcessingAfterSwitchEditionMode(loadedStudy: LoadedStudy) {
    Object.keys(loadedStudy.treeview.rootDict).forEach(key => {
      const postProcessingBundle = this.getPostProcessingDict(key);
      if (postProcessingBundle !== null && postProcessingBundle !== undefined) {
        loadedStudy.treeview.rootDict[key].postProcessingBundle = postProcessingBundle;
      }
    });
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
