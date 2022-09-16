import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { MainHttpService } from '../http/main-http/main-http.service';

@Injectable({
  providedIn: 'root'
})
export class VisualisationService extends MainHttpService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location) {
    super(location, 'study-case');
  }

  getExecutionSequenceData(studyId: number): Observable<any> {
    return this.http.get(`${this.apiRoute}/${studyId}/execution-sequence`);
  }

  getInterfaceDiagramData(studyId: number): Observable<any> {
    return this.http.get(`${this.apiRoute}/${studyId}/interface-diagram`);
  }

  getDiagramN2Data(studyId: number): Observable<any> {
    return this.http.get(`${this.apiRoute}/${studyId}/n2-diagram`);
  }
}
