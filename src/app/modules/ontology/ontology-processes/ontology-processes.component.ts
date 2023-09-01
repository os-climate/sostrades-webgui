import { Component, OnInit, ViewChild, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SocketService } from 'src/app/services/socket/socket.service';
import { StudyUpdateParameter } from 'src/app/models/study-update.model';
import { StudyCaseModificationDialogComponent } from '../../study-case/study-case-modification-dialog/study-case-modification-dialog.component';
import { Process } from 'src/app/models/process.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {
  ValidationDialogData,
  StudyCaseModificationDialogData,
  UpdateEntityRightDialogData,
  OntologyProcessInformationDialogData,
  FilterDialogData,
} from 'src/app/models/dialog-data.model';
import { ProcessService } from 'src/app/services/process/process.service';
import { UpdateEntityRightComponent } from '../../entity-right/update-entity-right/update-entity-right.component';
import { EntityResourceRights } from 'src/app/models/entity-right.model';
import { EntityRightService } from 'src/app/services/entity-right/entity-right.service';
import { Observable, Subscription } from 'rxjs';
import { StudyCaseCreationService } from 'src/app/services/study-case/study-case-creation/study-case-creation.service';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { ColumnName } from 'src/app/models/column-name.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';
import { OntologyProcessInformationComponent } from './ontology-process-information/ontology-process-information.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Routing } from 'src/app/models/routing.model';

@Component({
  selector: 'app-ontology-processes',
  templateUrl: './ontology-processes.component.html',
  styleUrls: ['./ontology-processes.component.scss']
})
export class OntologyProcessesComponent implements OnInit, OnDestroy {

  public isLoading: boolean;
  public columnName = ColumnName;
  public displayedColumns = ['processName', 'repositoryName', 'modelUsingProcess', 'action', 'access', 'information'];
  public colummnsFilter = ['All columns', 'Process Name', 'Repository Name'];
  public dataSourceProcess = new MatTableDataSource<Process>();
  public markdownDocumentation: MardownDocumentation;
  public expandedElement: Process;
  public highlightedColor: boolean;
  public processCount: number;
  public fromModelInformation: boolean;
  private routerSubscription: Subscription;
  private processToShowAtStartup: string;

