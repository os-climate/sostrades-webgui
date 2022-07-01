import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationTitle } from 'src/app/models/navigation-title.model';
import { Routing } from 'src/app/models/routing.model';
import { HeaderService } from 'src/app/services/hearder/header.service';

@Component({
  selector: 'app-models-container',
  templateUrl: './models-container.component.html',
  styleUrls: ['./models-container.component.scss']
})
export class ModelsContainerComponent implements OnInit, OnDestroy {

  public index: number;
  public showModelStatus: boolean;
  public showProcessManagement: boolean;
  public showOntologyparameters: boolean;
  public processesTitle: string;
  public modelsStatusTitle: string;
  public parametersTitle: string;
  private subscription: Subscription;

  constructor(
    private router: Router,
    private location: Location,
    private headerService: HeaderService,
  ) {
    this.processesTitle = NavigationTitle.PROCESS;
    this.modelsStatusTitle = NavigationTitle.MODELS_STATUS;
    this.parametersTitle = NavigationTitle.ONTOLOGY_PARAMETERS;
    this.subscription = null;
   }

  ngOnInit(): void {
    this.subscription = this.headerService.onChangeIndexTab.subscribe(result => {
      this.index = result;
    });

    if (this.router.url.includes(Routing.PROCESSES)) {
      this.index = 1;
      this.headerService.changeTitle(NavigationTitle.PROCESS);
    } else if (this.router.url.includes(Routing.ONTOLOGY_PARAMETERS)) {
      this.index = 2;
      this.headerService.changeTitle(NavigationTitle.ONTOLOGY_PARAMETERS);
    } else {
      this.index = 0;
      this.headerService.changeTitle(NavigationTitle.MODELS_STATUS);
    }
    this.setVisibility(this.index);
  }

  ngOnDestroy(): void {
      if ((this.subscription !== null) && (this.subscription !== undefined)) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
  }

  onSelectedTabChange(event: MatTabChangeEvent) {

    let fragment;

    switch (event.index) {
      case 0:
        fragment = Routing.MODELS_STATUS;
        this.headerService.changeTitle(NavigationTitle.MODELS_STATUS);
        break;
      case 1:
        fragment = Routing.PROCESSES;
        this.headerService.changeTitle(NavigationTitle.PROCESS);
        break;
      case 2:
        fragment = Routing.ONTOLOGY_PARAMETERS;
        this.headerService.changeTitle(NavigationTitle.ONTOLOGY_PARAMETERS);
        break;
      default:
        fragment = Routing.MODELS_STATUS;
        this.headerService.changeTitle(NavigationTitle.MODELS_STATUS);
        break;
    }
    this.index = event.index;
    this.setVisibility(this.index);
    this.location.go(
      this.router.createUrlTree([Routing.ONTOLOGY]).toString() + '/' + fragment);
  }

  private setVisibility(tabIndex: number) {

    this.showModelStatus = false;
    this.showProcessManagement = false;
    this.showOntologyparameters = false;

    switch (tabIndex) {
      case 0:
        this.showModelStatus = true;
        break;
      case 1:
        this.showProcessManagement = true;
        break;
      case 2:
        this.showOntologyparameters = true;
        break;
      default:
        this.showModelStatus = true;
        break;
    }
  }
}
