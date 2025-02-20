import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DisciplineStatus } from 'src/app/models/study-case-execution-observer.model';
import { FilterService } from 'src/app/services/filter/filter.service';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { UserService } from 'src/app/services/user/user.service';
import { UserLevel } from 'src/app/models/user-level.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket/socket.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { Routing } from 'src/app/models/enumeration.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { LoadStatus } from 'src/app/models/study.model';



@Component({
  selector: 'app-study-workspace',
  templateUrl: './study-workspace.component.html',
  styleUrls: ['./study-workspace.component.scss']
})
export class StudyWorkspaceComponent implements OnInit, OnDestroy {

  @ViewChild('tabGroup', { static: false }) tabGroup: ElementRef;

  public showView: boolean;
  public showSearch: boolean;
  public isFullScreenOn: boolean;
  public tabNameSelected: string;
  public studyIsLoaded: boolean;
  public showPostProcessing: boolean;
  public showVisualisation: boolean;
  public showPostProcessingContent: boolean;
  public showVisualisationContent: boolean;
  public showDocumentationContent: boolean;

  public showDataManagement: boolean;
  public showDocumentation: boolean;
  public showDataValidation: boolean;
  // Hide the dashboad page
  // public showDashboard: boolean;
  public hasDocumentation: boolean;
  public hasDashboard: boolean;
  private onStudyCaseChangeSubscription: Subscription;
  private onSearchChangeSubscription: Subscription;
  private onTreeNodeChangeSubscription: Subscription;
  private onShowDataManagementSubscription: Subscription;
  private onParameterUpdateSubscription: Subscription;

  public modelsFullPathList: string[];
  public hasAccessToStudy: boolean;
  private userLevel: UserLevel;
  public userLevelList: string[];
  public selectedUserlevel: string;
  private routerSubscription: Subscription;
  public processIdentifier : string;
  public newUserLevelValue: number;
  public selectedTabIndex: number;



  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  fullscreenmode() {
    this.isFullScreenOn = !this.isFullScreenOn;
  }

  constructor(
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    public calculationService: CalculationService,
    private router: Router,
    private snackbarService: SnackbarService,
    public filterService: FilterService,
    public processService: ProcessService,
    public studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private appDataService: AppDataService,
    private socketService: SocketService,
    private renderer: Renderer2,
    private treeNodeDataService: TreeNodeDataService) {
    this.showView = false;
    this.showSearch = false;
    this.showPostProcessing = false;
    this.showVisualisation = false;
    this.showPostProcessingContent = false;
    this.showVisualisationContent = false;
    this.showDocumentationContent = false;
    this.onStudyCaseChangeSubscription = null;
    this.studyIsLoaded = false;
    this.onTreeNodeChangeSubscription = null;
    this.onShowDataManagementSubscription = null;
    this.onParameterUpdateSubscription = null;
    this.tabNameSelected = '';
    this.isFullScreenOn = false;
    this.showDocumentation = false;
    this.hasDocumentation = false;
    this.modelsFullPathList = [];
    // this.showDashboard = false;
    this.hasDashboard = false;
    this.showDataManagement = true;
    this.showDataValidation = false;
    this.hasAccessToStudy = false;
    this.userLevel = new UserLevel();
    this.userLevelList = this.userLevel.userLevelList;
    this.routerSubscription = null;
    this.processIdentifier = '';
    this.newUserLevelValue = 0;
    this.selectedTabIndex = 0;
  }

