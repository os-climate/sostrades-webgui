import { NodeData, ValueType } from "../models/node-data.model";

export class NodeDataTools {

  public static countDisplayableItemsInNodeDataDict(dict: { [id: string]: NodeData; }, userLevel: number, showReadOnly: boolean): number {
    let count = 0;
    Object.keys(dict).forEach(key => {
      if (userLevel >= dict[key].userLevel) {
        if (dict[key].valueType === ValueType.READ_ONLY) {
          if (showReadOnly) {
            count += 1;
          }
        } else {
          count += 1;
        }
      }
    });
    return count;
  }

  public static createOrderedListFromNodeDataDict(nodeDataDict: { [id: string]: NodeData; }): NodeData[] {
    let orderedList: NodeData[] = [];
    if (Object.keys(nodeDataDict).length > 0) {
      orderedList = Object.keys(nodeDataDict).map((key) => {
        return nodeDataDict[key];
      });

      // Sorting node data first editable, then alphabetically
      
      orderedList = orderedList.sort((a, b) => {
        if (a.editable === b.editable) {
          return a.displayName.localeCompare(b.displayName);
        } else if (a.editable && !b.editable) {
          return -1;
        } else if (!a.editable && b.editable) {
          return 1;
        }
      });
    }

    return orderedList;
  }
}
