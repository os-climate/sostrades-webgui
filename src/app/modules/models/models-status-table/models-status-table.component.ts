import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { MatTableDataSource } from '@angular/material/table';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { ModelsStatusInformationComponent } from 'src/app/modules/models/models-status-information/models-status-information.component';
import { FilterDialogData, ModelStatusDialogData, OntologyModelsStatusInformationDialogData } from 'src/app/models/dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { OntologyModelStatus } from 'src/app/models/ontology-model-status.model';
import { ModelsStatusDocumentationComponent } from '../models-status-documentation/models-status-documentation.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';
import { ColumnName } from 'src/app/models/column-name.model';
import { HeaderService } from 'src/app/services/hearder/header.service';

@Component({
  selector: 'app-models-status-table',
  templateUrl: './models-status-table.component.html',
  styleUrls: ['./models-status-table.component.scss']
})
export class ModelsStatusTableComponent implements OnInit, OnDestroy {

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
  public hasFilters: boolean;

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
    private route: ActivatedRoute
    ) {
    this.isLoading = true;
    this.modelCount = 0;
    this.fromProcessInformation = false;
    this.routerSubscription = null;
    this.modelToShowAtStartup = null;
    this.hasFilters = false;
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
          this.loadModelStatusData();
        } else {
          this.initDataSource();
        }
        if (this.ontologyService.modelStatusSelectedValues !== null
          && this.ontologyService.modelStatusSelectedValues !== undefined
          && this.ontologyService.modelStatusSelectedValues.size > 0) {
              this.hasFilters = true;
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
      },
      (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.modelCount = 0;
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
  displayFilter(columnName: ColumnName) {
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
      if ( result !== undefined && result !== null && result.cancel !== true) {

        // Set our dictionnary with the value selected
        this.ontologyService.modelStatusSelectedValues.set(columnName, this.filterDialog.selectedStringValues);

        // Trigger the dataSourceModelStatus.filterPredicate
        if (this.dataSourceModelStatus.filter.length > 0) {
          // Apply the previous filter
          this.dataSourceModelStatus.filter = this.dataSourceModelStatus.filter;
        } else {
          // Add a string only used to trigger filterPredicate
          this.dataSourceModelStatus.filter = '.';
        }
        this.hasFilters = true;
        this.modelCount = this.dataSourceModelStatus.filteredData.length;
      }
    });
  }

  private setPossibleValueByColumn(column: ColumnName) {
    this.filterDialog.possibleStringValues = [];
    let datas = [];
    if (this.dataSourceModelStatus.filter.length > 0 && this.dataSourceModelStatus.filter !== '.') {
      datas = this.dataSourceModelStatus.filteredData;
    } else {
      datas = this.ontologyService.modelStatusData;
    }
    switch (column) {
      case ColumnName.NAME:
        datas.forEach(models => {
        this.filterDialog.possibleStringValues.push(models.name);
          });
        return this.filterDialog.possibleStringValues;
      case ColumnName.CODE_REPOSITORY:
        datas.forEach(models => {
          if (!this.filterDialog.possibleStringValues.includes(models.codeRepository)) {

            this.filterDialog.possibleStringValues.push(models.codeRepository);
            this.filterDialog.possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return this.filterDialog.possibleStringValues;
      default:
        return this.filterDialog.possibleStringValues;
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
      const searchModel = this.ontologyService.modelStatusData.find( model => model.name === this.modelToShowAtStartup);
      if (searchModel !== null && searchModel !== undefined) {
        this.modelToShowAtStartup = null;
        this.fromProcessInformation = false;
        this.ontologyService.modelStatusFilter = searchModel.name;
        this.onFilterChange();
        this.displayDocumentation(searchModel);
      }
    }
  }

  displayDocumentation(modelStatus: OntologyModelStatus) {

    const ontologyModelsStatusInformationDialogData = new OntologyModelsStatusInformationDialogData();
    ontologyModelsStatusInformationDialogData.modelStatus = modelStatus;

    const dialogref = this.dialog.open(ModelsStatusDocumentationComponent, {
      disableClose: false,
      data: ontologyModelsStatusInformationDialogData,
      width: '900px',
      height: '650px',
    });
  }

  showDetails(modelStatus: OntologyModelStatus) {
    const modelStatusDialogData: ModelStatusDialogData = new ModelStatusDialogData();
    modelStatusDialogData.processesDict = modelStatus.processesUsingModelList;
    modelStatusDialogData.modelName = modelStatus.name;

    this.dialog.open(ModelsStatusInformationComponent, {
      disableClose: false,
      width: 'auto',
      height: 'auto',
      panelClass: 'csvDialog',
      data: modelStatusDialogData
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.trim().toLowerCase().length > 0) {
      this.dataSourceModelStatus.filter = filterValue.trim().toLowerCase();
    } else {
      this.dataSourceModelStatus.filter = '.';
    }
    this.modelCount = this.dataSourceModelStatus.filteredData.length;
  }

  applyFilterAfterReloading() {
    if (this.ontologyService.modelStatusSelectedValues !== null
      && this.ontologyService.modelStatusSelectedValues !== undefined
      && this.ontologyService.modelStatusSelectedValues.size > 0) {
        this.dataSourceModelStatus.filter = '.';
      } else {
        this.dataSourceModelStatus.filter = this.ontologyService.modelStatusFilter.trim().toLowerCase();
      }
    this.modelCount = this.dataSourceModelStatus.filteredData.length;
  }

  onFilterChange() {
    this.dataSourceModelStatus.filterPredicate = (
      data: OntologyModelStatus,
      filter: string
    ): boolean => {
      let isMatch = true;
      switch (this.ontologyService.modelStatusColumnFiltered) {
        case ColumnName.NAME:
          isMatch = data.name.trim().toLowerCase().includes(filter);
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
          data.name.trim().toLowerCase().includes(filter) ||
          data.id.trim().toLowerCase().includes(filter) ||
          data.type.trim().toLowerCase().includes(filter) ||
          data.source.trim().toLowerCase().includes(filter) ||
          data.validatedBy.trim().toLowerCase().includes(filter) ||
          data.codeRepository.trim().toLowerCase().includes(filter)
        );
    }
      // Filter with selected values received by FilterDialogComponent
      this.ontologyService.modelStatusSelectedValues.forEach((values , key) => {
        switch (key) {
          case ColumnName.NAME:
            isMatch = isMatch && values.includes(data.name);
            break;
          case ColumnName.CODE_REPOSITORY:
            isMatch = isMatch && values.includes(data.codeRepository);
            break;
        }
      });
      // for (const entry of this.ontologyService.modelStatusSelectedValues.entries()) {
      //   const mapKey = entry[0];
      //   const mapValue = entry[1];
      //   switch (mapKey) {
      //     case ColumnName.NAME:
      //       isMatch = isMatch && mapValue.includes(data.name);
      //       break;
      //     case ColumnName.CODE_REPOSITORY:
      //       isMatch = isMatch && mapValue.includes(data.codeRepository);
      //       break;
      //   }
      // }
      return isMatch;
    };
    this.applyFilterAfterReloading();
  }
}
