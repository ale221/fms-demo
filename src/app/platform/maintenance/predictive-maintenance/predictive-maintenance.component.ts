import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { SwalService } from 'src/app/core/services/swal.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { DashboardEnum } from '../../enum/dashboard-enum';
import { GotoPageService } from '../../services/goto-page.service';
import { MaintenanceService } from '../../services/mainenance-service.service';
import { ErrorMessage } from '../../error-message';
import { PrimengDropdownItem } from 'src/app/platform/data/model/primng-dropdown-item';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { EntityService } from '../../services/entity.service';
// pie chart import
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { DrawerService } from 'src/app/core/services/drawer.service';

// Themes begin
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);
// Themes end

@Component({
  selector: 'app-predictive-maintenance',
  templateUrl: './predictive-maintenance.component.html',
  styleUrls: ['./predictive-maintenance.component.css']
})
export class PredictiveMaintenanceComponent implements OnInit {

  isAuthorized = false;
  cards = [];
  fleetDropDownData = [];
  maintenacePredictionData = [];
  pieChartData = [];
  vehicleEfficiencyChart = [];

  showIndeterminateProgress = false;
  showIndeterminateProgress2 = false;
  filters = { offset: 0, limit: 10, vehicle_group_id: '', vehicle_id: '', maintenance_type_id: '', order: '', order_by: '', date_filter: '', search: '', export: '', timeZone: '', start_date: '', end_date: '', upcoming: 1 };
  filtersEfficiency = { offset: 0, limit: 10, vehicle_group_id: '', vehicle_id: '', maintenance_type_id: '', order: '', order_by: '', date_filter: '', search: '', export: '', timeZone: '', start_date: '', end_date: '' };
  dataSource;
  totalLength = 0;
  totalLengthEfficency = 0;
  displayedColumns = ['id', 'device_id__name', 'driver_id__name', 'technician_name', 'maintenance_type_id__label', 'maintenance_status_id__label', 'start_datetime', 'end_datetime'];
  performanceDropDown = [{ id: 1, value: 2, label: 'Efficient' }, { id: 1, value: 1, label: 'Non-Efficient' }]
  displayedColumnsEffieciency = ['vehicle_id', 'vehicle_name', 'total_violations'];

  efficiencyFleet: any;
  efficiency = 2;
  efficiencyTableData;
  sidebarCheck;

  categoriesArray = [{ id: 'overhaul', name: 'Overhaul' }, { id: 'replacements', name: 'Replacements' }, { id: 'general_repairs', name: 'General Repairs' }, { id: 'major_repairs', name: 'Major Repairs' }];
  dateFilterArray = [{ id: 'today', name: 'Today' }, { id: 'week', name: 'This week' }];

  constructor(private formBuilder: FormBuilder,
    private swalService: SwalService,
    public gotoService: GotoPageService,
    private maintenanceService: MaintenanceService,
    private authService: AuthService,
    private zone: NgZone,
    private entityService: EntityService,
    private drawerService: DrawerService) {

  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    // get cards data
    this.maintenanceService.getCardsForPredictiveMaintenance().subscribe((data: any) => {
      if (!data.error) {
        this.cards = data.data;
      }
    })

    // get Maintenance Predictive chart
    this.maintenanceService.getDataForMaintenancePredictive().subscribe((data: any) => {
      if (!data.error) {
        this.maintenacePredictionData = data.data;
        setTimeout(() => {
          //Draw cluster column chart
          this.drawMaintenancePredication()
        }, 100)
      }
    })

    // get upcoming maintenance chart
    this.getUpcomingMaintenance('');
    // get efficiency chart
    this.maintenanceService.getVehicleOperationalEfficiencyChart('', 2).subscribe((data: any) => {
      if (!data.error) {
        this.vehicleEfficiencyChart = data.data.data;
        setTimeout(() => {
          this.drawVehicleOperationalEfficiency()
        }, 100)

      }
    })

    // get fleet dropdown data
    this.entityService.getFleetFiltersDropdown().subscribe(apiResponse => {
      if (!apiResponse.error) {
        this.fleetDropDownData = apiResponse.data.data;
      }
    })


    // Draw pie chart data
    this.drawUpcomingMaintenaces();
    // get data effiiciency table
    this.getEfficiencyDataTable(this.filtersEfficiency);
    // Get Maintance Data
    this.getMaintanceTableData(this.filters);

  }


