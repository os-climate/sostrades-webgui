import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { StudyCaseValidation } from 'src/app/models/study-case-validation.model';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import * as Plotly from 'plotly.js-dist-min';
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { PostProcessingPlotly } from "../../../models/post-processing.model";

@Component({
  selector: 'app-post-processing-plotly',
  templateUrl: './post-processing-plotly.component.html',
  styleUrls: ['./post-processing-plotly.component.scss']
})
export class PostProcessingPlotlyComponent implements OnInit {
  @Input() plotData: any;
  @Input() fullNamespace: string;
  @Input() disciplineName: string;
  @Input() name: string;
  @Input() plotIndex: number;

  @ViewChild('PlotlyPlaceHolder', { static: true }) private PlotlyPlaceHolder: ElementRef;
  public isPlotLoading: boolean;
  public studyCaseValidation: StudyCaseValidation;
  public isFavorite: boolean;

  private readonly downloadIcon = {
    width: 24,
    height: 24,
    path: 'M19,21.8H5c-1.5,0-2.8-1.2-2.8-2.8v-6c0-1,0.8-1.8,1.8-1.8S5.8,12,5.8,13v5c0,0.1,0.1,0.3,0.3,0.3h12c0.1,0,0.3-0.1,0.3-0.3v-5c0-1,0.8-1.8,1.8-1.8s1.8,0.8,1.8,1.8v6C21.8,20.5,20.5,21.8,19,21.8z M12,16.8c-0.4,0-0.9-0.2-1.2-0.5l-3.6-3.6c-0.7-0.7-0.7-1.8,0-2.5c0.7-0.7,1.8-0.7,2.5,0l0.6,0.6V4c0-1,0.8-1.8,1.8-1.8S13.8,3,13.8,4v6.9l0.6-0.6c0.7-0.7,1.8-0.7,2.5,0c0.7,0.7,0.7,1.8,0,2.5l-3.6,3.6C12.9,16.7,12.4,16.8,12,16.8z'
  };

  private readonly legendIcon = {
    width: 24,
    height: 24,
    path: 'M 3 2 A 2 2 0 0 0 1 4 A 2 2 0 0 0 3 6 A 2 2 0 0 0 5 4 A 2 2 0 0 0 3 2 z M 7 3 L 7 5 L 19 5 L 19 3 L 7 3 z M 3 8 A 2 2 0 0 0 1 10 A 2 2 0 0 0 3 12 A 2 2 0 0 0 5 10 A 2 2 0 0 0 3 8 z M 7 9 L 7 11 L 19 11 L 19 9 L 7 9 z M 3 14 A 2 2 0 0 0 1 16 A 2 2 0 0 0 3 18 A 2 2 0 0 0 5 16 A 2 2 0 0 0 3 14 z M 7 15 L 7 17 L 19 17 L 19 15 L 7 15 z'
  };

  private readonly expandIcon = {
    width: 24,
    height: 24,
    path: 'M 21 3 L 14 3 L 14 5 L 19 5 L 13 11 L 14.5 12.5 L 20 7 L 20 12 L 22 12 L 22 4 C 22 3.4 21.6 3 21 3 z M 3 21 L 10 21 L 10 19 L 5 19 L 11 13 L 9.5 11.5 L 4 17 L 4 12 L 2 12 L 2 20 C 2 20.6 2.4 21 3 21 z'
  };

  private readonly downloadConfig = {
    format: 'png',
    filename: 'sos_trades_graph',
    height: 850,
    width: 1200,
    scale: 8
  };

  constructor(
    private studyCaseValidationService: StudyCaseValidationService,
    public dashboardService: DashboardService) {
    this.isPlotLoading = true;
    this.studyCaseValidation = null;
  }

  ngOnInit() {
    if (this.plotData !== null && this.plotData !== undefined) {
      this.setupValidation();
      this.setupLayout();
      this.initializePlot();
      this.loadFavorites();
    }
  }

