export class StudyFavorite {  

    constructor(
      public id: number,
      public user_id: number,
      public study_id : number
     ) {
    }
  public static Create(jsonData: any): StudyFavorite {
    const result = new StudyFavorite(
      jsonData[StudyFavoriteAttributes.ID],
      jsonData[StudyFavoriteAttributes.USER_ID],
      jsonData[StudyFavoriteAttributes.STUDY_ID]
    );
    return result;
  }
}



export enum StudyFavoriteAttributes {
  ID = 'id',
  USER_ID = 'user_id',
  STUDY_ID = 'study_id',
}