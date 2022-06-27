import { OntologyParameterUsage } from "./ontology-parameter-usage.model";

export class OntologyParameter {

  //other ontology data :
  public code_repositories: string[];
  public possible_units: string[];
  public possible_datatypes: string[];
  public nb_disciplines_using_parameter: number;
  public disciplines_using_parameter: string[];
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
      code_repositories: 'Code Repositories',
      possible_units: 'Possible Units',
      possible_datatypes: 'Possible Datatypes',
      nb_disciplines_using_parameter: 'Number of Model Using Parameter',
      disciplines_using_parameter: 'Models Using Parameter',
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
    this.code_repositories = jsonData[OntologyParameterAttributes.CODE_REPOSITORIES]
    this.possible_units = jsonData[OntologyParameterAttributes.POSSIBLE_UNITS]
    this.possible_datatypes = jsonData[OntologyParameterAttributes.POSSIBLE_DATATYPES]
    this.nb_disciplines_using_parameter = jsonData[OntologyParameterAttributes.NB_DISCIPLINES_USING_PARAMETER]
    this.disciplines_using_parameter = jsonData[OntologyParameterAttributes.DISCIPLINES_USING_PARAMETER]
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

  addParameterUsage(jsonData: any){
    this.parameter_usage_details = [];
    this.parameter_usage_details.push(OntologyParameterUsage.Create(jsonData));
    
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
