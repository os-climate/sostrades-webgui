import { Injectable } from '@angular/core';
import { LoadedStudy, LoadStatus, PostStudy } from 'src/app/models/study.model';
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
import { Observable, observable, Subscription } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { combineLatest } from 'rxjs';
import { StudyCaseLoadingService } from '../study-case-loading/study-case-loading.service';

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
    private studyCaseLoadingService: StudyCaseLoadingService,
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
    super(location, 'application');
    this.connectionStatusTimer = null;
    this.onStudyCaseStartLoadingSubscription = null;
    this.loadedStudy = null;
  }

  createCompleteStudy(study: PostStudy, isStudyCreated: any) {
    // Display loading message
    this.loadingDialogService.showLoading(`Create study case ${study.name}`);
    // Request serveur for study case data
    this.studyCaseMainService.createStudy(study, false).subscribe(loadedStudy => {
      // after creation, load the study into post processing
      // must be done after the end of the creation, if not the loading cannot be done
      this.loadedStudy = loadedStudy as LoadedStudy;
      this.studyCaseDataService.setStudyToLoad(loadedStudy.studyCase.id);
      this.studyCasePostProcessingService.loadStudy(this.loadedStudy.studyCase.id, false).subscribe(isLoaded => {
        //load the last elements of the study and update current loaded study
        this.studyCaseLoadingService.finalizeLoadedStudyCase(this.loadedStudy, false, isStudyCreated, true, true, false, false);

      }, errorReceived => {
        this.snackbarService.showError('Error creating study\n' + errorReceived.description);
        isStudyCreated(false);
        this.loadingDialogService.closeLoading();
      });
    }, errorReceived => {
        this.snackbarService.showError('Error creating study\n' + errorReceived.description);
        isStudyCreated(false);
        this.loadingDialogService.closeLoading();
      });
  }

  copyCompleteStudy(studyId: number, newName: string, groupId: number, isStudyCreated: any) {
    // Display loading message
    this.loadingDialogService.showLoading(`Creating copy of study case : "${newName}"`);

    // Request serveur for study case data
    this.studyCaseMainService.copyStudy(studyId, newName, groupId).subscribe(loadedStudy => {
      // after creation, load the study into post processing
      // must be done after the end of the creation, if not the loading cannot be done
      this.loadedStudy = loadedStudy as LoadedStudy;
      this.studyCaseDataService.setStudyToLoad(loadedStudy.studyCase.id);
      this.studyCasePostProcessingService.loadStudy(this.loadedStudy.studyCase.id, false).subscribe(isLoaded => {
        //load the last elements of the study and update current loaded study
        this.studyCaseLoadingService.finalizeLoadedStudyCase(this.loadedStudy, false, isStudyCreated, true, true, false, false);

      }, errorReceived => {
        this.snackbarService.showError('Error copying study\n' + errorReceived.description);
        isStudyCreated(false);
        this.loadingDialogService.closeLoading();
      });
    }, errorReceived => {
        this.snackbarService.showError('Error copying study\n' + errorReceived.description);
        isStudyCreated(false);
        this.loadingDialogService.closeLoading();
      });
  }


  loadCompleteStudy(studyId: number, studyName: string, isStudyLoaded: any) {

    // Display loading message
    this.loadingDialogService.showLoading(`Loading study case ${studyName}`);
    // register loading study
    this.studyCaseDataService.setStudyToLoad(studyId);

    //first, get read only mode and get the loading study (if it is in cache read only mode is not necessary)
    const firstCalls = [];
    firstCalls.push(this.studyCaseMainService.loadtudyInReadOnlyMode(studyId));
    firstCalls.push(this.studyCaseMainService.loadStudy(studyId, false, false));
    combineLatest(firstCalls).subscribe(([resultloadReadOnly, resultloadNormal]) => {
      const loadedStudy = resultloadNormal as LoadedStudy;
    
      //if the loadedstudy is loaded, no need of readonly mode
      if (loadedStudy.loadStatus === LoadStatus.LOADED)
      {
        //load the post processings then load directly the study 
        this.launchLoadStudy(false, loadedStudy, true, isStudyLoaded, true, false, false);
      }
      else if (resultloadReadOnly !== null && resultloadReadOnly !== undefined) {
          const loadedReadOnlyStudy = resultloadReadOnly as LoadedStudy;
          //load read only mode,
          this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedReadOnlyStudy, true, isStudyLoaded, true, false, true, false);
          // then launch load study with timeout in background
          this.launchLoadStudy(true, loadedStudy, true, isStudyLoaded, false, false, false);
      }
      else {
        // load the study normally with timeout and post processings
        this.launchLoadStudy(true, loadedStudy, true, isStudyLoaded, true, false, false);
      }
    }, errorReceived => {
      this.loggerService.log(errorReceived);
      this.snackbarService.showError('Error loading study\n' + errorReceived.description);
      isStudyLoaded(false);
      this.loadingDialogService.closeLoading();
    });
  }

  /**
   * launch the Loading of the study if needed, and in parallel launch the loading of post processings then finalize the loading with logs, ontology, validation...
   * @param isstudyNeedLoaded : if the study needs to be loaded
   * @param loadedStudy : the study to end loading 
   * @param getNotification : if the notifications should be loading (no notifications at the creation)
   * @param isStudyLoaded : function to be executed at the end of the loading or creation
   * @param showMsgInPopup : show the messages in a popup (if the loading is in background like in readonlymode, don't show the messages)
   * @param isFromCreateStudy : we are in creation mode
   * @param withEmit : we have to emit the end of study creation (for treeview update)
   */
  private launchLoadStudy(isstudyNeedLoaded:boolean, loadedStudy: LoadedStudy, getNotification: boolean, isStudyLoaded: any,
    showMsgInPopup: boolean, isFromCreateStudy: boolean, withEmit: boolean) {
      const studyId = loadedStudy.studyCase.id;
      const loadingCalls = [];

      if (isstudyNeedLoaded){
        loadingCalls.push(this.studyCaseMainService.loadStudy(studyId, false));
      }
      else
      {
        loadingCalls.push(new Observable<LoadedStudy>(observer=> observer.next(null)));
      }
      
      loadingCalls.push(this.studyCasePostProcessingService.loadStudy(studyId, false));
      combineLatest(loadingCalls).subscribe(([result1, isLoaded]) => {
        if (isstudyNeedLoaded)
        {
          loadedStudy = result1 as LoadedStudy;
        }
        this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudy, getNotification, isStudyLoaded, showMsgInPopup, isFromCreateStudy, false, withEmit);
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
      }  , errorReceived => {
        this.loggerService.log(errorReceived);
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

  private start_post_processing_loading(studyId: number) {
    // unsubscribe event
    this.onStudyCaseStartLoadingSubscription.unsubscribe();
    // load study in cache in post processing API
    this.studyCasePostProcessingService.loadStudy(studyId, false);
  }


  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API DATA          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------
  getAppInfo() {
    return this.http.get(this.apiRoute + '/infos');
  }
  getAppSupport() {
    return this.http.get(this.apiRoute + '/support');
  }


}
