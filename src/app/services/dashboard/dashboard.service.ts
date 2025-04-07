import {EventEmitter, Injectable} from '@angular/core';
import {PostProcessingPlotly} from "../../models/post-processing.model";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public onDashboardAdded: EventEmitter<PostProcessingPlotly> = new EventEmitter();
  public onDashboardRemoved: EventEmitter<PostProcessingPlotly> = new EventEmitter();
  public favoritePlots: { [id: string]: PostProcessingPlotly };

  constructor() {
    this.favoritePlots = {};
  }

  selectPlot(plot: PostProcessingPlotly) {
    this.onDashboardAdded.emit(plot);
    this.favoritePlots[plot.identifier] = plot;
  }

  removePlot(plot: PostProcessingPlotly) {
    this.onDashboardRemoved.emit(plot)
    delete this.favoritePlots[plot.identifier]
  }

  isSelected(plotId: string) {
    return Object.keys(this.favoritePlots).indexOf(plotId) > 0
  }
}