  ngOnInit() {
    this.tabNameSelected = 'Documentation';
    this.showDocumentationContent=true
    this.showSearch = false;
    this.setDiplayableItems();
    
    this.onStudyCaseChangeSubscription = this.studyCaseDataService.onStudyCaseChange.subscribe(() => {
      this.setDiplayableItems();
    });

    if (this.userService.hasAccessToStudy()) {
      this.hasAccessToStudy = true;
      this.routerSubscription = this.route.queryParams.subscribe(params => {
        // If study is defined has query parameter then we reload the study
        if (this.studyCaseDataService.loadedStudy === null || this.studyCaseDataService.loadedStudy === undefined) {
          if ('studyId' in params) {
            if (params.studyId !== null && params.studyId !== undefined) {
                this.appDataService.loadCompleteStudy(params.studyId, '', isStudyLoaded => {
                  if (isStudyLoaded) {
                    this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
                  }
              }, 'readOnly' in params);
            }
          }
        }
      });
    }
    if (this.studyCaseDataService.loadedStudy) {
        this.hasAccessToStudy = false;
    } 
    this.selectedUserlevel = this.userLevelList[this.filterService.filters.userLevel - 1];

    this.onSearchChangeSubscription = this.studyCaseDataService.onSearchVariableChange.subscribe(() => {
      this.showSearch = true;
    });
    this.onParameterUpdateSubscription = this.socketService.onParameterUpdated.subscribe(LoadedStudy => {
      if (LoadedStudy.loadStatus == LoadStatus.READ_ONLY_MODE) {
        this.appDataService.loadStudyInEditionMode();
      }
    });
    this.onShowDataManagementSubscription = this.studyCaseDataService.onShowDataManagementContent.subscribe({
      next:()=>{
      //show the data management tab
      this.showSearch = false;
      this.selectedTabIndex = 0;
    }})
  }

