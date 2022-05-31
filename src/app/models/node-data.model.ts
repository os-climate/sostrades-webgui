import { DataframeDescriptor } from './dataframe-descriptor.model';
import { TreeNode } from './tree-node.model';

export interface INodeDataValueChange {
  nodeDataValueChange(nodeData: NodeData);
}
export enum WidgetType {
  TABLE_WIDGET = 'table',
  SELECT_WIDGET = 'select',
  INPUT_WIDGET = 'input',
  LABEL_WIDGET = 'label',
  NO_WIDGET = '',
  FILE_SPREADSHEET_WIDGET = 'fileSpreadsheet',
  BOOLEAN_WIDGET = 'boolean'
}

export enum IoType {
  IN = 'in',
  OUT = 'out'
}

export enum ValueType {
  EMPTY = 'Missing value',
  DEFAULT = 'default value',
  USER = 'User value',
  READ_ONLY = 'Read-only value',
  OPTIONAL = 'Optional value'
}

export class NodeData {

  public variableName: string;
  public displayName: string;
  private _widgetType: WidgetType;
  public isHighlighted: boolean;

  public static Create(key: string, jsonData: any, parent: TreeNode, isDataDisc: boolean): NodeData {
    // Remove parameter without type key
    let result: NodeData = null;
    if (jsonData.hasOwnProperty(NodeDataAttributes.TYPE)) {
      result = new NodeData(
        key,
        jsonData[NodeDataAttributes.DEFAULT],
        jsonData[NodeDataAttributes.TYPE],
        jsonData[NodeDataAttributes.UNIT],
        jsonData[NodeDataAttributes.POSSIBLE_VALUES],
        jsonData[NodeDataAttributes.RANGE],
        jsonData[NodeDataAttributes.SUBTYPE_DESCRIPTOR],
        jsonData[NodeDataAttributes.USER_LEVEL],
        jsonData[NodeDataAttributes.VISIBILITY],
        jsonData[NodeDataAttributes.IO_TYPE],
        jsonData[NodeDataAttributes.MODEL_ORIGIN],
        jsonData[NodeDataAttributes.COUPLING],
        jsonData[NodeDataAttributes.VALUE],
        jsonData[NodeDataAttributes.VALUE],
        jsonData[NodeDataAttributes.EDITABLE],
        jsonData[NodeDataAttributes.OVERWRITTEN],
        jsonData[NodeDataAttributes.NUMERICAL],
        jsonData[NodeDataAttributes.METAINPUT],
        jsonData[NodeDataAttributes.OPTIONAL],
        jsonData[NodeDataAttributes.CONNECTOR_DATA],
        DataframeDescriptor.Create(jsonData[NodeDataAttributes.DATAFRAME_DESCRIPTOR]),
        jsonData[NodeDataAttributes.DATAFRAME_EDITION_LOCKED],
        jsonData[NodeDataAttributes.DISCIPLINE_FULL_PATH_LIST],
        parent,
        isDataDisc
      );
    }

    return result;
  }

  constructor(
    public identifier: string,
    public defaultValue: any,
    public type: string,
    public unit: string,
    public possibleValues: any,
    public range: any,
    public subtype_descriptor: any,
    public userLevel: number,
    public visibility: string,
    public ioType: IoType,
    public modelOrigin: string,
    public coupling: boolean,
    private _value: any,
    public oldValue: any,
    public editable: boolean,
    public overwritten: boolean,
    public numerical: boolean,
    public metaInput: boolean,
    public optional: boolean,
    public connector_data: any,
    public dataframeDescriptor: DataframeDescriptor,
    public dataframeEditionLocked: boolean,
    public disciplineFullPathList: string[],
    public parent: TreeNode,
    public isDataDisc: boolean) {

    const splitedIdentifier = identifier.split('.');

    if (splitedIdentifier.length > 1) {
      this.variableName = splitedIdentifier[splitedIdentifier.length - 1];
    } else {
      this.variableName = splitedIdentifier[0];
    }
    this.displayName = this.variableName;
    this._widgetType = WidgetType.NO_WIDGET;

    this.updateWidgetType();

    this.isHighlighted = false;
  }

