export class SoSTradesError {

  public redirect: boolean;

  constructor(public statusCode: number, public name: string, public description: string) {
    this.redirect = false;
  }

  public static Create(jsonData: any): SoSTradesError {
    const result: SoSTradesError = new SoSTradesError(
      jsonData[ErrorAttributes.STATUSCODE],
      jsonData[ErrorAttributes.NAME],
      jsonData[ErrorAttributes.DESCRIPTION]);

    return result;
  }
}

export enum ErrorAttributes {
  STATUSCODE = 'statusCode',
  NAME = 'name',
  DESCRIPTION = 'description'
}
