import { Component, OnInit, OnDestroy } from '@angular/core';
import { TreeNode, TreeView } from 'src/app/models/tree-node.model';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { StudyCasePostProcessingService } from 'src/app/services/study-case/post-processing/study-case-post-processing.service';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { LoadedStudy } from 'src/app/models/study.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { StudyCaseExecutionObserverService } from 'src/app/services/study-case-execution-observer/study-case-execution-observer.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { UserService } from 'src/app/services/user/user.service';
import { Scenario } from 'src/app/models/scenario.model';
import { PostProcessingService } from 'src/app/services/post-processing/post-processing.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { StudyCaseLoadingService } from 'src/app/services/study-case-loading/study-case-loading.service';
import { PanelSection } from 'src/app/models/user-study-preferences.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-study-case-treeview-light',
  templateUrl: './study-case-treeview-light.component.html',
  styleUrls: ['./study-case-treeview-light.component.scss']
})

export class StudyCaseTreeviewLightComponent implements OnInit, OnDestroy {

  private root: TreeView;
  public originTreeNode: TreeNode;
  public filteredTreeNode: TreeNode;
  

  private onStudyCaseChangeSubscription: Subscription;
  private onTreeNodeChangeSubscription: Subscription;
  public currentSelectedNodeKey: string;
  public recursive = false; // If true Treeview fully expand all child node
  public levels = new Map<TreeNode, number>();
  public treeControl: NestedTreeControl<TreeNode>;

  public studyIsDone: boolean;
  public studyIsDoneId: number;
  public studyIsLoaded: boolean;
  public loadedStudyForTreeview : LoadedStudy;

  public isStudyNoData: boolean;
  public isStudyReadOnly: boolean;
  public dataSource: MatTreeNestedDataSource<TreeNode>;

  constructor(
    public userService: UserService,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    public studyCasePostProcessingService: StudyCasePostProcessingService,
    public studyCaseLoadingService: StudyCaseLoadingService,
    public postProcessingService: PostProcessingService,
    private treeNodeDataService: TreeNodeDataService,
    public ontologyService: OntologyService,
    public calculationService: CalculationService,
    public studyCaseExecutionObserverService: StudyCaseExecutionObserverService,
    public snackbarService: SnackbarService,
    public studyCaseLocalStorageService: StudyCaseLocalStorageService,
  ) {
    this.onStudyCaseChangeSubscription = null;
    this.onTreeNodeChangeSubscription = null;
    this.treeControl = new NestedTreeControl<TreeNode>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.studyIsDone = false;
    this.studyIsLoaded = false;
    this.studyIsDoneId = -1;
    this.currentSelectedNodeKey = '';
    this.isStudyNoData = false;
    this.isStudyReadOnly = false;
  }


  hasChild = (index: number, node: TreeNode) => {
    return this.getChildren(node).length > 0;
  }

  ngOnInit() {
    if (this.studyCaseDataService.loadedStudy !== undefined && this.studyCaseDataService.loadedStudy !== null){
      this.showStudy(this.studyCaseDataService.loadedStudy);
    }
    this.onStudyCaseChangeSubscription = this.studyCaseDataService.onStudyCaseChange.subscribe(loadedStudy => {
      this.showStudy(loadedStudy);    
    });
    this.onTreeNodeChangeSubscription = this.treeNodeDataService.currentTreeNodeData.subscribe(treeNode =>{
      if (treeNode !== null){
        this.currentSelectedNodeKey = treeNode.fullNamespace;
      }
    });
  }

  showStudy(loadedStudy){
    if (loadedStudy !== null) {

      const currentLoadedStudy = (loadedStudy as LoadedStudy);

      // Applying no data and read only values
      this.isStudyNoData = currentLoadedStudy.noData;
      this.isStudyReadOnly = currentLoadedStudy.readOnly;
      
      this.root = currentLoadedStudy.treeview;

      this.originTreeNode = this.root.rootNode;
      this.dataSource.data = [this.originTreeNode];
      this.studyIsLoaded = true;
      this.studyIsDoneId = currentLoadedStudy.studyCase.id;

      this.treeControl.expand(this.originTreeNode);

      Object.keys(this.root.rootDict).forEach(treenodeKey => {
        const panel_id = `${this.root.rootDict[treenodeKey].fullNamespace}.${PanelSection.TREEVIEW_SECTION}`
        if (this.studyCaseDataService.getUserStudyPreference(panel_id, false)) {
          this.treeControl.expand(this.root.rootDict[treenodeKey]);
        }
      });
      this.nodeClick(this.currentSelectedNode);
    } else {
      this.dataSource = new MatTreeNestedDataSource();
      this.originTreeNode = null;
      this.nodeClick(null);
      this.studyCaseDataService.isLoadedStudyForTreeview(this.loadedStudyForTreeview)

    }
    Object.keys(this.root.rootDict).forEach(treenodeKey => {
      this.colorChevronIfErrorOnParameters(treenodeKey);
    });
    
  
  }
    recursiveTreeNodeScenarioDisplay(treenode: TreeNode, scenarioList: Scenario[]) {

    const scenarioNamespaceList = scenarioList.map(x => x.namespace);
    if (scenarioNamespaceList.includes(treenode.fullNamespace)) {
      treenode.isVisible = scenarioList.filter(x => x.namespace === treenode.fullNamespace)[0].selected;
    }

    if (treenode.children.value.length > 0) {
      treenode.children.value.forEach(tn => {
        this.recursiveTreeNodeScenarioDisplay(tn, scenarioList);
      });
    }
  }

