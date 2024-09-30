import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PodSettingsDialogData } from 'src/app/models/dialog-data.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FlavorsService } from 'src/app/services/flavors/flavors.service';

@Component({
  selector: 'app-pod-settings',
  templateUrl: './pod-settings.component.html',
  styleUrls: ['./pod-settings.component.scss']
})
export class PodSettingsComponent implements OnInit {
  public settingsForm: FormGroup;
  public reload:boolean;
  public flavorsList: string[];
  public displayedColumns =['FLAVOR', 'CPU', 'MEMORY'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PodSettingsDialogData,
    public dialogRef: MatDialogRef<PodSettingsComponent>,
  ) {
    this.flavorsList = [];
    this.reload = false;
  }

  ngOnInit(): void {
    this.settingsForm = new FormGroup({
      flavor: new FormControl("", [Validators.required])
    })
    if (this.data.flavorsList !== null && this.data.flavorsList !== undefined && this.data.flavorsList.length > 0) {

      this.flavorsList = this.data.flavorsList;
      //select flavor if it is already set for the study
      if (this.data.flavor !== null && this.data.flavor !== undefined && this.flavorsList.includes(this.data.flavor)) {
        this.settingsForm.patchValue({
          flavor: this.data.flavor
        });
        this.settingsForm.value.flavor = this.data.flavor;
      }
      else{
        this.settingsForm.patchValue({
          flavor: this.flavorsList[0],
        });
        this.settingsForm.value.flavor = this.flavorsList[0];
      }
            
    }
          
  }

  submitForm() {
    this.data.cancel = false;
   
    this.data.cancel = false;
    this.data.flavor = this.settingsForm.value.flavor;
    this.data.doReload = this.reload;
    this.dialogRef.close(this.data);
   
    
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}
