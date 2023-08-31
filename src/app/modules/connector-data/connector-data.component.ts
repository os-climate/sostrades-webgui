import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnectorDialogData } from 'src/app/models/dialog-data.model';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

@Component({
  selector: 'app-connector-data',
  templateUrl: './connector-data.component.html',
  styleUrls: ['./connector-data.component.scss']
})
export class ConnectorDataComponent implements OnInit {

  public objectKey = Object.keys;
  public innerConnectorData = {};

  constructor(
    private studyCaseDataService: StudyCaseDataService,
    private studyCaselocalStorageService: StudyCaseLocalStorageService,
    public dialogRef: MatDialogRef<ConnectorDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConnectorDialogData) {

  }

  ngOnInit(): void {
    for (let key of this.objectKey(this.data.connectorData)){
      this.innerConnectorData[key] = this.data.connectorData[key];
    }
  }

  saveDataClick() {
    if(this.checkValueChanged()){
      let updateItem: StudyUpdateParameter;

      updateItem = new StudyUpdateParameter(
        this.data.nodeData.identifier,
        this.data.nodeData.type.toString(),
        UpdateParameterType.CONNECTOR_DATA,
        null,
        this.data.namespace,
        this.data.discipline,
        this.innerConnectorData,
        this.data.connectorData,
        null,
        new Date());

      /* this.nodeData.value = value; */

      this.studyCaselocalStorageService.setStudyParametersInLocalStorage(
        updateItem,
        this.data.nodeData,
        this.studyCaseDataService.loadedStudy.studyCase.id.toString());

      this.data.nodeData.connector_data = this.innerConnectorData;
    }
    this.dialogRef.close();
  }

  checkValueChanged():boolean{
    let isDifferent = false;
    for(let key of this.objectKey(this.innerConnectorData)){
      if (this.innerConnectorData[key] !== this.data.connectorData[key]){
          isDifferent = true;
      }
    }
    return isDifferent;
  }

  cancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}
