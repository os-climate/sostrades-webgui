import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { UserService } from 'src/app/services/user/user.service';
import { NavigationTitle } from 'src/app/models/navigation-title.model';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { Routing } from 'src/app/models/routing';
import { ContactDialogService } from 'src/app/services/contact-dialog/contact-dialog.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  public username: string;
  public versionDate: string;
  public platform: string;
  public title : string
  public hasAccessToStudyManager: boolean;
  public hasAccessToStudy: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private headerService: HeaderService,
    public contactDialogService : ContactDialogService,
    public studyCaseDataService: StudyCaseDataService,
    public dialog: MatDialog,
    private userService: UserService,
    private appDataService: AppDataService,
    public filterService: FilterService) {

    this.versionDate = '';
    this.platform = '';
    this.title = "";
    this.hasAccessToStudyManager = false;
    this.hasAccessToStudy = false;
  }

  ngOnInit(): void {

    this.username = this.userService.getFullUsername();
    this.hasAccessToStudyManager = this.userService.hasAccessToStudyManager();
    this.hasAccessToStudy = this.userService.hasAccessToStudy();

    this.appDataService.getAppInfo().subscribe(res => {
      if (res !== null && res !== undefined) {
        this.versionDate = res['version'];
        this.platform = res['platform'];
      }
    });

    this.headerService.onChangeTitle.subscribe(result=>{
      this.title = result
    })

    if(this.router.url.includes(Routing.HOME)){
      this.title = NavigationTitle.HOME
    }
    else if(this.router.url.includes(Routing.STUDY_MANAGEMENT)){
      this.title =  NavigationTitle.STUDY_MANAGEMENT
    }
    else if(this.router.url.includes(Routing.MODELS_STATUS)){
      this.title = NavigationTitle.MODEL_STATUS
    }
    else if(this.router.url.includes(Routing.STUDY_WORKSPACE)){
      this.title = NavigationTitle.STUDY_WORKSPACE
    }
    else if(this.router.url.includes(Routing.GROUP_MANAGEMENT)){
      this.title = NavigationTitle.GROUP_MANAGEMENT
    }
    else{
      this.title = NavigationTitle.HOME
    }
  }


  // Welcome page
  onClickWelcomePage() {
    this.router.navigate([Routing.HOME]);
    this.title = NavigationTitle.HOME
  }

  //Study Management
  onClickStudyManagement() {
    this.router.navigate([Routing.STUDY_MANAGEMENT]);
    this.title = NavigationTitle.STUDY_MANAGEMENT
    this.headerService.changeIndexTab(0)

  }

  onClickStudyCase(){
    this.router.navigate([Routing.STUDY_MANAGEMENT,Routing.STUDY_CASE]);
    this.title = NavigationTitle.STUDY_MANAGEMENT
    this.headerService.changeIndexTab(0)

  }

 onClickFromProcess(){
    this.router.navigate([Routing.STUDY_MANAGEMENT,Routing.FROM_PROCESS]);
    this.title = NavigationTitle.STUDY_MANAGEMENT
    this.headerService.changeIndexTab(1)
  }
  
   onClickReferenceManagement(){
    this.router.navigate([Routing.STUDY_MANAGEMENT,Routing.REFERENCE_MANAGEMENT]);
    this.title = NavigationTitle.STUDY_MANAGEMENT
    this.headerService.changeIndexTab(2)
  }

  //Model status
  onClickModelsStatus() {
    this.router.navigate([Routing.MODELS_STATUS]);
    this.title = NavigationTitle.MODEL_STATUS
    this.headerService.changeIndexTab(0)

  }
  onClickModelsLinks(){
    this.router.navigate([Routing.MODELS_STATUS, Routing.MODELS_LINKS]);
    this.title = NavigationTitle.MODEL_STATUS
    this.headerService.changeIndexTab(1)

  }

  // Group Management
  onClickGroupManagement() {
    this.router.navigate([Routing.GROUP_MANAGEMENT]);
    this.title = NavigationTitle.GROUP_MANAGEMENT
  }

  // Contact
  onClickOnContact(){
  this.contactDialogService.openContactDialog()
  }

  logout() {
    this.auth.deauthenticate().subscribe();
  }
}
