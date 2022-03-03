import { Study } from './study.model';
import { User } from './user.model';
import { StudyUpdateParameter } from './study-update.model';
import { EntityRight, EntityResourceRights } from './entity-right.model';
import { AccessRight } from './access-right.model';
import { NodeData } from './node-data.model';
import { StudyCaseValidation } from './study-case-validation.model';

export abstract class AbstractDialogData {
  cancel: boolean;

  public constructor() {
    this.cancel = false;
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

export class StudyCaseCreateDialogData extends AbstractDialogData {
  studyName: string;
  repositoryName: string;
  processName: string;

  public constructor() {
    super();
    this.studyName = '';
    this.repositoryName = '';
    this.processName = '';
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

  public constructor() {
    super();
    this.userCreated = null;
  }
}

export class UserUpdateDialogData extends AbstractDialogData {
  userUpdated: User;

  public constructor() {
    super();
    this.userUpdated = null;
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

export class CoeditionDialogData extends AbstractDialogData {
  title: string;
  message: string;
  buttonText: string;
  changes: StudyUpdateParameter[];

  public constructor() {
    super();
    this.title = '';
    this.message = '';
    this.buttonText = '';
    this.changes = [];
  }
}

export class ProcessCreateStudyDialogData extends AbstractDialogData {
  processId: string;
  repositoryId: string;
  processName: string;
  studyName: string;
  studyType: string;
  groupId: number;
  reference: string;
  referenceList: Study[];
  studyId: number;

  public constructor() {
    super();
    this.processId = '';
    this.repositoryId = '';
    this.studyName = '';
    this.groupId = null;
    this.processName = '';
    this.reference = null;
    this.referenceList = [];
    this.studyId = null;
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

export class StudyCaseValidationDialogData extends AbstractDialogData {
  namespace: string;
  disciplineName: string;
  validationState: string;
  validationList: StudyCaseValidation[];

  public constructor() {
    super();
    this.namespace = '';
    this.disciplineName = '';
    this.validationState = '';
    this.validationList = [];
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
  title: string

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

export class SpreadsheetDialogData extends AbstractDialogData {
  title: string;
  file: any;
  nodeData: NodeData;
  namespace: string;
  discipline: string;
  readOnly: boolean;

  public constructor() {
    super();
    this.title = '';
    this.file = null;
    this.nodeData = null;
    this.namespace = '';
    this.discipline = '';
    this.readOnly = false;
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
