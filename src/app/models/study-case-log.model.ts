
export class StudyCaseLog {


  constructor(
    public name: string,
    public level: string,
    public created: string,
    public message: string,
    public exception: string,
  ) { }

  public static Create(jsonData: any): StudyCaseLog {
    const result: StudyCaseLog = new StudyCaseLog(
      jsonData[StudyCaseLogAttributes.NAME],
      jsonData[StudyCaseLogAttributes.LEVEL],
      jsonData[StudyCaseLogAttributes.CREATED],
      jsonData[StudyCaseLogAttributes.MESSAGE],
      jsonData[StudyCaseLogAttributes.EXCEPTION]);
    return result;
  }
}

export enum StudyCaseLogAttributes {
  NAME = 'name',
  LEVEL = 'level',
  CREATED = 'created',
  MESSAGE = 'message',
  EXCEPTION = 'exception'
}
