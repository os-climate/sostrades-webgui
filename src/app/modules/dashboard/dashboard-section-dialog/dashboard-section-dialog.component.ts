import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { GraphData, ItemData, ItemLayout, SectionData, TextData } from "../../../models/dashboard.model";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { DashboardService } from "../../../services/dashboard/dashboard.service";

@Component({
  selector: 'app-dashboard-section-dialog',
  templateUrl: './dashboard-section-dialog.component.html',
  styleUrls: ['./dashboard-section-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardSectionDialogComponent {
  private DASHBOARD_LIST_ID: string = 'dashboard-list' as const;
  private SECTION_LIST_ID: string = 'section-list' as const;
  private DASHBOARD_EMPTY_LIST_ID: string = 'empty-dashboard-list' as const;
  private SECTION_EMPTY_LIST_ID: string = 'empty-section-list' as const;


  constructor(
    private dashboardService: DashboardService,
    public dialogRef: MatDialogRef<DashboardSectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      section: { layout: ItemLayout, data: SectionData },
      dashboard: { layout: ItemLayout[], data: ItemData[] }
    }
  ) {
  }

  drop(event: CdkDragDrop<(ItemLayout | string)[]>) {
    if (event.previousContainer === event.container) {
      if (event.container.id === this.DASHBOARD_LIST_ID || event.container.id === this.DASHBOARD_EMPTY_LIST_ID)
        this.swapItemPositions(event.container.data as ItemLayout[], event.previousIndex, event.currentIndex)
      else {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        this.dashboardService.updateItem({ layout: this.data.section.layout });
      }
    } else {
      this.myCustomTransferArrayItem(event);
    }
  }

  // rework this part to handle sections (find a way to transfer DisplayableItem to layout and data structure same process when saving the dashboard)
  // idea: dont move the item's data just the layout
  // for example if the graph is moved from the dashboard to a section, we remove the graph layout from the dashboard layout and add it to the section list like so:
  // first state
  // layout { graph1: {}, graph2: {}, section1: { items: [graph3, graph4] } }
  // data { graph1: { data: {} }, graph2: { data: {} }, graph3: { data: {} }, graph4: { data: {} },  section1: { data: {} } }
  // state after moving graph2 to section1
  // layout { graph1: {}, section1: { items: [graph3, graph4,graph2] } }
  // data { graph1: { data: {} }, graph2: { data: {} }, graph3: { data: {} }, graph4: { data: {} },  section1: { data: {} } }


  myCustomTransferArrayItem(event: CdkDragDrop<(ItemLayout | string)[]>) {
    const itemId: string = typeof event.previousContainer.data[event.previousIndex] === "string"
      ? (event.previousContainer.data[event.previousIndex] as string)
      : (event.previousContainer.data[event.previousIndex] as ItemLayout).item_id

    const itemType: 'text' | 'graph' = typeof event.previousContainer.data[event.previousIndex] === "string"
      ? this.dashboardService.isGraph(this.data.dashboard.data[itemId]) ? 'graph' : 'text'
      : ((event.previousContainer.data[event.previousIndex] as ItemLayout).item_type as 'text' | 'graph');

    if ((event.previousContainer.id === this.DASHBOARD_LIST_ID || event.previousContainer.id === this.DASHBOARD_EMPTY_LIST_ID)
      && (event.container.id === this.SECTION_LIST_ID || event.container.id === this.SECTION_EMPTY_LIST_ID)) {
      // if dashboard_list -> section_list
      //   move just the item_id inside the section.children
      //   => delete data.dashboard.layout[item_id]
      //   => section.children.push(item_id)
      this.dashboardService.addItemToSection(itemId, this.data.section.layout)
      event.previousContainer.data.splice(event.previousIndex, 1)
    } else if ((event.previousContainer.id === this.SECTION_LIST_ID || event.previousContainer.id === this.SECTION_EMPTY_LIST_ID)
      && (event.container.id === this.DASHBOARD_LIST_ID || event.container.id === this.DASHBOARD_EMPTY_LIST_ID)) {
      // else if section_list -> dashboard_list
      //   recreate a layout based on the item type
      //   => dashboard.layout[item_id] = new_layout
      //   => section.children.splice(index of item_id, 1)
      const newItem: ItemLayout = this.dashboardService.removeItemFromSection(itemId, itemType, this.data.section.layout);
      event.container.data.splice(event.currentIndex, 0, newItem);
    }
  }

  swapItemPositions(layouts: ItemLayout[], fromIndex: number, toIndex: number) {
    const fromItem: ItemLayout = layouts[fromIndex];
    const toItem: ItemLayout = layouts[toIndex];
    const tempY: number = fromItem.y;
    const tempX: number = fromItem.x;

    fromItem.y = toItem.y;
    fromItem.x = toItem.x;
    toItem.y = tempY;
    toItem.x = tempX;

    moveItemInArray(layouts, fromIndex, toIndex);
    this.dashboardService.updateItem({layout: fromItem})
    this.dashboardService.updateItem({layout: toItem})
  }

  cleanText(text: string | null): string {
    // Remove HTML tags and replace multiple spaces with a single space
    if (!text) return 'Empty TextBox';
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  cancelEditing() {
    this.dialogRef.close(undefined)
  }

  getItemData(id: string): ItemData {
    return this.data.dashboard.data[id];
  }

  isGraph(data: ItemData): boolean {
    return ('disciplineName' in data && 'plotIndex' in data && 'postProcessingFilters' in data && 'graphData' in data && 'name' in data) ? true : null;
  }

  getGraphData(data: ItemData): GraphData | null {
    return this.dashboardService.isGraph(data);
  }

  getTextData(data: ItemData): TextData | null {
    return this.dashboardService.isText(data);
  }
}
