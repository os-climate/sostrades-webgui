import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
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
  @Input() element:string;
  @Output() filteredDataChange = new EventEmitter<MatTableDataSource<any>>();

  public selectedColumn: ColumnName;
  public numberElement: number
  public filterValue: string;
  private searchValues = new Subject<string>();
  public elementName: string

  constructor() {
    this.selectedColumn = ColumnName.ALL_COLUMNS;
    this.filterValue = "";
    this.numberElement = 0;
    this.elementName = ""
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
    this.searchValues.subscribe(() => this.applyFilter());
  }

  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const searchStr = filter.toLowerCase();
      let isMatch = true
      if (this.selectedColumn === ColumnName.ALL_COLUMNS) {
        isMatch = Array.from(this.columnsName.values()).some(columnValues => 
          columnValues.some(value => String(data[this.getKeyByValue(this.columnsFilter, value)]).toLowerCase().trim().includes(searchStr))
        );
        return isMatch
      } else {        
          const keys = this.columnsName.keys();
          const keysArray = Array.from(keys);
          const selectedKey = keysArray.find(key => key === this.selectedColumn);
          if (!selectedKey) {
            return false;
          } else {
              isMatch = String(data[selectedKey]).trim().toLowerCase().includes(searchStr);
          }
          return isMatch;
      }
    };
  }
  
  private getKeyByValue(columns: Map<ColumnName, string>, searchValue: string): ColumnName {
    for (const [key, value] of columns.entries()) {
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
      this.dataSource.filter = this.filterValue.trim().toLowerCase();
      this.numberElement = this.dataSource.filteredData.length;
      this.filteredDataChange.emit(this.dataSource);
    }
  }
}