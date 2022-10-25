import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { OntologyParameterInformationsDialogData } from 'src/app/models/dialog-data.model';
import { OntologyParameterUsage } from 'src/app/models/ontology-parameter-usage.model';
import { OntologyParameter, OntologyParameterAttributes } from 'src/app/models/ontology-parameter.model';
import { Routing } from 'src/app/models/routing.model';
import { HeaderService } from 'src/app/services/hearder/header.service';


@Component({
  selector: 'app-ontology-parameter-informations',
  templateUrl: './ontology-parameter-informations.component.html',
  styleUrls: ['./ontology-parameter-informations.component.scss']
})
export class OntologyParameterInformationsComponent implements OnInit {

  public parameterDatas: string[][];
  public panelDisciplinesParametersOpenState: boolean;
  public dataSourceparameterUsages = new MatTableDataSource<OntologyParameterUsage>();
  public visibleColumns = [
    'io_type',
    'model_label',
    'unit',
    'datatype',
    'numerical',
    'range',
    'optional',
    'possible_values',
    'go_to_model'
  ];

  public isInDialog: boolean;
  constructor(
    private headerService: HeaderService,
    private router: Router,
    public dialogRef: MatDialogRef<OntologyParameterInformationsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OntologyParameterInformationsDialogData) {

    this.parameterDatas = null;
    this.isInDialog = data != null;
    this.panelDisciplinesParametersOpenState = false;
  }

  ngOnInit(): void {
    if (this.data.parameter != null) {
      // retrieve parameter str data with keys (responsive display data view)
      const parameterKeys = Object.entries(this.data.parameter);

      const stringData = parameterKeys.filter(entry => (typeof entry[1] === 'string' || typeof entry[1] === 'number')
      && entry[0] !== OntologyParameterAttributes.NB_DISCIPLINES_USING_PARAMETER)
      .map(entry => [OntologyParameter.getKeyLabel(entry[0]), entry[1]]);

      const listDatas = parameterKeys.filter(entry => typeof entry[1] !== 'string'
                                                       && typeof entry[1] !== 'number'
                                                       && entry[0] !== OntologyParameterAttributes.PARAMETER_USAGE_DETAILS
                                                       && entry[0] !== OntologyParameterAttributes.POSSIBLE_DATATYPES
                                                       && entry[0] !== OntologyParameterAttributes.POSSIBLE_UNITS
                                                       && entry[0] !== OntologyParameterAttributes.DISCIPLINES_USING_PARAMETER
                                                       && entry[0] !== 'toString'
                                                       && entry[1] !== undefined
                                                       && entry[1] !== null);
      const stringListDatas = listDatas.map(entry => [OntologyParameter.getKeyLabel(entry[0]), entry[1].join(', ')]);
      this.parameterDatas = stringData.concat(stringListDatas);

      // retrieve parameter usage data (table with one line per usage)
      if (this.data.parameter.parameter_usage_details != null
        && this.data.parameter.parameter_usage_details.length > 0) {
        this.dataSourceparameterUsages = new MatTableDataSource<OntologyParameterUsage>(this.data.parameter.parameter_usage_details);
        this.dataSourceparameterUsages.data.sort((a: any, b: any) => {
          if (a.model_label < b.model_label) {
              return -1;
          } else if (a.model_label > b.model_label) {
              return 1;
          } else {
              return 0;
          }
      });
      }

    }
  }

  goToModelsStatus(model) {
    this.dialogRef.close();
    this.headerService.changeIndexTab(1);
    this.router.navigate([Routing.ONTOLOGY, Routing.MODELS], {queryParams: {model: `${model}`}});
  }

  okClick() {
    this.dialogRef.close();
  }
}

