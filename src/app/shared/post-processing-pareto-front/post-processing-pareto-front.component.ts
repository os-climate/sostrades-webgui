import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Scenario } from 'src/app/models/scenario.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

declare let Plotly: any;

@Component({
  selector: 'app-post-processing-pareto-front',
  templateUrl: './post-processing-pareto-front.component.html',
  styleUrls: ['./post-processing-pareto-front.component.scss']
})
export class PostProcessingParetoFrontComponent implements OnInit {

  @Input() plotData: any;

  @ViewChild('PlotlyPlaceHolder', { static: true }) private PlotlyPlaceHolder: ElementRef;

  colorUnselected = '#787878';
  colorSelected = '#CC0000';

  public scenarioList: Scenario[];
  public isPlotLoading: boolean;

  downloadIcon = {
    width: 24,
    height: 24,
    // tslint:disable-next-line: max-line-length
    path: 'M19,21.8H5c-1.5,0-2.8-1.2-2.8-2.8v-6c0-1,0.8-1.8,1.8-1.8S5.8,12,5.8,13v5c0,0.1,0.1,0.3,0.3,0.3h12c0.1,0,0.3-0.1,0.3-0.3v-5c0-1,0.8-1.8,1.8-1.8s1.8,0.8,1.8,1.8v6C21.8,20.5,20.5,21.8,19,21.8z M12,16.8c-0.4,0-0.9-0.2-1.2-0.5l-3.6-3.6c-0.7-0.7-0.7-1.8,0-2.5c0.7-0.7,1.8-0.7,2.5,0l0.6,0.6V4c0-1,0.8-1.8,1.8-1.8S13.8,3,13.8,4v6.9l0.6-0.6c0.7-0.7,1.8-0.7,2.5,0c0.7,0.7,0.7,1.8,0,2.5l-3.6,3.6C12.9,16.7,12.4,16.8,12,16.8z',
  };

  constructor(
    public studyCaseDataService: StudyCaseDataService,
    private snackbarService: SnackbarService) {
    this.scenarioList = [];
    this.isPlotLoading = true;
  }

  ngOnInit(): void {
    if (this.plotData !== null && this.plotData !== undefined) {

      const downloadIcon = {
        width: 24,
        height: 24,
        // tslint:disable-next-line: max-line-length
        path: 'M19,21.8H5c-1.5,0-2.8-1.2-2.8-2.8v-6c0-1,0.8-1.8,1.8-1.8S5.8,12,5.8,13v5c0,0.1,0.1,0.3,0.3,0.3h12c0.1,0,0.3-0.1,0.3-0.3v-5c0-1,0.8-1.8,1.8-1.8s1.8,0.8,1.8,1.8v6C21.8,20.5,20.5,21.8,19,21.8z M12,16.8c-0.4,0-0.9-0.2-1.2-0.5l-3.6-3.6c-0.7-0.7-0.7-1.8,0-2.5c0.7-0.7,1.8-0.7,2.5,0l0.6,0.6V4c0-1,0.8-1.8,1.8-1.8S13.8,3,13.8,4v6.9l0.6-0.6c0.7-0.7,1.8-0.7,2.5,0c0.7,0.7,0.7,1.8,0,2.5l-3.6,3.6C12.9,16.7,12.4,16.8,12,16.8z',
      };

      let modeBarButtons = [];

      if (this.plotData.csv_data === null || this.plotData.csv_data === undefined || this.plotData.csv_data.length === 0) {
        modeBarButtons = [[
          // Set standard plotly toolbar icons
          // tslint:disable-next-line: max-line-length
          'toImage', 'zoom2d', 'pan2d', 'select2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']];
      } else {
        modeBarButtons = [[
          {
            name: 'Download data as csv file',
            icon: downloadIcon,
            click: () => {
              this.Download(this.plotData.csv_data, this.plotData.layout.title.text);
            }
            // Restore standard plotly toolbar icons
            // tslint:disable-next-line: max-line-length
          }, 'toImage', 'zoom2d', 'pan2d', 'select2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']];
      }

      this.plotData.layout['autosize'] = true;
      delete this.plotData.layout['height']
      delete this.plotData.layout['width']

      if (this.studyCaseDataService.tradeScenarioList.length > 0) {
        this.reloadFromExistingTradeScenarioList(this.plotData.data);
      } else {
        this.initTradeScenarioList(this.plotData.data);
      }

      setTimeout(() => {
        Plotly.react(
          this.PlotlyPlaceHolder.nativeElement,
          this.plotData.data, this.plotData.layout, { modeBarButtons: modeBarButtons });

        this.PlotlyPlaceHolder.nativeElement.on('plotly_click', (data) => {
          this.onPlotlyClick(data);
        });
        this.PlotlyPlaceHolder.nativeElement.on('plotly_selected', (data) => {
          this.onPlotlySelection(data);
        });

        this.PlotlyPlaceHolder.nativeElement.on('plotly_afterplot', () => {
          this.isPlotLoading = false;
        });
      }, 0);
    }
  }

  refreshPlot() {
    Plotly.react(this.PlotlyPlaceHolder.nativeElement, this.plotData.data, this.plotData.layout);
  }

