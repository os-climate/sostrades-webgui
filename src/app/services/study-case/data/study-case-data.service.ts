import { Study, LoadedStudy, StudyCasePayload, StudyCaseAllocationPayload } from 'src/app/models/study.model';
import { Injectable, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { NodeData, IoType } from 'src/app/models/node-data.model';
import { BehaviorSubject, Observable, Subscriber, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { CoeditionNotification } from 'src/app/models/coedition-notification.model';
import { UserStudyPreferences } from 'src/app/models/user-study-preferences.model';
import { Scenario } from 'src/app/models/scenario.model';
import { DataHttpService } from '../../http/data-http/data-http.service';
import { OntologyService } from '../../ontology/ontology.service';
import { StudyFavorite } from 'src/app/models/study-case-favorite';
import { OntologyParameter } from 'src/app/models/ontology-parameter.model';
import { StudyCaseLogging } from 'src/app/models/study-case-logging.model';
import { ColumnName } from 'src/app/models/column-name.model';
import { StudyCaseAllocation, StudyCaseAllocationStatus } from 'src/app/models/study-case-allocation.model';
import { Routing } from 'src/app/models/routing.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StudyCaseDataService extends DataHttpService {


  onStudyCompleted: EventEmitter<boolean> = new EventEmitter();
  onLoadedStudyForTreeview: EventEmitter<LoadedStudy> = new EventEmitter();
  onStudyCaseChange: EventEmitter<LoadedStudy> = new EventEmitter();
  onSearchVariableChange: EventEmitter<string> = new EventEmitter();
  onTradeSpaceSelectionChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  onTreeNodeNavigation: EventEmitter<NodeData> = new EventEmitter<NodeData>();

  public tradeScenarioList: Scenario[];

  private studyLoaded: LoadedStudy;

  public studyManagementData: Study[];
  public studyManagementFilter: string;
  public studyManagementColumnFiltered: string;
  public studySelectedValues = new Map <ColumnName, string[]>();


  public dataSearchResults: NodeData[];
  public dataSearchInput: string;
  public favoriteStudy: Study[];

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
    private router: Router) {
    super(location, 'study-case');
    this.studyLoaded = null;

    this.favoriteStudy = [];
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
    this.studyManagementData = [];
    this.favoriteStudy = [];
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
        return studies;
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

  removeFavoriteStudy(studyId: number, userId: number) {
    return this.http.delete(`${this.apiRoute}/${studyId}/favorite`);
  }

  updateStudy(studyId: number, studyName: string, groupId: number): Observable<boolean> {
    const payload = {
      study_id : studyId,
      new_study_name: studyName,
      group_id: groupId
    };
    const url = `${this.apiRoute}/${studyId}/edit`;
    return this.http.post<boolean>(url, payload, this.options).pipe(map(
      response => {
        return response;
      }));
  }

  copyStudy(studyId: number, studyName: string, groupId: number): Observable<Study> {
    const payload = {
      study_id : studyId,
      new_study_name: studyName,
      group_id: groupId
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
        return notifications;
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

  SetUserStudyPreference(TreeNodeOrPanelId: string, isExpanded: boolean): Observable<any> {
    this.loadedStudy.userStudyPreferences.treeNodeExpandedData[TreeNodeOrPanelId] = isExpanded;
    return this.SaveUserStudyPreferences(this.loadedStudy.studyCase.id, this.loadedStudy.userStudyPreferences);
  }

  GetUserStudyPreference(TreeNodeOrPanelId: string, defaultValue: boolean): boolean {
    if (this.loadedStudy.userStudyPreferences !== undefined) {
      if (this.loadedStudy.userStudyPreferences.treeNodeExpandedData[TreeNodeOrPanelId] !== undefined) {
        return this.loadedStudy.userStudyPreferences.treeNodeExpandedData[TreeNodeOrPanelId];
      }
    }
    return defaultValue;
  }

  private SaveUserStudyPreferences(studyID: number, userStudyPreferences: UserStudyPreferences): Observable<any> {

    const request = {
      preference: userStudyPreferences.treeNodeExpandedData,
    };
    return this.http.post(`${this.apiRoute}/${studyID}/preference`, request);
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
      Object.entries(treeNodeValue.data).forEach(nodeData => {
        const nodeDataValue = nodeData[1];
        const nodeDataKey = nodeData[0];
        const ontologyParameter = this.ontologyService.getParameter(nodeDataValue.variableKey);
        if ( ontologyParameter !== null) {
          const displayName = this.GetOntologyParameterLabel(ontologyParameter);
          if (displayName !== '') {
            loadedStudy.treeview.rootDict[treeNodeKey].data[nodeDataKey].displayName = displayName;
          }
        }
      });
      Object.entries(treeNodeValue.dataDisc).forEach(nodeData => {
        const nodeDataValue = nodeData[1];
        const nodeDataKey = nodeData[0];
        const ontologyParameter = this.ontologyService.getParameter(nodeDataValue.variableKey);
        if ( ontologyParameter !== null) {
          const displayName = this.GetOntologyParameterLabel(ontologyParameter);
          if (displayName !== '') {
            loadedStudy.treeview.rootDict[treeNodeKey].dataDisc[nodeDataKey].displayName = displayName;
          }
        }
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
      response => {
        // Check user removed currentLoadedStudy
        if (this.loadedStudy !== null && this.loadedStudy !== undefined) {
          if (studies.filter(x => x.id === this.loadedStudy.studyCase.id).length > 0) {
            this.onStudyCaseChange.emit(null);
            this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
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

      const studyCaseAllocationPayload = new  StudyCaseAllocationPayload(
                                                          studyInformation.name,
                                                          studyInformation.repository,
                                                          studyInformation.process,
                                                          studyInformation.group);
      query = this.http.post<StudyCaseAllocation>(this.apiRoute, studyCaseAllocationPayload, this.options);
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
                          groupId: number): Observable<StudyCaseAllocation> {

    let query: Observable<StudyCaseAllocation>;

    const allocationObservable = new Observable<StudyCaseAllocation>((observer) => {

      const payload = {
        new_name: newStudyName,
        group_id: groupId
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
      })).subscribe(allocation => {
      setTimeout(() => {
        this.getStudyCaseAllocationStatusTimeout(allocation.studyCaseId, observer);
      }, 2000);
    },
    error => {
      observer.error(error);
    });
  }

  private getStudyCaseAllocationStatusTimeout(studyCaseId: number, allocationObservable: Subscriber<StudyCaseAllocation>) {
    this.internalStudyCaseAllocationStatus(studyCaseId).subscribe(allocation => {
      if (allocation.status === StudyCaseAllocationStatus.IN_PROGRESS) {
        setTimeout(() => {
          this.getStudyCaseAllocationStatusTimeout(allocation.studyCaseId, allocationObservable);
        }, 2000);
      } else {
        allocationObservable.next(allocation);
      }

    }, error => {
      throw(error);
    });
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
