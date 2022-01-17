import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NodeData, IoType } from 'src/app/models/node-data.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SpreadsheetDialogData } from 'src/app/models/dialog-data.model';
import { TypeConversionTools } from 'src/app/tools/type-conversion.tool';
import { SpreadsheetComponent } from 'src/app/modules/spreadsheet/spreadsheet.component';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';

@Component({
  selector: 'app-file-spreadsheet',
  templateUrl: './file-spreadsheet.component.html',
  styleUrls: ['./file-spreadsheet.component.scss']
})
export class FileSpreadsheetComponent implements OnInit {

  @Input() nodeData: NodeData;
  @Input() namespace: string;
  @Input() discipline: string;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  public fileData: any;
  public displayShowButton: boolean;
  public isReadOnly: boolean;
  public isListType: boolean;

  constructor(
    private loadingDialogService: LoadingDialogService,
    private studyCaselocalStorageService: StudyCaseLocalStorageService,
    private ontologyService: OntologyService,
    private dialog: MatDialog,
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseMainService: StudyCaseMainService,
    private snackbarService: SnackbarService) {
    this.fileData = null;
    this.isReadOnly = true;
    this.isListType = false;
  }

  ngOnInit(): void {
    if (this.nodeData !== null && this.nodeData !== undefined) {
      if (this.nodeData.editable === true && this.nodeData.ioType !== IoType.OUT) {
        this.isReadOnly = false;
      }

      if (this.nodeData.type.includes('list')) {
        this.isListType = true;
      }
    }
  }

  onClickUpload() {
    const fileUploadElement = this.fileUpload.nativeElement;
    fileUploadElement.click();
  }

  onSelection(event) {
    if (event.target.files !== undefined && event.target.files !== null && event.target.files.length > 0) {
      this.loadingDialogService.showLoading(`Saving in temporary changes this csv file : ${this.nodeData.displayName}.csv`);
      const file = event.target.files[0];

      const reader = new FileReader();
      let updateItem: StudyUpdateParameter;
      updateItem = new StudyUpdateParameter(
        this.nodeData.identifier,
        UpdateParameterType.CSV,
        UpdateParameterType.CSV,
        this.namespace,
        this.discipline,
        null,
        this.nodeData.oldValue,
        null,
        new Date());

      reader.readAsDataURL(file);
      reader.onload = () => {

        // Remove excel csv sep if it exists
        let csvText = atob(reader.result.toString().split(',')[1]);
        csvText = csvText.replace(/SEP=.*\r?\n|\r/g, '');

        updateItem.newValue = reader.result.toString().split(',')[0] + ',' + btoa(csvText);

        this.studyCaselocalStorageService.setStudyParametersInLocalStorage(
          updateItem,
          this.nodeData.identifier,
          this.studyCaseDataService.loadedStudy.studyCase.id.toString());
        this.nodeData.value = reader.result.toString();
      };
      this.loadingDialogService.closeLoading();
      this.snackbarService.showInformation(`${this.nodeData.displayName} value saved in temporary changes`);
    }
  }

  onClickShow() {
    this.openSpreadsheetEditor(true);
  }

  onClickEdit() {
    this.openSpreadsheetEditor(false);
  }

