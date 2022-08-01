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

@Component({
  selector: 'app-models-status-table',
  templateUrl: './models-status-table.component.html',
  styleUrls: ['./models-status-table.component.scss']
})
export class ModelsStatusTableComponent implements OnInit {

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
  public onSearchModelStatusSubscription: Subscription;
  public fromProcessInformation: boolean;

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
    ) {
    this.isLoading = true;
    this.modelCount = 0;
    this.onSearchModelStatusSubscription = null;
    this.fromProcessInformation = false;
  }

  ngOnInit(): void {

    // Load data first time component initialised
    if (this.ontologyService.modelStatusData === null
      || this.ontologyService.modelStatusData === undefined
      || this.ontologyService.modelStatusData.length === 0) {
      this.loadModelStatusData();
    } else {
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
        console.log(models.length);
        // Retrieving references list
        this.dataSourceModelStatus = new MatTableDataSource<OntologyModelStatus>(
          this.ontologyService.modelStatusData
        );
        this.dataSourceModelStatus.sortingDataAccessor = (item, property) => {
          return typeof item[property] === 'string'
            ? item[property].toLowerCase()
            : item[property];
        };
        this.dataSourceModelStatus.sort = this.sort;
        this.onFilterChange();
        this.isLoading = false;
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
