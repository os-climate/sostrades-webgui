import { LoadedStudy, LoadStatus } from "src/app/models/study.model";
import { Injectable, EventEmitter } from "@angular/core";
import { delay, map } from "rxjs/operators";
import { combineLatest, Observable, Observer, Subscriber } from "rxjs";
import { StudyCaseValidationService } from "../study-case-validation/study-case-validation.service";
import { StudyCaseDataService } from "../study-case/data/study-case-data.service";
import {
  StudyCaseValidation,
  ValidationTreeNodeState,
} from "src/app/models/study-case-validation.model";
import { StudyCaseExecutionObserverService } from "src/app/services/study-case-execution-observer/study-case-execution-observer.service";
import { OntologyService } from "../ontology/ontology.service";
import { SnackbarService } from "../snackbar/snackbar.service";
import { LoadingDialogService } from "../loading-dialog/loading-dialog.service";
import { PostOntology } from "src/app/models/ontology.model";
import { TreenodeTools } from "src/app/tools/treenode.tool";
import { SocketService } from "../socket/socket.service";
import { CoeditionNotification } from "src/app/models/coedition-notification.model";
import { SelectComponent } from "src/app/shared/select/select.component";

@Injectable({
  providedIn: "root",
})
export class StudyCaseLoadingService {
  public onLoadStudy: EventEmitter<LoadedStudy> = new EventEmitter();
  public onLoadreadOnlyStudy: EventEmitter<LoadedStudy> = new EventEmitter();

  constructor(
    private studyCaseValidationService: StudyCaseValidationService,
    private socketService: SocketService,
    private studyCaseDataService: StudyCaseDataService,
    private ontologyService: OntologyService,
    private snackbarService: SnackbarService,
    private studyCaseExecutionObserverService: StudyCaseExecutionObserverService
  ) {
    this.onLoadStudy = null;
    this.onLoadreadOnlyStudy = null;
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
      (messageObserver) => {
        this._finalizeLoadedStudyCase(
          loadedStudy,
          isStudyCreated,
          isFromCreateStudy,
          loadOnlyOntology,
          messageObserver
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
    loadOnlyOntology: boolean,
    messageObserver: Observer<string>
  ) {
    const studyId = loadedStudy.studyCase.id;

    // Assign study to data service
    this.updateStudyCaseDataService(loadedStudy);

    if (isFromCreateStudy) {
      this.studyCaseDataService.getStudies().subscribe((studies) => {
        this.studyCaseDataService.studyManagementData = studies;
      });
    }

    if (loadOnlyOntology) {
      this.loadOntology(loadedStudy).subscribe(() => {
        messageObserver.next("Loading ontology");

        this.studyCaseDataService.updateParameterOntology(loadedStudy);
        //end loading
        this.terminateStudyCaseLoading(
          loadedStudy,
          isStudyCreated,
          messageObserver
        );
      });
    } else {
      // Load logs

      messageObserver.next("Load study logs");
      this.studyCaseDataService.getLog(loadedStudy.studyCase.id);
      this.studyCaseDataService.tradeScenarioList = [];

      messageObserver.next(`Loading ontology and notifications`);
      const calls = [];
      calls.push(this.loadOntology(loadedStudy));
      calls.push(
        this.studyCaseDataService.getStudyNotifications(loadedStudy.studyCase.id)
      );
      calls.push(this.loadValidations(loadedStudy.studyCase.id));

      combineLatest(calls).subscribe(
        ([resultVoid, resultnotifications, resultValidation]) => {
          messageObserver.next("Loading ontology");

          this.studyCaseDataService.updateParameterOntology(loadedStudy);


          messageObserver.next("Loading notifications");

          const notifications =
            resultnotifications as CoeditionNotification[];
          this.socketService.notificationList = notifications;

          messageObserver.next("Loading validation");

          Object.values(
            this.studyCaseDataService.loadedStudy.treeview.rootDict
          ).forEach((element) => {
            const studyCaseValidation =
              this.studyCaseValidationService.studyValidationDict[
                element.fullNamespace
              ];

            if (
              studyCaseValidation !== undefined &&
              studyCaseValidation !== null
            ) {
              element.isValidated =
                studyCaseValidation[0].validationState ===
                ValidationTreeNodeState.VALIDATED;
            }
          });

          //end loading
          this.terminateStudyCaseLoading(
            loadedStudy,
            isStudyCreated,
            messageObserver
          );
        },
        (errorReceived) => {
          // Notify user
          this.snackbarService.showError(
            `Error while loading, the following error occurs: ${errorReceived.description}`
          );

          this.terminateStudyCaseLoading(
            loadedStudy,
            isStudyCreated,
            messageObserver
          );
        }
      );
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
    isStudyLoaded: any,
    loadingObserver: Observer<string>
  ) {
    const message = "Refreshing study case data";
    loadingObserver.next(message);
    this.snackbarService.showInformation(message);

    // Notify components observing study case status
    this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);

    // Execute callback to set studycase loadign status
    isStudyLoaded(true);

    // Complete observer for a further unsubscription
    loadingObserver.complete();
  }
}
