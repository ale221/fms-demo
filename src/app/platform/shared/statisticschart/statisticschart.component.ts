import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-statisticschart',
  templateUrl: './statisticschart.component.html',
  styleUrls: ['./statisticschart.component.css']
})
export class StatisticschartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;
  @Input() horizontal;
  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;
  chartOptions1;
  finalObj = [];
  arry1 = [];
  arry2 = [];
  arry3 = [];
  @Output() selectedFilters = new EventEmitter<string>();

  private chart: am4charts.XYChart;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }


  ngOnInit() {
    // this.generateGraphData();
    this.arry1 = [];
    this.arry2 = [];
    this.arry3 = [];
    this.arry1 = this.chartOptions?.series[0].data;
    this.arry2 = this.chartOptions?.series[1].data;
    this.arry3 = this.chartOptions?.series[2].data;
    // console.log(this.chartOptions);
    for (let x = 0; x < this.chartOptions?.categories.length; x++) {
      var z = this.chartOptions?.categories[x].substring(0, 5) + '...';
      this.finalObj.push({ "name": z, "Fuel": this.arry1[x], "Engine": this.arry2[x], "Tire": this.arry3[x] });
    }

    this.generateChar(this.finalObj);
    // this.selectedGraphFilter = {
    //   id: this.graphId,
    //   type: this.graphType,
    //   use_case_id: this.graphUseCaseId,
    // }
  }

  generateChar(chartData) {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      var chart = am4core.create("xxgxx", am4charts.XYChart);
      // Add data
      chart.data = chartData;

      // Create axes
      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name"
      // categoryAxis.renderer.grid.template.location=0;
      // dateAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 5;
      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = true;

      var valueAxis1 = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis1.title.text = "Liters";

      var valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis2.title.text = "PSI";
      valueAxis2.renderer.opposite = true;
      valueAxis2.renderer.grid.template.disabled = false;

      // Create series
      var series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.dataFields.valueY = "Fuel";
      //series1.dataFields.dateX = "date";
      series1.dataFields.categoryX = "name";
      series1.yAxis = valueAxis1;
      series1.name = "Fuel";
      series1.tooltipText = "{name}\n[bold font-size: 20]{valueY}";
      series1.fill = chart.colors.getIndex(0);
      series1.strokeWidth = 0;
      series1.clustered = false;
      series1.columns.template.width = am4core.percent(40);

      series1.columns.template.column.cornerRadiusTopLeft = 10;
      series1.columns.template.column.cornerRadiusTopRight = 10;
      series1.columns.template.column.fillOpacity = 1;
      series1.columns.template.width = am4core.percent(50);
      var hoverState = series1.columns.template.column.states.create("hover");
      hoverState.properties.cornerRadiusTopLeft = 0;
      hoverState.properties.cornerRadiusTopRight = 0;
      hoverState.properties.fillOpacity = 1;

      var series3 = chart.series.push(new am4charts.LineSeries());
      series3.dataFields.valueY = "Engine";
      //series3.dataFields.dateX = "date";
      series3.dataFields.categoryX = "name";
      series3.name = "Engine Oil";
      series3.strokeWidth = 2;
      series3.tensionX = 0.7;
      series3.yAxis = valueAxis2;
      series3.tooltipText = "{name}\n[bold font-size: 20]{valueY}[/]";

      var bullet3 = series3.bullets.push(new am4charts.CircleBullet());
      bullet3.circle.radius = 4;
      bullet3.circle.strokeWidth = 2;
      bullet3.circle.fill = am4core.color("#fff");

      var series4 = chart.series.push(new am4charts.LineSeries());
      series4.dataFields.valueY = "Tire";
      //series4.dataFields.dateX = "date";
      series4.dataFields.categoryX = "name";
      series4.name = "Tire Pressure";
      series4.strokeWidth = 2;
      series4.tensionX = 0.7;
      series4.yAxis = valueAxis2;
      series4.tooltipText = "{name}\n[bold font-size: 20]{valueY}[/]";
      series4.stroke = chart.colors.getIndex(0).lighten(0.5);
      series4.strokeDasharray = "3,3";

      var bullet4 = series4.bullets.push(new am4charts.CircleBullet());
      bullet4.circle.radius = 1;
      bullet4.circle.strokeWidth = 2;
      bullet4.circle.fill = am4core.color("#fff");

      // Add cursor
      chart.cursor = new am4charts.XYCursor();

      // Add legend
      chart.legend = new am4charts.Legend();
      chart.legend.useDefaultMarker = false;
      let markerTemplate = chart.legend.markers.template;
      markerTemplate.width = 10;
      markerTemplate.height = 10;
      chart.legend.position = "top";
      chart.legend.valueLabels.template.disabled = false;
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
    // console.log(this.chartOptions,"111111111");
    // this.generateChar(this.chartOptions);
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
    // if (this.chartOptions && this.chartOptions.length > 0) {
    this.chartOptions?.forEach(element => {
      seriesObj.data.push(element.value)
      categories.push(element.label)
    });
    // }
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
