import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NodeData, IoType } from 'src/app/models/node-data.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SpreadsheetDialogData } from 'src/app/models/dialog-data.model';
import { TypeConversionTools } from 'src/app/tools/type-conversion.tool';
import { SpreadsheetComponent } from 'src/app/modules/spreadsheet/spreadsheet.component';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-file-spreadsheet',
  templateUrl: './file-spreadsheet.component.html',
  styleUrls: ['./file-spreadsheet.component.scss']
})
export class FileSpreadsheetComponent implements OnInit, OnDestroy {

  @Input() nodeData: NodeData;
  @Input() namespace: string;
  @Input() discipline: string;
  @Output() stateUpdate: EventEmitter<any> = new EventEmitter();

  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  public fileData: any;
  public displayShowButton: boolean;
  public isReadOnly: boolean;
  public isListType: boolean;
  public isArrayType: boolean;
  public hasSubTypeDescriptor: boolean;
  private dialogRef: MatDialogRef<SpreadsheetComponent>;


  constructor(
    private loadingDialogService: LoadingDialogService,
    private studyCaselocalStorageService: StudyCaseLocalStorageService,
    private ontologyService: OntologyService,
    private dialog: MatDialog,
    private studyCaseDataService: StudyCaseDataService,
    private studyCaseMainService: StudyCaseMainService,
    private snackbarService: SnackbarService,
    private papa: Papa) {
    this.fileData = null;
    this.isReadOnly = true;
    this.isListType = false;
    this.isArrayType = false;
    this.hasSubTypeDescriptor = false;

  }

  ngOnInit(): void {
    if (this.nodeData !== null && this.nodeData !== undefined) {
      if (this.nodeData.editable === true && this.nodeData.ioType !== IoType.OUT) {
        this.isReadOnly = false;
      }

      if (this.nodeData.type.includes('list')) {
        this.isListType = true;
      }

      if (this.nodeData.subTypeDescriptor !== null && this.nodeData.subTypeDescriptor !== undefined) {
          this.hasSubTypeDescriptor = true;
      }

      if (this.nodeData.type.includes('array')) {
        this.isArrayType = true;
      }

    }
  }

