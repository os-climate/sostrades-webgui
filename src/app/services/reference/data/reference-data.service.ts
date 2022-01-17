import { Study } from 'src/app/models/study.model';
import { Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { ReferenceGenerationStatus } from 'src/app/models/reference-generation-status.model'
import { DataHttpService } from '../../http/data-http/data-http.service';


@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService extends DataHttpService {

  public referenceManagementData: Study[];
  public referenceManagementFilter: string;
  public referenceManagementColumnFiltered: string;

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'reference');
    this.referenceManagementData = [];
    this.referenceManagementFilter = '';
    this.referenceManagementColumnFiltered = 'All columns';
  }

  clearCache() {
    this.referenceManagementData = [];
    this.referenceManagementFilter = '';
    this.referenceManagementColumnFiltered = 'All columns';
  }

  getReferences(): Observable<Study[]> {
    const url = `${this.apiRoute}`;
    return this.http.get<Study[]>(url).pipe(map(
      response => {

        const refList: Study[] = [];
        response.forEach(ref => {
          refList.push(Study.Create(ref));
        });
        return refList;
      }));
  }

  getRefGenStatus(refGenId: number): Observable<ReferenceGenerationStatus> {
    const url = `${this.apiRoute}/${refGenId}/status`;
    return this.http.get<ReferenceGenerationStatus>(url)
      .pipe(map(response => ReferenceGenerationStatus.Create(response)))
  }

  getReferencesGenStatusByName(studies: Study[]): Observable<ReferenceGenerationStatus[]> {
    const url = `${this.apiRoute}/status`;

    const request = {
      references_list: studies,
    };

    return this.http.post<ReferenceGenerationStatus[]>(url, request, this.options)
      .pipe(map(refStatusList => {
        const refStatuses: ReferenceGenerationStatus[] = [];
        refStatusList.forEach(ref => {
          const newRefStatus = ReferenceGenerationStatus.Create(ref);
          refStatuses.push(newRefStatus);
        });
        return refStatuses;
      }
      ));
  }

  getLogs(referencePath): Observable<Blob> {

    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'blob';
    } = {
      responseType: 'blob'
    };
    const url = `${this.apiRoute}/logs/download/`;
    const data = {
      reference_path: referencePath
    };

    return this.http.post(url, data, options);
  }
}
