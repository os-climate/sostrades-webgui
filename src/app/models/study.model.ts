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
    public isFavorite : boolean
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
      jsonData[StudyAttributes.ISFAVORITE]
      );
    return result;
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
    public loadInProgress: boolean,
    public canReload: boolean
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
      jsonData[LoadedStudyAttributes.LOAD_IN_PROGRESS],
      jsonData[LoadedStudyAttributes.CAN_RELOAD]);
    return result;
  }
}

/**
 * Interface for post request request
 * (study creation)
 */
export interface PostStudy {
  name: string;
  repository: string;
  process: string;
  group: number;
  reference: string;
  type: string;
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
  ISFAVORITE = 'isFavorite'
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
  LOAD_IN_PROGRESS = 'load_in_progress',
  CAN_RELOAD = 'can_reload'
}
