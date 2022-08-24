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
  private filter = new FilterDialogData();

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
    this.filter.possibleStringValues =  this.getValueByColumn(columnName);
    this.filter.columnName = columnName;
    if (this.ontologyService.modelStatusSelectedValue.size > 0 && this.ontologyService.modelStatusSelectedValue !== null
       && this.ontologyService.modelStatusSelectedValue !== undefined) {
        this.filter.selectedStringValues = this.ontologyService.modelStatusSelectedValue.get(columnName);
    }

    const dialogref = this.dialog.open(FilterDialogComponent, {
      disableClose: false,
      data: this.filter,
      width: '600px',
      height: '450px',
    });
    dialogref.afterClosed().subscribe(result => {
      if ( result !== undefined && result !== null && result.cancel !== true) {
        this.ontologyService.modelStatusSelectedValue.set(columnName, this.filter.selectedStringValues);
        const filtre = this.dataSourceModelStatus.filter;
        this.dataSourceModelStatus.filter = '.';
        this.dataSourceModelStatus.filter = filtre;
      }
    });
  }

  private getValueByColumn(column: ColumnName) {
    this.filter.possibleStringValues = [];
    let datas =  this.ontologyService.modelStatusData;
    if (this.dataSourceModelStatus.filteredData.length > 0) {
      datas = this.dataSourceModelStatus.filteredData;
    }
    switch (column) {
      case ColumnName.NAME:
        datas.forEach(models => {
        this.filter.possibleStringValues.push(models.name);
          });
        return this.filter.possibleStringValues;
      case ColumnName.CODE_REPOSITORY:
        datas.forEach(models => {
          if (!this.filter.possibleStringValues.includes(models.codeRepository)) {

            this.filter.possibleStringValues.push(models.codeRepository);
            this.filter.possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return this.filter.possibleStringValues;
      default:
        return this.filter.possibleStringValues;
      }
    }

  // private onfilterDialogChange(columnName: any){
  //     this.dataSourceModelStatus.filteredData = this.ontologyService.modelStatusData;
  //     this.filterDict.forEach((value, key) => {
  //       switch (key) {
  //         case ColumnName.NAME:
  //          value.forEach(model => {
  //             const ontologyModel = this.ontologyService.modelStatusData.find( models => models.name === model);
  //             if (!this.ontologyService.modelStatusData.includes(ontologyModel)) {
  //               const index = this.ontologyService.modelStatusData.indexOf(ontologyModel);
  //               this.dataSourceModelStatus.filteredData.splice(index, 1);
  //             }
  //           });

  //         case ColumnName.CODE_REPOSITORY:
  //           value.forEach(model => {
  //             const ontologyModel = this.dataSourceModelStatus.filteredData.filter( models => models.codeRepository === model);
  //             ontologyModel.forEach(models => {
  //               if (!this.ontologyService.modelStatusData.includes(models)) {
  //                 this.dataSourceModelStatus.filteredData.push(models);
  //               } else {
  //                 const index = this.ontologyService.modelStatusData.indexOf(models);
  //                 this.dataSourceModelStatus.filteredData.splice(index, 1);
  //               }
  //             });
  //           });
  //           return  this.ontologyService.modelStatusData;
  //         default:
  //           return  this.ontologyService.modelStatusData;
  //       };
  //     });
  // }

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
    this.dataSourceModelStatus.filter = filterValue.trim().toLowerCase();
    console.log(this.dataSourceModelStatus.filteredData);
    this.modelCount = this.dataSourceModelStatus.filteredData.length;
  }

  applyFilterAfterReloading() {
    this.dataSourceModelStatus.filter = this.ontologyService.modelStatusFilter.trim().toLowerCase();
    this.modelCount = this.dataSourceModelStatus.filteredData.length;
  }

  onFilterChange() {
    this.dataSourceModelStatus.filterPredicate = (
      data: OntologyModelStatus,
      filter: string
    ): boolean => {

      let isMatch = false;

      for (const entry of this.ontologyService.modelStatusSelectedValue.entries()) {
        const mapKey = entry[0];
        const mapValue = entry[1];
        switch (mapKey) {
          case ColumnName.NAME:
            isMatch = isMatch || mapValue.includes(data.name);
            break;
          case ColumnName.CODE_REPOSITORY:
            isMatch = isMatch || mapValue.includes(data.codeRepository);
            break;
        }
        return isMatch;
      }
      // switch (this.ontologyService.modelStatusColumnFiltered) {
      //   case ColumnName.NAME:
      //     return data.name.trim().toLowerCase().includes(filter);
      //   case ColumnName.ID:
      //       return data.id.trim().toLowerCase().includes(filter);
      //   case ColumnName.TYPE:
      //     return data.type.trim().toLowerCase().includes(filter);
      //   case ColumnName.SOURCE:
      //     return data.source.trim().toLowerCase().includes(filter);
      //   case ColumnName.VALIDATED_BY:
      //     return data.validatedBy.trim().toLowerCase().includes(filter);
      //   case ColumnName.CODE_REPOSITORY:
      //     return data.codeRepository.trim().toLowerCase().includes(filter);
      //   default:
      //     return (
      //       data.name.trim().toLowerCase().includes(filter) ||
      //       data.id.trim().toLowerCase().includes(filter) ||
      //       data.type.trim().toLowerCase().includes(filter) ||
      //       data.source.trim().toLowerCase().includes(filter) ||
      //       data.validatedBy.trim().toLowerCase().includes(filter) ||
      //       data.codeRepository.trim().toLowerCase().includes(filter)
      //     );
      // }
    };
    this.applyFilterAfterReloading();
  }
}
