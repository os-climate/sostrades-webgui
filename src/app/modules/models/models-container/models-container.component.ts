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
  public showOntolgyMain: boolean;
  public processesTitle: string;
  public modelsStatusTitle: string;
  public parametersTitle: string;
  public ontologyMainTitle: string;
  private subscription: Subscription;

  constructor(
    private router: Router,
    private location: Location,
    private headerService: HeaderService,
  ) {
    this.processesTitle = NavigationTitle.PROCESS;
    this.modelsStatusTitle = NavigationTitle.MODELS;
    this.parametersTitle = NavigationTitle.ONTOLOGY_PARAMETERS;
    this.ontologyMainTitle = NavigationTitle.ONTOLOGY_MAIN;
    this.subscription = null;
   }

  ngOnInit(): void {
    this.subscription = this.headerService.onChangeIndexTab.subscribe(result => {
      this.index = result;
    });
    if (this.router.url.includes(Routing.MODELS)) {
      this.index = 1;
      this.headerService.changeTitle(NavigationTitle.MODELS);
    } else if (this.router.url.includes(Routing.PROCESSES)) {
      this.index = 2;
      this.headerService.changeTitle(NavigationTitle.PROCESS);
    } else if (this.router.url.includes(Routing.ONTOLOGY_PARAMETERS)) {
      this.index = 3;
      this.headerService.changeTitle(NavigationTitle.ONTOLOGY_PARAMETERS);
    } else {
      this.index = 0;
      this.headerService.changeTitle(NavigationTitle.ONTOLOGY_MAIN);
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
        fragment = Routing.ONTOLOGY_MAIN;
        this.headerService.changeTitle(NavigationTitle.ONTOLOGY_MAIN);
        break;
      case 1:
        fragment = Routing.MODELS;
        this.headerService.changeTitle(NavigationTitle.MODELS);
        break;
      case 2:
        fragment = Routing.PROCESSES;
        this.headerService.changeTitle(NavigationTitle.PROCESS);
        break;
      case 3:
        fragment = Routing.ONTOLOGY_PARAMETERS;
        this.headerService.changeTitle(NavigationTitle.ONTOLOGY_PARAMETERS);
        break;
      default:
        fragment = Routing.ONTOLOGY_MAIN;
        this.headerService.changeTitle(NavigationTitle.ONTOLOGY_MAIN);
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
    this.showOntolgyMain = false;

    switch (tabIndex) {
      case 0:
        this.showOntolgyMain = true;
        break;
      case 1:
        this.showModelStatus = true;
        break;
      case 2:
        this.showProcessManagement = true;
        break;
      case 3:
        this.showOntologyparameters = true;
        break;
      default:
        this.showOntolgyMain = true;
        break;
    }
  }
}
