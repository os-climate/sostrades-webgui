import { AccessRightItem } from './access-right-item.model';
import { AccessRight } from './access-right.model';
import { Group } from './group.model';
import { User } from './user.model';

export class EntityRights {


  constructor(
    public resourceId: number,
    public resourceType: EntityResourceRights,
    public availableRights: AccessRight[],
    public entitiesRights: EntityRight[]) {
  }

  public static Create(jsonData: any): EntityRights {
    const result = new EntityRights(
      jsonData[EntityRightAttributes.RESOURCEID],
      jsonData[EntityRightAttributes.RESOURCETYPE],
      [],
      []
    );

    if (
      jsonData[EntityRightAttributes.AVAILABLERIGHTS] !== null &&
      jsonData[EntityRightAttributes.AVAILABLERIGHTS] !== undefined &&
      jsonData[EntityRightAttributes.AVAILABLERIGHTS].length > 0
    ) {
      const rights = jsonData[EntityRightAttributes.AVAILABLERIGHTS];

      rights.forEach(right => {
        result.availableRights.push(AccessRight.Create(right));
      });

    }

    if (
      jsonData[EntityRightAttributes.ENTITIESRIGHS] !== null &&
      jsonData[EntityRightAttributes.ENTITIESRIGHS] !== undefined &&
      jsonData[EntityRightAttributes.ENTITIESRIGHS].length > 0
    ) {
      const entities = jsonData[EntityRightAttributes.ENTITIESRIGHS];

      entities.forEach(entity => {
        result.entitiesRights.push(EntityRight.Create(entity));
      });

    }
    return result;
  }
}

export class EntityRight {

  public oldRight: number;

  constructor(
    public id: number,
    public entityType: EntityType,
    public entityObject: AccessRightItem,
    public selectedRight: number,
    public isLocked: boolean) {
    this.oldRight = null;
  }

  public static Create(jsonData: any): EntityRight {
    const result = new EntityRight(
      jsonData[EntityRightAttributes.ID],
      jsonData[EntityRightAttributes.ENTITYTYPE],
      null,
      jsonData[EntityRightAttributes.SELECTEDRIGHT],
      jsonData[EntityRightAttributes.ISLOCKED],
    );

    result.oldRight = result.selectedRight;

    if (result.entityType === EntityType.USER) {
      result.entityObject = User.Create(jsonData[EntityRightAttributes.ENTITYOBJECT]);
    } else if (result.entityType === EntityType.GROUP) {
      result.entityObject = Group.Create(jsonData[EntityRightAttributes.ENTITYOBJECT]);
    }
    return result;
  }
}

export enum EntityRightAttributes {
  ID = 'id',
  RESOURCEID = 'resource_id',
  RESOURCETYPE = 'resource_type',
  ENTITYTYPE = 'entity_type',
  ENTITYOBJECT = 'entity_object',
  AVAILABLERIGHTS = 'available_rights',
  SELECTEDRIGHT = 'selected_right',
  ENTITIESRIGHS = 'entities_rights',
  ISLOCKED = 'locked'
}

export enum EntityType {
  GROUP = 'group',
  USER = 'user'
}

export enum EntityResourceRights {
  PROCESS = 'process',
  STUDYCASE = 'study_case',
  SOSDISCIPLINE = 'sosdiscipline',
  GROUP = 'group'
}

