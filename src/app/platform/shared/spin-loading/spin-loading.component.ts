import {Component, Input, OnInit} from '@angular/core';
import {isNullOrUndefined} from 'util';
import { AppLoader } from '../../data/model/app-loader';

@Component({
  selector: 'app-spin-loading',
  templateUrl: './spin-loading.component.html',
  styleUrls: ['./spin-loading.component.css']
})
export class SpinLoadingComponent implements OnInit {

  @Input() appLoader?: AppLoader;
  @Input() size?;
  @Input() marginTop? = 'auto';

  dimension = '50px';


  constructor() {
  }

  ngOnInit() {

    if (!isNullOrUndefined(this.size) && this.size === 'sm') {
      this.dimension = '30px';
    }
  }

}
