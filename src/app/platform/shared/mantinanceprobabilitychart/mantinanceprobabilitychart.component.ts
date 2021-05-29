import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { isPlatformBrowser } from '@angular/common';

// Themes begin
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);
// Themes end

@Component({
  selector: 'app-mantinanceprobabilitychart',
  templateUrl: './mantinanceprobabilitychart.component.html',
  styleUrls: ['./mantinanceprobabilitychart.component.css']
})
export class MantinanceprobabilitychartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;

  @Input() chartFilter;
  @Input() graphHeight;
  @Input() horizontal;
  selectedGraphFilter;
  chartOptions1;
  finalObj = [];

  @Output() selectedFilters = new EventEmitter<string>();

  // private chart: am4charts.XYChart;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }


  ngOnInit() {
    // this.generateGraphData();
    // this.selectedGraphFilter = {
    //   id: this.graphId,
    //   type: this.graphType,
    //   use_case_id: this.graphUseCaseId,
    // }

    this.finalObj = [];
    // for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
    //   this.finalObj.push({ "category": this.chartOptions.categories[x], "value1": this.chartOptions.series[0].data[x], "value2": this.chartOptions.series[1].data[x], "value3": this.chartOptions.series[2].data[x] });
    // }

    for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
      this.finalObj.push({ "category": this.chartOptions.categories[x], "value": this.chartOptions.series[0].data[x] });
    }

    this.generateChar(this.finalObj);
  }

  ngAfterViewInit() {
    // this.finalObj = [];
    // for (let x = 0; x < this.chartOptions.categories.length; x++) {
    //   var z = this.chartOptions.categories[x].substring(0, 5) + '...';
    //   this.finalObj.push({ "category": z, "value1": this.chartOptions.series[0].data[x], "value2": this.chartOptions.series[1].data[x], "value3": this.chartOptions.series[2].data[x] });
    // }
    // // // console.log(this.finalObj);
    // // var x=JSON.stringify(this.finalObj)

    // if (this.finalObj.length > 0) {
    //   // console.log("in");
    //   this.generateChar(this.finalObj);
    // }
    // // console.log(x);
  }


  generateChar(chartData) { //async

    ////////////////// Old code //////////////////
    // this.browserOnly(() => {
    //   am4core.useTheme(am4themes_animated);

    //   // let chart = am4core.create("chartdiv", am4charts.XYChart);
    //   // chart.padding(40, 40, 40, 40);
    //   var chart = am4core.create("mantain", am4charts.XYChart);
    //   chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    //   chart.data = chartData;
    //   //  [{
    //   //     category: "Fleet1",
    //   //     value1: 1,
    //   //     value2: 5,
    //   //     value3:0
    //   // }, {
    //   //     category: "Fleet2",
    //   //     value1: 2,
    //   //     value2: 5,
    //   //     value3:0
    //   // }, {
    //   //     category: "Fleet3",
    //   //     value1: 3,
    //   //     value2: 5,
    //   //     value3:0

    //   // }, {
    //   //     category: "Fleet4",
    //   //     value1: 4,
    //   //     value2: 5,
    //   //     value3:0
    //   // }, {
    //   //     category: "Fleet5",
    //   //     value1: 3,
    //   //     value2: 5,
    //   //     value3:4
    //   // }, {
    //   //     category: "Fleet6",
    //   //     value1: 2,
    //   //     value2: 13,
    //   //     value3:5
    //   // }];

    //   chart.colors.step = 5;

    //   // Add legend
    //   chart.legend = new am4charts.Legend();
    //   chart.legend.useDefaultMarker = false;
    //   let markerTemplate = chart.legend.markers.template;
    //   markerTemplate.width = 10;
    //   markerTemplate.height = 10;
    //   chart.legend.position = "top";
    //   chart.legend.valueLabels.template.disabled = false;

    //   var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    //   categoryAxis.dataFields.category = "category";

    //   categoryAxis.renderer.inversed = true;
    //   categoryAxis.renderer.grid.template.disabled = false;
    //   categoryAxis.renderer.grid.template.opacity = 1;
    //   categoryAxis.renderer.grid.template.location = 0;
    //   categoryAxis.renderer.minGridDistance = 0;

    //   var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //   valueAxis.min = 0;
    //   valueAxis.max = 100;
    //   valueAxis.strictMinMax = true;
    //   valueAxis.calculateTotals = true;
    //   valueAxis.renderer.minWidth = 50;

    //   var series1 = chart.series.push(new am4charts.ColumnSeries());
    //   series1.columns.template.width = am4core.percent(80);
    //   series1.columns.template.tooltipText =
    //     "{name}: {valueY.totalPercent.formatNumber('#.0')}%";
    //   series1.name = "Maintenance Probability";
    //   series1.dataFields.categoryX = "category";
    //   series1.dataFields.valueY = "value1";
    //   series1.dataFields.valueYShow = "totalPercent";
    //   series1.dataItems.template.locations.categoryX = 0.5;
    //   series1.stacked = true;
    //   series1.tooltip.pointerOrientation = "vertical";

    //   var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
    //   bullet1.interactionsEnabled = false;
    //   bullet1.label.text = "{valueY.totalPercent.formatNumber('#.0')}%";
    //   bullet1.label.fill = am4core.color("#ffffff");
    //   bullet1.locationY = 0.5;

    //   var series2 = chart.series.push(new am4charts.ColumnSeries());
    //   series2.columns.template.width = am4core.percent(80);
    //   series2.columns.template.tooltipText =
    //     "{name}: {valueY.totalPercent.formatNumber('#.0')}%";
    //   series2.name = "Replace Probability";
    //   series2.dataFields.categoryX = "category";
    //   series2.dataFields.valueY = "value2";
    //   series2.dataFields.valueYShow = "totalPercent";
    //   series2.dataItems.template.locations.categoryX = 0.5;
    //   series2.stacked = true;
    //   series2.tooltip.pointerOrientation = "vertical";

    //   var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
    //   bullet2.interactionsEnabled = false;
    //   bullet2.label.text = "{valueY.totalPercent.formatNumber('#.0')}%";
    //   bullet2.locationY = 0.5;
    //   bullet2.label.fill = am4core.color("#ffffff");

    //   var series3 = chart.series.push(new am4charts.ColumnSeries());
    //   series3.columns.template.width = am4core.percent(80);
    //   series3.columns.template.tooltipText =
    //     "{name}: {valueY.totalPercent.formatNumber('#.0')}%";
    //   series3.name = "No Maintenance Probability";
    //   series3.dataFields.categoryX = "category";
    //   series3.dataFields.valueY = "value3";
    //   series3.dataFields.valueYShow = "totalPercent";
    //   series3.dataItems.template.locations.categoryX = 0.5;
    //   series3.stacked = true;
    //   series3.tooltip.pointerOrientation = "vertical";

    //   var bullet3 = series3.bullets.push(new am4charts.LabelBullet());
    //   bullet3.interactionsEnabled = false;
    //   bullet3.label.text = "{valueY.totalPercent.formatNumber('#.0')}%";
    //   bullet3.locationY = 0.5;
    //   bullet3.label.fill = am4core.color("#fff");
    //   chart.scrollbarX = new am4core.Scrollbar();
    // });
    ///////////////////////// End old graph code here /////////////////////


    let chart = am4core.create("mantain", am4charts.XYChart3D);

    // Add data
    chart.data = chartData;
    // Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";//"country";
    categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.renderer.labels.template.hideOversized = false;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.tooltip.label.rotation = 270;
    categoryAxis.tooltip.label.horizontalCenter = "right";
    categoryAxis.tooltip.label.verticalCenter = "middle";

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Values";
    // valueAxis.title.fontWeight = "bold";

    // Create series
    let series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "value";//"visits";
    series.dataFields.categoryX = "category";//"country";
    series.name = "Violations";
    series.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = .8;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.stroke = am4core.color("#FFFFFF");

    columnTemplate.adapter.add("fill", function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    })

    columnTemplate.adapter.add("stroke", function (stroke, target) {
      return chart.colors.getIndex(target.dataItem.index);
    })

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;


















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
    // // console.log(this.chartOptions,"111111111");
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
    this.chartOptions.forEach(element => {
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
    // this.browserOnly(() => {
    //   if (this.chart) {
    //     this.chart.dispose();
    //   }
    // });
  }
}
