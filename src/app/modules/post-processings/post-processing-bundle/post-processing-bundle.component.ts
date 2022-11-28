import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { PostProcessingService } from 'src/app/services/post-processing/post-processing.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { PostProcessingBundle } from 'src/app/models/post-processing-bundle.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { LoadStatus } from 'src/app/models/study.model';

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
  public isReadOnlyMode: boolean;
  calculationChangeSubscription: Subscription;
  validationChangeSubscription: Subscription;
  studyStatusChangeSubscription: Subscription;

  constructor(
    private studyCaseDataService: StudyCaseDataService,
    private postProcessingService: PostProcessingService,
    private calculationService: CalculationService,
    private studyCaseValidationService: StudyCaseValidationService,
    private snackbarService: SnackbarService) {
    this.loadingMessage = '';
    this.displayProgressBar = false;
    this.displayHeader = false;
    this.displayFilterButton = false;
    this.displayFilters = false;
    this.calculationChangeSubscription = null;
    this.validationChangeSubscription = null;
    this.studyStatusChangeSubscription = null;
    this.isCalculationRunning = false;
    this.isReadOnlyMode = false;
  }

  ngOnInit() {
    if (this.postProcessingBundle.filters.length > 0) {
      this.displayFilterButton = true;
      if (this.postProcessingBundle.plotly.length === 0 && this.postProcessingBundle.plotlyParetoFront.length === 0 ) {
        this.postProcessingService.pausePostProcessingRequestQueue();
        this.postProcessingService.removePostProcessingRequestFromQueue(this.fullNamespace, this.postProcessingBundle.name);
        this.plot(false);
      }

    } else {
      this.displayFilterButton = false;
    }
    // check the loadStatus of the study to set the mode read only if needed
    if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
      this.isReadOnlyMode = this.studyCaseDataService.loadedStudy.loadStatus === LoadStatus.READ_ONLY_MODE;
    }
    // Update the readonly mode when the status has changed
    this.studyStatusChangeSubscription = this.studyCaseDataService.onLoadedStudyForTreeview.subscribe(loadedStudy => {
        this.isReadOnlyMode = loadedStudy.loadStatus === LoadStatus.READ_ONLY_MODE;
    });
    this.calculationChangeSubscription = this.calculationService.onCalculationChange.subscribe(calculationRunning => {
      this.isCalculationRunning = calculationRunning;
    });
    this.validationChangeSubscription = this.studyCaseValidationService.onValidationChange.subscribe(newValidation => {
      this.plot(false);
    });
  }

  ngOnDestroy() {
    if ((this.calculationChangeSubscription !== null) && (this.calculationChangeSubscription !== undefined)) {
      this.calculationChangeSubscription.unsubscribe();
    }
    if ((this.validationChangeSubscription !== null) && (this.validationChangeSubscription !== undefined)) {
      this.validationChangeSubscription.unsubscribe();
    }
    if ((this.studyStatusChangeSubscription !== null) && (this.studyStatusChangeSubscription !== undefined)) {
      this.studyStatusChangeSubscription.unsubscribe();
    }
  }

  plot(needToUpdate) {
    this.loadingMessage = 'Requesting charts';
    this.displayProgressBar = true;

    // tslint:disable-next-line: max-line-length
    this.postProcessingService.getPostProcessing(
      needToUpdate,
      this.studyCaseDataService.loadedStudy,
      this.fullNamespace,
      this.postProcessingBundle.name,
      this.postProcessingBundle.filters).subscribe(postProcessing => {

        if (postProcessing !== null && postProcessing !== undefined) {
          this.postProcessingBundle.UpdatePlots(postProcessing);
        }
        this.postProcessingService.resumePostProcessingRequestQueue();
        this.displayProgressBar = false;
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
}
