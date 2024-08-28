import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { PostProcessingService } from 'src/app/services/post-processing/post-processing.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { PostProcessingBundle } from 'src/app/models/post-processing-bundle.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { LoadStatus } from 'src/app/models/study.model';
import { PanelSection } from 'src/app/models/user-study-preferences.model';
import { FormControl } from '@angular/forms';
import { PostProcessingFilter } from 'src/app/models/post-processing-filter.model';

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
  public isCalculationRunning: boolean;
  public isReadOnlyMode: boolean;
  public additionalDisciplineName: string;
  public chartsFiltered: FormControl;
  private filter: any
  protected onDestroy = new Subject<void>();
  calculationChangeSubscription: Subscription;
  validationChangeSubscription: Subscription;
  studyStatusChangeSubscription: Subscription;
  postProcessingWithSection: any[] = [];
  postProcessingWithoutSection: any[] = [];

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
    this.calculationChangeSubscription = null;
    this.validationChangeSubscription = null;
    this.studyStatusChangeSubscription = null;
    this.isCalculationRunning = false;
    this.isReadOnlyMode = false;
    this.additionalDisciplineName = '';
    this.chartsFiltered = new FormControl('');
    this.filter = null;
  }

  ngOnInit() {
    if (this.postProcessingBundle.filters.length > 0) {
      this.displayFilterButton = true;
      if (this.postProcessingBundle.plotly.length === 0 && this.postProcessingBundle.plotlyParetoFront.length === 0 ) {
        this.postProcessingService.pausePostProcessingRequestQueue();
        this.postProcessingService.removePostProcessingRequestFromQueue(this.fullNamespace, this.postProcessingBundle.name);
        this.plot(false);
      }
      this.addSectionInPostProcessing(this.postProcessingBundle.plotly, false);
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
    this.validationChangeSubscription = this.studyCaseValidationService.onValidationChange.subscribe(() => {
      this.plot(false);
    });

    // show the discipline label if there are 2 or more discipline with the same model at the same node
    if(this.postProcessingBundle.name !== this.postProcessingBundle.disciplineName && this.postProcessingBundle.disciplineName !== '' 
    && this.postProcessingBundle.showDisciplineName) {
      this.additionalDisciplineName = ` : ${this.postProcessingBundle.disciplineName}`
    }
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
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  plot(needToUpdate) {
    this.loadingMessage = 'Requesting charts';
    this.displayProgressBar = true;

    // eslint-disable-next-line max-len
    this.postProcessingService.getPostProcessing(
      needToUpdate,
      this.studyCaseDataService.loadedStudy,
      this.postProcessingBundle.disciplineName,
      this.postProcessingBundle.name,
      this.postProcessingBundle.filters).subscribe({
        next: (postProcessing) => {
          if (postProcessing !== null && postProcessing !== undefined) {
            this.postProcessingBundle.UpdatePlots(postProcessing);
          }
          this.postProcessingService.resumePostProcessingRequestQueue();
          this.displayProgressBar = false;
          this.addSectionInPostProcessing(postProcessing, needToUpdate);
        },
        error: (errorReceived) => {
          const error = errorReceived as SoSTradesError;
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.displayProgressBar = false;
            this.postProcessingService.resumePostProcessingRequestQueue();
            this.snackbarService.showError('Error loading charts : ' + error.description);
          }
        }
      });    
  }

  private addSectionInPostProcessing(postProcessing: any, needToUpdate:boolean ) {
    
    const postProcessingWithoutSectionWithFilter: PostProcessingBundle[] = [];
    // Create a dictionnary to section the post_processing by a name
    const postProcessingBundleSectionned = new Map<string, PostProcessingBundle[]>();
    postProcessing.forEach(plotly => {     
      if (plotly.post_processing_section_name) {
        // Check if key "post_processing_section_name" already exist
        if (!postProcessingBundleSectionned.has(plotly.post_processing_section_name)) {
          postProcessingBundleSectionned.set(plotly.post_processing_section_name, []);
        }
        // Add ploty on the section
        postProcessingBundleSectionned.get(plotly.post_processing_section_name)?.push(plotly);
      } else {
        // Check if need to update 
        if (needToUpdate) {
          postProcessingWithoutSectionWithFilter.push(plotly);
        } else {
          this.postProcessingWithoutSection.push(plotly);
        }
      }
    });

    // Replace the new array with filter on postProcessingWithoutSection
    if (postProcessingWithoutSectionWithFilter.length > 0) {
      this.postProcessingWithoutSection = postProcessingWithoutSectionWithFilter
    }  
    // Create a array with post_processing sectionned
    this.postProcessingWithSection = Array.from(postProcessingBundleSectionned, ([post_processing_section_name, plots]) => ({ post_processing_section_name, plots }));
    if (this.postProcessingWithSection.length > 0) {
      this.postProcessingWithSection.sort((a: any, b: any) => {
        if (a.post_processing_section_name < b.post_processing_section_name) {
            return -1;
        } else if (a.post_processing_section_name > b.post_processing_section_name) {
            return 1;
        } else {
            return 0;
        }
      });
    }
    // Listen for search field value changes
    this.chartsFiltered.valueChanges.pipe(takeUntil(this.onDestroy))
    .subscribe((value) => {
      this.filterValues(value)
    });
  }

  passfilter(event, filter: PostProcessingFilter): void {
    event.stopPropagation();
    this.filter = filter
  }

  public isExpand(section: string) {
      const id = `${this.postProcessingBundle.disciplineName}.${PanelSection.POST_PROCESSING_SECTION}.${section}`;
    return this.studyCaseDataService.getUserStudyPreference(id, false);

  }

  public setIsExpand(section: string, isExpand: boolean) {
    if (this.isExpand(section) != isExpand)//save data only if necessary
    {
      const id = `${this.postProcessingBundle.disciplineName}.${PanelSection.POST_PROCESSING_SECTION}.${section}`;
      this.studyCaseDataService.setUserStudyPreference(id, isExpand).subscribe();
    }
  }

  protected filterValues(value: string) {
    if (!value) {
      this.filter.filteredValues = this.filter.filterValues;
      return;
    } else {
      value = value.toLowerCase();
    }
    // filter values
    this.filter.filteredValues = this.filter.filterValues.filter(
      search => search.toString().toLowerCase().indexOf(value) > -1
    )        
  }     
  
 }