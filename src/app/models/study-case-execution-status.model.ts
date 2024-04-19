export class StudyCaseExecutionStatus {

  constructor(
    public studyCaseId: number,
    public disciplinesStatus: { [id: string]: string } = {},
    public studyCalculationStatus: string,
    public studyCalculationCpu: string,
    public studyCalculationMemory: string,
    public studyCalculationErrorMessage: string
  ) {  }

  public static Create(jsonData: any): StudyCaseExecutionStatus {
    const result: StudyCaseExecutionStatus = new StudyCaseExecutionStatus(
      jsonData[StudyCaseExecutionStatusAttributes.STUDY_CASE_ID],
      jsonData[StudyCaseExecutionStatusAttributes.DISCIPLINE_STATUS],
      jsonData[StudyCaseExecutionStatusAttributes.STUDY_CALCULATION_STATUS],
      jsonData[StudyCaseExecutionStatusAttributes.STUDY_CALCULATION_CPU],
      jsonData[StudyCaseExecutionStatusAttributes.STUDY_CALCULATION_MEMORY],
      jsonData[StudyCaseExecutionStatusAttributes.STUDY_CALCULATION_ERROR_MESSAGE]);

    return result;
  }

  public toString = (): string => {
    const strings: string[] = [];
    strings.push(`study identifier : ${this.studyCaseId}`);
    strings.push(`disciplines status : ${this.disciplinesStatus}`);
    strings.push(`study case execution status : ${this.studyCalculationStatus}`);+
    strings.push(`study case execution cpu : ${this.studyCalculationCpu}`);
    strings.push(`study case execution memory : ${this.studyCalculationMemory}`);
    strings.push(`study case execution error message : ${this.studyCalculationMemory}`);
    return strings.join('\n');
  }
}

export enum StudyCaseExecutionStatusAttributes {
  STUDY_CASE_ID = 'study_case_id',
  DISCIPLINE_STATUS = 'disciplines_status',
  STUDY_CALCULATION_STATUS = 'study_case_execution_status',
  STUDY_CALCULATION_CPU = 'study_case_execution_cpu',
  STUDY_CALCULATION_MEMORY = 'study_case_execution_memory',
  STUDY_CALCULATION_ERROR_MESSAGE ='study_case_execution_error_message'
}


