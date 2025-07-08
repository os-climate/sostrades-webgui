import { GridsterItem } from "angular-gridster2";

export class Dashboard {

  constructor(
    public studyCaseId: number,
    public items: DisplayableItem[] = []) {
  }

  public static Create(jsonData: any): Dashboard {
    return new Dashboard(
      jsonData[DashboardAttributes.STUDY_CASE_ID],
      jsonData[DashboardAttributes.ITEMS]);
  }
}

export enum DashboardAttributes {
  STUDY_CASE_ID = 'study_case_id',
  ITEMS = 'items',
}

export type DisplayableItem = DashboardText | DashboardGraph | DashboardSection;

interface BaseItem extends GridsterItem {
  id: string;
  type: 'text' | 'graph' | 'section';
  // position on the grid
  x: number;
  y: number;
  // size of the grid item
  cols: number;
  rows: number;
  // min and max size of the grid item
  minCols: number;
  minRows: number;
  // data to be displayed
  data: any;
}

export class DashboardText implements BaseItem {
  id: string;
  type: 'text' = 'text' as const;
  x: number;
  y: number;
  cols: number;
  rows: number;
  minCols: number;
  minRows: number;
  data: {
    content: string;
  }

  constructor() {
    this.id = `text-${Date.now()}`;
    this.data = { content: '' };
    this.x = 0;
    this.y = 0;
    this.cols = 12;
    this.rows = 8;
    this.minCols = 1;
    this.minRows = 1;
  }
}

export class DashboardGraph implements BaseItem {
  disciplineName: string;
  name: string;
  plotIndex: number;
  id: string;
  type: 'graph' = 'graph' as const;
  x: number;
  y: number;
  cols: number;
  rows: number;
  minCols: number;
  minRows: number;
  data: {
    title?: string;
    graphData: any;
  }

  constructor(
    discipline: string,
    name: string,
    plotIndex: number,
    graphData: any
  ) {
    this.disciplineName = discipline;
    this.name = name;
    this.plotIndex = plotIndex;
    this.x = 0;
    this.y = 0;
    this.cols = 16;
    this.rows = 12;
    this.minCols = 12;
    this.minRows = 8;
    this.data = { graphData };
    this.id = this.identifier;
  }

  get identifier(): string {
    return `${this.disciplineName}-${this.name}-${this.plotIndex.toString()}`;
  }
  get getTitle(): string {
    return this.data.graphData.layout.title.text.replace(/<[^>]*>/g, '');
  }
}

export class DashboardSection implements BaseItem {
  id: string;
  type: 'section' = 'section' as const;
  x: number;
  y: number;
  cols: number;
  rows: number;
  minCols: number;
  minRows: number;
  data: {
    title: string;
    items: DisplayableItem[];
    shown: boolean;
    expandedSize?: number;
  };

  constructor() {
    this.id = `section-${Date.now()}`;
    this.x = 0;
    this.y = 0;
    this.cols = 40;
    this.rows = 20;
    this.minCols = 40;
    this.minRows = 16;
    this.data = { title: '', items: [], shown: true };
  }
}
