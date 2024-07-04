import { TreeNode, TreeView } from './tree-node.model';
import { StudyReference } from './study-reference.model';
import { UserStudyPreferences } from './user-study-preferences.model';

export class Study {

  constructor(
    public id: number,
    public name: string,
    public process: string,
    public repository: string,
    public description: string,
    public creationDate: Date,
    public modificationDate: Date,
    public executionStatus: string,
    public creationStatus: string,
    public studyType: string,
    public groupName: string,
    public groupId: number,
    public groupConfidential: boolean,
    public repositoryDisplayName: string,
    public processDisplayName: string,
    public isRegeneratingReference: boolean,
    public regenerationId: number,
    public regenerationStatus: string,
    public isManager: boolean,
    public isContributor: boolean,
    public isCommenter: boolean,
    public isRestrictedViewer: boolean,
    public isFavorite: boolean,
    public isLastStudyOpened: boolean,
    public openingDate: Date,
    public error: string,
    public studyPodFlavor:string,
    public executionPodFlavor:string,
    public generationPodFlavor:string,
    public last_cpu_usage:string,
    public last_memory_usage:string,

  ) {
  }

  public static Create(jsonData: any): Study {
    const result: Study = new Study(
      jsonData[StudyAttributes.ID],
      jsonData[StudyAttributes.NAME],
      jsonData[StudyAttributes.PROCESS],
      jsonData[StudyAttributes.REPOSITORY],
      jsonData[StudyAttributes.DESCRIPTION],
      jsonData[StudyAttributes.CREATIONDATE],
      jsonData[StudyAttributes.MODIFICATIONDATE],
      jsonData[StudyAttributes.EXECUTION_STATUS],
      jsonData[StudyAttributes.CREATION_STATUS],
      jsonData[StudyAttributes.STUDY_TYPE],
      jsonData[StudyAttributes.GROUP_NAME],
      jsonData[StudyAttributes.GROUP_ID],
      jsonData[StudyAttributes.GROUP_CONFIDENTIAL],
      jsonData[StudyAttributes.REPOSITORYDISPLAYNAME],
      jsonData[StudyAttributes.PROCESSDISPLAYNAME],
      jsonData[StudyAttributes.ISREFERENCERUNNING],
      jsonData[StudyAttributes.REGENERATIONID],
      jsonData[StudyAttributes.REGENERATIONSTATUS],
      jsonData[StudyAttributes.ISMANAGER],
      jsonData[StudyAttributes.ISCONTRIBUTOR],
      jsonData[StudyAttributes.ISCOMMENTER],
      jsonData[StudyAttributes.ISRESTRICTEDVIEWER],
      jsonData[StudyAttributes.ISFAVORITE],
      jsonData[StudyAttributes.IS_LAST_STUDY_OPENED],
      jsonData[StudyAttributes.OPENING_DATE],
      jsonData[StudyAttributes.ERROR],
      jsonData[StudyAttributes.STUDY_POD_FLAVOR],
      jsonData[StudyAttributes.EXECUTION_POD_FLAVOR],
      jsonData[StudyAttributes.GENERATION_POD_FLAVOR],
      jsonData[StudyAttributes.LAST_CPU_USAGE],
      jsonData[StudyAttributes.LAST_MEMORY_USAGE],
      );
    return result;
  }

  get executionStatusLabel():string {
    return 'EXECUTION ' + this.executionStatus;
  }
}

export class LoadedStudy {
  constructor(
    public studyCase: Study,
    public treeview: TreeView,
    public refList: StudyReference[],
    public n2Diagram: {},
    public userIdExecutionAuthorized: number,
    public noData: boolean,
    public readOnly: boolean,
    public userStudyPreferences: UserStudyPreferences,
    public canReload: boolean,
    public loadStatus: LoadStatus,
    public dashboard: {}
  ) { }

