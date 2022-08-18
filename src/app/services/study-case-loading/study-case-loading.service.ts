import { LoadedStudy} from 'src/app/models/study.model';
import { Injectable, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { combineLatest, Observable, Subscriber } from 'rxjs';
import { StudyCaseValidationService } from '../study-case-validation/study-case-validation.service';
import { StudyCaseDataService } from '../study-case/data/study-case-data.service';
import { StudyCaseValidation, ValidationTreeNodeState } from 'src/app/models/study-case-validation.model';
import { StudyCaseExecutionObserverService } from 'src/app/services/study-case-execution-observer/study-case-execution-observer.service';
import { OntologyService } from '../ontology/ontology.service';
import { SnackbarService } from '../snackbar/snackbar.service';
import { LoadingDialogService } from '../loading-dialog/loading-dialog.service';
import { PostOntology } from 'src/app/models/ontology.model';
import { TreenodeTools } from 'src/app/tools/treenode.tool';
import { SocketService } from '../socket/socket.service';
import { CoeditionNotification } from 'src/app/models/coedition-notification.model';


@Injectable({
  providedIn: 'root'
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
    private loadingDialogService: LoadingDialogService,
    private studyCaseExecutionObserverService: StudyCaseExecutionObserverService) {
        this.onLoadStudy = null;
        this.onLoadreadOnlyStudy = null;
        
  }

    /**
     * 
     * @param loadedStudy 
     * @param getNotification 
     * @param isStudyCreated 
     * @param isReadOnlyMode 
     * @param isFromCreateStudy 
     * @param withEmit 
     */
    public finalizeLoadedStudyCase(loadedStudy: LoadedStudy, getNotification: boolean, isStudyCreated: any,
        showMsgInPopup: boolean, isFromCreateStudy: boolean, withEmit: boolean) {
        
        const studyId = loadedStudy.studyCase.id;
        if (this.studyCaseDataService.isStudyLoading(studyId)){
            // Assign study to data service
            this.updateStudyCaseDataService(loadedStudy);

            if (isFromCreateStudy) {
                this.studyCaseDataService.getStudies().subscribe(studies => {
                    this.studyCaseDataService.studyManagementData = studies;
                });
            }

            if (withEmit && this.studyCaseDataService.isStudyLoading(studyId)) {
                this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
            }

            // Load logs
            if (showMsgInPopup) {
                this.loadingDialogService.updateMessage('Load study logs');
            } 
            this.studyCaseDataService.getLog(loadedStudy.studyCase.id);
            this.studyCaseDataService.tradeScenarioList = [];

            if (showMsgInPopup) {
                if (getNotification){
                    this.loadingDialogService.updateMessage(`Loading ontology and notifications`);
                }
                else{
                    this.loadingDialogService.updateMessage(`Loading ontology`);
                }
            }
                 
            const calls = [];
            calls.push(this.loadOntology(loadedStudy));
            calls.push(this.loadNotifications(getNotification, loadedStudy.studyCase.id));
            calls.push(this.loadValidations(loadedStudy.studyCase.id));
            
            combineLatest(calls).subscribe(([resultVoid,resultnotifications, resultValidation]) => {
                
                if (showMsgInPopup) {
                    this.loadingDialogService.updateMessage('Loading ontology');
                } 
                this.studyCaseDataService.updateParameterOntology(loadedStudy);
                
                if (getNotification){
                    if (showMsgInPopup) {
                        this.loadingDialogService.updateMessage('Loading notifications');
                    } 
                    const notifications = resultnotifications as CoeditionNotification[];
                    this.socketService.notificationList = notifications;
                }
                if (showMsgInPopup) {
                    this.loadingDialogService.updateMessage('Loading validation');
                } 
                Object.values(this.studyCaseDataService.loadedStudy.treeview.rootDict).forEach(
                    element => {
                      const studyCaseValidation = this.studyCaseValidationService.studyValidationDict[element.fullNamespace];
              
                      if ((studyCaseValidation !== undefined) &&  (studyCaseValidation !== null)) {
                          element.isValidated = studyCaseValidation[0].validationState === ValidationTreeNodeState.VALIDATED;
                        }
                   });
                    
                // to update the treeview -> check if the study is still open
                if (this.studyCaseDataService.isStudyLoading(studyId)){
                    if (showMsgInPopup) {
                        this.loadingDialogService.updateMessage('Refreshing study case data');
                    }
                    else {
                        this.snackbarService.showInformation('Refreshing study case data');
                    }   
                    //end loading
                    this.close_loading(loadedStudy, isStudyCreated);
                }

            }, errorReceived => {

                // Notify user
                this.snackbarService.showError(`Error while loading, the following error occurs: ${errorReceived.description}`);

                this.close_loading(loadedStudy, isStudyCreated);
            });
        
    }
  }

  private loadOntology(loadedStudy: LoadedStudy): Observable<void>{
        // Prepare Ontology request inputs
        const ontologyRequest: PostOntology = {
            ontology_request: {
            disciplines: [],
            parameter_usages: []
            }
        };
    
        // Extract ontology input data from study
        const root = loadedStudy.treeview.rootNode;
        TreenodeTools.recursiveTreenodeExtract(root, ontologyRequest);
    
        // Call ontology service
        return this.ontologyService.loadOntologyStudy(ontologyRequest);
  }


  private loadNotifications(getNotifications: boolean, studyId: number): Observable<CoeditionNotification[]> {
    if (getNotifications){
        return this.studyCaseDataService.getStudyNotifications(studyId);
    }
    else{
        //return a function that does nothing
        return new Observable<CoeditionNotification[]>(observer=> observer.next(null));
    }

  }


  public loadValidations(studyId: number): Observable<StudyCaseValidation[]> {
        return this.studyCaseValidationService.loadStudyValidationData(studyId);

  }

  private updateStudyCaseDataService(loadedStudy: LoadedStudy) {
    const currentLoadedStudy = this.studyCaseDataService.loadedStudy;

    if ((currentLoadedStudy !== null) && (currentLoadedStudy !== undefined)) {
      this.studyCaseExecutionObserverService.removeStudyCaseObserver(currentLoadedStudy.studyCase.id);
    }

    this.studyCaseDataService.setCurrentStudy(loadedStudy);
    this.studyCaseDataService.isLoadedStudyForTreeview(loadedStudy);  
  }

  

  private close_loading(loadedStudy: LoadedStudy, isStudyLoaded: any) {
    if (this.studyCaseDataService.isStudyLoading(loadedStudy.studyCase.id)){
      // Notify components observing study case status
      this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);

      isStudyLoaded(true);
    }
    this.loadingDialogService.closeLoading();
  }

}

