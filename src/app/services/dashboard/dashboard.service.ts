import {EventEmitter, Injectable} from '@angular/core';
import { DataHttpService } from "../http/data-http/data-http.service";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { Dashboard, DisplayableItem } from "../../models/dashboard.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends DataHttpService {
  public onDashboardItemsAdded: EventEmitter<DisplayableItem> = new EventEmitter();
  public onDashboardItemsRemoved: EventEmitter<DisplayableItem> = new EventEmitter();
  public onDashboardItemsUpdated: EventEmitter<DisplayableItem> = new EventEmitter();
  public onSectionExpansion: EventEmitter<void> = new EventEmitter();
  public dashboardItems: { [id: string]: DisplayableItem };
  public isDashboardUpdated: boolean
  public isDashboardInEdition: boolean;

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'dashboard');
    this.dashboardItems = {};
    this.isDashboardUpdated = false;
    this.isDashboardInEdition = false;
  }

  // Getter to check if the dashboard has changed
  get isDashboardChanged() {
    return this.isDashboardUpdated;
  }

  get isDashboardInEditionMode() {
    return this.isDashboardInEdition;
  }

  // adds an item to the dashboard and emits an event
  addItem(item: DisplayableItem) {
    this.dashboardItems[item.id] = item;
    this.onDashboardItemsAdded.emit(item);
    this.isDashboardUpdated = true;
  }

  // removes an item from the dashboard and emits an event
  removeItem(item: DisplayableItem): void | string {
    let text: string = null;
    if (item.id in this.dashboardItems) delete this.dashboardItems[item.id];
    else {
      for (const dashboardItem of Object.values(this.dashboardItems)) {
        if (dashboardItem.type === 'section') {
          const index = dashboardItem.data.items.findIndex((child: DisplayableItem) => child.id === item.id);
          if (index !== -1) {
            dashboardItem.data.items.splice(index, 1);
            text = 'Graph removed from section !';
          }
        }
      }
    }
    this.onDashboardItemsRemoved.emit(item);
    this.isDashboardUpdated = true;
    if (text) return text;
  }

  // updates an item in the dashboard and emits an event
  updateItem(item: DisplayableItem) {
    this.dashboardItems[item.id] = item;
    this.onDashboardItemsUpdated.emit(item);
    this.isDashboardUpdated = true;
  }

  onSectionExpansionEvent() {
    this.onSectionExpansion.emit();
  }

  // checks if an item is selected
  isSelected(itemId: string) {
    if (itemId in this.dashboardItems)
      return true;
    else {
      for (const item of Object.values(this.dashboardItems)) {
        if (item.type === 'section') {
          for (const child of item.data.items) {
            if (child.id === itemId) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // get the whole dashboard loaded in the service
  getItems(): DisplayableItem[] {
    return Object.values(this.dashboardItems);
  }

  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API DATA          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------

  // get the dashboard from the API
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

  // Save the dashboard to the API
  updateDashboard(dashboard: Dashboard): Observable<void> {
    const payload = {
      study_case_id: dashboard.studyCaseId,
      items: dashboard.items
    }
    this.isDashboardUpdated = false;
    return this.http.post<void>(`${this.apiRoute}/${dashboard.studyCaseId}`, payload);
  }
}
