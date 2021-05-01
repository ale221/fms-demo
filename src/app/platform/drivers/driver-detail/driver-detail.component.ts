import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { DriverAlert } from '../../../model/drivers entities/driver-alert';
import { DriverProfileDetails } from '../../../model/drivers entities/driver-profile-details';
import { DriverTravellingDetails } from '../../../model/drivers entities/driver-travelling-detail';
import { UtillsService } from '../../services/common/utills.service';
import { DriverDetailsService } from '../../services/drivers/driver-details.service';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { AuthService } from 'src/app/core/services/auth.service';
import { MaintenanceService } from '../../services/mainenance-service.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
// pie chart import
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { MatPaginator } from '@angular/material/paginator';
import { DashboardEnum } from '../../enum/dashboard-enum';
import { TruckService } from '../../services/truck.service';
import { hypernymModules } from 'src/app/core/model/module';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DateUtils } from '../../../Utils/DateUtils';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { DrawerService } from 'src/app/core/services/drawer.service';
// Themes begin
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);
// Themes end


const ELEMENT_DATA = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];


@Component({
  selector: 'app-driver-detail',
  templateUrl: './driver-detail.component.html',
  styleUrls: ['./driver-detail.component.css']
})
export class DriverDetailComponent implements OnInit, OnDestroy {
  // unsubscription parameter for services
  private ngUnsubscribe: Subject<boolean> = new Subject()
  displayedColumns = ['title', 'timestamp'];
  displayedColumns1: string[] = ['position', 'name', 'weight', 'symbol'];

