import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ontology, OntologyType, PostOntology } from 'src/app/models/ontology.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { OntologyParameter } from 'src/app/models/ontology-parameter.model';
import { OntologyDiscipline } from 'src/app/models/ontology-discipline.model';
import { OntologyModelStatus } from 'src/app/models/ontology-model-status.model';
import { MainHttpService } from '../http/main-http/main-http.service';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { OntologyGeneralInformation } from 'src/app/models/ontology-general-information.model';
import { Router } from '@angular/router';
import { HeaderService } from '../hearder/header.service';


@Injectable({
  providedIn: 'root'
})
export class OntologyService extends MainHttpService {

  onSearchModel: EventEmitter<string> = new EventEmitter<string>();
  // public onSearchModel: EventEmitter<OntologyModelStatus> = new EventEmitter<OntologyModelStatus>();


  private ontology: Ontology;
  public modelStatusData: OntologyModelStatus[];
  public modelStatusFilter: string;
  public modelStatusColumnFiltered: string;

  public parametersData: OntologyParameter[];
  public parametersFilter: string;
  public parametersColumnFiltered: string;

  public generalInformationData: OntologyGeneralInformation;



  constructor(
    private http: HttpClient,
    private location: Location,
    private router: Router,
    private headerService: HeaderService,

    ) {
    super(location, 'ontology');
    this.ontology = new Ontology();
    this.modelStatusData = [];
    this.modelStatusColumnFiltered = 'All columns';
    this.modelStatusFilter = '';
    this.parametersData = [];
    this.parametersColumnFiltered = 'All columns';
    this.parametersFilter = '';
    this.generalInformationData = null;
  }

  clearCache() {
    this.ontology = new Ontology();
    this.modelStatusData = [];
    this.modelStatusColumnFiltered = 'All columns';
    this.modelStatusFilter = '';
    this.parametersData = [];
    this.parametersColumnFiltered = 'All columns';
    this.parametersFilter = '';
    this.generalInformationData = null;
  }

  loadOntologyStudy(ontologyRequest: PostOntology): Observable<void> {
    return this.http.post<{}>(`${this.apiRoute}/ontology-usages`, ontologyRequest).pipe(map(
      response => {
        this.ontology.studyCase.parameters = {};
        this.ontology.studyCase.disciplines = {};

        Object.keys(response).forEach(ontologyType => {
          if (ontologyType === OntologyType.PARAMETERS) {
            Object.keys(response[ontologyType]).forEach(variable => {
              const parameter = OntologyParameter.Create(response[ontologyType][variable]);
              parameter.addParameterUsage(response[ontologyType][variable]);
              this.ontology.studyCase.parameters[variable] = parameter;
            });
          } else if (ontologyType === OntologyType.DISCIPLINES) {
            Object.keys(response[ontologyType]).forEach(variable => {
              this.ontology.studyCase.disciplines[variable] = OntologyDiscipline.Create(response[ontologyType][variable]);
            });
          }
        });
      }
    ));
  }

  getOntologyModelsStatus(): Observable<OntologyModelStatus[]> {
    const modelStatusList: OntologyModelStatus[] = [];

    return this.http.get<OntologyModelStatus[]>(`${this.apiRoute}/models/status`).pipe(map(
      modS => {
        modS.forEach(model => {
          const newModelStatus = OntologyModelStatus.Create(model);
          modelStatusList.push(newModelStatus);
        });
        return modelStatusList;
      }));

  }


  getOntologyMarkdowndocumentation(identifier: string): Observable<MardownDocumentation> {
    return this.http.get<string>(`${this.apiRoute}/${identifier}/markdown_documentation`).pipe(map(
      response => {
        return new MardownDocumentation('', response);
      }));
  }

  public resetOntology() {
    this.ontology.studyCase.parameters = {};
    this.ontology.studyCase.disciplines = {};
    this.ontology.studyCase.n2 = {};
  }

  public getParameter(key: string): OntologyParameter {
    if (key in this.ontology.studyCase.parameters) {
      return this.ontology.studyCase.parameters[key];
    } else {
      return null;
    }
  }

  public getParametersLabelList(): Observable<OntologyParameter[]> {
      const parametersList: OntologyParameter[] = [];

      return this.http.get<OntologyParameter[]>(`${this.apiRoute}/full_parameter_label_list`).pipe(map(
        params => {
          params.forEach(param => {
            const newParameter = OntologyParameter.Create(param);
            parametersList.push(newParameter);
          });
          return parametersList;
        }));

  }

  public getParametersList(): Observable<OntologyParameter[]> {
    const parametersList: OntologyParameter[] = [];

    return this.http.get<OntologyParameter[]>(`${this.apiRoute}/full_parameter_list`).pipe(map(
      params => {
        params.forEach(param => {
          const newParameter = OntologyParameter.Create(param);
          newParameter.addOntologyInformations(param);
          parametersList.push(newParameter);
        });
        return parametersList;
      }));

}
  public getOntologyGeneralInformation(): Observable<OntologyGeneralInformation> {
  return this.http.get<OntologyGeneralInformation>(`${this.apiRoute}/general_information`).pipe(map(
    information => {
        const generalInformation = OntologyGeneralInformation.Create(information);
        this.generalInformationData = generalInformation;
        return generalInformation;
    }));
}


  public getDiscipline(key: string): OntologyDiscipline {
    if (key in this.ontology.studyCase.disciplines) {
      return this.ontology.studyCase.disciplines[key];
    } else {
      return null;
    }
  }

  public getParameterAsFormated(key: string): string {
    if (key in this.ontology.studyCase.parameters) {
      return this.ontology.studyCase.parameters[key].toString();
    } else {
      return key;
    }
  }
  public getDisciplineAsFormated(key: string): string {
    if (key in this.ontology.studyCase.disciplines) {
      return this.ontology.studyCase.disciplines[key].toString();
    } else {
      return key;
    }
  }

  searchModel(model: string) {
    this.onSearchModel.emit(model);
  }
}
