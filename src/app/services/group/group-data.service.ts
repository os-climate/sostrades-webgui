import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Group, LoadedGroup } from 'src/app/models/group.model';
import { Observable, of } from 'rxjs';
import { Location } from '@angular/common';
import { DataHttpService } from '../http/data-http/data-http.service';
import { ColumnName } from 'src/app/models/enumeration.model';


@Injectable({
  providedIn: 'root'
})
export class GroupDataService extends DataHttpService {

  onGroupsChange: EventEmitter<boolean> = new EventEmitter();
  public allGroups: Group[];

  public groupManagementFilter: string;
  public groupManagementColumnFiltered: string;
  public groupSelectedValues = new Map <ColumnName, string[]>();
  public loadedGroups: LoadedGroup[];

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'group');
    this.allGroups = [];
    this.groupSelectedValues.clear();
    this.groupManagementFilter = '';
    this.groupManagementColumnFiltered = ColumnName.ALL_COLUMNS;
    this.loadedGroups = []
  }

  clearCache() {
    this.loadedGroups = [];
    this.groupManagementFilter = '';
    this.groupManagementColumnFiltered = ColumnName.ALL_COLUMNS;
    this.groupSelectedValues.clear();
  }

  loadAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiRoute}`).pipe(map(
      response => {
        const groups: Group[] = [];
        response.forEach(group => {
          groups.push(Group.Create(group));
        });
        this.allGroups = groups;
        return groups;
      }));
  }

  createGroup(name: string, description: string, confidential: boolean): Observable<Group> {
    const createData = { name, description, confidential };

    return this.http.post<Group>(`${this.apiRoute}`, createData).pipe(map(
      response => {
        this.onGroupsChange.emit(true);
        return response;
      }));
  }

  updateGroup(groupId: number, groupName: string, groupDescription: string): Observable<Group> {
    const payload = {
      id: groupId,
      name: groupName,
      description: groupDescription
    };
    return this.http.post<Group>(`${this.apiRoute}/${groupId}`, payload, this.options);
  }

  getUserGroups(refreshList: boolean): Observable<LoadedGroup[]> {
    let refreshStatus = refreshList;

    if ((refreshStatus === false) && (this.loadedGroups.length === 0)) {
      refreshStatus = true;
    }

    if (refreshStatus) {
      return this.http.get<LoadedGroup[]>(`${this.apiRoute}/user`).pipe(map(
      response => {
        const groups: LoadedGroup[] = [];
        response.forEach(group => {
          groups.push(LoadedGroup.Create(group));
        });
        this.loadedGroups = groups ;
        return this.loadedGroups
      }));
    } else {
      return of(this.loadedGroups)
    }
  }

  deleteGroup(groupId: number) {
    const deleteOptions = {
      headers: this.httpHeaders,
      body: JSON.stringify({ group_id: groupId })
    };

    return this.http.delete(`${this.apiRoute}`, deleteOptions).pipe(map(
      response => {
        this.onGroupsChange.emit(true);
        return response;
      }));
  }
}
