import { EventEmitter, Injectable } from "@angular/core";
import {
  LoadedStudy,
  LoadStatus,
  StudyCasePayload,
  StudyCaseInitialSetupPayload,
} from "src/app/models/study.model";
import { StudyCaseDataService } from "../study-case/data/study-case-data.service";
import { SnackbarService } from "../snackbar/snackbar.service";
import { StudyUpdateParameter } from "src/app/models/study-update.model";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { LoggerService } from "../logger/logger.service";
import { DataHttpService } from "../http/data-http/data-http.service";
import { StudyCaseMainService } from "../study-case/main/study-case-main.service";
import { StudyCasePostProcessingService } from "../study-case/post-processing/study-case-post-processing.service";
import { Observable, of, Subscriber } from "rxjs";
import { StudyCaseAllocationStatus } from "src/app/models/study-case-allocation.model";
import { StudyCaseLoadingService } from "../study-case-loading/study-case-loading.service";
import { PostProcessingService } from "../post-processing/post-processing.service";
import { Router } from "@angular/router";
import { StudyCaseLocalStorageService } from "../study-case-local-storage/study-case-local-storage.service";
import { UserService } from "../user/user.service";
import { map } from "rxjs/operators";
import { Routing } from "src/app/models/enumeration.model";
import { LoadingStudyDialogService } from "../loading-study-dialog/loading-study-dialog.service";
import { LoadingDialogStep } from "src/app/models/loading-study-dialog.model";
import { LoadingDialogService } from "../loading-dialog/loading-dialog.service";
import { SocketService } from "../socket/socket.service";
import { StudyCaseExecutionObserverService } from "../study-case-execution-observer/study-case-execution-observer.service";
import { ValidationDialogData } from "src/app/models/dialog-data.model";
import { MatDialog } from "@angular/material/dialog";
import { ValidationDialogComponent } from "src/app/shared/validation-dialog/validation-dialog.component";

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
    private dialog: MatDialog,
    private http: HttpClient,
    private studyCaseLoadingService: StudyCaseLoadingService,
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseMainService: StudyCaseMainService,
    private postProcessingService: PostProcessingService,
    private studyCasePostProcessingService: StudyCasePostProcessingService,
    private snackbarService: SnackbarService,
    private loadingStudyDialogService: LoadingStudyDialogService,
    private loggerService: LoggerService,
    private router: Router,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private userService: UserService,
    private loadingDialogService: LoadingDialogService,
    private socketService: SocketService,
    private studyCaseExecutionObserverService: StudyCaseExecutionObserverService,

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
    
    let loadingCanceled= false;

    // Display loading message
    this.loadingStudyDialogService
      .showLoadingWithCancelobserver(`Create study case ${study.name}`)
      .subscribe(() => {
        this.loggerService.log(
          `Loading has been canceled, redirecting to study management component from ${this.router.url} `
        );
        loadingCanceled = true;
        this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
      });
    
    this.loadingStudyDialogService.updateStep(LoadingDialogStep.ACCESSING_STUDY_SERVER);
    this.studyCaseDataService.createAllocationForNewStudyCase(study).subscribe({
      next: (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          if (!loadingCanceled){
            this.loadingStudyDialogService.updateStep(LoadingDialogStep.LOADING_STUDY);
            new StudyCaseInitialSetupPayload(allocation.studyCaseId, study.reference, study.type);
              this.launchLoadStudy(allocation.studyCaseId, false, true, isStudyCreated, true); 
          }
        } else {
          this.studyCaseDataService.checkPodStatusAndShowError(allocation.studyCaseId, undefined, "Error creating study: ",()=> {
            isStudyCreated(false);
          });
          this.onStudyCreated.emit(allocation.studyCaseId);
        }
      },
      error: (errorReceived) => {
        this.loadingStudyDialogService.setError("Error creating study\n" + errorReceived.description);
        isStudyCreated(false);
      }
    });
  }    

  copyCompleteStudy(
    studyId: number,
    studyNameSource: string,
    newName: string,
    groupId: number,
    flavor:string,
    isStudyCreated: any
  ) {
    
    let loadingCanceled= false;
    // Display loading message
    this.loadingStudyDialogService
      .showLoadingWithCancelobserver(`Creating "${newName}" copy of study case "${studyNameSource}"`)
      .subscribe(() => {
        this.loggerService.log(
          `Loading has been canceled, redirecting to study management component from ${this.router.url} `
        );
        loadingCanceled = true;
        this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
      });
    this.loadingStudyDialogService.updateStep(LoadingDialogStep.ACCESSING_STUDY_SERVER);
    this.studyCaseDataService.createAllocationForCopyingStudyCase(studyId, newName, groupId, flavor).subscribe({
      next: (allocation) => {
        if(!loadingCanceled) {
          if (allocation.status === StudyCaseAllocationStatus.DONE) {
            this.launchLoadStudy(allocation.studyCaseId, false,  true, isStudyCreated, true);
          } else {
            this.studyCaseDataService.checkPodStatusAndShowError(studyId, undefined, "Error copying study case: " ,()=> isStudyCreated(false));
          }
          this.onStudyCreated.emit(allocation.studyCaseId);
        }
      },
      error: (errorReceived) => {
        this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived, "Error copying study case: ",()=> isStudyCreated(false));
      }
    });
  }

      /**
 * Handles study loading process with different scenarios
 * @param studyId ID of the study to load
 * @param studyName Name of the study
 * @param isStudyLoaded Callback function for load completion
 * @param read_only_mode Whether to load in read-only mode when refreshing studyCase (this information is provided by the url)
 */
  loadCompleteStudy(studyId: number, studyName: string, isStudyLoaded: any, read_only_mode?: boolean) {
    let loadingCanceled = false;

    // Display loading message
    this.loadingStudyDialogService
      .showLoadingWithCancelobserver(`Loading study case ${studyName}`)
      .subscribe(() => {
        this.loggerService.log(
          `Loading has been canceled, redirecting to study management component from ${this.router.url} `
        );
        loadingCanceled = true;
        this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
      });
  
  if (!loadingCanceled) {
    // Handle direct access link case
    if (studyName === "requested") {
        this.handleReadOnlyAccess(studyId, isStudyLoaded, loadingCanceled);
        return;
    }

    // Handle named study case. When you click to load study from studyManagement page
    // or
    // Handle refresh case. We have previously checked if in url there is the param "ReadOnly"
    if (read_only_mode) {
        this.handleReadOnlyAccess(studyId, isStudyLoaded, loadingCanceled);
    } else {
        this.handleEditionModeAccess(studyId, isStudyLoaded, loadingCanceled);
    }
  }
}

