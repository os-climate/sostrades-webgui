export class UserStudyPreferences {

  //contains the treeNode ID of each nodes and a dict for each node with id of the node 
  //and its isExpanded and id of each panel and its isExpanded
  public treeNodeExpandedData :{[treeNodeID: string]:boolean}
  constructor(preference : {}) {
    this.treeNodeExpandedData = {};
      if(preference !== null && preference  !== undefined)
      {
          this.treeNodeExpandedData = preference;
      }
  }

  public static Create(jsonData: any): UserStudyPreferences {   
    const result: UserStudyPreferences = new UserStudyPreferences(jsonData);
    return result;
  }


}