import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccessRight } from 'src/app/models/access-right.model';
import { UpdateEntityRightDialogData, UpdateEntityRightAddPeopleDialogData } from 'src/app/models/dialog-data.model';
import { EntityRight, EntityType, EntityRights } from 'src/app/models/entity-right.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { EntityRightService } from 'src/app/services/entity-right/entity-right.service';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user/user.service';
import { AlhpabetCssClassTools } from 'src/app/tools/alphabet-css-class.tool';
import { UpdateEntityRightAddPeopleComponent } from '../update-entity-right-add-people/update-entity-right-add-people.component';

@Component({
  selector: 'app-update-entity-right',
  templateUrl: './update-entity-right.component.html',
  styleUrls: ['./update-entity-right.component.scss']
})
export class UpdateEntityRightComponent implements OnInit {

  public entityRights: EntityRights;
  public entitiesSelected: EntityRight[];
  public entitiesAvailable: EntityRight[];
  public availableRights: AccessRight[];
  public selectableRights: AccessRight[];
  public filteredEntities: Observable<EntityRight[]>;

  public isLoading: boolean;
  public entitiesSelectedHasChanges: boolean;

  public alphabetTool = AlhpabetCssClassTools.getCssClassForLetter;
  public entityCtrl = new FormControl();
  public displayedColumns = ['entity', 'action'];
  public dataSource = new MatTableDataSource<EntityRight>();

  public get entityRightType(): typeof EntityType {
    return EntityType;
  }

  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private dialog: MatDialog,
    public userService: UserService,
    private entityRightService: EntityRightService,
    private groupDataService: GroupDataService,
    private loadingDialogService: LoadingDialogService,
    public dialogRef: MatDialogRef<UpdateEntityRightComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateEntityRightDialogData,
    private snackbarService: SnackbarService) {
    this.entitiesSelected = [];
    this.entitiesAvailable = [];
    this.isLoading = true;
    this.entitiesSelectedHasChanges = false;
    this.availableRights = [];
    this.selectableRights = [];
  }

  ngOnInit(): void {

    this.data.getEntitiesRightsFunction.subscribe(entityRights => {

      this.entityRights = entityRights;
      this.entitiesSelected = this.entityRights.entitiesRights;

      if (this.entityRights.availableRights !== undefined
        && this.entityRights.availableRights !== null
        && this.entityRights.availableRights.length > 0) {
        this.entityRights.availableRights.forEach(right => {
          this.availableRights.push(right);
          if (right.selectable) {
            this.selectableRights.push(right);
          }
        });
      }

      this.selectableRights.push(new AccessRight(null, 'Remove', '', true));
      this._setAvailableEntities();

      this.filteredEntities = this.entityCtrl.valueChanges.pipe(
        map((itemSearched: string | null | EntityRight) => itemSearched
          ? this._filter(itemSearched)
          : this.entitiesAvailable.slice()));

      this._sortAlphaList(this.entitiesSelected);
      this._sortAlphaList(this.entitiesAvailable);
      this.dataSource = new MatTableDataSource<EntityRight>(this.entitiesSelected);
      this.isLoading = false;

    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      this.data.cancel = true;
      this.dialogRef.close(null);
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError(
          `Error loading users and group authorized for this ${this.data.resourceType}: ${error.description}`);
      }
    });
  }

  _setAvailableEntities() {

    // Refreshing user and group list in case new or removed groups
    const loadedAllGroups = this.groupDataService.getUserGroups(true);
    const loadedAllUsers = this.userService.loadAllUsers();


    combineLatest([loadedAllGroups, loadedAllUsers]).subscribe(res => {
      this.groupDataService.allGroups.forEach(grp => {
        if (this.entitiesSelected.filter(x => x.entityObject.id === grp.id && x.entityType === EntityType.GROUP).length === 0) {
          this.entitiesAvailable.push(new EntityRight(-1, EntityType.GROUP, grp, null, false));
        }
      });

      this.userService.allUsers.forEach(usr => {
        if (this.entitiesSelected.filter(x => x.entityObject.id === usr.id && x.entityType === EntityType.USER).length === 0) {
          this.entitiesAvailable.push(new EntityRight(-1, EntityType.USER, usr, null, false));
        }
      });
    });
  }

  selected(event: MatAutocompleteSelectedEvent) {
    const entityAddDialogData = new UpdateEntityRightAddPeopleDialogData();
    entityAddDialogData.ressourceId = this.data.ressourceId;
    entityAddDialogData.resourceType = this.data.resourceType;
    entityAddDialogData.ressourceName = this.data.ressourceName;
    entityAddDialogData.selectedEntities = [event.option.value];
    entityAddDialogData.entitiesAvailable = this.entitiesAvailable.filter(x => x !== event.option.value);
    entityAddDialogData.availableRights = this.availableRights.filter(x => x.selectable === true);

    this.entityCtrl.reset();

    const dialogRef = this.dialog.open(UpdateEntityRightAddPeopleComponent, {
      disableClose: true,
      data: entityAddDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const entityAddDialogDataResult = result as UpdateEntityRightAddPeopleDialogData;

      if ((entityAddDialogDataResult !== null) && (entityAddDialogDataResult !== undefined)) {
        if (entityAddDialogDataResult.cancel !== true) {
          this.dialogRef.close(null);
        }
      }
    });
  }

  rightChange() {
    let hasRightChanges = false;
    this.entitiesSelected.forEach(entity => {
      if (entity.selectedRight !== entity.oldRight) {
        hasRightChanges = true;
      }
    });
    this.entitiesSelectedHasChanges = hasRightChanges;
  }

  private _filter(itemSearched: string | EntityRight): EntityRight[] {

    let filteredList: EntityRight[] = [];

    if (typeof (itemSearched) === 'string') {
      filteredList = this.entitiesAvailable.filter(x => x.entityObject.search(itemSearched));
      this._sortAlphaList(filteredList);
      return filteredList;

    } else {

      this._sortAlphaList(filteredList);
      return filteredList;
    }
  }

  private _sortAlphaList(list: any) {
    list.sort((a, b) => {
      if (a.entityObject.title < b.entityObject.title) { return -1; }
      if (a.entityObject.title > b.entityObject.title) { return 1; }
      return 0;
    });
  }


  submitForm() {

    this.data.cancel = false;

    const updatedEntityRight = new EntityRights(this.data.ressourceId, this.data.resourceType, this.entityRights.availableRights, []);

    this.entitiesSelected.forEach(entity => {
      if (entity.selectedRight !== entity.oldRight) {
        updatedEntityRight.entitiesRights.push(entity);
      }
    });
    this.dialogRef.close(null);
    this.loadingDialogService.showLoading(`Updating users and groups rights. Please wait.`);

    this.entityRightService.applyEntitiesChanges(updatedEntityRight).subscribe({
      next: (res) => {
        this.loadingDialogService.closeLoading();
        this.snackbarService.showInformation(`Users and groups rights have been successfully updated.`);
      },
      error: (errorReceived) => {
        this.loadingDialogService.closeLoading();
        this.snackbarService.showError(errorReceived.description);
      }
    });
  }

  getLockedRight(rightId) {
    if (this.availableRights.filter(x => x.id === rightId)[0] !== null
      && this.availableRights.filter(x => x.id === rightId)[0] !== undefined) {
      return this.availableRights.filter(x => x.id === rightId)[0].accessRight;
    } else {
      return 'Undefined right';
    }

  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(null);
  }

}
