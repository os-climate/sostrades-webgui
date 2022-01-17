export class CalculationDashboard {

  constructor(
    public studyCaseId: number,
    public name: string,
    public studyCaseExecutionId: number,
    public repository: string,
    public process: string,
    public repositoryDisplayName: string,
    public processDisplayName: string,
    public creationDate: Date,
    public username: string,
    public executionStatus: string) {
  }

  public static Create(jsonData: any): CalculationDashboard {
    const result: CalculationDashboard = new CalculationDashboard(
      jsonData[CalculationDashboardAttributes.STUDY_CASE_ID],
      jsonData[CalculationDashboardAttributes.NAME],
      jsonData[CalculationDashboardAttributes.STUDY_CASE_EXECUTION_ID],
      jsonData[CalculationDashboardAttributes.REPOSITORY],
      jsonData[CalculationDashboardAttributes.PROCESS],
      jsonData[CalculationDashboardAttributes.REPOSITORY_DISPLAY_NAME],
      jsonData[CalculationDashboardAttributes.PROCESS_DISPLAY_NAME],
      jsonData[CalculationDashboardAttributes.CREATION_DATE],
      jsonData[CalculationDashboardAttributes.USERNAME],
      jsonData[CalculationDashboardAttributes.EXECUTION_STATUS]);
    return result;
  }
}

export enum CalculationDashboardAttributes {
  STUDY_CASE_ID = 'study_case_id',
  NAME = 'name',
  STUDY_CASE_EXECUTION_ID = 'study_case_execution_id',
  REPOSITORY = 'repository',
  PROCESS = 'process',
  REPOSITORY_DISPLAY_NAME = 'repository_display_name',
  PROCESS_DISPLAY_NAME = 'process_display_name',
  CREATION_DATE = 'creation_date',
  USERNAME = 'username',
  EXECUTION_STATUS = 'execution_status'
}
