import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {

  @Input() progressText: string;
  @Input() progressMode: string;
  @Input() progressValue?: number;

}
