import { PostProcessingFilter } from './post-processing-filter.model';


export class PostProcessingBundle {
  public displayFilter: boolean;

  //showDisciplineName parameter indicates if the discipline label must be shown in addition of the discipline model name
  public showDisciplineName: boolean;
  constructor(
    public name: string,
    public disciplineName: string,
    public filters: PostProcessingFilter[],
    public plotly: any[],
    public plotlyParetoFront: any[]) {
      this.displayFilter = false;
      this.showDisciplineName = false;
  }

  public static Create(jsonData: any): PostProcessingBundle {

    let name = '';
    let disciplineName = '';
    let filters = [];
    const plotly = [];
    const plotlyParetoFront = [];

    if (jsonData !== undefined && jsonData !== null) {

      if (PostProcessingBundleAttributes.NAME in jsonData &&
        jsonData[PostProcessingBundleAttributes.NAME] !== undefined &&
        jsonData[PostProcessingBundleAttributes.NAME] !== null) {
        name = jsonData[PostProcessingBundleAttributes.NAME];
      }

      if (PostProcessingBundleAttributes.DISCIPLINE_NAME in jsonData &&
        jsonData[PostProcessingBundleAttributes.DISCIPLINE_NAME] !== undefined &&
        jsonData[PostProcessingBundleAttributes.DISCIPLINE_NAME] !== null) {
          disciplineName = jsonData[PostProcessingBundleAttributes.DISCIPLINE_NAME];
      }

      if (PostProcessingBundleAttributes.FILTERS in jsonData &&
        jsonData[PostProcessingBundleAttributes.FILTERS] !== undefined &&
        jsonData[PostProcessingBundleAttributes.FILTERS] !== null) {
        filters = jsonData[PostProcessingBundleAttributes.FILTERS].map(f => PostProcessingFilter.Create(f));
      }

      if (PostProcessingBundleAttributes.POST_PROCESSINGS in jsonData &&
        jsonData[PostProcessingBundleAttributes.POST_PROCESSINGS] !== undefined &&
        jsonData[PostProcessingBundleAttributes.POST_PROCESSINGS] !== null) {
        const plots = jsonData[PostProcessingBundleAttributes.POST_PROCESSINGS];
        if (plots.length > 0) {
          plots.forEach(plt => {
            if (plt[PostProcessingBundleAttributes.PARETO_CHART] === true) {
              plotlyParetoFront.push(plt);
            } else {
              plotly.push(plt);
            }
          });
        }
      }
    }

    return new PostProcessingBundle(name, disciplineName, filters, plotly, plotlyParetoFront);
  }

  public UpdatePlots(jsonData: any): void {
    if (jsonData !== undefined && jsonData !== null && jsonData.length > 0) {
      const plots = jsonData;
      // Resetting plots
      this.plotly = [];
      this.plotlyParetoFront = [];

      if (plots.length > 0) {
        plots.forEach(plt => {
          if (PostProcessingBundleAttributes.PARETO_CHART in plt && plt[PostProcessingBundleAttributes.PARETO_CHART] === true) {
            this.plotlyParetoFront.push(plt);
          } else {
            this.plotly.push(plt);
          }
        });
      }
    }
  }
}


export enum PostProcessingBundleAttributes {
  NAME = 'name',
  DISCIPLINE_NAME = 'discipline_name',
  FILTERS = 'filters',
  POST_PROCESSINGS = 'post_processings',
  PARETO_CHART = 'is_pareto_trade_chart'
}
