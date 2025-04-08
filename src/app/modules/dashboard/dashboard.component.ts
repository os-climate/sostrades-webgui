import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadedStudy } from 'src/app/models/study.model';
import {PostProcessingPlotly} from "../../models/post-processing.model";
import {DashboardService} from "../../services/dashboard/dashboard.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private treeNodeDataSubscription: Subscription;
  public hasDashboard: boolean;
  public loadedStudy: LoadedStudy;
  public favorites: PostProcessingPlotly[]

  constructor(
    private dialog: MatDialog,
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService,
    private dashboardService: DashboardService) {
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
    this.dashboardService.onDashboardAdded.subscribe((plot: PostProcessingPlotly) => {
      this.favorites.push(plot)
    })
    this.dashboardService.onDashboardRemoved.subscribe((plot: PostProcessingPlotly) => {
      this.favorites.splice(this.favorites.findIndex(plotly => plotly.identifier === plot.identifier), 1)
    })
    this.favorites = Object.values(this.dashboardService.favoritePlots)
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
  }

}
