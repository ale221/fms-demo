// Created By Mushahid Hussain 01/09/2020
import { Component, OnInit } from '@angular/core';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { SwalService } from 'src/app/core/services/swal.service';
import { FormService } from '../../services/FormService';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { AuthService } from 'src/app/Services/auth.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { User } from 'src/app/core/model/user';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { DrawerService } from 'src/app/core/services/drawer.service';

// theme
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-admin-graph-form',
  templateUrl: './admin-graph-form.component.html',
  styleUrls: ['./admin-graph-form.component.css']
})
export class AdminGraphFormComponent implements OnInit {

  usecases;
  dashboards;
  usecasesDashboard;
  selectedUsecase;
  setCardObj = [];
  selectedUsecaseObj;
  selectedDashboardObj;
  graphHeight = 500;
  useCaseId = 0;
  isAuthorized = false;
  loggedInUser;
  packageType: any;
  vehicleMaintenanceGraph = [];
  vehicleMaintenanceObject: any
  sidebarCheck: any;

  constructor(private formService: FormService,
    private swalService: SwalService,
    private getUsecase: GetUsecaseService,
    private authService: AuthService, private drawerService: DrawerService) {
    this.useCaseId = getUsecase.getUsecaseId()
    this.packageType = PackageType;
  }

  isAuthorizedUser(value) {
    const u = this.authService.getUser() as User;
    if (u['package'][0].package_id === this.packageType.standard) {
      this.isAuthorized = value;
    } else if (u['package'][0].package_id === this.packageType.png) {
      this.isAuthorized = false;
    }
  }


  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.loggedInUser = this.authService.getUser();
    this.getUserCases();
  }

  getUserCases() {
    this.formService.getUsecases('true').subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.usecases = apiResponse['data'];
        if (this.usecases && this.usecases.length > 0) {
          this.usecases.forEach(element => {
            if (element.id === this.useCaseId) {
              this.selectedUsecase = element.name;
              this.selectedUsecaseObj = element;
              this.dashboards = element.dashboard;
              this.selectedDashboardObj = element.dashboard[0];
              let event = { value: { id: element.id } }
              this.dashboardChange(event)
            }
          });
        }
      } else {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });
  }

  usecaseChange(event) {
    this.selectedUsecase = event.value.name;
    this.dashboards = [];
    this.dashboards = event.value.dashboard
    this.usecasesDashboard = [];
    this.selectedDashboardObj = null;
  }

  dashboardChange(event) {
    this.formService.getUsecasesDashboardsGraphs(event.value.id).subscribe(apiResponse => {
      this.usecasesDashboard = [];

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        if (this.loggedInUser.package[0].package_id == this.packageType.standard) {
          // console.log("inside if confition")
          // show all graphs to standard user
          this.usecasesDashboard = apiResponse['data'];

          if (this.usecasesDashboard?.length > 0) {
            for (let i = 0; i < this.usecasesDashboard?.length; i++) {
              if (this.usecasesDashboard[i].name == 'Vehicle Maintenance Graph') {
                this.vehicleMaintenanceObject = this.usecasesDashboard[i]
                // console.log(" this.vehicleMaintenanceObject == ", this.vehicleMaintenanceObject)
                setTimeout(() => {
                  this.generateChart(this.vehicleMaintenanceObject.data.chart_data);
                }, 500);
              }
            }

            if (event.value.id !== 16) {
              this.vehicleMaintenanceObject = null;
            }
          }

          // console.log("this.usecasesDashboard---><--", this.usecasesDashboard)
        } else {
          // console.log("inside else confition")
          // show specific graphs to plug & go user
          let dataFromResponse = [];
          let filterArray = [];
          dataFromResponse = apiResponse['data'];
          filterArray = dataFromResponse.filter(function (index) {
            return index.name != 'Average Statistics' && index.name != 'Maintenance status ' && index.name != 'Probability of Vehicle Maintenance' && index.name != 'Driver Violations' && index.name != 'Driver Tasks Status' && index.name != 'Driver Allocations';
          })
          this.usecasesDashboard = filterArray;
        }

        this.setCardObj = [];
        this.usecasesDashboard.forEach(element => {
          this.setCardObj.push({ card_id: element.id, is_selected: element.is_selected });
        });
      } else {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });
  }

  setGraphId(card, event) {
    if (event.target.checked) {
      this.setCardObj.forEach(element => {
        if (card.id === element.card_id) {
          element.is_selected = true;
        }
      });
    } else {
      this.setCardObj.forEach(element => {
        if (card.id === element.card_id) {
          element.is_selected = false;
        }
      });
    }
  }

  saveCardSettings() {
    // let count = 0;
    // if (this.setCardObj.length ) {
    //   this.setCardObj.forEach(element => {
    //     if (element.is_selected) {
    //       count++;
    //     }
    //   });

    //   if (count > 2) {
    //     if (count > 8) {
    //       this.swalService.getErrorSwal('You can select maximum eight cards!');
    //       return;
    //     }
    //   } else {
    //     this.swalService.getErrorSwal('Please select atleast three cards!');
    //     return;
    //   }


    // }

    this.formService.saveCards(this.setCardObj).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal(apiResponse['message']);
      } else {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });
  }

  generateChart(chartData) {
    am4core.ready(function () {
      // Themes
      am4core.useTheme(am4themes_animated);

      var chart = am4core.create("chartdiv", am4charts.XYChart);
      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

      chart.data = chartData;
      // console.log("GEN CHART func= ", chartData);
      chart.colors.step = 5;

      // Add legend
      chart.legend = new am4charts.Legend();
      chart.legend.useDefaultMarker = false;
      let markerTemplate = chart.legend.markers.template;
      markerTemplate.width = 5;
      markerTemplate.height = 5;
      chart.legend.position = "bottom";
      chart.legend.valueLabels.template.disabled = false;

      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "fleet_name";


      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = false;
      categoryAxis.renderer.grid.template.opacity = 1;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 0;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.max = 100;
      valueAxis.strictMinMax = true;
      valueAxis.calculateTotals = true;
      valueAxis.renderer.minWidth = 50;

      var series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.columns.template.width = am4core.percent(80);
      series1.columns.template.tooltipText = "{in_maintenance}";
      series1.name = "Vehicles in maintenace";
      series1.dataFields.categoryX = "fleet_name";
      series1.dataFields.valueY = "in_maintenance";
      series1.dataFields.valueYShow = "totalPercent";
      series1.dataItems.template.locations.categoryX = 0.5;
      series1.stacked = true;
      series1.tooltip.pointerOrientation = "vertical";

      var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
      bullet1.interactionsEnabled = false;
      bullet1.label.text = "{in_maintenance}";
      bullet1.label.fill = am4core.color("#ffffff");
      bullet1.locationY = 0.5;

      var series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.columns.template.width = am4core.percent(80);
      series2.columns.template.tooltipText = "{total_vehicles}";
      series2.name = "Total Vehicles";
      series2.dataFields.categoryX = "fleet_name";
      series2.dataFields.valueY = "total_vehicles";
      series2.dataFields.valueYShow = "totalPercent";
      series2.dataItems.template.locations.categoryX = 0.5;
      series2.stacked = true;
      series2.tooltip.pointerOrientation = "vertical";

      var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
      bullet2.interactionsEnabled = false;
      bullet2.label.text = "{total_vehicles}";
      bullet2.locationY = 0.5;
      bullet2.label.fill = am4core.color("#ffffff");

      chart.scrollbarX = new am4core.Scrollbar();
    });
  }


}
