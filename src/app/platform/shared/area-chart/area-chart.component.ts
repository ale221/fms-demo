import { Component, EventEmitter, Input, OnInit, Output, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { isPlatformBrowser } from '@angular/common';
import { Dictionary } from './Dictionary';

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.css']
})
export class AreaChartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;

  @Input() chartFilter;
  @Input() graphHeight;
  categories = [];
  categories1 = [];
  series = [];
  selectedGraphFilter;
  chartOptions1;
  finalObj: any = {
    seriesData: []
  };
  finalObj_data = [];
  arry1 = [];
  arry2 = [];
  arry3 = [];
  arry4 = [];
  arry5 = [];

  @Output() selectedFilters = new EventEmitter<string>();

  private chart: am4charts.XYChart;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  ngOnInit() {
    // this.generateGraphData();
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }
  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  ngOnChanges() {
    this.finalObj_data = [];
    // console.log('this.chartOptions================== ', this.chartOptions)
    this.categories1 = this.chartOptions?.categories;
    this.series = this.chartOptions?.series;

    let mainArray = [];
    let seriesObj = {};
    let seriesArrayTemp = [];

    this.series.forEach((element, i) => {
      seriesObj[element.name] = '';
      seriesArrayTemp.push(element.name);
    });

    this.categories1.forEach(element => {
      mainArray.push({ category: element, series: seriesObj });
    });

    mainArray.forEach((element, m) => {
      let getSeries = element.series;
      let i = 0;
      element.violations = [];
      for (var key in getSeries) {
        const l = this.series.filter(item => {
          return item.name === seriesArrayTemp[i];
        });
        let violationType = l[0];
        if (violationType.name === key) {
          element.violations.push(violationType)
        }
        i++;
      }

      element.seriesArray = [];
      element.violations.forEach(violation => {
        for (var key in getSeries) {
          if (key === violation.name) {
            element.seriesArray.push(violation.data[m]);
          }
        }
      })
    });

    let myArray = []
    for (let m = 0; m < mainArray.length; m++) {
      let element = mainArray[m];
      element.series1 = [];
      let k = 0;
      let getSeries = element.series;
      for (var key in getSeries) {
        element.series1[key] = element.seriesArray[k];
        k++
      }
      element.series = element.series1;
      myArray.push(element);
    }
    // console.log("myARRAY= ", myArray)
    this.finalObj = myArray;
    // console.log("MUSHAHID BHAI DATA= ", this.finalObj)

    for (let i = 0; i < this.finalObj.length; i++) {
      var dic = new Dictionary();
      dic.set("category", this.finalObj[i].category);

      for (let j = 0; j < this.series.length; j++) {
        if (this.series[j].name === 'Speed') {
          dic.set("speed", this.series[j].data[i]);
        }
        else if (this.series[j].name === 'HarshBraking') {
          dic.set("harshBraking", this.series[j].data[i]);
        }
        else if (this.series[j].name === 'HarshAcceleration') {
          dic.set("harshAcceleration", this.series[j].data[i]);
        }
        else if (this.series[j].name === 'SharpTurn') {
          dic.set("sharpTurn", this.series[j].data[i]);
        }

      }
      this.finalObj_data.push(dic.items)
    }

    if (this.finalObj_data && this.finalObj_data.length === 1) {
      let params = {
        category: this.finalObj_data[0].category + ' ',
        harshAcceleration: 0,
        harshBraking: 0,
        sharpTurn: 0,
        speed: 0
      }
      this.finalObj_data.push(params)
    }

    this.aggressivelyVehicleFleet(this.finalObj_data)
    // this.graphBuild(this.finalObj);
    // this.generateChart(this.finalObj_data);

  }

  aggressivelyVehicleFleet(data) {
    // Create chart instance
    let chart = am4core.create("fffffffff", am4charts.XYChart);
    chart.colors.step = 2;
    // Add data
    chart.data = data;
    let category_name = ''
    for (let i = 0; i < this.finalObj.length; i++) {
      category_name = category_name + this.finalObj[i].category + ' '
    }
    // Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.title.text = "Category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.startLocation = 0.5;
    categoryAxis.endLocation = 0.6;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "";
    valueAxis.calculateTotals = true;
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.labels.template.adapter.add("text", function (text) {
      return text + "%";
    });

    // Create series
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "speed";
    series.dataFields.valueYShow = "totalPercent";
    series.dataFields.categoryX = "category";
    series.name = "Speed";

    series.tooltipHTML = "<span style='font-size:14px; color:#000000;'><b>Speed: {valueY.value}</b></span>";

    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color("#FFF");

    series.tooltip.getStrokeFromObject = true;
    series.tooltip.background.strokeWidth = 3;

    series.fillOpacity = 0.85;
    series.stacked = true;

    // static
    // series.legendSettings.labelText = "Speed total:";
    // series.legendSettings.valueText = "{valueY.close}";

    // hovering
    series.legendSettings.itemLabelText = "Speed:";
    series.legendSettings.itemValueText = "{valueY}";

    let series2 = chart.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = "harshBraking";
    series2.dataFields.valueYShow = "totalPercent";
    series2.dataFields.categoryX = "category";
    series2.name = "Harsh Braking";

    series2.tooltipHTML = "<span style='font-size:14px; color:#000000;'><b>Harsh Braking: {valueY.value}</b></span>";

    series2.tooltip.getFillFromObject = false;
    series2.tooltip.background.fill = am4core.color("#FFF");

    series2.tooltip.getStrokeFromObject = true;
    series2.tooltip.background.strokeWidth = 3;

    series2.fillOpacity = 0.85;
    series2.stacked = true;

    // static
    // series2.legendSettings.labelText = "Harsh Braking total:";
    // series2.legendSettings.valueText = "{valueY.close}";

    // hovering
    series2.legendSettings.itemLabelText = "Harsh Braking:";
    series2.legendSettings.itemValueText = "{valueY}";

    let series3 = chart.series.push(new am4charts.LineSeries());
    series3.dataFields.valueY = "harshAcceleration";
    series3.dataFields.valueYShow = "totalPercent";
    series3.dataFields.categoryX = "category";
    series3.name = "Harsh Acceleration";
    series3.tooltipText = "{name}: [bold]{valueY}[/]";

    series3.tooltipHTML = "<span style='font-size:14px; color:#000000;'><b>Harsh Acceleration: {valueY.value}</b></span>";

    series3.tooltip.getFillFromObject = false;
    series3.tooltip.background.fill = am4core.color("#FFF");

    series3.tooltip.getStrokeFromObject = true;
    series3.tooltip.background.strokeWidth = 3;

    series3.fillOpacity = 0.85;
    series3.stacked = true;

    // static
    // series3.legendSettings.labelText = "Harsh Acceleration total:";
    // series3.legendSettings.valueText = "{valueY.close}";

    // hovering
    series3.legendSettings.itemLabelText = "Harsh Acceleration:";
    series3.legendSettings.itemValueText = "{valueY}";


    let series4 = chart.series.push(new am4charts.LineSeries());
    series4.dataFields.valueY = "sharpTurn";
    series4.dataFields.valueYShow = "totalPercent";
    series4.dataFields.categoryX = "category";
    series4.name = "Sharp Turn";
    series4.tooltipText = "{name}: [bold]{valueY}[/]";

    series4.tooltipHTML = "<span style='font-size:14px; color:#000000;'><b>Sharp Turn: {valueY.value}</b></span>";

    series4.tooltip.getFillFromObject = false;
    series4.tooltip.background.fill = am4core.color("#FFF");

    series4.tooltip.getStrokeFromObject = true;
    series4.tooltip.background.strokeWidth = 3;

    series4.fillOpacity = 0.85;
    series4.stacked = true;

    // static
    // series4.legendSettings.labelText = "Sharp Turn total:";
    // series4.legendSettings.valueText = "{valueY.close}";

    // hovering
    series4.legendSettings.itemLabelText = "Sharp Turn:";
    series4.legendSettings.itemValueText = "{valueY}";

    // Add cursor
    chart.cursor = new am4charts.XYCursor();

    // add legend
    // chart.legend = new am4charts.Legend();


  }

  //OLD CODE
  generateChart(chartData) {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      var chart = am4core.create("fffffffff", am4charts.XYChart);

      // Add data
      chart.data = chartData;
      console.log("GRAPHHH=++= ", chartData)
      // Create axes
      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 0;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      // Create series
      function createSeries(field, name) {
        var series = chart.series.push(new am4charts.LineSeries());
        series.dummyData = {
          field: field
        }
        series.dataFields.valueY = field;
        series.dataFields.openValueY = field;
        series.dataFields.categoryX = "category";
        series.name = name;
        series.tooltipText = "[font-size: 18]{name}[/]\n{categoryX}: [bold]{" + field + "}[/]";
        series.strokeWidth = 1;
        series.fillOpacity = 1;
        series.tensionX = 0.8;
        return series;
      }

      createSeries("Speed", "Speeding");
      createSeries("HarshBraking", "Harsh Braking");
      createSeries("HarshAcceleration", "Harsh Accelaration");
      // createSeries("Geozone Violation", "Geozone violation");
      createSeries("SharpTurn", "Sharp Turn");

      // Add legend
      chart.legend = new am4charts.Legend();
      chart.legend.useDefaultMarker = false;
      let markerTemplate = chart.legend.markers.template;
      markerTemplate.width = 10;
      markerTemplate.height = 10;
      chart.legend.position = "top";
      chart.legend.valueLabels.template.disabled = false;

      // Cursor
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.maxTooltipDistance = 0;

      // Prepare data for the river-stacked series
      chart.events.on("beforedatavalidated", updateData);

      function updateData() {
        var data = chart.data;
        if (data.length == 0) {
          return;
        }

        for (var i = 0; i < data.length; i++) {
          var row = data[i];
          var sum = 0;

          // Calculate open and close values
          chart.series.each(function (series) {
            var field = series.dummyData.field;
            var val = Number(row[field]);
            row[field] = sum;
            row[field] = sum + val;
            sum += val;
          });

          // // Adjust values so they are centered
          // var offset = sum / 2;
          // chart.series.each(function(series) {
          //     var field = series.dummyData.field;
          //     row[field + "_low"] -= offset;
          //     row[field + "_hi"] -= offset;
          // });
        }
      }
    });
  }


  generateGraphData() {
    let graphData = {
      series: [],
      labels: [],
      xaxis: null,
      stroke: {
        curve: "smooth"
      },
      chart: {
        height: this.graphHeight,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      // tooltip: {
      //   x: {
      //     format: "dd/MM/yy HH:mm"
      //   }
      // }
    }
    let categories = [];
    // if (this.chartOptions && this.chartOptions.length > 0) {
    let uniqueFleets = this.chartOptions.filter((v, i) => this.chartOptions.findIndex(item => item.fleet_id == v.fleet_id) === i);
    uniqueFleets.forEach(element => {
      var filteredFleets = this.getFilteredFleets(this.chartOptions, "fleet_id", element.fleet_id);
      if (filteredFleets && filteredFleets.length > 0) {
        let seriesObj = {
          name: '',
          data: [],
          categories: []
        };
        filteredFleets.forEach((fleet, j) => {
          if (j === 0) {
            seriesObj.name = fleet.fleet_name;
          }
          seriesObj.data.push(fleet.count)
          categories.push(fleet.day)
        });
        graphData.series.push(seriesObj);
      }
    });
    graphData.xaxis = {
      // type: "datetime",
      categories
    }
    this.chartOptions1 = graphData;
    // console.log(this.chartOptions1.series,"111111111");
    // console.log(this.chartOptions1.xaxis.categories,"222222222222");
    this.categories = this.chartOptions1.xaxis.categories.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    })
    // console.log(this.categories);
    // }
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
