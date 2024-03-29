
export class DataframeDescriptor {
  public columns: { [id: string]: DataframeDescriptorItem };

  constructor() {
    this.columns = {};
  }

  public static Create(jsonData: any): DataframeDescriptor {
    const result: DataframeDescriptor = new DataframeDescriptor();

    if (jsonData !== null && jsonData !== undefined) {
      Object.keys(jsonData).forEach(key => {
        result.columns[key] = DataframeDescriptorItem.Create(jsonData[key]);
      });
    }
    return result;
  }
}


export class DataframeDescriptorItem {

  public columnType: string;
  public columnRange: number[];
  public isColumnEditable: boolean;
  public isColumnRemovable : boolean;

  constructor() {
    this.columnRange = [];
    this.isColumnEditable = true;
    this.isColumnRemovable = false;
  }

  public static Create(jsonData: any): DataframeDescriptorItem {
    const result: DataframeDescriptorItem = new DataframeDescriptorItem();
    result.columnType = jsonData[0];
    result.isColumnEditable = jsonData[2];
    result.columnRange = [];

    if (jsonData[1] !== undefined && jsonData[1] !== null) {
      result.columnRange = jsonData[1];
    }
    if (jsonData[3] !== undefined && jsonData[3] !== null) {
      result.isColumnRemovable = jsonData[3];
    }
    return result;
  }

  public toString(): string {
    let description = '';

    description += `Column type : ${this.columnType}\r\n`;
    if (this.columnRange !== undefined && this.columnRange !== null && this.columnRange.length > 0) {
      description += `Column range : from ${this.columnRange[0]} to ${this.columnRange[1]} \r\n`;
    }
    description += `Column editable : ${this.isColumnEditable}`;
    description += `Column removable : ${this.isColumnRemovable}`;

    return description;
  }
}