  public updateWidgetType() {
    if (this.type === null || this.type === undefined) {
      this._widgetType = WidgetType.NO_WIDGET;
    } else {
      if (this.type === 'string' || this.type === 'int' || this.type === 'float') {
        if (this.editable === true && this.ioType !== IoType.OUT) {
          if (this.possibleValues !== null && this.possibleValues !== undefined) {
            this._widgetType = WidgetType.SELECT_WIDGET;
          } else {
            this._widgetType = WidgetType.INPUT_WIDGET;
          }
        } else {
          this._widgetType = WidgetType.LABEL_WIDGET;
        }
      } else if (this.type.includes('bool')) {
        this._widgetType = WidgetType.BOOLEAN_WIDGET;
      } else if (this.type.includes('dict') || this.type.includes('array') || this.type.includes('dataframe')) {
        this._widgetType = WidgetType.FILE_SPREADSHEET_WIDGET;
      } else if (this.type.includes('list')) {
        if (this.possibleValues !== null && this.possibleValues !== undefined) {
          this._widgetType = WidgetType.SELECT_WIDGET;
        } else {
          this._widgetType = WidgetType.FILE_SPREADSHEET_WIDGET;
        }
      }
    }
  }

  get widgetType(): WidgetType {
    return this._widgetType;
  }

  get value(): any {
    if (this._value !== null) {
      return this._value;
    } else {
      return this.defaultValue;
    }
  }

  set value(data: any) {
    this._value = data;

    if (this.parent !== null) {
      this.parent.nodeDataValueChange(this);
    }
  }

  get valueType(): ValueType {
    if (this.editable === false || this.ioType === IoType.OUT) {
      return ValueType.READ_ONLY;
    } else if (this.value !== null) {
      return ValueType.USER;
    } else if (this.defaultValue !== null) {
      return ValueType.DEFAULT;
    } else if (this.optional === true) {
      return ValueType.OPTIONAL;
    } else {
      return ValueType.EMPTY;
    }
  }

  get hasConnectorData(): boolean{
    let has_connector_data : boolean = false;
    if (this.connector_data !== undefined){
      has_connector_data = true;
    }
    return has_connector_data;
  }
}

export function CreateNodeDataDictionary(jsonData: any, parent: TreeNode, isDataDisc: boolean): { [id: string]: NodeData } {
  const result: { [id: string]: NodeData } = {};

  Object.keys(jsonData).forEach(key => {
    const variable = jsonData[key];
    const nodeData = NodeData.Create(key, variable, parent, isDataDisc);

    if (nodeData !== null) {
      result[nodeData.identifier] = nodeData;
    }
  });
  return result;
}

export enum NodeDataAttributes {
  DEFAULT = 'default',
  TYPE = 'type',
  UNIT = 'unit',
  POSSIBLE_VALUES = 'possible_values',
  RANGE = 'range',
  SUBTYPE_DESCRIPTOR ='subtype_descriptor',
  USER_LEVEL = 'user_level',
  VISIBILITY = 'visibility',
  IO_TYPE = 'io_type',
  MODEL_ORIGIN = 'model_origin',
  COUPLING = 'coupling',
  VALUE = 'value',
  EDITABLE = 'editable',
  OVERWRITTEN = 'overwritten',
  NUMERICAL = 'numerical',
  METAINPUT = 'meta_input',
  OPTIONAL = 'optional',
  CONNECTOR_DATA = 'connector_data',
  DATAFRAME_DESCRIPTOR = 'dataframe_descriptor',
  DATAFRAME_EDITION_LOCKED = 'dataframe_edition_locked',
  DISCIPLINE_FULL_PATH_LIST = 'discipline_full_path_list'
}