  // component parameters
  private connection: any  // use for signalR connection
  private driverId: any  // will initialize from params driver id value that come from driver dashboard
  public graphsData: any; // data that will be pass to childeren graphs component
  public graphDataChartHeight: number = 270; // radial basic
  public driverAlertList: DriverAlert[] = []; // use to initials with driver alerts
  // driver travlling history object that include travelling distance , violation and others...
  public driverTravellingDetailsObj: DriverTravellingDetails;
  public driverProfileDetailsObj: DriverProfileDetails;
  // component parameter end
  driver_detail;
  idleHistory = [];
  isAuthorized = false;
  loggedInUser;
  // alertData = [];
  distanceTravelledGraph = 0;
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  alertData = [];
  driverScoreboardChartData = [];
  filtersTruck = { limit: 10, offset: 0, order_by: '', order: '', search: '', start_datetime: '', end_datetime: '' };
  @ViewChild('userPaginator') userPaginator: MatPaginator;
  totalUserLength = 0;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatSort) sort2: MatSort;
  EntityStatusEnum = EntityStatusEnum;
  entityId = 0;
  cardsArray = [];
  colWidth = '';
  bredcrumName;
  bredcrumRoute;
  breadcrumbInner = ['drivers', 'Drivers'];
  start_datetime;
  end_datetime;
  sidebarCheck: any;

  constructor(private route: ActivatedRoute,
    private srvDriverDetailsService: DriverDetailsService,
    private authService: AuthService,
    private maintenanceService: MaintenanceService,
    private truckService: TruckService,
    public breadcrumbService: BreadcrumbsService,
    public drawerService: DrawerService) {
    this.connection = this.route.snapshot.data['connection'];
    this.driverId = this.route.snapshot.params['id'];
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
    if (this.loggedInUser.package[0].package_id === PackageType.png) {
      this.isAuthorized = false;
    }
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })
    this.breadcrumbService.getValue().subscribe(res => {
      if (res && res.length) {
        this.breadcrumbInner = res;
        this.breadcrumbInner[0] = `${res[0]}`;
      }
    })

    this.route.params.subscribe(params => {
      this.entityId = params['id'];
    })

    this.loggedInUser = this.authService.getUser();
    // initials to empty object
    this.driverTravellingDetailsObj = new DriverTravellingDetails();
    this.driverProfileDetailsObj = new DriverProfileDetails();
    // function that need to call when component get start loading
    if (this.driverId) {
      this.getUserProfileAnTravellingDetails(this.filtersTruck);
      this.getDistanceTraveledAlerts();
    }
    // console.log('graphsData== ', this.graphsData)

    // get cards data
    this.getCardsData(hypernymModules[6], DashboardEnum.DriverDetail, this.entityId);
    this.dateBaseChart();
  }

  getCardsData(module, dashboardId, entityId) {
    this.truckService.getTruckCards(module, dashboardId, entityId).subscribe(data => {
      this.cardsArray = data['data'].card;
      this.colWidth = this.getCardsCol(this.cardsArray.length, false);
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    // this.alertData.sort = this.sort2;
  }

  // this function is used to get data for graphs
  getGraphsData() {
    // replace with api data
    this.graphsData = {
      distanceTravelled: {
        series: [this.driver_detail?.distance_traveled],
        labels: ['Distance Travelled']
      }
    }
  }
  dateBaseChart() {
    var chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.data = this.idleHistory;

    // Set input format for the dates
    chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

    // Create axes
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "value";
    series.dataFields.dateX = "date";
    series.tooltipText = "{value}"
    series.strokeWidth = 2;
    series.minBulletDistance = 15;

    // Drop-shaped tooltips
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.strokeOpacity = 0;
    series.tooltip.pointerOrientation = "vertical";
    series.tooltip.label.minWidth = 40;
    series.tooltip.label.minHeight = 40;
    series.tooltip.label.textAlign = "middle";
    series.tooltip.label.textValign = "middle";

    // Make bullets grow on hover
    var bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.strokeWidth = 2;
    bullet.circle.radius = 4;
    bullet.circle.fill = am4core.color("#fff");

    var bullethover = bullet.states.create("hover");
    bullethover.properties.scale = 1.3;

    // Make a panning cursor
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = "panXY";
    chart.cursor.xAxis = dateAxis;
    chart.cursor.snapToSeries = series;

    // Create vertical scrollbar and place it before the value axis
    chart.scrollbarY = new am4core.Scrollbar();
    chart.scrollbarY.parent = chart.leftAxesContainer;
    chart.scrollbarY.toBack();

    // Create a horizontal scrollbar with previe and place it underneath the date axis
    chart.scrollbarX = new am4charts.XYChartScrollbar();
    // chart.scrollbarX.series.push(series);
    chart.scrollbarX.parent = chart.bottomAxesContainer;

    dateAxis.start = 0.79;
    dateAxis.keepSelection = true;

  }
  // this function is used to get data for user profile and driver details of driving
  getUserProfileAnTravellingDetails(filtersTruck) {
    let params = `limit=${filtersTruck.limit}&offset=${filtersTruck.offset}&order=${filtersTruck.order}&order_by=${filtersTruck.order_by}&driver_group_id=${this.driverId}&start_datetime=${filtersTruck.start_datetime}&end_datetime=${filtersTruck.end_datetime}`;
    // .pipe(takeUntil(this.ngUnsubscribe))
    this.srvDriverDetailsService.getDriverDetailId(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.driver_detail = data.data['userData'];
        this.idleHistory = data.data.idleHistory;
        this.dateBaseChart();
        this.distanceTravelledGraph = (this.driver_detail?.distance_traveled).toFixed(2);
        this.getGraphsData();
        this.alertData = data.data['alerts'].alert;
        this.totalUserLength = data.data['alerts'].count;
        // this.alertData.sort = this.sort2;

        this.driverScoreboardChartData = data.data['driverScoreBoard'];
        this.drawDriverScoreboardChart();
      } else {
        console.log(data.message);
      }
    })
  }

  setupReport(event) {
    let dateTime = event[0];
    this.start_datetime = dateTime[0];
    this.end_datetime = dateTime[1];
    this.filtersTruck.start_datetime = DateUtils.getUtcDateTimeStart(this.start_datetime);
    this.filtersTruck.end_datetime = DateUtils.getUtcDateTimeStart(this.end_datetime);
    this.getUserProfileAnTravellingDetails(this.filtersTruck);
  }
  sortData(event) {
    // console.log("event= ", event, event.active)
    this.filtersTruck.order_by = event.active;
    this.filtersTruck.order = event.direction;
    this.getUserProfileAnTravellingDetails(this.filtersTruck);
  }
  onUserPagination(event) {
    // console.log("coming in pagination", event);
    this.filtersTruck.offset = (event.pageIndex * event.pageSize);
    this.getUserProfileAnTravellingDetails(this.filtersTruck);
  }

  // this function is used to get alerts
  getDistanceTraveledAlerts() {
    this.driverAlertList = [
      {
        Time: "Mar, 2021",
        Atribute: "Distance Travelled (Miles)",
        Value: "0"
      }
    ]
  }

  ngOnDestroy(): void {
    // destroy all subscription of services when component get destroy
    this.ngUnsubscribe.next(true)
    this.ngUnsubscribe.complete()
  }

  drawDriverScoreboardChart() {
    // Create chart instance
    let chart = am4core.create("3DChartDiv", am4charts.XYChart3D);

    // Add data
    chart.data = this.driverScoreboardChartData;

    // Create axes
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "label";
    categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.renderer.labels.template.hideOversized = false;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    categoryAxis.tooltip.label.rotation = 270;
    categoryAxis.tooltip.label.horizontalCenter = "right";
    categoryAxis.tooltip.label.verticalCenter = "middle";

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Violations";
    valueAxis.title.fontWeight = "bold";

    // Create series
    let series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "value";
    series.dataFields.categoryX = "label";
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

  getCardsCol(totalCards, isMulti) {
    let colWidth;
    if (totalCards === 1 || totalCards === 2 || totalCards === 3) {
      if (isMulti) {
        colWidth = ['col-md-3', 'col-md-4'];
      } else {
        colWidth = 'col-md-4';
      }
    } else if (totalCards === 4) {
      if (isMulti) {
        colWidth = ['col-md-4', 'col-md-4'];
      } else {
        colWidth = 'col-md-4';
      }
    } else if (totalCards === 5) {
      colWidth = ['col-md-4', 'col-md-2']
    } else if (totalCards === 6) {
      colWidth = 'col-md-2';
    } else {
      colWidth = 'col-md-3 margin-bottom-30';
    }
    return colWidth;
  }

}
