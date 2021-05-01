import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-apex-line-chart',
  templateUrl: './apex-line-chart.component.html',
  styleUrls: ['./apex-line-chart.component.css']
})
export class ApexLineChartComponent implements OnInit {
  // parameters
  public chartOptions: any;

  // end
  // parameters pass from driver dashboard component
  @Input() graphSeries: any;
  @Input() graphCategories: any;
  // end

  constructor() { }

  ngOnInit(): void {

    this.drawGraph();
  }
  // this function is used to draw graph
  drawGraph() {
    this.chartOptions = {
      series: [{
        name: "Hours",
        data: this.graphSeries
      }],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Idle Hours',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      xaxis: {
        type: 'category',
        categories: this.graphCategories,
      }
    };
  }
}
