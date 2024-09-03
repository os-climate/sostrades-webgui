import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Inject, AfterViewInit } from '@angular/core';
import { TreeNode, TreeView } from 'src/app/models/tree-node.model';
import { combineLatest, Subscription } from 'rxjs';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { StudyCasePostProcessingService } from 'src/app/services/study-case/post-processing/study-case-post-processing.service';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { LoadedStudy, LoadStatus } from 'src/app/models/study.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { StudyCaseExecutionObserverService } from 'src/app/services/study-case-execution-observer/study-case-execution-observer.service';
import { StudyCaseExecutionStatus } from 'src/app/models/study-case-execution-status.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { DisciplineStatus, StudyCalculationStatus } from 'src/app/models/study-case-execution-observer.model';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StudyCaseStatusInformationComponent } from '../study-case-status-information/study-case-status-information.component';
import { ValidationDialogData, UsersRoomDialogData, StudyCaseModificationDialogData, PodSettingsDialogData } from 'src/app/models/dialog-data.model';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { SocketService } from 'src/app/services/socket/socket.service';
import { User } from 'src/app/models/user.model';
import { UserRoomDialogComponent } from '../../user/user-room-dialog/user-room-dialog.component';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { CoeditionNotification, CoeditionType } from 'src/app/models/coedition-notification.model';
import { UserService } from 'src/app/services/user/user.service';
import { StudyCaseModificationDialogComponent } from '../study-case-modification-dialog/study-case-modification-dialog.component';
import { Scenario } from 'src/app/models/scenario.model';
import { PostProcessingService } from 'src/app/services/post-processing/post-processing.service';
import { StudyDialogService } from 'src/app/services/study-dialog/study-dialog.service';
import { IoType, NodeData } from 'src/app/models/node-data.model';
import { DOCUMENT } from '@angular/common';
import { PannelIds } from 'src/app/models/data-management-discipline.model';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { StudyCaseExecutionSystemLoad } from 'src/app/models/study-case-execution-system-load.model';
import { FilterService } from 'src/app/services/filter/filter.service';
import { StudyCaseLoadingService } from 'src/app/services/study-case-loading/study-case-loading.service';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { PodSettingsComponent } from 'src/app/shared/pod-settings/pod-settings.component';
import { FlavorsService } from 'src/app/services/flavors/flavors.service';
import { PanelSection } from 'src/app/models/user-study-preferences.model';


@Component({
  selector: 'app-study-case-treeview',
  templateUrl: './study-case-treeview.component.html',
  styleUrls: ['./study-case-treeview.component.scss']
})

export class StudyCaseTreeviewComponent implements OnInit, OnDestroy, AfterViewInit {

  private root: TreeView;
  public originTreeNode: TreeNode;
  public filteredTreeNode: TreeNode;
  

  private onStudyCaseChangeSubscription: Subscription;
  private onTradeSpaceSelectionChangedSubscription: Subscription;
  private onTreeNodeNavigationSubscription: Subscription;

  public currentSelectedNodeKey: string;

  private studyExecutionStartedSubscription: Subscription;
  private studyExecutionStoppedSubscription: Subscription;
  private studyExecutionUpdatedSubscription: Subscription;
  private onStudyHaveChangesSubscription: Subscription;
  private onStudySubmissionEndSubscription: Subscription;
  private onRoomUserUpdateSubscription: Subscription;
  private onNewNotificationSubscription: Subscription;

  public recursive = false; // If true Treeview fully expand all child node
  public levels = new Map<TreeNode, number>();
  public treeControl: NestedTreeControl<TreeNode>;

  public usersInRoom: User[];
  public numberOfUserRoom: number;
  public showStatus: boolean;
  public showState : boolean;
  public executionStarted: boolean;
  public showChangesButtons: boolean;
  public studyIsDone: boolean;
  public studyIsDoneId: number;
  public studyIsLoaded: boolean;
  public studyCanReload: boolean;
  public showStudyRefreshing: boolean;
  public filterTreeInput: string;
  public loadedStudyForTreeview : LoadedStudy

  public isStudyNoData: boolean;
  public isStudyReadOnly: boolean;
  public canExecute: boolean;

  public isTreeViewFiltered: boolean;
  public isSearchOption: boolean;

  public dataSource: MatTreeNestedDataSource<TreeNode>;
  private dialogRefValidate: MatDialogRef<ValidationDialogComponent>;
  private dialogRefStatus: MatDialogRef<StudyCaseStatusInformationComponent>;
  private dialogRefRoom: MatDialogRef<UserRoomDialogComponent>;
  private dialogRefModification: MatDialogRef<StudyCaseModificationDialogComponent>;

  public hasFlavors:boolean;
  private flavorsList: string[];

  @ViewChild('filter', { static: false }) private filterElement: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('fileInputExport') fileInputExport: ElementRef;

  @HostListener('document:keydown.control.f', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // Check group component is visible
    if (this.elementRef.nativeElement.offsetParent !== null) {
      // Set focus and select all text in filter
      this.filterElement.nativeElement.focus();
      this.filterElement.nativeElement.setSelectionRange(0, this.filterElement.nativeElement.value.length);
      event.preventDefault();
    }
  }

  constructor(
    @Inject(DOCUMENT) document,
    private dialog: MatDialog,
    public userService: UserService,
    private elementRef: ElementRef,
    private socketService: SocketService,
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
    private loadingDialogService: LoadingDialogService,
    private studyDialogService: StudyDialogService,
    private filterService: FilterService,
    private studyCaseValidationService: StudyCaseValidationService,
    private flavorsService: FlavorsService
  ) {
    this.onStudyCaseChangeSubscription = null;
    this.onTradeSpaceSelectionChangedSubscription = null;
    this.treeControl = new NestedTreeControl<TreeNode>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
    this.showStatus = false;
    this.executionStarted = false;
    this.showChangesButtons = false;
    this.studyIsDone = false;
    this.studyIsLoaded = false;
    this.studyCanReload = false;
    this.showStudyRefreshing = false;

    this.studyIsDoneId = -1;
    this.currentSelectedNodeKey = '';
    this.studyExecutionStartedSubscription = null;
    this.studyExecutionStoppedSubscription = null;
    this.studyExecutionUpdatedSubscription = null;
    this.onStudySubmissionEndSubscription = null;
    this.onStudyHaveChangesSubscription = null;
    this.onNewNotificationSubscription = null;
    this.onTreeNodeNavigationSubscription = null;
    this.usersInRoom = [];
    this.numberOfUserRoom = 0;
    this.filterTreeInput = '';

    this.isStudyNoData = false;
    this.isStudyReadOnly = false;
    this.canExecute = false;

    this.isTreeViewFiltered = false;
    this.isSearchOption = true;

    this.hasFlavors = false;
    this.flavorsList = [];
  }


