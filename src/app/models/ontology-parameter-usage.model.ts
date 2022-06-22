export class OntologyParameterUsage {
  
  constructor(
    public dataframe_descriptor: string,
    public dataframe_edition_locked: string,
    public datatype: string,
    public editable: boolean,
    public io_type: string,
    public model_id: string,
    public model_label: string,
    public numerical: boolean,
    public optional: boolean,
    public possible_values: string,
    public range: string,
    public structuring: boolean,
    public unit: string,
    public user_level: string,
    public visibility: string,
  ) { }

  public static Create(jsonData: any): OntologyParameterUsage {
    const result: OntologyParameterUsage = new OntologyParameterUsage(
      jsonData[OntologyParameterUsageAttributes.DATAFRAME_DESCRIPTOR],
      jsonData[OntologyParameterUsageAttributes.DATAFRAME_EDITION_LOCKED],
      jsonData[OntologyParameterUsageAttributes.DATATYPE],
      jsonData[OntologyParameterUsageAttributes.EDITABLE],
      jsonData[OntologyParameterUsageAttributes.IO_TYPE],
      jsonData[OntologyParameterUsageAttributes.MODEL_ID],
      jsonData[OntologyParameterUsageAttributes.MODEL_LABEL],
      jsonData[OntologyParameterUsageAttributes.NUMERICAL],
      jsonData[OntologyParameterUsageAttributes.OPTIONAL],
      jsonData[OntologyParameterUsageAttributes.POSSIBLE_VALUES],
      jsonData[OntologyParameterUsageAttributes.RANGE],
      jsonData[OntologyParameterUsageAttributes.STRUCTURING],
      jsonData[OntologyParameterUsageAttributes.UNIT],
      jsonData[OntologyParameterUsageAttributes.USER_LEVEL],
      jsonData[OntologyParameterUsageAttributes.VISIBILITY]);

    return result;
  }

  public static getKeyLabel(key: string): string {
    const keyLabelDict = {
      dataframe_descriptor: 'Dataframe Descriptor',
      dataframe_edition_locked: 'Dataframe Edition Locked',
      datatype: 'Datatype',
      editable: 'Editable',
      io_type: 'IO Type',
      unit: 'Unit',
      model_id: 'Model ID',
      model_label: 'Model Label',
      numerical: 'Numerical',
      possible_values: 'Possible Values',
      range: 'Range',
      structuring: 'Structuring',
      user_level: 'User Level',
      visibility: 'Visibility',
      optional: 'Optional',
    };

    if (key in keyLabelDict) {
      return keyLabelDict[key];
    } else {
      return key;
    }
  }
  
}

export enum OntologyParameterUsageAttributes {
  DATAFRAME_DESCRIPTOR = 'dataframe_descriptor',
  DATAFRAME_EDITION_LOCKED = 'dataframe_edition_locked',
  DATATYPE = 'datatype',
  EDITABLE = 'editable',
  IO_TYPE = 'io_type',
  UNIT = 'unit',
  MODEL_ID = 'model_id',
  MODEL_LABEL = 'model_label',
  NUMERICAL = 'numerical',
  POSSIBLE_VALUES = 'possible_values',
  RANGE = 'range',
  STRUCTURING = 'structuring',
  USER_LEVEL = 'user_level',
  VISIBILITY = 'visibility',
  OPTIONAL = 'optional',
}
