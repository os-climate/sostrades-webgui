export class StudyCaseValidation {

  constructor(
    public studyId: number,
    public namespace: string,
    public validationComment: string,
    public validationState: string,
    public validationDate: Date,
    public userName: string,
    public userDepartment: string
  ) {
  }

  public static Create(jsonData: any): StudyCaseValidation {
    const result: StudyCaseValidation = new StudyCaseValidation(
      jsonData[StudyCaseValidationAttributes.STUDY_CASE_ID],
      jsonData[StudyCaseValidationAttributes.NAMESPACE],
      jsonData[StudyCaseValidationAttributes.VALIDATION_COMMENT],
      jsonData[StudyCaseValidationAttributes.VALIDATION_STATE],
      jsonData[StudyCaseValidationAttributes.VALIDATION_DATE],
      jsonData[StudyCaseValidationAttributes.VALIDATION_USER_NAME],
      jsonData[StudyCaseValidationAttributes.VALIDATION_USER_DEPARTMENT]);
    return result;
  }
}

export enum StudyCaseValidationAttributes {
  STUDY_CASE_ID = 'study_case_id',
  NAMESPACE = 'namespace',
  VALIDATION_COMMENT = 'validation_comment',
  VALIDATION_STATE = 'validation_state',
  VALIDATION_DATE = 'validation_date',
  VALIDATION_USER_NAME = 'validation_user',
  VALIDATION_USER_DEPARTMENT = 'validation_user_department',
}


export enum ValidationTreeNodeState {
  VALIDATED = "Validated",
  INVALIDATED = "Invalidated",
}

export class StudyCaseTreeNodeValidation {

  public fullNamespace: string;
  public disciplineList: string[];
  public validationState: string;
  public hasValidation: boolean;
  

  constructor() {
    this.disciplineList = [];
    this.validationState = '';
    this.hasValidation = false;
  }
}
