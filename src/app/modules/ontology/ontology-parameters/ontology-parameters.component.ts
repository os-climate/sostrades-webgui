import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ColumnName } from 'src/app/models/column-name.model';
import { FilterDialogData, OntologyParameterInformationsDialogData } from 'src/app/models/dialog-data.model';
import { OntologyParameter } from 'src/app/models/ontology-parameter.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';
import { OntologyParameterInformationsComponent } from '../ontology-parameter-informations/ontology-parameter-informations.component';

@Component({
  selector: 'app-ontology-parameters',
  templateUrl: './ontology-parameters.component.html',
  styleUrls: ['./ontology-parameters.component.scss']
})
export class OntologyParametersComponent implements OnInit {

  public isLoading: boolean;
  public columnName = ColumnName;
  public hasLoadedParameters: boolean;
  public parameterCount: number;
  public displayedColumns = ['id','label','nb_disciplines_using_parameter','parameterInfo'];
  public columnsFilter = ['All columns','Parameter ID','Parameter Name'];
  public dataSourceParameters = new MatTableDataSource<OntologyParameter>();

  @Input() dashboard = true;

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceParameters.sort = v;
  }

  @ViewChild('filter', { static: true }) private filterElement: ElementRef;

  @HostListener('document:keydown.control.f', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // Check study component is visible
    if (this.elementRef.nativeElement.offsetParent !== null) {
      // Set focus and select all text in filter
      this.filterElement.nativeElement.focus();
      this.filterElement.nativeElement.setSelectionRange(0, this.ontologyService.parametersFilter.length);
      event.preventDefault();
    }
  }

  constructor(
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private snackbarService: SnackbarService,
    public ontologyService: OntologyService) {
    this.isLoading = false;
    this.hasLoadedParameters = false;
    this.parameterCount = 0;
  }

  ngOnInit(): void {
    
    // Load data first time component initialised
    if (this.ontologyService.parametersData === null
      || this.ontologyService.parametersData === undefined
      || this.ontologyService.parametersData.length === 0) {
        this.hasLoadedParameters = false;
        this.loadOntologyParametersList();
    } else {
      this.hasLoadedParameters = true;
      this.dataSourceParameters = new MatTableDataSource<OntologyParameter>(this.ontologyService.parametersData);
      this.dataSourceParameters.sortingDataAccessor = (item, property) => {
        return typeof item[property] === 'string'
          ? item[property].toLowerCase()
          : item[property];
      };
      this.dataSourceParameters.sort = this.sort;
      // Initialising filter with 'All columns'
      this.onFilterChange();
      this.isLoading = false;
    }
  }

  loadOntologyParametersList() {
    this.isLoading = true;
    this.dataSourceParameters = new MatTableDataSource<OntologyParameter>(null);

    // Retrieving study case list
    this.ontologyService.getParametersList().subscribe(
      (params) => {
        this.ontologyService.parametersData = params;
        // Retrieving parameters list
        this.dataSourceParameters = new MatTableDataSource<OntologyParameter>(
          this.ontologyService.parametersData
        );
        this.dataSourceParameters.sortingDataAccessor = (item, property) => {
          return typeof item[property] === 'string'
            ? item[property].toLowerCase()
            : item[property];
        };
        this.dataSourceParameters.sort = this.sort;
        //sort parameters by ID
        this.dataSourceParameters.data.sort((a: any, b: any) => {
          if (a.id < b.id) {
              return -1;
          } else if (a.id > b.id) {
              return 1;
          } else {
              return 0;
          }
      });
        this.onFilterChange();
        this.isLoading = false;
        this.hasLoadedParameters = true;
      },
      (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.parameterCount = 0;
        this.hasLoadedParameters = false;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.isLoading = false;
          this.snackbarService.showError(
            'Error loading parameters list : ' + error.description
          );
        }
      }
    );


  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceParameters.filter = filterValue.trim().toLowerCase();
    this.parameterCount = this.dataSourceParameters.filteredData.length;
  }

  applyFilterAfterReloading() {
      if (this.ontologyService.parametersFilter.trim().length > 0) {
        this.dataSourceParameters.filter = this.ontologyService.parametersFilter.trim().toLowerCase();
      } else if (this.ontologyService.parametersSelectedValues !== null
        && this.ontologyService.parametersSelectedValues !== undefined
        && this.ontologyService.parametersSelectedValues.size > 0) {
          this.dataSourceParameters.filter = ' ';
        }
    this.parameterCount = this.dataSourceParameters.filteredData.length;
  }

  onFilterChange() {
    this.dataSourceParameters.filterPredicate = (data: OntologyParameter, filter: string): boolean => {
      let isMatch = true;
      if (filter.trim().length > 0){
        switch (this.ontologyService.parametersColumnFiltered) {
          case 'Parameter Name':
            isMatch = data.label.trim().toLowerCase().includes(filter);
            break;
          case 'Parameter ID':
            isMatch =  data.id.trim().toLowerCase().includes(filter);
            break;
          default:
            isMatch = data.label.trim().toLowerCase().includes(filter) || data.id.trim().toLowerCase().includes(filter);
        }
      }
      // Filter with selected values received by FilterDialogComponent
      this.ontologyService.parametersSelectedValues.forEach((values , key) => {
        if (values.length > 0){
          switch (key) {
            case ColumnName.ID:
              isMatch = isMatch && values.includes(data.id);
              break;
            case ColumnName.LABEL:
              isMatch = isMatch && values.includes(data.label);
              break;
          }
        }
      });
      return isMatch;
    };
    this.applyFilterAfterReloading();
  }

  displayFilter(columnName: ColumnName, event) {
    event.stopPropagation();
    event.preventDefault();

    let filterDialog = new FilterDialogData();
    filterDialog.possibleStringValues =  this.setPossibleValueByColumn(columnName);
    filterDialog.columnName = columnName;

    // Check if the column has filters selected to send them to the component
    if (this.hasFilter(columnName)) {
        filterDialog.selectedStringValues = this.ontologyService.processesSelectedValues.get(columnName);
    }

    const dialogRef = this.dialog.open(FilterDialogComponent, {
      disableClose: false,
      data: filterDialog,
      width: '600px',
      height: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      const filter: FilterDialogData = result as FilterDialogData;
      if ( filter !== undefined && filter !== null  && filter.cancel !== true) {
        // Set our dictionnary with the value selected
        this.ontologyService.parametersSelectedValues.set(columnName, filter.selectedStringValues);
        // Trigger the dataSourceModelStatus.filterPredicate
        if (this.dataSourceParameters.filter.length > 0) {
          // Apply the previous filter
          this.dataSourceParameters.filter = this.dataSourceParameters.filter;
        } else {
          // Add a string only used to trigger filterPredicate
          this.dataSourceParameters.filter = ' ';
        }
        this.parameterCount = this.dataSourceParameters.filteredData.length;
      }
    });
  }

  private setPossibleValueByColumn(column: ColumnName): string[] {
    let possibleStringValues = [];
    switch (column) {
      case ColumnName.ID:
        this.ontologyService.parametersData.forEach(param => {
        possibleStringValues.push(param.id);
          });
        return possibleStringValues;
      case ColumnName.LABEL:
        this.ontologyService.parametersData.forEach(param => {
          if (!possibleStringValues.includes(param.label)) {

            possibleStringValues.push(param.label);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
      default:
        return possibleStringValues;
      }
    }

  public hasFilter(column: ColumnName): boolean{
    let bool = this.ontologyService.parametersSelectedValues.get(column) !== undefined
                && this.ontologyService.parametersSelectedValues.get(column) !== null 
                && this.ontologyService.parametersSelectedValues.get(column).length > 0
    return bool;
  }

  OpenParameterInfo(param:OntologyParameter){
    const parameterDialogData: OntologyParameterInformationsDialogData = new OntologyParameterInformationsDialogData()
    parameterDialogData.parameter = param;
    
    this.dialog.open(OntologyParameterInformationsComponent, {
      disableClose: false,
      width: '950px',
      height: '650px',
      autoFocus: false,
      data: parameterDialogData
    });
  }

}
