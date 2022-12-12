import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { Study } from 'src/app/models/study.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { MatDialog } from '@angular/material/dialog';
import { ValidationDialogData, StudyCaseModificationDialogData, UpdateEntityRightDialogData, EditStudyCaseDialogData, FilterDialogData} from 'src/app/models/dialog-data.model';
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
import { HeaderService } from 'src/app/services/hearder/header.service';
import { StudyCaseEditComponent } from '../study-case-edit/study-case-edit.component';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { StudyCaseCreationService } from 'src/app/services/study-case/study-case-creation/study-case-creation.service';
import { StudyCasePostProcessingService } from 'src/app/services/study-case/post-processing/study-case-post-processing.service';
import { ColumnName } from 'src/app/models/column-name.model';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';
import { ProcessService } from 'src/app/services/process/process.service';
import { Process } from 'src/app/models/process.model';


@Component({
  selector: 'app-study-case-management',
  templateUrl: './study-case-management.component.html',
  styleUrls: ['./study-case-management.component.scss'],
})

export class StudyCaseManagementComponent implements OnInit, OnDestroy {

  @Input() getTitle = false;
  @Input() getOnlyFavoriteStudy = false;
  @Input() getFilter = true;
  @Input() getCreateStudy = true;

  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  public isLoading: boolean;
  public isFavorite: boolean;
  // tslint:disable-next-line: max-line-length
  public displayedColumns = [
    ColumnName.SELECTED,
    ColumnName.FAVORITE,
    ColumnName.NAME,
    ColumnName.GROUP,
    ColumnName.REPOSITORY,
    ColumnName.PROCESS,
    ColumnName.CREATION_DATE,
    ColumnName.MODIFICATION_DATE,
    ColumnName.STATUS,
    ColumnName.ACTION
  ];
  public colummnsFilter = [
    ColumnName.ALL_COLUMNS,
    ColumnName.NAME,
    ColumnName.GROUP,
    ColumnName.REPOSITORY,
    ColumnName.PROCESS,
    ColumnName.TYPE,
    ColumnName.STATUS
  ];
  public selection = new SelectionModel<Study>(true, []);
  public columnName = ColumnName;
  public studyCount: number;
  public dataSourceStudies = new MatTableDataSource<Study>();
  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceStudies.sort = v;
  }
  private filterDialog = new FilterDialogData();


  public onCurrentStudyEditedSubscription: Subscription;
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
    private studyCasePostProcessingService: StudyCasePostProcessingService,
    public groupDataService: GroupDataService,
    private snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService,
    private studyDialogService: StudyDialogService,
    private processService: ProcessService,
    private userService: UserService,
    private studyCreationService: StudyCaseCreationService,
  ) {
    this.isFavorite = true;
    this.isLoading = true;
    this.studyCount = 0;
    this.onCurrentStudyDeletedSubscription = null;
    this.onCurrentStudyEditedSubscription = null;

  }

  ngOnInit(): void {
    if (this.getOnlyFavoriteStudy) {
      // remove selected column from the array
      const selectedColumn = this.displayedColumns.indexOf(ColumnName.SELECTED);
      if (selectedColumn !== -1) {
          this.displayedColumns.splice(selectedColumn, 1);
        }
      this.loadStudyManagementData();
    } else {
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
    }
    this.onCurrentStudyDeletedSubscription = this.socketService.onCurrentStudyDeleted.subscribe(refreshList => {
    if (refreshList) {
      this.loadStudyManagementData();
    }
    });

    this.socketService.onCurrentStudyEdited.subscribe(refreshList => {
      if (refreshList) {
        this.studyCaseLocalStorageService.removeStudiesFromLocalStorage();
        this.loadStudyManagementData();
      }
    });
  }

  ngOnDestroy() {
    if (this.onCurrentStudyDeletedSubscription !== null) {
      this.onCurrentStudyDeletedSubscription.unsubscribe();
      this.onCurrentStudyDeletedSubscription = null;
    }
    if (this.onCurrentStudyEditedSubscription !== null) {
      this.onCurrentStudyEditedSubscription.unsubscribe();
      this.onCurrentStudyEditedSubscription = null;
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

  addOrRemoveFavoriteStudy(study: Study) {
  const userId = this.userService.getCurrentUserId();
  this.isFavorite = false;
  if (!study.isFavorite) {
    this.studyCaseDataService.addFavoriteStudy(study.id, userId).subscribe(
        () => {
          study.isFavorite = true;
          this.isFavorite = true;

        }, error => {
        this.snackbarService.showWarning(error.description);
        this.isFavorite = true;
      });
  } else {
      this.studyCaseDataService.removeFavoriteStudy(study.id, userId).subscribe(
      () => {
        study.isFavorite = false;
        this.isFavorite = true;
      }, error => {
      this.snackbarService.showWarning(error.description);
      this.isFavorite = true;
      });
    }
  }

  loadStudyManagementData() {
    this.isLoading = true;
    this.dataSourceStudies = new MatTableDataSource<Study>(null);

    this.studyCaseDataService.getStudies().subscribe(
      (studies) => {
              // Retrieving study case list
        if (this.getOnlyFavoriteStudy) {
          this.studyCaseDataService.favoriteStudy = studies.filter(study =>
              study.isFavorite === true);
          this.dataSourceStudies = new MatTableDataSource<Study>(
            this.studyCaseDataService.favoriteStudy
          );
        } else {
          this.studyCaseDataService.studyManagementData = studies;
          this.dataSourceStudies = new MatTableDataSource<Study>(
            this.studyCaseDataService.studyManagementData
          );
        }
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
        this.studyCount = 0;
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

  loadStudy(event: MouseEvent, study: Study) {
    if ((event.ctrlKey === true) && (event.altKey === true)) {
      const fileUploadElement = this.fileUpload.nativeElement;
      fileUploadElement.click();
    } else {
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
  }

  createStudy() {
    this.handleUnsavedChanges(changeHandled => {
      if (changeHandled) {
        /**
         * Changes 23/09/2022
         * Call createStudyCase with 'null' as process and 'null' study_name to launch a non process and non reference intialized modal
         */
        this.studyCreationService.showCreateStudyCaseDialog(null, null);
        }
    });
  }

  copyStudy(study: Study) {
    this.handleUnsavedChanges(changeHandled => {
      if (changeHandled) {
        /**
         * Create 02/12/2022
         * Retrieve the process from the study case process_id copied
         * Call createStudyCase with the process and the study_name from the study case copied to launch intialized modal
         */
        let selectedProcess: Process;

        if (this.processService.processManagemenentData === null || this.processService.processManagemenentData === undefined
            || this.processService.processManagemenentData.length === 0) {
          this.loadingDialogService.showLoading(`Retrieving of "${study.process}" in ontology processes list`);
        }
        this.processService.getUserProcesses(false).subscribe( processes => {
          selectedProcess = processes.find(p => p.processId === study.process);
          this.loadingDialogService.closeLoading();
          // Check rights on the process before open createStudyCase modal
          if (selectedProcess.isManager || selectedProcess.isContributor) {
            this.studyCreationService.showCreateStudyCaseDialog(selectedProcess, study.id);
          } else {
            this.snackbarService.showWarning(
              `You cannot copy "${study.name}" beacause you do not have access to the process "${study.process}".`
              );
          }
        });
      }
    });
  }

  updateStudy(study: Study) {


    const dialogData: EditStudyCaseDialogData = new EditStudyCaseDialogData();

    dialogData.studyName = study.name;
    dialogData.groupId = study.groupId;

    const dialogRef = this.dialog.open(StudyCaseEditComponent, {
      disableClose: false,
      width: '400px',
      height: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const editStudyCaseData: EditStudyCaseDialogData = result as EditStudyCaseDialogData;
      if (editStudyCaseData !== null && editStudyCaseData !== undefined) {
        if (editStudyCaseData.cancel === false) {
          // Close study if the loaded study is the same that the study edited
          if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
            if (this.studyCaseDataService.loadedStudy.studyCase.id === study.id) {
              this.studyCaseMainService.closeStudy(true);
            }
          }
          this.loadingDialogService.showLoading(`Updating study ${editStudyCaseData.studyName}. Please wait`);
          this.studyCaseDataService.updateStudy(study.id, editStudyCaseData.studyName, editStudyCaseData.groupId).subscribe(
            studyIsEdited => {
                if (studyIsEdited) {
                this.studyCasePostProcessingService.resetStudyFromCache(study.id).subscribe(() => {
                this.socketService.updateStudy(study.id);
                this.loadingDialogService.closeLoading();
                this.snackbarService.showInformation(`Study ${editStudyCaseData.studyName} has been succesfully updated `);
                this.loadStudyManagementData();
              }, errorReceived => {
                this.snackbarService.showError('Error updating study\n' + errorReceived.description);
                this.loadingDialogService.closeLoading();
              });
            }
          },
            errorReceived => {
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(error.description);
              } else {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(`Error updating study-case: ${error.description}`);
              }
            }
          );
        }
      }
    });
  }


  deleteStudiesValidation(studies: Study[]) {
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
          this.studyCaseDataService.deleteStudy(studies).subscribe(() => {
            /*
            Update 13/09/2022
            Reload favorite study in welcome page when a study is deleted.
            That's prevents the display of all studies after a deletion
            */
            if (this.getOnlyFavoriteStudy) {
              this.loadStudyManagementData();
            }
            // Update table data source
            this.studyCaseDataService.studyManagementData = this.studyCaseDataService.studyManagementData.filter(
              x => !studies.map(s => s.id).includes(x.id));
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

  downloadStudy(event: MouseEvent, study: Study) {

    this.loadingDialogService.showLoading(`Retrieving study case data"${study.name}"`);

    if ((event.ctrlKey === true) && (event.altKey === true)) {
      this.studyCaseMainService
        .getStudyRaw(study.id.toString())
        .subscribe((result) => {
          this.loadingDialogService.closeLoading();
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(result);
          downloadLink.setAttribute('download', study.name);
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
        }
      );
    } else {

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
        }
      );
    }
  }

  public hasFilter(column: ColumnName): boolean {
    const bool = this.studyCaseDataService.studySelectedValues.get(column) !== undefined
                && this.studyCaseDataService.studySelectedValues.get(column) !== null
                && this.studyCaseDataService.studySelectedValues.get(column).length > 0;
    return bool;
  }


  displayFilterDialog(columnName: ColumnName, event) {
    event.stopPropagation();
    event.preventDefault();
    this.filterDialog.possibleStringValues =  this.setPossibleValueByColumn(columnName);
    this.filterDialog.columnName = columnName;

    // Check if the column has filters selected to send them to the component
    if (this.studyCaseDataService.studySelectedValues !== null
    && this.studyCaseDataService.studySelectedValues !== undefined
    && this.studyCaseDataService.studySelectedValues.size > 0) {
        this.filterDialog.selectedStringValues = this.studyCaseDataService.studySelectedValues.get(columnName);
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
        this.studyCaseDataService.studySelectedValues.set(columnName, filter.selectedStringValues);
        // Trigger the dataSourceModelStatus.filterPredicate
        if (this.dataSourceStudies.filter.length > 0) {
          // Apply the previous filter
          this.dataSourceStudies.filter = this.dataSourceStudies.filter;
        } else {
          // Add a string only used to trigger filterPredicate
          this.dataSourceStudies.filter = ' ';
        }
        this.studyCount = this.dataSourceStudies.filteredData.length;
      }
    });
  }

  private setPossibleValueByColumn(column: ColumnName): string[] {
    const possibleStringValues = [];
    switch (column) {
      case ColumnName.NAME:
        this.studyCaseDataService.studyManagementData.forEach(study => {
        possibleStringValues.push(study.name);
          });
        return possibleStringValues;
      case ColumnName.REPOSITORY:
        this.studyCaseDataService.studyManagementData.forEach(study => {
          // Verify not to push duplicate repository
          if (!possibleStringValues.includes(study.repositoryDisplayName)) {
            possibleStringValues.push(study.repositoryDisplayName);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
        case ColumnName.GROUP:
        this.studyCaseDataService.studyManagementData.forEach(study => {
          // Verify to not push duplicate group
          if (!possibleStringValues.includes(study.groupName)) {
            possibleStringValues.push(study.groupName);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;

        case ColumnName.PROCESS:
        this.studyCaseDataService.studyManagementData.forEach(study => {
          // Verify to  not push duplicate process
          if (!possibleStringValues.includes(study.processDisplayName)) {
            possibleStringValues.push(study.processDisplayName);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
        case ColumnName.STATUS:
        this.studyCaseDataService.studyManagementData.forEach(study => {
          // Verify to not push duplicate status
          if (!possibleStringValues.includes(study.executionStatus)) {
            possibleStringValues.push(study.executionStatus);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
      default:
        return possibleStringValues;
      }
    }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.trim().toLowerCase().length > 0) {
      this.dataSourceStudies.filter = filterValue.trim().toLowerCase();
    } else {
    // Add a string only used to trigger filterPredicate
      this.dataSourceStudies.filter = ' ';
    }
    this.studyCount = this.dataSourceStudies.filteredData.length;
  }


  applyFilterAfterReloading() {
    // Check if there are a filter
    if (this.studyCaseDataService.studyManagementFilter.length > 0 && this.studyCaseDataService.studyManagementFilter.trim() !== '') {
      this.dataSourceStudies.filter = this.studyCaseDataService.studyManagementFilter.trim().toLowerCase();
    } else if (this.studyCaseDataService.studySelectedValues !== null
      && this.studyCaseDataService.studySelectedValues !== undefined
      && this.studyCaseDataService.studySelectedValues.size > 0) {
    // Add a string only used to trigger filterPredicate
        this.dataSourceStudies.filter = ' ';
      }
    this.studyCount = this.dataSourceStudies.filteredData.length;
  }

  onFilterChange() {
    if (this.getFilter) {
        this.dataSourceStudies.filterPredicate = (
        data: Study,
        filter: string
      ): boolean => {
        let isMatch = true;
        if (filter.trim().length > 0) {
        switch (this.studyCaseDataService.studyManagementColumnFiltered) {
          case ColumnName.NAME:
            isMatch = data.name.trim().toLowerCase().includes(filter);
            break;
          case ColumnName.GROUP:
            isMatch = data.groupName.trim().toLowerCase().includes(filter);
            break;
          case ColumnName.REPOSITORY:
            isMatch = data.repositoryDisplayName.trim().toLowerCase().includes(filter)
            || data.repository.trim().toLowerCase().includes(filter);
            break;
          case ColumnName.PROCESS:
            isMatch = data.processDisplayName.trim().toLowerCase().includes(filter) || data.process.trim().toLowerCase().includes(filter);
            break;
          case ColumnName.TYPE:
            isMatch = data.studyType.trim().toLowerCase().includes(filter);
            break;
          case ColumnName.STATUS:
            isMatch = data.executionStatus.trim().toLowerCase().includes(filter);
            break;
          default:
            isMatch = (
              data.name.trim().toLowerCase().includes(filter) ||
              data.groupName.trim().toLowerCase().includes(filter) ||
              data.repositoryDisplayName.trim().toLowerCase().includes(filter) ||
              data.repository.trim().toLowerCase().includes(filter) ||
              data.processDisplayName.trim().toLowerCase().includes(filter) ||
              data.process.trim().toLowerCase().includes(filter) ||
              data.studyType.trim().toLowerCase().includes(filter) ||
              data.executionStatus.trim().toLowerCase().includes(filter)
            );
        }
      }
        // Filter with selected values received by FilterDialogComponent
        this.studyCaseDataService.studySelectedValues.forEach((values , key) => {
          if (values.length > 0) {
            switch (key) {
              case ColumnName.NAME:
                isMatch = isMatch && values.includes(data.name);
                break;
              case ColumnName.GROUP:
                isMatch = isMatch && values.includes(data.groupName);
                break;
              case ColumnName.REPOSITORY:
                isMatch = isMatch &&  (values.includes(data.repositoryDisplayName)
                || values.includes(data.repository));
                break;
              case ColumnName.PROCESS:
                isMatch = isMatch && (values.includes(data.processDisplayName)
                || values.includes(data.process));
                break;
              case ColumnName.STATUS:
                isMatch = isMatch && values.includes(data.executionStatus);
                break;
            }
          }
        });
        return isMatch;
      };
        this.applyFilterAfterReloading();
    }
  }
  accessLink(study: Study) {
    this.studyDialogService.showAccessLink(study);
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
              this.snackbarService.showInformation('Changes successfully deleted');
            }
          }
        }
      });
    } else {
      changeHandled(true);
    }
  }


  onSelection(event: any, study: Study) {

    if (event.target.files !== undefined && event.target.files !== null && event.target.files.length > 0) {
      this.loadingDialogService.showLoading(`Upload study case data "${study.name}"`);

      this.studyCaseMainService.uploadStudyRaw(study.id.toString(), event.target.files).subscribe(_ => {
        this.loadingDialogService.closeLoading();
        this.snackbarService.showInformation('Upload successfull');
        if (event.target.files) {
          event.target.value = '';
        }
      }, error => {
        this.loadingDialogService.closeLoading();
        this.snackbarService.showError(error.description);
        if (event.target.files) {
          event.target.value = '';
        }
      });
    }
  }
}
