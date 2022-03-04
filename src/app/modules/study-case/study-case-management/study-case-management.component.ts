import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { Study } from 'src/app/models/study.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { MatDialog } from '@angular/material/dialog';
import {
  ValidationDialogData,
  StudyCaseModificationDialogData,
  UpdateEntityRightDialogData,
} from 'src/app/models/dialog-data.model';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MatSort } from '@angular/material/sort';
import { SocketService } from 'src/app/services/socket/socket.service';
import { StudyUpdateParameter } from 'src/app/models/study-update.model';
import { StudyCaseModificationDialogComponent } from '../study-case-modification-dialog/study-case-modification-dialog.component';
import { HostListener } from '@angular/core';
import { EntityResourceRights } from 'src/app/models/entity-right.model';
import { UpdateEntityRightComponent } from '../../entity-right/update-entity-right/update-entity-right.component';
import { EntityRightService } from 'src/app/services/entity-right/entity-right.service';
import { Location } from '@angular/common';
import { StudyDialogService } from 'src/app/services/study-dialog/study-dialog.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user/user.service';


@Component({
  selector: 'app-study-case-management',
  templateUrl: './study-case-management.component.html',
  styleUrls: ['./study-case-management.component.scss'],
})

export class StudyCaseManagementComponent implements OnInit, OnDestroy {
  public isLoading: boolean;
  // tslint:disable-next-line: max-line-length
  public displayedColumns = [
    'selected',
    'favorite',
    'name',
    'groupName',
    'repository',
    'process',
    'creationDate',
    'modificationDate',
    'action'
  ];
  public colummnsFilter = [
    'All columns',
    'Study name',
    'Group name',
    'Repository',
    'Process',
    'Type',
  ];
  public isFavorite : boolean = false;
  public selection = new SelectionModel<Study>(true, []);

