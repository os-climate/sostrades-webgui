
export class StudyCaseExecutionLogging {

  constructor(
    public message: string,
  ) { }

  public static Create(jsonData: any): StudyCaseExecutionLogging {
    const result: StudyCaseExecutionLogging = new StudyCaseExecutionLogging(jsonData);
    return result;
  }
}

export enum StudyCaseExecutionLoggingAttributes {
  MESSAGE = 'message'
}
