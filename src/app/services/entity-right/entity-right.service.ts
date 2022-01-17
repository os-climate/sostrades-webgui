import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { EntityRights } from 'src/app/models/entity-right.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root',
})
export class EntityRightService extends DataHttpService {
  constructor(private http: HttpClient, private location: Location) {
    super(location, 'entity-right');
  }

  applyEntitiesChanges(entities: EntityRights): Observable<any> {
    const entitiesData = { entity_rights: entities };

    return this.http.post<any>(`${this.apiRoute}`, entitiesData).pipe(map(
      response => {
        return response;
      }));
  }

  getStudyCaseEntitiesRights(studyId: number): Observable<EntityRights> {
    return this.http
      .get<EntityRights>(
        `${this.apiRoute}/study-case/${studyId}`
      )
      .pipe(
        map((response) => {
          let entityRights: EntityRights = null;
          entityRights = EntityRights.Create(response);
          return entityRights;
        })
      );
  }

  getProcessEntitiesRights(processId: number): Observable<EntityRights> {
    return this.http
      .get<EntityRights>(
        `${this.apiRoute}/process/${processId}`
      )
      .pipe(
        map((response) => {
          let entityRights: EntityRights = null;
          entityRights = EntityRights.Create(response);
          return entityRights;
        })
      );
  }

  getGroupEntitiesRights(groupId: number): Observable<EntityRights> {
    return this.http
      .get<EntityRights>(
        `${this.apiRoute}/group/${groupId}`
      )
      .pipe(
        map((response) => {
          let entityRights: EntityRights = null;
          entityRights = EntityRights.Create(response);
          return entityRights;
        })
      );
  }
}
