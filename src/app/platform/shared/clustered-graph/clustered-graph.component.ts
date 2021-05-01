import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

@Component({
  selector: 'app-clustered-graph',
  templateUrl: './clustered-graph.component.html',
  styleUrls: ['./clustered-graph.component.css']
})
export class ClusteredGraphComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;

  @Input() chartFilter;
  @Input() graphHeight;
  @Input() horizontal;
  data = [];
  series = [];
  categories = [];
  selectedGraphFilter;
  chartOptions1;
  @Output() selectedFilters = new EventEmitter<string>();
  selectedIndex;
  finalObj = [];
  chart = am4core.create("chartdiv", am4charts.XYChart);

  constructor() { }

  ngOnInit(): void {
    // console.log("clustered-graph chartOptions= ", this.chartOptions)
    this.series = this.chartOptions?.series;
    this.categories = this.chartOptions?.categories;

    for (let i = 0; i < this.categories?.length; i++) {
      this.finalObj.push({
        "category": this.chartOptions?.categories[i]
      });

      if (i === 0) {
        this.finalObj[i].noMaintenanceProbability = this.series[0]?.data[i];
        this.finalObj[i].replaceProbability = this.series[1]?.data[i];
        this.finalObj[i].maintenanceProbability = this.series[2]?.data[i];
      }
      if (i === 1) {
        this.finalObj[i].noMaintenanceProbability = this.series[0]?.data[i];
        this.finalObj[i].replaceProbability = this.series[1]?.data[i];
        this.finalObj[i].maintenanceProbability = this.series[2]?.data[i];
      }
      if (i === 2) {
        this.finalObj[i].noMaintenanceProbability = this.series[0]?.data[i];
        this.finalObj[i].replaceProbability = this.series[1]?.data[i];
        this.finalObj[i].maintenanceProbability = this.series[2]?.data[i];
      }
      if (i === 3) {
        this.finalObj[i].noMaintenanceProbability = this.series[0].data[i];
        this.finalObj[i].replaceProbability = this.series[1]?.data[i];
        this.finalObj[i].maintenanceProbability = this.series[2]?.data[i];
      }

    }

    this.generateChart(this.finalObj);
  }

  generateChart(data) {
    let chart = am4core.create("chartdiv", am4charts.XYChart);

    chart.data = data;

    // Create x-axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    // categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.labels.template.fontSize = 0;

    // Create y-axes
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.disabled = true;
    valueAxis.min = 0;

    // Create series
    function createSeries(field, name) {

      // Set up series
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.name = name;
      series.dataFields.valueY = field;
      series.dataFields.categoryX = "category";
      series.sequencedInterpolation = true;

      // Make it stacked
      // series.stacked = true;

      // Configure columns
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}";

      // Add label
      let labelBullet = series.bullets.push(new am4charts.LabelBullet());
      labelBullet.label.text = "{valueY}";
      labelBullet.locationY = 0.5;
      labelBullet.label.hideOversized = true;

      return series;
    }

    createSeries("noMaintenanceProbability", "No Maintenance Probability");
    createSeries("replaceProbability", "Replace Probability");
    createSeries("maintenanceProbability", "Maintenance Probability");

    // Legend
    chart.legend = new am4charts.Legend();
  }

}
