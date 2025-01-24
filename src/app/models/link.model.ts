export class Link {

  constructor(
    public id: number,
    public url: string,
    public label: string,
    public description: string,
    public userId: number,
    public lastModified: Date) {
  }

  public static Create(jsonData: any): Link {
    const result = new Link(
      jsonData[LinkAttributes.ID],
      jsonData[LinkAttributes.URL],
      jsonData[LinkAttributes.LABEL],
      jsonData[LinkAttributes.DESCRIPTION],
      jsonData[LinkAttributes.USER_ID],
      jsonData[LinkAttributes.LAST_MODIFIED]
    );
    return result;
  }

  public initFromLink(fromLink: Link) {
    this.id = fromLink.id;
    this.url = fromLink.url;
    this.label = fromLink.label;
    this.description = fromLink.description;
    this.userId = fromLink.userId;
    this.lastModified = fromLink.lastModified;
  }
}

export enum LinkAttributes {
  ID = 'id',
  URL= 'url',
  LABEL = 'label',
  DESCRIPTION = 'description',
  USER_ID = 'user_id',
  LAST_MODIFIED = 'last_modified'
}

