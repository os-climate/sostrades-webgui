import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-models-container',
  templateUrl: './models-container.component.html',
  styleUrls: ['./models-container.component.scss']
})
export class ModelsContainerComponent implements OnInit {

  public showModelStatusTableContent: boolean;
  public showModelLinksContent: boolean;

  constructor() {
    this.showModelStatusTableContent = false;
    this.showModelLinksContent = false;
   }

  ngOnInit(): void {
    this.showModelStatusTableContent = true;
  }

  onSelectedTabChange(event: MatTabChangeEvent) {

    this.showModelStatusTableContent = false;
    this.showModelLinksContent = false;

    if (event.tab.textLabel === 'Models status') {
      this.showModelStatusTableContent = true;
    } else if (event.tab.textLabel === 'Models links') {
      this.showModelLinksContent = true;
    }
  }

}
