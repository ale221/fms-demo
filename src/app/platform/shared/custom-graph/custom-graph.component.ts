import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-custom-graph',
  templateUrl: './custom-graph.component.html',
  styleUrls: ['./custom-graph.component.css']
})
export class CustomGraphComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;

  @Input() chartFilter;
  @Input() graphHeight;
  @Input() horizontal;
  data = [];
  serial = [];
  categories = [];
  selectedGraphFilter;
  chartOptions1;
  @Output() selectedFilters = new EventEmitter<string>();
  selectedIndex;

  fleets = [];
  noDataFound = false;

  graphClass = ['graph-data yellow', 'graph-data orange', 'graph-data purple', 'graph-data dark-purple', 'graph-data light-blue']

  constructor() { }

  ngOnInit(): void {
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
    this.chartOptions1 = this.chartOptions;

    this.generateGraphData();
  }

  ngOnChanges() {
    this.generateGraphData()
  }

  generateGraphData () {
    if (this.chartOptions && this.chartOptions.length > 0) {
      if (this.chartOptions.length > 5) {
        this.chartOptions.length = 5;
      }
      this.noDataFound = false;
      this.chartOptions.forEach(element => {
        let customArray = [];
        if (element.data && element.data.length > 0) {
          element.data.forEach(elem => {
            if (elem.driver) {
              customArray.push(elem);
            }
          });
          element.customArray = customArray;
        }
      });
      this.fleets = this.chartOptions;
    } else {
      this.noDataFound = true;
    }
  }

  getSelectedGraphData(data) {
    this.selectedFilters.emit(data);
  }
}
