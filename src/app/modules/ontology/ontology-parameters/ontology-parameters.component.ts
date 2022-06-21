import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { OntologyParameterInformationsDialogData } from 'src/app/models/dialog-data.model';
import { OntologyParameter } from 'src/app/models/ontology-parameter.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { OntologyParameterInformationsComponent } from '../ontology-parameter-informations/ontology-parameter-informations.component';

@Component({
  selector: 'app-ontology-parameters',
  templateUrl: './ontology-parameters.component.html',
  styleUrls: ['./ontology-parameters.component.scss']
})
export class OntologyParametersComponent implements OnInit {

  public isLoading: boolean;
  public hasLoadedParameters: boolean;
  public parameterCount: number;
  public displayedColumns = ['parameterName','parameterNbDisciplines','parameterInfo'];
  public columnsFilter = ['All columns','Parameter Name'];
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
    this.dataSourceParameters.filter = this.ontologyService.parametersFilter.trim().toLowerCase();
    this.parameterCount = this.dataSourceParameters.filteredData.length;
  }

  onFilterChange() {
    this.dataSourceParameters.filterPredicate = (data: OntologyParameter, filter: string): boolean => {

      switch (this.ontologyService.parametersColumnFiltered) {
        case 'Parameter Name':
          return data.label.trim().toLowerCase().includes(filter) || data.id.trim().toLowerCase().includes(filter);
        default:
          return data.label.trim().toLowerCase().includes(filter) || data.id.trim().toLowerCase().includes(filter);
      }
    };
    this.applyFilterAfterReloading();
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
