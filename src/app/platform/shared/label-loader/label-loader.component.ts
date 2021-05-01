import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-label-loader',
  templateUrl: './label-loader.component.html',
  styleUrls: ['./label-loader.component.css']
})
export class LabelLoaderComponent implements OnInit {


  @Input() showLoader = false;
  @Input() text;
  @Input() msg? = null;
  constructor() { }

  ngOnInit() {
  }

}
