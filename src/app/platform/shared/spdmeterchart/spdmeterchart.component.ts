import {Component, EventEmitter, Input, OnInit, Output,Inject, NgZone, PLATFORM_ID, ViewChild } from '@angular/core';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";


import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-spdmeterchart',
  templateUrl: './spdmeterchart.component.html',
  styleUrls: ['./spdmeterchart.component.css']
})
export class SpdmeterchartComponent implements OnInit {

  private chart: am4charts.GaugeChart;
  @Input() speed: any;
  updated_speed;

  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {}

  ngOnInit(): void {
    this.browserOnly(() => {
      let chart = am4core.create("spdmeter", am4charts.GaugeChart);
      chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

      chart.innerRadius = -25;

      let axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
      axis.min = 0;
      axis.max = 100;
      axis.strictMinMax = true;
      axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor("background");
      axis.renderer.grid.template.strokeOpacity = 0.3;

      let colorSet = new am4core.ColorSet();

      let range0 = axis.axisRanges.create();
      range0.value = 0;
      range0.endValue = 50;
      range0.axisFill.fillOpacity = 1;
      range0.axisFill.fill = colorSet.getIndex(0);
      range0.axisFill.zIndex = - 1;

      let range1 = axis.axisRanges.create();
      range1.value = 50;
      range1.endValue = 80;
      range1.axisFill.fillOpacity = 1;
      range1.axisFill.fill = colorSet.getIndex(2);
      range1.axisFill.zIndex = -1;

      let range2 = axis.axisRanges.create();
      range2.value = 80;
      range2.endValue = 100;
      range2.axisFill.fillOpacity = 1;
      range2.axisFill.fill = colorSet.getIndex(4);
      range2.axisFill.zIndex = -1;

      let hand = chart.hands.push(new am4charts.ClockHand());

      // using chart.setTimeout method as the timeout will be disposed together with a chart
      chart.setTimeout(randomValue, 2000);
      let speed = this.speed;
      console.log("ahmmmm",speed);
      function randomValue() {
        if (speed) {
          hand.showValue(speed, 1000, am4core.ease.cubicOut);
          chart.setTimeout(randomValue, 2000);
        }
      }

    });

  }

  ngOnChanges() {
    console.log(this.speed, 'updating');
    if(this.speed>0){
      this.updated_speed=this.speed
    }

    console.log("this.updated_speed-= ", this.updated_speed);

    this.browserOnly(() => {
      let chart = am4core.create("spdmeter", am4charts.GaugeChart);
      chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

      chart.innerRadius = -25;

      let axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
      axis.min = 0;
      axis.max = 100;
      axis.strictMinMax = true;
      axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor("background");
      axis.renderer.grid.template.strokeOpacity = 0.3;

      let colorSet = new am4core.ColorSet();

      let range0 = axis.axisRanges.create();
      range0.value = 0;
      range0.endValue = 50;
      range0.axisFill.fillOpacity = 1;
      range0.axisFill.fill = colorSet.getIndex(0);
      range0.axisFill.zIndex = - 1;

      let range1 = axis.axisRanges.create();
      range1.value = 50;
      range1.endValue = 80;
      range1.axisFill.fillOpacity = 1;
      range1.axisFill.fill = colorSet.getIndex(2);
      range1.axisFill.zIndex = -1;

      let range2 = axis.axisRanges.create();
      range2.value = 80;
      range2.endValue = 100;
      range2.axisFill.fillOpacity = 1;
      range2.axisFill.fill = colorSet.getIndex(4);
      range2.axisFill.zIndex = -1;

      let hand = chart.hands.push(new am4charts.ClockHand());

      // using chart.setTimeout method as the timeout will be disposed together with a chart
      chart.setTimeout(randomValue, 2000);
      
      let speed = this.updated_speed;
      console.log("ahmmmm",speed);
      function randomValue() {
        if (speed) {
          hand.showValue(speed, 5000, am4core.ease.cubicOut);
          chart.setTimeout(randomValue, 2000);
        }
      }

    });
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }

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
