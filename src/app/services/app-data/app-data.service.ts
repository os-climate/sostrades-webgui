import { Injectable } from '@angular/core';
import { LoadedStudy, PostStudy } from 'src/app/models/study.model';
import { StudyCaseDataService } from '../study-case/data/study-case-data.service';
import { SnackbarService } from '../snackbar/snackbar.service';
import { LoadingDialogService } from '../loading-dialog/loading-dialog.service';
import { PostOntology } from 'src/app/models/ontology.model';
import { OntologyService } from '../ontology/ontology.service';
import { StudyCaseLocalStorageService } from '../study-case-local-storage/study-case-local-storage.service';
import { StudyUpdateParameter } from 'src/app/models/study-update.model';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { TreenodeTools } from 'src/app/tools/treenode.tool';
import { SocketService } from '../socket/socket.service';
import { LoggerService } from '../logger/logger.service';
import { UserService } from '../user/user.service';
import { DataHttpService } from '../http/data-http/data-http.service';
import { StudyCaseMainService } from '../study-case/main/study-case-main.service';
import { StudyCasePostProcessingService } from '../study-case/post-processing/study-case-post-processing.service';
import { Subscription } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppDataService extends DataHttpService {

  // Timer use to check connection status server side
  private connectionStatusTimer;
  private onStudyCaseStartLoadingSubscription: Subscription;
  private loadedStudy: LoadedStudy;
  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseMainService: StudyCaseMainService,
    private studyCasePostProcessingService: StudyCasePostProcessingService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private ontologyService: OntologyService,
    private snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService,
    private loggerService: LoggerService,
    private userService: UserService,
    private location: Location) {
    super(location, 'application/infos');
    this.connectionStatusTimer = null;
    this.onStudyCaseStartLoadingSubscription = null;
    this.loadedStudy = null;
  }

  createCompleteStudy(study: PostStudy, isStudyCreated: any) {
    // Display loading message
    this.loadingDialogService.showLoading(`Create study case ${study.name}`);


    // Request serveur for study case data
    this.studyCaseMainService.createStudy(study, false).subscribe(loadedStudy => {
      //after creation, load the study into post processing
      // must be done after the end of the creation, if not the loading cannot be done
      this.loadedStudy = loadedStudy as LoadedStudy;
      this.studyCasePostProcessingService.loadStudy(this.loadedStudy.studyCase.id, false).subscribe(isLoaded => {
        // Add study case to study management list
        this.loadingDialogService.updateMessage(`Loading ontology`);

        // Prepare Ontology request inputs
        const ontologyRequest: PostOntology = {
          ontology_request: {
            disciplines: [],
            parameters: []
          }
        };

        // Extract ontology input data from study
        const root = (this.loadedStudy as LoadedStudy).treeview.rootNode;
        TreenodeTools.recursiveTreenodeExtract(root, ontologyRequest);

        // Call ontology service
        this.ontologyService.loadOntologyStudy(ontologyRequest).subscribe(() => {

          // Notify components observing study case status
          this.studyCaseDataService.onStudyCaseChange.emit(this.loadedStudy);

          isStudyCreated(true);

          // Close loading viw service
          this.loadingDialogService.closeLoading();

        }, errorReceived => {
          // Reset ontology (make sure nothing was loaded)
          this.ontologyService.resetOntology();

          // Notify user
          this.snackbarService.showError(`Ontology not loaded, the following error occurs: ${errorReceived.description}`);

          // Notify components observing study case status
          this.studyCaseDataService.onStudyCaseChange.emit(this.loadedStudy);

          isStudyCreated(true);

          this.loadingDialogService.closeLoading();
        });
      }, errorReceived => {
        this.snackbarService.showError('Error creating study\n' + errorReceived.description);
        isStudyCreated(false);
        this.loadingDialogService.closeLoading();
      })}, errorReceived => {
        this.snackbarService.showError('Error creating study\n' + errorReceived.description);
        isStudyCreated(false);
        this.loadingDialogService.closeLoading();
      });
  }

  loadCompleteStudy(studyId: number, studyName: string, isStudyLoaded: any) {
    // Display loading message
    this.loadingDialogService.showLoading(`Loading study case ${studyName}`);

    // subscribe to the loading of the study
    console.log('subscribe to the loading of the study after loading');

    // call loading of the study from main and post processing service
    // and wait for both to end
    const calls = [];
    calls.push(this.studyCaseMainService.loadStudy(studyId, false));
    calls.push(this.studyCasePostProcessingService.loadStudy(studyId, false));

    combineLatest(calls).subscribe(([result1, isLoaded]) => {
      var loadedStudy = result1 as LoadedStudy
      // Load unsaved changes
      if (this.studyCaseLocalStorageService.studyHaveUnsavedChanges(studyId.toString())) {
        this.loadingDialogService.updateMessage(`Loading unsaved changes`);
        let studyParameters: StudyUpdateParameter[] = [];
        // tslint:disable-next-line: max-line-length
        studyParameters = this.studyCaseLocalStorageService.getStudyParametersFromLocalStorage(studyId.toString());

        studyParameters.forEach(element => {
          // tslint:disable-next-line: max-line-length
          this.studyCaseDataService.loadedStudy.treeview.rootNodeDataDict[element.variableId].value = element.newValue;
        });
      }

      this.loadingDialogService.updateMessage(`Loading ontology`);

      // Prepare Ontology request inputs
      const ontologyRequest: PostOntology = {
        ontology_request: {
          disciplines: [],
          parameters: []
        }
      };

      // Extract ontology input data from study
      const root = (loadedStudy as LoadedStudy).treeview.rootNode;
      TreenodeTools.recursiveTreenodeExtract(root, ontologyRequest);

      // Call ontology service
      this.ontologyService.loadOntologyStudy(ontologyRequest).subscribe(() => {

        this.loadingDialogService.updateMessage(`Loading notifications`);
        this.studyCaseDataService.getStudyNotifications(loadedStudy.studyCase.id).subscribe(notifications => {

          this.socketService.notificationList = notifications;
          // Notify components observing study case status
          this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);

          isStudyLoaded(true);

          this.loadingDialogService.closeLoading();

        }, errorReceived => {

          // Notify user
          this.snackbarService.showError(`Notifications not loaded, the following error occurs: ${errorReceived.description}`);

          // Notify components observing study case status
          this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);

          isStudyLoaded(true);

          // Close loading viw service
          this.loadingDialogService.closeLoading();
        });

      }, errorReceived => {
        // Reset ontology (make sure nothing was loaded)
        this.ontologyService.resetOntology();

        // Notify user
        this.snackbarService.showError(`Ontology not loaded, the following error occurs: ${errorReceived.description}`);

        // Notify components observing study case status
        this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);

        isStudyLoaded(true);

        // Close loading viw service
        this.loadingDialogService.closeLoading();
      });

    }, errorReceived => {
      this.loggerService.log(errorReceived)
      this.snackbarService.showError('Error loading study\n' + errorReceived.description);
      isStudyLoaded(false);
      this.loadingDialogService.closeLoading();
    });
  }



  public startConnectionStatusTimer() {

    this.stopConnectionStatusTimer();

    this.connectionStatusTimer = setTimeout(() => {
      this.userService.getCurrentUser().subscribe(_ => {
        this.startConnectionStatusTimer();
      });
    }, 5000);
  }

  public stopConnectionStatusTimer() {
    if (this.connectionStatusTimer) {

      clearTimeout(this.connectionStatusTimer);
      this.connectionStatusTimer = null;
    }
  }

  private start_post_processing_loading(study_id:number){
    // unsubscribe event
    this.onStudyCaseStartLoadingSubscription.unsubscribe();
    //load study in cache in post processing API
    this.studyCasePostProcessingService.loadStudy(study_id, false);
  }


  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API DATA          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------
  getAppInfo() {
    return this.http.get(this.apiRoute);
  }


}
