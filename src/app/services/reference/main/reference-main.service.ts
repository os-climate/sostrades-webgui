import { Study } from 'src/app/models/study.model';
import { Injectable} from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { ReferenceGenerationStatus } from 'src/app/models/reference-generation-status.model'
import { MainHttpService } from '../../http/main-http/main-http.service';


@Injectable({
  providedIn: 'root'
})
export class ReferenceMainService extends MainHttpService {

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'reference');
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
}
