import { NodeData, CreateNodeDataDictionary, ValueType, INodeDataValueChange, IoType } from './node-data.model';
import { BehaviorSubject } from 'rxjs';
import { DisciplineStatus } from './study-case-execution-observer.model';
import { PostProcessingBundle } from './post-processing-bundle.model';
import { CreateDataManagementDisciplineDictionary, DataManagementDiscipline } from './data-management-discipline.model';

export class TreeView {
  rootNode: TreeNode;
  rootDict: { [id: string]: TreeNode };
  rootNodeDataDict: { [id: string]: NodeData };
  constructor() {
    this.rootDict = {};
    this.rootNode = null;
    this.rootNodeDataDict = {};
  }

  public static Create(jsonTreenodeData: any, jsonPostProcessings: any): TreeView {
    const result: TreeView = new TreeView();
    result.rootNode = TreeNode.Create(jsonTreenodeData, true, result.rootDict, result.rootNodeDataDict, '');

    Object.keys(result.rootDict).forEach(treenodeKey => {
      if (jsonPostProcessings !== undefined && jsonPostProcessings !== null) {
        Object.keys(result.rootDict[treenodeKey].dataManagementDisciplineDict).forEach(disciplineKey => {
          if (disciplineKey in jsonPostProcessings) {
            let postProc = (jsonPostProcessings[disciplineKey].map(cf => PostProcessingBundle.Create(cf)));
            postProc.forEach(element => {
              // indicate if the discipline name must be shown on bundle (in case if there are 2 or more discipline with the same model and thus the same name at the same node)
              element.showDisciplineName = result.rootDict[treenodeKey].dataManagementDisciplineDict[disciplineKey].showLabel;
              result.rootDict[treenodeKey].postProcessingBundle.push(element);
            });
          }
        });
        if (treenodeKey in jsonPostProcessings && result.rootDict[treenodeKey].postProcessingBundle.length == 0) {
          result.rootDict[treenodeKey].postProcessingBundle = jsonPostProcessings[treenodeKey].map(cf => PostProcessingBundle.Create(cf));
        }
      }
    });


    return result;
  }
}

export class MardownDocumentation {


  constructor(public name: string,
              public documentation: string) {

  }

  public static Create(jsonData: any): MardownDocumentation {

    const result: MardownDocumentation = new MardownDocumentation(
      jsonData[MardownDocumentationAttributes.NAME],
      jsonData[MardownDocumentationAttributes.DOCUMENTATION],
    );

    return result;
  }
}

export enum MardownDocumentationAttributes {
  NAME = 'name',
  DOCUMENTATION = 'documentation'
}

export class TreeNode implements INodeDataValueChange {

  isVisible: boolean;
  children: BehaviorSubject<TreeNode[]>;
  treeNodeParent: TreeNode;
  isLastChild: boolean;
  isConfigured: boolean;
  private _status: DisciplineStatus;
  public dataManagementDisciplineDict: { [id: string]: DataManagementDiscipline };
  maturity: string;

  postProcessingBundle: PostProcessingBundle[];
  private _isRoot: boolean;
  isValidated: boolean;

  constructor(
    public name: string,
    jsonData: any,
    jsonDiscData: any,
    public nodeType: string,
    public modelNameFullPath: string,
    public modelsFullPathList: string[],
    jsonDisciplineDict: any,
    public fullNamespace: string,
    status: string,
    maturity: string,
    public identifier: string,
    isRoot: boolean
  ) {
    this.isVisible = true;
    this.children = new BehaviorSubject([]);
    this.isLastChild = true;
    this.isConfigured = false;
    this._isRoot = isRoot;

    if (this.isValidated == undefined || this.isValidated == null){
      this.isValidated =false;
    }

    this.status = DisciplineStatus.STATUS_NONE;

    if (jsonDisciplineDict !== null && jsonDisciplineDict !== undefined) {
      this.dataManagementDisciplineDict = CreateDataManagementDisciplineDictionary(jsonDisciplineDict, this);
    } else {
      this.dataManagementDisciplineDict = {};
    }

    this.postProcessingBundle = [];

    this.updateStatus(status);

    if (maturity !== undefined && maturity !== null && maturity.length > 0) {
      this.maturity = maturity;
    } else {
      this.maturity = 'Not evaluated';
    }
  }

  get isRoot(): boolean {
    return this._isRoot;
  }

  get status(): DisciplineStatus {
    return this._status;
  }
  set status(value: DisciplineStatus) {

    // Treenode with 'INPUT_DATA' as status are status locked
    if (this.status !== DisciplineStatus.STATUS_INPUT_DATA) {
      this._status = value;
    }
  }

