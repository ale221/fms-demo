import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit {

  constructor() { }

  @Input() progressbarData = {};
  @Input() inputData: number;
  @Input() color: any;
  @Input() classList: any;

  ngOnInit() {
  }

}
