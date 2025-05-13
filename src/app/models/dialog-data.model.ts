import { Study } from './study.model';
import { User } from './user.model';
import { StudyUpdateParameter } from './study-update.model';
import { EntityRight, EntityResourceRights } from './entity-right.model';
import { AccessRight } from './access-right.model';
import { NodeData } from './node-data.model';
import { Process } from './process.model';
import { OntologyParameter } from './ontology-parameter.model';
import { OntologyModelStatus } from './ontology-model-status.model';
import { TreeNode } from './tree-node.model';
import { LoadedGroup } from './group.model';
import { ColumnName } from './enumeration.model';
import { LoadingDialogStep } from './loading-study-dialog.model';
import { Flavor } from './flavor.model';

export abstract class AbstractDialogData {
  cancel: boolean;

  public constructor() {
    this.cancel = false;
  }
}

export class LoadingStudyDialogData extends AbstractDialogData {
  step: LoadingDialogStep
  title:string

  public constructor() {
    super();
    this.step = LoadingDialogStep.ACCESSING_STUDY_SERVER;
    this.title = ""
  }
}

export class LoadingDialogData extends AbstractDialogData {
  message: string;
  showCancelButton: boolean;

  public constructor() {
    super();
    this.message = '';
    this.showCancelButton = false;
  }
}

export class AddOrganizationDialogData extends AbstractDialogData {
  organizationName: string;

  public constructor() {
    super();
    this.organizationName = '';
  }
}


export class UpdateEntityRightDialogData extends AbstractDialogData {
  ressourceId: number;
  ressourceName: string;
  resourceType: EntityResourceRights;
  getEntitiesRightsFunction: any;

  public constructor() {
    super();
    this.ressourceId = null;
    this.ressourceName = '';
    this.resourceType = null;
    this.getEntitiesRightsFunction = null;
  }
}

export class UpdateEntityRightAddPeopleDialogData extends AbstractDialogData {
  ressourceId: number;
  ressourceName: string;
  resourceType: EntityResourceRights;
  selectedEntities: EntityRight[];
  entitiesAvailable: EntityRight[];
  availableRights: AccessRight[];

  public constructor() {
    super();
    this.ressourceId = null;
    this.ressourceName = '';
    this.resourceType = null;
    this.selectedEntities = [];
    this.entitiesAvailable = [];
    this.availableRights = [];
  }
}


export class StudyCaseLoadDialogData extends AbstractDialogData {
  study: Study;

  public constructor() {
    super();
    this.study = null;
  }
}


export class StudyCaseCreateReferenceDialogData extends AbstractDialogData {
  studyName: string;
  groupId: number;

  public constructor() {
    super();
    this.studyName = '';
    this.groupId = null;
  }
}

export class StudyCaseCopyReferenceDialogData extends AbstractDialogData {
  studyName: string;

  public constructor() {
    super();
    this.studyName = '';
  }
}

export class StudyCaseDeleteDialogData extends AbstractDialogData {
  deletedStudies: Study[];

  public constructor() {
    super();
    this.deletedStudies = [];
  }
}


export class UserCreateDialogData extends AbstractDialogData {
  userCreated: User;
  passwordLink: string;

  public constructor() {
    super();
    this.userCreated = null;
    this.passwordLink = '';
  }
}


export class UsersRoomDialogData extends AbstractDialogData {
  users: User[];
  studyName: string;

  public constructor() {
    super();
    this.users = [];
    this.studyName = '';
  }
}

export class NotificationDialogData extends AbstractDialogData {
  date: string;
  user: string;
  type: string;
  studyId: number;
  buttonText: string;
  changes: StudyUpdateParameter[];

  public constructor() {
    super();
    this.date = '';
    this.user = '';
    this.studyId = 0;
    this.type = '';
    this.buttonText = '';
    this.changes = [];
  }
}

export class StudyCaseCreateDialogData extends AbstractDialogData {

  studyName: string;
  studyType: string;
  groupId: number;
  reference: string;
  studyId: number;
  process: Process;
  selectProcessOnly: boolean;
  selectedFlavor:string;

  public constructor() {
    super();
    this.studyName = '';
    this.groupId = null;
    this.reference = null;
    this.studyId = null;
    this.process = null;
    this.selectProcessOnly = false;
    this.selectedFlavor = null;
  }
}

export class StudyCaseModificationDialogData extends AbstractDialogData {
  withRun: boolean;
  changes: StudyUpdateParameter[];

  public constructor() {
    super();
    this.withRun = false;
    this.changes = [];
  }
}



export class TableListListEditDialogData extends AbstractDialogData {
  title: string;
  listName: string;
  dataType: string;
  range: any;
  dataList: any;

  public constructor() {
    super();
    this.title = '';
    this.listName = '';
    this.dataType = '';
    this.range = null;
    this.dataList = [];
  }
}