  public static Create(jsonData: any): LoadedStudy {
    const result: LoadedStudy = new LoadedStudy(
      Study.Create(
        jsonData[LoadedStudyAttributes.STUDYCASE]),
      TreeView.Create(
        jsonData[LoadedStudyAttributes.TREENODE],
        jsonData[LoadedStudyAttributes.POSTPROCESSINGS]),
      [],
      jsonData[LoadedStudyAttributes.N2DIAGRAM],
      jsonData[LoadedStudyAttributes.USERIDEXECUTIONAUTHORIZED],
      jsonData[LoadedStudyAttributes.NODATA],
      jsonData[LoadedStudyAttributes.READONLY],
      UserStudyPreferences.Create(jsonData[LoadedStudyAttributes.PREFERENCE]),
      jsonData[LoadedStudyAttributes.CAN_RELOAD],
      jsonData[LoadedStudyAttributes.LOAD_STATUS],
      jsonData[LoadedStudyAttributes.DASHBOARD]);
    return result;
  }
}

/**
 * Interface for post request request
 * (study creation)
 */
export class StudyCasePayload {
  constructor(public name: string,
              public repository: string,
              public process: string,
              public group: number,
              public reference: string,
              public type: string,
              public flavor: string) { }
}

/**
 * Data interface to request a study case allocation
 */
export class StudyCaseAllocationPayload {
  constructor(public name: string,
              public repository: string,
              public process: string,
              public group: number) { }
}

/**
 * Data interface to request a study case initial setup
 * (generally after a succeeded allocation)
 */
export class StudyCaseInitialSetupPayload {
  constructor(public studyCaseIdentifier: number,
              public reference: string,
              public type: string) { }
}


export enum StudyAttributes {
  ID = 'id',
  NAME = 'name',
  PROCESS = 'process',
  REPOSITORY = 'repository',
  DESCRIPTION = 'description',
  CREATIONDATE = 'creation_date',
  MODIFICATIONDATE = 'modification_date',
  EXECUTION_STATUS = 'execution_status',
  CREATION_STATUS = 'creation_status',
  STUDY_TYPE = 'study_type',
  GROUP_NAME = 'group_name',
  GROUP_ID = 'group_id',
  GROUP_CONFIDENTIAL = 'group_confidential',
  REPOSITORYDISPLAYNAME = 'repository_display_name',
  PROCESSDISPLAYNAME = 'process_display_name',
  ISREFERENCERUNNING = 'is_reference_running',
  REGENERATIONID = 'regeneration_id',
  REGENERATIONSTATUS = 'regeneration_status',
  ISMANAGER = 'is_manager',
  ISCONTRIBUTOR = 'is_contributor',
  ISCOMMENTER = 'is_commenter',
  ISRESTRICTEDVIEWER = 'is_restricted_viewer',
  ISFAVORITE = 'is_favorite',
  IS_LAST_STUDY_OPENED = 'is_last_study_opened',
  OPENING_DATE = 'opening_date',
  ERROR = 'error',
  STUDY_POD_FLAVOR = 'study_pod_flavor',
  EXECUTION_POD_FLAVOR = 'execution_pod_flavor',
  GENERATION_POD_FLAVOR = 'generation_pod_flavor',
  LAST_CPU_USAGE = 'last_cpu_usage',
  LAST_MEMORY_USAGE = 'last_memory_usage',
}

export enum LoadedStudyAttributes {
  STUDYCASE = 'study_case',
  TREENODE = 'treenode',
  POSTPROCESSINGS = 'post_processings',
  PLOTLY = 'plotly',
  N2DIAGRAM = 'n2_diagram',
  USERIDEXECUTIONAUTHORIZED = 'user_id_execution_authorized',
  NODATA = 'no_data',
  READONLY = 'read_only',
  PREFERENCE = 'preference',
  CAN_RELOAD = 'can_reload',
  LOAD_STATUS = 'load_status',
  DASHBOARD = 'dashboard'
}

export enum LoadStatus {
  NONE = 'none',
  IN_PROGESS = 'in_progress',
  READ_ONLY_MODE = 'read_only_mode',
  LOADED = 'loaded',
  IN_ERROR = 'in_error'
}

export enum CreationStatus {
  CREATION_DONE = 'CREATION DONE',
  
}
