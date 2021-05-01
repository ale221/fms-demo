import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],

})
export class DashboardComponent implements OnInit {


  constructor() {
  //  this.addJsScripts();
  }


  ngOnInit() {

  }

  addJsScripts() {

    if (document.getElementById('main_js') != null) {
      document.getElementById('main_js').remove();
    }
    const node = document.createElement('script');
    node.src = 'assets/js/main.js';
    node.type = 'text/javascript';
    node.async = false;
    node.id = 'main_js';
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);


    if (document.getElementById('core_js') != null) {
      document.getElementById('core_js').remove();
    }
    const node1 = document.createElement('script');
    node1.src = 'assets/js/core.js';
    node1.type = 'text/javascript';
    node1.async = false;
    node1.id = 'core_js';
    node1.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node1);
  }

}
