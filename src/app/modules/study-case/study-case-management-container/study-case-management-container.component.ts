import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationTitle, Routing } from 'src/app/models/enumeration.model';
import { HeaderService } from 'src/app/services/hearder/header.service';

@Component({
  selector: 'app-study-case-management-container',
  templateUrl: './study-case-management-container.component.html',
  styleUrls: ['./study-case-management-container.component.scss']
})
export class StudyCaseManagementContainerComponent implements OnInit, OnDestroy {

  public index: number;
  public showStudyManagement: boolean;
  public showReferenceManagement: boolean;
  public studyManagementTitle: string;
  public referenceManagementTitle: string;
  private subscription: Subscription;

  constructor(
    private router: Router,
    private location: Location,
    private headerService: HeaderService
  ) {
    this.index = 0;
    this.subscription = null;
    this.studyManagementTitle = NavigationTitle.STUDY_MANAGEMENT;
    this.referenceManagementTitle = NavigationTitle.REFERENCE_MANAGEMENT;

  }

  ngOnInit(): void {
    this.subscription = this.headerService.onChangeIndexTab.subscribe(result => {
      this.index = result;
    });
    if (this.router.url.includes(Routing.REFERENCE_MANAGEMENT)) {
      this.index = 1;
      this.headerService.changeTitle(NavigationTitle.REFERENCE_MANAGEMENT);
    } else {
      this.index = 0;
      this.headerService.changeTitle(NavigationTitle.STUDY_MANAGEMENT);
    }
    this.setVisibility(this.index);
  }

  ngOnDestroy(): void {
    if ((this.subscription !== null) && (this.subscription !== undefined)) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
}

  selectedTabChanged(event: MatTabChangeEvent) {

    let fragment;
    switch (event.index) {
      case 0:
        fragment = Routing.STUDY_MANAGEMENT;
        this.headerService.changeTitle(NavigationTitle.STUDY_MANAGEMENT);
        break;
      case 1:
        fragment = Routing.REFERENCE_MANAGEMENT;
        this.headerService.changeTitle(NavigationTitle.REFERENCE_MANAGEMENT);

        break;
      default:
        fragment = Routing.STUDY_CASE;
        this.headerService.changeTitle(NavigationTitle.STUDY_MANAGEMENT);

        break;
    }
    this.index = event.index;
    this.setVisibility(this.index);

    // navigate only if the router url is not already up-to-date
    if (!((this.router.url.includes(Routing.STUDY_CASE)) && (this.router.url.includes(fragment)))) {
      this.router.navigate([Routing.STUDY_CASE, fragment]);
    }
   }

   private setVisibility(tabIndex: number) {

    this.showStudyManagement = false;
    this.showReferenceManagement = false;

    switch (tabIndex) {
      case 0:
        this.showStudyManagement = true;
        break;
      case 1:
        this.showReferenceManagement = true;
        break;
      default:
        this.showStudyManagement = true;
        break;
    }
  }
}
