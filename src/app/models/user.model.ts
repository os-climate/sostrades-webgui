import { AccessRightItem } from './access-right-item.model';

export class User implements AccessRightItem {

  public userprofilename: string;
  public title: string;
  public information: string;

  constructor(
    public id: number,
    public username: string,
    public firstname: string,
    public lastname: string,
    public email: string,
    public default_group_id: number,
    public userprofile: number,
    public internalAccount: boolean
    ) 
    {
    this.userprofilename = null;
    this.title = `${firstname} ${lastname}`;
    this.information = email;
    }

  public static Create(jsonData: any): User {
    const result: User = new User(
      jsonData[UserAttributes.ID],
      jsonData[UserAttributes.USERNAME],
      jsonData[UserAttributes.FIRSTNAME],
      jsonData[UserAttributes.LASTNAME],
      jsonData[UserAttributes.EMAIL],
      jsonData[UserAttributes.DEFAULT_GROUP_ID],
      jsonData[UserAttributes.USERPROFILE],
      jsonData[UserAttributes.INTERNAL_ACCOUNT]);
    return result;
  }

  search(itemSearched: string): boolean {
    return this.firstname.toUpperCase().includes(itemSearched.toUpperCase())
      || this.lastname.toUpperCase().includes(itemSearched.toUpperCase())
      || this.email.toUpperCase().includes(itemSearched.toUpperCase());
  }
}



export class UserApplicationRight {

  constructor(public user: User, public modules: string[]) {
  }

  public static Create(jsonData: any): UserApplicationRight {
    const userCreated = User.Create(jsonData[UserApplicationRightAttributes.USER]);
    const result: UserApplicationRight = new UserApplicationRight(
      userCreated,
      jsonData[UserApplicationRightAttributes.MODULES]);
    return result;
  }
}

export enum UserAttributes {
  ID = 'id',
  USERNAME = 'username',
  FIRSTNAME = 'firstname',
  LASTNAME = 'lastname',
  EMAIL = 'email',
  DEFAULT_GROUP_ID ='default_group_id',
  USERPROFILE = 'userprofile',
  INTERNAL_ACCOUNT = 'internal_account'
}

export enum UserApplicationRightAttributes {
  USER = 'user',
  MODULES = 'modules',
}
