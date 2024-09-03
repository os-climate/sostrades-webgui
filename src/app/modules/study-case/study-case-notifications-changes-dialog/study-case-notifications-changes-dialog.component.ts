import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationDialogData } from 'src/app/models/dialog-data.model';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { MatTableDataSource } from '@angular/material/table';
import { CoeditionType } from 'src/app/models/coedition-notification.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { TypeConversionTools } from 'src/app/tools/type-conversion.tool';

@Component({
  selector: 'app-coedition-dialog',
  templateUrl: './study-case-notifications-changes-dialog.component.html',
  styleUrls: ['./study-case-notifications-changes-dialog.component.scss']
})
export class StudyCaseNotificationsChangesDialogComponent implements OnInit {

  public displayedColumns = ['name', 'oldValue', 'newValue'];
  public dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>();
  public hasChangesFromDataset: boolean;
  public title: string;

  constructor(
    public dialogRef: MatDialogRef<StudyCaseNotificationsChangesDialogComponent>,
    private ontologyService: OntologyService,
    @Inject(MAT_DIALOG_DATA) public data: NotificationDialogData
  ) { 
    this.hasChangesFromDataset = false;
  }

  ngOnInit(): void {
    if (this.data.changes.length > 0) {
      this.data.changes.forEach(change => {
        if (change.changeType === UpdateParameterType.CSV) {
          change.newValue = 'Csv';
          change.oldValue = 'Csv';
        }
      });
      this.hasChangesFromDataset = this.data.changes.some(parameter => 
        (parameter.datasetConnectorId !== null && parameter.datasetConnectorId !== undefined) && 
        (parameter.datasetId !== null && parameter.datasetId !== undefined)
    );
    if (this.hasChangesFromDataset) {
      this.title = this.data.type == CoeditionType.EXPORT?"Dataset export": "Dataset import";
      this.displayedColumns.push('datasetConnectorId', 'datasetId');
      this.dialogRef.updateSize(null,'700px');
    }
    else {
      this.title = "Parameters changed";
      this.dialogRef.updateSize('800px','700px');
    }
      this.dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>(this.data.changes);
    }
  }

  onOkClick() {
    this.dialogRef.close();
  }

  onExportCSVClick() {
    //export the changes from dataset export or import into a CSV file
    const CSVFileName = `${this.title}_study-${this.data.studyId}_${this.data.user}_${this.data.date.replace(/\//g,'-')}.csv`;
    const csvHeader = "Ontology name;Ontology description;ontology unit;SOS namespace;Sos parameter;Connector name;Dataset name;location";
    const csvData = [csvHeader];
    this.data.changes.forEach(change => {
      let changeLine = []
      //get ontology information of the data change
      const ontologyData = this.ontologyService.getParameter(change.variableKey);
      if (ontologyData !== null){
        changeLine.push(ontologyData.label);
        changeLine.push(ontologyData.definition);
        changeLine.push(ontologyData.unit);
      }
      else{
        changeLine.push("");
        changeLine.push("");
        changeLine.push("");
      }

      // add other data informations
      const namespaces = change.variableId.split('.'); 
      changeLine.push(namespaces.slice(0,namespaces.length-1).join('.'));
      changeLine.push(namespaces.pop());
      changeLine.push(change.datasetConnectorId);
      changeLine.push(change.datasetId);
      changeLine.push(change.datasetDataPath);

      //concatenate information separated by ';' and add it to the csv
      csvData.push(changeLine.join(';'))
    });
    //export the csv
    const csvContent = csvData.join('\n');
    const fileToDownload = new Blob([csvContent], { type: 'text/csv' });

    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(fileToDownload);
    downloadLink.setAttribute('download', CSVFileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.parentNode.removeChild(downloadLink);
    
    this.dialogRef.close();
  }
}
