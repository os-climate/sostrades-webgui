import { OntologyParameterUsage } from "./ontology-parameter-usage.model";

export class OntologyParameter {

  //other ontology data :
  public codeRepositories: string[];
  public possibleUnits: string[];
  public possibleDatatypes: string[];
  public nbDisciplinesUsingParameter: number;
  public disciplinesUsingParameter: string[];
  public parameter_usage_details : OntologyParameterUsage[];

  constructor(
    public id: string,
    public datatype: string,
    public definition: string,
    public label: string,
    public quantityKind: string,
    public unit: string,
    public uri: string,
    public definitionSource: string,
    public ACLtag: string
  ) { }

  public static Create(jsonData: any): OntologyParameter {
    const result: OntologyParameter = new OntologyParameter(
      jsonData[OntologyParameterAttributes.ID],
      jsonData[OntologyParameterAttributes.DATATYPE],
      jsonData[OntologyParameterAttributes.DEFINITION],
      jsonData[OntologyParameterAttributes.LABEL],
      jsonData[OntologyParameterAttributes.QUANTITYKIND],
      jsonData[OntologyParameterAttributes.UNIT],
      jsonData[OntologyParameterAttributes.URI],
      jsonData[OntologyParameterAttributes.DEFINITIONSOURCE],
      jsonData[OntologyParameterAttributes.ACLTAG]);

    return result;
  }

  public static getKeyLabel(key: string): string {
    const keyLabelDict = {
      id: 'ID',
      datatype: 'Datatype',
      definition: 'Definition',
      label: 'Label',
      quantityKind: 'Quantity Kind',
      unit: 'Unit',
      uri: 'URI',
      definitionSource: 'Definition Source',
      ACLtag: 'Airbus Common Language Tag',
      codeRepositories: 'Code Repositories',
      possibleUnits: 'Possible Units',
      possibleDatatypes: 'Possible Datatypes',
      nbDisciplinesUsingParameter: 'Number of Disciplines Using Parameter',
      disciplinesUsingParameter: 'Disciplines Using Parameter'
    };

    if (key in keyLabelDict) {
      return keyLabelDict[key];
    } else {
      return key;
    }
  }

  public toString = (): string => {
    const strings: string[] = [];
    if (this.id !== null && this.id !== undefined) {
      strings.push(`${this.id}`);
    }
    if (this.definition !== null && this.definition !== undefined) {
      strings.push(`${this.definition}`);
    }
    if (this.uri !== null && this.uri !== undefined) {
      strings.push(`${this.uri}`);
    }
    if (this.definitionSource !== null && this.definitionSource !== undefined) {
      strings.push(`${this.definitionSource}`);
    }
    if (this.ACLtag !== null && this.ACLtag !== undefined) {
      strings.push(`${this.ACLtag}`);
    }
    return strings.join('\n');
  }

  addOntologyInformations(jsonData: any){
    if (OntologyParameterAttributes.ACL_TAG in jsonData){
      this.ACLtag = jsonData[OntologyParameterAttributes.ACL_TAG]
    }
    this.codeRepositories = jsonData[OntologyParameterAttributes.CODE_REPOSITORIES]
    this.possibleUnits = jsonData[OntologyParameterAttributes.POSSIBLE_UNITS]
    this.possibleDatatypes = jsonData[OntologyParameterAttributes.POSSIBLE_DATATYPES]
    this.nbDisciplinesUsingParameter = jsonData[OntologyParameterAttributes.NB_DISCIPLINES_USING_PARAMETER]
    this.disciplinesUsingParameter = jsonData[OntologyParameterAttributes.DISCIPLINES_USING_PARAMETER]
    this.parameter_usage_details = [];
    if (
      jsonData[OntologyParameterAttributes.PARAMETER_USAGE_DETAILS] !== null &&
      jsonData[OntologyParameterAttributes.PARAMETER_USAGE_DETAILS] !== undefined &&
      jsonData[OntologyParameterAttributes.PARAMETER_USAGE_DETAILS].length > 0
    ) {
      const pList = jsonData[OntologyParameterAttributes.PARAMETER_USAGE_DETAILS];
      pList.forEach(param => {
        this.parameter_usage_details.push(OntologyParameterUsage.Create(param));
      });
    }

  }
}

export enum OntologyParameterAttributes {
  ID = 'id',
  DATATYPE = 'datatype',
  DEFINITION = 'definition',
  LABEL = 'label',
  QUANTITYKIND = 'quantityKind',
  UNIT = 'unit',
  URI = 'uri',
  ACLTAG = 'ACLTag',
  ACL_TAG = 'ACL_Tag',
  DEFINITIONSOURCE = 'definitionSource',
  CODE_REPOSITORIES = 'code_repositories',
  POSSIBLE_UNITS = 'possible_units',
  POSSIBLE_DATATYPES = 'possible_datatypes',
  NB_DISCIPLINES_USING_PARAMETER = 'nb_disciplines_using_parameter',
  DISCIPLINES_USING_PARAMETER = 'disciplines_using_parameter',
  PARAMETER_USAGE_DETAILS = 'parameter_usage_details',
}
