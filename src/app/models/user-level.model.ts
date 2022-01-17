export class UserLevel {
  public userLevelList: string[];
  constructor(userLevelList: string[] = ['Standard', 'Advanced', 'Expert']) {
    this.userLevelList = userLevelList;
  }
}
