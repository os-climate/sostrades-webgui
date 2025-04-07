import { Subject } from "rxjs";
import { PostProcessingBundle } from "./post-processing-bundle.model";
import { LoadedStudy } from "./study.model";

export class PostProcessing {

  constructor(
    public plotly: any[]) {
  }

  public static Create(jsonData: any): PostProcessing {

    const result = new PostProcessing([]);

    if (jsonData !== undefined && jsonData !== null) {
      if (PostProcessingAttributes.PLOTLY in jsonData &&
        jsonData[PostProcessingAttributes.PLOTLY] !== undefined &&
        jsonData[PostProcessingAttributes.PLOTLY] !== null) {
        result.plotly = jsonData[PostProcessingAttributes.PLOTLY];
      }
    }

    return result;
  }
}

export class PostProcessingPlotly {
  disciplineName: string;
  name: string;
  plotIndex: number;
  plotData: any;

  constructor(discipline: string, name: string, plotIndex: number, plotData: any) {
    this.disciplineName = discipline;
    this.name = name;
    this.plotIndex = plotIndex;
    this.plotData = plotData;
  }

  get identifier(): string {
    return `${this.disciplineName}-${this.name}-${this.plotIndex.toString()}`
  }
}

export class PendingPostProcessingRequest {
  loadedStudy: LoadedStudy;
  disciplineKey: string;
  postProcessingBundle: PostProcessingBundle;
  subscription: Subject<any>;


  constructor(loadedStudy: LoadedStudy, disciplineKey: string, postProcessingBundle: PostProcessingBundle, subscription: Subject<any>) {
    this.loadedStudy = loadedStudy;
    this.disciplineKey = disciplineKey;
    this.postProcessingBundle = postProcessingBundle;
    this.subscription = subscription;
  }
}


export enum PostProcessingAttributes {
  PLOTLY = 'plotly'
}