  hasChild = (index: number, node: TreeNode) => {
    return this.getChildren(node).length > 0;
  }

  ngOnInit() {
    this.onStudyCaseChangeSubscription = this.studyCaseDataService.onStudyCaseChange.subscribe(loadedStudy => {
      if (loadedStudy !== null) {

        const currentLoadedStudy = (loadedStudy as LoadedStudy);

        // Applying no data and read only values
        this.isStudyNoData = currentLoadedStudy.noData;
        this.isStudyReadOnly = currentLoadedStudy.readOnly;
        
        //Check if the user has the execution rights to compute the study
        this.canExecute = this.userService.hasExecutionRights();

        // Refreshing filter
        this.filterTreeInput = '';
        this.applyFilterToTreeview('');

        this.root = currentLoadedStudy.treeview;

        this.originTreeNode = this.root.rootNode;
        this.dataSource.data = [this.originTreeNode];
        this.studyIsLoaded = true;
        this.studyCanReload = currentLoadedStudy.canReload;
        this.setStatusOnRootNode(currentLoadedStudy.studyCase.executionStatus);

        // Show status when study was done and change(s) is saved
        if (this.studyIsDone === true && currentLoadedStudy.studyCase.id === this.studyIsDoneId) {  // At study update
          if (this.originTreeNode.status === DisciplineStatus.STATUS_DONE) {
            this.studyIsDone = true;
            this.postProcessingService.resetPostProcessingQueue();
            this.startBackgroundLoadingPostProcessing();
          } else {
            this.onShowHideStatus(true);
            this.studyIsDone = false;
            this.postProcessingService.resetPostProcessingQueue();
          }
        } else {
          if (this.originTreeNode.status === DisciplineStatus.STATUS_DONE) {
            this.studyIsDone = true;
            this.postProcessingService.resetPostProcessingQueue();
            this.startBackgroundLoadingPostProcessing();
          } else {
            this.studyIsDone = false;
            this.postProcessingService.resetPostProcessingQueue();
          }
        }
        this.studyIsDoneId = currentLoadedStudy.studyCase.id;

        this.treeControl.expand(this.originTreeNode);

        Object.keys(this.root.rootDict).forEach(treenodeKey => {
          const panel_id = `${this.root.rootDict[treenodeKey].fullNamespace}.${PanelSection.TREEVIEW_SECTION}`
          if (this.studyCaseDataService.getUserStudyPreference(panel_id, false)) {
            this.treeControl.expand(this.root.rootDict[treenodeKey]);
          }
        });
        this.nodeClick(this.currentSelectedNode);
        this.showChangesButtons = this.studyCaseLocalStorageService.studyHaveUnsavedChanges(currentLoadedStudy.studyCase.id.toString());

        // Set new subscription to calculation if needed, and cleaning old one's
        this.initExecution();
      } else {
        this.dataSource = new MatTreeNestedDataSource();
        this.originTreeNode = null;
        this.nodeClick(null);
        this.studyCaseDataService.isLoadedStudyForTreeview(this.loadedStudyForTreeview)

      }
    });

    this.onRoomUserUpdateSubscription = this.socketService.onRoomUserUpdate.subscribe(users => {
      this.usersInRoom = users;
      this.numberOfUserRoom = this.usersInRoom.length;
    });

    this.onStudyHaveChangesSubscription = this.studyCaseLocalStorageService.unsavedChanges.subscribe(displaySaveBox => {
      this.showChangesButtons = displaySaveBox;
    });

    this.onStudySubmissionEndSubscription = this.socketService.onStudySubmissionEnd.subscribe(submitted => {
      if (submitted) {
        // Emit calculation started
        this.calculationService.onCalculationChange.emit(true);
        this.subscribeToExecution();
        this.studyCaseExecutionObserverService.startStudyCaseExecutionObserver(this.studyCaseDataService.loadedStudy.studyCase.id);
        this.socketService.onUpdateFinished();
      }
    });

    this.onNewNotificationSubscription = this.socketService.onNewNotification.subscribe(notification => {
      this.handleNotificationEvent(notification);
    });

    this.onTradeSpaceSelectionChangedSubscription = this.studyCaseDataService.onTradeSpaceSelectionChanged.subscribe(applyTradeFilter => {
      if (applyTradeFilter) {
        this.applyFilterToTreeview(this.filterTreeInput);
      }
    });

    //get flavors in config api
    this.flavorsService.getAllFlavorsExec().subscribe(flavorList =>
      {
        if (flavorList !== null && flavorList !== undefined && flavorList.length > 0){
         this.hasFlavors = true;
         this.flavorsList = flavorList;
        
        }
      }
    );
  }

  ngAfterViewInit(): void {
    this.onTreeNodeNavigationSubscription = this.studyCaseDataService.onTreeNodeNavigation.subscribe(nodeData => {
      this.onTreeNodeNavigation(nodeData);
    });
  }


  checkTreeViewIsFiltered() {

    let isTradeScenarioFiltered = false;
    if (this.studyCaseDataService.tradeScenarioList.length > 0) {
      this.studyCaseDataService.tradeScenarioList.forEach(tradeScenario => {
        if (tradeScenario.selected === false) {
          isTradeScenarioFiltered = true;
        }
      });
    }

    if ((this.filterTreeInput !== undefined
      && this.filterTreeInput !== null
      && this.filterTreeInput.length > 1 && !this.isSearchOption)
      || isTradeScenarioFiltered ) {
      this.isTreeViewFiltered = true;
    } else {
      this.isTreeViewFiltered = false;
    }
  }

