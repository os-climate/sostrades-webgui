import { LoadedStudy } from "src/app/models/study.model";
import { Injectable, EventEmitter } from "@angular/core";
import { combineLatest, Observable, of } from "rxjs";
import { StudyCaseValidationService } from "../study-case-validation/study-case-validation.service";
import { StudyCaseDataService } from "../study-case/data/study-case-data.service";
import { StudyCaseValidation } from "src/app/models/study-case-validation.model";
import {
  StudyCaseExecutionObserverService
} from "src/app/services/study-case-execution-observer/study-case-execution-observer.service";
import { OntologyService } from "../ontology/ontology.service";
import { SnackbarService } from "../snackbar/snackbar.service";
import { CoeditionNotification } from "src/app/models/coedition-notification.model";
import { LoadingStudyDialogService } from "../loading-study-dialog/loading-study-dialog.service";
import { LoadingDialogStep } from "src/app/models/loading-study-dialog.model";
import { DashboardService } from "src/app/services/dashboard/dashboard.service";

@Injectable({
  providedIn: "root",
})
export class StudyCaseLoadingService {
  public onLoadStudy: EventEmitter<LoadedStudy> = new EventEmitter();
  public onLoadreadOnlyStudy: EventEmitter<LoadedStudy> = new EventEmitter();
  public onDisplayLogsNotifications: EventEmitter<boolean>;

  constructor(
    private studyCaseValidationService: StudyCaseValidationService,
    private studyCaseDataService: StudyCaseDataService,
    private dashboardService: DashboardService,
    private ontologyService: OntologyService,
    private snackbarService: SnackbarService,
    private studyCaseExecutionObserverService: StudyCaseExecutionObserverService,
    private loadingStudyDialogService: LoadingStudyDialogService
  ) {
    this.onLoadStudy = null;
    this.onLoadreadOnlyStudy = null;
    this.onDisplayLogsNotifications = new EventEmitter<boolean>();
  }

  /**
   * Do post loading operation to finalize the study
   * @param loadedStudy the loaded study
   * @param isStudyCreated function to do after the study is created
   * @param isFromCreateStudy if it is after creation, update study management data
   * @param loadOnlyOntology load only the ontology and not the logs, validation and notifications,
   */
  public finalizeLoadedStudyCase(
    loadedStudy: LoadedStudy,
    isStudyCreated: any,
    isFromCreateStudy: boolean,
    loadOnlyOntology: boolean
  ): Observable<string> {
    const finalizedLoadedStudyCaseObservable = new Observable<string>(
      () => {
        this._finalizeLoadedStudyCase(
          loadedStudy,
          isStudyCreated,
          isFromCreateStudy,
          loadOnlyOntology
        );
      }
    );
    return finalizedLoadedStudyCaseObservable;
  }

