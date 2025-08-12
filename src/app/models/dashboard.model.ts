import { GridsterItem } from "angular-gridster2";
import { PostProcessingFilter } from "./post-processing-filter.model";

export class Dashboard {

  constructor(
    public studyCaseId: number,
    public layout: { [id: string]: ItemLayout } = {},
    public data: { [id: string]: ItemData } = {}) {
  }

  public static Create(jsonData: any): Dashboard {
    return new Dashboard(
      jsonData[DashboardAttributes.STUDY_CASE_ID],
      jsonData[DashboardAttributes.LAYOUT],
      jsonData[DashboardAttributes.DATA]);
  }
}

export enum DashboardAttributes {
  STUDY_CASE_ID = 'study_case_id',
  LAYOUT = 'layout',
  DATA = 'data'
}

export interface ItemLayout extends GridsterItem {
  item_id: string;
  item_type: 'text' | 'graph' | 'section';
  x: number;
  y: number;
  cols: number;
  rows: number;
  minCols: number;
  minRows: number;
  children?: string[]; // for sections, references to child items
}

export type ItemData = TextData | GraphData | SectionData;

export interface TextData {
  content: string;
}

export interface GraphData {
  disciplineName: string;
  name: string;
  plotIndex: number;
  postProcessingFilters: PostProcessingFilter[];
  graphData: any;
  title?: string;
}

export interface SectionData {
  title: string;
  shown: boolean;
  expandedSize?: number;
}

export class DashboardItemFactory {
  static createText(): { layout: ItemLayout, data: TextData } {
    const id = `text-${Date.now()}`;
    return {
      layout: this.createItemLayout(id, 'text'),
      data: {
        content: ''
      }
    };
  }

  static createGraph(
    disciplineName: string,
    name: string,
    plotIndex: number,
    filters: PostProcessingFilter[],
    graphData: any
  ): { layout: ItemLayout, data: ItemData } {
    const id = {
      disciplineName,
      name,
      plotIndex,
      postProcessingFilters: filters
    };
    return {
      layout: this.createItemLayout(JSON.stringify(id), 'graph'),
      data: {
        disciplineName,
        name,
        plotIndex,
        postProcessingFilters: filters,
        graphData,
        title: graphData?.layout?.title?.text.replace(/<[^>]*>/g, '') || ''
      }
    };
  }

  static createSection(): { layout: ItemLayout, data: ItemData } {
    const id = `section-${Date.now()}`;
    const layout: ItemLayout = this.createItemLayout(id, 'section');
    return {
      layout: {
        ...layout,
        children: []
      },
      data: {
        title: '',
        shown: true
      }
    }
  }

  static createItemLayout(item_id: string, item_type: 'text' | 'graph' | 'section') : ItemLayout {
    let cols: number;
    let rows: number;
    let minCols: number;
    let minRows: number;
    switch (item_type) {
      case 'text':
        cols = 12;
        rows = 8;
        minCols = 1;
        minRows = 1;
        break;
      case 'graph':
        cols = 16;
        rows = 12;
        minCols = 12;
        minRows = 8;
        break;
      case 'section':
        cols = 40;
        rows = 20;
        minCols = 40;
        minRows = 16;
        break;
    }
    return {
      item_id: item_id,
      item_type: item_type,
      x: 0,
      y: 0,
      cols: cols,
      rows: rows,
      minCols: minCols,
      minRows: minRows
    }
  }
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
  id: string;
  type: 'graph' = 'graph' as const;
  x: number;
  y: number;
  cols: number;
  rows: number;
  minCols: number;
  minRows: number;
  data: {
    disciplineName: string;
    name: string;
    plotIndex: number;
    postProcessingFilters: PostProcessingFilter[];
    title?: string;
    graphData: any;
  }

  constructor(
    discipline: string,
    name: string,
    plotIndex: number,
    filters: PostProcessingFilter[],
    graphData: any
  ) {
    this.x = 0;
    this.y = 0;
    this.cols = 16;
    this.rows = 12;
    this.minCols = 12;
    this.minRows = 8;
    this.data = {
      disciplineName: discipline,
      name: name,
      plotIndex: plotIndex,
      postProcessingFilters: filters,
      title: graphData?.layout?.title?.text.replace(/<[^>]*>/g, '') || '',
      graphData: graphData
    };
    this.id = JSON.stringify(this.identifier);
  }

  get identifier(): {
    disciplineName: string;
    name: string;
    plotIndex: number;
    postProcessingFilters: PostProcessingFilter[];
  } {
    return {
      disciplineName: this.data.disciplineName,
      name: this.data.name,
      plotIndex: this.data.plotIndex,
      postProcessingFilters: this.data.postProcessingFilters
    };
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