  getEfficiencyDataTable(filters) {
    this.showIndeterminateProgress2 = true;
    this.maintenanceService.getEfficiencyTableData(filters).subscribe((data: any) => {
      this.showIndeterminateProgress2 = false;
      if (!data.error) {
        this.efficiencyTableData = data.data.data;
        this.totalLengthEfficency = data.data.count;
      }
    })
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  drawMaintenancePredication() {
    let chart = am4core.create('columnDiv', am4charts.XYChart)
    chart.colors.step = 2;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.paddingBottom = 20
    chart.legend.labels.template.maxWidth = 95

    let xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
    xAxis.dataFields.category = 'month';
    xAxis.renderer.cellStartLocation = 0.1
    xAxis.renderer.cellEndLocation = 0.9
    xAxis.renderer.grid.template.location = 0;

    let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
    yAxis.min = 0;

    function createSeries(value, name) {
      let series = chart.series.push(new am4charts.ColumnSeries())
      series.dataFields.valueY = value
      series.dataFields.categoryX = 'month';
      series.name = name

      series.events.on("hidden", arrangeColumns);
      series.events.on("shown", arrangeColumns);

      let bullet = series.bullets.push(new am4charts.LabelBullet())
      bullet.interactionsEnabled = false
      bullet.dy = 30;
      bullet.label.text = '{valueY}'
      bullet.label.fill = am4core.color('#ffffff')
      return series;
    }
    chart.data = this.maintenacePredictionData;
    createSeries('predicted', 'Predicted');
    createSeries('previous', 'Previous');

    function arrangeColumns() {
      let series = chart.series.getIndex(0);
      let w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
      if (series.dataItems.length > 1) {
        let x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
        let x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
        let delta = ((x1 - x0) / chart.series.length) * w;
        if (am4core.isNumber(delta)) {
          let middle = chart.series.length / 2;
          let newIndex = 0;
          chart.series.each(function (series) {
            if (!series.isHidden && !series.isHiding) {
              series.dummyData = newIndex;
              newIndex++;
            }
            else {
              series.dummyData = chart.series.indexOf(series);
            }
          })
          let visibleCount = newIndex;
          let newMiddle = visibleCount / 2;

          chart.series.each(function (series) {
            let trueIndex = chart.series.indexOf(series);
            let newIndex = series.dummyData;
            let dx = (newIndex - trueIndex + middle - newMiddle) * delta
            series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
            series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
          })
        }
      }
    }

  }

  drawUpcomingMaintenaces() {
    // Create chart instance
    let chart = am4core.create("pieChartDiv", am4charts.PieChart);

    // Add and configure Series
    let pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "upcoming";

    // Let's cut a hole in our Pie chart the size of 30% the radius
    chart.innerRadius = am4core.percent(45);

    // Put a thick white border around each Slice
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template
      // change the cursor on hover to make it apparent the object can be interacted with
      .cursorOverStyle = [
        {
          "property": "cursor",
          "value": "pointer"
        }
      ];

    pieSeries.alignLabels = false;
    pieSeries.labels.template.bent = true;
    pieSeries.labels.template.radius = 3; //am4core.percent(-40); || To change the text inside circle
    pieSeries.labels.template.padding(0, 0, 0, 0);

    pieSeries.ticks.template.disabled = true;

    // Create a base filter effect (as if it's not there) for the hover to return to
    let shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
    shadow.opacity = 0;

    // Create hover state
    let hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists

    // pieSeries.legendSettings.labelText = "{category}: {value.percent.formatNumber('#.0')}%";

    // Slightly shift the shadow and make it more prominent on hover
    let hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;

    // Add a legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    // chart.legend.valueLabels.template.disabled = true;
    // chart.legend.paddingBottom = 20;
    // chart.legend.labels.template.maxWidth = 5

    chart.data = this.pieChartData;
    pieSeries.labels.template.text = "{value.percent.formatNumber('#.0')}%";
    // pieSeries.labels.template.fill = am4core.color("white"); //change the color of text

  }

  drawVehicleOperationalEfficiency() {
    // Create chart instance
    let chart = am4core.create("3DChartDiv", am4charts.XYChart3D);

    // Add data
    chart.data = this.vehicleEfficiencyChart;
    // // console.log("vehicleEfficiencyChart- ", this.vehicleEfficiencyChart)
    // Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "vehicle_name";//"country";
    categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.renderer.labels.template.hideOversized = false;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.tooltip.label.rotation = 270;
    categoryAxis.tooltip.label.horizontalCenter = "right";
    categoryAxis.tooltip.label.verticalCenter = "middle";

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Driver  Violations  Rating";
    // valueAxis.title.fontWeight = "bold";

    // Create series
    let series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "total_violations";//"visits";
    series.dataFields.categoryX = "vehicle_name";//"country";
    series.name = "Violations";
    series.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = .8;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.stroke = am4core.color("#FFFFFF");

    columnTemplate.adapter.add("fill", function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    })

    columnTemplate.adapter.add("stroke", function (stroke, target) {
      return chart.colors.getIndex(target.dataItem.index);
    })

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;

  }