  setDiplayableItems() {
    if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
      this.showView = true;
      this.showSearch = false;
      // Check  study status to display or not charts
      if (this.studyCaseDataService.loadedStudy.treeview.rootNode.status === DisciplineStatus.STATUS_DONE) {
        this.showPostProcessing = true;
        // this.showDashboard = true;
      } else {
        this.showPostProcessing = false;
        // this.showDashboard = false;
      }

      // Set process
      this.processIdentifier = this.studyCaseDataService.loadedStudy.studyCase.processDisplayName;

      // Check if study is loaded without data
      if (this.studyCaseDataService.loadedStudy.noData) {
        this.showDataManagement = false;
        this.showVisualisation = false;
        this.showDataValidation = false;
        // this.showDashboard = false;

        // Study is loaded without data management, triggering charts display
        this.showPostProcessingContent = true;
      } else {
        this.showDataManagement = true;
        this.showVisualisation = true;
        this.showDataValidation = true;
        // this.showDashboard = true;
      }

      // Activate show not editable variable if study is read only
      if (this.studyCaseDataService.loadedStudy.readOnly) {
        this.filterService.filters.showReadOnly = true;
      }

      
    } else {
      this.showView = false;
    }
    this.displayDocumentationTab();
    this.onTreeNodeChangeSubscription = this.treeNodeDataService.currentTreeNodeData.subscribe(treenode => {
      this.showVisualisation = false;
      this.showSearch = false;
      this.showDataValidation = false;
      this.showDocumentation = false;
      this.hasDocumentation = false;

      if (treenode !== null && treenode !== undefined) {
        if (this.studyCaseDataService.loadedStudy.noData) {
          this.showVisualisation = false;
          this.showDataValidation = false;
        } else {
          this.showVisualisation = treenode.isRoot;
          this.showDataValidation = treenode.isRoot;
        }

        this.showDocumentation = !(treenode.nodeType === 'data');
        // Remove duplicate modelsFullPath
        const modelsFullPathListWithoutDuplicate: string[] = [];
        treenode.modelsFullPathList.forEach((element, index) => {
          if (treenode.modelsFullPathList.indexOf(element) === index) {
            modelsFullPathListWithoutDuplicate.push(element);
          }
        });
        this.modelsFullPathList = modelsFullPathListWithoutDuplicate;

        // if node is root node, add process documentation
        if (treenode === this.studyCaseDataService.loadedStudy.treeview.rootNode){
          //build process path with repo.process
          const repo = this.studyCaseDataService.loadedStudy.studyCase.repository
          const process = this.studyCaseDataService.loadedStudy.studyCase.process
          this.modelsFullPathList.push(repo.concat('.',process ))
        }
        
      }
    });
  }

  displayDocumentationTab()
  {
    let selectedTabIndex = 1;
    if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
      if (this.showDataManagement && this.showPostProcessing && !this.studyCaseDataService.loadedStudy.noData){
        selectedTabIndex = 3;
      }
      else if ((!this.showDataManagement && this.showPostProcessing && !this.studyCaseDataService.loadedStudy.noData) ||
      (this.showDataManagement && !this.showPostProcessing && !this.studyCaseDataService.loadedStudy.noData) ||
      (this.showDataManagement && this.showPostProcessing && this.studyCaseDataService.loadedStudy.noData)){
        selectedTabIndex = 2;
      }
      this.selectedTabIndex = selectedTabIndex;
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
    if (this.routerSubscription !== null) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
    if (this.onParameterUpdateSubscription !== null) {
      this.onParameterUpdateSubscription.unsubscribe();
      this.onParameterUpdateSubscription = null;
    }
  }

  onSelectedTabChange(event: MatTabChangeEvent) {
    if (event.tab !== null && event.tab !== undefined) {
      this.tabNameSelected = event.tab.textLabel;

      this.showPostProcessingContent = false;
      this.showVisualisationContent = false;
      this.showDocumentationContent = false;


      if (event.tab.textLabel === 'Charts') {
        this.showPostProcessingContent = true;
      } else if (event.tab.textLabel === 'Visualisation') {
        this.showVisualisationContent = true;
      } else if (event.tab.textLabel === 'Documentation') {
        // this is needed so that when we are not on the tab, the request to get the documentation is not sent
        this.showDocumentationContent = true;
      }
      this.applyStyleToDocumentationTab();
    }
  }

  goToProcessDocumentation(processIdentifier: string) {
    /* Navigate on the documation of the process targeted */
    // Retrieve list of process to retrieve the ontology name if the study is open in read_only_mode because in read_onl_mode there are not ontology for processes.
    this.processService.getUserProcesses(false).subscribe(processes => {
      const process = processes.find(process => process.processId === processIdentifier);
      if (process !== null && process !== undefined ) {
        if (processIdentifier === process.processName) {
          this.snackbarService.showWarning(`The ontology informations for ${processIdentifier} are not available`)
        }
        else {
        processIdentifier = process.processName;
        this.router.navigate([Routing.ONTOLOGY, Routing.PROCESSES], {queryParams: {process: processIdentifier}});
        }
      } else {
        this.router.navigate([Routing.ONTOLOGY, Routing.PROCESSES], {queryParams: {process: processIdentifier}});
      }

    });
  }

  goFullScreen() {
    if (this.tabGroup.nativeElement.requestFullscreen) {
      this.tabGroup.nativeElement.requestFullscreen();
    } else if (this.tabGroup.nativeElement.mozRequestFullScreen) {
      /* Firefox */
      this.tabGroup.nativeElement.mozRequestFullScreen();
    } else if (this.tabGroup.nativeElement.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.tabGroup.nativeElement.webkitRequestFullscreen();
    } else if (this.tabGroup.nativeElement.msRequestFullscreen) {
      /* IE/Edge */
      this.tabGroup.nativeElement.msRequestFullscreen();
    }
  }

  private applyStyleToDocumentationTab() {
   /* In order to remove the double scrool bar in documentation tab without changes any other tabs*/
    const allTabGroups = document.querySelectorAll('mat-tab-body');
    if (allTabGroups.length > 0) {
      allTabGroups.forEach((tabBody: Element) => {
        const documentationTab = tabBody.querySelector('app-study-case-documentation');
        if (documentationTab) {
          const content = tabBody.querySelector('.mat-mdc-tab-body-content');
          if (content) {
            this.renderer.setStyle(content, 'height', 'auto');
          }
        }
      })
    }
  }


  changeUserLevel(event) {
    this.newUserLevelValue = event[0]._value;
    this.selectedUserlevel = this.userLevelList[this.newUserLevelValue];
    this.filterService.filters.userLevel = this.newUserLevelValue + 1; // Userlevel starting at 1
  }

  closeSearchPanel() {
    this.showSearch = false;
  }

  exitFullScreen() {
    document.exitFullscreen();
  }
}
