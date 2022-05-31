import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Process } from 'src/app/models/process.model';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessService extends DataHttpService {

  public processManagementFilter: string;
  public processManagementColumnFiltered: string;

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'resources');

    this.processManagementFilter = '';
    this.processManagementColumnFiltered = 'All columns';
  }

  clearCache() {
    this.processManagementFilter = '';
    this.processManagementColumnFiltered = 'All columns';
  }

  getUserProcesses(): Observable<Process[]> {
    return this.http.get<Process[]>(`${this.apiRoute}/process`).pipe(map(
      response => {
        const processList: Process[] = [];
        response.forEach(pro => {
          processList.push(Process.Create(pro));
        });
        return processList;
      }));
  }

  getDashboardProcesses(): Observable<Process[]> {
    return this.http.get<Process[]>(`${this.apiRoute}/process/dashboard`).pipe(map(
      response => {
        const processList: Process[] = [];
        response.forEach(pro => {
          processList.push(Process.Create(pro));
        });
        return processList;
      }));
  }

}
