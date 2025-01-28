import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { BaseHttpService } from '../http/base-http/base-http.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OntologyDirectService extends BaseHttpService {

  constructor(

    private location: Location,
    private http: HttpClient,
    ) {
      super(location, 'ontology/v1', environment.API_ONTOLOGY_DIRECT_URL);
    }

private getOntologyDowloadUrl(type: string) {

    const url = `${this.apiRoute}/download?filetype=${type}`;
    return url;
  }
  getOntologyDowloadUrlOwl() {
   return this.getOntologyDowloadUrl('owl');
  }
  getOntologyDowloadUrlXlsx() {
    return this.getOntologyDowloadUrl('xlsx');
   }
}
