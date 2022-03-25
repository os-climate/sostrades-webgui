import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { Subscription } from 'rxjs';
import { LoadedStudy } from 'src/app/models/study.model';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { NavigationTitle } from 'src/app/models/navigation-title.model';
import { Routing } from 'src/app/models/routing.model';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {

  private onStudyCaseChangeSubscription: Subscription;

  public studyName: string;
  public isLoadedStudy: boolean;

  constructor(
    public studyCaseDataService: StudyCaseDataService,
    private headerService : HeaderService,
    private router: Router) {
    this.onStudyCaseChangeSubscription = null;
    this.studyName = '';
    this.isLoadedStudy = false;
  }

  ngOnInit() {
    this.onStudyCaseChangeSubscription = this.studyCaseDataService.onStudyCaseChange.subscribe(loadedStudyData => {
      const loadedStudy = loadedStudyData as LoadedStudy;
      if (loadedStudy !== null && loadedStudy !== undefined) {
        this.studyName = loadedStudy.studyCase.name;
        this.isLoadedStudy = true;
        this.onClickTreeview();
      } else {
        this.studyName = '';
        this.isLoadedStudy = false;
      }
    });
  }

  checkTitleLength(studyName: string) {
    if (studyName.length > 13) {
      return '.long-title';
    }
  }

  onClickTreeview() {
    this.router.navigate([Routing.STUDY_WORKSPACE]);
    this.headerService.changeTitle(NavigationTitle.STUDY_WORKSPACE)
    }

  setTreeviewClass() {
    if (this.studyName.length > 13) {
      return 'treeview-long-title';
    } else {
      return 'treeview-short-title';
    }
  }

  ngOnDestroy() {
    if (this.onStudyCaseChangeSubscription !== null && (this.onStudyCaseChangeSubscription !== undefined)) {
      this.onStudyCaseChangeSubscription.unsubscribe();
      this.onStudyCaseChangeSubscription = null;
    }
  }

}
