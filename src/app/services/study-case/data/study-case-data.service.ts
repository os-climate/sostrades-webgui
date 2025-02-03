import { Study, LoadedStudy, StudyCasePayload } from 'src/app/models/study.model';
import { Injectable, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { NodeData, IoType } from 'src/app/models/node-data.model';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { Location } from '@angular/common';
import { CoeditionNotification } from 'src/app/models/coedition-notification.model';
import { Scenario } from 'src/app/models/scenario.model';
import { DataHttpService } from '../../http/data-http/data-http.service';
import { OntologyService } from '../../ontology/ontology.service';
import { StudyFavorite } from 'src/app/models/study-case-favorite';
import { OntologyParameter } from 'src/app/models/ontology-parameter.model';
import { StudyCaseLogging } from 'src/app/models/study-case-logging.model';
import { StudyCaseAllocation, StudyCaseAllocationStatus } from 'src/app/models/study-case-allocation.model';
import { ColumnName, Routing } from 'src/app/models/enumeration.model';
import { Router } from '@angular/router';
import { LoggerService } from '../../logger/logger.service';
import { SnackbarService } from '../../snackbar/snackbar.service';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { LoadingStudyDialogService } from '../../loading-study-dialog/loading-study-dialog.service';
import { UserStudyPreferences } from 'src/app/models/user-study-preferences.model';

@Injectable({
  providedIn: 'root'
})
export class StudyCaseDataService extends DataHttpService {


  onLoadedStudyForTreeview: EventEmitter<LoadedStudy> = new EventEmitter();
  onStudyCaseChange: EventEmitter<LoadedStudy> = new EventEmitter();
  onSearchVariableChange: EventEmitter<string> = new EventEmitter();
  onTradeSpaceSelectionChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  onTreeNodeNavigation: EventEmitter<NodeData> = new EventEmitter<NodeData>();
  onShowDataManagementContent: EventEmitter<boolean> = new EventEmitter<boolean>();


  public tradeScenarioList: Scenario[];

  private studyLoaded: LoadedStudy;
  public studyCoeditionNotifications: CoeditionNotification[];
  public studyManagementData: Study[];
  public studyManagementFilter: string;
  public studyManagementColumnFiltered: string;
  public studySelectedValues = new Map <ColumnName, string[]>();


  public dataSearchResults: NodeData[];
  public dataSearchInput: string;
  public favoriteStudy: Study[];
  public lastStudyOpened: Study[];

  // Make innerLogs private so it's not accessible from the outside,
  // expose it as logs$ observable (read-only) instead.
  // Write to innerLogs only through specified store methods below.
  private readonly innerLogs = new BehaviorSubject<StudyCaseLogging[]>([]);

  // Exposed observable (read-only).
  readonly logs$ = this.innerLogs.asObservable();


  constructor(
    private http: HttpClient,
    private ontologyService: OntologyService,
    private location: Location,
    private loadingStudyDialogService: LoadingStudyDialogService,
    private loggerService: LoggerService,
    private snackbarService:SnackbarService,
    private router: Router) {
    super(location, 'study-case');
    this.studyLoaded = null;
    this.studyCoeditionNotifications = [];
    this.favoriteStudy = [];
    this.lastStudyOpened = [];
    this.studyManagementData = [];
    this.studyManagementFilter = '';
    this.studyManagementColumnFiltered = ColumnName.ALL_COLUMNS;
    this.studySelectedValues.clear();
    this.tradeScenarioList = [];
    this.dataSearchResults = [];
    this.dataSearchInput = '';
  }


  public get loadedStudy(): LoadedStudy {
    return this.studyLoaded;
  }

  setCurrentStudy(loadedStudy: LoadedStudy) {
    this.studyLoaded = loadedStudy;
  }

  clearCache() {
    this.studyLoaded = null;
    this.studyCoeditionNotifications = [];
    this.studyManagementData = [];
    this.favoriteStudy = [];
    this.lastStudyOpened = [];
    this.studySelectedValues.clear();
    this.studyManagementFilter = '';
    this.studyManagementColumnFiltered = ColumnName.ALL_COLUMNS;
    this.tradeScenarioList = [];
    this.dataSearchResults = [];
    this.dataSearchInput = '';
  }

  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API DATA          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------

  getStudies(): Observable<Study[]> {
    return this.http.get<Study[]>(this.apiRoute).pipe(map(
      response => {
        const studies: Study[] = [];
        response.forEach(study => {
          studies.push(Study.Create(study));
        });
        this.studyManagementData = studies;
        return studies;
      }));
  }

  getStudy(studyId: number): Observable<Study> {
    return this.http.get<Study>(`${this.apiRoute}/${studyId}`).pipe(map(
      response => {
        const study = Study.Create(response)
        this.studyManagementData.splice(0,0, study)
        return study;
      }));
  }

  check_study_already_exist(studyName: string, groupId: number) {
    const params = new HttpParams()
    .set('studyName', studyName)
    .set('groupId', groupId);

    return this.http.get<Study>(`${this.apiRoute}/exist`, { params: params }).pipe(map(
      response => {
        return response;
      }));
  }



  addFavoriteStudy(studyId: number, userId: number): Observable<StudyFavorite> {
    const payload = {
      study_id: studyId,
      user_id: userId,
    };
    return this.http.post<StudyFavorite>(`${this.apiRoute}/favorite`, payload, this.options).pipe(map(
      response => {
        return StudyFavorite.Create(response);
      }));
  }

  removeFavoriteStudy(studyId: number) {
    return this.http.delete(`${this.apiRoute}/${studyId}/favorite`);
  }

  updateStudyFlavor(studyId: number, flavor: string): Observable<boolean> {
    const payload = {
      study_id : studyId,
      flavor: flavor,
      restart: true
    };
    const url = `${this.apiRoute}/${studyId}/update-study-flavor`;
    return this.http.post<boolean>(url, payload, this.options).pipe(map(
      response => {
        return response;
      }));
  }

  updateExecutionFlavor(studyId: number, flavor: string): Observable<boolean> {
    const payload = {
      study_id : studyId,
      flavor: flavor
    };
    const url = `${this.apiRoute}/${studyId}/update-execution-flavor`;
    return this.http.post<boolean>(url, payload, this.options).pipe(map(
      response => {
        return response;
      }));
  }

  getExecutionFlavor(studyId: number): Observable<string> {

    const url = `${this.apiRoute}/${studyId}/get-execution-flavor`;
    return this.http.get<string>(url, this.options).pipe(map(
      response => {
        return response;
      }));
  }

  updateStudy(studyId: number, studyName: string, groupId: number): Observable<boolean> {
    const payload = {
      study_id : studyId,
      new_study_name: studyName,
      group_id: groupId,
    };
    const url = `${this.apiRoute}/${studyId}/edit`;
    return this.http.post<boolean>(url, payload, this.options).pipe(map(
      response => {
        return response;
      }));
  }

  copyStudy(studyId: number, studyName: string, groupId: number, flavor:string): Observable<Study> {
    const payload = {
      study_id : studyId,
      new_study_name: studyName,
      group_id: groupId,
      flavor: flavor
    };
    const url = `${this.apiRoute}/${studyId}/copy`;
    return this.http.post<Study>(url, payload, this.options).pipe(map(
      response => {
        return response;
      }));
  }

  

  getStudyNotifications(studyId: number): Observable<CoeditionNotification[]> {
    const url = `${this.apiRoute}/${studyId}/notifications`;
    return this.http.get<CoeditionNotification[]>(url).pipe(map(
      response => {
        const notifications: CoeditionNotification[] = [];
        response.forEach(notif => {
          notifications.push(CoeditionNotification.Create(notif));
        });
        this.studyCoeditionNotifications = notifications
        return notifications;
      }));
  }

  public checkPodStatusAndShowError(studyId:number, errorReceived: any, errorMessage:string, afterShowError=undefined){
    ///Show error message and Close the loading. In case of error 502 the allocation pod status is checked
    ///param studyId = the ID of the study
    ///param errorReceived = the error that have been raised
    ///param errorMessage = The message to show at the begining of the error (Error Loading study or error creating study...)
    if (errorReceived !== undefined){
      this.loggerService.log(errorReceived);
    }
    if (errorReceived === undefined || (errorReceived !== undefined && (errorReceived.statusCode == 502 || errorReceived.statusCode == 0))) {
      //if the error server is not available, get the pod status
      this.getStudyCaseAllocationStatus(studyId).subscribe(
        {next: (allocation) => {
          //show pod oomkilled message
          if (allocation.status === StudyCaseAllocationStatus.OOMKILLED){
            errorMessage = errorMessage + "\n" + StudyCaseAllocation.OOMKILLEDLABEL;
            
          }
          else if (allocation.status === StudyCaseAllocationStatus.ERROR &&  allocation.message){
            errorMessage = errorMessage+ " due to pod error: " + allocation.message;
          }
          else if (errorReceived !== undefined){
            errorMessage = errorMessage +"\n" + "Study server is not responding, it may be due to a network issue or a too small pod size.";
              
            }
            this.loadingStudyDialogService.setError(errorMessage);

            //do process after retreiving the status
            if (afterShowError !== undefined){
              afterShowError();
            }
            
        },
        error:(error)=> {
          this.loadingStudyDialogService.setError(errorMessage+"\n" + error.description);
          //do process after retreiving the status
          if (afterShowError !== undefined){
            afterShowError();
          }
        }
        }
      );
      
    }
    else {
      if (errorReceived !== undefined){
        this.loadingStudyDialogService.setError(errorMessage + "\n" + errorReceived.description);
      }
      else{
        this.loadingStudyDialogService.closeLoading();
      }
      
    }
    
    
  }

  addNewStudyNotificationForDatasetImport(studyId: number): Observable<number> {
    const url = `${this.apiRoute}/${studyId}/notification`;
    const payloadForNotification = {
      coedition_action : 'save',
      change_type: UpdateParameterType.DATASET_MAPPING_CHANGE
  };
    return this.http.post<number>(url, payloadForNotification, this.options).pipe(map(
      notification_id => {
        return notification_id;
      }));
  }

  addNewStudyNotificationForDatasetExport(studyId: number): Observable<number> {
    const url = `${this.apiRoute}/${studyId}/notification`;
    const payloadForNotification = {
      coedition_action : 'export',
      change_type: UpdateParameterType.DATASET_MAPPING_EXPORT
  };
    return this.http.post<number>(url, payloadForNotification, this.options).pipe(map(
      notification_id => {
        return notification_id;
      }));
  }


  getStudyParemeterChanges(studyId: number, notification_id: number): Observable<StudyUpdateParameter[]> {
    const url = `${this.apiRoute}/${studyId}/${notification_id}/parameter-changes`;
    return this.http.get<StudyUpdateParameter[]>(url).pipe(map(
      response => {
        const parametersChanges: StudyUpdateParameter[] = [];
        if (response !== null && response !== undefined && response.length > 0 ) {
            response.forEach(parameter => {
          parametersChanges.push(StudyUpdateParameter.Create(parameter));
          });
        } 
        return parametersChanges;
      }));
  }
  
  getAuthorizedStudiesForProcess(process, repository): Observable<Study[]> {
    const url = `${this.apiRoute}/process`;

    const request = {
      process_name: process,
      repository_name: repository
    };

    return this.http.post<Study[]>(url, request, this.options).pipe(map(
      response => {
        const studies: Study[] = [];
        response.forEach(study => {
          studies.push(Study.Create(study));
        });
        return studies;
      }));
  }

  getChangeFile(parameterKey: string, notificationId: number): Observable<ArrayBuffer> {

    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
    } = {
      responseType: 'arraybuffer'
    };
    const url = `${this.apiRoute}/${this.loadedStudy.studyCase.id}/parameter/change`;
    const data = {
      parameter_key: parameterKey,
      notification_id: notificationId
    };

    return this.http.post(url, data, options);
  }

  getRawStudyLogs(studyId): Observable<Blob> {

    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'blob';
    } = {
      responseType: 'blob'
    };
    const url = `${this.apiRoute}/raw-logs/download`;
    const data = {
      studyid: studyId
    };

    return this.http.post(url, data, options);
  }

  setUserStudyPreference(panelId: string, isExpanded: boolean): Observable<any> {
    this.loadedStudy.userStudyPreferences.expandedData[panelId] = isExpanded;
    return this.saveUserStudyPreferences(this.loadedStudy.studyCase.id, panelId, isExpanded);
  }

  getUserStudyPreference(panelId: string, defaultValue: boolean): boolean {
    if (this.loadedStudy.userStudyPreferences !== undefined) {
      if (this.loadedStudy.userStudyPreferences.expandedData[panelId] !== undefined) {
        return this.loadedStudy.userStudyPreferences.expandedData[panelId];
      }
    }
    return defaultValue;
  }

  public loadUserStudyPreferences(studyID: number): Observable<any> {
    // retreive study user preference
    return this.http.get(`${this.apiRoute}/${studyID}/preference`).pipe(map(
      response => {
        return UserStudyPreferences.Create(response);
      }));
  }

  private saveUserStudyPreferences(studyID: number, panelId: string, panelOpened ): Observable<any> {

    const request = {
      panel_identifier: panelId,
      panel_opened: panelOpened
    };
    const response = this.http.post(`${this.apiRoute}/${studyID}/preference`, request);
    return response
  }

  claimStudyExecutionRight(): Observable<any> {
    return this.http.post<any>(`${this.apiRoute}/${this.loadedStudy.studyCase.id}/user/execution`, null);
  }

  dataSearch(inputToSearch: string, showEditable: boolean, userLevel: number) {
    // search a text in data names or ontology names and display search panel

    this.dataSearchInput = inputToSearch;
    this.dataSearchResults = [];
    // search an inpupt into all data names
    Object.values(this.loadedStudy.treeview.rootNodeDataDict).forEach(nodeData => {
      let label = '';
      if (this.ontologyService.getParameter(nodeData.variableKey)) {
        label = this.ontologyService.getParameter(nodeData.variableKey).label;
      }

      if (nodeData.variableName.toLowerCase().includes(inputToSearch.toLowerCase()) ||
      (label !== undefined && label.toLowerCase().includes(inputToSearch.toLowerCase()))) {
        if ((nodeData.ioType === IoType.OUT || showEditable || (!showEditable && nodeData.editable)) &&
        (nodeData.userLevel <= userLevel)) {
          this.dataSearchResults.push(nodeData);
        }
      }
    });

    this.onSearchVariableChange.emit(inputToSearch);
  }

  resetSearch() {
    this.dataSearchInput = '';
    this.dataSearchResults = [];
  }

  isLoadedStudyForTreeview(loadedStudyForTreeview: LoadedStudy ) {
    this.onLoadedStudyForTreeview.emit(loadedStudyForTreeview);
  }

  updateParameterOntology(loadedStudy: LoadedStudy) {
    // loop on each treeNode data to update ontology name
    Object.entries(loadedStudy.treeview.rootDict).forEach(treeNode => {
      const treeNodeValue = treeNode[1];
      const treeNodeKey = treeNode[0];
      Object.entries(treeNodeValue.dataManagementDisciplineDict).forEach(discipline => {
        const disciplineValue = discipline[1];
        const disciplineKey = discipline[0];
        Object.entries(disciplineValue.numericalParameters).forEach(nodeData => {
          const nodeDataValue = nodeData[1];
          const nodeDataKey = nodeData[0];
          const ontologyParameter = this.ontologyService.getParameter(nodeDataValue.variableKey);
          if ( ontologyParameter !== null) {
            const displayName = this.GetOntologyParameterLabel(ontologyParameter);
            if (displayName !== '') {
              loadedStudy.treeview.rootDict[treeNodeKey].dataManagementDisciplineDict[disciplineKey].numericalParameters[nodeDataKey].displayName = displayName;
            }
          }
        });
        Object.entries(disciplineValue.disciplinaryInputs).forEach(nodeData => {
          const nodeDataValue = nodeData[1];
          const nodeDataKey = nodeData[0];
          const ontologyParameter = this.ontologyService.getParameter(nodeDataValue.variableKey);
          if ( ontologyParameter !== null) {
            const displayName = this.GetOntologyParameterLabel(ontologyParameter);
            if (displayName !== '') {
              loadedStudy.treeview.rootDict[treeNodeKey].dataManagementDisciplineDict[disciplineKey].disciplinaryInputs[nodeDataKey].displayName = displayName;
            }
          }
        });
        Object.entries(disciplineValue.disciplinaryOutputs).forEach(nodeData => {
          const nodeDataValue = nodeData[1];
          const nodeDataKey = nodeData[0];
          const ontologyParameter = this.ontologyService.getParameter(nodeDataValue.variableKey);
          if ( ontologyParameter !== null) {
            const displayName = this.GetOntologyParameterLabel(ontologyParameter);
            if (displayName !== '') {
              loadedStudy.treeview.rootDict[treeNodeKey].dataManagementDisciplineDict[disciplineKey].disciplinaryOutputs[nodeDataKey].displayName = displayName;
            }
          }
        });
      });
    });
  }

  private GetOntologyParameterLabel(ontology: OntologyParameter) {
    // return ontology label + unit
    let result = '';
    if (ontology !== null && ontology.label !== null && ontology.label !== undefined && ontology.label.length > 0) {

      result = ontology.label;

      if (ontology.unit !== null && ontology.unit !== undefined && ontology.unit.trim().length > 0) {
        result = `${result} [${ontology.unit}]`;
      } else {
        result = `${result} [-]`;
      }
    }
    return result;
  }

  deleteStudy(studies: Study[]): Observable<void> {
    const studiesIdList = [];
    studies.forEach(s => {
      studiesIdList.push(s.id);
    });
    const deleteOptions = {
      headers: this.httpHeaders,
      body: JSON.stringify({ studies: studiesIdList })
    };
    const url = `${this.apiRoute}/delete`;
    return this.http.delete(url, deleteOptions).pipe(map(
      () => {
        // Check user removed currentLoadedStudy
        if (this.loadedStudy !== null && this.loadedStudy !== undefined) {
          if (studies.filter(x => x.id === this.loadedStudy.studyCase.id).length > 0) {
            this.onStudyCaseChange.emit(null);
            const url = this.router.url;
            if (url.includes(Routing.STUDY_MANAGEMENT)) {
              this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
              } else {
              this.router.navigate([url]);
            }
          }
        }
      }));
  }

  //#regions logs

  private setLogs(logs: StudyCaseLogging[]): void {
    this.innerLogs.next(logs);
  }

  /**
   * Return the current logs store in the service without any update from server
   *
   * @returns list of {@link src/app/models/study-case-logging.model#StudyCaseLogging | the StudyCaseLogging class}
   *
   */
  getLogs(): StudyCaseLogging[] {

    return this.innerLogs.getValue();
  }

  /**
   * Request server to update log regarding the study identifier given as parameter
   *
   * @param studyCaseId - Study case identifier for whoch logs are requested
   *
   */
  getLog(studyCaseId: number) {

    const route = `${this.apiRoute}/logs/${studyCaseId}`;

    this.http.get<StudyCaseLogging[]>(route)
      .pipe(map(logs => {

        const result: StudyCaseLogging[] = [];

        logs.forEach(log => {
          result.push(StudyCaseLogging.Create(log));
        });

        this.setLogs(result);

      })).subscribe();
  }

  //#endregion logs

  //#region allocations

  /**
   * Create an allocation for a new study case
   * Once created, allocation status must be check with 'studyCaseAllocationStatus' method
   *
   * @param studyInformation Create an allocation for a new study case to create or for an existing study case
   * @returns instance of {@link src/app/models/study-case-allocation.model#StudyCaseAllocation | the StudyCaseAllocation class}
   */
  createAllocationForNewStudyCase(studyInformation: StudyCasePayload): Observable<StudyCaseAllocation> {

    let query: Observable<StudyCaseAllocation>;

    const allocationObservable = new Observable<StudyCaseAllocation>((observer) => {
      query = this.http.post<StudyCaseAllocation>(this.apiRoute, studyInformation, this.options);
      this.executeAllocationQuery(query, observer);
    });

    return allocationObservable;
  }

  /**
   * Create an allocation for an existing study case
   * Once created, allocation status must be check with 'studyCaseAllocationStatus' method
   *
   * @param studyCaseIdentifier Create an allocation for the given study case identifier
   * @returns instance of {@link /src/app/models/study-case-allocation.model#StudyCaseAllocation | the StudyCaseAllocation class}
   */
   createAllocationForExistingStudyCase(studyCaseIdentifier: number): Observable<StudyCaseAllocation> {

    let query: Observable<StudyCaseAllocation>;

    const allocationObservable = new Observable<StudyCaseAllocation>((observer) => {

      query = this.http.post<StudyCaseAllocation>(`${this.apiRoute}/${studyCaseIdentifier}`, {}, this.options);
      this.executeAllocationQuery(query, observer);
    });

    return allocationObservable;
  }

  /**
   * Create an allocation for a new study using an existing one
   * Once created, allocation status must be check with 'studyCaseAllocationStatus' method
   *
   * @param studyCaseIdentifier Source study case identifier used to create an allocation
   * @param newStudyName Name for the new study
   * @param groupId New group to which the study has to be assigned
   * @returns instance of {@link src/app/models/study-case-allocation.model#StudyCaseAllocation | the StudyCaseAllocation class}
   */
   createAllocationForCopyingStudyCase(
                          studyCaseIdentifier: number,
                          newStudyName: string,
                          groupId: number,
                          flavor: string): Observable<StudyCaseAllocation> {

    let query: Observable<StudyCaseAllocation>;

    const allocationObservable = new Observable<StudyCaseAllocation>((observer) => {

      const payload = {
        new_name: newStudyName,
        group_id: groupId,
        flavor: flavor
      };

      query = this.http.post<StudyCaseAllocation>(`${this.apiRoute}/${studyCaseIdentifier}/by/copy`, payload, this.options);
      this.executeAllocationQuery(query, observer);
    });

    return allocationObservable;
  }


  private executeAllocationQuery(query: Observable<StudyCaseAllocation>, observer: Subscriber<StudyCaseAllocation>) {
    query.pipe(map(
      response => {
        return StudyCaseAllocation.Create(response);
      })).subscribe({ 
        next: allocation => {
          if (allocation.status !== StudyCaseAllocationStatus.DONE){
            const startWaitingDate = Date.now()
            setTimeout(() => {
              this.getStudyCaseAllocationStatusTimeout(allocation.studyCaseId, observer, startWaitingDate);
            }, 2000);
          }
          else{
            observer.next(allocation);
          }
    },
    error: error => {
      observer.error(error);
    }}
    );
  }

  private getStudyCaseAllocationStatusTimeout(studyCaseId: number, allocationObservable: Subscriber<StudyCaseAllocation>, startWaitingDate: number) {
    this.internalStudyCaseAllocationStatus(studyCaseId).subscribe({
      next: allocation => {
        if (allocation.status !== StudyCaseAllocationStatus.DONE) {
          // if the pod is still at pending after one minutes, show potential problem message
          if (allocation.status === StudyCaseAllocationStatus.PENDING || allocation.status === StudyCaseAllocationStatus.NOT_STARTED){
          // if( Date.now() - startWaitingDate < 60000){
          //     this.loadingDialogService.updateMessage("Study pod is loading ...")
          //   }
          //   else{
          //     this.loadingDialogService.updateMessage("Study pod is still loading after a long time...\n \
          //     you can wait a little longer or maybe try again later")
             
          //   }
          }
          if (allocation.status === StudyCaseAllocationStatus.ERROR || allocation.status === StudyCaseAllocationStatus.OOMKILLED){
            allocationObservable.next(allocation);
          }
          else{
            setTimeout(() => {
              this.getStudyCaseAllocationStatusTimeout(allocation.studyCaseId, allocationObservable, startWaitingDate);
            }, 2000);
          }
          
        } else {
          allocationObservable.next(allocation);
        }

      }, error: error => {
        allocationObservable.error(error);
      }
    });
  }

  public getStudyCaseAllocationStatus(studyCaseId: number): Observable<StudyCaseAllocation> {
    let query: Observable<StudyCaseAllocation>;

    const allocationObservable = new Observable<StudyCaseAllocation>((observer) => {

      query = this.http.get<StudyCaseAllocation>(`${this.apiRoute}/${studyCaseId}/status`);
      this.executeAllocationQuery(query, observer);
    });

    return allocationObservable;
  }

  /**
   * Retrieve the current status of an allocation for the given study case identifier
   *
   * @param studyCaseId study case identifier for which allocation status has to be retrieve
   * @returns StudyCaseAllocationStatus
   */
  private internalStudyCaseAllocationStatus(studyCaseId: number): Observable<StudyCaseAllocation> {
    return this.http.get<StudyCaseAllocation>(`${this.apiRoute}/${studyCaseId}/status`).pipe(map(response => {
      return StudyCaseAllocation.Create(response);
    }));
  }


  //#endregion allocations
}
