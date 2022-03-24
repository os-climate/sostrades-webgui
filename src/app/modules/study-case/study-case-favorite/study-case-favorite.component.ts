import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { StudyDialogService } from 'src/app/services/study-dialog/study-dialog.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user/user.service';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { NavigationTitle } from 'src/app/models/navigation-title.model';
import { Routing } from 'src/app/models/routing.model';
import { Router } from '@angular/router';



@Component({
  selector: 'app-study-case-favorite',
  templateUrl: './study-case-favorite.component.html',
  styleUrls: ['./study-case-favorite.component.scss']
})
export class StudyCaseFavoriteComponent implements OnInit, OnDestroy {
  public isLoading: boolean
  // tslint:disable-next-line: max-line-length
  public displayedColumns = [
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
  public selection = new SelectionModel<Study>(true, []);

  public dataSourceStudies = new MatTableDataSource<Study>();
  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceStudies.sort = v;
  }
  public favoriteStudyIsEmpty : boolean
  public onFavoriteStudyIsEmptySubscription: Subscription;
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
    private elementRef: ElementRef,
    private router: Router,
    private entityRightService: EntityRightService,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private socketService: SocketService,
    private appDataService: AppDataService,
    private snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService,
    private studyDialogService: StudyDialogService,
    private headerService : HeaderService,
    private userService: UserService
  ) {
    this.isLoading = true;
    this.favoriteStudyIsEmpty = false;
    this.onFavoriteStudyIsEmptySubscription = null
    this.onCurrentStudyDeletedSubscription = null;
    
   
  }

  ngOnInit(): void {
   
      this.loadFavoriteStudy();

    this.onCurrentStudyDeletedSubscription = this.socketService.onCurrentStudyDeleted.subscribe(refreshList => {
      if (refreshList) {
        this.dataSourceStudies = new MatTableDataSource<Study>(this.studyCaseDataService.favoriteStudy);
      }
    });
  }

  ngOnDestroy() {
    if (this.onCurrentStudyDeletedSubscription !== null) {
      this.onCurrentStudyDeletedSubscription.unsubscribe();
      this.onCurrentStudyDeletedSubscription = null;
    }
    if (this.onFavoriteStudyIsEmptySubscription !== null) {
      this.onFavoriteStudyIsEmptySubscription.unsubscribe();
      this.onFavoriteStudyIsEmptySubscription = null;
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

 

  loadFavoriteStudy() {
    this.studyCaseDataService.favoriteStudy = [];
    this.dataSourceStudies = new MatTableDataSource<Study>(null);
    this.studyCaseDataService.getFavoriteStudies().subscribe(
      (studies) => {
         // Retrieving favorite study case list
         if(studies.length<=0){
          this.favoriteStudyIsEmpty = true
           
         }
        
        this.studyCaseDataService.favoriteStudy = studies
        
          this.dataSourceStudies = new MatTableDataSource<Study>(
          this.studyCaseDataService.favoriteStudy
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
        } 
        else {
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
            this.headerService.changeTitle(NavigationTitle.STUDY_WORKSPACE)
          }
        });
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
