import { EventEmitter, Injectable } from '@angular/core';
import { DataHttpService } from "../http/data-http/data-http.service";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import {
  Dashboard,
  DashboardItemFactory,
  DisplayableItem, GraphData,
  ItemData,
  ItemLayout,
  SectionData, TextData
} from "../../models/dashboard.model";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends DataHttpService {
  public onDashboardItemsAdded: EventEmitter<{ layout: ItemLayout, data: ItemData }> = new EventEmitter();
  public onDashboardItemsRemoved: EventEmitter<string> = new EventEmitter();
  public onDashboardItemsUpdated: EventEmitter<{ layout?: ItemLayout, data?: ItemData }> = new EventEmitter();
  public onSectionExpansion: EventEmitter<ItemLayout> = new EventEmitter();
  // public dashboardItems: { [id: string]: DisplayableItem };
  public currentDashboard: Dashboard;
  public isDashboardUpdated: boolean
  public isDashboardInEdition: boolean;

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'dashboard');
    // this.dashboardItems = {};
    this.isDashboardUpdated = false;
    this.isDashboardInEdition = false;
  }

  isText(data: ItemData): TextData | null {
    return ('content' in data) ? data as TextData : null;
  }

  isGraph(data: ItemData): GraphData | null {
    return ('disciplineName' in data && 'plotIndex' in data && 'postProcessingFilters' in data && 'graphData' in data && 'name' in data) ? data as GraphData : null;
  }

  // Getter to check if the dashboard has changed
  get isDashboardChanged() {
    return this.isDashboardUpdated;
  }

  // getter to check if the dashboard is in edition mode
  get isDashboardInEditionMode() {
    return this.isDashboardInEdition;
  }

  // adds an item to the dashboard and emits an event
  addItem(item: { layout: ItemLayout, data: ItemData }) {
    this.currentDashboard.layout[item.layout.item_id] = item.layout;
    this.currentDashboard.data[item.layout.item_id] = item.data;
    // this.dashboardItems[stringId] = item;
    this.onDashboardItemsAdded.emit(item);
    this.isDashboardUpdated = true;
  }

  // removes an item from the dashboard and emits an event
  removeItem(itemId: string): void | string {
    let text: string = null;
    if (itemId in this.currentDashboard.layout) {
      delete this.currentDashboard.layout[itemId];
      delete this.currentDashboard.data[itemId];
    } else {
      for (const dashboardItem of Object.values(this.currentDashboard.layout)) {
        if (dashboardItem.item_type === 'section') {
          const index = dashboardItem.children.findIndex((child: string) => child === itemId);
          if (index !== -1) {
            dashboardItem.children.splice(index, 1);
            delete this.currentDashboard.data[itemId];
            text = 'Graph removed from section !';
          }
        }
      }
    }
    this.onDashboardItemsRemoved.emit(itemId);
    this.isDashboardUpdated = true;
    if (text) return text;
  }

  // updates an item in the dashboard and emits an event
  updateItem(item: { layout?: ItemLayout, data?: ItemData }) {
    if (item.layout) this.currentDashboard.layout[item.layout.item_id] = item.layout;
    if (item.data) this.currentDashboard.data[item.layout.item_id] = item.data;
    this.onDashboardItemsUpdated.emit(item);
    this.isDashboardUpdated = true;
  }

  onSectionExpansionEvent(item: { layout: ItemLayout, data: SectionData }) {
    this.onSectionExpansion.emit(item.layout);
  }

  // checks if an item is selected
  isSelected(itemId: string) {
    if (Object.keys(this.currentDashboard.layout).includes(itemId))
      return true;
    else {
      for (const item of Object.values(this.currentDashboard.layout)) {
        if (item.item_type === 'section') {
          for (const childId of item.children) {
            if (childId === itemId) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // get the whole layout dashboard loaded in the service
  getItemsLayout(): ItemLayout[] {
    return Object.values(this.currentDashboard.layout)
  }

  getItemLayoutById(id: string): ItemLayout {
    return this.currentDashboard.layout[id];
  }

  // get the whole data dashboard loaded in the service
  getItemsData(): { [id: string]: ItemData } {
    return this.currentDashboard.data
  }

  getItemDataById(id: string): ItemData {
    return this.currentDashboard.data[id];
  }


  // Add an item to a section from the dashboard, removing it from the dashboard first
  addItemToSection(itemId: string, section: ItemLayout) {
    if (itemId in this.currentDashboard.layout) {
      delete this.currentDashboard.layout[itemId];
    }
    if (!section.children) {
      section.children = [];
    }
    if (!section.children.includes(itemId)) {
      section.children.push(itemId);
    }
    this.onDashboardItemsUpdated.emit({ layout: section, data: this.currentDashboard.data[section.item_id] })
    this.isDashboardUpdated = true;
  }

  // Remove an item from a section and add it back to the dashboard, recreating the layout in the meantime
  removeItemFromSection(itemId: string, itemType: 'text' | 'graph', section: ItemLayout): ItemLayout {
    if (section.children) {
      const index: number = section.children.indexOf(itemId);
      if (index !== -1) {
        section.children.splice(index, 1);
      }
    }
    this.currentDashboard.layout[itemId] = DashboardItemFactory.createItemLayout(itemId, itemType);
    this.isDashboardUpdated = true;
    return this.currentDashboard.layout[itemId]
  }

  // apply the new scaling factor to the old dashboard items
  // does not trigger an update so the save button is not activated
  handleOldDashboardItems(item: ItemLayout) {
    switch (item.item_type) {
      case 'section':
        // check if the items are old items
        if (item.minCols < 40 && item.minRows < 16) {
          item.minCols = 40;
          item.minRows = 16;
          item.cols *= 4;
          item.rows *= 4;
          if (item.data.expandedSize)
            item.data.expandedSize *= 4;
        }
        break;
      case 'graph':
        // check if the items are old items
        if (item.minCols < 12 && item.minRows < 8) {
          item.minCols = 12;
          item.minRows = 8;
          item.cols *= 4;
          item.rows *= 4;
        }
        break;
      case 'text':
        break;
    }
  }

  // transform new data structure into old one for embed component
  layoutDataToDisplayableItem(layout: { [id: string]: ItemLayout }, data: { [id: string]: ItemData }
  ): DisplayableItem[] {
    if (layout && data) {
      const items: DisplayableItem[] = [];
      for (const itemLayout of Object.values(layout)) {
        if (itemLayout.item_id in data) {
          const itemData: ItemData = data[itemLayout.item_id];
          if (itemLayout.item_type === 'section' && itemLayout.children) {
            const sectionItems: DisplayableItem[] = []
            for (const childId of itemLayout.children) {
              if (childId in data) {
                const childData: ItemData = data[childId];
                const childLayout: ItemLayout = DashboardItemFactory.createItemLayout(childId, this.isGraph(childData) ? 'graph' : 'text');
                sectionItems.push({ ...childLayout, data : childData } as DisplayableItem);
              }
            }
            // append the items list to the section's data
            const sectionData = {
              ...itemData,
              items: sectionItems
            }
            // clean section layout of any old children references
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { children, ...cleanedSectionLayout } = itemLayout;
            items.push({ ...cleanedSectionLayout , data : sectionData } as DisplayableItem);
          } else
            items.push({ ...itemLayout, data : itemData } as DisplayableItem);
        }
      }
      return items;
    }
  }

  /// -----------------------------------------------------------------------------------------------------------------------------
  /// --------------------------------------           API DATA          ----------------------------------------------------------
  /// -----------------------------------------------------------------------------------------------------------------------------

  // get the dashboard from the API
  getDashboard(studyId: number): Observable<DisplayableItem[]> {
    return this.http.get<Dashboard>(`${this.apiRoute}/${studyId}`).pipe(map(
      (response: Dashboard): DisplayableItem[] => {
        const dashboard: Dashboard = Dashboard.Create(response);
        // parse each layout in dashboard
        for (const item of Object.values(dashboard.layout)) {
          this.handleOldDashboardItems(item);
        }
        this.currentDashboard = dashboard;
        return this.layoutDataToDisplayableItem(dashboard.layout, dashboard.data);
      }
    ))
  }


  // Save the dashboard to the API
  updateDashboard(study_case_id: number): Observable<void> {
    const payload = {
      study_case_id: study_case_id,
      layout: this.currentDashboard.layout,
      data: this.currentDashboard.data
    }
    this.isDashboardUpdated = false;
    return this.http.post<void>(`${this.apiRoute}/${payload.study_case_id}`, payload);
  }
}