  openSpreadsheetEditor(readOnly: boolean) {
    let name = '';
    // Handle data naming
    if (this.ontologyService.getParameter(this.nodeData.displayName) !== null
      && this.ontologyService.getParameter(this.nodeData.displayName) !== undefined) {
      if (this.ontologyService.getParameter(this.nodeData.displayName).label !== null
        && this.ontologyService.getParameter(this.nodeData.displayName).label !== undefined) {
        name = this.ontologyService.getParameter(this.nodeData.displayName).label;
      }
    }

    if (name === null || name === '') {
      name = this.nodeData.displayName;
    }

    this.loadingDialogService.showLoading(`Loading csv file : ${name}.csv`);

    const updateParameter = this.studyCaselocalStorageService.
      getOneStudyParameterFromLocalStorage(this.studyCaseDataService.loadedStudy.studyCase.id.toString(), this.nodeData.identifier);

    const spreadsheetDialogData: SpreadsheetDialogData = new SpreadsheetDialogData();
    spreadsheetDialogData.title = name;
    spreadsheetDialogData.nodeData = this.nodeData;
    spreadsheetDialogData.discipline = this.discipline;
    spreadsheetDialogData.namespace = this.namespace;
    spreadsheetDialogData.readOnly = readOnly;

    if (this.nodeData) {
      if (this.isListType) {
        const dialogRef = this.dialog.open(SpreadsheetComponent, {
          disableClose: true,
          data: spreadsheetDialogData
        });
        this.loadingDialogService.closeLoading();
      } else {
        if (updateParameter !== null) { // Temporay file in local storage
          spreadsheetDialogData.file = TypeConversionTools.b64StringToBlob(updateParameter.newValue);
          const dialogRef = this.dialog.open(SpreadsheetComponent, {
            disableClose: true,
            data: spreadsheetDialogData
          });
          this.loadingDialogService.closeLoading();
        } else { // File in distant server
          this.studyCaseMainService.getFile(this.nodeData.identifier).subscribe(file => {
            spreadsheetDialogData.file = new Blob([file]);;
            const dialogRef = this.dialog.open(SpreadsheetComponent, {
              disableClose: true,
              data: spreadsheetDialogData
            });
            this.loadingDialogService.closeLoading();
          }, errorReceived => {
            const error = errorReceived as SoSTradesError;
            this.loadingDialogService.closeLoading();
            if (error.redirect) {
              this.snackbarService.showError(error.description);
            } else {
              this.snackbarService.showError('Error loading csv file : ' + error.description);
            }
          });
        }
      }
    }
  }

  onClickDownload() {
    let name = '';

    if (this.ontologyService.getParameter(this.nodeData.displayName) !== null
      && this.ontologyService.getParameter(this.nodeData.displayName) !== undefined) {
      if (this.ontologyService.getParameter(this.nodeData.displayName).label !== null
        && this.ontologyService.getParameter(this.nodeData.displayName).label !== undefined) {
        name = this.ontologyService.getParameter(this.nodeData.displayName).label;
      }
    }

    if (name === null || name === '') {
      name = this.nodeData.displayName;
    }
    // Secure filename removing special characters
    const fileName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    this.loadingDialogService.showLoading(`Getting csv file : ${fileName}.csv`);

    const updateParameter = this.studyCaselocalStorageService.
      getOneStudyParameterFromLocalStorage(this.studyCaseDataService.loadedStudy.studyCase.id.toString(), this.nodeData.identifier);

    if (updateParameter !== null) { // Temporay file in local storage
      this.createDownloadLinkFileFromLocalMemory(fileName, updateParameter);
    } else { // File in distant server
      this.createDownloadLinkFileFromServer(fileName);
    }
  }

  createDownloadLinkFileFromLocalMemory(fileName: string, updateParameter: StudyUpdateParameter) {
    const fileToDownload = new Blob([TypeConversionTools.b64StringToBlob(updateParameter.newValue)], { type: 'text/csv' });

    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(fileToDownload);
    downloadLink.setAttribute('download', fileName + '.csv');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.parentNode.removeChild(downloadLink);
    this.loadingDialogService.closeLoading();
  }

  createDownloadLinkFileFromServer(fileName: string) {
    this.studyCaseMainService.getFile(this.nodeData.identifier).subscribe(file => {

      const fileToDownload = new Blob([file], { type: 'text/csv' });

      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(fileToDownload);
      downloadLink.setAttribute('download', fileName + '.csv');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.parentNode.removeChild(downloadLink);
      this.loadingDialogService.closeLoading();

    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      this.loadingDialogService.closeLoading();
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error loading csv file : ' + error.description);
      }
    });
  }


}
