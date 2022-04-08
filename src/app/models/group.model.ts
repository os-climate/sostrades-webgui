import { AccessRightItem } from './access-right-item.model';

export class Group implements AccessRightItem {

  title: string;
  information: string;

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public confidential: boolean,
    public isDefaultGroup: boolean
    ) 
    {
    this.title = name;
    this.information = 'Group';
    this.isDefaultGroup = false
    }


  public static Create(jsonData: any): Group {
    const result = new Group(
      jsonData[GroupAttributes.ID],
      jsonData[GroupAttributes.NAME],
      jsonData[GroupAttributes.DESCRIPTION],
      jsonData[GroupAttributes.CONFIDENTIAL],
      jsonData[GroupAttributes.IS_DEFAULT_GROUP]
    );
    return result;
  }

  search(itemSearched: string): boolean {
    return this.name.toUpperCase().includes(itemSearched.toUpperCase());
  }

}


export enum GroupAttributes {
  ID = 'id',
  NAME = 'name',
  DESCRIPTION = 'description',
  CONFIDENTIAL = 'confidential',
  IS_DEFAULT_GROUP = 'is_default_group'
}


export class LoadedGroup {
  constructor(
    public group: Group,
    public isOwner: boolean,
    public isManager: boolean,
    public isMember: boolean
  ) { }

  public static Create(jsonData: any): LoadedGroup {
    const result: LoadedGroup = new LoadedGroup(
      Group.Create(jsonData[LoadedGroupAttributes.GROUP]),
      jsonData[LoadedGroupAttributes.ISOWNER],
      jsonData[LoadedGroupAttributes.ISMANAGER],
      jsonData[LoadedGroupAttributes.ISMEMBER]);

    return result;
  }
}

export enum LoadedGroupAttributes {
  GROUP = 'group',
  ISOWNER = 'is_owner',
  ISMANAGER = 'is_manager',
  ISMEMBER = 'is_member'
}
