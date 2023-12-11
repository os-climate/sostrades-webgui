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
import { StudyCaseAllocationStatus } from "src/app/models/study-case-allocation.model";
import { StudyCaseLoadingService } from "../study-case-loading/study-case-loading.service";
import { PostProcessingService } from "../post-processing/post-processing.service";
import { Router } from "@angular/router";
import { Routing } from "src/app/models/routing.model";
import { StudyCaseLocalStorageService } from "../study-case-local-storage/study-case-local-storage.service";
import { UserService } from "../user/user.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AppDataService extends DataHttpService {
  // Timer use to check connection status server side
  private connectionStatusTimer;
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

    this.studyCaseDataService.createAllocationForNewStudyCase(study).subscribe(
      (allocation) => {
        if (allocation.status === StudyCaseAllocationStatus.DONE) {
          const studyInformation = new StudyCaseInitialSetupPayload(
            allocation.studyCaseId,
            study.reference,
            study.type
          );

          // Request serveur for study case data
          this.studyCaseMainService
            .createStudy(studyInformation, false)
            .subscribe(
              (loadedStudy) => {
                // after creation, load the study into post processing
                // must be done after the end of the creation, if not the loading cannot be done
                this.studyCasePostProcessingService
                  .loadStudy(loadedStudy.studyCase.id, false)
                  .subscribe(
                    (isLoaded) => {
                      // load the last elements of the study and update current loaded study
                      this.studyCaseLoadingService
                        .finalizeLoadedStudyCase(
                          loadedStudy,
                          isStudyCreated,
                          true,
                          false
                        )
                        .subscribe(messageObserver);
                    },
                    (errorReceived) => {
                      this.snackbarService.showError(
                        "Error creating study\n" + errorReceived.description
                      );
                      isStudyCreated(false);
                      this.loadingDialogService.closeLoading();
                    }
                  );
              },
              (errorReceived) => {
                this.snackbarService.showError(
                  "Error creating study\n" + errorReceived.description
                );
                isStudyCreated(false);
                this.loadingDialogService.closeLoading();
              }
            );
        } else {
          this.snackbarService.showError("Study case allocation failed");
          isStudyCreated(false);
          messageObserver.complete();
        }
      },
      (errorReceived) => {
        this.snackbarService.showError(
          "Error creating study\n" + errorReceived.description
        );
        isStudyCreated(false);
        messageObserver.complete();
      }
    );
  }

  copyCompleteStudy(
    studyId: number,
    newName: string,
    groupId: number,
    isStudyCreated: any
  ) {
    const messageObserver = {
      next: (message: string) =>
        this.loadingDialogService.updateMessage(message),
      complete: () => this.loadingDialogService.closeLoading(),
    };

    // Display loading message
    messageObserver.next(`Creating copy of study case : "${newName}"`);

    this.studyCaseDataService
      .createAllocationForCopyingStudyCase(studyId, newName, groupId)
      .subscribe(
        (allocation) => {
          if (allocation.status === StudyCaseAllocationStatus.DONE) {
            // Request serveur for study case data
            this.studyCaseMainService
              .copyStudy(studyId, allocation.studyCaseId)
              .subscribe(
                (loadedStudy) => {
                  // after creation, load the study into post processing
                  // must be done after the end of the creation, if not the loading cannot be done
                  loadedStudy = loadedStudy as LoadedStudy;
                  this.studyCasePostProcessingService
                    .loadStudy(loadedStudy.studyCase.id, false)
                    .subscribe(
                      (isLoaded) => {
                        // load the last elements of the study and update current loaded study
                        this.studyCaseLoadingService
                          .finalizeLoadedStudyCase(
                            loadedStudy,
                            isStudyCreated,
                            true,
                            false
                          )
                          .subscribe(messageObserver);
                      },
                      (errorReceived) => {
                        this.snackbarService.showError(
                          "Error copying study\n" + errorReceived.description
                        );
                        isStudyCreated(false);
                        this.loadingDialogService.closeLoading();
                      }
                    );
                },
                (errorReceived) => {
                  this.snackbarService.showError(
                    "Error copying study\n" + errorReceived.description
                  );
                  isStudyCreated(false);
                  this.loadingDialogService.closeLoading();
                }
              );
          } else {
            this.snackbarService.showError("Study case allocation failed");
            isStudyCreated(false);
            this.loadingDialogService.closeLoading();
          }
        },
        (errorReceived) => {
          this.snackbarService.showError(
            "Error copying study\n" + errorReceived.description
          );
          isStudyCreated(false);
          this.loadingDialogService.closeLoading();
        }
      );
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

    this.studyCaseDataService
      .createAllocationForExistingStudyCase(studyId)
      .subscribe(
        (allocation) => {
          if (allocation.status === StudyCaseAllocationStatus.DONE) {
            if (loadingCanceled === true) {
            } else {
              this.studyCaseMainService
                .loadtudyInReadOnlyModeIfNeeded(studyId)
                .subscribe(
                  (loadedStudy) => {
                    if (loadingCanceled === true) {
                    } else {
                      if (
                        loadedStudy.loadStatus === LoadStatus.READ_ONLY_MODE
                      ) {
                        this.loadingDialogService.disableCancelLoading(true);

                        // clear post processing dictionnary
                        this.postProcessingService.clearPostProcessingDict();

                        // Set post processing dictionnary from the loaded study
                        this.postProcessingService.setPostProcessing(
                          loadedStudy
                        );
                        // load read only mode
                        this.studyCaseLoadingService
                          .finalizeLoadedStudyCase(
                            loadedStudy,
                            isStudyLoaded,
                            false,
                            true
                          )
                          .subscribe(messageObserver);
                      } else {
                        const studyNeedsLoading =
                          loadedStudy.loadStatus !== LoadStatus.LOADED;
                        this.launchLoadStudy(
                          studyNeedsLoading,
                          loadedStudy.studyCase.id,
                          loadedStudy,
                          isStudyLoaded,
                          true,
                          false
                        );
                      }
                    }
                  },
                  (errorReceived) => {
                    this.loggerService.log(errorReceived);
                    this.snackbarService.showError(
                      "Error loading study\n" + errorReceived.description
                    );
                    const studyNeedsLoading = true;
                    this.launchLoadStudy(
                      studyNeedsLoading,
                      studyId,
                      null,
                      isStudyLoaded,
                      true,
                      false
                    );
                  }
                );
            }
          } else {
            this.snackbarService.showError("Study case allocation failed");
            isStudyLoaded(false);
            this.loadingDialogService.closeLoading();
          }
        },
        (errorReceived) => {
          this.snackbarService.showError(
            "Error loading study\n" + errorReceived.description
          );
          isStudyLoaded(false);
          this.loadingDialogService.closeLoading();
        }
      );
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

    this.studyCaseDataService
      .createAllocationForExistingStudyCase(studyId)
      .subscribe(
        (allocation) => {
          if (allocation.status === StudyCaseAllocationStatus.DONE) {
            this.studyCaseMainService.loadStudy(studyId, true, false).subscribe(
              (loadedStudy) => {
                this.postProcessingService.addPostProcessingAfterSwitchEditionMode(
                  loadedStudy
                );
                const studyNeedsLoading =
                  loadedStudy.loadStatus !== LoadStatus.LOADED;
                this.launchLoadStudy(
                  studyNeedsLoading,
                  loadedStudy.studyCase.id,
                  loadedStudy,
                  isStudyLoaded,
                  true,
                  false
                );
              },
              (errorReceived) => {
                this.loggerService.log(errorReceived);
                this.snackbarService.showError(
                  "Error loading study\n" + errorReceived.description
                );
                this.loadingDialogService.closeLoading();
              }
            );
          } else {
            this.snackbarService.showError("Study case allocation failed");
            this.loadingDialogService.closeLoading();
          }
        },
        (errorReceived) => {
          this.snackbarService.showError(
            "Error loading study\n" + errorReceived.description
          );
          this.loadingDialogService.closeLoading();
        }
      );
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

    const loadingCalls = [];

    if (isstudyNeedLoaded) {
      loadingCalls.push(this.studyCaseMainService.loadStudy(studyId, false));
    } else {
      loadingCalls.push(
        new Observable<LoadedStudy>((observer) => observer.next(null))
      );
    }

    loadingCalls.push(
      this.studyCasePostProcessingService.loadStudy(studyId, false)
    );
    combineLatest(loadingCalls).subscribe(
      ([resultLoadedStudy, isLoaded]) => {
        if (isstudyNeedLoaded) {
          loadedStudy = resultLoadedStudy as LoadedStudy;
        }
        this.loadingDialogService.disableCancelLoading(true);
        this.studyCaseLoadingService
          .finalizeLoadedStudyCase(
            loadedStudy,
            isStudyLoaded,
            isFromCreateStudy,
            loadOnlyOntology
          )
          .subscribe(messageObserver);
        if (
          this.studyCaseLocalStorageService.studyHaveUnsavedChanges(
            studyId.toString()
          )
        ) {
          this.loadingDialogService.updateMessage(`Loading unsaved changes`);
          let studyParameters: StudyUpdateParameter[] = [];
          // tslint:disable-next-line: max-line-length
          studyParameters =
            this.studyCaseLocalStorageService.getStudyParametersFromLocalStorage(
              studyId.toString()
            );

          studyParameters.forEach((element) => {
            // tslint:disable-next-line: max-line-length
            this.studyCaseDataService.loadedStudy.treeview.rootNodeDataDict[
              element.variableId
            ].value = element.newValue;
          });
        }
      },
      (errorReceived) => {
        this.loggerService.log(errorReceived);
        this.snackbarService.showError(
          "Error loading study\n" + errorReceived.description
        );
        isStudyLoaded(false);
        this.loadingDialogService.closeLoading();
      }
    );
  }

  public startConnectionStatusTimer() {

    this.connectionStatusTimer = setTimeout(() => {
      this.userService.getCurrentUser().subscribe((_) => {
        this.startConnectionStatusTimer();
        if (this.hasNoServerAvailable) {
          this.hasNoServerAvailable = false;
          this.onNoServerResponse.emit(this.hasNoServerAvailable);
        }
      }, error => {
        this.loggerService.log('Error getting current user : ', error);
        console.log(error);
        if (error.statusCode == 502) {
          this.startConnectionStatusTimer();
          this.hasNoServerAvailable = true;
          this.onNoServerResponse.emit(this.hasNoServerAvailable);
        } else {
          this.stopConnectionStatusTimer();
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
    if (this.platformInfo !== null && this.platformInfo !== undefined) {
       return of(this.platformInfo);
    }
    else {
      return this.http.get(this.apiRoute + "/infos").pipe(map(
        response => {
          this.platformInfo = response
          return this.platformInfo;      
        }
      ));  
    }
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
