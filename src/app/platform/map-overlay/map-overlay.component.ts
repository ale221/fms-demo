import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-map-overlay',
  templateUrl: './map-overlay.component.html',
  styleUrls: ['./map-overlay.component.css']
})
export class MapOverlayComponent implements OnInit {

  @Input() visibility;
  @Input() top? = 25;
  @Input() msg;
  constructor() { }

  ngOnInit() {
  }

}
