import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ColumnName } from 'src/app/models/enumeration.model';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})

export class FilterBarComponent implements OnInit {
  @Input() dataSource: MatTableDataSource<any>;
  @Input() columnsName: Map <ColumnName, string[]>;
  @Input() columnsFilter: Map <ColumnName, string>;
  @Input() element: string;
  @Input() selectedValues: Map<ColumnName, string[]>;
  @Output() filteredDataChange = new EventEmitter<MatTableDataSource<any>>();

  public selectedColumn: ColumnName;
  public numberElement: number
  public filterValue: string;
  private searchValues = new Subject<string>();
  public elementName: string;
  public dataSourceCopy= new MatTableDataSource<any>();

  constructor() {
    this.selectedColumn = ColumnName.ALL_COLUMNS;
    this.filterValue = "";
    this.numberElement = 0;
    this.elementName = "";
  }

  ngOnInit() {
    
    // Add column "all column on the selection to filter 
    this.columnsFilter.set(ColumnName.ALL_COLUMNS, "All Columns")
    // Retrieve the number of element
    this.numberElement = this.dataSource.filteredData.length;

    this.elementName = "Number of "+ this.element + " : "


    this.setupSearchObservable();
    this.setupFilterPredicate();
  }

  private setupSearchObservable() {
    this.searchValues.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilter());
  }

  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const searchStr = filter.toLowerCase();
      let isMatch = false
      if (this.selectedValues && this.selectedValues.size > 0) {
        this.selectedValues.forEach((values, key) => {
          if(filter.trim()) {
            const objects = [];
            const object = this.checkObjectAgainstMapRecursive(data, this.selectedValues, objects);
            if(object.length > 0){
              isMatch = this.getNestedValue(data, key).toLowerCase().trim().includes(searchStr);
              return isMatch;
            }
          } else {
            if (values.length > 0) {
              values.some(value => {
                isMatch = String(this.getNestedValue(data, key)).toLowerCase().trim().includes(value.toLowerCase().trim());
                return isMatch;
              });
            }
          }
        });
      } else {
      if (this.selectedColumn === ColumnName.ALL_COLUMNS) {
        // Create a copy of the columnsFilter without ALL_COLUMNS
        const filteredColumns = new Map(this.columnsFilter);
        filteredColumns.delete(ColumnName.ALL_COLUMNS);
        isMatch = Array.from(filteredColumns.values()).some(columnValues => {
            const key = this.getKeyByValue(filteredColumns, columnValues);
            isMatch = String(this.getNestedValue(data, key)).toLowerCase().trim().includes(searchStr);
            return isMatch
          });
      } else {        
          const keys = this.columnsName.keys();
          const keysArray = Array.from(keys);
          const selectedKey = keysArray.find(key => key === this.selectedColumn);
          if (!selectedKey) {
            isMatch = false;
          } else {
             isMatch = String(data[selectedKey]).trim().toLowerCase().includes(searchStr);
          }
        }
      }
      return isMatch
    };   
  }

private checkObjectAgainstMapRecursive(data: any, filterMap: Map<string, any[]>, list: any) {
  
  for (const [key, values] of filterMap.entries()) {
    if (key in data && values.includes(data[key])) {
      list.push(data);
    }
    if (typeof(data) == 'object') {
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object' && data[key] !== null) {
          this.checkObjectAgainstMapRecursive(data[key], filterMap, list)
        } 
      })
    }  
  }
  return list;
}
// Helper function to get nested values from an object
private getNestedValue(data: any, key: string): any {
  // If the key exists directly in the object, return its value
  if (key.toLowerCase() in data) {
    return data[key.toLowerCase()];
  }
  // Recursively search for the key in nested objects
  for (const prop in data) {
    if (data[prop] && typeof data[prop] === 'object' ) {
      const result = this.getNestedValue(data[prop], key);
      if (result !== undefined) {
        return result;
      }
    }
  }
  // Return undefined if the key is not found
  return undefined;
}
  private getKeyByValue(columnsMap: Map<ColumnName, string>, searchValue: string): ColumnName {
    for (const [key, value] of columnsMap.entries()) {
      if (value === searchValue) {
        return key;
      }
    }
  }

  onSearch(value: string): void {
    this.filterValue = value;
    this.searchValues.next(value);
  }

  onColumnChange(): void {
    this.applyFilter();
  }

  applyFilter() {
    if (this.dataSource) {
      if(this.filterValue.trim().length == 0 && this.selectedValues && this.selectedValues.size > 0) {
        this.numberElement = this.dataSource.filteredData.length;
        this.filteredDataChange.emit(this.dataSource);
      } 
      // else if(this.selectedValues && this.selectedValues.size == 0) {
      //   this.dataSource.filter = "";
      //   this.numberElement = this.dataSource.filteredData.length;
      //   this.filteredDataChange.emit(this.dataSource);
      // } 
      else {
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
        this.numberElement = this.dataSource.filteredData.length;
        this.filteredDataChange.emit(this.dataSource);
      }
    }
  }
}