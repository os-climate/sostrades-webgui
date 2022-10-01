import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { MatTableDataSource } from '@angular/material/table';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { FilterDialogData, OntologyModelsStatusInformationDialogData } from 'src/app/models/dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { OntologyModelStatus } from 'src/app/models/ontology-model-status.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';
import { ColumnName } from 'src/app/models/column-name.model';
import { OntologyModelsInformationComponent } from './ontology-models-information/ontology-models-information.component';
import { Routing } from 'src/app/models/routing.model';

@Component({
  selector: 'app-ontology-models',
  templateUrl: './ontology-models.component.html',
  styleUrls: ['./ontology-models.component.scss']
})
export class OntologyModelsComponent implements OnInit, OnDestroy {

  public visibleColumns = [
    ColumnName.NAME,
    ColumnName.CODE_REPOSITORY,
    ColumnName.PROCESS_USING_MODEL,
    ColumnName.INFORMATION,
    ];

  public columnsFilter = [
    ColumnName.ALL_COLUMNS,
    ColumnName.NAME,
    ColumnName.TYPE,
    ColumnName.SOURCE,
    ColumnName.VALIDATED_BY,
    ColumnName.CODE_REPOSITORY
  ];
  public columnName = ColumnName;
  public dataSourceModelStatus = new MatTableDataSource<OntologyModelStatus>();
  public isLoading: boolean;
  public modelCount: number;
  public fromProcessInformation: boolean;
  private routerSubscription: Subscription;
  private modelToShowAtStartup: string;
  private filterDialog = new FilterDialogData();
  public hasLoadedModels: boolean;


  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceModelStatus.sort = v;
  }

  @ViewChild('filter', { static: true }) private filterElement: ElementRef;

  @HostListener('document:keydown.control.f', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // Check group component is visible
    if (this.elementRef.nativeElement.offsetParent !== null) {
      // Set focus and select all text in filter
      this.filterElement.nativeElement.focus();
      this.filterElement.nativeElement.setSelectionRange(0, this.ontologyService.modelStatusFilter.length);
      event.preventDefault();
    }
  }

  constructor(
    private elementRef: ElementRef,
    public ontologyService: OntologyService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    ) {
    this.isLoading = true;
    this.modelCount = 0;
    this.fromProcessInformation = false;
    this.routerSubscription = null;
    this.modelToShowAtStartup = null;
    this.hasLoadedModels = false;

  }

  ngOnInit(): void {

    this.fromProcessInformation = false;
    this.modelToShowAtStartup = null;

    if (this.routerSubscription === null) {

      this.routerSubscription = this.route.queryParams.subscribe(params => {

        // If model is defined has query parameter then we filter and mount the model model information
        if (params.hasOwnProperty('model')) {
          if (params.model !== null && params.model !== undefined) {
            this.fromProcessInformation = true;
            this.modelToShowAtStartup = params.model;
          }
        }


        // Load data first time component initialised
        if (this.ontologyService.modelStatusData === null
          || this.ontologyService.modelStatusData === undefined
          || this.ontologyService.modelStatusData.length === 0) {
          this.hasLoadedModels = false;
          this.loadModelStatusData();
        } else {
          this.hasLoadedModels = true;
          this.initDataSource();
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

  loadModelStatusData() {
    this.isLoading = true;
    this.ontologyService.modelStatusData = [];
    this.dataSourceModelStatus = new MatTableDataSource<OntologyModelStatus>(null);
    // Retrieving study case list
    this.ontologyService.getOntologyModelsStatus().subscribe(
      (models) => {
        this.ontologyService.modelStatusData = models;
        this.initDataSource();
        this.hasLoadedModels = true;
      },
      (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.modelCount = 0;
        this.hasLoadedModels = false;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.isLoading = false;
          this.snackbarService.showError(
            'Error loading model status list : ' + error.description
          );
        }
      }
    );
  }
  displayFilter(columnName: ColumnName, event) {
    event.stopPropagation();
    event.preventDefault();
    this.filterDialog.possibleStringValues =  this.setPossibleValueByColumn(columnName);
    this.filterDialog.columnName = columnName;

    // Check if the column has filters selected to send them to the component
    if (this.ontologyService.modelStatusSelectedValues !== null
    && this.ontologyService.modelStatusSelectedValues !== undefined
    && this.ontologyService.modelStatusSelectedValues.size > 0) {
        this.filterDialog.selectedStringValues = this.ontologyService.modelStatusSelectedValues.get(columnName);
    }

    const dialogRef = this.dialog.open(FilterDialogComponent, {
      disableClose: false,
      data: this.filterDialog,
      width: '600px',
      height: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      const filter: FilterDialogData = result as FilterDialogData;
      if ( filter !== undefined && filter !== null && filter.cancel !== true) {
        // Set our dictionnary with the value selected
        this.ontologyService.modelStatusSelectedValues.set(columnName, filter.selectedStringValues);
        // Trigger the dataSourceModelStatus.filterPredicate
        if (this.dataSourceModelStatus.filter.length > 0) {
          // Apply the previous filter
          this.dataSourceModelStatus.filter = this.dataSourceModelStatus.filter;
        } else {
          // Add a string only used to trigger filterPredicate
          this.dataSourceModelStatus.filter = ' ';
        }
        this.modelCount = this.dataSourceModelStatus.filteredData.length;
      }
    });
  }

  private setPossibleValueByColumn(column: ColumnName): string[] {
    const possibleStringValues = [];
    switch (column) {
      case ColumnName.NAME:
        this.ontologyService.modelStatusData.forEach(models => {
        possibleStringValues.push(models.label);
          });
        return possibleStringValues;
      case ColumnName.CODE_REPOSITORY:
        this.ontologyService.modelStatusData.forEach(models => {
          if (!possibleStringValues.includes(models.codeRepository)) {

            possibleStringValues.push(models.codeRepository);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
      default:
        return possibleStringValues;
      }
    }

  private initDataSource() {
    this.dataSourceModelStatus = new MatTableDataSource<OntologyModelStatus>(
      this.ontologyService.modelStatusData
    );
    this.dataSourceModelStatus.sortingDataAccessor = (item, property) => {
      return typeof item[property] === 'string'
        ? item[property].toLowerCase()
        : item[property];
    };
    this.dataSourceModelStatus.sort = this.sort;
    // Initialising filter with 'All columns'
    this.onFilterChange();
    this.isLoading = false;

    if ((this.fromProcessInformation === true) && (this.modelToShowAtStartup !== null)) {
      const searchModel = this.ontologyService.modelStatusData.find( model => model.label === this.modelToShowAtStartup);
      if (searchModel !== null && searchModel !== undefined) {
        this.modelToShowAtStartup = null;
        this.fromProcessInformation = false;
        this.ontologyService.modelStatusFilter = searchModel.label;
        this.onFilterChange();
        this.displayDocumentation(searchModel);
      }
    }
  }

  displayDocumentation(modelStatus: OntologyModelStatus) {

    const ontologyModelsStatusInformationDialogData = new OntologyModelsStatusInformationDialogData();
    ontologyModelsStatusInformationDialogData.modelStatus = modelStatus;

    const dialogref = this.dialog.open(OntologyModelsInformationComponent, {
      disableClose: false,
      data: ontologyModelsStatusInformationDialogData,
      width: '1050px',
      height: '650px',
    });
    dialogref.afterClosed().subscribe(() => {
      /*
        Update 14/09/2022
        Verify url has a additional params
        Change url after close the documentation's modal otherwise the brower reload the documentation's modal.
      */
      if (this.router.url.includes('?model=')) {
        this.router.navigate([Routing.ONTOLOGY, Routing.MODELS]);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.trim().toLowerCase().length > 0) {
      this.dataSourceModelStatus.filter = filterValue.trim().toLowerCase();
    } else {
  // Add a string only used to trigger filterPredicate
      this.dataSourceModelStatus.filter = ' ';
    }
    this.modelCount = this.dataSourceModelStatus.filteredData.length;
  }

  applyFilterAfterReloading() {
    // Check if there are filter
    if (this.ontologyService.modelStatusFilter.length > 0 && this.ontologyService.modelStatusFilter.trim() !== '') {
      this.dataSourceModelStatus.filter = this.ontologyService.modelStatusFilter.trim().toLowerCase();
    } else if (this.ontologyService.modelStatusSelectedValues !== null
      && this.ontologyService.modelStatusSelectedValues !== undefined
      && this.ontologyService.modelStatusSelectedValues.size > 0) {
    // Add a string only used to trigger filterPredicate
        this.dataSourceModelStatus.filter = ' ';
      }
    this.modelCount = this.dataSourceModelStatus.filteredData.length;
  }

  hasFilter(column: ColumnName): boolean {
    const bool = this.ontologyService.modelStatusSelectedValues.get(column) !== undefined
                && this.ontologyService.modelStatusSelectedValues.get(column) !== null
                && this.ontologyService.modelStatusSelectedValues.get(column).length > 0;
    return bool;
  }


  onFilterChange() {
    this.dataSourceModelStatus.filterPredicate = (
      data: OntologyModelStatus,
      filter: string
    ): boolean => {
      let isMatch = true;
      if (filter.trim().length > 0) {
      switch (this.ontologyService.modelStatusColumnFiltered) {
        case ColumnName.NAME:
          isMatch = data.label.trim().toLowerCase().includes(filter);
          break;
        case ColumnName.ID:
          isMatch = data.id.trim().toLowerCase().includes(filter);
          break;
        case ColumnName.TYPE:
          isMatch = data.type.trim().toLowerCase().includes(filter);
          break;
        case ColumnName.SOURCE:
          isMatch = data.source.trim().toLowerCase().includes(filter);
          break;
        case ColumnName.VALIDATED_BY:
          isMatch = data.validatedBy.trim().toLowerCase().includes(filter);
          break;
        case ColumnName.CODE_REPOSITORY:
          isMatch = data.codeRepository.trim().toLowerCase().includes(filter);
          break;
        default:
        isMatch = (
          data.label.trim().toLowerCase().includes(filter) ||
          data.id.trim().toLowerCase().includes(filter) ||
          data.type.trim().toLowerCase().includes(filter) ||
          data.source.trim().toLowerCase().includes(filter) ||
          data.validatedBy.trim().toLowerCase().includes(filter) ||
          data.codeRepository.trim().toLowerCase().includes(filter)
        );
      }
    }
      // Filter with selected values received by FilterDialogComponent
      this.ontologyService.modelStatusSelectedValues.forEach((values , key) => {
        if (values.length > 0) {
          switch (key) {
            case ColumnName.NAME:
              isMatch = isMatch && values.includes(data.label);
              break;
            case ColumnName.CODE_REPOSITORY:
              isMatch = isMatch && values.includes(data.codeRepository);
              break;
          }
        }
      });
      return isMatch;
    };
    this.applyFilterAfterReloading();
  }
}
