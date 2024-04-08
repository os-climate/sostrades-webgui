import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogoPath } from 'src/app/models/logo-path.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';



@Component({
  selector: 'app-login-information-dialog',
  templateUrl: './login-information-dialog.component.html',
  styleUrls: ['./login-information-dialog.component.scss']
})
export class LoginInformationDialogComponent implements OnInit {
  public sostradesInfos: boolean;
  public githubInfos:boolean;
  public logoPath = LogoPath;
  


  constructor(
    public appDataService : AppDataService,
    public dialogRef: MatDialogRef<LoginInformationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
      this.sostradesInfos = false;
      this.githubInfos = false;
     }

  ngOnInit(): void {
    if (this.data.logoPath == this.logoPath.GITHUB_LOGO_PATH) {
      this.githubInfos = true;
      this.dialogRef.updateSize("530px", "450px");
    }
    else if (this.data.logoPath == this.logoPath.SOS_TRADES_LOGO_BLACK_PATH) {
      this.sostradesInfos = true;
    }
  }
  onClickOk() {
    this.dialogRef.close();
  }
  
}
