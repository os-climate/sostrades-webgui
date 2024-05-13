
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

  public static OOMKILLEDLABEL:string = 'Server has been killed because of not enough resources, \nyou may try to choose a bigger pod opening size before restart.'
}

export enum StudyCaseAllocationStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'IN_ERROR',
  OOMKILLED = 'OOMKILLED',
  DONE = 'RUNNING'
}



export enum StudyCaseExecutionLoggingAttributes {
  ID = 'id',
  STUDY_CASE_ID = 'identifier',
  STATUS = 'pod_status',
  MESSAGE = 'message',
  CREATION_DATE = 'creation_date'
}