  ngOnDestroy() {
    if (this.onStudyCaseChangeSubscription !== null) {
      this.onStudyCaseChangeSubscription.unsubscribe();
      this.onStudyCaseChangeSubscription = null;
    }

    if (this.onTreeNodeChangeSubscription !== null) {
      this.onTreeNodeChangeSubscription.unsubscribe();
      this.onTreeNodeChangeSubscription = null;
    }
    
  }

  get currentSelectedNode(): TreeNode {
    if (this.currentSelectedNodeKey === '') {
      if (this.treeNodeDataService.currentTreeNode !== null){
        this.currentSelectedNodeKey = this.treeNodeDataService.currentTreeNode.fullNamespace;
        return this.treeNodeDataService.currentTreeNode;
      }
      else{
        return this.originTreeNode;
      }
    } else if (this.currentSelectedNodeKey in this.root.rootDict) {
      return this.root.rootDict[this.currentSelectedNodeKey];
    } else {
      this.currentSelectedNodeKey = '';
      return this.originTreeNode;
    }
  }

  getChildren = (node: TreeNode) => {
    return node.children.value;
  }

  nodeClick(node) {
    const treenode = node as TreeNode;
    if (treenode !== null) {
      this.currentSelectedNodeKey = treenode.fullNamespace;
    }
    

    this.treeNodeDataService.send_tree_node(treenode);
  }

  
  setExpandForDisciplinePanel(TreeNodeOrPanelId: string) {
    this.studyCaseDataService.loadedStudy.userStudyPreferences.expandedData[TreeNodeOrPanelId] = true;
    this.studyCaseDataService.setUserStudyPreference(TreeNodeOrPanelId, true).subscribe({
      error: (error) => {
        this.snackbarService.showError(error);
      }
    });
  }

  setExpandTreeNodeAndParent(treenode: TreeNode) {
    // Expand treenode
    this.treeControl.expand(treenode);

    // Find treenode parent and recursive call
    const parentTreenode = Object.values(this.studyCaseDataService.loadedStudy.treeview.rootDict).find(x => x.children.value.indexOf(treenode) > -1);
    if (parentTreenode !== undefined && parentTreenode !== null) {
      this.setExpandTreeNodeAndParent(parentTreenode);
    }
  }

  saveTreeViewPreferences(node: TreeNode) {
    const isExpanded = this.treeControl.isExpanded(node);
    const panelId = `${node.fullNamespace}.${PanelSection.TREEVIEW_SECTION}`
    this.studyCaseDataService.setUserStudyPreference(panelId, isExpanded).subscribe({
      error: (error) => {
        this.snackbarService.showError(error);
      }
    });
  }



  private setChildOk(text: string, dataSource: TreeNode[], displayChild = false) {
    //set a node, that contains a text, visible then set its children visible too
    //others nodes are set not visible
    if (displayChild) {
      dataSource.forEach(treeNode => {
        treeNode.isVisible = true;
        if (treeNode.children.value) {
          this.setChildOk(text, treeNode.children.value, true);
        }
      });
    } else {
      dataSource.forEach(treeNode => {
        treeNode.isVisible = treeNode.name.toLowerCase().includes(text.toLowerCase());
        if (treeNode.treeNodeParent) {
          this.setParentOk(text, treeNode.treeNodeParent, treeNode.isVisible);
        }
        if (treeNode.children.value && treeNode.isVisible) {
          this.setChildOk(text, treeNode.children.value, true);
        }
        if (treeNode.children.value && !treeNode.isVisible) {
          this.setChildOk(text, treeNode.children.value);
        }
      });
    }
  }

  private setParentOk(text, treeNode: TreeNode, isVisible) {
    treeNode.isVisible = isVisible || treeNode.isVisible || treeNode.name.toLowerCase().includes(text);
    if (treeNode.treeNodeParent) {
      this.setParentOk(text, treeNode.treeNodeParent, treeNode.isVisible);
    }
  }
 /**
 * Recursively colors the chevrons of all parent nodes in red if a node has unconfigured parameters
 * @param treenodeKey The key of the node to check and process its parents
 */
  private colorChevronIfErrorOnParameters(treenodeKey: string) {
    // Check if the current node is not configured
    if(!this.root.rootDict[treenodeKey].isConfigured) {
        // Get the current node
        let currentNode = this.root.rootDict[treenodeKey];
        
        // Traverse up through parents until we reach the root
        while (currentNode.treeNodeParent) {
            // Color the parent node's chevron in error red
            currentNode.treeNodeParent.chevronColor = '#e4002b';
            
            // Move up to the parent node
            currentNode = currentNode.treeNodeParent;
        }    
    }
  }
}