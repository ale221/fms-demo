import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-apx-radialbar-stroked-gauge-forked-chart',
  templateUrl: './apx-radialbar-stroked-gauge-forked-chart.component.html',
  styleUrls: ['./apx-radialbar-stroked-gauge-forked-chart.component.css']
})
export class ApxRadialbarStrokedGaugeForkedChartComponent implements OnInit {

  // parameters
  public chartOptions: any;

  // end
  // parameters pass from driver dashboard component
  @Input() graphSeries: any;
  @Input() graphLabels: any;
  @Input() graphDataLabelsNameFontSize: any;
  @Input() graphDataLabelsNameFontSizeColor: any;
  @Input() graphDataLabelsNameFontOffsetY: any;
  @Input() graphDataLabelsValueFontSize: any;
  @Input() graphDataLabelsValueFontSizeColor: any;
  @Input() graphDataLabelsValueFontOffsetY: any;
  @Input() graphDataLabelsValueFontFormattor: any;
  @Input() graphDataStrokeDashArray: any;
  @Input() graphDataChartHeight: any;
  // end

  constructor() { }

  ngOnInit(): void {
    debugger
    this.drawGraph();
  }
  // this function is used to draw graph
  drawGraph() {

    this.chartOptions = {
      series: this.graphSeries,
      chart: {
        height: this.graphDataChartHeight,
        type: 'radialBar',
        offsetY: -10
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          dataLabels: {
            name: {
              fontSize: '16px',
              color: undefined,
              offsetY: 120
            },
            value: {
              offsetY: this.graphDataLabelsValueFontOffsetY,
              fontSize: this.graphDataLabelsValueFontSize,
              color: undefined,
              formatter: function (val) {
                return val + 'KM';
              }
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91]
        },
      },
      stroke: {
        dashArray: this.graphDataStrokeDashArray
      },
      labels: this.graphLabels,
    };

  }

}
