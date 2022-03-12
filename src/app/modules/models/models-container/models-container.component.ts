import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Routing } from 'src/app/models/routing';
import { HeaderService } from 'src/app/services/hearder/header.service';

@Component({
  selector: 'app-models-container',
  templateUrl: './models-container.component.html',
  styleUrls: ['./models-container.component.scss']
})
export class ModelsContainerComponent implements OnInit {

  public showModelStatusTableContent: boolean;
  public showModelLinksContent: boolean;
  public index : number


  constructor(
    private router: Router,
    private location : Location,
    private headerService : HeaderService,
  ) {
    this.showModelStatusTableContent = false;
    this.showModelLinksContent = false;
   }

  ngOnInit(): void {
    this.showModelStatusTableContent = true;
    if(this.router.url.includes(Routing.MODELS_LINKS)){
      this.index = 1;
      this.showModelLinksContent = true;
    }
    else{
      this.index = 0;
    }
    this.headerService.onChangeIndexTab.subscribe(result=>{
      this.index = result
    })
  }

  onSelectedTabChange(event: MatTabChangeEvent) {

    this.showModelStatusTableContent = false;
    this.showModelLinksContent = false;

    if (event.tab.textLabel === 'Models status') {
      this.showModelStatusTableContent = true;
    } else if (event.tab.textLabel === 'Models links') {
      this.showModelLinksContent = true;
    }

    let fragment;
    switch (event.index) {
      case 0:
        fragment = Routing.MODELS_STATUS;
        break;
      case 1:
        fragment = Routing.MODELS_LINKS;
        break;
      default:
        fragment = Routing.MODELS_STATUS;
        break;
    }
    this.index = event.index;
    this.location.go(
      this.router.createUrlTree([Routing.MODELS_STATUS]).toString() + "/" + fragment)
  
  }
}
