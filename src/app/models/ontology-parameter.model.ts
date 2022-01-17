export class OntologyParameter {

  constructor(
    public id: string,
    public datatype: string,
    public definition: string,
    public label: string,
    public quantityKind: string,
    public unit: string,
    public uri: string,
    public definitionSource: string,
    public ACLtag: string,
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
      ACLtag: 'Airbus Common Language Tag'
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
}

export enum OntologyParameterAttributes {
  ID = 'id',
  DATATYPE = 'datatype',
  DEFINITION = 'definition',
  LABEL = 'label',
  QUANTITYKIND = 'quantityKind',
  UNIT = 'unit',
  URI = 'uri',
  DEFINITIONSOURCE = 'definitionSource',
  ACLTAG = 'ACLTag'
}
