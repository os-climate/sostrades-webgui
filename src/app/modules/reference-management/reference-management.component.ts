import { ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { ProcessGenerationStatus } from 'src/app/models/reference-generation-status-observer.model';
import { ReferenceGenerationStatus } from 'src/app/models/reference-generation-status.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { Study } from 'src/app/models/study.model';
import { ReferenceGenerationObserverService } from 'src/app/services/reference-generation-observer/reference-generation-observer.service';
import { ReferenceDataService } from 'src/app/services/reference/data/reference-data.service';
import { ReferenceMainService } from 'src/app/services/reference/main/reference-main.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

@Component({
  selector: 'app-reference-management',
  templateUrl: './reference-management.component.html',
  styleUrls: ['./reference-management.component.scss']
})
export class ReferenceManagementComponent implements OnInit, OnDestroy {

  public isAllReferencesRegenerating: boolean;
  public isLoading: boolean;
  // tslint:disable-next-line: max-line-length
  public displayedColumns = [
    'status',
    'name',
    'repository',
    'process',
    'creationDate',
    'actions',
  ];
  public columnsFilter = [
    'All columns',
    'Reference name',
    'Repository',
    'Process',
  ];
  public referenceCount: number;
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
    public referenceMainService: ReferenceMainService,
    private snackbarService: SnackbarService,
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

    this.referenceMainService
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
        this.snackbarService.showError('Error while generating reference ' + study.process + '.' + study.name + ' : ' + refDoneStatus.generationLogs);
        study.isRegeneratingReference = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceReferences.filter = filterValue.trim().toLowerCase();
    this.referenceCount = this.dataSourceReferences.filteredData.length;
  }

  applyFilterAfterReloading() {
    this.dataSourceReferences.filter = this.referenceDataService.referenceManagementFilter.trim().toLowerCase();
    this.referenceCount = this.dataSourceReferences.filteredData.length;
  }

  onFilterChange() {
    this.dataSourceReferences.filterPredicate = (
      data: Study,
      filter: string
    ): boolean => {
      switch (this.referenceDataService.referenceManagementColumnFiltered) {
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
            data.process.trim().toLowerCase().includes(filter) ||
            data.processDisplayName.trim().toLowerCase().includes(filter) ||
            data.studyType.trim().toLowerCase().includes(filter)
          );
      }
    };
    this.applyFilterAfterReloading();
  }

  downloadGenerationLogs(study: Study) {
    let ref_path = study.repository + '.' + study.process + '.' + study.name
    this.referenceDataService.getLogs(ref_path).subscribe(file => {

      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(file);
      downloadLink.setAttribute('download', ref_path + '.log');
      document.body.appendChild(downloadLink);
      downloadLink.click();
    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error downloading log file : No logs found for ' + ref_path + '. You should generate it first.');
      }
    });
  }

}
