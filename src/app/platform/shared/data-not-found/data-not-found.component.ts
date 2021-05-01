import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-data-not-found',
  templateUrl: './data-not-found.component.html',
  styleUrls: ['./data-not-found.component.css']
})
export class DataNotFoundComponent implements OnInit {

  @Input() appLoader?;
  @Input() alignClass? = 'text-left';
  @Input() fontSize? = 'font-size-14';
  constructor() { }

  ngOnInit() {
  }

}
