import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ColumnName } from 'src/app/models/enumeration.model';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})

export class FilterBarComponent<T> implements OnInit {
  @Input() dataSource: MatTableDataSource<T>;
  @Input() columnsName: Map <ColumnName, string[]>;
  @Input() columnsFilter: Map <ColumnName, string>;
  @Input() element: string;
  @Input() selectedValues: Map<ColumnName, string[]>;

  public selectedColumn: ColumnName;
  public numberElement: number
  public filterValue: string;
  private searchValues = new Subject<string>();
  public elementName: string;
  public dataSourceCopy= new MatTableDataSource<T>();

  constructor() {
    this.selectedColumn = ColumnName.ALL_COLUMNS;
    this.filterValue = "";
    this.numberElement = 0;
    this.elementName = "";
  }

  ngOnInit() {
    // Add "All Columns" option to the column filter
    this.columnsFilter.set(ColumnName.ALL_COLUMNS, "All Columns");
    
    // Initialize the element count with the number of filtered items in the data source
    this.numberElement = this.dataSource.filteredData.length;

    // Set the element name for display
    this.elementName = "Number of " + this.element + " : ";

    // Set up the search observable and filter predicate
    this.setupSearchObservable();
    this.setupFilterPredicate();
  }

  /**
   * Sets up the search observable with debounce and distinctUntilChanged
   */
  private setupSearchObservable() {
    this.searchValues.pipe(
      debounceTime(300), // Wait for 300ms after the last input
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(() => 
      this.applyFilter() // Apply the filter when the search value changes
    );
  }

  /**
   * Sets up the filter predicate for the data source
   */
  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: T, filter: string): boolean => {
      const searchStr = filter.toLowerCase();
      let isMatch = false;

      // Filtering logic based on selected values
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
        // Filtering logic for all columns or a specific column
        if (this.selectedColumn === ColumnName.ALL_COLUMNS) {
          // Create a copy of the columnsFilter without ALL_COLUMNS
          const filteredColumns = new Map(this.columnsFilter);
          filteredColumns.delete(ColumnName.ALL_COLUMNS);
          isMatch = Array.from(filteredColumns.values()).some(columnValues => {
              const key = this.getKeyByValue(filteredColumns, columnValues);
              isMatch = String(this.getNestedValue(data, key)).toLowerCase().trim().includes(searchStr);
              return isMatch;
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
      return isMatch;
    };   
  }

  /**
   * Recursively checks if an object matches the criteria in the filter map
   * @param data Object to check
   * @param filterMap Map containing filter criteria
   * @param list List to store matching objects
   * @returns List of matching objects
   */
  private checkObjectAgainstMapRecursive(data: any, filterMap: Map<string, any[]>, list: any) {
    for (const [key, values] of filterMap.entries()) {
      if (key in data && values.includes(data[key])) {
        list.push(data);
      }
      if (typeof(data) == 'object') {
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'object' && data[key] !== null) {
            this.checkObjectAgainstMapRecursive(data[key], filterMap, list);
          } 
        });
      }  
    }
    return list;
  }

  /**
   * Handles the search event
   * @param value Search value
   */
  onSearch(value: string): void {
    this.filterValue = value;
    this.searchValues.next(value);
  }

  /**
   * Handles the change of selected column
   */
  onColumnChange(): void {
    this.applyFilter();
  }

  /**
   * Applies the filter to the data source
   */
  applyFilter() {
    if (this.dataSource) {
      if(this.filterValue.trim().length == 0 && this.selectedValues && this.selectedValues.size > 0) {
        // Apply filter based on selected values
        this.selectedValues.forEach((values,) => {
          const matchingObjects = this.findMatchingObjects(this.dataSource.data, values);
          this.dataSource.filteredData = matchingObjects;
        });
        this.dataSource.filter = ' '; // Trigger view update
        this.numberElement = this.dataSource.filteredData.length;

      } else {
        // Apply filter based on search value
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
        this.numberElement = this.dataSource.filteredData.length;
      }
    }
  }

  /**
 * Finds objects matching the specified values
 * @param objects List of objects to filter
 * @param valuesToCheck Values to search for
 * @returns List of matching objects
 */
  private findMatchingObjects<T>(objects: T[], valuesToCheck: string[]): T[] {
    function checkObject(obj: any): boolean {
      for (const key in obj) {
        if (key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (checkObject(obj[key])) return true;
          } else if (typeof obj[key] === 'string' && valuesToCheck.some(value => obj[key].includes(value))) {
            return true;
          }
        }
      }
      return false;
    }
    return objects.filter(obj => checkObject(obj));
  }
  
  /**
   * Retrieves a nested value from an object
   * @param data Object to traverse
   * @param key Key to search for
   * @returns Found value or undefined
   */
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

  /**
   * Retrieves the key corresponding to a value in the columns map
   * @param columnsMap Map of columns
   * @param searchValue Value to search for
   * @returns Corresponding key or undefined
   */
  private getKeyByValue(columnsMap: Map<ColumnName, string>, searchValue: string): ColumnName {
    for (const [key, value] of columnsMap.entries()) {
      if (value === searchValue) {
        return key;
      }
    }
  }
}