  public static Create(
    jsonData: any,
    isRoot: boolean,
    treenodeDict: { [id: string]: TreeNode } = null,
    nodeDataDict: { [id: string]: NodeData } = null,
    parentNamespace: string): TreeNode {

    const result: TreeNode = new TreeNode(
      jsonData[TreeNodeAttributes.NAME],
      jsonData[TreeNodeAttributes.DATA],
      jsonData[TreeNodeAttributes.DISC_DATA],
      jsonData[TreeNodeAttributes.NODE_TYPE],
      jsonData[TreeNodeAttributes.MODEL_NAME_FULL_PATH],
      jsonData[TreeNodeAttributes.MODELS_NAME_FULL_PATH_LIST],
      jsonData[TreeNodeAttributes.DATA_MANAGEMENT_DISCIPLINE_DICT],
      jsonData[TreeNodeAttributes.FULL_NAMESPACE],
      jsonData[TreeNodeAttributes.STATUS],
      jsonData[TreeNodeAttributes.MATURITY],
      jsonData[TreeNodeAttributes.IDENTIFIER],
      isRoot
    );

    if (result.fullNamespace === null || result.fullNamespace === undefined || result.fullNamespace.length === 0) {
      if (parentNamespace === null || parentNamespace === undefined || parentNamespace.length === 0) {
        result.fullNamespace = result.name;
      } else {
        result.fullNamespace = `${parentNamespace}.${result.name}`;
      }

    }

    if (treenodeDict != null) {
      treenodeDict[result.fullNamespace] = result;
    }

    if (nodeDataDict !== null) {
      Object.keys(result.dataManagementDisciplineDict).forEach(disciplineKey => {
        let dataDict = result.dataManagementDisciplineDict[disciplineKey].allDataDict;
          Object.keys(dataDict).forEach(key => {
            nodeDataDict[dataDict[key].identifier] = dataDict[key];
          });
      });
    }

    if (
      jsonData[TreeNodeAttributes.CHILDREN] !== null &&
      jsonData[TreeNodeAttributes.CHILDREN] !== undefined &&
      jsonData[TreeNodeAttributes.CHILDREN].length > 0
    ) {
      // Create an index to help identifying when the current child will be the last child
      const children = jsonData[TreeNodeAttributes.CHILDREN];
      let index = 0;
      children.forEach(child => {
        const newTreeNode = TreeNode.Create(child, false, treenodeDict, nodeDataDict, result.fullNamespace);
        newTreeNode.isLastChild = index === (children.length - 1);
        newTreeNode.treeNodeParent = result;

        result.children.value.push(newTreeNode);
        index += 1;
      });
    }
    result.checkConfigured();
    return result;
  }

  public nodeDataValueChange(nodeData: NodeData) {
    this.checkConfigured();
  }

  public checkConfigured() {

    this.isConfigured = this.checkTreeNodeConfigured();

    // Update parent treenode if it exist
    if (this.treeNodeParent !== null && this.treeNodeParent !== undefined) {
      this.treeNodeParent.checkConfigured();
    }
  }

  public checkTreeNodeConfigured(): boolean {
    let treeNodeConfigured = true;
    // Check all treenode data is configured
    if (this.dataManagementDisciplineDict !== null && this.dataManagementDisciplineDict !== undefined && Object.keys(this.dataManagementDisciplineDict).length > 0) {
      Object.keys(this.dataManagementDisciplineDict).forEach(disciplineKey => {
        let dataDict = this.dataManagementDisciplineDict[disciplineKey].allDataDict;
        Object.keys(dataDict).forEach(key => {
          if (dataDict[key].valueType === ValueType.EMPTY && dataDict[key].ioType !== IoType.OUT) { // Missing values
            treeNodeConfigured = false;
          }
        });
      });
    
    }
    return treeNodeConfigured;
  }

  private updateStatus(status) {

    if (status !== undefined) {
      this.status = DisciplineStatus[`STATUS_${status}`];

      if (this.status === undefined) {
        this.status = DisciplineStatus.STATUS_NONE;
      }
    } else {
      this.status = DisciplineStatus.STATUS_NONE;
    }
  }
}


export enum TreeNodeAttributes {
  NAME = 'name',
  DATA = 'data',
  DISC_DATA = 'disc_data',
  CHILDREN = 'children',
  NODE_TYPE = 'node_type',
  STATUS = 'status',
  MATURITY = 'maturity',
  IDENTIFIER = 'identifier',
  MODEL_NAME_FULL_PATH = 'model_name_full_path',
  MODELS_NAME_FULL_PATH_LIST = 'models_full_path_list',
  DATA_MANAGEMENT_DISCIPLINE_DICT = 'data_management_disciplines',
  FULL_NAMESPACE = 'full_namespace'
}