  applyTradeSpaceFiltering() {
    if (this.studyCaseDataService.tradeScenarioList.length > 0) {
      this.recursiveTreeNodeScenarioDisplay(this.dataSource.data[0], this.studyCaseDataService.tradeScenarioList);
    }
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
    this.cleanExecutionSubscriptions();
    if (this.onStudyHaveChangesSubscription !== null) {
      this.onStudyHaveChangesSubscription.unsubscribe();
      this.onStudyHaveChangesSubscription = null;
    }
    if (this.onRoomUserUpdateSubscription !== null && (this.onRoomUserUpdateSubscription !== undefined)) {
      this.onRoomUserUpdateSubscription.unsubscribe();
      this.onRoomUserUpdateSubscription = null;
    }
    if (this.onStudySubmissionEndSubscription !== null && this.onStudySubmissionEndSubscription !== undefined) {
      this.onStudySubmissionEndSubscription.unsubscribe();
      this.onStudySubmissionEndSubscription = null;
    }
    if (this.onNewNotificationSubscription !== null && this.onNewNotificationSubscription !== undefined) {
      this.onNewNotificationSubscription.unsubscribe();
      this.onNewNotificationSubscription = null;
    }

    if (this.onTradeSpaceSelectionChangedSubscription !== null && this.onTradeSpaceSelectionChangedSubscription !== undefined) {
      this.onTradeSpaceSelectionChangedSubscription.unsubscribe();
      this.onTradeSpaceSelectionChangedSubscription = null;
    }

    if (this.onTreeNodeNavigationSubscription !== null && this.onTreeNodeNavigationSubscription !== undefined) {
      this.onTreeNodeNavigationSubscription.unsubscribe();
      this.onTreeNodeNavigationSubscription = null;
    }
    if (this.dialogRefStatus !== null && this.dialogRefStatus !== undefined) {
      this.dialogRefStatus.close();
      this.dialogRefStatus = null;
    }
    if (this.dialogRefValidate !== null && this.dialogRefValidate !== undefined) {
      this.dialogRefValidate.close();
      this.dialogRefValidate = null;
    }
    if (this.dialogRefRoom !== null && this.dialogRefRoom !== undefined) {
      this.dialogRefRoom.close();
      this.dialogRefRoom = null;
    }
    if (this.dialogRefModification !== null && this.dialogRefModification !== undefined) {
      this.dialogRefModification.close();
      this.dialogRefModification = null;
    }

    this.studyDialogService.closeAccessLink();
  }

  get currentSelectedNode(): TreeNode {
    if (this.currentSelectedNodeKey === '') {
      return this.originTreeNode;
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

  onTreeNodeNavigation(nodeData: NodeData) {
    const treenode = nodeData.parent as TreeNode;

    // Set expansion for treenode and related discipline and variable type
    // Expand treenode
    this.treeControl.expand(treenode);

    // Retrieve related disciplines
    const discNames = [];
    if (this.filterService.filters.showSimpleDisplay) {
      discNames.push('Data');
    } else {
      Object.keys(treenode.dataManagementDisciplineDict).forEach(displineKey => {
        if (nodeData.identifier.indexOf(displineKey) > -1) {
        discNames.push(displineKey);
        }
      });
    }


    setTimeout(() => {
      // Expand disciplines
      discNames.forEach(discName => {
        this.setExpandForDisciplinePanel(`${nodeData.parent.fullNamespace}.${PanelSection.TREEVIEW_SECTION}.${discName}`);

        // Expand discipline types panel
        if (nodeData.numerical) {
          this.setExpandForDisciplinePanel(`${nodeData.parent.fullNamespace}.${PanelSection.TREEVIEW_SECTION}.${discName}.${PannelIds.NUMERICAL}`);
        } else if (nodeData.ioType === IoType.IN) {
          this.setExpandForDisciplinePanel(`${nodeData.parent.fullNamespace}.${PanelSection.TREEVIEW_SECTION}.${discName}.${PannelIds.INPUTS}`);
        } else if (nodeData.ioType === IoType.OUT) {
          this.setExpandForDisciplinePanel(`${nodeData.parent.fullNamespace}.${PanelSection.TREEVIEW_SECTION}.${discName}.${PannelIds.OUTPUTS}`);
        }
      });
    }, 1000);

    if (treenode !== null) {
      this.currentSelectedNodeKey = treenode.fullNamespace;
    }

    // Launch animation
    nodeData.isHighlighted = true;
    setTimeout(() => {
      nodeData.isHighlighted = false;
    }, 7000);

    // Expand treenode and his parents
    this.setExpandTreeNodeAndParent(treenode);

    // Scroll to node
    setTimeout(() => {
      const widgetElement = document.getElementById(nodeData.identifier);
      const widgetElementTopPos = widgetElement.offsetTop;
      const containerElement = document.getElementById('data-management-widget-container');
      containerElement.scrollTop = widgetElementTopPos;
    }, 1000);
    this.treeNodeDataService.send_tree_node(treenode);
  }

  setExpandForDisciplinePanel(TreeNodeOrPanelId: string) {
    this.studyCaseDataService.loadedStudy.userStudyPreferences.expandedData[TreeNodeOrPanelId] = true;
    this.studyCaseDataService.setUserStudyPreference(TreeNodeOrPanelId, true).subscribe({
      next: (_) => {},
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
      next: (_) => {},
      error: (error) => {
        this.snackbarService.showError(error);
      }
    });
  }

  onShowHideStatus(showStatus: boolean) {
    if (showStatus) {
      this.showStatus = true;
    } else {
      this.showStatus = false;
    } 
  }

  onShowHideState() {
    if (this.showState) {
      this.showState = false;
    } else {
      this.showState = true;
    } 
  }

  onSetSearchOption(){
    this.isSearchOption = true;
    this.applyFilterValue(this.filterTreeInput)
  }

  onSetFilterOption(){
    this.isSearchOption = false;
    this.nodeClick(this.currentSelectedNode);
    this.applyFilterValue(this.filterTreeInput)
  }

  initExecution() {

    // Cleaning old subscriptions
    this.cleanExecutionSubscriptions();

    this.calculationService.getStatus(this.studyCaseDataService.loadedStudy.studyCase.id).subscribe({
      next: (t) => {
      const studyCaseStatusList = t as StudyCaseExecutionStatus;
      this.setStatusOnRootNode(studyCaseStatusList.studyCalculationStatus);
      if (studyCaseStatusList.studyCalculationStatus == StudyCalculationStatus.STATUS_RUNNING) {
        this.setStatusOnRootNode(StudyCalculationStatus.STATUS_RUNNING);
        
        // if there are not status yet, set all to pending
        if (Object.keys(studyCaseStatusList.disciplinesStatus).length == 0) {
          this.setStatusOnRootNode(StudyCalculationStatus.STATUS_RUNNING);
          Object.keys(this.root.rootDict).forEach(key => {
            if ((key !== this.root.rootNode.fullNamespace) && (!key.includes('references'))) {
              this.setStatusOnTreeDict(key, DisciplineStatus.STATUS_PENDING);
            }
          });
         } 
        // Emit calculation started
        this.calculationService.onCalculationChange.emit(true);
        this.subscribeToExecution();
        this.studyCaseExecutionObserverService.startStudyCaseExecutionObserver(this.studyCaseDataService.loadedStudy.studyCase.id);
        
      }
      // in case we are waiting for pod to lunch the execution: set all to pending
      else if (studyCaseStatusList.studyCalculationStatus == StudyCalculationStatus.STATUS_PENDING 
        || studyCaseStatusList.studyCalculationStatus == StudyCalculationStatus.STATUS_POD_PENDING) {
          this.setStatusOnRootNode(StudyCalculationStatus.STATUS_PENDING);
          Object.keys(this.root.rootDict).forEach(key => {
            if ((key !== this.root.rootNode.fullNamespace) && (!key.includes('references'))) {
              this.setStatusOnTreeDict(key, DisciplineStatus.STATUS_PENDING);
            }
          });
          // Emit calculation started
          this.calculationService.onCalculationChange.emit(true);
          this.subscribeToExecution();
          this.studyCaseExecutionObserverService.startStudyCaseExecutionObserver(this.studyCaseDataService.loadedStudy.studyCase.id);
        
      }
    }, error: (errorReceived) => {
      const error = errorReceived as SoSTradesError;
      this.calculationService.onCalculationChange.emit(false);
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error getting study execution status : ' + error.description);
      }
    }
  });

  }

  cleanExecutionSubscriptions() {

    this.executionStarted = false;

    if (this.studyExecutionStartedSubscription !== null) {
      this.studyExecutionStartedSubscription.unsubscribe();
      this.studyExecutionStartedSubscription = null;
    }

    if (this.studyExecutionStoppedSubscription !== null) {
      this.studyExecutionStoppedSubscription.unsubscribe();
      this.studyExecutionStoppedSubscription = null;
    }

    if (this.studyExecutionUpdatedSubscription !== null) {
      this.studyExecutionUpdatedSubscription.unsubscribe();
      this.studyExecutionUpdatedSubscription = null;
    }
  }

  onOpenSettings(){
    // get execution flavor from db in cas it was changed  y another user
    this.studyCaseDataService.getExecutionFlavor(this.studyCaseDataService.loadedStudy.studyCase.id).subscribe(flavor=> {
      const dialogData: PodSettingsDialogData = new PodSettingsDialogData();
      dialogData.flavorsList = this.flavorsList;
      dialogData.type = "Execution";
      dialogData.flavor = flavor;
      
      const dialogRef = this.dialog.open(PodSettingsComponent, {
        disableClose: false,
        data: dialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        const podData: PodSettingsDialogData = result as PodSettingsDialogData;
        if (podData !== null && podData !== undefined) {
          if (podData.cancel === false) {
            // Close study if the loaded study is the same that the study edited
            if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
              let study_case = this.studyCaseDataService.loadedStudy.studyCase;
              this.studyCaseDataService.updateExecutionFlavor(study_case.id, podData.flavor).subscribe(
              studyIsEdited => {
                  this.snackbarService.showInformation(`Study ${study_case.name} has been succesfully updated, changes will be taken into account at the next execution. `);
                }, errorReceived => {
                  this.snackbarService.showError('Error updating study\n' + errorReceived.description);
                  this.loadingDialogService.closeLoading();
                });
              }
            }
          }
        },
          errorReceived => {
            const error = errorReceived as SoSTradesError;
            if (error.redirect) {
              this.loadingDialogService.closeLoading();
              this.snackbarService.showError(error.description);
            } else {
              this.loadingDialogService.closeLoading();
              this.snackbarService.showError(`Error updating study-case: ${error.description}`);
            }
          }
        );
    });
  }

