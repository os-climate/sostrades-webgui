import { Injectable } from '@angular/core';
import { ColumnName } from 'src/app/models/enumeration.model';

@Injectable({
  providedIn: 'root'
})
export class FilterTableService {
  public columnValuesDict = new Map <ColumnName, string[]>();
  public colummnsDictForFilteredColumn = new Map <ColumnName, string>();
  constructor(
  ) { 
    this.columnValuesDict.clear();
    this.colummnsDictForFilteredColumn.clear();
  }

  public setColumnValuesDict(columns: ColumnName[]) {
    columns.forEach(column => {
      this.columnValuesDict.set(column, [column]);
    });
    return this.columnValuesDict
  }
  public setcolummnsDictForFilteredColumn(columns: ColumnName[]) {
    columns.forEach(column => {
      this.colummnsDictForFilteredColumn.set(column, this.formatColumnName(column));
    });
    return this.colummnsDictForFilteredColumn
  }

  private formatColumnName(column: ColumnName): string {
    const columnString = column.toString()
    switch (column) {
      // User Management
      case ColumnName.LAST_NAME:
        return 'Last name';
      case ColumnName.FIRST_NAME:
        return 'First name';
      case ColumnName.USER_PROFILE_NAME:
        return 'Profile'
      // Study management
      case ColumnName.FLAVOR:
        return 'Pod size'
      case ColumnName.GROUP:
        return 'Group'
      case ColumnName.EXECUTION_STATUS:
        return 'Status'
    }
    
       // Convert in camelCase or snake_case in separeted word
       const words = columnString.split(/(?=[A-Z])|_/).map(word => word.toLowerCase());
    
       // Capitalize each word and join them
       return words.map(word => this.capitalizeFirstLetter(word)).join(' ');
     }
   
     private capitalizeFirstLetter(str: string): string {
       const columnName = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
       return columnName;
  }
}
