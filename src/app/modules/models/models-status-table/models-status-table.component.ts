import { Component, OnInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { MatTableDataSource } from '@angular/material/table';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { ModelsStatusInformationComponent } from 'src/app/modules/models/models-status-information/models-status-information.component';
import { ModelStatusDialogData, OntologyModelsStatusInformationDialogData } from 'src/app/models/dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { OntologyModelStatus } from 'src/app/models/ontology-model-status.model';
import { ModelsStatusDocumentationComponent } from '../models-status-documentation/models-status-documentation.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-models-status-table',
  templateUrl: './models-status-table.component.html',
  styleUrls: ['./models-status-table.component.scss']
})
export class ModelsStatusTableComponent implements OnInit, OnDestroy {

  public visibleColumns = [
    'name',
    'codeRepository',
    'processUsingModel',
    'information',
    ];

  public columnsFilter = [
    'All columns',
    'Model Name',
    'Type',
    'Source',
    'Validated By',
    'Code Repository'
  ];

  public dataSourceModelStatus = new MatTableDataSource<OntologyModelStatus>();
  public isLoading: boolean;
  public modelCount: number;
  public fromProcessInformation: boolean;
  private routerSubscription: Subscription;
  private modelToShowAtStartup: string;

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

    if (this.routerSubscription === null) {

      this.routerSubscription = this.route.queryParams.subscribe(params => {

        // Load data first time component initialised
        if (this.ontologyService.modelStatusData === null
          || this.ontologyService.modelStatusData === undefined
          || this.ontologyService.modelStatusData.length === 0) {
          this.loadModelStatusData();
        } else {
          this.initDataSource();
        }

        // If model is defined has query parameter then we filter and mount the model model information
        if (params.hasOwnProperty('model')) {
          if (params.model !== null && params.model !== undefined) {
            this.fromProcessInformation = true;
            this.modelToShowAtStartup = params.model;
            const searchModel = this.ontologyService.modelStatusData.find( model => model.name === params.model);
            if (searchModel !== null && searchModel !== undefined) {
              this.ontologyService.modelStatusFilter = searchModel.name;
              this.displayDocumentation(searchModel);
            }
          }
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
      switch (this.ontologyService.modelStatusColumnFiltered) {
        case 'Model name':
          return data.name.trim().toLowerCase().includes(filter);
        case 'Id':
            return data.id.trim().toLowerCase().includes(filter);
        case 'Type':
          return data.type.trim().toLowerCase().includes(filter);
        case 'Source':
          return data.source.trim().toLowerCase().includes(filter);
        case 'Validated By':
          return data.validatedBy.trim().toLowerCase().includes(filter);
        case 'Code Repository':
          return data.codeRepository.trim().toLowerCase().includes(filter);
        default:
          return (
            data.name.trim().toLowerCase().includes(filter) ||
            data.id.trim().toLowerCase().includes(filter) ||
            data.type.trim().toLowerCase().includes(filter) ||
            data.source.trim().toLowerCase().includes(filter) ||
            data.validatedBy.trim().toLowerCase().includes(filter) ||
            data.codeRepository.trim().toLowerCase().includes(filter)
          );
      }
    };
    this.applyFilterAfterReloading();
  }


}