  ngOnDestroy(): void {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  onClickUpload() {
    const fileUploadElement = this.fileUpload.nativeElement;
    fileUploadElement.click();
  }

  onSelection(event) {
    if (event.target.files !== undefined && event.target.files !== null && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();

      if (this.isListType && !this.hasSubTypeDescriptor) {
        // Saving list type
        this.loadingDialogService.showLoading(`Saving in temporary changes : ${this.nodeData.displayName}`);
        this.papa.parse(file, {
          complete: papaparseResults => {

            // Validate separator used to create the csv
            if (papaparseResults.meta.delimiter !== ',') {
              this.snackbarService.showError(`Given csv file does not seems to use the atetnded csv separator.\nPLease check that ',' is the csv separator used in the file`);
              return;
            }

            // Check the content of the file (empty file is not somethign alowed)
            if (papaparseResults.data.length === 0) {
              this.snackbarService.showWarning(`Given csv file is empty, no changes has been applied.`);
              return;
            }

            // Extract headers, check that only one is present, and check that this header is 'value'
            const headers = [];

            papaparseResults.data[0].forEach(header => {
              if (header.trim().length > 0) {
                headers.push(header.trim());
              }
            });

            if (headers.length > 1) {
              this.snackbarService.showError(`Given csv file contains more than one attended columns.\nPlease set only one column and name it 'value'`);
              return;
            }

            if (headers[0] !== 'value') {
              this.snackbarService.showError(`Cannot locate 'value' column name.\nColumn with data to read has to be named 'value' in order to proceed`);
              return;
            }

            const newDataList = [];
            papaparseResults.data.slice(1).forEach(values => {
              if (values.length > 0) {
                const value = values[0].trim();

                if (value !== '') {
                  if (this.nodeData.type.includes('float')) {
                    newDataList.push(parseFloat(value));
                  } else if (this.nodeData.type.includes('int')) {
                    newDataList.push(parseInt(value));
                  } else {
                    newDataList.push(value.toString());
                  }
                }
              }
            });

            const updateItem = new StudyUpdateParameter(
              this.nodeData.identifier,
              this.nodeData.type.toString(),
              UpdateParameterType.SCALAR,
              null,
              this.namespace,
              this.discipline,
              newDataList,
              this.nodeData.oldValue,
              null,
              new Date(),
              null,
              null,
              null);

            this.studyCaselocalStorageService.setStudyParametersInLocalStorage(
                updateItem,
                this.nodeData,
                this.studyCaseDataService.loadedStudy.studyCase.id.toString());

            this.nodeData.value = newDataList;
            this.stateUpdate.emit();
            this.loadingDialogService.closeLoading();
            this.snackbarService.showInformation(`${this.nodeData.displayName} value saved in temporary changes`);
          }
        });
      } else {
        this.loadingDialogService.showLoading(`Saving in temporary changes this csv file : ${this.nodeData.displayName}.csv`);

        const updateItem = new StudyUpdateParameter(
          this.nodeData.identifier,
          UpdateParameterType.CSV,
          UpdateParameterType.CSV,
          null,
          this.namespace,
          this.discipline,
          null,
          this.nodeData.oldValue,
          null,
          new Date(),
          null,
          null,
          null);
        const maxByteSize = 1024*1024*1024
        if (file.size < maxByteSize) {
          reader.readAsDataURL(file)
          
          reader.onprogress = (event) => {  
            if (event.lengthComputable) {
              const loaded = event.loaded;
              const total = event.total;
              const remaining = total - loaded;
          
              const formatBytes = (bytes) => {
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (bytes === 0) return '0 Byte';
                const i = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
              };
          
              const percentLoaded = Math.round((loaded / total) * 100);
              const remainingSize = formatBytes(remaining);
          
              this.loadingDialogService.updateMessage(`${percentLoaded}% loaded. Remaining: ${remainingSize}`);
            }
          };

          
          reader.onload = () => {
            try {
              let csvText = atob(reader.result.toString().split(',')[1]);
              csvText = csvText.replace(/SEP=.*\r?\n|\r/g, '');

              updateItem.newValue = reader.result.toString().split(',')[0] + ',' + btoa(csvText);

              this.studyCaselocalStorageService.setStudyParametersInLocalStorage(
                updateItem,
                this.nodeData,
                this.studyCaseDataService.loadedStudy.studyCase.id.toString());
              this.nodeData.value = reader.result.toString();
              this.stateUpdate.emit();
              this.loadingDialogService.closeLoading();
              this.snackbarService.showInformation(`${this.nodeData.displayName} value saved in temporary changes`);
            } catch (error) {
              event.target.value='';
              this.loadingDialogService.closeLoading();
              this.snackbarService.showError(`Error to upload "${file.name}"\n ${error} `);
            }
          };
        } else {
          event.target.value='';
          this.loadingDialogService.closeLoading();
          let sizeGigaOctet = file.size/1024/1024/1024;
          let unity ="";
          if (sizeGigaOctet > 1) {
            unity = "Go";
          } else {
            sizeGigaOctet = sizeGigaOctet * 1024;
            unity = "Mo";
          }
          this.snackbarService.showError(`Error to upload "${file.name}". Its size ${sizeGigaOctet.toFixed(2)}${unity} is bigger than ${maxByteSize/(1024 * 1024 * 1024)}Go`);
         }               
      }
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
    const ontologyParameter = this.ontologyService.getParameter(this.nodeData.variableKey);
    if (ontologyParameter !== null
      && ontologyParameter !== undefined) {
      if (ontologyParameter.label !== null
        && ontologyParameter.label !== undefined) {
        name = ontologyParameter.label;
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
      /**
       * Changes 07/09/2022
       * Change the check regarding type and subtype descriptor to handle correctly data that must be not be manage as csv stream
       * - type is check regarding main type, here list
       * - no csv management require a maximum nested level of 1 (so simple list and not list of list etc..
       * - contain data type must string or float, or int, other are too complex to be handled as json)
       */
      if (
          (
            this.isListType && this.nodeData.subTypeDrescriptorNestedLevelCount === 1  &&
            ['string', 'float', 'int'].includes(this.nodeData.subTypeDescriptorValue)
          ) ||
          (this.isArrayType && (this.nodeData.value === null && updateParameter === null))
          ) {
        this.dialogRef = this.dialog.open(SpreadsheetComponent, {
          disableClose: true,
          data: spreadsheetDialogData
        });
        this.dialogRef.afterClosed().subscribe((result) => {
          if (result.cancel === false) {
            this.stateUpdate.emit();
          }
        });
        this.loadingDialogService.closeLoading();
      } else {
        if (updateParameter !== null) { // Temporay file in local storage
          spreadsheetDialogData.file = TypeConversionTools.b64StringToBlob(updateParameter.newValue);
          this.dialogRef = this.dialog.open(SpreadsheetComponent, {
            disableClose: true,
            data: spreadsheetDialogData
          });
          this.dialogRef.afterClosed().subscribe((result) => {
            if (result.cancel === false) {
              this.stateUpdate.emit();
            }
          });
          this.loadingDialogService.closeLoading();
        } else { // File in distant server
          this.studyCaseMainService.getFile(this.nodeData.identifier).subscribe({
            next: (file) => {
              spreadsheetDialogData.file = new Blob([file]);
              this.dialogRef = this.dialog.open(SpreadsheetComponent, {
                disableClose: true,
                data: spreadsheetDialogData
              });
              this.dialogRef.afterClosed().subscribe((result) => {
                if (result.cancel === false) {
                  this.stateUpdate.emit();
                }
              });
              this.loadingDialogService.closeLoading();
            },
            error: (errorReceived) => {
              const error = errorReceived as SoSTradesError;
              this.loadingDialogService.closeLoading();
              if (error.redirect) {
                this.snackbarService.showError(error.description);
              } else {
                this.snackbarService.showError('Error loading csv file : ' + error.description);
              }
            }
          });
        }
      }
    }
  }

  onClickDownload() {
    let name = '';

    if (this.ontologyService.getParameter(this.nodeData.variableName) !== null
      && this.ontologyService.getParameter(this.nodeData.variableName) !== undefined) {
      if (this.ontologyService.getParameter(this.nodeData.variableName).label !== null
        && this.ontologyService.getParameter(this.nodeData.variableName).label !== undefined) {
        name = this.ontologyService.getParameter(this.nodeData.variableName).label;
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
    this.studyCaseMainService.getFile(this.nodeData.identifier).subscribe({
      next: (file) => {
        const fileToDownload = new Blob([file], { type: 'text/csv' });
    
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(fileToDownload);
        downloadLink.setAttribute('download', fileName + '.csv');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.parentNode.removeChild(downloadLink);
        this.loadingDialogService.closeLoading();
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.loadingDialogService.closeLoading();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading csv file : ' + error.description);
        }
      }
    });
  }


}