  public dataSourceStudies = new MatTableDataSource<Study>();
  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceStudies.sort = v;
  }

  public onCurrentStudyDeletedSubscription: Subscription;

  @ViewChild('filter', { static: true }) private filterElement: ElementRef;

  @HostListener('document:keydown.control.f', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // Check group component is visible
    if (this.elementRef.nativeElement.offsetParent !== null) {
      // Set focus and select all text in filter
      this.filterElement.nativeElement.focus();
      this.filterElement.nativeElement.setSelectionRange(0, this.studyCaseDataService.studyManagementFilter.length);
      event.preventDefault();
    }
  }

  constructor(
    private dialog: MatDialog,
    private location: Location,
    private elementRef: ElementRef,
    private entityRightService: EntityRightService,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private socketService: SocketService,
    private appDataService: AppDataService,
    private snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService,
    private studyDialogService: StudyDialogService,
    private userService: UserService
  ) {
    this.isLoading = true;
    this.onCurrentStudyDeletedSubscription = null;
  }

  ngOnInit(): void {
    
    // Load data first time component initialised
    if (this.studyCaseDataService.studyManagementData === null
      || this.studyCaseDataService.studyManagementData === undefined
      || this.studyCaseDataService.studyManagementData.length === 0) {
      this.loadStudyManagementData();
    } else {
      this.dataSourceStudies = new MatTableDataSource<Study>(
        this.studyCaseDataService.studyManagementData
      );
      this.dataSourceStudies.sortingDataAccessor = (item, property) => {   
        return typeof item[property] === 'string'
          ? item[property].toLowerCase()
          : item[property];        
      };
      this.dataSourceStudies.sort = this.sort;
      // Initialising filter with 'All columns'
      this.onFilterChange();
      this.isLoading = false;
    }

    this.onCurrentStudyDeletedSubscription = this.socketService.onCurrentStudyDeleted.subscribe(refreshList => {
      if (refreshList) {
        this.dataSourceStudies = new MatTableDataSource<Study>(this.studyCaseDataService.studyManagementData);
      }
    });
  }

  ngOnDestroy() {
    if (this.onCurrentStudyDeletedSubscription !== null) {
      this.onCurrentStudyDeletedSubscription.unsubscribe();
      this.onCurrentStudyDeletedSubscription = null;
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceStudies.filteredData.filter(row => row.isManager).length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSourceStudies.filteredData.forEach(row => {
        if (row.isManager) {
          this.selection.select(row);
        }
      });
  }

  addFavoriteStudy(study : Study){
  const userId = this.userService.getCurrentUserId()
    this.studyCaseDataService.addFavoriteStudy(study.id, userId).subscribe(
      (response)=>{
      study.isFavorite = true
      // this.snackbarService.showInformation(`The study "${study.name}" has been successfully added to your favorite study`)
      }, error=>{
      this.snackbarService.showWarning(error.description);
    });
  }
  removeFavoriteStudy(study : Study){
    const userId = this.userService.getCurrentUserId()
    this.studyCaseDataService.removeFavoriteStudy(study.id, userId).subscribe(
      ()=>{
      study.isFavorite = false
      //  this.snackbarService.showInformation(`The study has been successfully removed from your favorite study`)
      }, error=>{
      this.snackbarService.showError(error.description)
    });   
  }

  loadStudyManagementData() {
    this.isLoading = true;

    this.studyCaseDataService.studyManagementData = [];
    this.dataSourceStudies = new MatTableDataSource<Study>(null);

    // Retrieving study case list
    this.studyCaseDataService.getStudies().subscribe(
      (studies) => {
        this.studyCaseDataService.studyManagementData = studies;

        this.dataSourceStudies = new MatTableDataSource<Study>(
          this.studyCaseDataService.studyManagementData
        );
        this.dataSourceStudies.sortingDataAccessor = (item, property) => {
          return typeof item[property] === 'string'
            ? item[property].toLowerCase()
            : item[property];
        };
        this.dataSourceStudies.sort = this.sort;
        this.onFilterChange();
        this.isLoading = false;
      },
      (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.onFilterChange();
          this.isLoading = false;
          this.snackbarService.showError(
            'Error loading study case list\n' + error.description
          );
        }
      }
    );
  }

  loadStudy(study: Study) {
    this.handleUnsavedChanges((changeHandled) => {
      if (changeHandled) {
        // Check user was in an another study before this one and leave room
        if (
          this.studyCaseDataService.loadedStudy !== null &&
          this.studyCaseDataService.loadedStudy !== undefined
        ) {
          this.socketService.leaveRoom(
            this.studyCaseDataService.loadedStudy.studyCase.id
          );
        }

        this.appDataService.loadCompleteStudy(study.id, study.name, (isStudyLoaded) => {
          if (isStudyLoaded) {
            // Joining room
            this.socketService.joinRoom(
              this.studyCaseDataService.loadedStudy.studyCase.id
            );
          }
        });
      }
    });
  }

  deleteStudiesValidation(studies: Study[]) {
    console.log(studies)
    // Warn user is trying to delete current loaded study
    if (
      this.studyCaseDataService.loadedStudy !== null &&
      this.studyCaseDataService.loadedStudy !== undefined
    ) {
      if (studies.map(s => s.id).includes(this.studyCaseDataService.loadedStudy.studyCase.id)) {
        // LoadedStudy selected
        const validationDialogData = new ValidationDialogData();
        validationDialogData.message = `You have selected the study you are working in, do you still want to proceed with deletion ?`;

        const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
          disableClose: true,
          width: '500px',
          height: '220px',
          data: validationDialogData,
        });

        dialogRefValidate.afterClosed().subscribe((result) => {
          const validationData: ValidationDialogData = result as ValidationDialogData;

          if (validationData !== null && validationData !== undefined) {
            if (validationData.cancel === false) {
              this.deleteStudiesFromDatabase(studies);
            }
          }
        });
      } else {
        this.deleteStudiesFromDatabase(studies);
      }
    } else {
      this.deleteStudiesFromDatabase(studies);
    }
  }

  deleteStudiesFromDatabase(studies: Study[]) {
    let isCurrentLoadedStudyDeleted = false;
    if (
      this.studyCaseDataService.loadedStudy !== null &&
      this.studyCaseDataService.loadedStudy !== undefined
    ) {
      isCurrentLoadedStudyDeleted = studies.map(s => s.id).includes(this.studyCaseDataService.loadedStudy.studyCase.id);
    }
    const isSingleDeletion = studies.length === 1;

    const validationDialogData = new ValidationDialogData();
    if (isSingleDeletion) {
      validationDialogData.message = `You are about to delete this study "${studies[0].name}". The study will be removed for all groups and users with whom it is shared, proceed ?`;
    } else {
      validationDialogData.message = `You are about to delete ${this.selection.selected.length} study cases. The study will be removed for all groups and users with whom it is shared, proceed ?`;
    }

    const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,
      width: '550px',
      height: '220px',
      data: validationDialogData,
    });

    dialogRefValidate.afterClosed().subscribe((result) => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if (validationData !== null && validationData !== undefined) {
        if (validationData.cancel === false) {
          // Show adapted loading message
          if (isSingleDeletion) {
            this.loadingDialogService.showLoading(`Deletion of study case "${studies[0].name}"`);
          } else {
            this.loadingDialogService.showLoading(`Deletion of ${studies.length} study cases`);
          }

          // Call API to delete study or studies
          this.studyCaseMainService.deleteStudy(studies).subscribe(() => {
            // Update table data source
            this.studyCaseDataService.studyManagementData = this.studyCaseDataService.studyManagementData.filter(x => !studies.map(s => s.id).includes(x.id));
            this.dataSourceStudies = new MatTableDataSource<Study>(this.studyCaseDataService.studyManagementData);
            // Remove local changes if current loaded study is deleted they exist
            if (isCurrentLoadedStudyDeleted) {
              this.studyCaseLocalStorageService.removeStudiesFromLocalStorage();
            }
            this.selection = new SelectionModel<Study>(true, []);
            this.onFilterChange();

            // Notify other users of deletion
            studies.forEach(study => {
              this.socketService.deleteStudy(study.id);
            });

            this.loadingDialogService.closeLoading();
            if (isSingleDeletion) {
              this.snackbarService.showInformation(`Deletion of study case "${studies[0].name}" successful`);
            } else {
              this.snackbarService.showInformation(`Deletion of ${studies.length} study cases successful`);
            }
          },
            (errorReceived) => {
              this.selection = new SelectionModel<Study>(true, []);
              this.onFilterChange();
              this.loadingDialogService.closeLoading();
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.snackbarService.showError(error.description);
              } else {
                if (isSingleDeletion) {
                  this.snackbarService.showError(`Error deleting study case "${studies[0].name}" : ${error.description}`);
                } else {
                  this.snackbarService.showError(`Error occurred while deleting ${studies.length} study cases : ${error.description}`);
                }
              }
            }
          );
        }
      }
    });
  }

  downloadStudy(study: Study) {
    this.loadingDialogService.showLoading(`Retrieving study case data"${study.name}"`);

    this.studyCaseMainService
      .getStudyZip(study.id.toString())
      .subscribe((result) => {
        this.loadingDialogService.closeLoading();
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(result);
        downloadLink.setAttribute('download', study.name + '.zip');
        document.body.appendChild(downloadLink);
        downloadLink.click();
      }, (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.loadingDialogService.closeLoading();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError(
            `Error downloading study case "${study.name}" : ${error.description}`
          );
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceStudies.filter = filterValue.trim().toLowerCase();
  }

  accessLink(study: Study) {
    this.studyDialogService.showAccessLink(study);
  }

  applyFilterAfterReloading() {
    this.dataSourceStudies.filter = this.studyCaseDataService.studyManagementFilter.trim().toLowerCase();
  }

  onFilterChange() {
    this.dataSourceStudies.filterPredicate = (
      data: Study,
      filter: string
    ): boolean => {
      switch (this.studyCaseDataService.studyManagementColumnFiltered) {
        case 'Study name':
          return data.name.trim().toLowerCase().includes(filter);
        case 'Group name':
          return data.groupName.trim().toLowerCase().includes(filter);
        case 'Repository':
          return data.repositoryDisplayName.trim().toLowerCase().includes(filter) || data.repository.trim().toLowerCase().includes(filter);
        case 'Process':
          return data.processDisplayName.trim().toLowerCase().includes(filter) || data.process.trim().toLowerCase().includes(filter);
        case 'Type':
          return data.studyType.trim().toLowerCase().includes(filter);
        default:
          return (
            data.name.trim().toLowerCase().includes(filter) ||
            data.groupName.trim().toLowerCase().includes(filter) ||
            data.repositoryDisplayName.trim().toLowerCase().includes(filter) ||
            data.repository.trim().toLowerCase().includes(filter) ||
            data.processDisplayName.trim().toLowerCase().includes(filter) ||
            data.process.trim().toLowerCase().includes(filter) ||
            data.studyType.trim().toLowerCase().includes(filter)
          );
      }
    };
    this.applyFilterAfterReloading();
  }

  studyAccess(study: Study) {
    const updateProcessAccessDialogData = new UpdateEntityRightDialogData();
    updateProcessAccessDialogData.ressourceId = study.id;
    updateProcessAccessDialogData.ressourceName = study.name;
    updateProcessAccessDialogData.resourceType = EntityResourceRights.STUDYCASE;
    updateProcessAccessDialogData.getEntitiesRightsFunction = this.entityRightService.getStudyCaseEntitiesRights(study.id);

    const dialogRef = this.dialog.open(UpdateEntityRightComponent, {
      disableClose: true,
      data: updateProcessAccessDialogData
    });
  }

  handleUnsavedChanges(changeHandled: any) {
    if (this.studyCaseLocalStorageService.studiesHaveUnsavedChanges()) {
      const validationDialogData = new ValidationDialogData();
      validationDialogData.message = `You have made unsaved changes in your study, handle changes?`;
      validationDialogData.buttonOkText = 'Save & Synchronise';
      validationDialogData.buttonSecondaryActionText = 'Delete changes';
      validationDialogData.secondaryActionConfirmationNeeded = true;

      const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
        disableClose: true,
        width: '500px',
        height: '220px',
        data: validationDialogData,
      });

      dialogRefValidate.afterClosed().subscribe((result) => {
        const validationData: ValidationDialogData = result as ValidationDialogData;

        if (validationData !== null && validationData !== undefined) {
          if (validationData.cancel !== true) {
            if (validationData.validate === true) {
              // Saving changes
              let studyParameters: StudyUpdateParameter[] = [];
              studyParameters = this.studyCaseLocalStorageService.getStudyParametersFromLocalStorage(
                this.studyCaseLocalStorageService
                  .getStudyIdWithUnsavedChanges()
                  .toString()
              );

              const studyCaseModificatioDialogData = new StudyCaseModificationDialogData();
              studyCaseModificatioDialogData.changes = studyParameters;

              const dialogRefSave = this.dialog.open(
                StudyCaseModificationDialogComponent,
                {
                  disableClose: true,
                  width: '1100px',
                  height: '800px',
                  panelClass: 'csvDialog',
                  data: studyCaseModificatioDialogData,
                }
              );

              dialogRefSave.afterClosed().subscribe((resultSave) => {
                const resultData: StudyCaseModificationDialogData = resultSave as StudyCaseModificationDialogData;

                if (resultData !== null && resultData !== undefined) {
                  if (resultData.cancel !== true) {
                    this.studyCaseLocalStorageService.saveStudyChanges(
                      this.studyCaseLocalStorageService
                        .getStudyIdWithUnsavedChanges()
                        .toString(),
                      resultData.changes,
                      false,
                      (isSaveDone) => {
                        if (isSaveDone) {
                          // Send socket notifications
                          // tslint:disable-next-line: max-line-length
                          this.socketService.saveStudy(
                            this.studyCaseLocalStorageService.getStudyIdWithUnsavedChanges(),
                            resultData.changes
                          );
                          changeHandled(true);
                        } else {
                          changeHandled(false);
                        }
                      }
                    );
                  } else {
                    changeHandled(false);
                  }
                }
              });
            } else {
              this.studyCaseLocalStorageService.removeStudiesFromLocalStorage();
              this.snackbarService.showInformation('Changes successfully deleted')
            }
          }
        }
      });
    } else {
      changeHandled(true);
    }
  }
}
