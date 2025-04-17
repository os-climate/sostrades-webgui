import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadedStudy } from 'src/app/models/study.model';
import {DashboardService} from "../../services/dashboard/dashboard.service";
import { Dashboard, DashboardGraph, DisplayableItem } from "../../models/dashboard.model";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private treeNodeDataSubscription: Subscription;
  private dashboardAddItemSubscription: Subscription;
  private dashboardRemoveItemSubscription: Subscription;
  public hasDashboard: boolean;
  public loadedStudy: LoadedStudy;
  public dashboardFavorites: DisplayableItem[];
  public isDashboardUpdated: boolean;

  constructor(
    private dialog: MatDialog,
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService,
    private dashboardService: DashboardService) {
    this.loadedStudy = null;
    this.dashboardFavorites = [];
    this.isDashboardUpdated = this.dashboardService.isDashboardChanged;
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
    this.dashboardAddItemSubscription = this.dashboardService.onDashboardItemsAdded.subscribe((item: DisplayableItem) => {
      this.dashboardFavorites.push(item);
      this.isDashboardUpdated = true;
    });
    this.dashboardRemoveItemSubscription = this.dashboardService.onDashboardItemsRemoved.subscribe((item: DisplayableItem) => {
      this.dashboardFavorites = this.dashboardFavorites.filter(existing => existing.id !== item.id);
      this.isDashboardUpdated = true;
    });
    this.dashboardFavorites = this.dashboardService.getItems();
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
    if ((this.dashboardAddItemSubscription !== null) && (this.dashboardAddItemSubscription !== undefined)) {
      this.dashboardAddItemSubscription.unsubscribe();
    }
    if ((this.dashboardRemoveItemSubscription !== null) && (this.dashboardRemoveItemSubscription !== undefined)) {
      this.dashboardRemoveItemSubscription.unsubscribe();
    }
  }

  OnSaveDashboard() {
    const dashboard: Dashboard = {
      'studyCaseId': this.loadedStudy.studyCase.id,
      'items': this.dashboardFavorites,
    }
    this.dashboardService.updateDashboard(dashboard).subscribe({
      next: () => {
        console.log('Dashboard saved !');
        this.isDashboardUpdated = false;
      },
      error: (err) => {
        console.error('Error saving dashboard', err);
      }
    });
  }

  isGraph(item: DisplayableItem): item is DashboardGraph {
    return item.type === 'graph'
  }

  get graphItems(): DashboardGraph[] {
    return this.dashboardFavorites.filter(item => this.isGraph(item)) as DashboardGraph[];
  }
}