  initTradeScenarioList(data) {
    // Unselect all scenarios and reset plot (color unselected and size=6)
    data.forEach(el => {
      if (el.mode === 'markers') {
        let scenarioToAdd = null;
        let scenarioNamespace = '';

        if (el.customdata !== undefined && el.customdata !== null && el.customdata.length > 0) {
          scenarioNamespace = el.customdata[0];
        }

        scenarioToAdd = new Scenario(el.name, true, scenarioNamespace);
        el.marker = {};
        el.marker.color = this.colorSelected;
        el.marker.size = 12;

        this.scenarioList.push(scenarioToAdd);
      }
    });
  }

  reloadFromExistingTradeScenarioList(data) {
    // Check error in retrieving from store tradeScenarioList
    let error = false;

    data.forEach(el => {
      if (el.mode === 'markers') {
        const indexSc = this.studyCaseDataService.tradeScenarioList.findIndex(x => x.name === el.name);

        if (indexSc !== -1) {
          el.marker = {};

          if (this.studyCaseDataService.tradeScenarioList[indexSc].selected) {
            el.marker.color = this.colorSelected;
            el.marker.size = 12;
          } else {
            el.marker.color = this.colorUnselected;
            el.marker.size = 6;
          }
          // Deep copy of scenario in component scenario list
          this.scenarioList[indexSc] = JSON.parse(JSON.stringify(this.studyCaseDataService.tradeScenarioList[indexSc]));
        } else {
          error = true;
        }
      }
    });

    if (error) {
      this.snackbarService.showError('Error retrieving trade list, resetting trade list');
      // Resetting plot markers
      data.forEach(el => {
        if (el.mode === 'markers') {
          el.marker = {};
          el.marker.color = this.colorUnselected;
          el.marker.size = 6;
        }
      });
      // Rebuilding trade scenario list
      this.initTradeScenarioList(data);
    }
  }

  selectAll() {
    this.scenarioList.forEach(sce => {
      sce.selected = true;
    });
    this.plotData.data.forEach(dataElement => {
      if (dataElement.mode === 'markers') {
        this.updatePointStyle(dataElement.name, true);
      }
    });
    this.refreshPlot();
  }

  unSelectAll() {
    this.scenarioList.forEach(sce => {
      sce.selected = false;
    });
    this.plotData.data.forEach(dataElement => {
      if (dataElement.mode === 'markers') {
        this.updatePointStyle(dataElement.name, false);
      }
    });
    this.refreshPlot();
  }

  invertSelection() {
    this.scenarioList.forEach(sce => {
      sce.selected = !sce.selected;
    });
    this.plotData.data.forEach(dataElement => {
      if (dataElement.mode === 'markers') {
        const scenIndex = this.scenarioList.findIndex(x => x.name === dataElement.name);
        this.updatePointStyle(dataElement.name, this.scenarioList[scenIndex].selected);
      }
    });
    this.refreshPlot();
  }

  onCheckboxChange(event: MatCheckboxChange, scenarioUpdated: Scenario) {
    this.updatePointStyle(scenarioUpdated.name, event.checked);
    this.refreshPlot();
  }

  onPlotlyClick(data) {

    if (data !== undefined && data !== null && data.points !== undefined && data.points !== null && data.points.length > 0) {
      data.points.forEach((pt) => {
        if (pt.fullData.mode === 'markers') {
          if (pt.fullData.marker.size === 12) {
            this.updatePointStyle(pt.data.name, false);
          } else {
            this.updatePointStyle(pt.data.name, true);
          }
          this.updateScenarioList(pt.fullData.name, false);
        }
      });
    }
    this.refreshPlot();
  }

  onPlotlySelection(data) {

    if (data !== undefined && data !== null && data.points !== undefined && data.points !== null && data.points.length > 0) {
      data.points.forEach((pt) => {

        if (pt.fullData.mode === 'markers') {
          this.updatePointStyle(pt.data.name, true);
          this.updateScenarioList(pt.fullData.name, true);
        }
      });
    }
    this.refreshPlot();
  }

  updatePointStyle(scenarioName: string, isSelected: boolean) {
    const point = this.plotData.data.filter(x => x.name === scenarioName)[0];

    if (isSelected) {
      point.marker = {};
      point.marker.size = 12;
      point.marker.color = this.colorSelected;
    } else {
      point.marker = {};
      point.marker.size = 6;
      point.marker.color = this.colorUnselected;
    }
  }

  updateScenarioList(scenarioName: string, isBoxSelection: boolean) {
    const indexSc = this.scenarioList.findIndex(x => x.name === scenarioName);

    if (isBoxSelection) {
      this.scenarioList[indexSc].selected = true;
    } else {
      this.scenarioList[indexSc].selected = !this.scenarioList[indexSc].selected;
    }
  }

  applyTrade() {
    this.studyCaseDataService.tradeScenarioList = this.scenarioList;
    this.studyCaseDataService.onTradeSpaceSelectionChanged.emit(true);
    this.snackbarService.showInformation('Trade space selection successfully applied')
  }

  private Download(csvList, filename) {

    const downloadLink = document.createElement('a');
    const csvBlob = new Blob([csvList.join('\n')], { type: 'text/csv' });
    downloadLink.href = window.URL.createObjectURL(csvBlob);

    const cleanTitle = filename.replace('<b>', '').replace('</b>', '').split(' ').join('_');

    downloadLink.setAttribute('download', `${cleanTitle}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.parentNode.removeChild(downloadLink);

  }
}
