import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-apex-bar-chart',
  templateUrl: './apex-bar-chart.component.html',
  styleUrls: ['./apex-bar-chart.component.css']
})
export class ApexBarChartComponent implements OnInit {

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
        name: 'Harsh Braking',
        data: [0,0,0,0,0,0,0,0]
      }, {
        name: 'Over Speeding',
        data: [0,0,0,0,0,0,0,0]
      }, {
        name: 'Sudden Accelaration',
        data: [0,0,0,0,0,0,0,0]
      }],
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      xaxis: {
        type: '',
        categories: [],
      },
      legend: {
        position: 'right',
        offsetY: 40
      },
      fill: {
        opacity: 1
      }
    };
    // end of graph options object
  }

}
