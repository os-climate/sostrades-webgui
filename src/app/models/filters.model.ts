export class Filters {

  constructor(
    public userLevel: number,
    public showReadOnly: boolean) {
  }

  public static Create(jsonData: any): Filters {
    const result: Filters = new Filters(
      jsonData[FiltersAttributes.USERLEVEL],
      jsonData[FiltersAttributes.SHOWREADONLY]);
    return result;
  }
}

export enum FiltersAttributes {
  USERLEVEL = 'user_level',
  SHOWREADONLY = 'show_read_only'
}
