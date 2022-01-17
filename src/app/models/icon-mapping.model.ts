export class IconMapping {

  private defaultIcon = 'fa-fw fa-question-circle fas';
  private mapping: { [id: string]: string };

  public static Create(jsonData: any): IconMapping {

    const iconMapping = new IconMapping();

    if (jsonData !== null && jsonData !== undefined) {
      for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
          iconMapping.add(key, jsonData[key]);
        }
      }
    }

    return iconMapping;
  }

  constructor() {
    this.mapping = {};
  }

  public add(key: string, value: string) {
    this.mapping[key] = value;
  }

  public get(key: string): string {
    if (key in this.mapping) {
      return this.mapping[key];
    } else {
      return this.defaultIcon;
    }
  }
}
