import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { StudyCaseValidation } from 'src/app/models/study-case-validation.model';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import * as Plotly from 'plotly.js-dist-min';

@Component({
  selector: 'app-post-processing-plotly',
  templateUrl: './post-processing-plotly.component.html',
  styleUrls: ['./post-processing-plotly.component.scss']
})
export class PostProcessingPlotlyComponent implements OnInit {

  @Input() plotData: any;
  @Input() fullNamespace: string;

  @ViewChild('PlotlyPlaceHolder', { static: true }) private PlotlyPlaceHolder: ElementRef;

  public isPlotLoading: boolean;
  public studyCaseValidation: StudyCaseValidation;

  constructor(private studyCaseValidationService: StudyCaseValidationService) {
    this.isPlotLoading = true;
    this.studyCaseValidation = null;
  
  }


  ngOnInit() {
    if (this.plotData !== null && this.plotData !== undefined) {
      if (this.studyCaseValidationService.studyValidationDict !== null && this.studyCaseValidationService.studyValidationDict !== undefined) {
        if (`${this.fullNamespace}` in this.studyCaseValidationService.studyValidationDict) {
          this.studyCaseValidation =this.studyCaseValidationService.studyValidationDict[`${this.fullNamespace}`][0];
        }
      }
      const downloadIcon = {
        width: 24,
        height: 24,
        // eslint-disable-next-line max-len
        path: 'M19,21.8H5c-1.5,0-2.8-1.2-2.8-2.8v-6c0-1,0.8-1.8,1.8-1.8S5.8,12,5.8,13v5c0,0.1,0.1,0.3,0.3,0.3h12c0.1,0,0.3-0.1,0.3-0.3v-5c0-1,0.8-1.8,1.8-1.8s1.8,0.8,1.8,1.8v6C21.8,20.5,20.5,21.8,19,21.8z M12,16.8c-0.4,0-0.9-0.2-1.2-0.5l-3.6-3.6c-0.7-0.7-0.7-1.8,0-2.5c0.7-0.7,1.8-0.7,2.5,0l0.6,0.6V4c0-1,0.8-1.8,1.8-1.8S13.8,3,13.8,4v6.9l0.6-0.6c0.7-0.7,1.8-0.7,2.5,0c0.7,0.7,0.7,1.8,0,2.5l-3.6,3.6C12.9,16.7,12.4,16.8,12,16.8z',
      };

      const legendIcon = {
        width: 24,
        height: 24,
        // eslint-disable-next-line max-len
        path: 'M 3 2 A 2 2 0 0 0 1 4 A 2 2 0 0 0 3 6 A 2 2 0 0 0 5 4 A 2 2 0 0 0 3 2 z M 7 3 L 7 5 L 19 5 L 19 3 L 7 3 z M 3 8 A 2 2 0 0 0 1 10 A 2 2 0 0 0 3 12 A 2 2 0 0 0 5 10 A 2 2 0 0 0 3 8 z M 7 9 L 7 11 L 19 11 L 19 9 L 7 9 z M 3 14 A 2 2 0 0 0 1 16 A 2 2 0 0 0 3 18 A 2 2 0 0 0 5 16 A 2 2 0 0 0 3 14 z M 7 15 L 7 17 L 19 17 L 19 15 L 7 15 z',
      };

      let modeBarButtons = [];
      let showLegend = true;
      const logo={
        source:"assets/logo_black_graph.png",
        xref:"paper", yref:"paper",
        x:0.995, y:-0.005,
        sizex:0.1, sizey:0.1,
        xanchor:"right", yanchor:"bottom",
        name:"logo_SOS_trades",
        opacity:0.5
      };
      this.plotData.layout.images = [logo];
      let forceNotOfficialWatermark = false;
      if (this.plotData.logo_official) {
        if (this.studyCaseValidation !== null && this.studyCaseValidation !== undefined) {
          if (this.studyCaseValidation.validationState === 'Validated') {
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
          if (this.plotData.layout.annotations === undefined) {
            this.plotData.layout.annotations = [validation_annotation];
          } else {
            this.plotData.layout.annotations.push(validation_annotation);
          }
          } else {
            forceNotOfficialWatermark = true;
          }
        } else {
          forceNotOfficialWatermark = true;
        }
       }
      
      if (this.plotData.logo_notvalidated || forceNotOfficialWatermark) {
        const logo_notvalidated = {
        source:"assets/NOTVALIDATED.PNG",
        xref:"paper", yref:"paper",
        x:0, y:1,
        sizex:1, sizey:1,
        name:"logo_SOS_trades",
        opacity:0.2
      };
      this.plotData.layout.images.push(logo_notvalidated);
        }
      if (this.plotData.logo_work_in_progress) {
        const logo_work_in_progress ={
        source:"assets/WORKINPROGRESS.PNG",
        xref:"paper", yref:"paper",
        x:0, y:1,
        sizex:1, sizey:1,
        name:"logo_SOS_trades",
        opacity:0.2
      };
      this.plotData.layout.images.push(logo_work_in_progress);
        }
        
      // customize download size
      const downloadConfig =   {
        format: 'png', // one of png, svg, jpeg, webp
        filename: 'sos_trades_graph',
        height: 850,
        width: 1200,
        scale: 8 // Multiply title/legend/axis/canvas sizes by this factor
      };

      if (this.plotData.csv_data === null || this.plotData.csv_data === undefined || this.plotData.csv_data.length === 0) {
        modeBarButtons = [[
          {
            name: 'Show/hide legend',
            icon: legendIcon,
            click: () => {
              showLegend = !showLegend;
              Plotly.relayout(this.PlotlyPlaceHolder.nativeElement, { showlegend: showLegend });
            }
          },
          // Set standard plotly toolbar icons
          // eslint-disable-next-line max-len
          'toImage', 'zoom2d', 'pan2d', 'select2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']];
      } else {
        modeBarButtons = [[
          {
            name: 'Download data as csv file',
            icon: downloadIcon,
            click: () => {
              this.Download(this.plotData.csv_data, this.plotData.layout.title.text);
            }
          },
          {
            name: 'Show/hide legend',
            icon: legendIcon,
            click: () => {
              showLegend = !showLegend;
              Plotly.relayout(this.PlotlyPlaceHolder.nativeElement, { showlegend: showLegend });
            }
          },
          // Restore standard plotly toolbar icons
          // eslint-disable-next-line max-len
          'toImage', 'zoom2d', 'pan2d', 'select2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian']];
      }

      setTimeout(() => {
        this.plotData['config'] = { modeBarButtons: modeBarButtons , displaylogo: false, toImageButtonOptions:downloadConfig}
        Plotly.react(
          this.PlotlyPlaceHolder.nativeElement,
          this.plotData);

        this.PlotlyPlaceHolder.nativeElement.on('plotly_afterplot', () => {
          this.isPlotLoading = false;
        });
      }, 0);
    }
  }

  private Download(csvList, filename) {

    const downloadLink = document.createElement('a');
    const csvBlob = new Blob([csvList.join('\n')], { type: "text/csv;charset=UTF-8" });
    downloadLink.href = window.URL.createObjectURL(csvBlob);

    const cleanTitle = filename.replace('<b>', '').replace('</b>', '').split(' ').join('_');

    downloadLink.setAttribute('download', `${cleanTitle}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.parentNode.removeChild(downloadLink);

  }
}
