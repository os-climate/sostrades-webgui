import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Papa } from 'ngx-papaparse';
import { SpreadsheetDialogData } from 'src/app/models/dialog-data.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { JSpreadSheetProperties, JSpreadSheetRowData, JSpreadSheetValueError, JSpreadSheetColumns } from 'src/app/models/jspreadsheet-objects.model';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import * as jExcel from "node_modules/jspreadsheet-ce";


@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.scss']
})
export class SpreadsheetComponent implements OnInit, AfterViewInit {

  public error: SoSTradesError;
  public isTableLoaded: boolean;
  public hasCsvChanges: boolean;
  public isCsvEditable: boolean;
  public isLargeFile: boolean;
  public columnsDef: {}[];
  public rowData: { [colName: string]: JSpreadSheetRowData }[];
  public title: string;
  public contentHeight: number = 56;

  @ViewChild("spreadsheet") spreadsheet: ElementRef;
  public jExcelSpreadSheet: any;

  constructor(
    private loadingDialogService: LoadingDialogService,
    public dialogRef: MatDialogRef<SpreadsheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpreadsheetDialogData,
    private papa: Papa,
    public studyCaseDataService: StudyCaseDataService,
    private studyCaselocalStorageService: StudyCaseLocalStorageService,
    private ontologyService: OntologyService,
    private snackbarService: SnackbarService) {
    this.isTableLoaded = false;
    this.isLargeFile = false;
    this.title = null;
    this.columnsDef = [];
    this.rowData = [];
    this.hasCsvChanges = false;
    this.isCsvEditable = true;
  }

  ngOnInit(): void {
    if (this.ontologyService.getParameter(this.data.title) !== null) {
      this.title = this.ontologyService.getParameter(this.data.title).label;
    }
    if (this.title === null) {
      this.title = this.data.title;
    }

    if (this.data.readOnly) {
      this.isCsvEditable = false;
    }
  }

  ngAfterViewInit() {
    if (this.data.nodeData.type.includes('list') && (this.data.nodeData.subtype_descriptor === undefined || this.data.nodeData.subtype_descriptor === null)) {
      const listValue = this.data.nodeData.value;
      if (listValue !== undefined && listValue !== null && listValue.length > 0) {
        let valueList = [];
        // Create column value
        listValue.forEach(el => {
          valueList.push({ 'value': el });
        });

        this.columnsDef = JSpreadSheetColumns.Create(
          valueList[0],
          this.data.nodeData.dataframeDescriptor,
          this.data.nodeData.type).columnsData;

        const newRows = JSpreadSheetRowData.Create(valueList, this.data.nodeData.dataframeDescriptor).rowsData;
        newRows.forEach(row => {
          this.rowData.push(row);
        });
      } else {
        this.createEmptyArray();
      }
      setTimeout(() => {
        this.initializeJSpreadSheet();
      }, 0);

    } else {
      if (this.data.nodeData.type.includes('array') && (this.data.nodeData.value === null && this.data.file === null)) {
        this.createEmptyArray();
        setTimeout(() => {
          this.initializeJSpreadSheet();
        }, 0);
      }
      else {
        const options = {
          chunk: (results, parser) => {
            this.addRowsByChunk(results);
          },
          complete: () => {
            this.initializeJSpreadSheet();
          },
          header: true,
          chunkSize: 1024 * 1024 * 2,
          skipEmptyLines: true // Removing issue with PapaParse leaving empty lines at end of file
        };
        this.papa.parse(this.data.file, options);
      }
    }
  }

  createEmptyArray()
  {
    // Create empty array
    let emptyList = [];
    let columns = Object.keys(this.data.nodeData.dataframeDescriptor.columns);
    if (columns.length > 0){
      columns.forEach(column_name => {
        let row = {};
        row[column_name] = '';
        emptyList.push(row);
      });
    }
    else
    {
      emptyList = [{ 'value': '' }];
    }
    this.columnsDef = JSpreadSheetColumns.Create(
      emptyList[0],
      this.data.nodeData.dataframeDescriptor,
      this.data.nodeData.type).columnsData;

    const newRows = JSpreadSheetRowData.Create(emptyList, this.data.nodeData.dataframeDescriptor).rowsData;
    newRows.forEach(row => {
      this.rowData.push(row);
    });

  }

