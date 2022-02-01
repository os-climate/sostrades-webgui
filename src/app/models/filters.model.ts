export class Filters {

  constructor(
    public userLevel: number,
    public showReadOnly: boolean,
    public showSimpleDisplay: boolean) {
  }

  public static Create(jsonData: any): Filters {
    const result: Filters = new Filters(
      jsonData[FiltersAttributes.USERLEVEL],
      jsonData[FiltersAttributes.SHOWREADONLY],
      jsonData[FiltersAttributes.SHOWSIMPLEDISPLAY]);
    return result;
  }
}

export enum FiltersAttributes {
  USERLEVEL = 'user_level',
  SHOWREADONLY = 'show_read_only',
  SHOWSIMPLEDISPLAY = 'show_simple_display'
}
