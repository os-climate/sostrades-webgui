import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { DataHttpService } from '../http/data-http/data-http.service';
import { News } from 'src/app/models/news.models';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FlavorsService extends DataHttpService {
  private flavorsListStudy: string[]
  private flavorsListExec: string[]
  constructor(
    private http: HttpClient,
    private location: Location) {
    super (location, 'flavors');
    this.flavorsListStudy = []
    this.flavorsListExec = []
  }


  getAllFlavorsStudy(): Observable<string[]> {
    if (this.flavorsListStudy.length == 0){
      return this.http.get<string[]>(`${this.apiRoute}/study`, this.options).pipe(map(
        response => {
          this.flavorsListStudy = response;
          return response;
        }));
    }
    else{
      return of(this.flavorsListStudy)
    }
  }

  getAllFlavorsExec(): Observable<string[]> {
    if (this.flavorsListExec.length == 0){
      return this.http.get<string[]>(`${this.apiRoute}/exec`, this.options).pipe(map(
        response => {
          this.flavorsListExec = response;
          return response;
        }));
    }
    else{
      return of(this.flavorsListExec)
    }
  }

  
 
}
