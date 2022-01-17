export class Serie {
  constructor(
    public name: string,
    public abscissa: any,
    public ordinate: any,
    public displayType: string,
    public visible: boolean) { }

  public static Create(jsonData: any): Serie {
    const result: Serie = new Serie(
      jsonData[SerieAttributes.NAME],
      jsonData[SerieAttributes.ABSCISSA],
      jsonData[SerieAttributes.ORDINATE],
      jsonData[SerieAttributes.DISPLAYTYPE],
      jsonData[SerieAttributes.VISIBLE]);
    return result;
  }
}


export enum SerieAttributes {
  NAME = 'series_name',
  ABSCISSA = 'abscissa',
  ORDINATE = 'ordinate',
  DISPLAYTYPE = 'display_type',
  VISIBLE = 'visible'
}
