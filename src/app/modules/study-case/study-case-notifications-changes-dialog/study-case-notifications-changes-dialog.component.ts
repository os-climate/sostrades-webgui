import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationDialogData } from 'src/app/models/dialog-data.model';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { MatTableDataSource } from '@angular/material/table';
import { CoeditionType } from 'src/app/models/coedition-notification.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { MatSort } from '@angular/material/sort';
import { ColumnName } from 'src/app/models/enumeration.model';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-coedition-dialog',
  templateUrl: './study-case-notifications-changes-dialog.component.html',
  styleUrls: ['./study-case-notifications-changes-dialog.component.scss']
})
export class StudyCaseNotificationsChangesDialogComponent implements OnInit, AfterViewInit  {

  public displayedColumns = [ColumnName.VARIABLE_ID, ColumnName.OLD_VALUE, ColumnName.NEW_VALUE];
  public columnValuesDict = new Map <ColumnName, string[]>();
  public colummnsDictForTitleSelection = new Map <ColumnName, string>();
  public dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>();
  public hasChangesFromDataset: boolean;
  public title: string;
  public columnName = ColumnName;
  public showPaginator: boolean;
  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceChanges.sort = v;
  }
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public dialogRef: MatDialogRef<StudyCaseNotificationsChangesDialogComponent>,
    private ontologyService: OntologyService,
    @Inject(MAT_DIALOG_DATA) public data: NotificationDialogData
    
  ) { 
    this.hasChangesFromDataset = false;
    this.columnValuesDict.clear();
    this.colummnsDictForTitleSelection.clear();
    this.showPaginator = false;
  }

  ngOnInit(): void {
    if (this.data.changes.length > 0) {
      this.data.changes.forEach(change => {
        if (change.changeType === UpdateParameterType.CSV) {
          change.newValue = change.oldValue = 'Csv';
        }
      });
      this.hasChangesFromDataset = this.data.changes.some(parameter => 
        (parameter.datasetConnectorId !== null && parameter.datasetConnectorId !== undefined) && 
        (parameter.datasetId !== null && parameter.datasetId !== undefined)
      );
     
      this.setColumnValuesDict();
      this.setcolummnsDictForTitleSelection();
      if (this.hasChangesFromDataset) {
        this.setupDatasetColumns();
      }
      this.configureDialogPage();
      this.initializeDataSource();
    }
    this.showPaginator = this.dataSourceChanges.data.length > 500;
  }

  ngAfterViewInit() {
    if (this.showPaginator) {
      this.dataSourceChanges.paginator = this.paginator;
    }
  }

  // Set up column filters and values
  private setColumnValuesDict(): void {
    this.columnValuesDict.set(ColumnName.VARIABLE_ID, ['Parameter name']);
    this.columnValuesDict.set(ColumnName.NEW_VALUE, ["New value"]);
    this.columnValuesDict.set(ColumnName.OLD_VALUE, ["Server value"]);
  }
  
  // Set up column filters and values
  private setcolummnsDictForTitleSelection(): void {
    this.colummnsDictForTitleSelection.set(ColumnName.VARIABLE_ID, 'Parameter name');
    this.colummnsDictForTitleSelection.set(ColumnName.NEW_VALUE, "New value");
    this.colummnsDictForTitleSelection.set(ColumnName.OLD_VALUE, "Server value");
  }
  
  // Set up additional columns for dataset changes
  private setupDatasetColumns(): void {
    this.displayedColumns.push(ColumnName.DATASET_ID);
    this.colummnsDictForTitleSelection.set(ColumnName.DATASET_ID, "Dataset ID");
    this.columnValuesDict.set(ColumnName.DATASET_ID, ['Dataset ID']);
  
    if (this.data.type === CoeditionType.EXPORT) {
      this.removeColumn([ColumnName.NEW_VALUE]);
      this.colummnsDictForTitleSelection.set(ColumnName.OLD_VALUE, "Parameter value");
      this.columnValuesDict.set(ColumnName.OLD_VALUE, ["Parameter value"]);
    }
  }
  
  // Remove the NEW_VALUE column for export type
  private removeColumn(columnsName: ColumnName[]): void {
    columnsName.forEach(column => {
      const indexToRemove = this.displayedColumns.indexOf(column);
      this.displayedColumns.splice(indexToRemove, 1);
      this.colummnsDictForTitleSelection.delete(column);
      this.columnValuesDict.delete(column);
    })
    
  }
  
  // Configure dialog title and size
  private configureDialogPage(): void {
    if (this.hasChangesFromDataset) {
      this.title = this.data.type === CoeditionType.EXPORT ? "Dataset export" : "Dataset import";
      this.dialogRef.updateSize(null, '700px');
    } else {
      this.title = "Parameters changed";
      this.dialogRef.updateSize('800px', '700px');
    }
  }
  
  // Initialize the MatTableDataSource and set up sorting
  private initializeDataSource(): void {
    this.dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>(this.data.changes);
    this.dataSourceChanges.sortingDataAccessor = (item, property) => this.customSortingAccessor(item[property]);
    this.dataSourceChanges.sort = this.sort;
  }
  
  // Custom sorting accessor for different data types
  private customSortingAccessor(value: any) {
    if (value == null || value === "") return "zzzz"; // Empty values at the end
    if (typeof value === 'string') return value.toLowerCase();
    if (typeof value === 'boolean') return value ? "true" : "false";
    if (typeof value === 'number') return value;
    if (Array.isArray(value)) return value.length;
    return String(value).toLowerCase();
  }

  onOkClick() {
    this.dialogRef.close();
  }

  onExportCSVClick() {
    //export the changes from dataset export or import into a CSV file
    const CSVFileName = `${this.title}_study-${this.data.studyId}_${this.data.user}_${this.data.date.replace(/\//g,'-')}.csv`;
    const csvHeader = "Ontology name,Ontology description,Ontology unit,SOS namespace,SOS parameter,Connector name,Dataset name,Location";
    const csvData = [csvHeader];
    this.data.changes.forEach(change => {
      const changeLine = []
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
      csvData.push(changeLine.join(','))
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
