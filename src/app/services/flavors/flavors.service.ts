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
  private flavorsList: string[]
  constructor(
    private http: HttpClient,
    private location: Location) {
    super (location, 'flavors');
    this.flavorsList = []
  }


  getAllFlavors(): Observable<string[]> {
    if (this.flavorsList.length == 0){
      return this.http.get<string[]>(`${this.apiRoute}`, this.options).pipe(map(
        response => {
          this.flavorsList = response;
          return response;
        }));
    }
    else{
      return of(this.flavorsList)
    }
  }

  
 
}
