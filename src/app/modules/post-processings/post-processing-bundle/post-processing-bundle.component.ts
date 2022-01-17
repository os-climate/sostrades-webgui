import { Component, OnInit, OnDestroy, Input, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { PostProcessingService } from 'src/app/services/post-processing/post-processing.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { PostProcessingBundle } from 'src/app/models/post-processing-bundle.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { StudyCaseValidationDialogData } from 'src/app/models/dialog-data.model';
import { ValidationType, ValidationState } from 'src/app/models/study-case-validation.model';
import { StudyCaseValidationDialogComponent } from '../../study-case/study-case-validation-dialog/study-case-validation-dialog.component';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { MatDialog } from '@angular/material/dialog';
import { CalculationService } from 'src/app/services/calculation/calculation.service';

@Component({
  selector: 'app-post-processing-bundle',
  templateUrl: './post-processing-bundle.component.html',
  styleUrls: ['./post-processing-bundle.component.scss']
})
export class PostProcessingBundleComponent implements OnInit, OnDestroy {

  @Input() postProcessingBundle: PostProcessingBundle;
  @Input() fullNamespace: string;

  public loadingMessage: string;
  public displayProgressBar: boolean;
  public displayHeader: boolean;
  public displayFilterButton: boolean;
  public displayFilters: boolean;
  public isCalculationRunning: boolean;
  public isDisciplineGraphValidated: boolean;
  calculationChangeSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseValidationService: StudyCaseValidationService,
    private postProcessingService: PostProcessingService,
    private calculationService: CalculationService,
    private snackbarService: SnackbarService) {
    this.loadingMessage = '';
    this.displayProgressBar = false;
    this.displayHeader = false;
    this.displayFilterButton = false;
    this.displayFilters = false;
    this.calculationChangeSubscription = null;
    this.isCalculationRunning = false;
    this.isDisciplineGraphValidated = false;
  }

  ngOnInit() {
    if (this.postProcessingBundle.filters.length > 0) {
      this.displayFilterButton = true;

      if (this.postProcessingBundle.plotly.length === 0 && this.postProcessingBundle.plotlyParetoFront.length === 0) {
        this.postProcessingService.pausePostProcessingRequestQueue();
        this.postProcessingService.removePostProcessingRequestFromQueue(this.fullNamespace, this.postProcessingBundle.name);
        this.plot();
      }

    } else {
      this.displayFilterButton = false;
    }

    this.calculationChangeSubscription = this.calculationService.onCalculationChange.subscribe(calculationRunning => {
      this.isCalculationRunning = calculationRunning;
    });

    if (this.studyCaseValidationService.studyGraphValidationDict !== null && this.studyCaseValidationService.studyGraphValidationDict !== undefined) {
      if (this.studyCaseValidationService.studyGraphValidationDict.hasOwnProperty(`${this.fullNamespace}.${this.postProcessingBundle.name}`)) {
        if (this.studyCaseValidationService.studyGraphValidationDict[`${this.fullNamespace}.${this.postProcessingBundle.name}`][0].validationState == ValidationState.VALIDATED) {
          this.isDisciplineGraphValidated = true;
        }
      }
    }
  }

  ngOnDestroy() {
    if ((this.calculationChangeSubscription !== null) && (this.calculationChangeSubscription !== undefined)) {
      this.calculationChangeSubscription.unsubscribe();
    }
  }

  plot() {
    this.loadingMessage = 'Requesting charts';
    this.displayProgressBar = true;

    // tslint:disable-next-line: max-line-length
    this.postProcessingService.getPostProcessing(
      this.studyCaseDataService.loadedStudy,
      this.fullNamespace,
      this.postProcessingBundle.name,
      this.postProcessingBundle.filters).subscribe(postProcessing => {

        if (postProcessing !== null && postProcessing !== undefined) {
          this.postProcessingBundle.UpdatePlots(postProcessing);
        }
        this.postProcessingService.resumePostProcessingRequestQueue();
        this.displayProgressBar = false;
        this.calculationService.getLog(this.studyCaseDataService.loadedStudy.studyCase.id);
      }, errorReceived => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.displayProgressBar = false;
          this.postProcessingService.resumePostProcessingRequestQueue();
          this.snackbarService.showError('Error loading charts : ' + error.description);
        }
      });
  }

  onClickGraphValidation(event) {
    event.stopPropagation();
    event.preventDefault();


    const dialogData: StudyCaseValidationDialogData = new StudyCaseValidationDialogData();
    dialogData.disciplineName = this.postProcessingBundle.name;
    dialogData.namespace = this.fullNamespace;
    dialogData.validationType = ValidationType.GRAPH
    if (this.isDisciplineGraphValidated) {
      dialogData.validationState = ValidationState.VALIDATED
    } else {
      dialogData.validationState = ValidationState.NOT_VALIDATED
    }

    dialogData.validationList = this.studyCaseValidationService.studyGraphValidationDict[`${this.fullNamespace}.${this.postProcessingBundle.name}`];

    const dialogRefValidate = this.dialog.open(StudyCaseValidationDialogComponent, {
      disableClose: true,
      width: '1100px',
      height: '800px',
      panelClass: 'csvDialog',
      data: dialogData
    });

    dialogRefValidate.afterClosed().subscribe(result => {
      const resultData: StudyCaseValidationDialogData = result as StudyCaseValidationDialogData;

      if ((resultData !== null) && (resultData !== undefined)) {
        if (resultData.cancel !== true) {
          this.isDisciplineGraphValidated = !this.isDisciplineGraphValidated;
        }
      }
    });
  }

}
