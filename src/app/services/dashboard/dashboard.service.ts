import {EventEmitter, Injectable} from '@angular/core';
import { DataHttpService } from "../http/data-http/data-http.service";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { Dashboard, DashboardGraph, DashboardText, DisplayableItem } from "../../models/dashboard.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends DataHttpService {
  public onDashboardItemsAdded: EventEmitter<DisplayableItem> = new EventEmitter();
  public onDashboardItemsRemoved: EventEmitter<DisplayableItem> = new EventEmitter();
  public onDashboardItemsUpdated: EventEmitter<DisplayableItem> = new EventEmitter();
  public dashboardItems: { [id: string]: DisplayableItem };
  public isDashboardUpdated: boolean

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'dashboard');
    this.dashboardItems = {};
    this.isDashboardUpdated = false;
  }

  get isDashboardChanged() {
    return this.isDashboardUpdated;
  }

  addGraphItem(graph: DashboardGraph) {
    this.dashboardItems[graph.identifier] = graph;
    this.onDashboardItemsAdded.emit(graph);
    this.isDashboardUpdated = true;
  }

  removeGraphItem(graph: DashboardGraph) {
    delete this.dashboardItems[graph.identifier];
    this.onDashboardItemsRemoved.emit(graph);
      this.isDashboardUpdated = true;
  }

  addTextItem(text: DashboardText) {
    this.dashboardItems[text.id] = text;
    this.onDashboardItemsAdded.emit(text);
    this.isDashboardUpdated = true;
  }

  removeTextItem(text: DashboardText) {
    delete this.dashboardItems[text.id];
    this.onDashboardItemsRemoved.emit(text);
    this.isDashboardUpdated = true;
  }

  isSelected(itemId: string) {
    return itemId in this.dashboardItems;
  }

  getItems(): DisplayableItem[] {
    return Object.values(this.dashboardItems);
  }

  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API DATA          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------

  getDashboard(studyId: number): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiRoute}/${studyId}`).pipe(map(
      response => {
        const dashboard: Dashboard = Dashboard.Create(response);
        this.dashboardItems = {};
        for (const item of dashboard.items) {
          this.dashboardItems[item.id] = item
        }
        return dashboard;
      }
    ))
  }

  updateDashboard(dashboard: Dashboard): Observable<void> {
    const payload = {
      study_case_id: dashboard.studyCaseId,
      items: dashboard.items
    }
    this.isDashboardUpdated = false;
    return this.http.post<void>(`${this.apiRoute}/${dashboard.studyCaseId}`, payload);
  }
}
