import { EventEmitter, Injectable } from "@angular/core";
import {
  LoadedStudy,
  LoadStatus,
  StudyCasePayload,
  StudyCaseInitialSetupPayload,
  LoadedStudyAttributes,
} from "src/app/models/study.model";
import { StudyCaseDataService } from "../study-case/data/study-case-data.service";
import { SnackbarService } from "../snackbar/snackbar.service";
import { LoadingDialogService } from "../loading-dialog/loading-dialog.service";
import { StudyUpdateParameter } from "src/app/models/study-update.model";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { LoggerService } from "../logger/logger.service";
import { DataHttpService } from "../http/data-http/data-http.service";
import { StudyCaseMainService } from "../study-case/main/study-case-main.service";
import { StudyCasePostProcessingService } from "../study-case/post-processing/study-case-post-processing.service";
import { Observable, of } from "rxjs";
import { combineLatest } from "rxjs";
import { StudyCaseAllocation, StudyCaseAllocationStatus } from "src/app/models/study-case-allocation.model";
import { StudyCaseLoadingService } from "../study-case-loading/study-case-loading.service";
import { PostProcessingService } from "../post-processing/post-processing.service";
import { Router } from "@angular/router";
import { StudyCaseLocalStorageService } from "../study-case-local-storage/study-case-local-storage.service";
import { UserService } from "../user/user.service";
import { map } from "rxjs/operators";
import { Routing } from "src/app/models/enumeration.model";

@Injectable({
  providedIn: "root",
})
export class AppDataService extends DataHttpService {
  // Timer use to check connection status server side
  private connectionStatusTimer;
  public onStudyCreated: EventEmitter<number> = new EventEmitter();
  public onNoServerResponse: EventEmitter<boolean>;
  public platformInfo : any;
  public hasNoServerAvailable: boolean;
  public support : any;

  constructor(
    private http: HttpClient,
    private studyCaseLoadingService: StudyCaseLoadingService,
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseMainService: StudyCaseMainService,
    private studyCasePostProcessingService: StudyCasePostProcessingService,
    private postProcessingService: PostProcessingService,
    private snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService,
    private loggerService: LoggerService,
    private router: Router,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private userService: UserService,
    private location: Location
  ) {
    super(location, "application");
    this.connectionStatusTimer = null;
    this.platformInfo = null;
    this.onNoServerResponse = new EventEmitter<boolean>();
    this.hasNoServerAvailable = false;
    this.support = null;
  }

