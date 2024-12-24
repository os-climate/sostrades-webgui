import { Injectable } from '@angular/core';
import { ColumnName } from 'src/app/models/enumeration.model';

@Injectable({
  providedIn: 'root'
})
export class FilterTableService {
  public columnValuesDict = new Map <ColumnName, string[]>();
  public colummnsDictForTitleSelection = new Map <ColumnName, string>();
  constructor(
  ) { 
    this.columnValuesDict.clear();
    this.colummnsDictForTitleSelection.clear();
  }

  public setColumnValuesDict(columns: ColumnName[]) {
    columns.forEach(column => {
      this.columnValuesDict.set(column, [this.formatColumnName(column)]);
    });
    return this.columnValuesDict
  }
  public setcolummnsDictForTitleSelection(columns: ColumnName[]) {
    columns.forEach(column => {
      this.colummnsDictForTitleSelection.set(column, this.formatColumnName(column));
    });
    return this.colummnsDictForTitleSelection
  }

  private formatColumnName(column: ColumnName): string {
    
    const columnString = column.toString()
    switch (column) {
      case ColumnName.LAST_NAME:
        return 'Last name';
      case ColumnName.FIRST_NAME:
        return 'First name';
      case ColumnName.USER_PROFILE_NAME:
        return 'Profile'
    }
    
    // Convertir camelCase ou snake_case en mots séparés
    const words = columnString.split(/(?=[A-Z])|_/).map(word => word.toLowerCase());
    
    // Capitaliser chaque mot et les joindre
    return words.map(word => this.capitalizeFirstLetter(word)).join(' ');
  }

  private capitalizeFirstLetter(str: string): string {
    const columnName = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return columnName;
  }
}