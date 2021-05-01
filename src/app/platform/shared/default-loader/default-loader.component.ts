import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-default-loader',
  templateUrl: './default-loader.component.html',
  styleUrls: ['./default-loader.component.css']
})
export class DefaultLoaderComponent implements OnInit {

  @Input() defaultLoader;


  constructor() {
  }

  ngOnInit() {
  }

}