  @Input() dashboard = true;

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceProcess.sort = v;
  }


  @ViewChild('filter', { static: true }) private filterElement: ElementRef;

  @HostListener('document:keydown.control.f', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // Check study component is visible
    if (this.elementRef.nativeElement.offsetParent !== null) {
      // Set focus and select all text in filter
      this.filterElement.nativeElement.focus();
      this.filterElement.nativeElement.setSelectionRange(0, this.processService.processManagementFilter.length);
      event.preventDefault();
    }
  }

  constructor(
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private entityRightService: EntityRightService,
    private studyCaseDataService: StudyCaseDataService,
    private socketService: SocketService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private snackbarService: SnackbarService,
    private studyCreationService: StudyCaseCreationService,
    public ontologyService: OntologyService,
    private router: Router,
    private route: ActivatedRoute,
    public processService: ProcessService) {
    this.isLoading = true;
    this.highlightedColor = false;
    this.markdownDocumentation = null;
    this.processCount = 0;
    this.fromModelInformation = false;
    this.routerSubscription = null;
    this.processToShowAtStartup = null;
  }

  ngOnInit(): void {

    if (this.routerSubscription === null) {

      this.routerSubscription = this.route.queryParams.subscribe(params => {

        // If process is defined has query parameter then we filter and mount the process model information
        if (params.hasOwnProperty('process')) {
          if (params.process !== null && params.process !== undefined) {
            this.fromModelInformation = true;
            this.processToShowAtStartup = params.process;
          }
        }
        this.loadProcessManagementData(false);
      });
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription !== null) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
  }


  loadProcessManagementData(refreshProcess: boolean) {
    this.isLoading = true;
    this.dataSourceProcess = new MatTableDataSource<Process>(null);

    let processCallback: Observable<Process[]> = null;

    if (this.dashboard === true) {
      processCallback = this.processService.getDashboardProcesses();
    } else {
       processCallback = this.processService.getUserProcesses(refreshProcess);
    }

    processCallback.subscribe(processes => {
      this.dataSourceProcess = new MatTableDataSource<Process>(processes);
      this.dataSourceProcess.sortingDataAccessor = (item, property) => {
        return typeof item[property] === 'string' ? item[property].toLowerCase() : item[property];
      };
      this.dataSourceProcess.sort = this.sort;
      this.onFilterChange();
      this.isLoading = false;

      if ((this.fromModelInformation === true) && (this.fromModelInformation !== null)) {
        const searchProcess = this.processService.processManagemenentData.find(
          process => process.processName === this.processToShowAtStartup);
        if (searchProcess !== null && searchProcess !== undefined) {
          this.processToShowAtStartup = null;
          this.fromModelInformation = false;
          this.processService.processManagementFilter = searchProcess.processName;
          this.onFilterChange();
          this.displayDocumentation(searchProcess);
        }
      }

    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      this.processCount = 0;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.onFilterChange();
        this.isLoading = false;
        this.snackbarService.showError('Error loading processes : ' + error.description);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceProcess.filter = filterValue.trim().toLowerCase();
    this.processCount = this.dataSourceProcess.filteredData.length;

  }

  applyFilterAfterReloading() {
    if (this.processService.processManagementFilter.length > 0 && this.processService.processManagementFilter.trim() !== '') {
      this.dataSourceProcess.filter = this.processService.processManagementFilter.trim().toLowerCase();
    } else if (this.ontologyService.processesSelectedValues !== null
      && this.ontologyService.processesSelectedValues !== undefined
      && this.ontologyService.processesSelectedValues.size > 0) {
        this.dataSourceProcess.filter = ' ';
      }
    this.processCount = this.dataSourceProcess.filteredData.length;

  }

  onFilterChange() {
    this.dataSourceProcess.filterPredicate = (data: Process, filter: string): boolean => {
      let isMatch = true;
      if (filter.trim().length > 0) {
        switch (this.processService.processManagementColumnFiltered) {
          case 'Process Name':
            isMatch = data.processName.trim().toLowerCase().includes(filter) || data.processId.trim().toLowerCase().includes(filter);
            break;
          case 'Repository Name':
            isMatch =  data.repositoryName.trim().toLowerCase().includes(filter) || data.repositoryId.trim().toLowerCase().includes(filter);
            break;
          default:
            isMatch =  data.processName.trim().toLowerCase().includes(filter) ||
                data.repositoryName.trim().toLowerCase().includes(filter) ||
                data.processId.trim().toLowerCase().includes(filter) ||
                data.repositoryId.trim().toLowerCase().includes(filter);
        }
      }
      // Filter with selected values received by FilterDialogComponent
      this.ontologyService.processesSelectedValues.forEach((values , key) => {
        if (values.length > 0) {
          switch (key) {
            case ColumnName.PROCESS:
              isMatch = isMatch && values.includes(data.processName);
              break;
            case ColumnName.REPOSITORY:
              isMatch = isMatch && values.includes(data.repositoryName);
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
        this.ontologyService.processesSelectedValues.set(columnName, filter.selectedStringValues);
        // Trigger the dataSourceModelStatus.filterPredicate
        if (this.dataSourceProcess.filter.length > 0) {
          // Apply the previous filter
          this.dataSourceProcess.filter = this.dataSourceProcess.filter;
        } else {
          // Add a string only used to trigger filterPredicate
          this.dataSourceProcess.filter = ' ';
        }
        this.processCount = this.dataSourceProcess.filteredData.length;
      }
    });
  }

  private setPossibleValueByColumn(column: ColumnName): string[] {
    const possibleStringValues = [];
    switch (column) {
      case ColumnName.PROCESS:
        this.processService.processManagemenentData.forEach(process => {
        possibleStringValues.push(process.processName);
          });
        return possibleStringValues;
      case ColumnName.REPOSITORY:
        this.processService.processManagemenentData.forEach(process => {
          if (!possibleStringValues.includes(process.repositoryName)) {

            possibleStringValues.push(process.repositoryName);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
      default:
        return possibleStringValues;
      }
    }

  public hasFilter(column: ColumnName): boolean {
    const bool = this.ontologyService.processesSelectedValues.get(column) !== undefined
                && this.ontologyService.processesSelectedValues.get(column) !== null
                && this.ontologyService.processesSelectedValues.get(column).length > 0;
    return bool;
  }

  processAccess(process: Process) {

    const updateProcessAccessDialogData = new UpdateEntityRightDialogData();
    updateProcessAccessDialogData.ressourceId = process.id;
    updateProcessAccessDialogData.ressourceName = process.processName;
    updateProcessAccessDialogData.resourceType = EntityResourceRights.PROCESS;
    updateProcessAccessDialogData.getEntitiesRightsFunction = this.entityRightService.getProcessEntitiesRights(process.id);

    const dialogRef = this.dialog.open(UpdateEntityRightComponent, {
      disableClose: true,
      data: updateProcessAccessDialogData
    });
  }

  createStudy(process: Process) {
    this.handleUnsavedChanges(changeHandled => {
      if (changeHandled) {
        /**
         * Changes 23/09/2022
         * Give a process instance to have a pre-selected process in the modal
         * Give a 'null' study_id to have not a pre-selected reference in the modal
         */
        this.studyCreationService.showCreateStudyCaseDialog(process);
      }
    });
  }

  displayDocumentation(process: Process) {

    const ontologyProcessInformationDialogData = new OntologyProcessInformationDialogData();
    ontologyProcessInformationDialogData.process = process;

    const dialogref =  this.dialog.open(OntologyProcessInformationComponent, {
      disableClose: false,
      data: ontologyProcessInformationDialogData,
      width: '950px',
      height: '650px',
    });
    dialogref.afterClosed().subscribe(() => {
      /*
        Update 14/09/2022
        Verify url has a additional params
        Change url after close the documentation's modal otherwise the brower reload the documentation's modal.
      */
      if (this.router.url.includes('?process=')) {
        this.router.navigate([Routing.ONTOLOGY, Routing.PROCESSES]);
      }
    });
  }


  handleUnsavedChanges(changeHandled: any) {

    if (this.studyCaseLocalStorageService.studiesHaveUnsavedChanges()) {
      const validationDialogData = new ValidationDialogData();
      validationDialogData.message = `You have made unsaved changes in your study, do you want to revert changes or save your changes?`;
      validationDialogData.buttonOkText = 'Save & Synchronise';


      const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
        disableClose: true,
        width: '500px',
        height: '220px',
        data: validationDialogData
      });

      dialogRefValidate.afterClosed().subscribe(result => {
        const validationData: ValidationDialogData = result as ValidationDialogData;

        if ((validationData !== null) && (validationData !== undefined)) {
          if (validationData.cancel !== true) {
            if (validationData.validate === true) { // Saving changes
              let studyParameters: StudyUpdateParameter[] = [];
              studyParameters = this.studyCaseLocalStorageService
                .getStudyParametersFromLocalStorage(this.studyCaseDataService.loadedStudy.studyCase.id.toString());

              const studyCaseModificatioDialogData = new StudyCaseModificationDialogData();
              studyCaseModificatioDialogData.changes = studyParameters;

              const dialogRefSave = this.dialog.open(StudyCaseModificationDialogComponent, {
                disableClose: true,
                width: '1100px',
                height: '800px',
                panelClass: 'csvDialog',
                data: studyCaseModificatioDialogData
              });

              dialogRefSave.afterClosed().subscribe(resultSave => {
                const resultData: StudyCaseModificationDialogData = resultSave as StudyCaseModificationDialogData;

                if ((resultData !== null) && (resultData !== undefined)) {
                  if (resultData.cancel !== true) {

                    this.studyCaseLocalStorageService.saveStudyChanges(
                      this.studyCaseLocalStorageService.getStudyIdWithUnsavedChanges().toString(),
                      resultData.changes,
                      false,
                      isSaveDone => {
                        if (isSaveDone) {
                          // Send socket notifications
                          // tslint:disable-next-line: max-line-length
                          this.socketService.saveStudy(this.studyCaseLocalStorageService.getStudyIdWithUnsavedChanges(), resultData.changes);
                          changeHandled(true);
                        } else {
                          changeHandled(false);
                        }
                      });
                  } else {
                    changeHandled(false);
                  }
                }
              });

            }
          }
        }
      });
    } else {
      changeHandled(true);
    }
  }
}