  onStartExecution() {

    if (!this.executionStarted) {

      if (this.studyCaseDataService.loadedStudy.userIdExecutionAuthorized !== this.userService.getCurrentUserId()) {
        const validationDialogData = new ValidationDialogData();

        let userWithExecAuth = this.userService.allUsers.filter(x => x.id === this.studyCaseDataService.loadedStudy.userIdExecutionAuthorized)
        if (userWithExecAuth !== null && userWithExecAuth !== undefined && userWithExecAuth.length > 0) {
          validationDialogData.message = `${userWithExecAuth[0].firstname}  ${userWithExecAuth[0].lastname} has execution right, do you want to claim it now and start execution ?`;
        } else {
          validationDialogData.message = `You don't have execution right, do you want to claim it now and start execution ?`;
        }
        validationDialogData.title = 'Claim execution right';
        validationDialogData.buttonOkText = 'Claim & Start execution';

        this.dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
          disableClose: true,
          data: validationDialogData,
        });

        this.dialogRefValidate.afterClosed().subscribe((result) => {
          const validationData: ValidationDialogData = result as ValidationDialogData;

          if (validationData !== null && validationData !== undefined) {
            if (validationData.cancel !== true) {
              if (validationData.validate === true) {

                this.loadingDialogService.showLoading(`Claiming study case execution right`);

                this.studyCaseDataService.claimStudyExecutionRight().subscribe({
                  next: (res) => {
                    this.studyCaseDataService.loadedStudy.userIdExecutionAuthorized = this.userService.getCurrentUserId();
                    this.socketService.claimStudyExecution(this.studyCaseDataService.loadedStudy.studyCase.id);
                    this.loadingDialogService.closeLoading();
                    this.snackbarService.showInformation(res);
                    this.checkChangesAndStartExecution();
                  },
                  error: (errorReceived) => {
                    this.loadingDialogService.closeLoading();
                    const error = errorReceived as SoSTradesError;
                    if (error.redirect) {
                      this.snackbarService.showError(error.description);
                    } else {
                      this.snackbarService.showError('Error claiming study case execution : ' + error.description);
                    }
                  }
                });
              }
            }
          }
        });
      } else {
        this.checkChangesAndStartExecution();
      }
    }
  }

  checkChangesAndStartExecution() {
    this.handleUnsavedChanges(changeHandled => {
      if (changeHandled) {
        const dataMissing = this.checkAllDataFilled();
        if (dataMissing.length === 0) {
          this.calculationService.onCalculationChange.emit(true);
          this.loadingDialogService.showLoading('Submitting study case to calculation server');
          this.socketService.submitStudy(this.studyCaseDataService.loadedStudy.studyCase.id);

          const studyCase = this.studyCaseDataService.loadedStudy.studyCase;
          this.calculationService.execute(this.studyCaseDataService.loadedStudy).subscribe({
            next: (response) => {
              // Send socket notification
              this.socketService.executeStudy(studyCase.id, true);
          
              this.subscribeToExecution();
              this.studyCaseExecutionObserverService.startStudyCaseExecutionObserver(studyCase.id);
              this.postProcessingService.clearPostProcessingDict();
          
              this.snackbarService.showInformation('Study case successfully submitted');
          
              
              Object.keys(this.root.rootDict).forEach(key => {
                if ((key !== this.root.rootNode.fullNamespace) && (!key.includes('references'))) {
                  this.setStatusOnTreeDict(key, DisciplineStatus.STATUS_PENDING);
                }
              });
              // Setting root node at status_stopped corresponding to discipline pending
              this.setStatusOnRootNode(StudyCalculationStatus.STATUS_STOPPED);
          
              this.loadingDialogService.closeLoading();
            },
            error: (errorReceived) => {
              // Send socket notification
              this.socketService.executeStudy(this.studyCaseDataService.loadedStudy.studyCase.id, false);
              this.calculationService.onCalculationChange.emit(false);
              this.executionStarted = false;
              const error = errorReceived as SoSTradesError;
              this.loadingDialogService.closeLoading();
              if (error.redirect) {
                this.snackbarService.showError(error.description);
              } else {
                this.snackbarService.showError('Study case submission failed : ' + error.description);
              }
            }
          });
        } else {
          // eslint-disable-next-line max-len
          this.snackbarService.showWarning('Missing mandatory data before being able to execute study case (Node => ' + dataMissing[0] + ', ...)');
        }
      }
    });
  }

  onStopExecution() {

    if (this.executionStarted) {

      if (this.studyCaseDataService.loadedStudy.userIdExecutionAuthorized !== this.userService.getCurrentUserId()) {
        const validationDialogData = new ValidationDialogData();

        let userWithExecAuth = this.userService.allUsers.filter(x => x.id === this.studyCaseDataService.loadedStudy.userIdExecutionAuthorized)
        if (userWithExecAuth !== null && userWithExecAuth !== undefined && userWithExecAuth.length > 0) {
          validationDialogData.message = `${userWithExecAuth[0].firstname}  ${userWithExecAuth[0].lastname} has started study case execution, do you want to stop it now ?`;
        } else {
          validationDialogData.message = `Study case execution has been started, do you want to stop it now?`;
        }
        validationDialogData.title = 'Stop execution';
        validationDialogData.buttonOkText = 'Stop execution';

        this.dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
          disableClose: true,
          data: validationDialogData,
        });

        this.dialogRefValidate.afterClosed().subscribe((result) => {
          const validationData: ValidationDialogData = result as ValidationDialogData;

          if (validationData !== null && validationData !== undefined) {
            if (validationData.cancel !== true) {
              if (validationData.validate === true) {
                this.checkAndStopExecution();
              }
            }
          }
        });
      } else {
        this.checkAndStopExecution();
      }
    }
  }

  checkAndStopExecution() {
    this.loadingDialogService.showLoading('Requesting study case termination');

    const studyCaseObserver = this.studyCaseExecutionObserverService.getStudyCaseObserver(this.studyCaseDataService.loadedStudy.studyCase.id);

    this.calculationService.stop(this.studyCaseDataService.loadedStudy.studyCase.id).subscribe({
      next: (response) => {
        this.setStatusOnRootNode(StudyCalculationStatus.STATUS_STOPPED);
        this.snackbarService.showInformation('Study case successfully terminated');
        studyCaseObserver.stop();
        
        this.loadingDialogService.updateMessage(`Refreshing study case ${this.studyCaseDataService.loadedStudy.studyCase.name}.`);
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.loadingDialogService.closeLoading();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Study case termination failed : ' + error.description);
          studyCaseObserver.stop();
        }
      }
    });
  }

  private subscribeToExecution() {

    const studyCaseObserver = this.studyCaseExecutionObserverService.getStudyCaseObserver(this.studyCaseDataService.loadedStudy.studyCase.id);

    // Start of the execution
    this.studyExecutionStartedSubscription = studyCaseObserver.
      executionStarted.subscribe(d => {
        this.executionStarted = true;
        this.onShowHideStatus(true);
        // Resetting cpu and memory value before run
        const systemLoad = new StudyCaseExecutionSystemLoad('----', '----');
        this.calculationService.onCalculationSystemLoadChange.emit(systemLoad);
      });

    // Update of the execution
    this.studyExecutionUpdatedSubscription = studyCaseObserver.
      executionUpdate.subscribe(t => {
        this.calculationService.onCalculationChange.emit(true);
        const studyCaseStatusList = t as StudyCaseExecutionStatus;
        const systemLoad = new StudyCaseExecutionSystemLoad(t.studyCalculationCpu, t.studyCalculationMemory);
        this.calculationService.onCalculationSystemLoadChange.emit(systemLoad);
        const statusList = Object.keys(studyCaseStatusList.disciplinesStatus);

        if (statusList.length > 0) {
          statusList.forEach(key => {
            // eslint-disable-next-line max-len
            if (studyCaseStatusList.disciplinesStatus[key] === DisciplineStatus.STATUS_CONFIGURE || studyCaseStatusList.disciplinesStatus[key] === DisciplineStatus.STATUS_VIRTUAL || studyCaseStatusList.disciplinesStatus[key] === DisciplineStatus.STATUS_NONE) {
              this.setStatusOnTreeDict(key, DisciplineStatus.STATUS_PENDING);
            } else {
              this.setStatusOnTreeDict(key, studyCaseStatusList.disciplinesStatus[key]);
            }
          });
        }
        this.setStatusOnRootNode(studyCaseStatusList.studyCalculationStatus);

        //if execution is in error

      });

    // When execution is over
    this.studyExecutionStoppedSubscription = studyCaseObserver.
      executionStopped.subscribe(s => {

        const studyCaseStatusList = s as StudyCaseExecutionStatus;
        
        if (studyCaseStatusList !== null && studyCaseStatusList !== undefined) {
          if (Object.keys(studyCaseStatusList.disciplinesStatus).length > 0) {
            Object.keys(studyCaseStatusList.disciplinesStatus).forEach(key => {
              this.setStatusOnTreeDict(key, studyCaseStatusList.disciplinesStatus[key]);
            });
          }
        }
        this.setStatusOnRootNode(studyCaseStatusList.studyCalculationStatus);

        if ((studyCaseStatusList.studyCalculationStatus ===  StudyCalculationStatus.STATUS_FAILED ||
          studyCaseStatusList.studyCalculationStatus ===  StudyCalculationStatus.STATUS_POD_ERROR)  && 
          studyCaseStatusList.studyCalculationErrorMessage) {
          this.snackbarService.showError(studyCaseStatusList.studyCalculationErrorMessage);
        }
        // Reload the study in order to get all post postprocessing data
        const studySubscription = this.studyCaseMainService.loadStudy(this.studyCaseDataService.loadedStudy.studyCase.id, true).subscribe({
          next: (resultLoadedStudy) => {
            let loadedstudyCase = resultLoadedStudy as LoadedStudy;
            this.studyCaseLoadingService.finalizeLoadedStudyCase(loadedstudyCase, (isStudyLoaded)=>{
                  studySubscription.unsubscribe();
                  // Cleaning old subscriptions
                  this.cleanExecutionSubscriptions();
                  this.setStatusOnRootNode((loadedstudyCase as LoadedStudy).studyCase.executionStatus);
                  this.calculationService.onCalculationChange.emit(false);
                  this.studyCaseValidationService.setValidationOnNode(this.studyCaseDataService.loadedStudy.treeview);
                  this.loadingDialogService.closeLoading();
                }, false, true).subscribe();
                
              },
          error: (errorReceived) => {
            const error = errorReceived as SoSTradesError;
            if (error.redirect) {
              this.snackbarService.showError(error.description);
            } else {
              this.snackbarService.showError('Error refreshing study data after execution : ' + error.description);
            }
            // Cleaning old subscriptions
            this.cleanExecutionSubscriptions();
            this.loadingDialogService.closeLoading();
            this.calculationService.onCalculationChange.emit(false);
          }
        });
      });
  }

  reloadStudy() {
    this.loadingDialogService.showLoading('Requesting study case reloading');

    this.studyCaseMainService.reloadStudy(this.studyCaseDataService.loadedStudy.studyCase.id).subscribe(response => {
      let loadedStudy = response as LoadedStudy;
      this.studyCaseLoadingService.updateStudyCaseDataService(loadedStudy);
      this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
      //reload study for post processing
      this.studyCasePostProcessingService.loadStudy(this.studyCaseDataService.loadedStudy.studyCase.id, true).subscribe({
        next: (response) => {
          //send coedition reload
          this.socketService.reloadStudy(this.studyCaseDataService.loadedStudy.studyCase.id);
      
          if (this.studyCaseDataService.loadedStudy.treeview.rootNode.status === DisciplineStatus.STATUS_DONE) {
            this.studyIsDone = true;
          } else {
            this.onShowHideStatus(true);
            this.studyIsDone = false;
          }
          this.postProcessingService.clearPostProcessingDict();
          this.postProcessingService.resetPostProcessingQueue();
          this.startBackgroundLoadingPostProcessing();
      
          this.snackbarService.showInformation('Study case successfully reloaded');
          this.loadingDialogService.closeLoading();
        },
        error: (errorReceived) => {
          const error = errorReceived as SoSTradesError;
          this.loadingDialogService.closeLoading();
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.snackbarService.showError('Study case reloading failed : ' + error.description);
          }
        }
      });
    });
  }

  private setStatusOnRootNode(status) {
    switch (status) {
      case StudyCalculationStatus.STATUS_RUNNING:
        this.root.rootNode.status = DisciplineStatus.STATUS_RUNNING;
        break;
      case StudyCalculationStatus.STATUS_FINISHED:
        this.root.rootNode.status = DisciplineStatus.STATUS_DONE;
        break;
      case StudyCalculationStatus.STATUS_FAILED:
        this.root.rootNode.status = DisciplineStatus.STATUS_FAILED;
        break;
      case StudyCalculationStatus.STATUS_STOPPED:
        this.root.rootNode.status = DisciplineStatus.STATUS_CONFIGURE;
        break;
      case StudyCalculationStatus.STATUS_PENDING:
        this.root.rootNode.status = DisciplineStatus.STATUS_PENDING;
        break;
      case StudyCalculationStatus.STATUS_POD_ERROR:
        this.root.rootNode.status = DisciplineStatus.STATUS_FAILED;
        break;
      default:
        break;
    }
  }

  private setStatusOnTreeDict(treenodeFullName, status) {


    const foundTreeNode = Object.values(this.root.rootDict).find(x => x.fullNamespace === treenodeFullName);
    if (foundTreeNode !== null && foundTreeNode !== undefined) {
      foundTreeNode.status = status;
    } else if (this.root.rootDict[treenodeFullName] !== null && this.root.rootDict[treenodeFullName] !== undefined) {
      this.root.rootDict[treenodeFullName].status = status;
    }
  }

  onShowStatusInformation() {
    this.dialogRefStatus = this.dialog.open(StudyCaseStatusInformationComponent, {
      disableClose: false
    });
  }

  onShowRoomUser() {
    const usersRoomDialogData = new UsersRoomDialogData();
    usersRoomDialogData.users = this.usersInRoom;
    usersRoomDialogData.studyName = this.studyCaseDataService.loadedStudy.studyCase.name;

    this.dialogRefRoom = this.dialog.open(UserRoomDialogComponent, {
      disableClose: false,
      width: '850px',
      height: '600px',
      data: usersRoomDialogData,
      panelClass: 'csvDialog'
    });
  }

  onAccessLink() {
    const studyCase = this.studyCaseDataService.loadedStudy.studyCase;
    this.studyDialogService.showAccessLink(studyCase);
  }

  onReloadStudy() {
    const validationDialogData = new ValidationDialogData();
    validationDialogData.message = `You are about to revert the study to its state before its first calculation,\n you may lose modifications. \nAre you sure you want to proceed ?`;
    validationDialogData.buttonOkText = 'Reload Study';
    validationDialogData.title = 'Reload Study';

    this.dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,
      data: validationDialogData
    });
    this.dialogRefValidate.afterClosed().subscribe((result) => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if (validationData !== null && validationData !== undefined) {
        if (validationData.cancel !== true) {
          if (validationData.validate === true) {
            this.reloadStudy();
          }
        }
      }
    });
  }

  saveAndSynchronise() {
    this.saveData(saveDone => {
    });
  }

  onImportDatasetFromJsonFile(event) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    
    if (file) {
      {
        // Create formData object and send the file
        const formData = new FormData();
        formData.append('datasets_mapping_file', file);
        const currentStudyId = this.studyCaseDataService.loadedStudy.studyCase.id;
        this.loadingDialogService.showLoading('Update parameter from dataset mapping');
        this.studyCaseDataService.addNewStudyNotificationForDatasetImport(currentStudyId).subscribe({
          next: (notification_id) => {
            this.studyCaseMainService.importDatasetFromJsonFile(currentStudyId, formData, notification_id).subscribe({
              next: (loadedStudy) => {
                const parameterChange$ =  this.studyCaseDataService.getStudyParemeterChanges(currentStudyId, notification_id);
                const datasetImportStatus$ = this.studyCaseMainService.getDatasetImportErrorMessage(currentStudyId);

                combineLatest([parameterChange$,datasetImportStatus$]).subscribe({
                  next: ([changes, datasetMessage]) => {
                      if (datasetMessage !== null && datasetMessage !== undefined && datasetMessage !== ''){
                        this.loadingDialogService.closeLoading();
                        this.snackbarService.showError(datasetMessage);
                      }
                      else if (changes.length === 0)
                      {
                        this.loadingDialogService.closeLoading();
                        this.snackbarService.showWarning("There has been no changes applied. Maybe verify your datasets-mapping file.");
                      }
                      if (changes.length > 0 ) {
                        this.studyCaseLocalStorageService.finalizeUpdateParameterFromDataset(loadedStudy);
                        // clear post processing dictionnary
                        this.postProcessingService.clearPostProcessingDict();
                        // Retrieve parameter changes to trigger the socket service
                        this.socketService.saveStudy(currentStudyId,changes);
                      }
                      
                  
                },
                error: (error) => {

                  this.loadingDialogService.closeLoading();
                  this.snackbarService.showError(`Error retrieving study case changes: ${error.description}`);
                
                }
                });
              },
              error: (error) => {
                this.snackbarService.showError(`Error uploading file: ${error.description}`);
                this.loadingDialogService.closeLoading();
              }
            });

          },
          error: (error) => {
            this.snackbarService.showError(`Error to add new notification: ${error.description}`);
            this.loadingDialogService.closeLoading();
          }
        })
        
      }
    } else {
      this.snackbarService.showError('Any file selected');
    }
    this.fileInput.nativeElement.value = null;
  }

  onExportDatasetFromJsonFile(event) {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    
    if (file){
      // Create formData object and send the file
      const formData = new FormData();
      formData.append('datasets_mapping_file', file);
      const currentStudyId = this.studyCaseDataService.loadedStudy.studyCase.id;
      this.loadingDialogService.showLoading('Export parameters from dataset mapping');
      this.studyCaseDataService.addNewStudyNotificationForDatasetExport(currentStudyId).subscribe({
        next: (notification_id) => {
          this.studyCaseMainService.exportDatasetFromJsonFile(currentStudyId, formData, notification_id).subscribe({
            next: (loadedStudy) => {
                const parameterChange$ =  this.studyCaseDataService.getStudyParemeterChanges(currentStudyId, notification_id);
              const datasetExportStatus$ = this.studyCaseMainService.getDatasetExportErrorMessage(currentStudyId, notification_id);

              combineLatest([parameterChange$,datasetExportStatus$]).subscribe({
                next: ([changes, datasetMessage]) => {
                    if (datasetMessage !== null && datasetMessage !== undefined && datasetMessage !== ''){
                      this.loadingDialogService.closeLoading();
                      this.snackbarService.showError(datasetMessage);
                    }
                    else if (changes.length === 0)
                    {
                      this.loadingDialogService.closeLoading();
                      this.snackbarService.showWarning("There has been nothing to export. Maybe verify your datasets-mapping file.");
                    }
                    else{
                      // Retrieve parameter changes to trigger the socket service
                      this.socketService.exportedStudy(currentStudyId,changes);
                      this.loadingDialogService.closeLoading();
                      this.snackbarService.showInformation("Study parameters have been exported in datasets, see notifications to see the exported parameters and locations.");
                    }                     
                
                },
                error: (error) => {
                  this.snackbarService.showError(`${error.description}`);
                  this.loadingDialogService.closeLoading();
                }
              });
              
            },
            error: (error) => {
              this.snackbarService.showError(`${error.description}`);
              this.loadingDialogService.closeLoading();
            }
          });
        },
        error: (error) => {
          this.snackbarService.showError(`Error to add new notification: ${error.description}`);
          this.loadingDialogService.closeLoading();
        }
      });
    } else {
      this.snackbarService.showError('No file selected');
    }
    this.fileInputExport.nativeElement.value = null;
  }

  saveData(saveDone: any) {
    let studyParameters: StudyUpdateParameter[] = [];
    studyParameters = this.studyCaseLocalStorageService
      .getStudyParametersFromLocalStorage(this.studyCaseDataService.loadedStudy.studyCase.id.toString());

    const studyCaseModificatioDialogData = new StudyCaseModificationDialogData();
    studyCaseModificatioDialogData.changes = studyParameters;

    this.dialogRefModification = this.dialog.open(StudyCaseModificationDialogComponent, {
      disableClose: true,
      width: '1100px',
      height: '800px',
      panelClass: 'csvDialog',
      data: studyCaseModificatioDialogData
    });

    this.dialogRefModification.afterClosed().subscribe(result => {
      const resultData: StudyCaseModificationDialogData = result as StudyCaseModificationDialogData;

      if ((resultData !== null) && (resultData !== undefined)) {
        if (resultData.cancel !== true) {

          this.studyCaseLocalStorageService.saveStudyChanges(
            this.studyCaseDataService.loadedStudy.studyCase.id.toString(),
            resultData.changes,
            true,
            isSaveDone => {
              if (isSaveDone) {
                // clear post processing dictionnary
                this.postProcessingService.clearPostProcessingDict();

                // Send socket notifications
                this.socketService.saveStudy(this.studyCaseDataService.loadedStudy.studyCase.id, resultData.changes);
                saveDone(true);
              } else {
                saveDone(false);
              }
            });
        } else {
          saveDone(false);
        }
      }
    });
  }

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.applyFilterValue(filterValue);
  }

  applyFilterValue(filterValue: string){

    if (filterValue !== null && filterValue !== undefined && filterValue.length > 1) {
      if(this.isSearchOption){
        this.applySearchToVariable(filterValue);
        this.applyFilterToTreeview("");
      } else {
        this.applyFilterToTreeview(filterValue);
        // this.treeControl.expandDescendants(this.originTreeNode);
      }
    } else {
      if(!this.isSearchOption){
        this.applyFilterToTreeview('');
      }
      else{
        this.studyCaseDataService.resetSearch();
        this.treeNodeDataService.send_tree_node(this.currentSelectedNode);
      }
    }
  }

  handleNotificationEvent(notification: CoeditionNotification) {
    if (notification.type === CoeditionType.SAVE && notification.isOnlyMessage === false) {
      this.updateTreeview();
    }
    else if (notification.type === CoeditionType.RELOAD && notification.isOnlyMessage === false) {
      this.updateTreeview();
      this.startBackgroundLoadingPostProcessing();
    }
  }

  applyFilterToTreeview(filter: string) {
    this.setChildOk(filter, this.dataSource.data);
    this.applyTradeSpaceFiltering();
    this.checkTreeViewIsFiltered();
  }

  applySearchToVariable(filter: string) {
    this.studyCaseDataService.dataSearch(filter, this.filterService.filters.showReadOnly, this.filterService.filters.userLevel);
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

  updateTreeview() {
    const expandedTreenodeKey = [];

    if (this.root !== null && this.root !== undefined) {
      Object.keys(this.root.rootDict).forEach(treenodeKey => {
        if (this.treeControl.isExpanded(this.root.rootDict[treenodeKey])) {
          expandedTreenodeKey.push(treenodeKey);
        }
      });
    }

    let currentNodeDeleted = false;
    this.showStudyRefreshing = true;
    const oldTreeView = this.root;
    const oldCurrentSelectedNode = this.currentSelectedNode;

    this.studyCaseMainService.loadStudy(this.studyCaseDataService.loadedStudy.studyCase.id, false).subscribe(loadedStudy => {
      this.root = (loadedStudy as LoadedStudy).treeview;

      // Check if current selected node still exist
      if (this.root.rootDict[oldCurrentSelectedNode.fullNamespace] === null
        || this.root.rootDict[oldCurrentSelectedNode.fullNamespace] === undefined) {
        currentNodeDeleted = true;
      }

      // Applying user local changes
      if (this.studyCaseLocalStorageService.studyHaveUnsavedChanges(loadedStudy.studyCase.id.toString())) {
        let studyParameters: StudyUpdateParameter[] = [];
        studyParameters = this.studyCaseLocalStorageService.getStudyParametersFromLocalStorage(loadedStudy.studyCase.id.toString());

        studyParameters.forEach(nodeDataCache => {

          const nodeData = this.root.rootNodeDataDict[nodeDataCache.variableId];

          // Check if new value pushed for user cache and applying modification to local storage
          if (nodeDataCache.oldValue !== nodeData.oldValue) {

            const newItemSave = new StudyUpdateParameter(
              nodeDataCache.variableId,
              nodeDataCache.variableType,
              nodeDataCache.changeType,
              nodeDataCache.columnDeleted,
              nodeDataCache.namespace,
              nodeDataCache.discipline,
              nodeDataCache.newValue,
              nodeData.oldValue,
              null,
              nodeDataCache.lastModified,
              null,
              null,
              null,
              null,
              null
            );

            this.studyCaseLocalStorageService.setStudyParametersInLocalStorage(
              newItemSave,
              nodeData,
              loadedStudy.studyCase.id.toString());
          }
          // Updating treenode with user changes
          this.studyCaseDataService.loadedStudy.treeview.rootNodeDataDict[nodeDataCache.variableId].value = nodeDataCache.newValue;
        });
      }

      // Refreshing treenode
      this.originTreeNode = this.root.rootNode;
      this.dataSource.data = [this.originTreeNode];
      this.setStatusOnRootNode((loadedStudy as LoadedStudy).studyCase.executionStatus);
      this.onShowHideStatus(true);
      this.studyIsDone = false;

      this.treeControl.expand(this.originTreeNode);

      if (expandedTreenodeKey.length > 0) {
        Object.keys(this.root.rootDict).forEach(treenodeKey => {

          if (expandedTreenodeKey.includes(treenodeKey)) {
            this.treeControl.expand(this.root.rootDict[treenodeKey]);
          }
        });
      }

      this.showStudyRefreshing = false;

      if (currentNodeDeleted) {
        this.nodeClick(this.currentSelectedNode);
        this.snackbarService.showWarning('The node you were working in, has been deleted, study refreshed.');
      } else {
        this.nodeClick(this.currentSelectedNode);
        this.snackbarService.showInformation('Study case successfully refreshed');
      }
      this.socketService.onUpdateFinished();
    });
  }

  onRefresh() {
    // TO BE IMPLEMENTED
  }

  checkAllDataFilled() {
    const nodesIncomplete = [];
    Object.keys(this.root.rootDict).forEach(key => {
      if (!this.root.rootDict[key].checkTreeNodeConfigured()) {
        nodesIncomplete.push(this.root.rootDict[key].fullNamespace);
      }
    });
    return nodesIncomplete;
  }



  handleUnsavedChanges(changeHandled: any) {

    if (this.studyCaseLocalStorageService.studiesHaveUnsavedChanges()) {
      const validationDialogData = new ValidationDialogData();
      // eslint-disable-next-line max-len
      validationDialogData.message = `You have made unsaved changes in your study save & synchronise your changes before launching calculation ?`;
      validationDialogData.buttonOkText = 'Save & Run';

      this.dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
        disableClose: true,
        data: validationDialogData
      });

      this.dialogRefValidate.afterClosed().subscribe(result => {
        const validationData: ValidationDialogData = result as ValidationDialogData;

        if ((validationData !== null) && (validationData !== undefined)) {
          if (validationData.cancel !== true) {
            this.saveData(saveDone => {
              if (saveDone) {
                changeHandled(true);
              } else {
                changeHandled(false);
              }
            });
          } else {
            changeHandled(false);
          }
        }
      });
    } else {
      changeHandled(true);
    }
  }

  private startBackgroundLoadingPostProcessing() {

    if (this.studyCaseDataService.loadedStudy.loadStatus !== LoadStatus.READ_ONLY_MODE) {
      Object.keys(this.root.rootDict).forEach(key => {
          const postProcessingBundle = this.root.rootDict[key].postProcessingBundle;
          const postProcessingBundleDict = this.postProcessingService.getPostProcessingDict(this.root.rootDict[key].fullNamespace);
          if (postProcessingBundle !== undefined && postProcessingBundle !== null && postProcessingBundle.length > 0
            && (postProcessingBundleDict === null || postProcessingBundleDict === undefined)) {
            postProcessingBundle.forEach(bdl => {
              this.postProcessingService.addPostProcessingRequestToQueue(
                this.studyCaseDataService.loadedStudy,
                bdl.disciplineName,
                bdl);
            });
          }
      });
    }
  }

}