  getUpcomingMaintenance(param) {
    this.maintenanceService.getUpcomingMaintenances(param).subscribe((data: any) => {
      if (!data.error) {
        this.pieChartData = data.data;
        setTimeout(() => {
          this.drawUpcomingMaintenaces();
        }, 100)
      }
    })
  }

  fleetDropdownChanged(event) {
    this.getUpcomingMaintenance(event);
  }

  fleetDropdownChangedEfficiency(event) {
    // console.log("event=-= ", event)
    this.efficiencyFleet = event;

    this.maintenanceService.getVehicleOperationalEfficiencyChart(this.efficiencyFleet, this.efficiency).subscribe((data: any) => {
      if (!data.error) {
        this.vehicleEfficiencyChart = data.data.data;

        setTimeout(() => {
          this.drawVehicleOperationalEfficiency()
        }, 100)

      }
    })

    this.showIndeterminateProgress2 = true;
    this.maintenanceService.getEfficiencyTableDataWithID(this.efficiencyFleet).subscribe((data: any) => {
      this.showIndeterminateProgress2 = false;
      if (!data.error) {
        this.efficiencyTableData = data.data.data;
        this.totalLengthEfficency = data.data.count;
      }
    })

  }

  performanceDropdownChanged(event) {
    // // console.log("which performance is= ", event)
    this.efficiency = event;

    if (this.efficiencyFleet == undefined) {
      this.efficiencyFleet = '';
    }

    this.maintenanceService.getVehicleOperationalEfficiencyChart(this.efficiencyFleet, this.efficiency).subscribe((data: any) => {
      if (!data.error) {
        this.vehicleEfficiencyChart = data.data.data;
        setTimeout(() => {
          this.drawVehicleOperationalEfficiency()
        }, 100)
      }
    })
  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getMaintanceTableData(this.filters);
  }
  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getMaintanceTableData(this.filters);
  }

  onPaginateChangeEfficiency(event) {
    this.filtersEfficiency.offset = (event.pageIndex * event.pageSize);
    this.getEfficiencyDataTable(this.filtersEfficiency);
  }

  sortDataEfficiency(event) {
    this.filtersEfficiency.order_by = event.active;
    this.filtersEfficiency.order = event.direction;
    this.getEfficiencyDataTable(this.filtersEfficiency);
  }
  getMaintanceTableData(filters) {
    this.showIndeterminateProgress = true;
    let params = `offset=${filters.offset}&limit=${filters.limit}&order=${filters.order}&order_by=${filters.order_by}&vehicle_group_id=${filters.vehicle_group_id}&vehicle_id=${filters.vehicle_id}&maintenance_type_id=${filters.maintenance_type_id}&date_filter=${filters.date_filter}&search=${filters.search}&export=${filters.export}&timeZone=${filters.timeZone}&start_date=${filters.start_date}&end_date=${filters.end_date}&upcoming=${filters.upcoming}`;

    this.maintenanceService.getMaintanceData(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (!data.error) {
        this.dataSource = data.data.data;
        this.totalLength = data.data.count;
      } else {

      }
    })
  }


  categoryChanged(event) {
    // // console.log("category Change value== ", event);
    this.showIndeterminateProgress = true;
    let params = `offset=0&limit=10&order=&order_by=&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&export=&timeZone=&start_date=&end_date=&category=${event}&upcoming=1`;
    this.maintenanceService.getMaintanceData(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (!data.error) {
        this.dataSource = data.data.data;
        this.totalLength = data.data.count;
      }
    })
  }

  dateFilterChanged(event) {
    // // console.log("date filter change value== ", event)
    this.showIndeterminateProgress = true;
    let params = `offset=0&limit=10&order=&order_by=&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=${event}&search=&export=&timeZone=&start_date=&end_date=&upcoming=1`;
    this.maintenanceService.getMaintanceData(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (!data.error) {
        this.dataSource = data.data.data;
        this.totalLength = data.data.count;
      }
    })
  }

}
