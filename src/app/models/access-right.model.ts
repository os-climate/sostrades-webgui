export class AccessRight {

  constructor(
    public id: number,
    public accessRight: string,
    public description: string,
    public selectable: boolean) {
  }

  public static Create(jsonData: any): AccessRight {
    const result: AccessRight = new AccessRight(
      jsonData[AccessRightAttributes.ID],
      jsonData[AccessRightAttributes.ACCESSRIGHT],
      jsonData[AccessRightAttributes.DESCRIPTION],
      jsonData[AccessRightAttributes.SELECTABLE]);
    return result;
  }
}

export enum AccessRightAttributes {
  ID = 'id',
  ACCESSRIGHT = 'access_right',
  DESCRIPTION = 'description',
  SELECTABLE = 'selectable'
}

export enum AccessRightsNames {
  MANAGER = 'Manager',
  CONTRIBUTOR = 'Contributor',
  COMMENTER = 'Commenter',
  RESTRICTED_VIEWER = 'Restricted Viewer',
  MEMBER = 'Member',
  OWNER = 'Owner',
  REMOVE = 'Remove',
  NONE = ''
}
