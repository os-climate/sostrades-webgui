export class UserStudyPreferences {

  //contains the treeNode ID of each nodes and a dict for each node with id of the node 
  //and its isExpanded and id of each panel and its isExpanded
  public expandedData :{[treeNodeID: string]:boolean}
  constructor(preference : any) {
    this.expandedData = {};
      if(preference !== null && preference  !== undefined)
      {
          this.expandedData = preference;
      }
  }

  public static Create(jsonData: any): UserStudyPreferences {   
    const result: UserStudyPreferences = new UserStudyPreferences(jsonData);
    return result;
  }

}

export enum PanelSection {
  TREEVIEW_SECTION = "treeview_section",
  DATA_MANAGEMENT_SECTION = "data_management_section",
  POST_PROCESSING_SECTION = "post_processing_section"
 }