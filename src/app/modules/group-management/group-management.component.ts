import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { MatTableDataSource } from '@angular/material/table';
import { Group, LoadedGroup } from 'src/app/models/group.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { EditionDialogData, FilterDialogData, UpdateEntityRightDialogData, ValidationDialogData } from 'src/app/models/dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MatSort } from '@angular/material/sort';
import { EntityResourceRights } from 'src/app/models/entity-right.model';
import { UpdateEntityRightComponent } from '../entity-right/update-entity-right/update-entity-right.component';
import { EntityRightService } from 'src/app/services/entity-right/entity-right.service';
import { HostListener } from '@angular/core';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';
import { UserService } from 'src/app/services/user/user.service';
import { UserApplicationRight } from 'src/app/models/user.model';
import { ColumnName, Routing } from 'src/app/models/enumeration.model';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';
import { DialogEditionName } from 'src/app/models/enumeration.model';
import { EditionFormDialogComponent } from 'src/app/shared/edition-form-dialog/edition-form-dialog.component';
import { FilterTableService } from 'src/app/services/filter-table/filter-table.service';


@Component({
  selector: 'app-group-management',
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.scss']
})

export class GroupManagementComponent implements OnInit {

  public createGroupForm: FormGroup;
  public checkboxConfidential: boolean;
  public user: UserApplicationRight;
  public isLoading: boolean;
  public setDefaultGroup: boolean;
  public columnName = ColumnName;
  public displayedColumnsMyGroups = [
    ColumnName.NAME,
    ColumnName.DESCRIPTION,
    ColumnName.DEFAULT,
    ColumnName.CONFIDENTIAL,
    ColumnName.USERS,
    ColumnName.EDIT,
    ColumnName.DELETE
  ];
  public colummnsFilter = [
    ColumnName.ALL_COLUMNS,
    ColumnName.NAME,
    ColumnName.DESCRIPTION
  ];
  public columnValuesDict = new Map <ColumnName, string[]>();
  public colummnsDictForTitleSelection = new Map <ColumnName, string>();
  public loadedGroups: LoadedGroup[];
  public dataSourceMyGroups = new MatTableDataSource<LoadedGroup>();
  private filterDialog = new FilterDialogData();


  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceMyGroups.sort = v;
  }

  @ViewChild('filter', { static: true }) private filterElement: ElementRef;

  @HostListener('document:keydown.control.f', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    // Check group component is visible
    if (this.elementRef.nativeElement.offsetParent !== null) {
      // Set focus and select all text in filter
      this.filterElement.nativeElement.focus();
      this.filterElement.nativeElement.setSelectionRange(0, this.groupDataService.groupManagementFilter.length);
      event.preventDefault();
    }
  }

  constructor(
    private elementRef: ElementRef,
    private dialog: MatDialog,
    public groupDataService: GroupDataService,
    private entityRightService: EntityRightService,
    private userService: UserService,
    private loadingDialogService: LoadingDialogService,
    private snackbarService: SnackbarService,
    private filterTableService: FilterTableService
  ) {
    this.isLoading = true;
    this.checkboxConfidential = false;
    this.setDefaultGroup = false;
    this.user = null;
  }

  ngOnInit(): void {

    this.isLoading = true;
    this.createGroupForm = new FormGroup({
      groupName: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      groupDescription: new FormControl('', [Validators.required])
    });

    this.loadGroupManagementData(false);
  }

  loadGroupManagementData(refresh: boolean) {

    this.isLoading = true;
    this.dataSourceMyGroups = new MatTableDataSource<LoadedGroup>(null);

    // Get current user
    this.userService.getCurrentUser().subscribe(currentUser => {
      this.user = currentUser;
    });

    this.groupDataService.getUserGroups(refresh).subscribe({
      next: (groups) => {
        this.loadedGroups = groups;
        this.dataSourceMyGroups = new MatTableDataSource<LoadedGroup>(this.loadedGroups);
        this.columnValuesDict = this.filterTableService.setColumnValuesDict(this.displayedColumnsMyGroups);
        this.colummnsDictForTitleSelection = this.filterTableService.setcolummnsDictForTitleSelection(this.colummnsFilter);
        this.dataSourceMyGroups.sortingDataAccessor = (item, property) =>   
          typeof item[property] === 'string' ? item[property].toLowerCase() : item[property];
        this.dataSourceMyGroups.sort = this.sort;
        // this.onFilterChange();
        
        this.isLoading = false;
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          // this.onFilterChange();
          this.isLoading = false;
          this.snackbarService.showError('Error loading user groups list : ' + error.description);
        }
      }
    });
  }    


  createGroup() {

    const groupName = this.createGroupForm.value.groupName;
    this.loadingDialogService.showLoading(`Creation of the Group "${groupName}". Please wait.`);
    // eslint-disable-next-line max-len
    this.groupDataService.createGroup(this.createGroupForm.value.groupName, this.createGroupForm.value.groupDescription, this.checkboxConfidential).subscribe({
      next: (res) => {
        const newGroup: Group = res as Group;
    
        const newLoadedGroup = new LoadedGroup(res, true, false, false);
        this.loadedGroups.push(newLoadedGroup);
        this.dataSourceMyGroups = new MatTableDataSource<LoadedGroup>(this.loadedGroups);
        // Reset fields
        this.checkboxConfidential = false;
        this.createGroupForm.reset();
    
        this.snackbarService.showInformation(`Group "${groupName}" has been successfully created.`);
    
        // Reloading user groups list
        this.loadGroupManagementData(true);
    
        this.loadingDialogService.closeLoading();
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.loadingDialogService.closeLoading();
          this.snackbarService.showError(error.description);
        } else {
          this.onFilterChange();
          this.createGroupForm.controls.groupName.reset();
          this.loadingDialogService.closeLoading();
          this.snackbarService.showError('Error creating group : ' + error.description);
        }
      }
    });
  }    

  public hasError = (controlName: string, errorName: string) => {
    return this.createGroupForm.controls[controlName].hasError(errorName);
  }

  updateGroup(event: MouseEvent, loadedGroup: LoadedGroup) {

    const dialogData: EditionDialogData = new EditionDialogData();
    dialogData.editionDialogName = DialogEditionName.EDITION_GROUP;
    dialogData.name = loadedGroup.group.name;
    dialogData.description = loadedGroup.group.description;

    const dialogRef = this.dialog.open(EditionFormDialogComponent, {
      disableClose: false,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const editGroupData: EditionDialogData = result as EditionDialogData;

      if (editGroupData !== null && editGroupData !== undefined) {
        if (editGroupData.cancel === false) {
          this.loadingDialogService.showLoading(`Updating group (${editGroupData.name}). Please wait`);

          this.groupDataService.updateGroup(loadedGroup.group.id, editGroupData.name, editGroupData.description).subscribe({
            next: (_) => {
              this.loadingDialogService.closeLoading();
              this.snackbarService.showInformation(`Group (${editGroupData.name}) has been successfully updated `);
              this.loadGroupManagementData(true);
            },
            error: (errorReceived) => {
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(error.description);
              } else {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(`Error updating group: ${error.description}`);
              }
            }
          });
        }
      }
    });
  }

  deleteGroup(group: Group) {

    const validationDialogData = new ValidationDialogData();
    // eslint-disable-next-line max-len
    validationDialogData.message = `You are about to delete the Group (${group.name}). This will also delete the studies in this group, are you sure you want to proceed ?`;
    validationDialogData.buttonOkText = 'Delete';

    const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,
      data: validationDialogData
    });

    dialogRefValidate.afterClosed().subscribe(result => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if ((validationData !== null) && (validationData !== undefined)) {
        if (validationData.cancel === false) {
          this.loadingDialogService.showLoading(`Deletion of the Group (${group.name}). Please wait.`);
          this.groupDataService.deleteGroup(group.id).subscribe({
            next: (res) => {
              this.loadedGroups = this.loadedGroups.filter(x => x.group.id !== group.id);
              this.dataSourceMyGroups = new MatTableDataSource<LoadedGroup>(this.loadedGroups);
          
              // Reloading user groups list
              this.snackbarService.showInformation(`Group (${group.name}) has been succesfully deleted`);
              this.loadGroupManagementData(true);
              this.loadingDialogService.closeLoading();
            },
            error: (errorReceived) => {
              if (errorReceived.redirect === false) {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(errorReceived.description);
              }
            }
          });          
        }
      }
    });
  }

  checkExistingDefaultGroup(group_id: number): boolean {
    if (group_id != null && group_id > 0 && this.user && this.user.user && this.user.user.default_group_id != null) {
      return group_id === this.user.user.default_group_id;
    }
    return false;
  }
  changeDefaultGroup(event: MouseEvent, loadedGroup: LoadedGroup) {

    this.setDefaultGroup = false;
    const userId = this.userService.getCurrentUserId();
    this.userService.changeDefaultGroup(loadedGroup.group.id, userId).subscribe({
      next: (_) => {
        this.user.user.default_group_id = loadedGroup.group.id;
        this.setDefaultGroup = true;
      },
      error: (error) => {
        this.snackbarService.showError(error.description);
        this.setDefaultGroup = true;
      }
    });
  }

  public hasFilter(column: ColumnName): boolean {
    const bool = this.groupDataService.groupSelectedValues.get(column) !== undefined
                && this.groupDataService.groupSelectedValues.get(column) !== null
                && this.groupDataService.groupSelectedValues.get(column).length > 0;
    return bool;
  }


  displayFilterDialog(columnName: ColumnName, event) {
    event.stopPropagation();
    event.preventDefault();
    this.filterDialog.possibleStringValues =  this.setPossibleValueByColumn(columnName);
    this.filterDialog.columnName = columnName;

    // Check if the column has filters selected to send them to the component
    if (this.groupDataService.groupSelectedValues !== null
    && this.groupDataService.groupSelectedValues !== undefined
    && this.groupDataService.groupSelectedValues.size > 0) {
        this.filterDialog.selectedStringValues = this.groupDataService.groupSelectedValues.get(columnName);
    }

    const dialogRef = this.dialog.open(FilterDialogComponent, {
      disableClose: false,
      data: this.filterDialog,
      width: '600px',
      height: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      const filter: FilterDialogData = result as FilterDialogData;
      if ( filter !== undefined && filter !== null && filter.cancel !== true) {
        // Set our dictionnary with the value selected
        this.groupDataService.groupSelectedValues.set(columnName, filter.selectedStringValues);
        // Trigger the dataSourceModelStatus.filterPredicate
        if (this.dataSourceMyGroups.filter.length > 0) {
          // Apply the previous filter
          this.dataSourceMyGroups.filter = this.dataSourceMyGroups.filter;
        } else {
          // Add a string only used to trigger filterPredicate
          this.dataSourceMyGroups.filter = ' ';
        }
      }
    });
  }

  private setPossibleValueByColumn(column: ColumnName): string[] {
    const possibleStringValues = [];
    switch (column) {
      case ColumnName.NAME:
        this.loadedGroups.forEach(group => {
        possibleStringValues.push(group.group.name);
          });
        return possibleStringValues;
        case ColumnName.DESCRIPTION:
          this.loadedGroups.forEach(group => {
            // Verify to  not push duplicate process
            if (!possibleStringValues.includes(group.group.description)) {
              possibleStringValues.push(group.group.description);
              possibleStringValues.sort((a, b) => (a < b ? -1 : 1));
                }
            });
          return possibleStringValues;
      default:
        return possibleStringValues;
      }
    }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.trim().toLowerCase().length > 0) {
      this.dataSourceMyGroups.filter = filterValue.trim().toLowerCase();
    } else {
    // Add a string only used to trigger filterPredicate
      this.dataSourceMyGroups.filter = ' ';
    }
  }

  applyFilterAfterReloading() {
  // Check if there are a filter
  if (this.groupDataService.groupManagementFilter.length > 0 && this.groupDataService.groupManagementFilter.trim() !== '') {
    this.dataSourceMyGroups.filter = this.groupDataService.groupManagementFilter.trim().toLowerCase();
    } else if (this.groupDataService.groupSelectedValues !== null
      && this.groupDataService.groupSelectedValues !== undefined
      && this.groupDataService.groupSelectedValues.size > 0) {
    // Add a string only used to trigger filterPredicate
      this.dataSourceMyGroups.filter = ' ';
    }
  }

  onFilterChange() {
    this.dataSourceMyGroups.filterPredicate = (data: LoadedGroup, filter: string): boolean => {
      let isMatch = true;
      if (filter.trim().length > 0) {
        switch (this.groupDataService.groupManagementColumnFiltered) {
          case ColumnName.NAME:
            isMatch = data.group.name.trim().toLowerCase().includes(filter);
            break;
          case ColumnName.DESCRIPTION:
            isMatch = data.group.description.trim().toLowerCase().includes(filter);
            break;
          default:
            isMatch = data.group.name.trim().toLowerCase().includes(filter) ||
              data.group.description.trim().toLowerCase().includes(filter);
        }
      }
       // Filter with selected values received by FilterDialogComponent
      this.groupDataService.groupSelectedValues.forEach((values , key) => {
        if (values.length > 0) {
          switch (key) {
            case ColumnName.NAME:
              isMatch = isMatch && values.includes(data.group.name);
              break;
            case ColumnName.DESCRIPTION:
              isMatch = isMatch && values.includes(data.group.description);
              break;
          }
        }
      });
      return isMatch;
    };
    this.applyFilterAfterReloading();
  }

  groupAccess(loadedGroup: LoadedGroup) {

    const updateProcessAccessDialogData = new UpdateEntityRightDialogData();
    updateProcessAccessDialogData.ressourceId = loadedGroup.group.id;
    updateProcessAccessDialogData.ressourceName = loadedGroup.group.name;
    updateProcessAccessDialogData.resourceType = EntityResourceRights.GROUP;
    updateProcessAccessDialogData.getEntitiesRightsFunction = this.entityRightService.getGroupEntitiesRights(loadedGroup.group.id);

    const dialogRef = this.dialog.open(UpdateEntityRightComponent, {
      disableClose: true,
      data: updateProcessAccessDialogData
    });
  }
}
