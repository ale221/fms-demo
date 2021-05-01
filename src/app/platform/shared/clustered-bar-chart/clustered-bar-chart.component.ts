import { Component, OnInit, Input, Output, EventEmitter, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Themes begin
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);
// Themes end

@Component({
  selector: 'app-clustered-bar-chart',
  templateUrl: './clustered-bar-chart.component.html',
  styleUrls: ['./clustered-bar-chart.component.css']
})
export class ClusteredBarChartComponent implements OnInit {

  @Input() chartOptions;
  @Input() graphId;
  @Input() graphType;
  @Input() graphUseCaseId;
  @Input() chartFilter;
  @Input() graphHeight;

  selectedGraphFilter;
  @Output() selectedFilters = new EventEmitter<string>();
  finalData = [];
  chartOptions1;

  categories = [];
  series = [];

  // private chart: am4charts.TreeMap;

  constructor(private zone: NgZone, @Inject(PLATFORM_ID) private platformId) { }

  ngOnInit(): void {
    this.selectedGraphFilter = {
      id: this.graphId,
      type: this.graphType,
      use_case_id: this.graphUseCaseId,
    }
  }

  ngOnChanges() {
    this.categories = this.chartOptions?.categories;
    this.series = this.chartOptions?.series;

    let mainArray = [];

    if (this.series?.length > 0) {
      let fleetArray = [];
      let arrayData = [];
      for (let i = 0; i < this.series?.length; i++) {
        let element = this.series[i];
        fleetArray.push(element.name)
        for (let j = 0; j < this.series[i].data?.length; j++) {
          if (this.series[i].data[j] !== 0) {
            arrayData.push({ value: this.series[i].data[j], driver: this.categories[j], fleet: element.name })
          }
        }
        mainArray['data'] = arrayData;
      }
      mainArray['fleets'] = fleetArray;
    }

    let arrayFormat = [];

    let data = mainArray['data'];

    if (mainArray) {
      if (mainArray['fleets'].length > 0) {
        mainArray['fleets'].forEach((element, i) => {
          let params = {}
          if (i < 5) {
            params[element.replace(/\s+/g, '')] = element;
            params['graphFleet'] = element;
          }
          arrayFormat.push(params)
        });
      }
    }

    if (arrayFormat && arrayFormat.length > 0) {
      mainArray['fleets'].forEach((element) => {
        const x = data.filter(item => {
          return item.fleet === element;
        })
        arrayFormat.forEach(element => {
          if (x && x.length > 0 && element[x[0].fleet.replace(/\s+/g, '')] === x[0].fleet) {
            element.data = x;
          }
        })
      })
    }

    arrayFormat.forEach((element, j) => {
      if (element.data && element.data.length > 0) {
        let dynamic_keys = []
        let params = {}
        let data_one = []
        element.data.forEach((elem, i) => {
          if (i < 5) {
            params[elem.driver.replace(/\s+/g, '')] = elem.value
            dynamic_keys.push(elem.driver.replace(/\s+/g, ''));
          }
        });
        data_one.push(params);
        element.data_one = data_one[0];
        element.dynamic_keys = dynamic_keys;
      }
    })



    arrayFormat.forEach((element, j) => {
      if (element.data && element.data.length > 0) {
        element.data.forEach((elem, i) => {
          if (i < 5) {
            element[element.dynamic_keys[i]] = element.data_one[element.dynamic_keys[i]]
          }
        });
      }
    })

    this.finalData = arrayFormat;

    this.secondGraph(this.finalData);
    // this.generateChart(this.finalData);
  }

