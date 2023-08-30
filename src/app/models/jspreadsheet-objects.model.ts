import { DataframeDescriptor, DataframeDescriptorItem } from "./dataframe-descriptor.model";
import jss_autoWidth from '@jspreadsheet/autowidth';

export class JSpreadSheetProperties {

  public onafterchanges: any;
  public oninsertrow: any;
  public ondeleterow: any;
  public onbeforedeletecolumn:any;
  public plugins: {}[];

  constructor(
    public data: any,
    public columns: any,
    private dataframeDescriptor: DataframeDescriptor,
    public editable: boolean = true,
    public search: boolean = true,
    public allowInsertRow: boolean = true,
    public allowDeleteRow: boolean = true,
    public allowInsertColumn: boolean = false,
    public allowDeleteColumn: boolean = false,
    public allowRenameColumn: boolean = false,
    public allowExport: boolean = false,
    public loadingSpin: boolean = true,
    public lazyLoading: boolean = true,
    public stripHTMLOnCopy: boolean = true,
    public copyCompatibility: boolean = true,
    public tableOverflow: boolean = true, // Allow table to be bigger than container
    public tableWidth: string = "100%", // Width of global table
    public tableHeight: string = "100%", // Height of global table
    public filters: boolean = true,  // Display filter row
  ) {
    this.onafterchanges = null;
    this.plugins = [{ name: 'autoWidth', plugin: jss_autoWidth }]

    if (!editable) { // Dataframe not editable
      this.allowDeleteRow = false;
      this.allowInsertRow = false;
    } else {
      // Looping through descriptor if one column is not editable disable row addition and deletion
      Object.keys(this.dataframeDescriptor.columns).forEach(colName => {
        const columnName = this.dataframeDescriptor.columns[colName]
        if (columnName.isColumnEditable === false) {
          this.allowDeleteRow = false;
          this.allowInsertRow = false;
        }
        
        if (columnName.isColumnRemovable) {
          Object.values(this.columns).forEach( (column:any) => { 
            if (colName === column.title)
            {
             this.allowDeleteColumn = true;
            }
          })
        }
      });
    }
  }
}

export class JSpreadSheetColumns {

  static undefinedType = 'Undefined type';

  constructor(public columnsData: JSpreadSheetColumnDef[]) {
  }

  public static Create(jsonData: any, dataframeDescriptor: DataframeDescriptor = null, listType: string): JSpreadSheetColumns {
    const result = new JSpreadSheetColumns([]);
    if (jsonData !== undefined && jsonData !== null) {

      // Iterate through all csv columns
      Object.keys(jsonData).forEach(columnName => {
        if (columnName.length > 0) {
          if (dataframeDescriptor !== null) {
            if (dataframeDescriptor.columns[columnName] === undefined
              || dataframeDescriptor.columns[columnName] === null) {// Column is not described
              // Create dataframe entry
              dataframeDescriptor.columns[columnName] = new DataframeDescriptorItem();
              // Add list type to force type checking
              if (listType !== null) {
                dataframeDescriptor.columns[columnName].columnType = listType;
              } else {
                dataframeDescriptor.columns[columnName].columnType = JSpreadSheetColumns.undefinedType;
              }
            }
          }
          let columnType = 'text'
          if (dataframeDescriptor.columns[columnName].columnType === 'bool') {
            columnType = 'checkbox'
          }
          const newColumn = new JSpreadSheetColumnDef(
            columnName,
            columnType,
            !dataframeDescriptor.columns[columnName].isColumnEditable,
            dataframeDescriptor.columns[columnName].isColumnRemovable
          );
          result.columnsData.push(newColumn);
        }
      });

      // Iterate through all dataframe descriptor columns to check if we need to add columns not existing in csv data
      Object.keys(dataframeDescriptor.columns).forEach(columnName => {
        if (columnName.length > 0) {
          if (jsonData !== null) {
            if (jsonData[columnName] === undefined
              || jsonData[columnName] === null) {// Column is not present in csv
              // Create column entry
              const newColumn = new JSpreadSheetColumnDef(
                columnName,
                dataframeDescriptor.columns[columnName].columnType,
                !dataframeDescriptor.columns[columnName].isColumnEditable,
                dataframeDescriptor.columns[columnName].isColumnRemovable
              );
              result.columnsData.push(newColumn);
            }
          }
        }
      });
    }
    return result;
  }
}

export class JSpreadSheetColumnDef {

  constructor(
    public title: string,
    public type: string,
    public readOnly: boolean = false,
    public removable: boolean = false,
    public mask = null,
    public allowEmpty: boolean = false,
    public width = '100%'
  ) { }
}

export class JSpreadSheetRowData {

  constructor(
    public rowsData: { [rowColumnName: string]: any }[]
  ) { }

  public static Create(jsonData: any, dataframeDescriptor: DataframeDescriptor = null): JSpreadSheetRowData {
    const result = new JSpreadSheetRowData([]);

    if (jsonData !== undefined && jsonData !== null && jsonData.length > 0) {

      // Iterate through all csv line
      jsonData.forEach(csvLineDict => {
        const csvRowDict = {};
        // Iterate through all line column dict (dict 'ColumnName':'ColumnValue')
        Object.keys(csvLineDict).forEach(colName => {
          if (colName in dataframeDescriptor.columns) {
            if (dataframeDescriptor.columns[colName].columnType === 'bool') {
              csvRowDict[colName] = csvLineDict[colName].toLowerCase() === 'true';
            } else if (dataframeDescriptor.columns[colName].columnType === 'array') {
              let temp_array_str = csvLineDict[colName].toString();
              let hasBrakets = temp_array_str.includes('[');
              if (hasBrakets)
              {
                let temp_array = temp_array_str.replace('[','').replace(']','').replace(',',' ').split(' ');
                temp_array = temp_array.filter(function(e){return e!= '';});
                csvRowDict[colName] = '[' + temp_array.join(', ')+ ']';
              }
            } else {
              csvRowDict[colName] = csvLineDict[colName];
            }
          }
        });
        result.rowsData.push(csvRowDict);
      });
    }
    return result;
  }
}

export class JSpreadSheetValueError {
  constructor(
    public errorRange: string = '',
    public errorInt: string = '',
    public errorFloat: string = '',
  ) {
  }
}
