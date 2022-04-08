import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Group, LoadedGroup } from 'src/app/models/group.model';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { DataHttpService } from '../http/data-http/data-http.service';


@Injectable({
  providedIn: 'root'
})
export class GroupDataService extends DataHttpService {

  onGroupsChange: EventEmitter<boolean> = new EventEmitter();
  public allGroups: Group[];

  public groupManagementData: LoadedGroup[];
  public groupManagementFilter: string;
  public groupManagementColumnFiltered: string;

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'group');
    this.allGroups = [];

    this.groupManagementData = [];
    this.groupManagementFilter = '';
    this.groupManagementColumnFiltered = 'All columns';
  }

  clearCache() {
    this.groupManagementData = [];
    this.groupManagementFilter = '';
    this.groupManagementColumnFiltered = 'All columns';
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

  updateGroup(group_id: number, name: string, description: string):Observable<LoadedGroup>{
    const payload = {group_id, name, description};
    return this.http.post<LoadedGroup>(`${this.apiRoute}/${group_id}`, payload, this.options);
  }

  getUserGroups(): Observable<LoadedGroup[]> {
    return this.http.get<LoadedGroup[]>(`${this.apiRoute}/user`).pipe(map(
      response => {
        const groups: LoadedGroup[] = [];
        response.forEach(group => {
          groups.push(LoadedGroup.Create(group));
        });
        return groups;
      }));
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
