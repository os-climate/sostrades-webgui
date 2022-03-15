export class OntologyDiscipline {

  constructor(
    public id: string,
    public label: string,
    public delivered: string,
    public implemented: string,
    public maturity: string,
    public source: string,
    public className: string,
    public validator: string,
    public validated: string,
    public uri: string,
    public icon: string
  ) { }

  public static Create(jsonData: any): OntologyDiscipline {
    const result: OntologyDiscipline = new OntologyDiscipline(
      jsonData[OntologyParameterAttributes.ID],
      jsonData[OntologyParameterAttributes.LABEL],
      jsonData[OntologyParameterAttributes.DELIVERED],
      jsonData[OntologyParameterAttributes.IMPLEMENTED],
      jsonData[OntologyParameterAttributes.MATURITY],
      jsonData[OntologyParameterAttributes.SOURCE],
      jsonData[OntologyParameterAttributes.CLASSNAME],
      jsonData[OntologyParameterAttributes.VALIDATOR],
      jsonData[OntologyParameterAttributes.VALIDATED],
      jsonData[OntologyParameterAttributes.URI],
      jsonData[OntologyParameterAttributes.ICON]);

    return result;
  }

  public static getKeyLabel(key: string): string {
    const keyLabelDict = {
      id: 'ID',
      delivered: 'Delivered',
      implemented: 'Implemented',
      label: 'Discipline Name',
      maturity: 'Maturity',
      source: 'Source',
      className: 'Discipline Class Name',
      uri: 'Ontology URI',
      validator: 'Validator',
      validated: 'Validated'
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

    // TO BE IMPLEMENTED IF NEEDED
    return strings.join('\n');
  }
}

export enum OntologyParameterAttributes {
  ID = 'id',
  DELIVERED = 'delivered',
  IMPLEMENTED = 'implemented',
  LABEL = 'label',
  MATURITY = 'modelType',
  SOURCE = 'originSource',
  CLASSNAME = 'pythonClass',
  URI = 'uri',
  VALIDATOR = 'validator',
  VALIDATED = 'validated',
  ICON = 'icon'
}
