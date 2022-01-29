import { NodeData } from "./node-data.model";

export class DataManagementDiscipline {
  modelNameFullPath: string[];
  namespace: string;
  maturity: string;
  disciplinaryInputs: { [id: string]: NodeData; };
  disciplinaryOutputs: { [id: string]: NodeData; };
  numericalParameters: { [id: string]: NodeData; };
  disciplineKey: string[];
  constructor() {
    this.maturity = null;
    this.disciplinaryInputs = {};
    this.disciplinaryOutputs = {};
    this.numericalParameters = {};
    this.disciplineKey = [];
    this.modelNameFullPath = [];
  }
}

export enum PannelIds {
  DETAILS = 'details',
  NUMERICAL = 'numerical',
  INPUTS = 'inputs',
  OUTPUTS = 'outputs'
}
