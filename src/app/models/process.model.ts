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
    public referenceList: Study[],
    public identifier: string,
    public uri: string,
    public description: string,
    public category: string,
    public version: string,
    public quantityDisciplinesUsed: number,
    public disciplineList: [],
    public associatedUsecases: []
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
      [],
      jsonData[ProcessAttributes.IDENTIFIER],
      jsonData[ProcessAttributes.URI],
      jsonData[ProcessAttributes.DESCRIPTION],
      jsonData[ProcessAttributes.CATEGORY],
      jsonData[ProcessAttributes.VERSION],
      jsonData[ProcessAttributes.QUANTITY_DISCIPLINES_USED],
      jsonData[ProcessAttributes.DISCIPLINE_LIST],
      jsonData[ProcessAttributes.ASSOCIATED_USECASES],
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

  public static getKeyLabel(key: string): string {
    const keyLabelDict = {
      identifier: 'Identifier',
      description: 'Description',
      version: 'Version',
      label: 'Label',
      category: 'Category',
      uri: 'URI',
      processRepository: 'Process Repository',
      quantityDisciplinesUsed: 'Quantity Disciplines Used',
      disciplineList: 'Discipline List',
      associatedUsecases: 'Associated Usecases',
    };

    if (key in keyLabelDict) {
      return keyLabelDict[key];
    } else {
      return key;
    }
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
  REFERENCELIST = 'reference_list',
  IDENTIFIER = 'identifier',
  URI = 'uri',
  DESCRIPTION = 'description',
  CATEGORY = 'category',
  VERSION = 'version',
  QUANTITY_DISCIPLINES_USED = 'quantity_disciplines_used',
  DISCIPLINE_LIST = 'discipline_list',
  ASSOCIATED_USECASES = 'associated_usecases',
}

export enum ProcessEntityRight {
  MANAGER = 'Manager',
  CONTRIBUTOR = 'Contributor'
}
