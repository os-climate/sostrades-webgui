export class PostProcessingFilter {

  constructor(public filterName: string,
              public filterValues: string[],
              public selectedValues: string[],
              public filterKey: string,
              public filteredValues: string [],
              public multipleSelection: boolean) {

  }

  public static Create(jsonData: any): PostProcessingFilter {
    const result: PostProcessingFilter = new PostProcessingFilter(
      jsonData[ChartFilterAttributes.FILTERNAME],
      jsonData[ChartFilterAttributes.FILTERVALUES],
      jsonData[ChartFilterAttributes.SELECTEDVALUES],
      jsonData[ChartFilterAttributes.FILTERKEY],
      jsonData[ChartFilterAttributes.FILTERVALUES],
      jsonData[ChartFilterAttributes.MULTIPLESELECTION]
    );

    return result;
  }

  public toServerDTO(): {} {
    const result = {};
    result[ChartFilterAttributes.FILTERNAME] = this.filterName;
    result[ChartFilterAttributes.FILTERVALUES] = this.filterValues;
    result[ChartFilterAttributes.SELECTEDVALUES] = this.selectedValues;
    result[ChartFilterAttributes.FILTERKEY] = this.filterKey;
    result[ChartFilterAttributes.MULTIPLESELECTION] = this.multipleSelection;
    return result;
  }
}

export enum ChartFilterAttributes {
  FILTERNAME = 'filter_name',
  FILTERVALUES = 'filter_values',
  SELECTEDVALUES = 'selected_values',
  FILTERKEY = 'filter_key',
  MULTIPLESELECTION = 'multiple_selection'
}

