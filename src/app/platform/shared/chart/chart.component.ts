import { Component, Inject, EventEmitter, Input, OnInit, Output, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as sunburst from '@amcharts/amcharts4/plugins/sunburst';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})

export class ChartComponent implements OnInit {
  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;
  selectedGraphFilter;
  @Input() chartFilter;
  @Input() graphHeight;
  @Input() horizontal;
  chartOptions1;
  finalObj = [];
  @Output() selectedFilters = new EventEmitter<string>();
  private chart: am4charts.XYChart;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }

  }
  ngOnInit() {
    this.finalObj = [];
    this.generateGraphData();
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
    // console.log(this.chartOptions);
    for (let x = 0; x < this.chartOptions?.categories?.length; x++) {
      this.finalObj.push({ "name": this.chartOptions.categories[x], "children": [] });
    }

    for (let y = 0; y < this.chartOptions?.categories?.length; y++) {
      for (let z = 0; z < this.chartOptions.series.length; z++) {
        this.finalObj[y].children.push({ "name": this.chartOptions.series[z].name, "value": this.chartOptions.series[z].data[y] });
      }
    }
    // console.log(this.finalObj);
    this.generateChart(this.finalObj);
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
    // this.serial=graphData.series;
    // this.categories=graphData.xaxis.categories;
    // console.log(this.serial,"i am serial");
    // console.log(this.categories);
  }
  getSelectedGraphData(data) {
    this.selectedFilters.emit(data);
  }
  generateChart(chartData) {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      // create chart
      // console.log(am4core.create);
      let chart = am4core.create("xcv", sunburst.Sunburst);
      chart.padding(0, 0, 0, 0);
      chart.radius = am4core.percent(98);

      chart.data = chartData;

      chart.colors.step = 2;
      chart.fontSize = 11;
      chart.innerRadius = am4core.percent(10);

      // define data fields
      chart.dataFields.value = "value";
      chart.dataFields.name = "name";
      chart.dataFields.children = "children";


      let level0SeriesTemplate = new sunburst.SunburstSeries();
      level0SeriesTemplate.hiddenInLegend = false;
      chart.seriesTemplates.setKey("0", level0SeriesTemplate)

      // this makes labels to be hidden if they don't fit
      level0SeriesTemplate.labels.template.truncate = true;
      level0SeriesTemplate.labels.template.hideOversized = true;

      level0SeriesTemplate.labels.template.adapter.add("rotation", function (rotation, target) {
        target.maxWidth = target.dataItem.slice.radius - target.dataItem.slice.innerRadius - 10;
        target.maxHeight = Math.abs(target.dataItem.slice.arc * (target.dataItem.slice.innerRadius + target.dataItem.slice.radius) / 2 * am4core.math.RADIANS);

        return rotation;
      })


      let level1SeriesTemplate = level0SeriesTemplate.clone();
      chart.seriesTemplates.setKey("1", level1SeriesTemplate)
      level1SeriesTemplate.fillOpacity = 0.75;
      level1SeriesTemplate.hiddenInLegend = true;

      let level2SeriesTemplate = level0SeriesTemplate.clone();
      chart.seriesTemplates.setKey("2", level2SeriesTemplate)
      level2SeriesTemplate.fillOpacity = 0.5;
      level2SeriesTemplate.hiddenInLegend = true;

      chart.legend = new am4charts.Legend();
    });
  }
  ngOnChanges() {
    this.finalObj = [];
    // console.log("checkkkkkk");
    for (let x = 0; x < this.chartOptions.categories.length; x++) {
      this.finalObj.push({ "name": this.chartOptions.categories[x], "children": [] });
    }

    for (let y = 0; y < this.chartOptions.categories.length; y++) {
      for (let z = 0; z < this.chartOptions.series.length; z++) {
        this.finalObj[y].children.push({ "name": this.chartOptions.series[z].name, "value": this.chartOptions.series[z].data[y] });
      }
    }
    // console.log(this.finalObj);
    this.generateChart(this.finalObj);
  }

  ngAfterViewInit() {

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
