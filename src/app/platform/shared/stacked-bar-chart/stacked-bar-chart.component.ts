import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { isPlatformBrowser } from '@angular/common';

// theme
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);


@Component({
  selector: 'app-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.css']
})
export class StackedBarChartComponent implements OnInit {

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
  private chart: am4charts.XYChart;
  @Output() selectedFilters = new EventEmitter<string>();

  newData = [];
  fleets = []
  // webArray = [
  //   {
  //     name: "fleet 1",
  //     data: [
  //       {
  //         vehicle: "RIX-740",
  //         driver: "kazim"
  //       },
  //       {
  //         vehicle: "BIX-740",
  //         driver: "Shah"
  //       }
  //     ]
  //   }, {
  //     name: "fleet 2",
  //     data: [
  //       {
  //         vehicle: "RIS-333",
  //         driver: "Amir"
  //       },
  //       {
  //         vehicle: "9IX-740",
  //         driver: "wahab"
  //       }
  //     ]
  //   }
  // ]

  colorArray = ['yellow', 'purple', 'orange', 'skyblue', 'rosered']

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  ngOnInit(): void {
    // this.generateGraphData();
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
    this.chartOptions1 = this.chartOptions;
    console.log("Metis change request-- ", this.chartOptions)
    this.fleets = this.chartOptions;
  }


  ngOnChanges() {
    this.data = [];
    // this.generateGraphData();

    this.serial = this.chartOptions.series;
    this.categories = this.chartOptions.categories;
    this.data.length = 0;
    for (let x = 0; x < this.categories?.length; x++) {
      // this.data.push({ "name": this.categories[x], "value1": this.serial[0].data[x], "value2": this.serial[1].data[x] });
      this.data.push({ "name": this.categories[x], "value1": this.serial[0]?.data[x], "value2": this.serial[1]?.data[x], "value3": this.serial[2]?.data[x] });

      // this.data.push(
      //   {
      //     "name": this.categories[x],
      //     "value0": this.serial[x]?.data[x],
      //     "value1": this.serial[1]?.data[x],
      //     "value2": this.serial[2]?.data[x]
      //   });


    }

    this.generateChart(this.data);
  }

  generateGraphData() {
    let graphData = {
      series: [],
      chart: {
        type: "bar",
        height: this.graphHeight,
        stacked: true,
        stackType: "100%"
      },
      plotOptions: {
        bar: {
          horizontal: this.horizontal
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        categories: [],
        labels: {
          formatter: function (val) {
            return val;
          }
        }
      },
      yaxis: {
        title: {
          text: undefined
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          }
        }
      },
      fill: {
        opacity: 1
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        offsetX: 40
      }
    };

    if (this.chartOptions) {
      graphData.series = this.chartOptions.series
    }
    graphData.xaxis.categories = this.chartOptions.categories
    this.chartOptions1 = graphData;
    this.serial = graphData.series;
    this.categories = graphData.xaxis.categories;
    // console.log("(this.serial)==", this.serial);
    // console.log("(this.categories)== ", this.categories);
  }

