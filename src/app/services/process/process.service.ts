import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
  public processManagemenentData: Process[];
  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'resources');

    this.processManagementFilter = '';
    this.processManagemenentData = [];
    this.processManagementColumnFiltered = 'All columns';
  }

  clearCache() {
    this.processManagemenentData = [];
    this.processManagementFilter = '';
    this.processManagementColumnFiltered = 'All columns';
  }

  getUserProcesses(refreshList: boolean): Observable<Process[]> {
    if (refreshList) {
        return this.http.get<Process[]>(`${this.apiRoute}/process`).pipe(map(
          response => {
            const processList: Process[] = [];
            response.forEach(pro => {
              processList.push(Process.Create(pro));
              this.processManagemenentData = processList;
            });
            return processList;
          }));
    } else {
      return of(this.processManagemenentData);
    }
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
