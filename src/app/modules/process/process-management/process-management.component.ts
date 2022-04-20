import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
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
import { PostStudy } from 'src/app/models/study.model';
import {
  ValidationDialogData,
  StudyCaseModificationDialogData,
  UpdateEntityRightDialogData,
  ProcessCreateStudyDialogData
} from 'src/app/models/dialog-data.model';
import { ProcessService } from 'src/app/services/process/process.service';
import { UpdateEntityRightComponent } from '../../entity-right/update-entity-right/update-entity-right.component';
import { EntityResourceRights } from 'src/app/models/entity-right.model';
import { EntityRightService } from 'src/app/services/entity-right/entity-right.service';
import { ProcessStudyCaseCreationComponent } from '../process-study-case-creation/process-study-case-creation.component';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-process-management',
  templateUrl: './process-management.component.html',
  styleUrls: ['./process-management.component.scss']
})
export class ProcessManagementComponent implements OnInit {

  public isLoading: boolean;
  public displayedColumns = ['processName', 'repositoryName', 'action', 'access'];
  public colummnsFilter = ['All columns', 'Process Name', 'Repository Name'];
  public dataSourceProcess = new MatTableDataSource<Process>();

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
    private loadingDialogService: LoadingDialogService,
    private appDataService: AppDataService,
    private entityRightService: EntityRightService,
    private StudyCaseDataService: StudyCaseDataService,
    private StudyCaseMainService: StudyCaseMainService,
    private socketService: SocketService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private snackbarService: SnackbarService,
    public processService: ProcessService) {
    this.isLoading = true;
  }

  ngOnInit(): void {
    this.loadProcessManagementData();
  }

  loadProcessManagementData() {
    this.isLoading = true;
    this.dataSourceProcess = new MatTableDataSource<Process>(null);

    let processCallback: Observable<Process[]> = null;

    if (this.dashboard === true) {
      processCallback = this.processService.getDashboardProcesses();
    } else {
      processCallback = this.processService.getUserProcesses();
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

        const dialogData: ProcessCreateStudyDialogData = new ProcessCreateStudyDialogData();
        dialogData.processName = process.processName;
        dialogData.referenceList = process.referenceList;
        dialogData.processId = process.processId;
        dialogData.repositoryId = process.repositoryId;

        const dialogRef = this.dialog.open(ProcessStudyCaseCreationComponent, {
          disableClose: true,
          data: dialogData
        });

        dialogRef.afterClosed().subscribe(result => {
          const resultCreateStudyRef = result as ProcessCreateStudyDialogData;

          if ((resultCreateStudyRef !== null) && (resultCreateStudyRef !== undefined)) {

            if (resultCreateStudyRef.cancel === false && resultCreateStudyRef.studyName !== '' && resultCreateStudyRef.groupId !== null) {
              if (resultCreateStudyRef.studyType === 'Reference') {
                this.createFromReference(
                  process,
                  resultCreateStudyRef.studyName,
                  resultCreateStudyRef.groupId,
                  resultCreateStudyRef.reference,
                  resultCreateStudyRef.studyType);
              } else if (resultCreateStudyRef.studyType === 'Study') {
                this.createFromCopyStudy(
                  resultCreateStudyRef.studyId,
                  resultCreateStudyRef.studyName,
                  resultCreateStudyRef.groupId);
              } else if (resultCreateStudyRef.studyType === 'UsecaseData') {
                this.createFromUsesaseData(
                  process,
                  resultCreateStudyRef.studyName,
                  resultCreateStudyRef.groupId,
                  resultCreateStudyRef.reference,
                  resultCreateStudyRef.studyType);
              }
            }
          }
        });
      }
    });
  }
  createFromUsesaseData(process, name: string, group: number, reference: string, type: string) {
    const study: PostStudy = {
      name,
      repository: process.repositoryId,
      process: process.processId,
      group,
      reference,
      type
    };
    // Check user was in an another study before this one and leave room
    if (this.StudyCaseDataService.loadedStudy !== null && this.StudyCaseDataService.loadedStudy !== undefined) {
      this.socketService.leaveRoom(this.StudyCaseDataService.loadedStudy.studyCase.id);
    }

    this.appDataService.createCompleteStudy(study, isStudyCreated => {
      if (isStudyCreated) {
        // Joining room
        this.socketService.joinRoom(this.StudyCaseDataService.loadedStudy.studyCase.id);
      }
    });
  }

  createFromReference(process, name, group, reference, type) {
    const study: PostStudy = {
      name,
      repository: process.repositoryId,
      process: process.processId,
      group,
      reference,
      type
    };

    // Check user was in an another study before this one and leave room
    if (this.StudyCaseDataService.loadedStudy !== null && this.StudyCaseDataService.loadedStudy !== undefined) {
      this.socketService.leaveRoom(this.StudyCaseDataService.loadedStudy.studyCase.id);
    }

    this.appDataService.createCompleteStudy(study, isStudyCreated => {
      if (isStudyCreated) {
        // Joining room
        this.socketService.joinRoom(this.StudyCaseDataService.loadedStudy.studyCase.id);
      }
    });
  }

  createFromCopyStudy(studyId: number, studyName: string, groupId: number) {

    this.appDataService.copyCompleteStudy(studyId, studyName, groupId, isStudyCreated => {
      if (isStudyCreated) {
        // Joining room
        this.socketService.joinRoom(this.StudyCaseDataService.loadedStudy.studyCase.id);
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
                .getStudyParametersFromLocalStorage(this.StudyCaseDataService.loadedStudy.studyCase.id.toString());

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
