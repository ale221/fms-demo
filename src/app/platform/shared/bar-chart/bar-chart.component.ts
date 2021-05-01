import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";


import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;

  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;
  chartOptions1;
  finalObj = [];

  @Output() selectedFilters = new EventEmitter<string>();

  private chart: am4charts.XYChart;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }


  ngOnInit() {
    this.generateGraphData();
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }

  generateChar(chartData) {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      // let chart = am4core.create("chartdiv", am4charts.XYChart);
      // chart.padding(40, 40, 40, 40);
      var chart = am4core.create("qqqqqqq", am4charts.XYChart);
      //chart.scrollbarX = new am4core.Scrollbar();

      // Add data
      chart.data = chartData;
      // [{
      //     "team": "Team1",
      //     "score": 80,
      // }, {
      //     "team": "Team2",
      //     "score": 70,
      // }, {
      //     "team": "Team3",
      //     "score": 58,
      // }, {
      //     "team": "Team4",
      //     "score": 55,
      // }, {
      //     "team": "Team5",
      //     "score": 99,
      // }];

      // Create axes
      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name";
      categoryAxis.title.text = "Team";
      categoryAxis.renderer.grid.template.disabled = false;
      categoryAxis.renderer.grid.template.opacity = 1;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 0;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = "Vehicles";

      var series = chart.series.push(new am4charts.ColumnSeries3D());
      series.sequencedInterpolation = true;
      series.dataFields.valueY = "value";
      series.dataFields.categoryX = "name";
      series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
      series.columns.template.strokeWidth = 0;

      // series.tooltip.pointerOrientation = "";

      series.columns.template.column.cornerRadiusTopLeft = 10;
      series.columns.template.column.cornerRadiusTopRight = 10;
      series.columns.template.column.fillOpacity = 1;
      series.columns.template.width = am4core.percent(50);
      var hoverState = series.columns.template.column.states.create("hover");
      hoverState.properties.cornerRadiusTopLeft = 0;
      hoverState.properties.cornerRadiusTopRight = 0;
      hoverState.properties.fillOpacity = 1;

      chart.cursor = new am4charts.XYCursor();


    });
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }

  }

  ngOnChanges() {
    // this.generateGraphData();
    // let colors = [
    //   "#008FFB",
    //   "#00E396",
    //   "#FEB019",
    //   "#FF4560"
    // ]

    // let graphData = {
    //   series: [],
    //   xaxis: null,
    //   chart: {
    //     height: this.graphHeight,
    //     type: "bar"
    //   },
    //   colors,
    //   plotOptions: {
    //     bar: {
    //       columnWidth: "45%",
    //       distributed: true
    //     }
    //   },
    //   dataLabels: {
    //     enabled: false
    //   }
    // }
    // let categories = [];
    // let seriesObj = {
    //   name: 'Count',
    //   data: []
    // };
    // // if (this.chartOptions && this.chartOptions.length > 0) {
    //   this.chartOptions.forEach(element => {
    //     seriesObj.data.push(element.value)
    //     categories.push(element.label)
    //   });
    // // }
    // graphData.series.push(seriesObj);

    // graphData.xaxis = {
    //   categories,
    //   labels: {
    //     style: {
    //       colors: colors,
    //       fontSize: '12px'
    //     }
    //   }
    // }
    // this.chartOptions1 = graphData;
    // console.log(this.chartOptions,"111111111");
    for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
      var z = this.chartOptions?.categories[x].substring(0, 5) + '...';
      this.finalObj.push({ "name": z, "value": this.chartOptions?.values[x] });
    }
    // console.log(this.finalObj);
    this.generateChar(this.finalObj);
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
    if (this.chartOptions && this.chartOptions.length > 0) {
      this.chartOptions?.forEach(element => {
        seriesObj.data.push(element.value)
        categories.push(element.label)
      });
    }
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
    this.chartOptions1 = graphData;
  }

  getSelectedGraphData(data) {
    this.selectedFilters.emit(data);
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
