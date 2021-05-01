import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-apex-basic-radialar-bar-chart',
  templateUrl: './apex-basic-radialar-bar-chart.component.html',
  styleUrls: ['./apex-basic-radialar-bar-chart.component.css']
})
export class ApexBasicRadialarBarChartComponent implements OnInit {

  // parameters
  public chartOptions: any;

  // end
  // parameters pass from driver dashboard component
  @Input() graphSeries: any;
  @Input() graphLabels: any;
  @Input() graphDataChartHeight: any;
  // end

  constructor() { }

  ngOnInit(): void {
    this.drawGraph();
  }
  // this function is used to draw graph
  drawGraph() {

    this.chartOptions = {
      series: this.graphSeries,
      chart: {
        height: this.graphDataChartHeight,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '70%',
          }
        },
      },
      labels: this.graphLabels,
    };
  }

}

