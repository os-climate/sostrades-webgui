import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { TreeNode } from 'src/app/models/tree-node.model';
import { Subscription } from 'rxjs';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { ResizedEvent } from 'angular-resize-event';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { TreeNodeDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseValidationDialogComponent } from '../../study-case/study-case-validation-dialog/study-case-validation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadedStudy } from 'src/app/models/study.model';

@Component({
  selector: 'app-post-processing',
  templateUrl: './post-processing.component.html',
  styleUrls: ['./post-processing.component.scss']
})
export class PostProcessingComponent implements OnInit, OnDestroy {

  @ViewChild('Plots', { static: true }) Plots: ElementRef;
  @ViewChild('PlotsContainer', { static: true }) PlotContainer: ElementRef;

  public dataConfigure: TreeNode;

  public treeNode: TreeNode;
  private treeNodeDataSubscription: Subscription;
  public loadingMessage: string;
  public displayHeader: boolean;
  public isMoreContentAvailable: boolean;
  public loadedStudy: LoadedStudy;
  private dialogRefValidate: MatDialogRef<StudyCaseValidationDialogComponent>;


  constructor(
    private dialog: MatDialog,
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService) {


    this.treeNode = null;
    this.displayHeader = false;
    this.isMoreContentAvailable = false;
    this.loadedStudy = null;
  }

  ngOnInit() {
    this.treeNodeDataSubscription = this.treeNodeDataService.currentTreeNodeData.subscribe(data => {
      // Update data using the current treenode
      this.treeNode = data;
      if (this.treeNode !== null && this.treeNode !== undefined) {
        this.displayHeader = true;
      } else {
        this.displayHeader = false;
      }
      this.loadedStudy = this.studyCaseDataService.loadedStudy;
    });
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
    if (this.dialogRefValidate !== null && this.dialogRefValidate !== undefined) {
      this.dialogRefValidate.close();
      this.dialogRefValidate = null;
    }
  }

  onResizePlotZone(event: ResizedEvent) {

    if (this.Plots.nativeElement.scrollHeight > this.PlotContainer.nativeElement.clientHeight) {
      this.isMoreContentAvailable = true;
    } else {
      this.isMoreContentAvailable = false;
    }
  }

  onClickDataValidation(event) {
    event.stopPropagation();
    event.preventDefault();


    const treeNodedialogData = new TreeNodeDialogData();
    treeNodedialogData.node = this.treeNode;


    this.dialogRefValidate = this.dialog.open(StudyCaseValidationDialogComponent, {
      disableClose: true,
      width: '1100px',
      height: '600px',
      panelClass: 'csvDialog',
      data: treeNodedialogData
    });

    this.dialogRefValidate.afterClosed().subscribe((result) => {
       const validation: TreeNodeDialogData = result as  TreeNodeDialogData;
       if (validation.cancel !== true) {
        this.treeNode.isValidated = !validation.node.isValidated
       }
    });
  }

  scrollPlots() {
    if (this.Plots.nativeElement.scrollHeight > this.PlotContainer.nativeElement.clientHeight) { // Scrollbar exist
      if (this.Plots.nativeElement.scrollHeight < 2 * this.PlotContainer.nativeElement.clientHeight) { // Only 2 charts lines
        if (this.PlotContainer.nativeElement.scrollTop > this.PlotContainer.nativeElement.clientHeight / 3) {
          this.isMoreContentAvailable = false;
        } else {
          this.isMoreContentAvailable = true;
        }
      } else { // More than 2 charts line
        if (this.Plots.nativeElement.scrollHeight - this.PlotContainer.nativeElement.scrollTop
          < 0.8 * 2 * this.PlotContainer.nativeElement.clientHeight) {
          this.isMoreContentAvailable = false;
        } else {
          this.isMoreContentAvailable = true;
        }
      }
    }
  }
}
