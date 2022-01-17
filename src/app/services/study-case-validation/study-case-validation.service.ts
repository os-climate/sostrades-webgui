import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { StudyCaseValidation, ValidationType } from 'src/app/models/study-case-validation.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class StudyCaseValidationService extends DataHttpService {

  public studyDataValidationDict: { [id: string]: StudyCaseValidation[]; };
  public studyGraphValidationDict: { [id: string]: StudyCaseValidation[]; };


  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'study-case-validation');
    this.studyDataValidationDict = {};
    this.studyGraphValidationDict = {};
  }

  clearCache() {
    this.studyDataValidationDict = {};
    this.studyGraphValidationDict = {};
  }

  loadStudyValidationData(studyId: number): Observable<StudyCaseValidation[]> {
    return this.http.get<StudyCaseValidation[]>(`${this.apiRoute}/${studyId}`).pipe(map(
      response => {
        const studyValidationList: StudyCaseValidation[] = [];
        response.forEach(studyVal => {
          studyValidationList.push(StudyCaseValidation.Create(studyVal));
        });

        // Reset validation dict
        this.clearCache();
        studyValidationList.forEach(studyVal => {
          this.addValidationToLocalList(studyVal, false);
        })

        return studyValidationList;
      }));
  }

  createStudyValidationData(
    studyId: number, validationType: string, namespace: string,
    disciplineName: string, validationComment: string, validationState: string): Observable<StudyCaseValidation> {

    const request = {
      namespace: namespace,
      discipline_name: disciplineName,
      validation_type: validationType,
      status: validationState,
      comment: validationComment,
    };

    return this.http.post<StudyCaseValidation>(`${this.apiRoute}/${studyId}`, request, this.options).pipe(map(
      response => {
        const newValidation = StudyCaseValidation.Create(response);
        this.addValidationToLocalList(newValidation, true);
        return response;
      }));
  }

  addValidationToLocalList(studyVal: StudyCaseValidation, isNewValidation: boolean) {
    if (studyVal.validationType == ValidationType.DATA) {
      if (this.studyDataValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`] !== null
        && this.studyDataValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`] !== undefined) {
        if (isNewValidation) {
          this.studyDataValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`].unshift(studyVal);
        } else {
          this.studyDataValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`].push(studyVal);
        }
      } else {
        this.studyDataValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`] = [studyVal];
      }
    } else {
      if (this.studyGraphValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`] !== null
        && this.studyGraphValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`] !== undefined) {
        if (isNewValidation) {
          this.studyGraphValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`].unshift(studyVal);
        } else {
          this.studyGraphValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`].push(studyVal);
        }
      } else {
        this.studyGraphValidationDict[`${studyVal.namespace}.${studyVal.disciplineName}`] = [studyVal];
      }
    }
  }
}