  addRowsByChunk(results) {
    if (results.data !== null && results.data !== undefined && results.data.length > 0) {
      if (this.columnsDef.length === 0) {
        this.columnsDef = JSpreadSheetColumns.Create(results.data[0], this.data.nodeData.dataframeDescriptor, null).columnsData;
      }

      const newRows = JSpreadSheetRowData.Create(results.data, this.data.nodeData.dataframeDescriptor).rowsData;
      newRows.forEach(row => {
        this.rowData.push(row);
      });
    }
    else {
      this.createEmptyArray();
    }
  }

  initializeJSpreadSheet() {

    if (this.rowData.length === 0) {
      this.dialogRef.close(this.data);
      this.snackbarService.showError(`${this.data.nodeData.displayName} contains no data to display`);
    }

    const jExcelProperties = new JSpreadSheetProperties(this.rowData, this.columnsDef, this.data.nodeData.dataframeDescriptor, this.isCsvEditable);

    if (this.rowData.length > 5000) {
      this.contentHeight = 6;
      jExcelProperties.search = false;
      jExcelProperties.filters = false;
      jExcelProperties.editable = false;
      jExcelProperties.allowDeleteRow = false;
      jExcelProperties.allowInsertRow = false;
      this.isLargeFile = true;
    }

    jExcelProperties.onafterchanges = (instance, records) => {
      this.onCellAfterChanges(instance, records);
    };

    jExcelProperties.oninsertrow = () => {
      this.unlockSaveButton();
    };

    jExcelProperties.ondeleterow = () => {
      this.unlockSaveButton();
    };

    this.isTableLoaded = true;
    this.jExcelSpreadSheet = jExcel(this.spreadsheet.nativeElement, jExcelProperties);
  }

  unlockSaveButton() {
    let doSave = true;
    let atLeastOneColNotEmpty = false;
    //check that array have at least one row not empty
    if (this.data.nodeData.type.includes('array')) {
      const columnData = this.jExcelSpreadSheet.getColumnData(0);
      columnData.forEach((element) => {
        if (element === null || element === '') {
          doSave = false;
        }
        else{
          atLeastOneColNotEmpty = true;
        }
      });
    }
    if (!doSave && !atLeastOneColNotEmpty){
      this.snackbarService.showInformation(`${this.data.nodeData.displayName} value is required`);
    }
    this.hasCsvChanges = doSave || atLeastOneColNotEmpty;
  }

  onCellAfterChanges(instance, records) {

    let errorRecords: { [colName: string]: JSpreadSheetValueError } = {};

    if (records !== null && records !== undefined && records.length > 0) {
      records.forEach(rec => {
        const columnName = this.jExcelSpreadSheet.getHeader(rec.x);
        if (columnName in this.data.nodeData.dataframeDescriptor.columns) {
          const columnDataFrameDescriptor = this.data.nodeData.dataframeDescriptor.columns[columnName];
          // Check column type from dataframe descriptor if different from undefined type, then check valid value
          if (columnDataFrameDescriptor.columnType !== JSpreadSheetColumns.undefinedType
            && columnDataFrameDescriptor.isColumnEditable === true) {
            // Check range
            if (columnDataFrameDescriptor.columnRange !== undefined
              && columnDataFrameDescriptor.columnRange !== null
              && columnDataFrameDescriptor.columnRange.length > 0) {
              if (!(parseInt(rec.newValue, 10) >= columnDataFrameDescriptor.columnRange[0]
                && parseInt(rec.newValue, 10) <= columnDataFrameDescriptor.columnRange[1])) {
                if (!(columnName in errorRecords)) {
                  errorRecords[columnName] = new JSpreadSheetValueError();
                }
                errorRecords[columnName].errorRange = `${columnDataFrameDescriptor.columnRange[0]} ≤ range ≤ ${columnDataFrameDescriptor.columnRange[1]} `;
              }
            }

            // Check value float
            if (columnDataFrameDescriptor.columnType.includes('float')) {
              let floatCleaned = rec.newValue;
              if (rec.newValue !== undefined && rec.newValue !== null) {
                floatCleaned = rec.newValue.toString().replace(',', '.');
              }

              if (!TypeCheckingTools.isFloat(floatCleaned)) {
                if (!(columnName in errorRecords)) {
                  errorRecords[columnName] = new JSpreadSheetValueError();
                }
                errorRecords[columnName].errorFloat = `Float intended `;
              }
            }

            // Check value int
            if (columnDataFrameDescriptor.columnType.includes('int')) {
              if (!TypeCheckingTools.isInt(rec.newValue)) {
                if (!(columnName in errorRecords)) {
                  errorRecords[columnName] = new JSpreadSheetValueError();
                }
                errorRecords[columnName].errorInt = `Integer intended `;
              }
            }
              
            //check value array and float format in it
            if (columnDataFrameDescriptor.columnType.includes('array')) {
              let array_data = rec.newValue;
              if (rec.newValue !== undefined && rec.newValue !== null) {
                let array_data_str = array_data.toString().trim();
                if (array_data_str.startsWith("[")){
                  array_data_str = array_data_str.replace("[", "");
                }
                if (array_data_str.endsWith("]")){
                  array_data_str = array_data_str.replace("]", "");
                }
                let array_data_check = array_data_str.split(",");
                for(let i = 0;i<array_data_check.length;i++){
                  array_data_check[i] = array_data_check[i].trim();
                  if (!TypeCheckingTools.isFloat(array_data_check[i])) {
                    if (!(columnName in errorRecords)) {
                      errorRecords[columnName] = new JSpreadSheetValueError();
                    }
                    errorRecords[columnName].errorFloat = `Array of Float intended `;
                  }
                }
              }
            }
          }
          
        }
      });
    }

    let errMessage = '';
    if (Object.keys(errorRecords).length > 0) {

      Object.keys(errorRecords).forEach(key => {
        let colError = `Error in Column ${key}: `;
        colError += errorRecords[key].errorRange + errorRecords[key].errorInt + errorRecords[key].errorFloat;
        errMessage += colError;
      });
      errMessage += ' => Changes reverted';

      this.snackbarService.showWarning(errMessage);
      this.jExcelSpreadSheet.undo();
    } else {
      // Show csv changes button
      this.unlockSaveButton();
    }
  }

  cancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }

  saveDataClick() {

    if (this.data.nodeData.type.includes('list') && (this.data.nodeData.subtype_descriptor === undefined || this.data.nodeData.subtype_descriptor === null)) {
      // Saving list type
      this.loadingDialogService.showLoading(`Saving in temporary changes : ${this.data.nodeData.displayName}`);

      const newDataList = [];
      const columnData = this.jExcelSpreadSheet.getColumnData(0);

      columnData.forEach((element) => {
        if (element !== null && element !== '') {
          if (this.data.nodeData.type.includes('float')) {
            newDataList.push(parseFloat(element));
          } else if (this.data.nodeData.type.includes('int')) {
            newDataList.push(parseInt(element));
          } else {
            newDataList.push(element.toString());
          }
        }
      });

      let updateItem: StudyUpdateParameter;

      updateItem = new StudyUpdateParameter(
        this.data.nodeData.identifier,
        this.data.nodeData.type.toString(),
        UpdateParameterType.SCALAR,
        this.data.namespace,
        this.data.discipline,
        newDataList,
        this.data.nodeData.oldValue,
        null,
        new Date());

      this.data.nodeData.value = newDataList;

      this.studyCaselocalStorageService.setStudyParametersInLocalStorage(
        updateItem,
        this.data.nodeData.identifier,
        this.studyCaseDataService.loadedStudy.studyCase.id.toString());

    } else {

        // Saving dataframe, array or dict type
        this.loadingDialogService.showLoading(`Saving in temporary changes this csv file : ${this.data.nodeData.displayName}.csv`);
        // Generate string b64 file for local storage
        let updateItem: StudyUpdateParameter;
        updateItem = new StudyUpdateParameter(
          this.data.nodeData.identifier,
          UpdateParameterType.CSV,
          UpdateParameterType.CSV,
          this.data.namespace,
          this.data.discipline,
          null,
          this.data.nodeData.oldValue,
          null,
          new Date());

        updateItem.newValue = this.generateBase64file();

        if(this.data.nodeData.type.includes('array')) {
          this.data.nodeData.value = '://ndarray';
        }

        // Saving edited table in local storage
        this.studyCaselocalStorageService.setStudyParametersInLocalStorage(
          updateItem,
          this.data.nodeData.identifier,
          this.studyCaseDataService.loadedStudy.studyCase.id.toString());
    }
    this.loadingDialogService.closeLoading();
    this.snackbarService.showInformation(`${this.data.nodeData.displayName} value saved in temporary changes`);
    this.dialogRef.close(this.data);

  }

  generateBase64file(): string {
    const csvData = this.jExcelSpreadSheet.copy(false, ',', true, true, true);
    return 'data:application/vnd.ms-excel;base64,' + btoa(csvData);
  }

}
