import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { UserLevel } from 'src/app/models/user-level.model';
import { UserService } from 'src/app/services/user/user.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public username: string;
  private userLevel: UserLevel;
  public userLevelList: string[];
  public selectedUserlevel: string;
  public versionDate: string;
  public platform: string;
  public hasAccessToAdmin: boolean;
  public hasAccessToStudy: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    public dialog: MatDialog,
    private userService: UserService,
    private appDataService: AppDataService,
    public filterService: FilterService) {
    this.versionDate = '';
    this.platform = '';
    this.userLevel = new UserLevel();
    this.userLevelList = this.userLevel.userLevelList;
    this.hasAccessToAdmin = false;
    this.hasAccessToStudy = false;
  }

  ngOnInit(): void {

    this.username = this.userService.getFullUsername();
    if (this.userService.hasAccessToAdmin()) {
      this.hasAccessToAdmin = true;
    } else {
      this.hasAccessToAdmin = false;
    }
    if (this.userService.hasAccessToStudy()) {
      this.hasAccessToStudy = true;
    } else {
      this.hasAccessToStudy = false;
    }

    this.appDataService.getAppInfo().subscribe(res => {
      if (res !== null && res !== undefined) {
        this.versionDate = res['version'];
        this.platform = res['platform'];
      }
    });

    this.selectedUserlevel = this.userLevelList[this.filterService.filters.userLevel - 1];

  }

  changeUserLevel(newUserLevelValue: number) {
    this.selectedUserlevel = this.userLevelList[newUserLevelValue];
    this.filterService.filters.userLevel = newUserLevelValue + 1; // Userlevel starting at 1
  }

  logout() {
    this.auth.deauthenticate().subscribe();
  }


}
