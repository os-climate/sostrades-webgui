import { OntologyDiscipline } from './ontology-discipline.model';
import { OntologyParameter } from './ontology-parameter.model';

export class Ontology {

  public studyCase: OntologyStudy;
  public processes: { [id: string]: any };

  constructor() {
    this.studyCase = new OntologyStudy();
    this.processes = {};
  }
}


export class OntologyStudy {

  public parameters: { [id: string]: OntologyParameter };
  public disciplines: { [id: string]: OntologyDiscipline };
  public n2: {};

  constructor() {
    this.parameters = {};
    this.disciplines = {};
    this.n2 = {};
  }
}

export enum OntologyType {
  PARAMETERS = 'parameter_usages',
  DISCIPLINES = 'disciplines',
  PROCESSES = 'processes',
}

/**
 * Interface for post request
 * (ontology request)
 */
export interface PostOntology {
  ontology_request: {
    disciplines: string[];
    parameter_usages: string[];
  };
}