  createCompleteStudy(study: StudyCasePayload, isStudyCreated: any) {
    // Display loading message
    this.loadingDialogService.showLoading(`Create study case ${study.name}`);

    const messageObserver = {
      next: (message: string) =>
        this.loadingDialogService.updateMessage(message),
      complete: () => this.loadingDialogService.closeLoading(),
    };

    this.studyCaseDataService.createAllocationForNewStudyCase(study).subscribe({
      next: (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          this.launchLoadStudy(allocation.studyCaseId, false, true, isStudyCreated, true);
        } else {
          this.studyCaseDataService.checkPodStatusAndShowError(allocation.studyCaseId, undefined, "Error creating study",()=> {
            this.onStudyCreated.emit(allocation.studyCaseId);
            messageObserver.complete();
            isStudyCreated(false);
          });
        }
      },
      error: (errorReceived) => {
        this.snackbarService.showError("Error creating study\n" + errorReceived.description);
        messageObserver.complete();
        isStudyCreated(false);
      }
    });
  }    

  copyCompleteStudy(
    studyId: number,
    newName: string,
    groupId: number,
    flavor:string,
    isStudyCreated: any
  ) {
    this.loadingDialogService.showLoading(`Create study case ${newName}`);

    const messageObserver = {
      next: (message: string) =>
        this.loadingDialogService.updateMessage(message),
      complete: () => this.loadingDialogService.closeLoading(),
    };

    // Display loading message
    messageObserver.next(`Creating copy of study case : "${newName}"`);

    this.studyCaseDataService.createAllocationForCopyingStudyCase(studyId, newName, groupId, flavor).subscribe({
      next: (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          this.launchLoadStudy(allocation.studyCaseId, false, true, isStudyCreated, true);
        } else {
          this.studyCaseDataService.checkPodStatusAndShowError(studyId, undefined, "Error copying study case" ,()=> isStudyCreated(false));
        }
      },
      error: (errorReceived) => {
        
        this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived, "Error copying study case",()=> isStudyCreated(false));
      }
    });
  }

  loadCompleteStudy(studyId: number, studyName: string, isStudyLoaded: any) {
    let loadingCanceled: boolean = false;

    // Display loading message
    this.loadingDialogService
      .showLoadingWithCancelobserver(`Loading study case ${studyName}`)
      .subscribe((isCancel) => {
        this.loggerService.log(
          `Loading has been canceled, redirecting to study management component from ${this.router.url} `
        );
        loadingCanceled = true;
        this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
      });

    const messageObserver = {
      next: (message: string) =>
        this.loadingDialogService.updateMessage(message),
      complete: () => this.loadingDialogService.closeLoading(),
    };

    this.studyCaseDataService.createAllocationForExistingStudyCase(studyId).subscribe({
      next: (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          if (!loadingCanceled) {
            this.launchLoadStudy(allocation.studyCaseId, false, true, isStudyLoaded, false);
          }
        } else {
          
          isStudyLoaded(false);
          this.studyCaseDataService.checkPodStatusAndShowError(studyId, undefined);
        }
      },
      error: (errorReceived) => {
        isStudyLoaded(false);
        this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived );
      }
    });
  }    

  
  /**
   * Load the current study without read only mode (open in normal mode)
   */
  loadStudyInEditionMode() {
    const studyName = this.studyCaseDataService.loadedStudy.studyCase.name;
    const studyId = this.studyCaseDataService.loadedStudy.studyCase.id;

    // at the end of the loading, set the post processings of the read only mode to not load them again
    const isStudyLoaded = (isloadedStudy: boolean) => {
      if (isloadedStudy){
        this.postProcessingService.addPostProcessingAfterSwitchEditionMode(this.studyCaseDataService.loadedStudy);
      }

    };

    // Display loading message
    this.loadingDialogService.showLoading(
      `Switching study case ${studyName} to edition mode`
    );

    this.studyCaseDataService.createAllocationForExistingStudyCase(studyId).subscribe({
      next: (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          //load study
          this.launchLoadStudy(studyId, true, false, isStudyLoaded, false);
            
        } else {
          this.studyCaseDataService.checkPodStatusAndShowError(studyId, undefined );
        }
      },
      error: (errorReceived) => {
        this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived );
      }
    });
  }    

  
  /**
   * launch the Loading of the study if needed, and in parallel launch the loading of post processings then
   * finalize the loading with logs, ontology, validation...
   * @param studyId : study to load
   * @param readOnlyMode : if the study needs to open in read-only mode
   * @param getNotification : if the notifications should be loading (no notifications at the creation)
   * @param functionToDoAfterLoading : function to be executed at the end of the loading or creation
   * @param isFromCreateStudy : we are in creation mode
   */
  public launchLoadStudy(
    studyId: number,
    withEmit:boolean,
    readOnlyMode: boolean,
    functionToDoAfterLoading: any,
    isFromCreateStudy: boolean
  ) {
    const messageObserver = {
      next: (message: string) =>
        this.loadingDialogService.updateMessage(message),
      complete: () => this.loadingDialogService.closeLoading(),
    };

    let loadedStudy$ = new Observable<LoadedStudy>((observer) => observer.next(null));
    if (readOnlyMode) {
      loadedStudy$ = this.studyCaseMainService.loadStudyInReadOnlyModeIfNeeded(studyId, withEmit);
    }
    else{
      loadedStudy$ = this.studyCaseMainService.loadStudy(studyId, withEmit);
    }
    
    loadedStudy$.subscribe({
      next: (resultLoadedStudy) => {

        this.loadingDialogService.disableCancelLoading(true);
        let loadedStudyCase = resultLoadedStudy as LoadedStudy;

        // in case of read only mode, set post processings of the loaded study case
        const isReadOnlyMode = loadedStudyCase.loadStatus == LoadStatus.READ_ONLY_MODE
        if (isReadOnlyMode){

          // Set post processing dictionnary from the loaded study
          this.postProcessingService.clearPostProcessingDict();
  
          // load read only mode
          this.postProcessingService.setPostProcessing(loadedStudyCase);  

          this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudyCase, functionToDoAfterLoading, isFromCreateStudy, false).subscribe(messageObserver);     
        }
        else {
          const isLoaded = loadedStudyCase.loadStatus == LoadStatus.LOADED
          
          //load post processings if the study is loaded
          let loadPostProc$ = new Observable<Boolean>((observer) => observer.next(null));
          if (isLoaded){
            loadPostProc$ = this.studyCasePostProcessingService.loadStudy(studyId, false);
          }

          loadPostProc$.subscribe({
            next: (isLoaded) => {
              
              this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudyCase, functionToDoAfterLoading, isFromCreateStudy, false).subscribe(messageObserver);
              if (this.studyCaseLocalStorageService.studyHaveUnsavedChanges(studyId.toString())) {
                this.loadingDialogService.updateMessage(`Loading unsaved changes`);
                let studyParameters: StudyUpdateParameter[] = [];
                studyParameters = this.studyCaseLocalStorageService.getStudyParametersFromLocalStorage(studyId.toString());
                studyParameters.forEach((element) => {
                  this.studyCaseDataService.loadedStudy.treeview.rootNodeDataDict[element.variableId].value = element.newValue;
                });
              }
            },
            error: (errorReceived) => {
              functionToDoAfterLoading(false);
              this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived );
            }
          });
        }
      },
      error: (errorReceived) => {
        functionToDoAfterLoading(false);
        this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived );
      }
    });
}

  public startConnectionStatusTimer() {

    this.connectionStatusTimer = setTimeout(() => {
      this.userService.getCurrentUser().subscribe({
        next: (_) => {
          this.startConnectionStatusTimer();
          if (this.hasNoServerAvailable) {
            this.hasNoServerAvailable = false;
            this.onNoServerResponse.emit(this.hasNoServerAvailable);
          } else {
            // Vérifier si l'étude est chargée et si le serveur est accessible
            if (
              this.studyCaseDataService.loadedStudy !== null &&
              this.studyCaseDataService.loadedStudy !== undefined
            ) {
              this.studyCaseMainService.checkStudyIsUpAndLoaded();
            }
          }
        },
        error: (error) => {
          // Gérer les erreurs
          if (error.statusCode == 502 || error.statusCode == 0) {
            this.startConnectionStatusTimer();
            this.hasNoServerAvailable = true;
            this.onNoServerResponse.emit(this.hasNoServerAvailable);
          } else {
            this.stopConnectionStatusTimer();
          }
        }
      });
    }, 5000);
  }

  public stopConnectionStatusTimer() {
    if (this.connectionStatusTimer) {
      clearTimeout(this.connectionStatusTimer);
      this.connectionStatusTimer = null;
    }
  }
  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API DATA          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------
  public getAppInfo() {
      return this.http.get(this.apiRoute + "/infos").pipe(map(
        response => {
          this.platformInfo = response
          return this.platformInfo;      
        }
      )); 
  }

  getAppSupport() {
    if (this.support !== null && this.support !== undefined) {
      return of(this.support);
   }
   else {
    return this.http.get(this.apiRoute + "/support").pipe(map(
       response => {
         this.support = response
         return this.support;      
       }
     ));  
   }
  }

  public getGitReposInfo() {
    return this.http.get(this.apiRoute + "/git-repos-info"); 
  }
}