export class StudyLink extends AbstractDialogData {
  htmlLink: string;
  studyName: string;

  public constructor() {
    super();
    this.studyName = '';
    this.htmlLink = '';
  }
}

export class PodSettingsDialogData extends AbstractDialogData {
  flavor: string;
  type:string;
  flavorsList : string[];
  flavorsDescription: Flavor[];

  public constructor() {
    super();
    this.flavor = '';
    this.type = '';
    this.flavorsList = [];
    this.flavorsDescription = [];
  }
}

export class ExecutionDialogData extends AbstractDialogData {
  message: string;
  studySubmitted: boolean;

  public constructor() {
    super();
    this.message = '';
    this.studySubmitted = false;
  }
}

export class OntologyInformationsDialogData extends AbstractDialogData {
  nodeData: NodeData;
  variableName: string;
  displayName: string;
  name: string;
  unit: string;
  namespace: string;
  discipline: string;

  public constructor() {
    super();
    this.nodeData = null;
    this.variableName = null;
    this.displayName = null;
    this.name = null;
    this.unit = null;
    this.namespace = '';
    this.discipline = '';
  }
}

export class ValidationDialogData extends AbstractDialogData {
  message: string;
  validate: boolean;
  buttonOkText: string;
  buttonSecondaryActionText: string;
  secondaryActionConfirmationNeeded: boolean;
  showCancelButton: boolean;
  title: string;

  public constructor() {
    super();
    this.message = '';
    this.validate = false;
    this.buttonSecondaryActionText = null;
    this.buttonOkText = 'Ok';
    this.secondaryActionConfirmationNeeded = false;
    this.title = null;
    this.showCancelButton = true;
  }

}

export class ModelStatusDialogData extends AbstractDialogData {
  processesDict: any;
  modelName: string;

  public constructor() {
    super();
    this.processesDict = {};
    this.modelName = '';
  }
}

export class OntologyParameterInformationsDialogData extends AbstractDialogData {
  parameter: OntologyParameter;

  public constructor() {
    super();
    this.parameter = null;
  }
}

export class OntologyProcessInformationDialogData extends AbstractDialogData {
  public process: Process;

  public constructor() {
    super();
    this.process = null;
  }
}

export class OntologyModelsStatusInformationDialogData extends AbstractDialogData {
  public modelStatus: OntologyModelStatus;

  public constructor() {
    super();
    this.modelStatus = null;
  }
}

export class SpreadsheetDialogData extends AbstractDialogData {
  title: string;
  file: any;
  nodeData: NodeData;
  namespace: string;
  discipline: string;
  readOnly: boolean;
  cancel: boolean;

  public constructor() {
    super();
    this.title = '';
    this.file = null;
    this.nodeData = null;
    this.namespace = '';
    this.discipline = '';
    this.readOnly = false;
    this.cancel = false;
  }
}

export class ConnectorDialogData extends AbstractDialogData {
  parameterName: string;
  connectorData: any;
  nodeData: NodeData;
  namespace: string;
  discipline: string;
  isReadOnly: boolean;

  public constructor() {
    super();
    this.parameterName = '';
    this.connectorData = {};
    this.nodeData = null;
    this.namespace = '';
    this.discipline = '';
    this.isReadOnly = false;
  }
}

export class LinkDialogData extends AbstractDialogData {
  label: string;
  url: string;
  description: string;


  public constructor() {
    super();
    this.label = '';
    this.url = '';
    this.description = '';
  }
}



export class EditionDialogData extends AbstractDialogData {

  editionDialogName: string;
  name: string;
  groupId: number;
  description: string;
  groupList: LoadedGroup[];
  userUpdated: User;

  public constructor() {
    super();

    this.editionDialogName = '';
    this.name = '';
    this.description = '';
    this.groupId = null;
    this.groupList = [];
    this.userUpdated = null;

  }

}


export class RepositoryTraceabilityDialogData extends AbstractDialogData {
    codeSourceTraceability: any;
    public constructor() {
      super();
      this.codeSourceTraceability = null;
    }
}

export class FilterDialogData extends AbstractDialogData {
  public possibleStringValues: string[];
  public selectedStringValues: string[];
  public columnName: ColumnName;

  public constructor() {
    super();
    this.possibleStringValues = [];
    this.selectedStringValues = [];
    this.columnName = null;
  }
}

export class NewsDialogData extends AbstractDialogData {
  public message: string;

  public constructor() {
    super();
    this.message = '';
  }
}

export class TreeNodeDialogData extends AbstractDialogData {

  public node: TreeNode;

  public constructor() {
    super();
    this.node = null;
  }
}

export class DashboardTextDialogData extends AbstractDialogData {
  public text: string;
  public id: string;

  public constructor() {
    super();
    this.text = '';
    this.id = null;
  }
}
