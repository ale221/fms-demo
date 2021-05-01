import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-stats-icon-card-sm',
  templateUrl: './stats-icon-card-sm.component.html',
  styleUrls: ['./stats-icon-card-sm.component.css']
})
export class StatsIconCardSmComponent implements OnInit {


  @Input() icon?;
  @Input() iconSize? = 30;
  @Input() label;
  @Input() data;
  @Input() bgColor;
  @Input() footer;
  @Output() onClick = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  public cardClicked() {
    this.onClick.emit(this.label);
  }

}
