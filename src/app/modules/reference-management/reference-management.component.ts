import { ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { ColumnName } from 'src/app/models/column-name.model';
import { FilterDialogData } from 'src/app/models/dialog-data.model';
import { ProcessGenerationStatus } from 'src/app/models/reference-generation-status-observer.model';
import { ReferenceGenerationStatus } from 'src/app/models/reference-generation-status.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { Study } from 'src/app/models/study.model';
import { ReferenceGenerationObserverService } from 'src/app/services/reference-generation-observer/reference-generation-observer.service';
import { ReferenceDataService } from 'src/app/services/reference/data/reference-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';

@Component({
  selector: 'app-reference-management',
  templateUrl: './reference-management.component.html',
  styleUrls: ['./reference-management.component.scss']
})
export class ReferenceManagementComponent implements OnInit, OnDestroy {

  public isAllReferencesRegenerating: boolean;
  public isLoading: boolean;
  public columnName = ColumnName;

  // tslint:disable-next-line: max-line-length
  public displayedColumns = [
    ColumnName.REGENERATION_STATUS,
    ColumnName.NAME,
    ColumnName.REPOSITORY,
    ColumnName.PROCESS,
    ColumnName.CREATION_DATE,
    ColumnName.ACTION,
  ];
  public columnsFilter = [
    ColumnName.ALL_COLUMNS,
    ColumnName.NAME,
    ColumnName.PROCESS,
    ColumnName.REPOSITORY,
    ColumnName.REGENERATION_STATUS
  ];
  public referenceCount: number;
  private filterDialog = new FilterDialogData();
  public dataSourceReferences = new MatTableDataSource<Study>();
  private referenceGenerationDoneSubscription: Subscription;
  private referenceGenerationUpdateSubscription: Subscription;

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceReferences.sort = v;
  }

  @ViewChild('filter', { static: true }) private filterElement: ElementRef;

  @HostListener('document:keydown.control.f', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // Check group component is visible
    if (this.elementRef.nativeElement.offsetParent !== null) {
      // Set focus and select all text in filter
      this.filterElement.nativeElement.focus();
      this.filterElement.nativeElement.setSelectionRange(0, this.referenceDataService.referenceManagementFilter.length);
      event.preventDefault();
    }
  }

  constructor(
    private elementRef: ElementRef,
    public studyCaseDataService: StudyCaseDataService,
    public referenceDataService: ReferenceDataService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private referenceGenerationObserverService: ReferenceGenerationObserverService
  ) {
    this.isLoading = true;
    this.isAllReferencesRegenerating = false;
    this.referenceGenerationDoneSubscription = null;
    this.referenceGenerationUpdateSubscription = null;
    this.referenceCount = 0;
  }

  ngOnInit(): void {

    // Load data first time component initialised
    if (this.referenceDataService.referenceManagementData === null
      || this.referenceDataService.referenceManagementData === undefined
      || this.referenceDataService.referenceManagementData.length === 0) {
      this.loadReferenceManagementData();
    } else {
      this.dataSourceReferences = new MatTableDataSource<Study>(
        this.referenceDataService.referenceManagementData
      );
      this.dataSourceReferences.sortingDataAccessor = (item, property) => {
        return typeof item[property] === 'string'
          ? item[property].toLowerCase()
          : item[property];
      };
      this.dataSourceReferences.sort = this.sort;
      // Initialising filter with 'All columns'
      this.onFilterChange();
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.cleanExecutionSubscriptions();
  }

  cleanExecutionSubscriptions() {
    if (this.referenceGenerationDoneSubscription !== null) {
      this.referenceGenerationDoneSubscription.unsubscribe();
      this.referenceGenerationDoneSubscription = null;
    }
    if (this.referenceGenerationUpdateSubscription !== null) {
      this.referenceGenerationUpdateSubscription.unsubscribe();
      this.referenceGenerationUpdateSubscription = null;
    }
  }

  loadReferenceManagementData() {
    this.isLoading = true;
    this.cleanExecutionSubscriptions();

    this.referenceDataService.referenceManagementData = [];
    this.dataSourceReferences = new MatTableDataSource<Study>(null);

    this.referenceDataService.getReferences().subscribe(
      (refs) => {
        refs.forEach((ref) => {
          this.referenceDataService.referenceManagementData.push(ref);
          if (ref.isRegeneratingReference) {
            this.subscribeToRegeneration(ref.regenerationId, ref);
            this.referenceGenerationObserverService.startStudyCaseExecutionObserver(ref.regenerationId);
          }
        });

        this.dataSourceReferences = new MatTableDataSource<Study>(this.referenceDataService.referenceManagementData);
        this.dataSourceReferences.sortingDataAccessor = (item, property) => {
          return typeof item[property] === 'string'
            ? item[property].toLowerCase()
            : item[property];
        };
        this.dataSourceReferences.sort = this.sort;
        this.onFilterChange();
        this.isLoading = false;
      },
      (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.referenceCount = 0;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.onFilterChange();
          this.isLoading = false;
          this.snackbarService.showError(
            'Error loading reference list : ' + error.description
          );
        }
      }
    );
  }

  regenerateReference(study: Study) {
    study.isRegeneratingReference = true;

    this.referenceDataService
      .reGenerateReference(study.repository, study.process, study.name)
      .subscribe(
        (refGenId) => {
          this.snackbarService.showInformation(`Reference regeneration started for ${study.process}.${study.name}`);
          this.referenceGenerationObserverService.startStudyCaseExecutionObserver(refGenId);
          this.subscribeToRegeneration(refGenId, study);
        }, (errorReceived) => {
          const error = errorReceived as SoSTradesError;
          // tslint:disable-next-line: max-line-length
          this.snackbarService.showError(`Reference regeneration failed for ${study.process}.${study.name} with error ${error.description}`);
          study.isRegeneratingReference = false;
          study.regenerationStatus = 'FAILED';
          study.creationDate = null;
        });
  }

  private subscribeToRegeneration(refGenId: number, study: Study) {
    const refGenObserver = this.referenceGenerationObserverService.getReferenceGenerationObserver(refGenId);
    // End of the generation
    this.referenceGenerationUpdateSubscription = refGenObserver.regenerationUpdate.subscribe(refUpdate => {
      const refUpdateStatus = refUpdate as ReferenceGenerationStatus;
      study.regenerationStatus = refUpdateStatus.referenceGenerationStatus;
    });

    this.referenceGenerationDoneSubscription = refGenObserver.regenerationDone.subscribe(refDone => {
      const refDoneStatus = refDone as ReferenceGenerationStatus;
      study.regenerationStatus = refDoneStatus.referenceGenerationStatus;
      study.creationDate = new Date();
      if (refDoneStatus.referenceGenerationStatus === ProcessGenerationStatus.STATUS_FINISHED) {
        this.snackbarService.showInformation('Generation of ' + study.process + '.' + study.name + ' reference done.');
        if (study.studyType === 'Usecase') {
          study.studyType = 'Reference';
        }
        study.isRegeneratingReference = false;
      } else {
        this.snackbarService.showError(
          'Error while generating reference ' + study.process + '.' + study.name + ' : ' + refDoneStatus.generationLogs
          );
        study.isRegeneratingReference = false;
      }
      this.referenceGenerationObserverService.removeReferenceGenerationObserver(study.id);
    });
  }
  hasFilter(column: ColumnName): boolean {
    const bool = this.referenceDataService.referenceSelectedValues.get(column) !== undefined
                && this.referenceDataService.referenceSelectedValues.get(column) !== null
                && this.referenceDataService.referenceSelectedValues.get(column).length > 0;
    return bool;
  }

  displayFilter(columnName: ColumnName, event) {
    event.stopPropagation();
    event.preventDefault();
    this.filterDialog.possibleStringValues =  this.setPossibleValueByColumn(columnName);
    this.filterDialog.columnName = columnName;

    // Check if the column has filters selected to send them to the component
    if (this.referenceDataService.referenceSelectedValues !== null
    && this.referenceDataService.referenceSelectedValues !== undefined
    && this.referenceDataService.referenceSelectedValues.size > 0) {
        this.filterDialog.selectedStringValues = this.referenceDataService.referenceSelectedValues.get(columnName);
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
        this.referenceDataService.referenceSelectedValues.set(columnName, filter.selectedStringValues);
        // Trigger the dataSourceModelStatus.filterPredicate
        if (this.dataSourceReferences.filter.length > 0) {
          // Apply the previous filter
          this.dataSourceReferences.filter = this.dataSourceReferences.filter;
        } else {
          // Add a string only used to trigger filterPredicate
          this.dataSourceReferences.filter = ' ';
        }
        this.referenceCount = this.dataSourceReferences.filteredData.length;
      }
    });
  }

  private setPossibleValueByColumn(column: ColumnName): string[] {
    const possibleStringValues = [];
    switch (column) {
      case ColumnName.REGENERATION_STATUS:
        this.referenceDataService.referenceManagementData.forEach(reference => {
          // Verify to not push duplicate status
          if (!possibleStringValues.includes(reference.regenerationStatus)) {
            possibleStringValues.push(reference.regenerationStatus);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
      case ColumnName.NAME:
        this.referenceDataService.referenceManagementData.forEach(reference => {
        // Verify to not push duplicate name
        if (!possibleStringValues.includes(reference.name)) {
          possibleStringValues.push(reference.name);
          possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
            }
        });
        return possibleStringValues;
      case ColumnName.REPOSITORY:
        this.referenceDataService.referenceManagementData.forEach(reference => {
          // Verify to not push duplicate repository
          if (!possibleStringValues.includes(reference.repositoryDisplayName)) {
            possibleStringValues.push(reference.repositoryDisplayName);
            possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
              }
          });
        return possibleStringValues;
        case ColumnName.PROCESS:
        this.referenceDataService.referenceManagementData.forEach(reference => {
          // Verify to  not push duplicate process
          if (!possibleStringValues.includes(reference.processDisplayName)) {
            possibleStringValues.push(reference.processDisplayName);
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
      this.dataSourceReferences.filter = filterValue.trim().toLowerCase();
    } else {
    // Add a string only used to trigger filterPredicate
      this.dataSourceReferences.filter = ' ';
    }
    this.referenceCount = this.dataSourceReferences.filteredData.length;
  }

  applyFilterAfterReloading() {
    // Check if there are filter
    if (this.referenceDataService.referenceManagementFilter.length > 0
      && this.referenceDataService.referenceManagementFilter.trim() !== '') {
      this.dataSourceReferences.filter = this.referenceDataService.referenceManagementFilter.trim().toLowerCase();
    } else if (this.referenceDataService.referenceSelectedValues !== null
      && this.referenceDataService.referenceSelectedValues !== undefined
      && this.referenceDataService.referenceSelectedValues.size > 0) {
    // Add a string only used to trigger filterPredicate
        this.dataSourceReferences.filter = ' ';
      }
    this.referenceCount = this.dataSourceReferences.filteredData.length;
  }

  onFilterChange() {
    this.dataSourceReferences.filterPredicate = (
      data: Study,
      filter: string
    ): boolean => {
      let isMatch = true;
      if (filter.trim().length > 0) {
        switch (this.referenceDataService.referenceManagementColumnFiltered) {
          case ColumnName.REGENERATION_STATUS:
            isMatch = data.regenerationStatus.trim().toLowerCase().includes(filter);
            break;
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
          default:
            isMatch = (
              data.regenerationStatus.trim().toLowerCase().includes(filter) ||
              data.name.trim().toLowerCase().includes(filter) ||
              data.groupName.trim().toLowerCase().includes(filter) ||
              data.repositoryDisplayName.trim().toLowerCase().includes(filter) ||
              data.repository.trim().toLowerCase().includes(filter) ||
              data.process.trim().toLowerCase().includes(filter) ||
              data.processDisplayName.trim().toLowerCase().includes(filter) ||
              data.studyType.trim().toLowerCase().includes(filter)
            );
        }
      }
      // Filter with selected values received by FilterDialogComponent
      this.referenceDataService.referenceSelectedValues.forEach((values , key) => {
        if (values.length > 0) {
          switch (key) {
            case ColumnName.REGENERATION_STATUS:
              isMatch = isMatch && values.includes(data.regenerationStatus);
              break;
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
          }
        }
      });
      return isMatch;
    };
    this.applyFilterAfterReloading();
  }

  downloadGenerationLogs(study: Study) {
    const refPath = study.repository + '.' + study.process + '.' + study.name;
    this.referenceDataService.getLogs(refPath).subscribe(file => {

      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(file);
      downloadLink.setAttribute('download', refPath + '.log');
      document.body.appendChild(downloadLink);
      downloadLink.click();
    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error downloading log file : No logs found for ' + refPath + '. You should generate it first.');
      }
    });
  }

}