  /**
   * Do post loading operation to finalize the study
   * @param loadedStudy the loaded study
   * @param isStudyCreated function to do after the study is created
   * @param isFromCreateStudy if it is after creation, update study management data
   * @param loadOnlyOntology load only the ontology and not the logs, validation and notifications,
   */
  private _finalizeLoadedStudyCase(
    loadedStudy: LoadedStudy,
    isStudyCreated: any,
    isFromCreateStudy: boolean,
    loadOnlyOntology: boolean
  ) {
    if (this.loadingStudyDialogService.isLoadingOpen()) {
      this.loadingStudyDialogService.updateStep(LoadingDialogStep.LOADING_ONTOLOGY);

      // Assign study to data service
      this.updateStudyCaseDataService(loadedStudy);

      if (isFromCreateStudy) {
        this.studyCaseDataService.getStudies().subscribe((studies) => {
          this.studyCaseDataService.studyManagementData = studies;
        });
      }

      const updateUserPreferences$ = this.studyCaseDataService.loadUserStudyPreferences(loadedStudy.studyCase.id);
      const loadReadOnlyOntology$ = loadedStudy.readOnly ? this.studyCaseDataService.loadSavedOntology(loadedStudy) : of(false);
      loadReadOnlyOntology$.subscribe({
        next: (ontologyUpdated) => {

          if (ontologyUpdated) {
            this.studyCaseDataService.updateParameterOntology(loadedStudy);
          }
          const loadOntology$ = ontologyUpdated ? of(null) : this.ontologyService.loadOntology(loadedStudy);

          if (loadOnlyOntology) {
            combineLatest([loadOntology$, updateUserPreferences$]).subscribe({
              next: ([, preferences]) => {

                loadedStudy.userStudyPreferences = preferences;
                //end loading
                this.terminateStudyCaseLoading(
                  loadedStudy,
                  isStudyCreated
                );
              }
            });
          } else {
            // Load logs

            this.studyCaseDataService.getLog(loadedStudy.studyCase.id);
            this.studyCaseDataService.tradeScenarioList = [];
            const loadedOntology$ = loadedStudy.readOnly ? this.studyCaseDataService.loadSavedOntology(loadedStudy) : this.ontologyService.loadOntology(loadedStudy);

            if (loadOnlyOntology) {
              combineLatest([loadedOntology$, updateUserPreferences$]).subscribe({
                next: ([ontologyUpdated, preferences]) => {

                  loadedStudy.userStudyPreferences = preferences;
                  if (ontologyUpdated) {
                    this.studyCaseDataService.updateParameterOntology(loadedStudy);
                  }
                  //end loading
                  this.terminateStudyCaseLoading(
                    loadedStudy,
                    isStudyCreated
                  );
                }
              });
            } else {

              // Load logs
              this.studyCaseDataService.getLog(loadedStudy.studyCase.id);
              this.studyCaseDataService.tradeScenarioList = [];

              const loadedNotifications$ = this.studyCaseDataService.getStudyNotifications(loadedStudy.studyCase.id);
              const loadedValidations$ = this.loadValidations(loadedStudy.studyCase.id);
              const loadedDashboard$ = this.dashboardService.getDashboard(loadedStudy.studyCase.id)

              combineLatest([loadOntology$, updateUserPreferences$, loadedNotifications$, loadedValidations$, loadedDashboard$]).subscribe({
                next: ([ontologyUpdated, preferences, resultnotifications]) => {

                  loadedStudy.userStudyPreferences = preferences;
                  if (ontologyUpdated) {
                    this.studyCaseDataService.updateParameterOntology(loadedStudy);
                  }
                  this.studyCaseDataService.studyCoeditionNotifications = resultnotifications as CoeditionNotification[];

                  this.studyCaseValidationService.setValidationOnNode(this.studyCaseDataService.loadedStudy.treeview);

                  // End loading
                  this.terminateStudyCaseLoading(loadedStudy, isStudyCreated);
                  this.onDisplayLogsNotifications.emit(true);
                },
                error: (errorReceived) => {
                  // Notify user
                  this.snackbarService.showError(`Error while loading, the following error occurs: ${errorReceived.description}`);
                  this.terminateStudyCaseLoading(loadedStudy, isStudyCreated);
                }
              });
            }
            // Add new study loaded in the studymanagement page without refreshing list
            if (this.studyCaseDataService.studyManagementData.length > 0) {
              this.studyCaseDataService.updateStudyInList(loadedStudy);
            }
          }
        }
      });
    }
  }


  public loadValidations(studyId: number): Observable<StudyCaseValidation[]> {
    return this.studyCaseValidationService.loadStudyValidationData(studyId);
  }

  public updateStudyCaseDataService(loadedStudy: LoadedStudy) {
    const currentLoadedStudy = this.studyCaseDataService.loadedStudy;

    if (currentLoadedStudy !== null && currentLoadedStudy !== undefined) {
      this.studyCaseExecutionObserverService.removeStudyCaseObserver(
        currentLoadedStudy.studyCase.id
      );
    }

    this.studyCaseDataService.setCurrentStudy(loadedStudy);
    this.studyCaseDataService.isLoadedStudyForTreeview(loadedStudy);
  }

  /**
   * FInalize study case loading by emitting according event
   * @param loadedStudy loaded study case
   * @param isStudyLoaded callback regarding loading status
   * @param loadingObserver message observer
   */
  private terminateStudyCaseLoading(
    loadedStudy: LoadedStudy,
    isStudyLoaded: any
  ) {
    const message = "Refreshing study case data";
    this.loadingStudyDialogService.updateStep(LoadingDialogStep.READY);
    this.snackbarService.showInformation(message);

    // Notify components observing study case status
    this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);

    // Execute callback to set studycase loadign status
    isStudyLoaded(true);

    // Complete observer for a further unsubscription
    this.loadingStudyDialogService.closeLoading();
  }
}
