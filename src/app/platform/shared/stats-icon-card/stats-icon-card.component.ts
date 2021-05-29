import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-stats-icon-card',
  templateUrl: './stats-icon-card.component.html',
  styleUrls: ['./stats-icon-card.component.css']
})
export class StatsIconCardComponent implements OnInit {

  @Input() icon?;
  @Input() unit?;
  @Input() label;
  @Input() bgStyle;
  @Input() data;
  @Input() totalCount;
  @Input() footerArr;
  @Input() cardHeight? = 'height-100';
  @Input() paddingTop? = '0px';
  @Input() iconHeight? = '40';
  @Input() fontSize? = 'font-size-24';
  @Input() footerText? = '';
  @Input() footerStyle;
  @Output() onClick = new EventEmitter();

  colMd;

  constructor() {
    this.data = +this.data;
  }

  ngOnInit() {
    this.data = +this.data;
    if (this.data.footer) {
      this.colMd = Math.round(12 / this.data.footer.length);
      this.colMd = 'col-md-'+ this.colMd;
      // console.log(this.colMd)
    }
  }

  cardClicked() {
    this.onClick.emit(this.label);

  }
}
