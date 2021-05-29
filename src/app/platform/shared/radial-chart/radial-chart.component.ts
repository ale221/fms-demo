import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { isPlatformBrowser } from '@angular/common';
declare var $: any;

// Themes begin
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);
// Themes end

@Component({
  selector: 'app-radial-chart',
  templateUrl: './radial-chart.component.html',
  styleUrls: ['./radial-chart.component.css']
})
export class RadialChartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;
  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;
  chartOptions1;

  @Output() selectedFilters = new EventEmitter<string>();

  private chart: am4charts.SlicedChart;
  finalObj = [];

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  ngOnInit() {
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }
  ngOnChanges() {
    this.finalObj = [];
    // // console.log("inside ngOnchanges--", this.chartOptions);
    if (this.chartOptions?.categories && this.chartOptions?.categories.length > 0) {
      for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
        this.finalObj.push({ "name": this.chartOptions?.categories[x], "value": this.chartOptions?.values[x] });
      }

      if (this.finalObj.length > 10) {
        this.finalObj.length = 10;
      }

      this.generateChart(this.finalObj);
    }
  }

  generateChart(chartData) {
    let chart = am4core.create("spacerrrr", am4charts.SlicedChart);
    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
    chart.logo.height = -105;
    chart.data = chartData;

    let series = chart.series.push(new am4charts.FunnelSeries());
    series.colors.step = 2;
    series.dataFields.value = "value";
    series.dataFields.category = "name";
    series.alignLabels = false; //true; //will add a horizontal line that represent the legend

    series.labelsContainer.paddingLeft = 150;
    series.labelsContainer.width = 100;

    // series.orientation = "vertical";
    // series.bottomRatio = 1;

    // chart.legend = new am4charts.Legend();
    // chart.legend.position = "left";
    // chart.legend.valign = "bottom";
    // chart.legend.margin(5, 5, 20, 5);

    setTimeout(() => {
      $('#space1rrr').css('overflow-x', 'scroll');
    }, 500);

  }

  getFilteredFleets(array, key, value) {
    return array.filter(function (e) {
      return e[key] == value;
    });
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
