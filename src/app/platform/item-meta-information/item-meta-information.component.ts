import {Component, Input, OnInit} from '@angular/core';
import {Item} from '../data/model/item';
import {EntityStatusEnum} from '../../core/enum/entity-type.enum';
import {AppLoader} from '../data/model/app-loader';

@Component({
  selector: 'app-item-meta-information',
  templateUrl: './item-meta-information.component.html',
  styleUrls: ['./item-meta-information.component.css']
})
export class ItemMetaInformationComponent implements OnInit {
  @Input() list: Item [] = [];
  @Input() name: string;
  @Input() image: any;
  @Input() imageStyle?: any = {'height': '140px', 'max-width': '100%'};
  @Input() status?: any = [];
  @Input() statusLabel?: any;
  @Input() showBadge?: any;
  @Input() height?: any;
  @Input() showSignals?: any;
  @Input() signalsStrength: any;

  constructor() {
  }

  ngOnInit() {
  }

  getStatusClass(value) {
    if (value === EntityStatusEnum[EntityStatusEnum.Inactive]) {
      return 'badge-danger';
    } else {
      return 'badge-success';
    }
  }

  getSignalsClasses() {
    if (this.signalsStrength >= 0 && this.signalsStrength <= 7) {
      return 'uniform one-bar';
    } else if (this.signalsStrength >= 8 && this.signalsStrength <= 15) {
      return 'uniform two-bars';
    } else if (this.signalsStrength >= 16 && this.signalsStrength <= 23) {
      return 'uniform three-bars';
    } else if (this.signalsStrength >= 24 && this.signalsStrength <= 31) {
      return 'uniform four-bars';
    } else {
      return 'no-bars';
    }
  }


}
