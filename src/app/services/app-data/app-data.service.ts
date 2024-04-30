import { EventEmitter, Injectable } from "@angular/core";
import {
  LoadedStudy,
  LoadStatus,
  StudyCasePayload,
  StudyCaseInitialSetupPayload,
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
          const studyInformation = new StudyCaseInitialSetupPayload(
            allocation.studyCaseId,
            study.reference,
            study.type
          );
    
          // Demander au serveur les données du cas d'étude
          this.studyCaseMainService.createStudy(studyInformation, false).subscribe({
            next: (loadedStudy) => {
              // Après la création, charger l'étude dans le post-traitement
              // Cela doit être fait après la fin de la création, sinon le chargement ne peut pas être effectué
              this.studyCasePostProcessingService.loadStudy(loadedStudy.studyCase.id, false).subscribe({
                next: (isLoaded) => {
                  // Charger les derniers éléments de l'étude et mettre à jour l'étude chargée actuellement
                  this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudy, isStudyCreated, true, false).subscribe(messageObserver);
                },
                error: (errorReceived) => {
                  
                  this.studyCaseDataService.checkPodStatusAndShowError(loadedStudy.studyCase.id, errorReceived, "Error creating study",()=> {
                    this.onStudyCreated.emit(allocation.studyCaseId);
                    messageObserver.complete();
                    isStudyCreated(false);
                  });
              }
              });
            },
            error: (errorReceived) => {
              
              this.studyCaseDataService.checkPodStatusAndShowError(allocation.studyCaseId, errorReceived, "Error creating study",()=> {
                this.onStudyCreated.emit(allocation.studyCaseId);
                messageObserver.complete();
                isStudyCreated(false);
              });
            }
          });
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
          // Demander au serveur les données du cas d'étude
          this.studyCaseMainService.copyStudy(studyId, allocation.studyCaseId).subscribe({
            next: (loadedStudy) => {
              // Après la création, charger l'étude dans le post-traitement
              // Cela doit être fait après la fin de la création, sinon le chargement ne peut pas être effectué
              loadedStudy = loadedStudy as LoadedStudy;
              this.studyCasePostProcessingService.loadStudy(loadedStudy.studyCase.id, false).subscribe({
                next: (isLoaded) => {
                  // Charger les derniers éléments de l'étude et mettre à jour l'étude chargée actuellement
                  this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudy, isStudyCreated, true, false).subscribe(messageObserver);
                },
                error: (errorReceived) => {
                  this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived , "Error copying study case",()=> isStudyCreated(false));
                }
              });
            },
            error: (errorReceived) => {
              this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived, "Error copying study case",()=> isStudyCreated(false));
            }
          });
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
            this.studyCaseMainService.loadtudyInReadOnlyModeIfNeeded(studyId).subscribe({
              next: (loadedStudy) => {
                if (!loadingCanceled) {
                  if (loadedStudy.loadStatus === LoadStatus.READ_ONLY_MODE) {
                    this.loadingDialogService.disableCancelLoading(true);
                          this.postProcessingService.clearPostProcessingDict();
                          this.postProcessingService.clearPostProcessingDict();

                          // Set post processing dictionnary from the loaded study
                    this.postProcessingService.clearPostProcessingDict();

                          // Set post processing dictionnary from the loaded study
                          this.postProcessingService.setPostProcessing(loadedStudy);
                          this.postProcessingService.setPostProcessing(loadedStudy);
                          
                          // load read only mode
                    this.postProcessingService.setPostProcessing(loadedStudy);
                          
                          // load read only mode
                    this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudy, isStudyLoaded, false, false).subscribe(messageObserver);
                  } else {
                    const studyNeedsLoading = loadedStudy.loadStatus !== LoadStatus.LOADED;
                    this.launchLoadStudy(studyNeedsLoading, loadedStudy.studyCase.id, loadedStudy, isStudyLoaded, true, false);
                  }
                }
              },
              error: (errorReceived) => {
                isStudyLoaded(false);
                this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived );
              }
            });
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
    const isStudyLoaded = (isLoaded: boolean) => {};

    // Display loading message
    this.loadingDialogService.showLoading(
      `Switching study case ${studyName} to edition mode`
    );

    this.studyCaseDataService.createAllocationForExistingStudyCase(studyId).subscribe({
      next: (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          this.studyCaseMainService.loadStudy(studyId, true, false).subscribe({
            next: (loadedStudy) => {
              this.postProcessingService.addPostProcessingAfterSwitchEditionMode(loadedStudy);
              const studyNeedsLoading = loadedStudy.loadStatus !== LoadStatus.LOADED;
              this.launchLoadStudy(studyNeedsLoading, loadedStudy.studyCase.id, loadedStudy, isStudyLoaded, true, false);
            },
            error: (errorReceived) => {
              this.studyCaseDataService.checkPodStatusAndShowError(studyId, errorReceived );
            }
          });
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
   * @param isstudyNeedLoaded : if the study needs to be loaded
   * @param loadedStudy : the study to end loading
   * @param getNotification : if the notifications should be loading (no notifications at the creation)
   * @param isStudyLoaded : function to be executed at the end of the loading or creation
   * @param isFromCreateStudy : we are in creation mode
   */
  public launchLoadStudy(
    isstudyNeedLoaded: boolean,
    studyId: number,
    loadedStudy: LoadedStudy,
    isStudyLoaded: any,
    isFromCreateStudy: boolean,
    loadOnlyOntology = false
  ) {
    const messageObserver = {
      next: (message: string) =>
        this.loadingDialogService.updateMessage(message),
      complete: () => this.loadingDialogService.closeLoading(),
    };

    let loadedStudy$ = new Observable<LoadedStudy>((observer) => observer.next(null))
    if (isstudyNeedLoaded) {
      loadedStudy$ = this.studyCaseMainService.loadStudy(studyId, false);
    } 
    const studyCasePostProcessing$ = this.studyCasePostProcessingService.loadStudy(studyId, false);
    
    combineLatest([loadedStudy$, studyCasePostProcessing$]).subscribe({
      next: ([resultLoadedStudy, isLoaded]) => {
        if (isstudyNeedLoaded) {
          loadedStudy = resultLoadedStudy as LoadedStudy;
        }
        this.loadingDialogService.disableCancelLoading(true);
        this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedStudy, isStudyLoaded, isFromCreateStudy, loadOnlyOntology).subscribe(messageObserver);
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
       
        isStudyLoaded(false);
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
}
