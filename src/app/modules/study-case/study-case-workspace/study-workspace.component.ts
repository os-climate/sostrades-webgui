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
  public showDataManagement: boolean;
  public showDocumentation: boolean;
  public showDataValidation: boolean;
  public hasDocumentation: boolean;
  private onStudyCaseChangeSubscription: Subscription;
  private onSearchChangeSubscription: Subscription;
  private onTreeNodeChangeSubscription: Subscription;
  public markdownDocumentation: MardownDocumentation[];


  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  fullscreenmode() {
    this.isFullScreenOn = !this.isFullScreenOn;
  }

  constructor(
    public studyCaseDataService: StudyCaseDataService,
    public calculationService: CalculationService,
    private filterService: FilterService,
    public studyCaseLocalStorageService: StudyCaseLocalStorageService,
    private treeNodeDataService: TreeNodeDataService) {
    this.showView = false;
    this.showSearch = false;
    this.showPostProcessing = false;
    this.showVisualisation = false;
    this.showPostProcessingContent = false;
    this.onStudyCaseChangeSubscription = null;
    this.studyIsLoaded = false;
    this.onTreeNodeChangeSubscription = null;
    this.tabNameSelected = '';
    this.isFullScreenOn = false;
    this.showDocumentation = false;
    this.hasDocumentation = false;
    this.markdownDocumentation = [];
    this.showDataManagement = true;
    this.showDataValidation = false;
  }

  ngOnInit() {
    this.tabNameSelected = 'Data management';
    this.showSearch = false;
    this.setDiplayableItems();

    this.onStudyCaseChangeSubscription = this.studyCaseDataService.onStudyCaseChange.subscribe(studyLoaded => {
      this.setDiplayableItems();
    });

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
      } else {
        this.showPostProcessing = false;
      }

      // Check if study is loaded without data
      if (this.studyCaseDataService.loadedStudy.noData) {
        this.showDataManagement = false;
        this.showVisualisation = false;
        this.showDataValidation = false;

        // Study is loaded without data management, triggering post processing display
        this.showPostProcessingContent = true;
      } else {
        this.showDataManagement = true;
        this.showVisualisation = true;
        this.showDataValidation = true;
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
        this.markdownDocumentation = treenode.markdownDocumentation;
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
  }

  onSelectedTabChange(event: MatTabChangeEvent) {
    if (event.tab !== null && event.tab !== undefined) {
      this.tabNameSelected = event.tab.textLabel;

      this.showPostProcessingContent = false;

      if (event.tab.textLabel === 'Post processing') {
        this.showPostProcessingContent = true;
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

  closeSearchPanel(){
    this.showSearch = false;
  }

  exitFullScreen() {
    document.exitFullscreen();
  }
}