/**
* Handles read-only access to study
* @param studyId ID of the study
* @param isStudyLoaded Callback function
* @param loadingCanceled Whether loading was canceled
*/
private handleReadOnlyAccess(studyId: number, isStudyLoaded: (loaded: boolean) => void, loadingCanceled: boolean): void {
  this.studyCaseDataService.getPreRequisiteForReadOnly(studyId).subscribe({
    next: (response) => {
      if(!loadingCanceled) {
        if (response.has_read_only) {
          this.loadingStudyDialogService.setReadOnlySteps(true);
          // Launch study with appropriate server running status
          this.launchLoadStudy(
              studyId, 
              false, 
              true, 
              isStudyLoaded, 
              false, 
              response.has_read_only,
              response.allocation_is_running
          );
        } else {
            
            // Handle case where read-only is not available
            this.displayValidationDialog(studyId, isStudyLoaded);
        }
      }
    },
    error:  (errorReceived) => this.handleLoadingError(studyId, errorReceived, isStudyLoaded)
  });
}

/**
   * Display dialog before launch the loading study in edition mode (if study has no read only mode)
   * @param studyId id of the Study to load

   */
  private displayValidationDialog(studyId: number, isStudyLoaded: (loaded:boolean) => void){
    const validationDialogData = new ValidationDialogData();
    validationDialogData.message = `The read only is not available for this study. Do you want to load this study in edition mode ?`;
    validationDialogData.title = ' ';
    validationDialogData.buttonOkText = 'Ok';
    validationDialogData.showCancelButton = true;
    validationDialogData.secondaryActionConfirmationNeeded = false;

    const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,
      width: '400px',
      height: '200px',
      data: validationDialogData,
    });
    dialogRefValidate.afterClosed().subscribe(result => {
      const validationData: ValidationDialogData = result as ValidationDialogData;
      if (validationData !== null && validationData !== undefined && !validationData.cancel) {
        this.handleEditionModeAccess(studyId, isStudyLoaded, false);
        }
        else{
          //cancel loading
          this.loadingStudyDialogService.closeLoading();
          this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
        }
      });
  }
  
/**
* Handles regular access to study
* @param studyId ID of the study
* @param isStudyLoaded Callback function
* @param loadingCanceled Whether loading was canceled
*/
private handleEditionModeAccess(studyId: number, isStudyLoaded: (loaded: boolean) => void, 
  loadingCanceled: boolean): void {
  // Update loading dialog to show accessing server step
  this.loadingStudyDialogService.updateStep(LoadingDialogStep.ACCESSING_STUDY_SERVER);
  this.studyCaseDataService.createAllocationForExistingStudyCase(studyId).subscribe({
      next: (allocation) => {
          if (allocation.status === StudyCaseAllocationStatus.DONE) {
              this.loadingStudyDialogService.updateStep(LoadingDialogStep.LOADING_STUDY);
              
              if (!loadingCanceled) {
                  this.launchLoadStudy(allocation.studyCaseId, false, false, isStudyLoaded, false);
              } else {
                  this.handleLoadingError(studyId, undefined, isStudyLoaded);
              }
          }
      },
      error: (errorReceived) => this.handleLoadingError(studyId, errorReceived, isStudyLoaded)
  });
}

