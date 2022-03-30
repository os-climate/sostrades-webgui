import { Component, OnInit } from '@angular/core';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-welcom-page',
  templateUrl: './welcom-page.component.html',
  styleUrls: ['./welcom-page.component.scss']
})
export class WelcomPageComponent implements OnInit {

  public username: string;
  public hasAccessToAdmin: boolean;
  public hasAccessToStudy: boolean;
  public favoriteStudies : boolean


  constructor(    
    public studyCaseDataService: StudyCaseDataService,
    private userService: UserService,
  
      ) { 
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
  }
}