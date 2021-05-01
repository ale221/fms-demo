import {Component, Input, OnInit} from '@angular/core';
import { GotoPageService } from 'src/app/platform/services/goto-page.service';

@Component({
  selector: 'app-staff-listing-table',
  templateUrl: './staff-listing-table.component.html',
  styleUrls: ['./staff-listing-table.component.css']
})
export class StaffListingTableComponent implements OnInit {


  @Input() loader;
  @Input() rows = [];
  @Input() temp = [];
  now = Date.now();


  constructor(public gotoService: GotoPageService,
  ) {
  }

  ngOnInit() {
  }


  updateFilter(event) {
    this.rows = event;
  }

}
