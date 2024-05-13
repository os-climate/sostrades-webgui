import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ColumnName, Routing } from 'src/app/models/enumeration.model';
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
export class OntologyParametersComponent implements OnInit, OnDestroy {

  public isLoading: boolean;
  public columnName = ColumnName;
  public hasLoadedParameters: boolean;
  public parameterCount: number;
  public fromParameterInformation: boolean;
  private routerSubscription: Subscription;
  private parameterToShowAtStartup: string;
  public displayedColumns = ['id', 'label', 'nb_disciplines_using_parameter', 'parameterInfo'];
  public columnsFilter = [ColumnName.ALL_COLUMNS, 'Parameter ID', 'Parameter Label'];
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
    private router: Router,
    private route: ActivatedRoute,
    public ontologyService: OntologyService) {
    this.isLoading = false;
    this.fromParameterInformation = false;
    this.routerSubscription = null;
    this.parameterToShowAtStartup = null;
    this.hasLoadedParameters = false;
    this.parameterCount = 0;
  }

  ngOnInit(): void {

    if (this.routerSubscription === null) {

      this.routerSubscription = this.route.queryParams.subscribe(params => {

        // If parameter is defined has query parameter then we filter and mount the parameter model information
        if (params.hasOwnProperty('parameter')) {
          if (params.parameter !== null && params.parameter !== undefined) {
            this.fromParameterInformation = true;
            this.parameterToShowAtStartup = params.parameter;
          }
        }
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
          this.checkUrlToShowInformation();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription !== null) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
}

  loadOntologyParametersList() {
    this.isLoading = true;
    this.dataSourceParameters = new MatTableDataSource<OntologyParameter>(null);

    // Retrieving study case list
    this.ontologyService.getParametersList().subscribe({
      next: (params) => {
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
        // sort parameters by ID
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
        this.checkUrlToShowInformation();
      },
      error: (errorReceived) => {
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
    });


  }
  private checkUrlToShowInformation() {
    if ((this.fromParameterInformation === true) && (this.parameterToShowAtStartup !== null)) {
      const searchParameter = this.ontologyService.parametersData.find( parameter =>
        parameter.label === this.parameterToShowAtStartup
        );
      if (searchParameter !== null && searchParameter !== undefined) {
        this.parameterToShowAtStartup = null;
        this.fromParameterInformation = false;
        this.ontologyService.parametersFilter = searchParameter.label;
        this.onFilterChange();
        this.OpenParameterInfo(searchParameter);
      }
    }

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
      if (filter.trim().length > 0) {
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
        if (values.length > 0) {
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

    const filterDialog = new FilterDialogData();
    filterDialog.possibleStringValues =  this.setPossibleValueByColumn(columnName);
    filterDialog.columnName = columnName;

    // Check if the column has filters selected to send them to the component
    if (this.hasFilter(columnName)) {
        filterDialog.selectedStringValues = this.ontologyService.parametersSelectedValues.get(columnName);
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
    const possibleStringValues = [];
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

  public hasFilter(column: ColumnName): boolean {
    const bool = this.ontologyService.parametersSelectedValues.get(column) !== undefined
                && this.ontologyService.parametersSelectedValues.get(column) !== null
                && this.ontologyService.parametersSelectedValues.get(column).length > 0;
    return bool;
  }

  OpenParameterInfo(param: OntologyParameter) {
    const parameterDialogData: OntologyParameterInformationsDialogData = new OntologyParameterInformationsDialogData();
    parameterDialogData.parameter = param;

    const dialogref = this.dialog.open(OntologyParameterInformationsComponent, {
      disableClose: false,
      width: '1000px',
      autoFocus: false,
      data: parameterDialogData
    });
    dialogref.afterClosed().subscribe(() => {
      /*
        Update 14/09/2022
        Verify url has a additional params
        Change url after close the documentation's modal otherwise the brower reload the documentation's modal.
      */
      if (this.router.url.includes('?parameter=')) {
        this.router.navigate([Routing.ONTOLOGY, Routing.ONTOLOGY_PARAMETERS]);
      }
    });
  }

}
