import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Routing } from 'src/app/models/routing.model';
import { HeaderService } from 'src/app/services/hearder/header.service';

@Component({
  selector: 'app-study-case-management-container',
  templateUrl: './study-case-management-container.component.html',
  styleUrls: ['./study-case-management-container.component.scss']
})
export class StudyCaseManagementContainerComponent implements OnInit {

  public index: number;

  constructor(
    private router: Router,
    private location: Location,
    private headerService: HeaderService
  ) {
    this.index = 0;
  }

  ngOnInit(): void {
    this.headerService.onChangeIndexTab.subscribe(result => {
      this.index = result;
    });
    if (this.router.url.includes(Routing.REFERENCE_MANAGEMENT)) {
      this.index = 1;
    } else {
      this.index = 0;
    }
  }

  selectedTabChanged(event) {

    let fragment;
    switch (event.index) {
      case 0:
        fragment = Routing.STUDY_CASE;
        break;
      case 1:
        fragment = Routing.REFERENCE_MANAGEMENT;
        break;
      default:
        fragment = Routing.STUDY_CASE;
        break;
    }
    this.index = event.index;
    this.location.go(
      this.router.createUrlTree([Routing.STUDY_MANAGEMENT]).toString() + '/' + fragment);
  }
}
