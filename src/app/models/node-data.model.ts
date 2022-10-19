import { ThrowStmt } from '@angular/compiler';
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
  BOOLEAN_WIDGET = 'boolean',
  PROCESS_BUILDER = 'processBuilder'
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

export enum ProcessBuilderAttribute {
  PROCESS_REPOSITORY = 'process_repository',
  PROCESS_NAME = 'process_name',
  USECASE_INFO = 'usecase_info',
  USECASE_INFO_NAME = 'usecase_name',
  USECASE_INFO_TYPE = 'usecase_type',
  USECASE_INFO_IDENTIFIER = 'usecase_identifier',
  USECASE_DATA = 'usecase_data'
}

export class ProcessBuilderData {
  public processRepositoryIdentifier: string;
  public processIdentifier: string;
  public usecaseInfoName: string;
  public usecaseInfoType: string;
  public usecaseInfoIdentifier: number;

  /**
   * Constructor
   * @param repositoryIdentifier name of the process repository to display at startup (can be null)
   * @param processIdentifier name of the process to display at startup (can be null)
   * @param usecaseInfoName name of the data source to display at startup
   * @param usecaseInfoType type of the data source to display at startup
   * @param usecaseInfoIdentifier identifier of the data source (if type is 'Study') to display at startup
   */
  constructor(
    repositoryIdentifier: string,
    processIdentifier: string,
    usecaseInfoName: string,
    usecaseInfoType: string,
    usecaseInfoIdentifier: number) {
      this.processRepositoryIdentifier = repositoryIdentifier;
      this.processIdentifier = processIdentifier;
      this.usecaseInfoName = usecaseInfoName;
      this.usecaseInfoType = usecaseInfoType;
      this.usecaseInfoIdentifier = usecaseInfoIdentifier;
  }

  /**
   * Build a ProcessBuilderData instance regarding input value data
   * @param data json dictionary with attended values
   * @returns ProcessBuilderData
   */
  public static Create(data: {}): ProcessBuilderData {
    let repositoryIdentifier = '';
    let processIdentifier = '';
    let usecaseDataName = '';
    let usecaseDataType = '';
    let usecaseDataIdentifier = -1;

    if ((data !== null) && (data !== undefined)) {
      if (ProcessBuilderAttribute.PROCESS_REPOSITORY in data) {
        repositoryIdentifier = data[ProcessBuilderAttribute.PROCESS_REPOSITORY];
      }

      if (ProcessBuilderAttribute.PROCESS_NAME in data) {
        processIdentifier = data[ProcessBuilderAttribute.PROCESS_NAME];
      }

      if (ProcessBuilderAttribute.USECASE_INFO in data) {
        if (ProcessBuilderAttribute.USECASE_INFO_NAME in data[ProcessBuilderAttribute.USECASE_INFO]) {
          usecaseDataName = data[ProcessBuilderAttribute.USECASE_INFO][ProcessBuilderAttribute.USECASE_INFO_NAME];
        }

        if (ProcessBuilderAttribute.USECASE_INFO_TYPE in data[ProcessBuilderAttribute.USECASE_INFO]) {
          usecaseDataType = data[ProcessBuilderAttribute.USECASE_INFO][ProcessBuilderAttribute.USECASE_INFO_TYPE];
        }

        if (ProcessBuilderAttribute.USECASE_INFO_IDENTIFIER in data[ProcessBuilderAttribute.USECASE_INFO]) {
          usecaseDataIdentifier = data[ProcessBuilderAttribute.USECASE_INFO][ProcessBuilderAttribute.USECASE_INFO_IDENTIFIER];
        }
      }
    }
    return new ProcessBuilderData(repositoryIdentifier, processIdentifier, usecaseDataName, usecaseDataType, usecaseDataIdentifier);
  }

  /**
   * Convert object to attended node data value dictionnary
   * @returns dictonary
   */
   public toNodeDataValue(): {} {
    const result = {};

    result[ProcessBuilderAttribute.PROCESS_REPOSITORY] = this.processRepositoryIdentifier;
    result[ProcessBuilderAttribute.PROCESS_NAME] = this.processIdentifier;
    result[ProcessBuilderAttribute.USECASE_INFO] = {};
    result[ProcessBuilderAttribute.USECASE_INFO][ProcessBuilderAttribute.USECASE_INFO_NAME] = this.usecaseInfoName;
    result[ProcessBuilderAttribute.USECASE_INFO][ProcessBuilderAttribute.USECASE_INFO_TYPE] = this.usecaseInfoType;
    result[ProcessBuilderAttribute.USECASE_INFO][ProcessBuilderAttribute.USECASE_INFO_IDENTIFIER] = this.usecaseInfoIdentifier;
    result[ProcessBuilderAttribute.USECASE_DATA] = {};

    return result;
  }
}
export class NodeData {

