import { NodeData, CreateNodeDataDictionary, ValueType, INodeDataValueChange, IoType } from './node-data.model';
import { BehaviorSubject } from 'rxjs';
import { DisciplineStatus } from './study-case-execution-observer.model';
import { PostProcessingBundle } from './post-processing-bundle.model';

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
        if (treenodeKey in jsonPostProcessings) {
          result.rootDict[treenodeKey].postProcessingBundle = jsonPostProcessings[treenodeKey].map(cf => PostProcessingBundle.Create(cf));
        }
      }
    });


    return result;
  }
}

export class MardownDocumentation{


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
  dataDisc: { [id: string]: NodeData };
  maturity: string;
  public data: { [id: string]: NodeData };

  postProcessingBundle: PostProcessingBundle[];
  private _isRoot: boolean;
  public markdownDocumentation: MardownDocumentation[];

  constructor(
    public name: string,
    jsonData: any,
    jsonDiscData: any,
    public nodeType: string,
    public modelNameFullPath: string,
    public modelsFullPathList: string[],
    public fullNamespace: string,
    status: string,
    maturity: string,
    public identifier: string,
    jsonMarkdownData: any[],
    isRoot: boolean
  ) {
    this.isVisible = true;
    this.children = new BehaviorSubject([]);
    this.isLastChild = true;
    this.isConfigured = false;
    this._isRoot = isRoot;
    this.status = DisciplineStatus.STATUS_NONE;
    if (jsonData !== null && jsonData !== undefined) {
      this.data = CreateNodeDataDictionary(jsonData, this, false);
    } else {
      this.data = {};
    }
    if (jsonDiscData !== null && jsonDiscData !== undefined) {
      this.dataDisc = CreateNodeDataDictionary(jsonDiscData, this, true);
    } else {
      this.dataDisc = {};
    }
    this.markdownDocumentation = [];
    if (jsonMarkdownData !== null && jsonMarkdownData !== undefined && jsonMarkdownData.length > 0) {
      jsonMarkdownData.forEach(jsonMarkdownItem => {
        this.markdownDocumentation.push(MardownDocumentation.Create(jsonMarkdownItem));
      });
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
      jsonData[TreeNodeAttributes.FULL_NAMESPACE],
      jsonData[TreeNodeAttributes.STATUS],
      jsonData[TreeNodeAttributes.MATURITY],
      jsonData[TreeNodeAttributes.IDENTIFIER],
      jsonData[TreeNodeAttributes.MARKDOWN_DOCUMENTATION],
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
      Object.keys(result.data).forEach(key => {
        nodeDataDict[result.data[key].identifier] = result.data[key];
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
    let treeNodeConfigured = true;
    // Check all treenode data is configured
    if (this.data !== null && this.data !== undefined && Object.keys(this.data).length > 0) {
      Object.keys(this.data).forEach(key => {
        if (this.data[key].valueType === ValueType.EMPTY && this.data[key].ioType !== IoType.OUT) { // Missing values
          treeNodeConfigured = false;
        }
      });
    }

    this.isConfigured = treeNodeConfigured;

    // Update parent treenode if it exist
    if (this.treeNodeParent !== null && this.treeNodeParent !== undefined) {
      this.treeNodeParent.checkConfigured();
    }
  }

  public checkTreeNodeConfigured(): boolean {
    let treeNodeConfigured = true;
    // Check all treenode data is configured
    if (this.data !== null && this.data !== undefined && Object.keys(this.data).length > 0) {
      Object.keys(this.data).forEach(key => {
        if (this.data[key].valueType === ValueType.EMPTY && this.data[key].ioType !== IoType.OUT) { // Missing values
          treeNodeConfigured = false;
        }
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
  FULL_NAMESPACE = 'full_namespace',
  MARKDOWN_DOCUMENTATION = 'markdown_documentation'
}

