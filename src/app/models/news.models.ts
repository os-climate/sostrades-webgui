export class News {

    constructor(
      public id: number,
      public message: string,
      public userId: number,
      public creationDate: Date,
      public lastModificationDate: Date) {
    }

    public static Create(jsonData: any): News {
      const result = new News(
        jsonData[NewsAttributes.ID],
        jsonData[NewsAttributes.MESSAGE],
        jsonData[NewsAttributes.USER_ID],
        jsonData[NewsAttributes.CREATION_DATE],
        jsonData[NewsAttributes.LAST_MODIFICATION_DATE],
      );
      return result;
    }
  }

export enum NewsAttributes {
    ID = 'id',
    MESSAGE= 'message',
    USER_ID = 'user_id',
    CREATION_DATE = 'creation_date',
    LAST_MODIFICATION_DATE = 'last_modification_date'
}
