import { Study } from './study.model';

export class Process {

  constructor(
    public id: number,
    public processId: string,
    public processName: string,
    public processDescription: string,
    public repositoryId: string,
    public repositoryName: string,
    public repositoryDescription: string,
    public isManager: boolean,
    public isContributor: boolean,
    public referenceList: Study[]
  ) {
  }

  public static Create(jsonData: any): Process {
    const result = new Process(
      jsonData[ProcessAttributes.ID],
      jsonData[ProcessAttributes.PROCESSID],
      jsonData[ProcessAttributes.PROCESSNAME],
      jsonData[ProcessAttributes.PROCESSDESCRIPTION],
      jsonData[ProcessAttributes.REPOSITORYID],
      jsonData[ProcessAttributes.REPOSITORYNAME],
      jsonData[ProcessAttributes.REPOSITORYDESCRIPTION],
      jsonData[ProcessAttributes.ISMANAGER],
      jsonData[ProcessAttributes.ISCONTRIBUTOR],
      []
    );

    if (
      jsonData[ProcessAttributes.REFERENCELIST] !== null &&
      jsonData[ProcessAttributes.REFERENCELIST] !== undefined &&
      jsonData[ProcessAttributes.REFERENCELIST].length > 0
    ) {
      const refList = jsonData[ProcessAttributes.REFERENCELIST];
      refList.forEach(ref => {
        result.referenceList.push(Study.Create(ref));
      });
    }
    return result;
  }
}

export enum ProcessAttributes {
  ID = 'id',
  PROCESSID = 'process_id',
  PROCESSNAME = 'process_name',
  PROCESSDESCRIPTION = 'process_description',
  REPOSITORYID = 'repository_id',
  REPOSITORYNAME = 'repository_name',
  REPOSITORYDESCRIPTION = 'repository_description',
  ISMANAGER = 'is_manager',
  ISCONTRIBUTOR = 'is_contributor',
  REFERENCELIST = 'reference_list'
}

export enum ProcessEntityRight {
  MANAGER = 'Manager',
  CONTRIBUTOR = 'Contributor'
}
