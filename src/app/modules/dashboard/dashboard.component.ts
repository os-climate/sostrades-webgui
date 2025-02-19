import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadedStudy } from 'src/app/models/study.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private treeNodeDataSubscription: Subscription;
  public hasDashboard: boolean;
  public loadedStudy: LoadedStudy;

  constructor(
    private dialog: MatDialog,
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService) {
    this.loadedStudy = null;
  }

  ngOnInit() {
    this.treeNodeDataSubscription = this.treeNodeDataService.currentTreeNodeData.subscribe(() => {
      this.loadedStudy = this.studyCaseDataService.loadedStudy;
      if (this.loadedStudy.dashboard !== null &&
          this.loadedStudy.dashboard !== undefined &&
          ('rows' in this.loadedStudy.dashboard || 'title' in this.loadedStudy.dashboard)
      ) {
        this.hasDashboard = true;
      } else {
        this.hasDashboard = false;
      }

    });
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
  }

}
