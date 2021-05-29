import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-chart-filters',
  templateUrl: './chart-filters.component.html',
  styleUrls: ['./chart-filters.component.css']
})
export class ChartFiltersComponent implements OnInit {

  @Input() filterData;
  @Input() selectedGraph;

  @Output() selectedFilters = new EventEmitter<string>();

  selectedFiltersData: any;
  selectedGraphObj;
  secondaryFilter;

  constructor() { }

  ngOnInit(): void {
    // // console.log("filterData== ", this.filterData)
    this.selectedGraphObj = this.filterData[0]
  }

  filterChanged(filter) {
    this.secondaryFilter = filter.value.ui_filter_second;
    this.selectedFiltersData = {
      graphFilter: filter.value,
      graphData: this.selectedGraph
    };
    this.selectedFilters.emit(this.selectedFiltersData);
  }

  secondaryFilterChanged(filter) {
    this.selectedFiltersData.secondaryFilter = filter.value;
    this.selectedFilters.emit(this.selectedFiltersData);
  }

}
