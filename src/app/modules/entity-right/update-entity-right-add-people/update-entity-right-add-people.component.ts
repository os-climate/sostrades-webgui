import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Inject, OnInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UpdateEntityRightAddPeopleDialogData } from 'src/app/models/dialog-data.model';
import { EntityRight, EntityRights, EntityType } from 'src/app/models/entity-right.model';
import { EntityRightService } from 'src/app/services/entity-right/entity-right.service';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { AlhpabetCssClassTools } from 'src/app/tools/alphabet-css-class.tool';


@Component({
  selector: 'app-update-entity-right-add-people',
  templateUrl: './update-entity-right-add-people.component.html',
  styleUrls: ['./update-entity-right-add-people.component.scss']
})
export class UpdateEntityRightAddPeopleComponent implements OnInit {

  public selectable = true;
  public removable = true;
  public selectedRight: number;
  public hasChangesToSave: boolean;

  public alphabetTool = AlhpabetCssClassTools.getCssClassForLetter;
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  public get entityRightType(): typeof EntityType {
    return EntityType;
  }

  public entityCtrl = new FormControl();
  public filteredEntities: Observable<EntityRight[]>;

  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private entityRightService: EntityRightService,
    private loadingDialogService: LoadingDialogService,
    private snackbarService: SnackbarService,
    public dialogRef: MatDialogRef<UpdateEntityRightAddPeopleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateEntityRightAddPeopleDialogData,
  ) {
    if (this.data.availableRights.length > 0) {
      this.selectedRight = this.data.availableRights[0].id;
    }
    this.hasChangesToSave = true;
  }

  ngOnInit() {

    this.filteredEntities = this.entityCtrl.valueChanges.pipe(
      map((itemSearched: string | null | EntityRight) => itemSearched
        ? this._filter(itemSearched)
        : this.data.entitiesAvailable.slice()));
  }

  remove(entity: EntityRight): void {
    const index = this.data.selectedEntities.indexOf(entity);

    if (index >= 0) {
      this.data.selectedEntities.splice(index, 1);
      this.data.entitiesAvailable.push(entity);
      this._sortAlphaList(this.data.entitiesAvailable);
    }

    if (this.data.selectedEntities.length === 0) {
      this.hasChangesToSave = false;
    } else {
      this.hasChangesToSave = true;
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.data.selectedEntities.push(event.option.value);
    this.hasChangesToSave = true;
    this.data.entitiesAvailable.splice(this.data.entitiesAvailable.indexOf(event.option.value), 1);
    this._sortAlphaList(this.data.entitiesAvailable);
    this.userInput.nativeElement.value = '';
    this.entityCtrl.setValue(null);
  }

  private _filter(itemSearched: string | EntityRight): EntityRight[] {

    let filteredList: EntityRight[] = [];

    if (typeof (itemSearched) === 'string') {
      filteredList = this.data.entitiesAvailable.filter(x => x.entityObject.search(itemSearched));
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
    this.dialogRef.close(this.data);
    this.loadingDialogService.showLoading(`Adding users and groups rights. Please wait.`);

    const updatedEntityRight = new EntityRights(this.data.ressourceId, this.data.resourceType, this.data.availableRights, []);

    this.data.selectedEntities.forEach(entity => {
      entity.selectedRight = this.selectedRight;
      updatedEntityRight.entitiesRights.push(entity);
    });

    this.entityRightService.applyEntitiesChanges(updatedEntityRight).subscribe(res => {
      this.loadingDialogService.closeLoading();
      this.snackbarService.showInformation(`Adding Users and groups rights has been successfully done.`);
    }, errorReceived => {
      this.loadingDialogService.closeLoading();
      this.snackbarService.showError(errorReceived.description);
    });
  }
  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}
