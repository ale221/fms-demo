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
  selector: 'app-tree-chart',
  templateUrl: './tree-chart.component.html',
  styleUrls: ['./tree-chart.component.css']
})
export class TreeChartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;
  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;
  @Output() selectedFilters = new EventEmitter<string>();
  data = [];
  chartOptions1;

  private chart: am4charts.TreeMap;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  ngOnInit(): void {
    // // console.log(this.chartFilter,this.selectedGraphFilter);
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }

  ngOnChanges() {
    this.data = [];
    let graphData = {
      series: [],
      legend: {
        show: true
      },
      chart: {
        height: this.graphHeight,
        type: "treemap"
      },
      title: {
        align: "center"
      }
    }
    if (this.chartOptions) {
      graphData.series = this.chartOptions;
    }
    this.chartOptions1 = graphData.series;

    for (let x = 0; x < this.chartOptions1.series.length; x++) {
      this.data.push({ "name": this.chartOptions1.series[x].name, "children": [] })
    }

    for (let x = 0; x < this.chartOptions1.series.length; x++) {
      for (let y = 0; y < this.chartOptions1.series[x].data.length; y++) {
        this.data[x].children.push({ "name": this.chartOptions1.categories[y], "value": this.chartOptions1.series[x].data[y] })
      }
    }

    // console.log("DRIVER VIOLATION GRAPH DATA== ", this.data);
    this.generateChart(this.data);
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
  generateChart(chartData) {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      var chart = am4core.create("vvvv", am4charts.TreeMap);
      chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
      chart.logo.height = -105;
      chart.data = chartData;
      //   chart.data = [
      //     {
      //     name: "F1, F2",
      //     children: [{
      //       name: 'nodeAb',
      //       value: 6
      //     }, {
      //       name: "Fleet1",
      //       value: 100
      //     }]
      //   }, {
      //     name: "F3",
      //     children: [{
      //       name: "Fleet2",
      //       value: 114
      //     }]

      //   }
      // ];

      chart.colors.step = 2;

      // define data fields
      chart.dataFields.value = "value";
      chart.dataFields.name = "name";
      chart.dataFields.children = "children";

      chart.zoomable = false;
      var bgColor = new am4core.InterfaceColorSet().getFor("background");

      // level 0 series template
      var level0SeriesTemplate = chart.seriesTemplates.create("0");
      var level0ColumnTemplate = level0SeriesTemplate.columns.template;

      level0ColumnTemplate.column.cornerRadius(10, 10, 10, 10);
      level0ColumnTemplate.fillOpacity = 0;
      level0ColumnTemplate.strokeWidth = 10;
      level0ColumnTemplate.strokeOpacity = 0;

      // level 1 series template
      var level1SeriesTemplate = chart.seriesTemplates.create("1");
      var level1ColumnTemplate = level1SeriesTemplate.columns.template;

      level1SeriesTemplate.tooltip.animationDuration = 0;
      level1SeriesTemplate.strokeOpacity = 1;

      level1ColumnTemplate.column.cornerRadius(0, 0, 0, 0)
      level1ColumnTemplate.fillOpacity = 1;
      level1ColumnTemplate.strokeWidth = 0;
      level1ColumnTemplate.stroke = bgColor;

      var bullet1 = level1SeriesTemplate.bullets.push(new am4charts.LabelBullet());
      bullet1.locationY = 0.5;
      bullet1.locationX = 0.5;
      bullet1.label.text = "{name}";
      bullet1.label.fill = am4core.color("#ffffff");

      chart.maxLevels = 2;
    });


  }
  ngAfterViewInit() {
    // Chart code goes in here
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
