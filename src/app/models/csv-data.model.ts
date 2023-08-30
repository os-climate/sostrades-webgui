import { TypeCheckingTools } from '../tools/type-checking.tool';
import { DataframeDescriptor, DataframeDescriptorItem } from './dataframe-descriptor.model';

export class CsvData {
  constructor(public csvRowList: { [CsvRowColumnName: string]: CsvRowColumnValue }[]) {
  }

  public static Create(jsonData: any, dataframeDescriptor: DataframeDescriptor = null): CsvData {
    const result = new CsvData([]);

    if (jsonData !== undefined && jsonData !== null && jsonData.length > 0) {

      // Iterate through all csv line
      jsonData.forEach(csvLineDict => {

        const csvRowDict = {};
        // Iterate through all line column dict (dict 'ColumnName':'ColumnValue')
        Object.keys(csvLineDict).forEach(key => {
          csvRowDict[key] = new CsvRowColumnValue(csvLineDict[key], csvLineDict[key], null, [], false);
          if (dataframeDescriptor !== null) {

            if (dataframeDescriptor.columns[key] === undefined
              || dataframeDescriptor.columns[key] === null) {// Column is not described
              // Create dataframe entry
              dataframeDescriptor.columns[key] = new DataframeDescriptorItem();
              dataframeDescriptor.columns[key].columnType = 'unknown string';
            }

            // Creating line infos
            csvRowDict[key].type = dataframeDescriptor.columns[key].columnType;
            csvRowDict[key].isEditable = dataframeDescriptor.columns[key].isColumnEditable;
            csvRowDict[key].range = dataframeDescriptor.columns[key].columnRange;
            csvRowDict[key].isRemovable = dataframeDescriptor.columns[key].isColumnRemovable;
          }
        });
        result.csvRowList.push(csvRowDict);
      });
    }

    // Csv reader(PapaParse) add one line empty, removed at this point
    result.csvRowList = result.csvRowList.slice(0, -1);

    return result;
  }
}

export class CsvRowColumnValue {

  public hasRowChanged: boolean;
  public hasRowError: boolean;

  constructor(
    public newValue: any,
    public oldValue: any,
    private _type: string,
    public range: number[],
    public isEditable: boolean) {
    this.hasRowChanged = false;
    this.hasRowError = false;
  }

  //#region  properties
  get type(): string {
    return this._type;
  }

  set type(newType: string) {

    if (this._type !== newType) {
      if ((this._type === null) && (newType === 'bool')) {
        this.newValue = this.newValue.toLowerCase() === 'true';
        this.oldValue = this.oldValue.toLowerCase() === 'true';
      }
      this._type = newType;
    }
  }

  //#endregion  properties

  public checkRowHasChanged() {

    if (this.newValue !== this.oldValue) {
      this.hasRowChanged = true;
    } else {
      this.hasRowChanged = false;
    }

  }

  public checkRowHasTypeError() {
    this.hasRowError = false;

    if (this.newValue.length === 0) {
      this.hasRowError = true;
    } else {
      if (this.type !== null) {

        // Check range
        if (this.range !== undefined && this.range !== null && this.range.length > 0) {

          if (!(parseInt(this.newValue, 10) >= this.range[0]
            && parseInt(this.newValue, 10) <= this.range[1])) {
            this.hasRowError = true;
          }
        }

        // Check value float
        if (this.type.includes('float')) {
          if (!TypeCheckingTools.isFloat(this.newValue)) {
            this.hasRowError = true;
          }
        }

        // Check value int
        if (this.type.includes('int')) {
          if (!TypeCheckingTools.isInt(this.newValue)) {
            this.hasRowError = true;
          }
        }
      }
    }
  }
}

