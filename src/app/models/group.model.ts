import { AccessRightItem } from './access-right-item.model';

export class Group implements AccessRightItem {

  title: string;
  information: string;

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public confidential: boolean) {
    this.title = name;
    this.information = 'Group';
  }


  public static Create(jsonData: any): Group {
    const result = new Group(
      jsonData[GroupAttributes.ID],
      jsonData[GroupAttributes.NAME],
      jsonData[GroupAttributes.DESCRIPTION],
      jsonData[GroupAttributes.CONFIDENTIAL]
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
  CONFIDENTIAL = 'confidential'
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
