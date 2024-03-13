import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { CalculationDashboard } from 'src/app/models/calculation-dashboard.model';
import { ValidationDialogData } from 'src/app/models/dialog-data.model';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { MatSort } from '@angular/material/sort';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { StudyCaseExecutionExceptionDialogComponent } from '../study-case-execution-exception-dialog/study-case-execution-exception-dialog.component';


@Component({
  selector: 'app-study-case-execution-management',
  templateUrl: './study-case-execution-management.component.html',
  styleUrls: ['./study-case-execution-management.component.scss']
})
export class StudyCaseExecutionManagementComponent implements OnInit {

  public isLoading: boolean;
  public displayedColumns = ['name', 'studyCaseExecutionId', 'repository', 'process', 'creationDate', 'username', 'executionStatus', 'action'];
  public colummnsFilter = ['All columns', 'Study name', 'Username', 'Repository', 'Process'];
  public columnsFilterSelected: string;
  public dataSourceDashboard = new MatTableDataSource<CalculationDashboard>();
  public calculationDashboardList: CalculationDashboard[];

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceDashboard.sort = v;
  }

  constructor(
    private dialog: MatDialog,
    private loadingDialogService: LoadingDialogService,
    private calculationService: CalculationService,
    private snackbarService: SnackbarService) {
    this.columnsFilterSelected = 'All columns';
    this.isLoading = true;
    this.calculationDashboardList = [];
  }

  ngOnInit(): void {
    // Initialising filter with 'All columns'
    this.onFilterChange();

    this.calculationService.getDashboard().subscribe({
      next: (res) => {
        this.calculationDashboardList = res;
        this.dataSourceDashboard = new MatTableDataSource<CalculationDashboard>(this.calculationDashboardList);
        this.dataSourceDashboard.sortingDataAccessor = (item, property) => {
          return typeof item[property] === 'string' ? item[property].toLowerCase() : item[property];
        };
        this.dataSourceDashboard.sort = this.sort;
        this.isLoading = false;
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading execution dashboard information : ' + error.description);
        }
      }
    });
  }

  stopStudyExecution(calculation: CalculationDashboard) {

    const validationDialogData = new ValidationDialogData();
    validationDialogData.message = `You are about to stop execution of study ${calculation.name} execution n° ${calculation.studyCaseExecutionId}, proceed ?`;

    const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,
      width: '500px',
      height: '220px',
      data: validationDialogData
    });

    dialogRefValidate.afterClosed().subscribe(result => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if ((validationData !== null) && (validationData !== undefined)) {
        if (validationData.cancel === false) {
          // Stop Execution
          this.loadingDialogService.showLoading(`Stopping execution of study case "${calculation.name}"`);
          this.calculationService.stop(calculation.studyCaseId, calculation.studyCaseExecutionId).subscribe({
            next: (res) => {
              calculation.executionStatus = "STOPPED";
              this.loadingDialogService.closeLoading();
              this.snackbarService.showInformation(`Execution of study case ${calculation.name} execution n° ${calculation.studyCaseExecutionId} has been successfully stopped`);
            },
            error: (errorReceived) => {
              this.loadingDialogService.closeLoading();
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.snackbarService.showError(error.description);
              } else {
                this.snackbarService.showError('Error stopping execution : ' + error.description);
              }
            }
          });
        }
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDashboard.filter = filterValue.trim().toLowerCase();
  }

  onFilterChange() {
    this.dataSourceDashboard.filterPredicate = (data: CalculationDashboard, filter: string): boolean => {

      switch (this.columnsFilterSelected) {
        case 'Study name':
          return data.name.trim().toLowerCase().includes(filter);
        case 'Username':
          return data.username.trim().toLowerCase().includes(filter);
        case 'Repository':
          return data.repository.trim().toLowerCase().includes(filter) ||
                  data.repositoryDisplayName.trim().toLowerCase().includes(filter);
        case 'Process':
          return data.process.trim().toLowerCase().includes(filter) ||
                  data.processDisplayName.trim().toLowerCase().includes(filter);
        default:
          return data.name.trim().toLowerCase().includes(filter) ||
            data.username.trim().toLowerCase().includes(filter) ||
            data.repository.trim().toLowerCase().includes(filter) ||
            data.repositoryDisplayName.trim().toLowerCase().includes(filter) ||
            data.processDisplayName.trim().toLowerCase().includes(filter);
      }
    };
  }

  showLogs(calculation: CalculationDashboard) {

    this.calculationService.getExecutionLogs(calculation.studyCaseId, calculation.studyCaseExecutionId).subscribe(logs => {

      const message = logs.map(log => log.message).join('\n');

      const dialogRef = this.dialog.open(StudyCaseExecutionExceptionDialogComponent, {
        disableClose: false,
        width: '80vw',
        height: '80vh',
        panelClass: 'csvDialog',
        data: message
      });
    });
  }

  downloadRawLogs(calculation: CalculationDashboard) {


    this.calculationService.getExecutionRawLogs(calculation.studyCaseId, calculation.studyCaseExecutionId).subscribe({
      next: (file) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(file);
        downloadLink.setAttribute('download', `raw-sc${calculation.studyCaseId}-sce${calculation.studyCaseExecutionId}-logs.log`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error downloading raw log file :  No raw logs found for this study.');
        }
      }
    });    
  }



  deleteStudyExecution(calculation: CalculationDashboard) {

    this.calculationService.deleteStudycaseExecutionEntry(calculation.studyCaseId, calculation.studyCaseExecutionId).subscribe({
      next: (_) => {
        this.calculationDashboardList = this.calculationDashboardList.filter(x => x.studyCaseExecutionId !== calculation.studyCaseExecutionId);
        this.dataSourceDashboard = new MatTableDataSource<CalculationDashboard>(this.calculationDashboardList);
        this.snackbarService.showInformation('Entry successfully deleted');
      },
      error: (error) => {
        this.snackbarService.showError(error);
      }
    });
  }
}
