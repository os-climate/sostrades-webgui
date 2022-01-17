export class ModelStatus {

  constructor(
    public id: string,
    public name: string,
    public description: string,
    public modelType: string,
    public source: string,
    public delivered: string,
    public implemented: string,
    public lastPublicationDate: string,
    public validator: string,
    public validated: string,
    public discipline: string,
    public processesUsingModel: number,
    public processesUsingModelList: {},
    public inputsParametersQuantity: number,
    public outputsParametersQuantity: number) {
  }

  public static Create(jsonData: any): ModelStatus {
    const result: ModelStatus = new ModelStatus(
      jsonData[ModelStatusAttributes.ID],
      jsonData[ModelStatusAttributes.NAME],
      jsonData[ModelStatusAttributes.DESCRIPTION],
      jsonData[ModelStatusAttributes.MODELTYPE],
      jsonData[ModelStatusAttributes.SOURCE],
      jsonData[ModelStatusAttributes.DELIVERED],
      jsonData[ModelStatusAttributes.IMPLEMENTED],
      jsonData[ModelStatusAttributes.LASTPUBLICATIONDATE],
      jsonData[ModelStatusAttributes.VALIDATOR],
      jsonData[ModelStatusAttributes.VALIDATED],
      jsonData[ModelStatusAttributes.DISCIPLINE],
      jsonData[ModelStatusAttributes.PROCESSUSINGMODEL],
      jsonData[ModelStatusAttributes.PROCESSUSINGMODELLIST],
      jsonData[ModelStatusAttributes.INPUTSPARAMETERSQUANTITY],
      jsonData[ModelStatusAttributes.OUTPUTSPARAMETERSQUANTITY]);
    return result;
  }
}

export enum ModelStatusAttributes {
  ID = 'id',
  NAME = 'name',
  DESCRIPTION = 'description',
  MODELTYPE = 'model_type',
  SOURCE = 'source',
  DELIVERED = 'delivered',
  IMPLEMENTED = 'implemented',
  LASTPUBLICATIONDATE = 'last_publication_date',
  VALIDATOR = 'validator',
  VALIDATED = 'validated',
  DISCIPLINE = 'discipline',
  PROCESSUSINGMODEL = 'processes_using_model',
  PROCESSUSINGMODELLIST = 'processes_using_model_list',
  INPUTSPARAMETERSQUANTITY = 'inputs_parameters_quantity',
  OUTPUTSPARAMETERSQUANTITY = 'outputs_parameters_quantity'
}

