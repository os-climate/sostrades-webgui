import { GridsterItem } from "angular-gridster2";

export class Dashboard {

  constructor(
    public studyCaseId: number,
    public items: DisplayableItem[]) {
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

export class DisplayableItem implements GridsterItem {
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

export class DashboardText implements DisplayableItem {
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

  constructor(content: string) {
    this.id = `text-${Date.now()}`;
    this.data = { content };
    this.x = 0;
    this.y = 0;
    this.cols = 3;
    this.rows = 2;
    this.minCols = 2;
    this.minRows = 2;
  }
}

export class DashboardGraph implements DisplayableItem {
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
    this.cols = 4;
    this.rows = 3;
    this.minCols = 3;
    this.minRows = 2;
    this.data = { graphData };
    this.id = this.identifier;
  }

  get identifier(): string {
    return `${this.disciplineName}-${this.name}-${this.plotIndex.toString()}`;
  }
}

export class DashboardSection implements DisplayableItem {
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
    children: DashboardGraph[];
  };

  constructor(title: string) {
    this.id = `section-${Date.now()}`;
    this.x = 0;
    this.y = 0;
    this.cols = 10;
    this.rows = 5;
    this.minCols = 10;
    this.minRows = 4;
    this.data = { title, children: [] };
  }
}
