import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Routing } from 'src/app/models/routing.model';
import { HeaderService } from 'src/app/services/hearder/header.service';

@Component({
  selector: 'app-models-container',
  templateUrl: './models-container.component.html',
  styleUrls: ['./models-container.component.scss']
})
export class ModelsContainerComponent implements OnInit {

  public index: number;


  constructor(
    private router: Router,
    private location: Location,
    private headerService: HeaderService,
  ) {
   }

  ngOnInit(): void {
    this.headerService.onChangeIndexTab.subscribe(result => {
      this.index = result;
    });
    if (this.router.url.includes(Routing.FROM_PROCESS)) {
      this.index = 1;
    } else {
      this.index = 0;
    }
  }

  onSelectedTabChange(event: MatTabChangeEvent) {


    let fragment;
    switch (event.index) {
      case 0:
        fragment = Routing.MODELS_STATUS;
        break;
      case 1:
        fragment = Routing.FROM_PROCESS;
        break;
      default:
        fragment = Routing.MODELS_STATUS;
        break;
    }
    this.index = event.index;
    this.location.go(
      this.router.createUrlTree([Routing.ONTOLOGY]).toString() + '/' + fragment);
  }
}
