import { CreateNodeDataDictionary, NodeData } from "./node-data.model";
import { TreeNode } from "./tree-node.model";

export class DataManagementDiscipline {
  modelNameFullPath: string[];
  
  showLabel: boolean; //showLabel parameter indicates if the discipline label must be shown in addition of the discipline model name
  namespace: string;
  maturity: string;
  label: string;
  disciplinaryInputs: { [id: string]: NodeData; };
  disciplinaryOutputs: { [id: string]: NodeData; };
  numericalParameters: { [id: string]: NodeData; };
  // allDataDict contains all data from the 3 lists
  allDataDict: { [id: string]: NodeData; };
  disciplineKey: string[];
  isUniqueInNode: boolean;
  constructor() {
    this.maturity = null;
    this.label = ''
    this.namespace = ''
    this.showLabel = false;
    this.disciplinaryInputs = {};
    this.disciplinaryOutputs = {};
    this.numericalParameters = {};
    this.allDataDict = {};
    this.disciplineKey = [];
    this.modelNameFullPath = [];
  }

  public static Create(jsonData: any, treeNode: TreeNode): DataManagementDiscipline {
    // Remove parameter without type key
    let result: DataManagementDiscipline = null;
    result = new DataManagementDiscipline()
    result.maturity = jsonData[DataManagementDisciplineAttributes.MATURITY];
    result.modelNameFullPath.push(jsonData[DataManagementDisciplineAttributes.MODEL_NAME_FULL_PATH]);
    result.namespace = jsonData[DataManagementDisciplineAttributes.NAMESPACE];
    result.label = jsonData[DataManagementDisciplineAttributes.DISCIPLINE_LABEL];
    result.disciplineKey.push(`${treeNode.fullNamespace}.${result.label}`)
    
    if (jsonData[DataManagementDisciplineAttributes.DISCIPLINARY_INPUTS] !== null && jsonData[DataManagementDisciplineAttributes.DISCIPLINARY_INPUTS] !== undefined){
      result.disciplinaryInputs = CreateNodeDataDictionary(jsonData[DataManagementDisciplineAttributes.DISCIPLINARY_INPUTS], treeNode, true);
    }
    if (jsonData[DataManagementDisciplineAttributes.DISCIPLINARY_OUTPUTS] !== null && jsonData[DataManagementDisciplineAttributes.DISCIPLINARY_OUTPUTS] !== undefined){
      result.disciplinaryOutputs = CreateNodeDataDictionary(jsonData[DataManagementDisciplineAttributes.DISCIPLINARY_OUTPUTS], treeNode, true);
    }
    if (jsonData[DataManagementDisciplineAttributes.NUMERICAL_PARAMETERS] !== null && jsonData[DataManagementDisciplineAttributes.NUMERICAL_PARAMETERS] !== undefined){
      result.numericalParameters = CreateNodeDataDictionary(jsonData[DataManagementDisciplineAttributes.NUMERICAL_PARAMETERS], treeNode, true);
    } 

    result.allDataDict = result.GetAllDataDict();

    return result;
  }

  private GetAllDataDict() : { [id: string]: NodeData; }
  {
    let nodeDataDict = {}
    Object.keys(this.numericalParameters).forEach(key => {
      nodeDataDict[this.numericalParameters[key].identifier] = this.numericalParameters[key];
    });
    Object.keys(this.disciplinaryInputs).forEach(key => {
      nodeDataDict[this.disciplinaryInputs[key].identifier] = this.disciplinaryInputs[key];
    });
    Object.keys(this.disciplinaryOutputs).forEach(key => {
      nodeDataDict[this.disciplinaryOutputs[key].identifier] = this.disciplinaryOutputs[key];
    });
    return nodeDataDict;
  }
}

export function CreateDataManagementDisciplineDictionary(jsonData: any, parent: TreeNode): { [id: string]: DataManagementDiscipline } {
  const result: { [id: string]: DataManagementDiscipline } = {};
  const modelList = [];
  Object.keys(jsonData).forEach(key => {
    const discipline = jsonData[key];
    const dataManagementDiscipline = DataManagementDiscipline.Create(discipline, parent);

    if (dataManagementDiscipline !== null) {
      result[key] = dataManagementDiscipline;
      modelList.push(result[key].modelNameFullPath[0]);
    }
  });

  // check that there are discipline with the same model, in this case, the discipline label must be shown in addition of the model name
  Object.keys(result).forEach(key => {
    const discipline = result[key];
    if(modelList.filter(x => x==discipline.modelNameFullPath[0]).length > 1){
      discipline.showLabel = true;
    }
    
  });
  return result;
}


export enum PannelIds {
  DETAILS = 'details',
  NUMERICAL = 'numerical',
  INPUTS = 'inputs',
  OUTPUTS = 'outputs'
}

export enum DataManagementDisciplineAttributes {
  MATURITY = 'maturity',
  MODEL_NAME_FULL_PATH = 'model_name_full_path',
  NAMESPACE = 'namespace',
  DISCIPLINARY_INPUTS = 'disciplinary_inputs',
  DISCIPLINARY_OUTPUTS = 'disciplinary_outputs',
  NUMERICAL_PARAMETERS = 'numerical_parameters',
  DISCIPLINE_LABEL = 'discipline_label'
}