  public variableName: string;
  public displayName: string;
  private _widgetType: WidgetType;
  public isHighlighted: boolean;
  private _subtypeDescriptorValue: string;
  private _subTypeDrescriptorNestedLevelCount: number;
  public modified: boolean;

  /**
   * Explore subtype descriptor nested level to extract final stored type
   * @param subTypeDescriptor: nested object we want to extract last final value
   * @returns string or null
   */
   public static getSubTypeValue(subtypeDescriptor: any): string {

    if (subtypeDescriptor instanceof Object) {
      const keys  = Object.keys(subtypeDescriptor);

      if (keys.length !== 1) {
        return null;
      } else {
        const uniqueKey = keys[0];
        return this.getSubTypeValue(subtypeDescriptor[uniqueKey]);
      }
    } else {
      return subtypeDescriptor;
    }
  }

  /**
   * Explore subtype descriptor nested level to extract their count
   * @param subTypeDescriptor: nested object we want to count nested level
   * @returns number
   */
   public static countNestedLevel(subtypeDescriptor: any): number {

    let result = 0;

    if (subtypeDescriptor instanceof Object) {
      const keys  = Object.keys(subtypeDescriptor);
      const uniqueKey = keys[0];
      result = 1 + this.countNestedLevel(subtypeDescriptor[uniqueKey]);
    }
    return result;
  }

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
        jsonData[NodeDataAttributes.CONNECTOR_INFO],
        DataframeDescriptor.Create(jsonData[NodeDataAttributes.DATAFRAME_DESCRIPTOR]),
        jsonData[NodeDataAttributes.DATAFRAME_EDITION_LOCKED],
        jsonData[NodeDataAttributes.DISCIPLINE_FULL_PATH_LIST],
        jsonData[NodeDataAttributes.VARIABLE_KEY],
        jsonData[NodeDataAttributes.CHECK_INTEGRITY_MSG],
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
    public subTypeDescriptor: any,
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
    public variableKey: string,
    public checkIntegrityMessage: string,
    public parent: TreeNode,
    public isDataDisc: boolean) {

    this.modified = false;
    const splitedIdentifier = identifier.split('.');

    if (splitedIdentifier.length > 1) {
      this.variableName = splitedIdentifier[splitedIdentifier.length - 1];
    } else {
      this.variableName = splitedIdentifier[0];
    }
    this.displayName = this.variableName;

    /**
     * Changes 07/09/2022
     * sub type descriptor handling
     * store the inner type contains in the the nested sub type, mainly to determine some constraint check to do
     * count the number of nested level in order to switch between view regarding the data complexity
     */
    this._subtypeDescriptorValue = NodeData.getSubTypeValue(this.subTypeDescriptor);
    this._subTypeDrescriptorNestedLevelCount = NodeData.countNestedLevel(this.subTypeDescriptor);

    this._widgetType = WidgetType.NO_WIDGET;
    if ((this.subTypeDescriptor !== null) && (this.subTypeDescriptor !== undefined)) {
      this._widgetType = WidgetType.FILE_SPREADSHEET_WIDGET;
    } else {
      this.updateWidgetType();
    }

    this.isHighlighted = false;
  }

  public updateWidgetType() {
    if (this.type === null || this.type === undefined) {
      this._widgetType = WidgetType.NO_WIDGET;
    } else if (this.type === 'proc_builder_modal') {
      this._widgetType = WidgetType.PROCESS_BUILDER;
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

  get subTypeDescriptorValue(): string {
    return this._subtypeDescriptorValue;
  }

  get subTypeDrescriptorNestedLevelCount(): number {
    return this._subTypeDrescriptorNestedLevelCount;
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
    this.modified = true;

    if (this.parent !== null) {
      this.parent.nodeDataValueChange(this);
    }
  }

  get valueType(): ValueType {
    if (this.editable === false || this.ioType === IoType.OUT) {
      return ValueType.READ_ONLY;
    } else if ((this.checkIntegrityMessage.length > 0) && (this.modified === false)) {
      return ValueType.EMPTY;
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
    let has_connector_data: boolean = false;
    if (this.connector_data !== undefined) {
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
  CONNECTOR_INFO = 'connector_data',
  DATAFRAME_DESCRIPTOR = 'dataframe_descriptor',
  DATAFRAME_EDITION_LOCKED = 'dataframe_edition_locked',
  DISCIPLINE_FULL_PATH_LIST = 'discipline_full_path_list',
  VARIABLE_KEY = 'variable_key',
  CHECK_INTEGRITY_MSG = 'check_integrity_msg'
}
