
export class StudyCaseLogging {


  constructor(
    public name: string,
    public level: string,
    public message: string,
    public created: string,
    public exception: string

  ) { }

  public static Create(jsonData: any): StudyCaseLogging {
    const result: StudyCaseLogging = new StudyCaseLogging(
      jsonData[StudyCaseLoggingAttributes.NAME],
      jsonData[StudyCaseLoggingAttributes.LEVEL],
      jsonData[StudyCaseLoggingAttributes.MESSAGE],
      jsonData[StudyCaseLoggingAttributes.CREATED],
      jsonData[StudyCaseLoggingAttributes.EXCEPTION]);

    return result;
  }
}

export enum StudyCaseLoggingAttributes {

  NAME = 'name',
  LEVEL = 'level',
  MESSAGE = 'message',
  CREATED = 'created',
  EXCEPTION = 'exception'

}
