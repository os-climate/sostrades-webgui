import { LoadedStudy } from "src/app/models/study.model";
import { Injectable, EventEmitter } from "@angular/core";
import { combineLatest, Observable} from "rxjs";
import { StudyCaseValidationService } from "../study-case-validation/study-case-validation.service";
import { StudyCaseDataService } from "../study-case/data/study-case-data.service";
import { StudyCaseValidation} from "src/app/models/study-case-validation.model";
import { StudyCaseExecutionObserverService } from "src/app/services/study-case-execution-observer/study-case-execution-observer.service";
import { OntologyService } from "../ontology/ontology.service";
import { SnackbarService } from "../snackbar/snackbar.service";
import { PostOntology } from "src/app/models/ontology.model";
import { TreenodeTools } from "src/app/tools/treenode.tool";
import { CoeditionNotification } from "src/app/models/coedition-notification.model";
import { LoadingStudyDialogService } from "../loading-study-dialog/loading-study-dialog.service";
import { LoadingDialogStep } from "src/app/models/loading-study-dialog.model";

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
    private ontologyService: OntologyService,
    private snackbarService: SnackbarService,
    private studyCaseExecutionObserverService: StudyCaseExecutionObserverService,
    private loadingStudyDialogService:LoadingStudyDialogService

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
    if(this.loadingStudyDialogService.isLoadingOpen()) {
      this.loadingStudyDialogService.updateStep(LoadingDialogStep.LOADING_ONTOLOGY);

      // Assign study to data service
      this.updateStudyCaseDataService(loadedStudy);

      if (isFromCreateStudy) {
        this.studyCaseDataService.getStudies().subscribe((studies) => {
          this.studyCaseDataService.studyManagementData = studies;
        });
      }

      const updateUserPreferences$ = this.studyCaseDataService.loadUserStudyPreferences(loadedStudy.studyCase.id);
      const loadedOntology$ = this.loadOntology(loadedStudy);

      if (loadOnlyOntology) {
        combineLatest([loadedOntology$, updateUserPreferences$]).subscribe({
          next:([, preferences]) => {

            loadedStudy.userStudyPreferences = preferences;
            this.studyCaseDataService.updateParameterOntology(loadedStudy);
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

        combineLatest([loadedOntology$, updateUserPreferences$, loadedNotifications$, loadedValidations$]).subscribe({
          next: ([,preferences, resultnotifications]) => {
            
            loadedStudy.userStudyPreferences = preferences;
            this.studyCaseDataService.updateParameterOntology(loadedStudy);
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
      // Update information of study loaded in the studymanagement page
      const index = this.studyCaseDataService.studyManagementData.findIndex(study => study.id === loadedStudy.studyCase.id);
      if (index !== -1) {
        this.studyCaseDataService.studyManagementData[index] = loadedStudy.studyCase;
      }
    }
  }

  private loadOntology(loadedStudy: LoadedStudy): Observable<void> {
    // Prepare Ontology request inputs
    const ontologyRequest: PostOntology = {
      ontology_request: {
        disciplines: [],
        parameter_usages: [],
      },
    };

    // Extract ontology input data from study
    const root = loadedStudy.treeview.rootNode;
    TreenodeTools.recursiveTreenodeExtract(root, ontologyRequest);

    // Call ontology service
    return this.ontologyService.loadOntologyStudy(ontologyRequest);
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
