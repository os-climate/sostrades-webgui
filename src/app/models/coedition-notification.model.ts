import { StudyUpdateParameter } from './study-update.model';

export class CoeditionNotification {

  public id: number;

  constructor(
    public created: Date,
    public author: string,
    public type: CoeditionType,
    public message: string,
    public changes: StudyUpdateParameter[],
    public isOnlyMessage: boolean
  ) {
    this.id = null;
  }

  public static Create(jsonData: any): CoeditionNotification {
    const result: CoeditionNotification = new CoeditionNotification(
      jsonData[CoeditionNotificationAttributes.CREATED],
      jsonData[CoeditionNotificationAttributes.AUTHOR],
      jsonData[CoeditionNotificationAttributes.TYPE],
      jsonData[CoeditionNotificationAttributes.MESSAGE],
      [],
      true);

    if (jsonData[CoeditionNotificationAttributes.ID] !== null
      && jsonData[CoeditionNotificationAttributes.ID] !== undefined) {
      result.id = jsonData[CoeditionNotificationAttributes.ID];
    }

    if (
      jsonData[CoeditionNotificationAttributes.CHANGES] !== null &&
      jsonData[CoeditionNotificationAttributes.CHANGES] !== undefined &&
      jsonData[CoeditionNotificationAttributes.CHANGES].length > 0
    ) {
      const changes = jsonData[CoeditionNotificationAttributes.CHANGES];
      changes.forEach(change => {
        const newChange = StudyUpdateParameter.Create(change);
        result.changes.push(newChange);
      });
    } else {
      result.changes = null;
    }

    return result;
  }
}

export enum CoeditionNotificationAttributes {
  ID = 'id',
  CREATED = 'created',
  AUTHOR = 'author',
  TYPE = 'type',
  MESSAGE = 'message',
  CHANGES = 'changes'
}

export enum CoeditionType {
  CONNECTION = 'connection',
  SAVE = 'save',
  DISCONNECTION = 'disconnection',
  SUBMISSION = 'submission',
  EXECUTION = 'execution',
  CLAIM = 'claim',
  RELOAD = 'reload',
  VALIDATION_CHANGE = 'validation_change',
  EXPORT = 'export'
}