/**
* Handles errors during study loading
* @param studyId ID of the study
* @param error Error received, if any
* @param isStudyLoaded Callback function
*/
private handleLoadingError(studyId: number, error: any, isStudyLoaded: (loaded: boolean) => void): void {
  isStudyLoaded(false);
  this.studyCaseDataService.checkPodStatusAndShowError(studyId, error, "Error loading study: ");
}

  /**
   * Load the current study without read only mode (open in normal mode)
   */
  loadStudyInEditionMode() {
    const studyId = this.studyCaseDataService.loadedStudy.studyCase.id;
    let loadingCanceled = false;
    const isStudyLoaded = () => {
      // This function is intentionally empty, it will be overwritten later
    };
    // Display loading message
    this.loadingStudyDialogService
      .showLoadingWithCancelobserver(`Switching to edition mode`)
      .subscribe(() => {
        this.loggerService.log(
          `Loading has been canceled, redirecting to study management component from ${this.router.url} `
        );
        loadingCanceled = true;
        this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
      });

    this.loadingStudyDialogService.updateStep(LoadingDialogStep.ACCESSING_STUDY_SERVER);
    this.studyCaseDataService.createAllocationForExistingStudyCase(studyId).subscribe({
      next: (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          if(!loadingCanceled){ 
            this.loadingStudyDialogService.updateStep(LoadingDialogStep.LOADING_STUDY);
            this.postProcessingService.addPostProcessingAfterSwitchEditionMode(this.studyCaseDataService.loadedStudy);
            //load study
            this.launchLoadStudy(studyId, true, false, isStudyLoaded, false);
          }
        } else {
          this.studyCaseDataService.checkPodStatusAndShowError(studyId, undefined , "Error loading study: ");
        }
      },
      error: (errorReceived) => {
        this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived, "Error loading study: " );
      }
    });
  }

  /**
   * Load the current study in read only mode (open in read only mode)
   */
  loadStudyInReadOnlyMode(studyId: number, studyName: string) {
    let loadingCanceled = false;
    const isStudyLoaded = () => {
      // This function is intentionally empty, it will be overwritten later
    };
    // Display loading message
    this.loadingStudyDialogService
      .showLoadingWithCancelobserver(`Loading study case ${studyName}`)
      .subscribe(() => {
        this.loggerService.log(
          `Loading has been canceled, redirecting to study management component from ${this.router.url} `
        );
        loadingCanceled = true;
        this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
      });
      if(!loadingCanceled){
        // Update loading step using read only step
        this.loadingStudyDialogService.setReadOnlySteps(true)   
        // load study
        this.studyCaseDataService.getPreRequisiteForReadOnly(studyId).subscribe({
        next: (response) => { 
          this.launchLoadStudy(studyId, false, true, isStudyLoaded, false, response.has_read_only, response.allocation_is_running);
        },
        error:  (errorReceived) => this.handleLoadingError(studyId, errorReceived, isStudyLoaded)
      });
       
    }
}        

  
  /**
   * launch the Loading of the study if needed, and in parallel launch the loading of post processings then
   * finalize the loading with logs, ontology, validation...
   * @param studyId : study to load
   * @param functionToDoAfterLoading : function to be executed at the end of the loading or creation
   * @param readOnlyMode : if the study needs to open in read-only mode
   * @param isFromCreateStudy : we are in creation mode
   * @param hasReadOnly: if stufy has file for the read-only mode
   * @param serverIsRunningForReadOnly: Check if server is already running for read-only mode
   */
  public launchLoadStudy(
    studyId: number,
    withEmit:boolean,
    readOnlyMode: boolean,
    functionToDoAfterLoading: any,
    isFromCreateStudy: boolean,
    hasReadOnly?: boolean,
    serverIsRunningForReadOnly?: boolean
  ) {

    const messageObserver = {
      next: (message: string) =>
        this.loadingDialogService.updateMessage(message),
      complete: () => this.loadingDialogService.closeLoading(),
    };
 
    let loadedStudy$ = new Observable<LoadedStudy>((observer) => observer.next(null));
    if(readOnlyMode) {
        if (hasReadOnly) {
          // Use data server to load study in read only mode
          this.loadingStudyDialogService.updateStep(LoadingDialogStep.LOADING_STUDY)
          loadedStudy$ = this.getStudyInReadOnlyMode(studyId,withEmit, !serverIsRunningForReadOnly);
        }
        else {
          // Use the study server that is opening to load the study in read only mode
          loadedStudy$ = this.studyCaseMainService.loadStudy(studyId, withEmit, readOnlyMode);
        }
    }
    else {
      // Load study in edition mode
      loadedStudy$ = this.studyCaseMainService.loadStudy(studyId, withEmit, readOnlyMode);
    }
    
    loadedStudy$.subscribe({
      next: (resultLoadedStudy) => {
        if (this.loadingStudyDialogService.isLoadingOpen()) {
          const loadedStudyCase = resultLoadedStudy as LoadedStudy;

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
            let loadPostProc$ = new Observable<boolean>((observer) => observer.next(null));
            if (isLoaded){
              loadPostProc$ = this.studyCasePostProcessingService.loadStudy(studyId, false);
            }

            loadPostProc$.subscribe({
              next: () => {
                
                this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudyCase, functionToDoAfterLoading, isFromCreateStudy, false).subscribe(messageObserver);
                if (this.studyCaseLocalStorageService.studyHaveUnsavedChanges(studyId.toString())) {
                  this.loadingDialogService.updateMessage(`Loading unsaved changes`);
                  let studyParameters: StudyUpdateParameter[] = [];
                  studyParameters = this.studyCaseLocalStorageService.getStudyParametersFromLocalStorage(studyId.toString());
                  studyParameters.forEach((element) => {
                    this.studyCaseDataService.loadedStudy.treeview.rootNodeDataDict[element.variableId].value = element.newValue;
                  });
                }
                this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
              },
              error: (errorReceived) => {
                functionToDoAfterLoading(false);
                this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived, "Error loading study: " );
              }
            });
          }   
        }      
      },
      error: (errorReceived) => {
       
        functionToDoAfterLoading(false);(false);
        this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived, "Error loading study: " );
      }
    });
}

  public startConnectionStatusTimer() {

    this.connectionStatusTimer = setTimeout(() => {
      this.userService.getCurrentUser().subscribe({
        next: () => {
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
              if (this.studyCaseDataService.loadedStudy.loadStatus !== LoadStatus.READ_ONLY_MODE || 
                (this.studyCaseDataService.loadedStudy.loadStatus === LoadStatus.READ_ONLY_MODE && 
                 this.studyCaseDataService.preRequisiteReadOnlyDict?.allocation_is_running)) {
                this.studyCaseMainService.checkStudyIsUpAndLoaded();
              }
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

  public getStudyInReadOnlyMode(studyId: number, withEmit: boolean, useDataServer: boolean): Observable<LoadedStudy> {
        const loaderObservable = new Observable<LoadedStudy>((observer) => {
          // Start study case loading to other services
          this.loadStudyInReadOnlyModeTimeout(studyId, withEmit, observer, useDataServer);
        });
        return loaderObservable;
  }
    
  private loadStudyInReadOnlyModeTimeout(studyId: number, withEmit: boolean, loaderObservable: Subscriber<LoadedStudy>, useDataServer: boolean) {

    // Select appropriate service based on server type
    const getStudyInReadOnlyMode = useDataServer ? this.studyCaseDataService.getStudyInReadOnlyModeUsingDataServer(studyId) : this.studyCaseMainService.getStudyInReadOnlyModeUsingMainServer(studyId);

    // Start timeout to load study in Read only
    getStudyInReadOnlyMode.subscribe({ 
      next: (loadedStudy) => {
        if (loadedStudy.loadStatus === LoadStatus.IN_PROGESS) {
          setTimeout(() => {
            this.loadStudyInReadOnlyModeTimeout(studyId, withEmit, loaderObservable, useDataServer);
          }, 2000);
        } else {
          //get current study user info
          this.studyCaseDataService.getStudy(loadedStudy.studyCase.id, false).subscribe({next:(study)=>{
            loadedStudy.studyCase = study;
            if(withEmit){
                const currentLoadedStudy = this.studyCaseDataService.loadedStudy;
                if ((currentLoadedStudy !== null) && (currentLoadedStudy !== undefined)) {
                  this.studyCaseExecutionObserverService.removeStudyCaseObserver(currentLoadedStudy.studyCase.id);
                }
               
                this.studyCaseDataService.setCurrentStudy(loadedStudy);
                this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
            }
         
            loaderObservable.next(loadedStudy);
          },
          error:(error) => {
            loaderObservable.error(error);
          }});
        }
        },
          error:(error) => {
            loaderObservable.error(error);
        }
    });
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