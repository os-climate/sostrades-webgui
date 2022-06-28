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
} from 'src/app/models/dialog-data.model';
import { ProcessService } from 'src/app/services/process/process.service';
import { UpdateEntityRightComponent } from '../../entity-right/update-entity-right/update-entity-right.component';
import { EntityResourceRights } from 'src/app/models/entity-right.model';
import { EntityRightService } from 'src/app/services/entity-right/entity-right.service';
import { Observable, Subscription } from 'rxjs';
import { StudyCaseCreationService } from 'src/app/services/study-case/study-case-creation/study-case-creation.service';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { ProcessInformationComponent } from '../process-information/process-information.component';

@Component({
  selector: 'app-process-management',
  templateUrl: './process-management.component.html',
  styleUrls: ['./process-management.component.scss']
})
export class ProcessManagementComponent implements OnInit, OnDestroy {

  public isLoading: boolean;
  public displayedColumns = ['processName', 'repositoryName', 'action', 'access', 'information'];
  public colummnsFilter = ['All columns', 'Process Name', 'Repository Name'];
  public dataSourceProcess = new MatTableDataSource<Process>();
  public markdownDocumentation: MardownDocumentation;
  public expandedElement: Process;
  public highlightedColor: boolean;

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
    public processService: ProcessService) {
    this.isLoading = true;
    this.highlightedColor = false;
    this.markdownDocumentation = null;
  }

  ngOnInit(): void {
    this.loadProcessManagementData(false);
  }

  ngOnDestroy() {
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

    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
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
  }

  applyFilterAfterReloading() {
    this.dataSourceProcess.filter = this.processService.processManagementFilter.trim().toLowerCase();
  }

  onFilterChange() {
    this.dataSourceProcess.filterPredicate = (data: Process, filter: string): boolean => {
      switch (this.processService.processManagementColumnFiltered) {
        case 'Process Name':
          return data.processName.trim().toLowerCase().includes(filter) || data.processId.trim().toLowerCase().includes(filter);
        case 'Repository Name':
          return data.repositoryName.trim().toLowerCase().includes(filter) || data.repositoryId.trim().toLowerCase().includes(filter);
        default:
          return data.processName.trim().toLowerCase().includes(filter) ||
              data.repositoryName.trim().toLowerCase().includes(filter) ||
              data.processId.trim().toLowerCase().includes(filter) ||
              data.repositoryId.trim().toLowerCase().includes(filter);
      }
    };
    this.applyFilterAfterReloading();
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
        this.studyCreationService.creatStudyCaseFromProcess(process);
      }
    });
  }

  displayDocumentation(process: Process) {

    const ontologyProcessInformationDialogData = new OntologyProcessInformationDialogData();
    ontologyProcessInformationDialogData.process = process;

    this.dialog.open(ProcessInformationComponent, {
      disableClose: false,
      data: ontologyProcessInformationDialogData,
      width: '950px',
      height: '650px',
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
