export class OntologyModelStatus {

  constructor(
    public id: string,
    public name: string,
    public definition: string,
    public type: string,
    public source: string,
    public lastModificationDate: string,
    public validatedBy: string,
    public validated: string,
    public codeRepository: string,
    public icon: string,
    public version: string,
    public category: string,
    public processesUsingModel: number,
    public processesUsingModelList: {},
    public inputsParametersQuantity: number,
    public outputsParametersQuantity: number) {
  }

  public static Create(jsonData: any): OntologyModelStatus {
    const result: OntologyModelStatus = new OntologyModelStatus(
      jsonData[ModelStatusAttributes.ID],
      jsonData[ModelStatusAttributes.NAME],
      jsonData[ModelStatusAttributes.DEFINITION],
      jsonData[ModelStatusAttributes.TYPE],
      jsonData[ModelStatusAttributes.SOURCE],
      jsonData[ModelStatusAttributes.LASTMODIFICATIONDATE],
      jsonData[ModelStatusAttributes.VALIDATEDBY],
      jsonData[ModelStatusAttributes.VALIDATED],
      jsonData[ModelStatusAttributes.CODEREPOSITORY],
      jsonData[ModelStatusAttributes.ICON],
      jsonData[ModelStatusAttributes.VERSION],
      jsonData[ModelStatusAttributes.CATEGORY],
      jsonData[ModelStatusAttributes.PROCESSUSINGMODEL],
      jsonData[ModelStatusAttributes.PROCESSUSINGMODELLIST],
      jsonData[ModelStatusAttributes.INPUTSPARAMETERSQUANTITY],
      jsonData[ModelStatusAttributes.OUTPUTSPARAMETERSQUANTITY]);
    return result;
  }

  public static getKeyLabel(key: string): string {
    const keyLabelDict = {
      definition: 'Definition',
      version: 'Version',
      type: 'Type',
      category: 'Category',
      source: 'Source',
      lastModificationDate: 'Last Modification Date',
      validatedBy: 'Validated By',
      validated: 'Validated',
      codeRepository: 'Code Repository',
      inputsParametersQuantity: 'Inputs Parameters Quantity',
      outputsParametersQuantity: 'Outputs Parameters Quantity',

    };

    if (key in keyLabelDict) {
      return keyLabelDict[key];
    } else {
      return key;
    }
  }

}

export enum ModelStatusAttributes {
  ID = 'id',
  NAME = 'name',
  DEFINITION = 'definition',
  TYPE = 'type',
  SOURCE = 'source',
  LASTMODIFICATIONDATE = 'last_modification_date',
  VALIDATEDBY = 'validated_by',
  VALIDATED = 'validated',
  CODEREPOSITORY = 'code_repository',
  ICON = 'icon',
  VERSION = 'version',
  CATEGORY = 'category',
  PROCESSUSINGMODEL = 'processes_using_model',
  PROCESSUSINGMODELLIST = 'processes_using_model_list',
  INPUTSPARAMETERSQUANTITY = 'inputs_parameters_quantity',
  OUTPUTSPARAMETERSQUANTITY = 'outputs_parameters_quantity'
}

