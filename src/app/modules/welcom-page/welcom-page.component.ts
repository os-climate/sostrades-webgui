import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudyFavorite } from 'src/app/models/study-case-favorite';
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
  public favoriteStudy : StudyFavorite;

  constructor(    
    public studyCaseDataService: StudyCaseDataService,
    private userService: UserService,
    private router: Router,
      ) { }

  ngOnInit(): void {

    this.username = this.userService.getFirstname();
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
   this.getStudyOfFavoriteStudy()
  }

  getStudyOfFavoriteStudy(){

    this.favoriteStudy = new StudyFavorite
     this.studyCaseDataService.getStudyOfFavoriteStudybyUser(this.favoriteStudy.user_id).subscribe(
     (studies) => {
        this.studyCaseDataService.favoriteStudy = studies ;
      });
  }
}