  getSelectedGraphData(data) {
    this.selectedFilters.emit(data);
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngAfterViewInit() {
    // Chart code goes in here
    // this.generateGraphData();

    this.serial = this.chartOptions.series;
    this.categories = this.chartOptions.categories;
    this.data.length = 0;
    for (let x = 0; x < this.categories?.length; x++) {
      // this.data.push({ "name": this.categories[x], "value1": this.serial[0].data[x], "value2": this.serial[1].data[x], "value3": this.serial[2].data[x], "value4": this.serial[3].data[x] });
      this.data.push({ "name": this.categories[x], "value1": this.serial[0]?.data[x], "value2": this.serial[1]?.data[x], "value3": this.serial[2]?.data[x] });
    }
    // console.log("this.data= ", this.data)
    this.generateChart(this.data);
  }

  generateChart(chartData) {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      var chart = am4core.create("chartdiv", am4charts.XYChart);
      chart.data = chartData;
      console.log("chartData_____==== ", chartData);
      //chart.colors.step = 2;

      // Add legend
      chart.legend = new am4charts.Legend();
      chart.legend.useDefaultMarker = false;
      let markerTemplate = chart.legend.markers.template;
      markerTemplate.width = 10;
      markerTemplate.height = 10;
      chart.legend.position = "top";
      chart.legend.valueLabels.template.disabled = false;

      var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "name";

      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = false;
      categoryAxis.renderer.grid.template.opacity = 1;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 0;

      var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.calculateTotals = true;
      valueAxis.renderer.minWidth = 0;

      valueAxis.renderer.grid.template.disabled = false;
      valueAxis.renderer.grid.template.opacity = 1;
      valueAxis.renderer.grid.template.location = 0;
      valueAxis.renderer.minGridDistance = 30;

      valueAxis.tooltip.disabled = false;


      var series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.columns.template.width = am4core.percent(50);
      series1.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}";
      series1.name = this.serial[0]?.name;
      series1.dataFields.categoryY = "name";
      series1.dataFields.valueX = "value1";
      series1.dataFields.valueXShow = "totalPercent";
      series1.stacked = true;
      series1.tooltip.pointerOrientation = "vertical";

      var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
      bullet1.interactionsEnabled = true;
      bullet1.label.text = "{value1}{valueY.totalPercent.formatNumber('#.00')}";
      bullet1.label.fill = am4core.color("#000");
      bullet1.locationX = 0.5;

      var series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.columns.template.width = am4core.percent(50);
      series2.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}";
      series2.name = this.serial[1]?.name;
      series2.dataFields.categoryY = "name";
      series2.dataFields.valueX = "value2";
      series2.dataFields.valueXShow = "totalPercent";
      series2.stacked = true;
      series2.tooltip.pointerOrientation = "vertical";

      var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
      bullet2.interactionsEnabled = true;
      bullet2.label.text = "{value2}{valueY.totalPercent.formatNumber('#.00')}";
      bullet2.locationX = 0.5;
      bullet2.label.fill = am4core.color("#000000");

      var series3 = chart.series.push(new am4charts.ColumnSeries());
      series3.columns.template.width = am4core.percent(50);
      series3.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}";
      series3.name = this.serial[2]?.name;
      series3.dataFields.categoryY = "name";
      series3.dataFields.valueX = "value3";
      series3.dataFields.valueXShow = "totalPercent";
      series3.stacked = true;
      series3.tooltip.pointerOrientation = "vertical";

      var bullet3 = series3.bullets.push(new am4charts.LabelBullet());
      bullet3.interactionsEnabled = true;
      bullet3.label.text = "{value3}{valueY.totalPercent.formatNumber('#.00')}";
      bullet3.locationX = 0.5;
      bullet3.label.fill = am4core.color("#ffffff");






      // var series4 = chart.series.push(new am4charts.ColumnSeries());
      // series4.columns.template.width = am4core.percent(50);
      // series4.columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}";
      // series4.name = this.serial[3].name;
      // series4.dataFields.categoryY = "name";
      // series4.dataFields.valueX = "value4";
      // series4.dataFields.valueXShow = "totalPercent";
      // series4.stacked = true;
      // series4.tooltip.pointerOrientation = "vertical";

      // var bullet4 = series3.bullets.push(new am4charts.LabelBullet());
      // bullet4.interactionsEnabled = true;
      // bullet4.label.text = "{value4}{valueY.totalPercent.formatNumber('#.00')}";
      // bullet4.locationX = 0.5;
      // bullet4.label.fill = am4core.color("#ffffff");

      // var series = [];
      // var bullet = [];
      // for (let i = 0; i < this.serial.length; i++) {
      //   series[i] = chart.series.push(new am4charts.ColumnSeries());
      //   series[i].columns.template.width = am4core.percent(50);
      //   series[i].columns.template.tooltipText = "{name}: {valueY.totalPercent.formatNumber('#.00')}";
      //   series[i].name = this.serial[i]?.name;
      //   series[i].dataFields.categoryY = "name";
      //   series[i].dataFields.valueX = "value[i]";
      //   series[i].dataFields.valueXShow = "totalPercent";
      //   series[i].stacked = true;
      //   series[i].tooltip.pointerOrientation = "vertical";



      //   bullet[i] = series[i].bullets.push(new am4charts.LabelBullet());
      //   bullet[i].interactionsEnabled = true;
      //   bullet[i].label.text = "{value[i]}{valueY.totalPercent.formatNumber('#.00')}";
      //   bullet[i].locationX = 0.5;
      //   bullet[i].label.fill = am4core.color("#000000");
      // }

    });
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