  secondGraph(chartdata) {
    let chart = am4core.create('vvvv', am4charts.XYChart)
    chart.colors.step = 2;
    // Create axes
    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'graphFleet'
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;


    // Create y-axes
    let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // yAxis.renderer.inside = true;
    // yAxis.renderer.labels.template.disabled = true;
    // yAxis.min = 0;

    function createSeries(value, name) {
      let series = chart.series.push(new am4charts.ColumnSeries());
      series.name = name;
      series.dataFields.valueY = value;
      series.dataFields.categoryX = 'graphFleet';
      series.sequencedInterpolation = true;

      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size: 14px]{categoryX}: {valueY}";


      let bullet = series.bullets.push(new am4charts.LabelBullet())
      bullet.locationY = 0.5;
      bullet.label.hideOversized = true;

      // bullet.label.text = '{valueY}'
      // bullet.label.dy = -20;
      // bullet.locationY = 0.5;

      // bullet.label.fill = am4core.color('#ffffff')
      // bullet.label.rotation = 90;
      // bullet.label.truncate = false;
      // bullet.label.hideOversized = false;
      return series;
    }

    chart.data = chartdata;
    let graphKeys = [];
    let graphValues = [];

    chartdata.forEach((element, i) => {
      if (!element.data) {
        chartdata.splice(i, 1)
      }
    });

    chartdata.forEach(element => {
      element.dynamic_keys.forEach((elem, i) => {
        graphKeys.push(elem);
        graphValues.push(element.data[i].driver);
      });
    });

    graphKeys = graphKeys.filter(function (item, pos) {
      return graphKeys.indexOf(item) == pos;
    })

    graphValues = graphValues.filter(function (item, pos) {
      return graphValues.indexOf(item) == pos;
    })

    graphKeys.forEach((elem, i) => {
      createSeries(elem, graphValues[i])
    });

  }

  // generateChart(chartData) {
  //   let chart = am4core.create("vvvv", am4charts.XYChart);
  //   // Add data
  //   chart.data = chartData;

  //   // Create axes
  //   let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  //   categoryAxis.dataFields.category = "graphFleet";
  //   categoryAxis.numberFormatter.numberFormat = "#";
  //   categoryAxis.renderer.inversed = true;
  //   categoryAxis.renderer.grid.template.location = 0;
  //   categoryAxis.renderer.cellStartLocation = 0.1;
  //   categoryAxis.renderer.cellEndLocation = 0.9;

  //   let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  //   valueAxis.renderer.opposite = true;

  //   // Create series
  //   function createSeries(field, name) {
  //     let series = chart.series.push(new am4charts.ColumnSeries());
  //     series.dataFields.valueX = field;
  //     series.dataFields.categoryY = "graphFleet";
  //     series.name = name;
  //     series.tooltipText = "{name}: [bold]{valueX}[/]";
  //     series.columns.template.height = am4core.percent(300);
  //     series.columns.template.width = am4core.percent(100);
  //     series.columns.template.marginBottom = am4core.percent(200)
  //     // series.sequencedInterpolation = true;
  //     series.clustered = true;

  //     let valueLabel = series.bullets.push(new am4charts.LabelBullet());
  //     valueLabel.label.text = "{valueX}";
  //     valueLabel.label.horizontalCenter = "left";
  //     valueLabel.label.dx = 10;
  //     valueLabel.label.dy = 20;
  //     // valueLabel.label.hideOversized = false;
  //     // valueLabel.label.truncate = false;

  //     // let categoryLabel = series.bullets.push(new am4charts.LabelBullet());
  //     // categoryLabel.label.text = "{name}";
  //     // categoryLabel.label.horizontalCenter = "right";
  //     // categoryLabel.label.dx = -10;
  //     // categoryLabel.label.fill = am4core.color("#fff");
  //     // categoryLabel.label.hideOversized = false;
  //     // categoryLabel.label.truncate = false;
  //   }

  //   let graphKeys = [];
  //   let graphValues = [];

  //   chartData.forEach(element => {
  //     element.dynamic_keys.forEach((elem, i) => {
  //       graphKeys.push(elem);
  //       graphValues.push(element.data[i].driver);
  //     });
  //   });

  //   graphKeys = graphKeys.filter(function(item, pos) {
  //     return graphKeys.indexOf(item) == pos;
  //   })

  //   graphValues = graphValues.filter(function(item, pos) {
  //     return graphValues.indexOf(item) == pos;
  //   })

  //   graphKeys.forEach((elem, i) => {
  //     createSeries(elem, graphValues[i])
  //   });


  //   chart.cursor = new am4charts.XYCursor();
  // }



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
}
