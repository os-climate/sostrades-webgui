export class OntologyModelStatus {

  constructor(
    public id: string,
    public uri: string,
    public label: string,
    public definition: string,
    public category: string,
    public version: string,
    public lastModificationDate: string,
    public source: string,
    public validatedBy: string,
    public pythonClass: string,
    public validated: string,
    public icon: string,
    public outputParameterQuantity: number,
    public inputParameterQuantity: number,
    public classInheritance: string[],
    public codeRepository: string,
    public type: string,
    public pythonModulePath: string,
    public outputParameter: [],
    public inputParameter: [],
    public processUsingDiscipline: []

    ) {
  }

  public static Create(jsonData: any): OntologyModelStatus {
    const result: OntologyModelStatus = new OntologyModelStatus(
      jsonData[ModelStatusAttributes.ID],
      jsonData[ModelStatusAttributes.URI],
      jsonData[ModelStatusAttributes.LABEL],
      jsonData[ModelStatusAttributes.DEFINITION],
      jsonData[ModelStatusAttributes.CATEGORY],
      jsonData[ModelStatusAttributes.VERSION],
      jsonData[ModelStatusAttributes.LAST_MODIFICATION_DATE],
      jsonData[ModelStatusAttributes.SOURCE],
      jsonData[ModelStatusAttributes.VALIDATED_BY],
      jsonData[ModelStatusAttributes.PYTHON_CLASS],
      jsonData[ModelStatusAttributes.VALIDATED],
      jsonData[ModelStatusAttributes.ICON],
      jsonData[ModelStatusAttributes.OUTPUTS_PARAMETERS_QUANTITY],
      jsonData[ModelStatusAttributes.INPUTS_PARAMETERS_QUANTITY],
      jsonData[ModelStatusAttributes.CLASS_INHERITANCE],
      jsonData[ModelStatusAttributes.CODE_REPOSITORY],
      jsonData[ModelStatusAttributes.TYPE],
      jsonData[ModelStatusAttributes.PYTHON_MODULE_PATH],
      jsonData[ModelStatusAttributes.OUTPUTS_PARAMETERS],
      jsonData[ModelStatusAttributes.INPUTS_PARAMETERS],
      jsonData[ModelStatusAttributes.PROCESS_USING_DISCIPLINE]);
    return result;
  }

  public static getKeyLabel(key: string): string {
    const keyLabelDict = {
      definition: 'Definition',
      uri: 'URI',
      pythonClass: 'Python Class',
      pythonModulePath: ' Pyhton Module Path',
      version: 'Version',
      type: 'Type',
      category: 'Category',
      source: 'Source',
      lastModificationDate: 'Last Modification Date',
      validatedBy: 'Validated By',
      validated: 'Validated',
      codeRepository: 'Code Repository',
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
  URI = 'uri',
  LABEL = 'label',
  DEFINITION = 'definition',
  TYPE = 'type',
  SOURCE = 'source',
  LAST_MODIFICATION_DATE = 'last_modification_date',
  VALIDATED_BY = 'validated_by',
  VALIDATED = 'validated',
  CODE_REPOSITORY = 'code_repository',
  ICON = 'icon',
  VERSION = 'version',
  CATEGORY = 'category',
  PYTHON_CLASS = 'python_class',
  CLASS_INHERITANCE = 'class_inheritance',
  PYTHON_MODULE_PATH = 'python_module_path',
  PROCESS_USING_DISCIPLINE = 'process_using_discipline',
  INPUTS_PARAMETERS = 'input_parameters',
  INPUTS_PARAMETERS_QUANTITY = 'input_parameters_quantity',
  OUTPUTS_PARAMETERS = 'output_parameters',
  OUTPUTS_PARAMETERS_QUANTITY = 'output_parameters_quantity'
}

