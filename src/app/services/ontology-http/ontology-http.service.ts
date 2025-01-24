import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { BaseHttpService } from "../http/base-http/base-http.service";
import { Location } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { OntologyModelStatus } from "src/app/models/ontology-model-status.model";
import { map } from 'rxjs/operators';
import { MardownDocumentation } from "src/app/models/tree-node.model";
import { Ontology, OntologyType, PostOntology } from "src/app/models/ontology.model";
import { OntologyParameter } from "src/app/models/ontology-parameter.model";
import { OntologyDiscipline } from "src/app/models/ontology-discipline.model";
import { OntologyGeneralInformation } from "src/app/models/ontology-general-information.model";

@Injectable({
    providedIn: 'root'
  })
  export class OntologyHttpService extends BaseHttpService {
    private ontology: Ontology;
    public generalInformationData: OntologyGeneralInformation;
    public markdownDocumentations = {};
    constructor(
        private http: HttpClient,
        location: Location,
        ) {
            super(location, 'ontology', environment.API_ONTOLOGY_DIRECT_URL);
            this.ontology = new Ontology();
            this.markdownDocumentations = {};
        }

    
    /**
     * Get all models
     * @returns list of all existing models in ontology
     */
    getOntologyModelsStatus(): Observable<OntologyModelStatus[]> {
        const modelStatusList: OntologyModelStatus[] = [];
    
        return this.http.get<OntologyModelStatus[]>(`${this.apiRoute}/v1/full_discipline_list`).pipe(map(
            modS => {
            modS.forEach(model => {
                const newModelStatus = OntologyModelStatus.Create(model);
                modelStatusList.push(newModelStatus);
            });
            return modelStatusList;
            }));
    
        }
    
    /**
     * Get the documentation of a process or a model
     * get it from ontology if it is not in cache and set it in cache 
     * @param identifier : the full model path of the process or model to retrieve
     * @returns the documentation
     */
    getOntologyMarkdowndocumentation(identifier: string): Observable<MardownDocumentation> {
        if (identifier in this.markdownDocumentations){
          return of(this.markdownDocumentations[identifier]);
        }
        else{
          return this.http.get<string>(`${this.apiRoute}/markdown_documentation/${identifier}`).pipe(map(
            response => {
              const documentation = new MardownDocumentation('', response);
              this.markdownDocumentations[identifier] = documentation;
              return documentation;
            }));
        }
        
      }

      /**
       * Get study data from ontology
       * Retrieve ontology data of all parameters and models requested and save it in cache
       * @param ontologyRequest , the request with all parameters and models of a study
       * @returns Observable<void>
       */
      loadOntologyStudy(ontologyRequest: PostOntology): Observable<void> {
        const request = {
            'study_ontology_request':ontologyRequest.ontology_request
        };
        return this.http.post<any>(`${this.apiRoute}/v1/study`, request).pipe(map(
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

      /***
       * Relay to ontology server to retrieve the whole sos_trades parameter labels
       * @returns Object returned is a form of plotly table data structure

        Returned response is with the following data structure
            {
                headers : string[],
                values: array of {
                    details: string,
                    header: string,
                    value: string
                }
            }
       */
      public getParametersLabelList(): Observable<OntologyParameter[]> {
        const parametersList: OntologyParameter[] = [];
  
        return this.http.get<OntologyParameter[]>(`${this.apiRoute}/v1/full_parameter_label_list`).pipe(map(
          params => {
            params.forEach(param => {
              const newParameter = OntologyParameter.Create(param);
              parametersList.push(newParameter);
            });
            return parametersList;
          }));
  
    }
    
    /**
     * Relay to ontology server to retrieve the whole sos_trades parameters
     * @returns Object returned is a form of plotly table data structure

    Returned response is with the following data structure
        {
            headers : string[],
            values: array of {
                details: string,
                header: string,
                value: string
            }
        }
     */
    public getParametersList(): Observable<OntologyParameter[]> {
      const parametersList: OntologyParameter[] = [];
  
      return this.http.get<OntologyParameter[]>(`${this.apiRoute}/v1/full_parameter_list`).pipe(map(
        params => {
          params.forEach(param => {
            const newParameter = OntologyParameter.Create(param);
            newParameter.addOntologyInformations(param);
            parametersList.push(newParameter);
          });
          return parametersList;
        }));
  
  }

  /**
   * Methods returning generic information concerning the current ontology

   * @returns     Returned response is with the following data structure
            {
                description:string,
                version:string,
                iri: string,
                last_updated:string
                entity_count:{
                    'Code Repositories':integer,
                    'Process Repositories':integer,
                    'Processes':integer,
                    'Models':integer,
                    'Parameters':integer,
                    'Usecases':integer,
                }
            }
   */
    public getOntologyGeneralInformation(): Observable<OntologyGeneralInformation> {
    return this.http.get<OntologyGeneralInformation>(`${this.apiRoute}/v1/general_information`).pipe(map(
      information => {
          const generalInformation = OntologyGeneralInformation.Create(information);
          this.generalInformationData = generalInformation;
          return generalInformation;
      }));
  }
    }