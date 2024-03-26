import { Study } from 'src/app/models/study.model';
import { Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { ReferenceGenerationStatus } from 'src/app/models/reference-generation-status.model';
import { DataHttpService } from '../../http/data-http/data-http.service';
import { ColumnName, Routing } from 'src/app/models/enumeration.model';


@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService extends DataHttpService {

  public referenceManagementData: Study[];
  public referenceManagementFilter: string;
  public referenceManagementColumnFiltered: string;
  public referenceSelectedValues = new Map <ColumnName, string[]>();


  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'reference');
    this.referenceManagementData = [];
    this.referenceSelectedValues.clear();
    this.referenceManagementFilter = '';
    this.referenceManagementColumnFiltered = ColumnName.ALL_COLUMNS;
  }

  clearCache() {
    this.referenceManagementData = [];
    this.referenceManagementFilter = '';
    this.referenceManagementColumnFiltered = ColumnName.ALL_COLUMNS;
    this.referenceSelectedValues.clear();
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
      .pipe(map(response => ReferenceGenerationStatus.Create(response)));
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

  reGenerateReference(repositoryName: string, processName: string, useCaseName: string): Observable<number> {
    const url = `${this.apiRoute}`;

    const request = {
      repository_name: repositoryName,
      process_name: processName,
      usecase_name: useCaseName
    };
    return this.http.post<number>(url, request, this.options);
  }

  updateGenerateReferenceFlavor(refGenId, flavor: string): Observable<boolean> {
    const url = `${this.apiRoute}/${refGenId}/update-flavor`;

    const request = {
      reference_id: refGenId,
      flavor: flavor
    };
    return this.http.post<boolean>(url, request, this.options);
  }

  getGenerateReferenceFlavor(refGenId): Observable<string> {
    const url = `${this.apiRoute}/${refGenId}/get-flavor`;


    return this.http.get<string>(url, this.options);
  }
}
