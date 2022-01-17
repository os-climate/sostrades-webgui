import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { Subscription } from 'rxjs';
import { LoadedStudy } from 'src/app/models/study.model';
import { Router } from '@angular/router';

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

  onClickStudyManagement() {
    this.router.navigate(['/']);
  }

  onClickTreeview() {
    this.router.navigate(['/study-workspace']);
  }

  onClickModelStatus() {
    this.router.navigate(['/models-status']);
  }

  setTreeviewClass() {
    if (this.studyName.length > 13) {
      return 'treeview-long-title';
    } else {
      return 'treeview-short-title';
    }
  }

  styleZone(zoneSelected: number) {
    if (zoneSelected === 1) {
      if (this.router.url === '/') {
        return 'header-treeview-active';
      }
    } else if (zoneSelected === 2) {
      if (this.router.url === '/study-workspace') {
        if (this.studyName.length > 13) {
          return 'long-title header-treeview-active';
        } else {
          return 'header-treeview-active';
        }

      }
    } else if (zoneSelected === 3) {
      if (this.router.url === '/models-status') {
        return 'header-treeview-active';
      }
    }
  }

  setBorder() {
    if (this.router.url === '/study-workspace') {
      return 'border-treeview-active';
    }
  }

  ngOnDestroy() {
    if (this.onStudyCaseChangeSubscription !== null && (this.onStudyCaseChangeSubscription !== undefined)) {
      this.onStudyCaseChangeSubscription.unsubscribe();
      this.onStudyCaseChangeSubscription = null;
    }
  }

}
