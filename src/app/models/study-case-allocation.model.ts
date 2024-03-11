
export class StudyCaseAllocation {

  constructor(
    public id: number,
    public studyCaseId: number,
    public status: StudyCaseAllocationStatus,
    public message: string,
    public creationDate = Date
  ) { }

  public static Create(jsonData: any): StudyCaseAllocation {
    const result: StudyCaseAllocation = new StudyCaseAllocation(
      jsonData[StudyCaseExecutionLoggingAttributes.ID],
      jsonData[StudyCaseExecutionLoggingAttributes.STUDY_CASE_ID],
      jsonData[StudyCaseExecutionLoggingAttributes.STATUS],
      jsonData[StudyCaseExecutionLoggingAttributes.MESSAGE],
      jsonData[StudyCaseExecutionLoggingAttributes.CREATION_DATE]);
    return result;
  }
}

export enum StudyCaseAllocationStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'IN_ERROR',
  DONE = 'DONE'
}

export enum StudyCaseExecutionLoggingAttributes {
  ID = 'id',
  STUDY_CASE_ID = 'study_case_id',
  STATUS = 'status',
  MESSAGE = 'message',
  CREATION_DATE = 'creation_date'
}
