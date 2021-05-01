import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-multi-bar-chart',
  templateUrl: './multi-bar-chart.component.html',
  styleUrls: ['./multi-bar-chart.component.css']
})
export class MultiBarChartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;
  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;
  chartOptions1;
  noData = true;
  finalObj = [];
  @Output() selectedFilters = new EventEmitter<string>();

  private chart: am4charts.XYChart;
  labelText = 'Fleet';

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  ngOnInit() {
    // console.log("chartFilter ==== ", this.chartFilter);
    // this.generateGraphData();
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }

  generateChart(chartData) {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      // staticstic chart
      var chart = am4core.create("gggggg", am4charts.XYChart);

      var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.title.text = this.labelText;// "Customers";
      categoryAxis.dataFields.category = "name";
      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = false;
      categoryAxis.renderer.grid.template.opacity = 1;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 0;

      var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.title.text = "Vehicles";
      valueAxis.min = 0;
      valueAxis.renderer.grid.template.disabled = false;
      valueAxis.renderer.grid.template.opacity = 1;
      valueAxis.renderer.grid.template.location = 0;
      valueAxis.renderer.minGridDistance = 30;

      var series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.categoryY = "name";
      series.dataFields.valueX = "value";
      series.columns.template.tooltipText = "{values.valueX.workingValue}";

      series.columns.template.tooltipText = "Vehicles\n[bold font-size: 20]{valueX}";
      series.columns.template.strokeOpacity = 0;
      series.clustered = false;

      var labelBullet = series.bullets.push(new am4charts.LabelBullet())
      labelBullet.label.horizontalCenter = "left";
      labelBullet.label.dx = 10;
      // labelBullet.label.text = "{values.valueX.workingValue}";
      labelBullet.locationX = 1;

      // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
      series.columns.template.adapter.add("fill", function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
      });

      categoryAxis.sortBySeries = series;
      chart.data = chartData;
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
    // console.log(this.chartOptions[0].Customer);
    // this.chartOptions[0].Fleet.length=9;
    // console.log(this.chartOptions);
    this.finalObj = [];
    for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
      this.finalObj.push({ "name": this.chartOptions.categories[x], "value": this.chartOptions.values[x] });
    }
    // console.log("this.finalObj== ", this.finalObj);
    this.generateChart(this.finalObj);
  }

  // generateGraphData() {
  //   this.noData = true;
  //   let graphData = {
  //     series: [],
  //     chart: {
  //       type: "bar",
  //       height: this.graphHeight
  //     },
  //     plotOptions: {
  //       bar: {
  //         horizontal: false,
  //         columnWidth: "55%",
  //         endingShape: "rounded"
  //       }
  //     },
  //     dataLabels: {
  //       enabled: false
  //     },
  //     stroke: {
  //       show: true,
  //       width: 2,
  //       colors: ["transparent"]
  //     },
  //     xaxis: {
  //       categories: []
  //     },
  //     yaxis: {
  //       title: {
  //         text: ""
  //       }
  //     },
  //     fill: {
  //       opacity: 1
  //     },
  //     tooltip: {
  //       y: {
  //         formatter: function (val) {
  //           return val;
  //         }
  //       }
  //     }
  //   };

  //   graphData.xaxis.categories = this.chartOptions.categories;
  //   graphData.series = this.chartOptions.series;
  //   this.chartOptions1 = graphData;

  //   if (this.chartOptions1.series && this.chartOptions1.series.length > 0) {
  //     this.chartOptions1.series.forEach(element => {
  //       if (element.data.length === 0) {
  //         this.noData = false;
  //       }
  //     });
  //   }
  // }

  getSelectedGraphData(data) {
    this.labelText = data.graphFilter.name;
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