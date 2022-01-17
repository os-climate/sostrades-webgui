export class StudyReference {
  constructor(public name: string, public isLoading: boolean, public isDisabled: boolean) {
  }
}

export class ReferenceStudy {
  constructor(public name: string, public repository: string, public process: string, public creationDate: Date) {
  }
  public static Create(jsonData: any): ReferenceStudy {
    const result: ReferenceStudy = new ReferenceStudy(
      jsonData[ReferenceStudyAttributes.NAME],
      jsonData[ReferenceStudyAttributes.REPOSITORY],
      jsonData[ReferenceStudyAttributes.PROCESS],
      jsonData[ReferenceStudyAttributes.CREATIONDATE]);
    return result;
  }
}

export enum ReferenceStudyAttributes {
  NAME = 'name',
  PROCESS = 'process',
  REPOSITORY = 'repository',
  CREATIONDATE = 'creation_date'
}
