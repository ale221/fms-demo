import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { GraphJsonData } from 'src/app/model/GraphJsonDataModel';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { isPlatformBrowser } from '@angular/common';
import { TranslateDetector } from 'src/app/core/services/translate-detector.service';

// theme
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);
@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;

  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;
  finalObj = [];
  arry1 = [];
  arry2 = [];
  arry3 = [];
  arry4 = [];
  arry5 = [];
  @Output() selectedFilters = new EventEmitter<string>();
  graphJson: GraphJsonData;
  language: any;

  private chart: am4charts.XYChart;
  constructor(@Inject(PLATFORM_ID) private platformId,
    private zone: NgZone,
    public translateDetector: TranslateDetector) {
    this.graphJson = new GraphJsonData();
  }

  ngOnInit() {
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }
  ngOnChanges() {
    this.finalObj = [];
    this.arry1 = [];
    this.arry2 = [];
    this.arry3 = [];
    this.arry4 = [];
    this.arry5 = [];
    let violationArray = [];

    if (this.chartOptions && this.chartOptions?.series.length > 0) {
      this.chartOptions?.series.forEach((element, i) => {
        violationArray.push(element);
      });

      for (let k = 0; k < this.chartOptions?.series?.length; k++) {

        if (this.chartOptions?.series[k]?.data.length > 0 && this.chartOptions?.series[k]?.name == 'Speed') {
          this.arry1 = this.chartOptions?.series[0]?.data;
        }

        if (this.chartOptions?.series[k]?.data.length > 0 && this.chartOptions?.series[k]?.name == 'HarshBraking') {
          this.arry2 = this.chartOptions?.series[k]?.data;
        }

        if (this.chartOptions?.series[k]?.data.length > 0 && this.chartOptions?.series[k]?.name == 'HarshAcceleration') {
          this.arry3 = this.chartOptions?.series[k]?.data;
        }

        if (this.chartOptions?.series[k]?.data.length > 0 && this.chartOptions?.series[k]?.name == 'SharpTurn') {
          this.arry4 = this.chartOptions?.series[k]?.data;
        }

        if (this.chartOptions?.series[k]?.data.length > 0 && this.chartOptions?.series[k]?.name == 'total Point') {
          this.arry5 = this.chartOptions?.series[k]?.data;
        }

      }

      if (this.arry2.length == 0) {
        // console.log("this.arry2 (HarshBraking) is EMPTY")
        for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
          this.finalObj.push({ "driver": this.chartOptions?.categories[x], "Speed": this.arry1[x], "HarshAcceleration": this.arry3[x], "SharpTurn": this.arry4[x], "total Point": this.arry5[x] });
        }
      }
      else if (this.arry3.length == 0) {
        // console.log("this.arry3 (HarshAcceleration) is EMPTY")
        for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
          this.finalObj.push({ "driver": this.chartOptions?.categories[x], "Speed": this.arry1[x], "HarshBraking": this.arry2[x], "SharpTurn": this.arry4[x], "total Point": this.arry5[x] });
        }
      }
      else if (this.arry4.length == 0) {
        // console.log("this.arry4 (SHARPTURN) is EMPTY")
        for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
          this.finalObj.push({ "driver": this.chartOptions?.categories[x], "Speed": this.arry1[x], "HarshBraking": this.arry2[x], "HarshAcceleration": this.arry3[x], "total Point": this.arry5[x] });
        }
      } else if (this.arry5.length == 0) {
        // console.log("this.arry5 (TOTAL POINT) is EMPTY")
        for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
          this.finalObj.push({ "driver": this.chartOptions?.categories[x], "Speed": this.arry1[x], "HarshBraking": this.arry2[x], "HarshAcceleration": this.arry3[x], "SharpTurn": this.arry4[x] });
        }
      } else {
        // console.log("IN ELSE PART")
        for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
          this.finalObj.push({ "driver": this.chartOptions?.categories[x], "Speed": this.arry1[x], "HarshBraking": this.arry2[x], "HarshAcceleration": this.arry3[x], "SharpTurn": this.arry4[x], "total Point": this.arry5[x] });
        }
      }

      //set 5 records in array
      if (this.finalObj.length > 5) {
        this.finalObj.length = 5;
      }

      // console.log("ngOnChanges_this.finalObj-- ", this.finalObj);
      this.generateChart(this.finalObj);

      if (this.translateDetector && this.translateDetector.menuData) {
        this.translateDetector.menuData.subscribe(response => {
          this.generateChart(this.finalObj);
        });
      }

    }

  }

  generateChart(chartData) {
    this.language = this.getCookie('googtrans');
    this.language = this.language === '/en/ar' ? 'ar' : 'en';

    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      var chart = am4core.create("ddddddd", am4charts.XYChart);

      // Add data
      chart.data = chartData;
      // console.log("apiResponse.data[0]= ", this.finalObj)
      chart.legend = new am4charts.Legend();
      chart.legend.useDefaultMarker = false;
      let markerTemplate = chart.legend.markers.template;
      markerTemplate.width = 10;
      markerTemplate.height = 10;
      chart.legend.position = "top";
      chart.legend.valueLabels.template.disabled = false;

      // Create axes
      var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "driver";
      categoryAxis.title.text = "Drivers";

      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = false;
      categoryAxis.renderer.grid.template.opacity = 1;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 0;

      let array = this.arry1.concat(this.arry2, this.arry3, this.arry4);
      let getMinValue = false;
      if (array.includes(1)) {
        getMinValue = true;
      }

      if (this.arry1.length > 1 || this.arry2.length > 1 || this.arry3.length > 1 || this.arry4.length > 1 || this.arry5.length > 1) {
        getMinValue = false;
      }

      var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
      valueAxis.min = !getMinValue ? Math.min.apply(Math, this.arry5) : 0;
      valueAxis.title.text = "Score";
      valueAxis.renderer.ticks.template.strokeOpacity = 0.5;
      valueAxis.renderer.ticks.template.stroke = am4core.color("#495C43");
      valueAxis.renderer.ticks.template.length = 10;
      valueAxis.renderer.line.strokeOpacity = 0.5;

      valueAxis.renderer.grid.template.disabled = false;
      valueAxis.renderer.grid.template.opacity = 1;
      valueAxis.renderer.grid.template.location = 0;
      valueAxis.renderer.minGridDistance = 50;

      valueAxis.tooltip.disabled = false;

      // Create series
      function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "driver";
        series.stacked = true;
        series.name = name;

        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.locationX = 0.5;
        labelBullet.fontSize = 10;
        labelBullet.label.text = "{valueX}";
        labelBullet.label.fill = am4core.color("#fff");

        series.columns.template.tooltipText = "{name}\n[bold font-size: 20]{valueX}";
      }

      if (this.arry1.length > 0) {

        if (this.language == 'ar') {
          createSeries("Speed", this.graphJson.localization['ar'].speed);
        } else {
          createSeries("Speed", this.graphJson.localization['en'].speed);
        }

      }
      if (this.arry2.length > 0) {

        if (this.language == 'ar') {
          createSeries("HarshBraking", this.graphJson.localization['ar'].harshBraking);
        } else {
          createSeries("HarshBraking", this.graphJson.localization['en'].harshBraking);
        }

      }
      if (this.arry3.length > 0) {

        if (this.language == 'ar') {
          createSeries("HarshAcceleration", this.graphJson.localization['ar'].harshAcceleration);
        } else {
          createSeries("HarshAcceleration", this.graphJson.localization['en'].harshAcceleration);
        }

      }
      if (this.arry4.length > 0) {
        // createSeries("ShapTurn", "Sharp Turn");

        if (this.language == 'ar') {
          createSeries("ShapTurn", this.graphJson.localization['ar'].sharpTurn);
        } else {
          createSeries("ShapTurn", this.graphJson.localization['en'].sharpTurn);
        }


      }
      if (this.arry5.length > 0) {
        // createSeries("total Point", "Total Points");

        if (this.language == 'ar') {
          createSeries("total Point", this.graphJson.localization['ar'].totalPoints);
        } else {
          createSeries("total Point", this.graphJson.localization['en'].totalPoints);
        }

      }

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

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
}
