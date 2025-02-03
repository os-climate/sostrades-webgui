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
    
    // Set the element name for display
    this.elementName = "Number of " + this.element + " : ";
    
    // Initialize the element count with the number of filtered items in the data source
    this.dataSource.connect().subscribe(data => {
      this.numberElement = data.length;
    });

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
   * Configures the filtering behavior for the data source by setting up a custom filter predicate
   * This predicate handles both selected value filtering and search string filtering
   */
  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: T, filter: string): boolean => {
      const searchStr = filter.toLowerCase();
      let isMatch = false;

      // Handle filtering when we have selected values in our filter criteria
      if (this.selectedValues && this.selectedValues.size > 0) {
        this.selectedValues.forEach((values, key) => {
          // Clean up selectedValues by removing empty arrays
          Array.from(this.selectedValues.entries()).forEach(([key, values]) => {
            if (values.length === 0) {
              this.selectedValues.delete(key);
            }
          });

          // If no filter criteria remain after cleanup, accept all data
          if (this.selectedValues.size === 0) {
            isMatch = true
            return isMatch;
          } else {
            // Handle active search filter combined with selected values
            if(filter) {
              if (values.length > 0) {
                // First filter by selected values, then by search string
                const matchingObjects = this.recursivelyFilterObjectByMapCriteria(data, []);
                if (matchingObjects.length > 0) {
                  // Check if any matching object contains the search string
                  isMatch = this.isSearchStringInObject(matchingObjects[0], searchStr);
                  return isMatch;
                }
              }
            } else {
              // Handle selected values filtering without search string
              if (values.length > 0) {
                // Check if any selected value matches the data
                values.some(value => {
                  isMatch = String(this.recursivelySearchObjectForKey(data, key)).toLowerCase().trim().includes(value.toLowerCase().trim());
                  return isMatch;
                });
              }
            }
          }
        });
        
      } else {
        if (filter.trim()) {
          // Handle basic search filtering without selected values
          if (this.selectedColumn === ColumnName.ALL_COLUMNS) {
            // When "All Columns" is selected, search across all columns except the ALL_COLUMNS option
            const filteredColumns = new Map(this.columnsFilter);
            filteredColumns.delete(ColumnName.ALL_COLUMNS);
            
            // Search through each column's values
            isMatch = Array.from(filteredColumns.values()).some(columnValues => {
                const key = this.findColumnNameByValue(filteredColumns, columnValues);
                const value = String(this.recursivelySearchObjectForKey(data, key));
                isMatch = value.toLowerCase().trim().includes(searchStr);
                return isMatch;
              });
          } else {        
            // When a specific column is selected, only search in that column
            const keys = this.columnsName.keys();
            const keysArray = Array.from(keys);
            const selectedKey = keysArray.find(key => key === this.selectedColumn);
            
            if (!selectedKey) {
              isMatch = false;
            } else {
              isMatch = String(data[selectedKey]).trim().toLowerCase().includes(searchStr);
            }
          } 
        } else {
          // If there are no filter return true
          isMatch = true
          return isMatch;
        }
      }
      return isMatch;
    }; 
  }

  /**
   * Recursively searches and filters objects based on multiple criteria from selectedValues map
   * @param data The object to examine (can be nested)
   * @param matchingList Accumulator array to store objects that match all criteria
   * @returns Array of all matching objects found in the object tree
   */
  private recursivelyFilterObjectByMapCriteria(data: any, matchingList: any[]): any[] {
    // Track if current object matches all filter criteria
    let matchesAllCriteria = true;

    // Examine each filter criteria from selectedValues map
    for (const [key, values] of this.selectedValues.entries()) {
      // Get alternative key name if exists (e.g. 'processDisplayName' for 'process')
      const ontologyKey = this.getDisplayNameKey(key);
      let matchFound = false;

      // First attempt: Check if any filter value matches the main key's value
      if (key in data) {
        matchFound = values.some(value => {
          const dataValue = String(data[key]).toLowerCase().trim();
          const searchValue = String(value).toLowerCase().trim();
          if (dataValue) {
            // Match if either value contains the other (bidirectional partial match)
            return dataValue.includes(searchValue) || searchValue.includes(dataValue);
          } else {
            return false
          }
         
        });
      }

      // Second attempt: If no match found and ontology key exists, try matching against it
      if (!matchFound && ontologyKey && ontologyKey in data) {
        matchFound = values.some(value => {
          const dataValue = String(data[ontologyKey]).toLowerCase().trim();
          const searchValue = String(value).toLowerCase().trim();
          // Same bidirectional matching logic for ontology key
          return dataValue.includes(searchValue) || searchValue.includes(dataValue);
        });
      }

      // If neither key matched any values, this object fails the criteria
      if (!matchFound) {
        matchesAllCriteria = false;
        break; // No need to check other criteria since one failure disqualifies the object
      }
    }

    // If object matched all criteria and we had criteria to check, add it to results
    if (matchesAllCriteria && this.selectedValues.size > 0) {
      matchingList.push(data);
    }

    // Recursively search through all nested objects
    if (typeof(data) === 'object' && data !== null) {
      Object.keys(data).forEach(objKey => {
        // Only recurse into actual objects (not null and is object type)
        if (typeof data[objKey] === 'object' && data[objKey] !== null) {
          this.recursivelyFilterObjectByMapCriteria(data[objKey], matchingList);
        } 
      });
    }
    
    return matchingList;
  }

  /**
 * Maps specific keys to their corresponding display name keys
 * @param key Original key to check
 * @returns Corresponding display name key or empty string
 */
  private getDisplayNameKey(key: string): string {
    switch (key) {
      case 'process': return 'processDisplayName';
      case 'repository': return 'repositoryDisplayName';
      default: return null;
    }
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
   * Recursively searches for a key in an object and returns its value
   * @param data Object to search through
   * @param key Key to search for
   * @returns Found value or undefined if not found
   */
  private recursivelySearchObjectForKey(data: any, key: string): any {
    // If the key exists directly in the object, return its value
    if (key in data) {
      return data[key];
    }
    // Recursively search for the key in nested objects
    for (const attribut in data) {
      if (data[attribut] && typeof data[attribut] === 'object') {
        const result = this.recursivelySearchObjectForKey(data[attribut], key);
        if (result !== undefined) {
          return result;
        }
      }
    }
    // Return undefined if the key is not found
    return undefined;
  }

    /**
   * Finds the column name (key) corresponding to a value in the columns map
   * @param columnsMap Map of column names to their values
   * @param searchValue Display value to search for
   * @returns Corresponding ColumnName or undefined if not found
   */
  private findColumnNameByValue(columnsMap: Map<ColumnName, string>, searchValue: string): ColumnName | undefined {
    for (const [columnName, value] of columnsMap.entries()) {
      if (value === searchValue) {
        return columnName;
      }
    }
  }
    /**
   * Checks if the search string is present in any string value of the object
   * @param obj Object to search through
   * @param searchStr String to search for
   * @returns True if searchStr is found in any string value, false otherwise
   */
  private isSearchStringInObject(obj: any, searchStr: string): boolean {
    const lowerSearchStr = searchStr.toLowerCase();

    function searchInValue(value: any): boolean {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearchStr);
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(searchInValue);
      }
      return false;
    }

    return Object.values(obj).some(searchInValue);
  }
}