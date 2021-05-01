import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-linechart',
  templateUrl: './linechart.component.html',
  styleUrls: ['./linechart.component.css']
})
export class LinechartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;

  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;

  @Output() selectedFilters = new EventEmitter<string>();
  
  constructor() {
  }

  ngOnInit() {
    this.generateGraphData();

    this.selectedGraphFilter = { 
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }

  ngOnChanges () {
    this.generateGraphData();
  }

  generateGraphData() {
    let colors = [
      "#008FFB",
      "#00E396",
      "#FEB019",
      "#FF4560"
    ]
    
    let graphData = {
      series: [],
      xaxis: null,
      chart: {
        height: this.graphHeight,
        type: "bar"
      },
      colors,
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      },
      dataLabels: {
        enabled: false
      }
    }
    let categories = [];
    let seriesObj = {
      name: 'Count',
      data: []
    };
    this.chartOptions.forEach(element => {
      seriesObj.data.push(element.count)
      categories.push(element.fleet__name)
    });
    graphData.series.push(seriesObj);

    graphData.xaxis = {
      categories,
      labels: {
        style: {
          colors: colors,
          fontSize: '12px'
        }
      }
    }
    this.chartOptions = graphData;
  }

  getSelectedGraphData (data) {
    this.selectedFilters.emit(data);
  }

}