  OnFavoriteClick() {
    const plotId =  {
      disciplineName: this.disciplineName,
      name: this.name,
      id: this.plotIndex,
    }
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite)
      this.saveFavorites(plotId, this.plotData, true)
    else
      this.saveFavorites(plotId, null, false)
  }

  /**
   * @param plotId object containing information to create the identifier
   * @param plotData content of the plot
   * @param isFavorite add if true and remove if false
   * @description Add or remove the plot in the dashboard
   * */
  saveFavorites(plotId: { disciplineName: string, name: string, id: number }, plotData: any, isFavorite: boolean) {
    const plot = new PostProcessingPlotly(plotId.disciplineName, plotId.name, plotId.id, plotData);
    isFavorite ? this.dashboardService.selectPlot(plot) : this.dashboardService.removePlot(plot);
    console.log(`plot ${isFavorite ? 'saved': 'removed'}: ` + plot.identifier + '\n' + JSON.stringify(plotData));
  }

  loadFavorites() {
    const plot = new PostProcessingPlotly(this.disciplineName, this.name, this.plotIndex, this.plotData);
    this.isFavorite = this.dashboardService.isSelected(plot.identifier)
  }

  private setupValidation() {
    if ('${this.fullNamespace}' in this.studyCaseValidationService.studyValidationDict) {
      this.studyCaseValidation = this.studyCaseValidationService.studyValidationDict[this.fullNamespace][0];
    }
  }

  private setupLayout() {
    // Add logo
    const logo = {
      source: "assets/logo_black_graph.png",
      xref: "paper", yref: "paper",
      x: 0.995, y: -0.005,
      sizex: 0.1, sizey: 0.1,
      xanchor: "right", yanchor: "bottom",
      name: "logo_SOS_trades",
      opacity: 0.5
    };
    this.plotData.layout.images = [logo];

    // Handle official validation
    let forceNotOfficialWatermark = false;
    if (this.plotData.logo_official) {
      if (this.studyCaseValidation?.validationState === 'Validated') {
        const validation_annotation = {
          align: "left",
          bordercolor: "black",
          borderwidth: 1,
          showarrow: false,
          text: "OFFICIAL <br>validated by " + this.studyCaseValidation.userDepartment,
          x: 0,
          xref: "paper",
          y: 1.15,
          yref: "paper"
        };
        if (!this.plotData.layout.annotations) {
          this.plotData.layout.annotations = [validation_annotation];
        } else {
          this.plotData.layout.annotations.push(validation_annotation);
        }
      } else {
        forceNotOfficialWatermark = true;
      }
    }

    // Add watermarks if needed
    if (this.plotData.logo_notvalidated || forceNotOfficialWatermark) {
      this.plotData.layout.images.push({
        source: "assets/NOTVALIDATED.PNG",
        xref: "paper", yref: "paper",
        x: 0, y: 1,
        sizex: 1, sizey: 1,
        name: "logo_SOS_trades",
        opacity: 0.2
      });
    }
    if (this.plotData.logo_work_in_progress) {
      this.plotData.layout.images.push({
        source: "assets/WORKINPROGRESS.PNG",
        xref: "paper", yref: "paper",
        x: 0, y: 1,
        sizex: 1, sizey: 1,
        name: "logo_SOS_trades",
        opacity: 0.2
      });
    }
  }

  private createCommonModeBarButtons(showLegend: boolean) {
    return [
      {
        name: 'Show/hide legend',
        icon: this.legendIcon,
        click: (gd) => {
          showLegend = !showLegend;
          Plotly.relayout(gd, { showlegend: showLegend });
        }
      },
      {
        name: 'Enlarge plot',
        icon: this.expandIcon,
        click: (gd) => this.createEnlargedPlot(gd)
      },
      'toImage', 'zoom2d', 'pan2d', 'select2d', 'zoomIn2d', 'zoomOut2d',
      'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian'
    ];
  }

  private createEnlargedPlot(gd: any) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)',
      zIndex: '1000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });

    const container = document.createElement('div');
    Object.assign(container.style, {
      width: '80%',
      height: '80%',
      backgroundColor: 'white',
      position: 'relative'
    });

    const closeBtn = document.createElement('button');
    Object.assign(closeBtn.style, {
      position: 'absolute',
      right: '10px',
      top: '10px',
      fontSize: '24px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      zIndex: '1001'
    });
    closeBtn.innerHTML = '×';

    container.appendChild(closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Get the current frames and layout
    const frames = gd._transitionData._frames;
    const currentLayout = JSON.parse(JSON.stringify(gd.layout));
    currentLayout.width = container.offsetWidth;
    currentLayout.height = container.offsetHeight;

    // Create modified config for enlarged plot
    const enlargedConfig = {
      ...gd._context,
      responsive: true,
      modeBarButtons: [[
        ...(this.plotData.csv_data?.length > 0
          ? [{
              name: 'Download data as csv file',
              icon: this.downloadIcon,
              click: () => {
                this.Download(this.plotData.csv_data, this.plotData.layout.title.text);
              }
            }]
          : []),
        ...this.createCommonModeBarButtons(currentLayout.showlegend)
        .filter(button =>
          typeof button === 'string' ||
          (typeof button === 'object' && button.name !== 'Enlarge plot')
        )
      ]],
      displaylogo: false,
      toImageButtonOptions: this.downloadConfig
    };

    // Create new plot
    Plotly.newPlot(container,
      JSON.parse(JSON.stringify(gd.data)),
      currentLayout,
      enlargedConfig
    ).then(() => {
      // Add frames if they exist
      if (frames?.length > 0) {
        return Plotly.addFrames(container, frames);
      }
    }).then(() => {
      // Copy slider and animation settings
      if (currentLayout.sliders || currentLayout.updatemenus) {
        return Plotly.relayout(container, {
          sliders: currentLayout.sliders,
          updatemenus: currentLayout.updatemenus
        });
      }
    }).then(() => {
      // Handle resizing
      const resizeObserver = new ResizeObserver(() => {
        Plotly.relayout(container, {
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      });
      resizeObserver.observe(container);

      // Cleanup function
      const cleanup = () => {
        resizeObserver.disconnect();
        document.body.removeChild(overlay);
      };

      // Handle close events
      closeBtn.onclick = cleanup;
      overlay.onclick = (e) => {
        if (e.target === overlay) cleanup();
      };
    });
  }

  private initializePlot() {
    const modeBarButtons = [[
      ...(this.plotData.csv_data?.length > 0
        ? [{
            name: 'Download data as csv file',
            icon: this.downloadIcon,
            click: () => {
              this.Download(this.plotData.csv_data, this.plotData.layout.title.text);
            }
          }]
        : []),
      ...this.createCommonModeBarButtons(true)
    ]];

    setTimeout(() => {
      this.plotData['config'] = {
        modeBarButtons,
        displaylogo: false,
        toImageButtonOptions: this.downloadConfig
      };

      Plotly.react(
        this.PlotlyPlaceHolder.nativeElement,
        this.plotData
      );

        this.PlotlyPlaceHolder.nativeElement.on('plotly_afterplot', () => {
        this.isPlotLoading = false;
      });
    }, 0);
  }

  private Download(csvList: string[], filename: string) {
    const downloadLink = document.createElement('a');
    const csvBlob = new Blob([csvList.join('\n')], { type: "text/csv;charset=UTF-8" });
    downloadLink.href = window.URL.createObjectURL(csvBlob);

    const cleanTitle = filename.replace('<b>', '').replace('</b>', '').split(' ').join('_');
    downloadLink.setAttribute('download', `${cleanTitle}.csv`);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.parentNode.removeChild(downloadLink);
  }
  //
  // protected readonly PostProcessingPlotly = PostProcessingPlotly;
}
