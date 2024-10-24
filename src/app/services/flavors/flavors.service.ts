import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { DataHttpService } from '../http/data-http/data-http.service';
import { News } from 'src/app/models/news.models';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Flavor } from 'src/app/models/flavor.model';


@Injectable({
  providedIn: 'root'
})
export class FlavorsService extends DataHttpService {
  private flavorsNamesStudy: string[]
  private flavorsNamesExec: string[]
  public flavorsListStudy: Flavor[];
  public flavorsListExec: Flavor[];
  private hasFlavors: boolean;

  constructor(
    private http: HttpClient,
    private location: Location) {
    super (location, 'flavors');
    this.hasFlavors = false;
    this.flavorsListStudy = [];
    this.flavorsListExec = [];
    this.flavorsNamesStudy = [];
    this.flavorsNamesExec = [];
  }

  checkIfHasFlavors(): Observable<boolean>{
    return this.getAllFlavorsStudy().pipe(map((flavorList)=>{
        return flavorList.length > 0;
    }));
  }

  getAllFlavorsStudy(): Observable<string[]> {
    if (this.flavorsNamesStudy.length == 0){
      return this.http.get<any>(`${this.apiRoute}/study`, this.options).pipe(map(
        response => {
          if (response !== null && response !== undefined) {
            this.flavorsListStudy = [];
            this.flavorsNamesStudy = Object.keys(response);
            this.flavorsNamesStudy.forEach((name)=>{
              this.flavorsListStudy.push(Flavor.Create(name, response[name]));
            });
          }
          return this.flavorsNamesStudy;
        }));
    }
    else{
      return of(this.flavorsNamesStudy)
    }
  }

  getAllFlavorsExec(): Observable<string[]> {
    if (this.flavorsListExec.length == 0){
      return this.http.get<any>(`${this.apiRoute}/exec`, this.options).pipe(map(
        response => {
          if (response !== null && response !== undefined){
            this.flavorsListExec = [];
            this.flavorsNamesExec = Object.keys(response);
            this.flavorsNamesExec.forEach((name)=>{
              this.flavorsListExec.push(Flavor.Create(name, response[name]));
            });
          }
          return this.flavorsNamesExec;
        }));
    }
    else{
      return of(this.flavorsNamesExec)
    }
  }

  
 
}
