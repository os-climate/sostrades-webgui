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

export class DisplayableItem {
  id: string;
  type: 'text' | 'graph' | 'section';
  position?: {
    x: number;
    y: number;
  };
  size?: {
    cols: number,
    rows: number
  };
  data: any;
}

export class DashboardText implements DisplayableItem {
  id: string;
  type: 'text' = 'text' as const;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    cols: number;
    rows: number;
  };
  data: {
    content: string;
  }

  constructor(
    id: string,
    content: string,
    position: {x: number, y: number},
    size: {cols: number, rows: number}
  ) {
    this.id = id;
    this.data = { content };
    this.position = position;
    this.size = size;
  }
}

export class DashboardGraph implements DisplayableItem {
  disciplineName: string;
  name: string;
  plotIndex: number;
  type: 'graph' = 'graph' as const;
  position?: {
    x: number;
    y: number;
  };
  size?: {
    cols: number;
    rows: number;
  };
  data: {
    graphData: any;
  }
  id: string;

  constructor(
    discipline: string,
    name: string,
    plotIndex: number,
    position: { x: number, y: number },
    size: { cols: number, rows: number },
    graphData: any
  ) {
    this.disciplineName = discipline;
    this.name = name;
    this.plotIndex = plotIndex;
    this.position = position;
    this.size = size;
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
  position?: {
    x: number,
    y: number
  };
  size?: {
    cols: number,
    rows: number
  };
  data: {
    title: string;
    children: DisplayableItem[];
  };

  constructor(
    id: string,
    title: string,
    position: { x: number, y: number },
    size: { cols: number, rows: number },
    children: DisplayableItem[]
  ) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.data = { title, children };
  }
}
