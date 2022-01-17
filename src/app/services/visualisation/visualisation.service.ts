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
    super(location, 'visualisation');
  }

  getExecutionSequenceData(studyId: number): Observable<any> {
    return this.http.get(`${this.apiRoute}/visualisation-execution-sequence/${studyId}`);
  }
}
