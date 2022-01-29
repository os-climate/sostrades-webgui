
export class StudyCaseLog {


  constructor(
   
    public message: string,
 
  ) { }

  public static Create(jsonData: any): StudyCaseLog {
    const result: StudyCaseLog = new StudyCaseLog(jsonData);
    
    return result;
  }
}

export enum StudyCaseLogAttributes {
  
  MESSAGE = 'message',
  
}
