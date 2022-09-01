import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Process } from 'src/app/models/process.model';
import { DataHttpService } from '../http/data-http/data-http.service';
import { ColumnName } from 'src/app/models/column-name.model';

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
    this.processManagementColumnFiltered = ColumnName.ALL_COLUMNS;
  }

  clearCache() {
    this.processManagemenentData = [];
    this.processManagementFilter = '';
    this.processManagementColumnFiltered = ColumnName.ALL_COLUMNS;
  }

  getUserProcesses(refreshList: boolean): Observable<Process[]> {

    let refreshStatus = refreshList;

    if ((refreshStatus === false) && (this.processManagemenentData.length === 0)) {
      refreshStatus = true;
    }

    if (refreshStatus) {
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
