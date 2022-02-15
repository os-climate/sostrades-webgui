import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { StudyCaseValidation } from "src/app/models/study-case-validation.model";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { DataHttpService } from "../http/data-http/data-http.service";

@Injectable({
  providedIn: "root",
})
export class StudyCaseValidationService extends DataHttpService {
  public studyValidationDict: { [id: string]: StudyCaseValidation[] };

  constructor(private http: HttpClient, private location: Location) {
    super(location, "study-case-validation");
    this.studyValidationDict = {};
  }

  clearCache() {
    this.studyValidationDict = {};
  }

  loadStudyValidationData(studyId: number): Observable<StudyCaseValidation[]> {
    return this.http
      .get<StudyCaseValidation[]>(`${this.apiRoute}/${studyId}`)
      .pipe(
        map((response) => {
          const studyValidationList: StudyCaseValidation[] = [];
          response.forEach((studyVal) => {
            studyValidationList.push(StudyCaseValidation.Create(studyVal));
          });

          // Reset validation dict
          this.clearCache();
          studyValidationList.forEach((studyVal) => {
            this.addValidationToLocalList(studyVal, false);
          });
          return studyValidationList;
        })
      );
  }

  createStudyValidationData(
    studyId: number,
    namespace: string,
    validationComment: string,
    validationState: string
  ): Observable<StudyCaseValidation> {
    const request = {
      namespace: namespace,
      status: validationState,
      comment: validationComment,
    };
    return this.http
      .post<StudyCaseValidation>(
        `${this.apiRoute}/${studyId}`,
        request,
        this.options
      )
      .pipe(
        map((response) => {
          const newValidation = StudyCaseValidation.Create(response);
          this.addValidationToLocalList(newValidation, true);
          return response;
        })
      );
  }

  addValidationToLocalList(
    studyVal: StudyCaseValidation,
    isNewValidation: boolean
  ) {
    if (
      this.studyValidationDict[`${studyVal.namespace}`] !== null &&
      this.studyValidationDict[`${studyVal.namespace}`] !== undefined
    ) {
      if (isNewValidation) {
        this.studyValidationDict[`${studyVal.namespace}`].unshift(studyVal);
      } else {
        this.studyValidationDict[`${studyVal.namespace}`].push(studyVal);
      }
    } else {
      this.studyValidationDict[`${studyVal.namespace}`] = [studyVal];
    }
  }
}
