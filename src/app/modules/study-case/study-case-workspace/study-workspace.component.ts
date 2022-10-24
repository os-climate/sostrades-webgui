import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DisciplineStatus } from 'src/app/models/study-case-execution-observer.model';
import { FilterService } from 'src/app/services/filter/filter.service';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { UserService } from 'src/app/services/user/user.service';
import { UserLevel } from 'src/app/models/user-level.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from 'src/app/services/socket/socket.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';



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
  public showDataManagement: boolean;
  public showDocumentation: boolean;
  public showDataValidation: boolean;
  public showDashboard: boolean;
  public hasDocumentation: boolean;
  public hasDashboard: boolean;
  private onStudyCaseChangeSubscription: Subscription;
  private onSearchChangeSubscription: Subscription;
  private onTreeNodeChangeSubscription: Subscription;
  public modelsFullPathList: string[];
  public hasAccessToStudy: boolean;
  private userLevel: UserLevel;
  public userLevelList: string[];
  public selectedUserlevel: string;
  private routerSubscription: Subscription;




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
    public filterService: FilterService,
    public studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private appDataService: AppDataService,
    private socketService: SocketService,

    private treeNodeDataService: TreeNodeDataService) {
    this.showView = false;
    this.showSearch = false;
    this.showPostProcessing = false;
    this.showVisualisation = false;
    this.showPostProcessingContent = false;
    this.showVisualisationContent = false;
    this.onStudyCaseChangeSubscription = null;
    this.studyIsLoaded = false;
    this.onTreeNodeChangeSubscription = null;
    this.tabNameSelected = '';
    this.isFullScreenOn = false;
    this.showDocumentation = false;
    this.hasDocumentation = false;
    this.modelsFullPathList = [];
    this.showDashboard = false;
    this.hasDashboard = false;
    this.showDataManagement = true;
    this.showDataValidation = false;
    this.hasAccessToStudy = false;
    this.userLevel = new UserLevel();
    this.userLevelList = this.userLevel.userLevelList;
    this.routerSubscription = null;
  }

  ngOnInit() {
    this.tabNameSelected = 'Data management';
    this.showSearch = false;
    this.setDiplayableItems();

    this.onStudyCaseChangeSubscription = this.studyCaseDataService.onStudyCaseChange.subscribe(studyLoaded => {
      this.setDiplayableItems();
    });

    if (this.userService.hasAccessToStudy()) {
      this.hasAccessToStudy = true;
      if (this.studyCaseDataService.loadedStudy === null) {
        this.routerSubscription = this.route.queryParams.subscribe(params => {
          // If study is defined has query parameter then we reload the study
          if (params.hasOwnProperty('studyId')) {
            if (params.studyId !== null && params.studyId !== undefined) {
                this.appDataService.loadCompleteStudy(params.studyId, '', isStudyLoaded => {
                  if (isStudyLoaded) {
                    this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
                  }
                });
            }
          }
        });
      }
    } else {
      this.hasAccessToStudy = false;
    }
    this.selectedUserlevel = this.userLevelList[this.filterService.filters.userLevel - 1];

    this.onSearchChangeSubscription = this.studyCaseDataService.onSearchVariableChange.subscribe(searchVariable => {
      this.showSearch = true;
    });
  }

  setDiplayableItems() {
    if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
      this.showView = true;
      this.showSearch = false;
      // Check  study status to display or not post processing
      if (this.studyCaseDataService.loadedStudy.treeview.rootNode.status === DisciplineStatus.STATUS_DONE) {
        this.showPostProcessing = true;
        this.showDashboard = true;
      } else {
        this.showPostProcessing = false;
        this.showDashboard = false;
      }

      // Check if study is loaded without data
      if (this.studyCaseDataService.loadedStudy.noData) {
        this.showDataManagement = false;
        this.showVisualisation = false;
        this.showDataValidation = false;
        this.showDashboard = false;

        // Study is loaded without data management, triggering post processing display
        this.showPostProcessingContent = true;
      } else {
        this.showDataManagement = true;
        this.showVisualisation = true;
        this.showDataValidation = true;
        this.showDashboard = true;
      }

      // Activate show not editable variable if study is read only
      if (this.studyCaseDataService.loadedStudy.readOnly) {
        this.filterService.filters.showReadOnly = true;
      }
    } else {
      this.showView = false;
    }

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
        this.modelsFullPathList = treenode.modelsFullPathList;
      }
    });
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
  }

  onSelectedTabChange(event: MatTabChangeEvent) {
    if (event.tab !== null && event.tab !== undefined) {
      this.tabNameSelected = event.tab.textLabel;

      this.showPostProcessingContent = false;
      this.showVisualisationContent = false;

      if (event.tab.textLabel === 'Post processing') {
        this.showPostProcessingContent = true;
      } else if (event.tab.textLabel === 'Visualisation') {
        this.showVisualisationContent = true;
      }
    }
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


  changeUserLevel(newUserLevelValue: number) {
    this.selectedUserlevel = this.userLevelList[newUserLevelValue];
    this.filterService.filters.userLevel = newUserLevelValue + 1; // Userlevel starting at 1
  }

  closeSearchPanel() {
    this.showSearch = false;
  }

  exitFullScreen() {
    document.exitFullscreen();
  }
}
