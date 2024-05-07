export class StudyUpdateParameter {

  public id: number;
  public notificationId: number;
  public author: string;

  constructor(
    public variableId: string,
    public variableType: string,
    public changeType: UpdateParameterType,
    public columnDeleted: string[],
    public namespace: string,
    public discipline: string,
    public newValue: any,
    public oldValue: any,
    public oldValueBlob: boolean,
    public lastModified: Date,
    public datasetConnectorId: string,
    public datasetId: string,
    public dataset_parameter_id: string
  ) {
    this.id = null;
    this.author = null;
  }

  public static Create(jsonData: any): StudyUpdateParameter {
    const result: StudyUpdateParameter = new StudyUpdateParameter(
      jsonData[StudyUpdateParameterAttributes.VARIABLEID],
      jsonData[StudyUpdateParameterAttributes.VARIABLETYPE],
      jsonData[StudyUpdateParameterAttributes.CHANGETYPE],
      jsonData[StudyUpdateParameterAttributes.DELETED_COLUMN],
      jsonData[StudyUpdateParameterAttributes.NAMESPACE],
      jsonData[StudyUpdateParameterAttributes.DISCIPLINE],
      jsonData[StudyUpdateParameterAttributes.NEWVALUE],
      jsonData[StudyUpdateParameterAttributes.OLDVALUE],
      jsonData[StudyUpdateParameterAttributes.OLDVALUEBLOB],
      jsonData[StudyUpdateParameterAttributes.LASTMODIFIED],
      jsonData[StudyUpdateParameterAttributes.DATASET_CONNECTOR_ID],
      jsonData[StudyUpdateParameterAttributes.DATASET_ID],
      jsonData[StudyUpdateParameterAttributes.DATASET_PARAMETER_ID]
    );

    if (jsonData[StudyUpdateParameterAttributes.ID] !== null
      && jsonData[StudyUpdateParameterAttributes.ID] !== undefined) {
      result.id = jsonData[StudyUpdateParameterAttributes.ID];
    }

    if (jsonData[StudyUpdateParameterAttributes.NOTIFICATIONID] !== null
      && jsonData[StudyUpdateParameterAttributes.NOTIFICATIONID] !== undefined) {
      result.id = jsonData[StudyUpdateParameterAttributes.NOTIFICATIONID];
    }

    return result;
  }
}


export enum StudyUpdateParameterAttributes {
  ID = 'id',
  VARIABLEID = 'variable_id',
  VARIABLETYPE = 'variable_type',
  CHANGETYPE = 'change_type',
  NAMESPACE = 'namespace',
  DISCIPLINE = 'discipline',
  NEWVALUE = 'new_value',
  OLDVALUE = 'old_value',
  OLDVALUEBLOB = 'old_value_blob',
  LASTMODIFIED = 'last_modified',
  NOTIFICATIONID = 'notification_id',
  DELETED_COLUMN = 'deleted_column',
  DATASET_CONNECTOR_ID = 'dataset_connector_id',
  DATASET_ID = 'dataset_id',
  DATASET_PARAMETER_ID = 'dataset_parameter_id',

}

export enum UpdateParameterType {
  CSV = 'csv',
  SCALAR = 'scalar',
  CONNECTOR_DATA = 'connector_data',
  DATASET_MAPPING_CHANGE = 'dataset_mapping'

}

export class StudyUpdateContainer {
  studies: { [studyId: string]: { [paramName: string]: StudyUpdateParameter } };
  constructor() {
  }

}
