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
  x: number;
  y: number;
  cols: number;
  rows: number;
  data: any;
}

export class DashboardText implements DisplayableItem {
  id: string;
  type: 'text' = 'text' as const;
  x: number;
  y: number;
  cols: number;
  rows: number;
  data: {
    content: string;
  }

  constructor(
    id: string,
    content: string,
  ) {
    this.id = id;
    this.data = { content };
    this.x = 0;
    this.y = 0;
    this.cols = 2;
    this.rows = 1;
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
  data: {
    title: string;
    children: DisplayableItem[];
  };

  constructor(
    id: string,
    title: string,
    position: {
      x: number,
      y: number,
      cols: number,
      rows: number,
    },
    children: DisplayableItem[]
  ) {
    this.id = id;
    this.x = position.x;
    this.y = position.y;
    this.cols = position.cols;
    this.rows = position.rows;
    this.data = { title, children };
  }
}
