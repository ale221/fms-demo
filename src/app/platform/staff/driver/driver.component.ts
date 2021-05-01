import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {isNullOrUndefined} from 'util';
import {ActivatedRoute, Router} from '@angular/router';
import {differenceInCalendarYears, differenceInMinutes, format} from 'date-fns';
import {ResizeDatatableService} from '../../shared/resize-datatable.service';
import { AppLoader } from '../../data/model/app-loader';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { DriverResponse, JobResponse, TruckResponse } from '../../data/response/entity-response';
import { EntityService } from '../../services/entity.service';
import { GotoPageService } from '../../services/goto-page.service';
import { MaintenanceService } from '../../services/mainenance-service.service';
import { GetRouteParamService } from '../../services/get-route-param.service';
import { TruckService } from '../../services/truck.service';
import { DatatableService } from '../../services/datatable.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { ScheduleActivityService } from '../../services/schedule-activity.service';
import { DriverService } from '../../services/driver.service';
import { HttpController } from 'src/app/core/services/loading-controller';
import { LoginApiResponse, ApiResponse } from 'src/app/core/model/api.response';
import { ConvertToGallon } from '../../data/model/covert_to_gallon';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { EntityResponse } from 'src/app/model/entity.response';
import { Item } from '../../data/model/item';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { MaritalStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { ViolationResponse } from '../../data/response/reports-response';
import { ReportsData } from '../../data/model/reports-model';
import { JobStatusEnum } from '../../enum/iol-entity.enum';
import { ReportResponse } from '../../model/reportResponse';

declare var google;


@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})


export class DriverComponent implements OnInit {


  appLoader = new AppLoader();
  violationLoader = new AppLoader();
  maintenanceLoader = new AppLoader();
  activitiesLoader = new AppLoader();
  collectionsLoader = new AppLoader();
  fineLoader = new AppLoader();

  @ViewChild('violationMap')
  vMap: GoogleMapComponent;
  @ViewChild('maintenanceMap')
  mMap: GoogleMapComponent;
  @ViewChild('driverMap')
  dMap: GoogleMapComponent;

  @ViewChild('accepted')
  table: any;
  @ViewChild('completed')
  completed: any;
  @ViewChild('failed')
  failed: any;
  @ViewChild('rejected')
  rejected: any;
  @ViewChild('pending')
  pending: any;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;


  entityId;
  reporting_json = {type:5,id:0};
  // public driver: DriverResponse = new DriverResponse();
  public driver;
  public driverMetaInfo: any;
  markers = [];
  infoWindows = [];
  violationMarkers = [];
  violationInfoWindows = [];

  value: Date[];
  tempData = [];


  //Statistics
  violationDateRange: any[] = null;
  maintenanceDateRange: any[] = null;
  activitiesDateRange: any[] = null;
  collectionsDateRange: any[];
  finesDateRange: any[] = null;
  minDate = new Date();

  violations = [];
  collections = [];
  shifts = [];
  fines = [];
  maintenances = [];
  completedJobs = new Array(JobResponse);
  pendingJobs = new Array(JobResponse);
  currentJobs = new JobResponse();
  jobProgress = '-';

  truck;

  dateRange: Date[] = [];

  shift_distance_travelled = 0;
  shift_volume_consumed = 0;
  shift_fuel_avg = 0;

  csvFinesCols = [
    {field: 'timestamp', header: 'Timestamp', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'truck_name', header: 'Asset Name'},
    {field: 'asset_type', header: 'Asset Type'},
    {field: 'driver_name', header: 'Driver'},
    {field: 'cost', header: 'Cost'},
    {field: 'notes', header: 'Notes'},
  ];

  constructor(private entityService: EntityService,
              public gotoService: GotoPageService,
              private router: Router,
              public maintenanceService: MaintenanceService,
              private routeParamService: GetRouteParamService,
              private truckService: TruckService,
              private datatableService: DatatableService,
              private swalService: SwalService,
              public scheduleActivityService: ScheduleActivityService,
              public driverService: DriverService,
              private route: ActivatedRoute,
              public resizeDatatableSerivce: ResizeDatatableService) {
  }

  ngOnInit() {
    this.entityId = this.routeParamService.getParams(this.route);
    /**
     * This route paramters subscription is just to get the lastest changed in route (ID)
     */

    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.entityId = id;
      this.reporting_json = this.entityId;
      this.activities = [];
      this.maintenances = [];
      this.shifts = [];
      this.violations = [];
      this.fines = [];
      this.getDriver();
      this.getShiftCards();
      this.getJobs();
      this.getActivities();

    });
    // this.route.paramMap.subscribe(params => {
    //   if (params.has('id')) {
    //     const id = +params.get('id');
    //     this.entityId = id;
    //     this.activities = [];
    //     this.maintenances = [];
    //     this.shifts = [];
    //     this.violations = [];
    //     this.fines = [];
    //     this.getDriver();
    //     this.getShiftCards();
    //     this.getJobs();
    //     this.getActivities();
    //   }
    // });

    this.getShiftCards();
    this.getDriver();
    this.getJobs();
    this.getActivities();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
    }, 300);
  }

  private getShiftCards() {
    this.truckService.getShiftFuelAndDistance({child_id: this.entityId})
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            this.context.swalService.getErrorSwal(errorMessage);
            // do
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            this.context.shift_distance_travelled = +(apiResponse.response['d_travelled']);
            this.context.shift_fuel_avg = ConvertToGallon.convert_to_gallon(apiResponse.response['fuel_avg'], true);
            this.context.shift_volume_consumed = +apiResponse.response['vol_consumed'];

            if (apiResponse.status === HttpStatusCodeEnum.Error) {
            } else if (apiResponse.status === HttpStatusCodeEnum.Error) {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }
          }
        }(this)
      );
  }

  driverAcceptedActivity = [];
  reportObjInput = {};

  getDriver(): void {

    this.entityService.getEntity(this.entityId)
    .subscribe(data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.driver = data.response;
        if (!isNullOrUndefined(this.driver.driverAcceptedActivity)) {
          this.driverAcceptedActivity = this.truck.assigned_activity;
        }
        this.setupMetaInfo();
        this.getJobs();
        if (!isNullOrUndefined(this.driver.truck) && !isNullOrUndefined(this.driver.truck.last_latitude)) {
          const icon = {
            url: 'assets/images/iol/icon-map-truck.png',
          };
          let info = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
            '<tbody>';
          info += `<tr>
                    <th> Truck Name </th>
                    <td class="text-left">${this.driver.truck.name}</td>
                  </tr>`;
          info += '</tbody> </table>';

          const marker = this.dMap.createDummyMarker(icon.url, this.driver.truck.last_latitude, this.driver.truck.last_longitude, info);
        }
        this.reportObjInput = {
          'Name': this.driver.name,
          'Truck': this.driver.truck ? this.driver.truck['name'] : '-'
        };

      }
      if (data.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(data.message);
      }
    });
  }

  setupMetaInfo() {
    const age = this.driver.dob ? differenceInCalendarYears(new Date(), this.driver.dob) : null;
    this.driverMetaInfo = [
      new Item('Role', this.driver.type_name || '-'),
      new Item('CNIC', this.driver.cnic),
      new Item('Date of Birth', this.driver.dob && DateUtils.isValid(this.driver.dob) ? (DateUtils.getMMMMDY(this.driver.dob)) : null),
      new Item('Joining Date', this.driver.date_of_joining && DateUtils.isValid(this.driver.date_of_joining) ? (DateUtils.getMMMMDY(this.driver.date_of_joining)) : null),
      new Item('Maritial Status', MaritalStatusEnum[this.driver.marital_status]),
      new Item('Age', age ? (age + 'y/o') : '-'),
      new Item('Salary', this.driver.salary),
      new Item('Rating', (this.driver.performance_rating || 0) + ' / 10'),
      new Item('Record Status', this.driver.status),

    ];
  }

  createMarker(icon, startPos, endPos) {

    if (!isNullOrUndefined(startPos) && !isNullOrUndefined(endPos)) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(startPos, endPos),
        icon: icon,
      });
      return marker;
    }

  }

  createInfoWindow(info) {
    const infowindow = new google.maps.InfoWindow({
      content: info
    });
    return infowindow;

  }

  getReport(dateRange, type) {
    this.violationMarkers = [];
    this.violationInfoWindows = [];
    const startDate = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const endDate = DateUtils.getUtcDateTimeStart(dateRange[1]);
    switch (type) {
      case 'violation':
        this.violationDateRange = [startDate, endDate];
        this.getViolationReport(startDate, endDate);
        break;
      case 'collections':
        this.collectionsDateRange = [startDate, endDate];
        this.getCollectionsByRange(startDate, endDate);
        break;
      case 'maintenance':
        this.maintenanceDateRange = [startDate, endDate];
        this.getMaintenanceReport(startDate, endDate);
        break;
      case 'activities':
        this.activitiesDateRange = [startDate, endDate];
        this.getActivitiesByRange(startDate, endDate);
        break;
      case 'fines':
        // this.finesDateRange = [startDate, endDate];
        this.finesDateRange = [DateUtils.getYYYYMMDD(dateRange[0]), DateUtils.getYYYYMMDD(dateRange[1])];
        this.getFinesReport(startDate, endDate);
        break;
    }

  }

  private getCollectionsByRange(start_date, end_date) {
    this.scheduleActivityService.getCollectionEvents({
      start_date: start_date,
      end_date: end_date,
      driver_id: this.entityId
    }).subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<TruckResponse[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.collections = apiResponse.response;
          }

          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this.collectionsLoader)
    );
  }

  getViolationReport(startDate, endDate) {
    const params = {
      driver_id: this.entityId,
      start_datetime: startDate,
      end_datetime: endDate
    };
    // params.start_datetime += ' 00:00:00';
    // params.end_datetime += ' 23:59:59';
    // Convert to UTC
    // params.start_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.start_datetime);
    // params.end_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.end_datetime);
    this.truckService.getViolationsReport(params)
      .subscribe(new class extends HttpController<LoginApiResponse<ViolationResponse[]>> {

          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            this.context.swalService.getErrorSwal(errorMessage);
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<ViolationResponse[]>): void {
            console.log(apiResponse);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              const response = apiResponse.response[0]['violations'];
              this.context.violations = response;
              if (response.length) {
                for (let i = 0; i < response.length; i++) {
                  const temp = ReportsData.getViolationMarkerIcon(response[i].type);
                  const info = [
                    new Item('Violation Type', response[i].type),
                    new Item('Assigned Job ', response[i].job_assigned)
                  ];
                  this.context.violationInfoWindows.push(info);
                  if (!isNullOrUndefined(response[i].lat && !isNullOrUndefined(response[i].long))) {
                    this.context.violationMarkers.push({latitude: response[i].lat, longitude: response[i].long, icon: temp.marker});
                  }
                }
              } else {
                this.context.violationMarkers = [];
              }
              this.context.vMap.createDummyMarkers(this.context.violationMarkers, this.context.violationInfoWindows);


            }
            if (apiResponse.status === HttpStatusCodeEnum.Error) {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }
          }

        }(this.violationLoader)
      );

  }

  columnName;


  private getMaintenanceReport(start_date, end_date) {
    const params = {
      driver_id: this.entityId,
      start_datetime: start_date,
      end_datetime: end_date
    };
    // params.start_datetime += ' 00:00:00';
    console.log(params);
    this.maintenanceService.getMaintenances(params)
      .subscribe(new class extends HttpController<LoginApiResponse<any[]>> {

          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any[]>): void {
            console.log('maintenaces', apiResponse.response);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.maintenances = apiResponse.response;
            }
          }

        }(this.maintenanceLoader)
      );
  }


  getFinesReport(startDate, endDate) {
    const params = {
      driver_id: this.entityId,
      start_datetime: startDate,
      end_datetime: endDate
    };

    this.truckService.getMaintenanceData(params)
      .subscribe(new class extends HttpController<LoginApiResponse<any[]>> {

          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            this.context.swalService.getErrorSwal(errorMessage);
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any[]>): void {
            console.log(apiResponse);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.fines = apiResponse.response;
            }
            if (apiResponse.status === HttpStatusCodeEnum.Error) {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }

          }

        }(this.fineLoader)
      );

  }

  activities = [];
  completedActivitiesCount;
  currentActivities = [];
  acceptedActivities = [];
  completedActivities = [];
  failedActivities = [];
  rejectedActivities = [];
  pendingActivities = [];

  getActivities() {
    this.completedActivitiesCount = 0;
    this.currentActivities = [];
    this.acceptedActivities = [];
    this.failedActivities = [];
    this.rejectedActivities = [];
    this.pendingActivities = [];
    const params = {};
    params['driver_id'] = this.entityId;
    this.scheduleActivityService.getScheduleActivities(params)
      .subscribe(new class extends HttpController<ApiResponse<any[]>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);

          }

          onNext(apiResponse: ApiResponse<any[]>): void {
            if (apiResponse.status) {
              console.log(apiResponse.response);
              const response = apiResponse.response['activity'];
              // this.context.activities = response['activity'];
              for (let i = 0; i < response.length; i++) {
                if (response[i].activity_status === JobStatusEnum.Completed) {
                  this.context.completedActivitiesCount += 1;
                }
                if (response[i].activity_status === JobStatusEnum.Running) {
                  this.context.currentActivities.push(response[i]);
                }
                if (response[i].activity_status === JobStatusEnum.Completed) {
                  this.context.completedActivities.push(response[i]);
                }
                if (response[i].activity_status === JobStatusEnum.Pending) {
                  this.context.pendingActivities.push(response[i]);
                }
                if (response[i].activity_status === JobStatusEnum.Rejected) {
                  this.context.rejectedActivities.push(response[i]);
                }
                if (response[i].activity_status === JobStatusEnum.Aborted) {
                  this.context.failedActivities.push(response[i]);
                }

              }
            }
          }
        }(this)
      );

  }

  getMessageForOverlay(date, selected, array, key?) {
    if (!date) {
      return 'Select start & end date to generate report';
    } else if (!selected && array) {
      return 'Select a record to view on map';
    } else if (!array) {
      return 'No Data Found';
    }
  }

  getActivitiesByRange(startDate, endDate) {
    this.scheduleActivityService.getScheduleActivities({
      start_date: startDate,
      end_date: endDate,
      driver_id: this.entityId
    }).subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);

          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<TruckResponse[]>): void {
          console.log('activities list Range', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.activities = apiResponse.response['activity'];


          }

          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this.activitiesLoader)
    );
  }

  selectedActivity;

  public truckJobs: any = {
    'completed': [],
    'pending': [],
    'current': [],
    'rejected': [],
    'accepted': [],
    'failed': [],
  };

  getJobs() {
    let temp = [];
    if (this.driver && !isNullOrUndefined(this.driver.assigned_jobs)) {
      if (!Array.isArray(this.driver.assigned_jobs)) {
        temp.push(this.driver.assigned_jobs);
      } else {
        temp = this.driver.assigned_jobs;
      }
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].hasOwnProperty('job_status')) {
          console.log(temp[i]);
        }
        if (temp[i]['job_status__label'] === JobStatusEnum[JobStatusEnum.Aborted]) {
          this.truckJobs.failed.push(temp[i]);
        }
        if (temp[i]['job_status__label'] === JobStatusEnum[JobStatusEnum.Running]) {
          this.truckJobs.current.push(temp[i]);
        }
        if (temp[i]['job_status__label'] === JobStatusEnum[JobStatusEnum.Completed]) {
          this.truckJobs.completed.push(temp[i]);
        }

        if (temp[i]['job_status__label'] === JobStatusEnum[JobStatusEnum.Accepted]) {
          this.truckJobs.accepted.push(temp[i]);
        }
        if (temp[i]['job_status__label'] === JobStatusEnum[JobStatusEnum.Rejected]) {
          this.truckJobs.rejected.push(temp[i]);
        }
      }
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].job_status === JobStatusEnum[JobStatusEnum.Pending]) {
          this.truckJobs.pending.push(temp[i]);
        }
      }
    }

  }

  setupReport(event) {
    this.getReport(event[0], event[1]);
  }

  selected = [];

  onSelect({selected}, type) {
    if (!isNullOrUndefined(selected[0].lat) && !isNullOrUndefined(selected[0].long)) {
      if (type === 'violation') {
        this.vMap.zoomToMarker({lat: selected[0].lat, long: selected[0].long});
      }
    }
    if (!isNullOrUndefined(selected[0].start_lat_lng) && !isNullOrUndefined(selected[0].end_lat_lng)) {
      if (type === 'maintenance') {
        this.mMap.zoomToMarker({lat: selected[0].start_lat_lng, long: selected[0].end_lat_lng});
      }
    }
  }

  toggleExpandRow(row, table) {
    if (table === 'accepted') {
      this.table.rowDetail.toggleExpandRow(row);
    }
    if (table === 'failed') {
      this.failed.rowDetail.toggleExpandRow(row);
    }
    if (table === 'rejected') {
      this.rejected.rowDetail.toggleExpandRow(row);
    }
    if (table === 'pending') {
      this.pending.rowDetail.toggleExpandRow(row);
    }

  }

  getClass(status) {
    return this.scheduleActivityService.getClass(status);
  }

  getMessage() {
    if (!this.driver.truck) {
      return 'No Truck Assigned';
    }
    if (this.driver.truck && !this.driver.truck.last_latitude) {
      return 'No data found for ' + this.driver.truck.name || '-';
    } else {
      return null;
    }

  }

  gotoActivity() {
    let activity = this.selected[0];
    if (activity.id) {
      let url = this.gotoService.gotoRouteDetail(activity.id);
      this.router.navigateByUrl(url);
    }
  }

  reportObj = new ReportResponse();

  generatePDFReport(type: any, event?: ReportResponse) {
    this.reportObj.data = [];
    this.reportObj.meta = {
      'Name': this.driver.name,
      'Truck': this.driver.truck ? this.driver.truck['name'] : '-'
    };

    if (type === 'activities') {
      this.reportObj.report_title = this.driver.name + ' Activities Report';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;
    } else if (type === 'shifts') {
      this.reportObj.report_title = this.driver.name + ' Shift Report';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;
    } else if (type === 'collections') {
      this.reportObj.report_title = this.driver.name + ' Collections Reports';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;
    } else if (type === 'fines') {
      this.reportObj.start_datetime = this.finesDateRange[1];
      this.reportObj.end_datetime = this.finesDateRange[0];
      this.reportObj.report_title = this.driver.name + ' Fine Report';

      this.reportObj.cols = ['Truck', 'Driver', 'Cost', 'Notes', 'Date', 'Time'];
      for (let j = 0; j < this.fines.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          {
            'Date': format(
              this.fines[j].timestamp,
              'MM/DD/YYYY'
            ),
            'Time': format(
              this.fines[j].timestamp,
              'h:mm a'
            ),
            'Truck': this.fines[j].truck_name ? this.fines[j].truck_name : '-',
            'Driver': this.fines[j].driver_name ? this.fines[j].driver_name : '-',
            'Cost': this.fines[j].cost ? this.fines[j].cost : '-',
            'Notes': this.fines[j].notes ? this.fines[j].notes : '-',
          });
      }
    } else if (type === 'maintenances') {
      this.reportObj.report_title = this.driver.name + ' Maintenances Reports';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;
    }
    this.getPDFReport();
  }

  private getPDFReport() {
    const params = {
      report_title: this.reportObj.report_title,
      meta: JSON.stringify(this.reportObj.meta),
      cols: this.reportObj.cols,
      data: JSON.stringify(this.reportObj.data),
      start_datetime: this.reportObj.start_datetime,
      end_datetime: this.reportObj.end_datetime
    };
    console.log('params', params, typeof (params.meta));
    this.truckService.generatePDFreport(params)
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {

          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            this.context.swalService.getErrorSwal(errorMessage);
            // console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            console.log('report', apiResponse);
            if (apiResponse.status === 200) {
              window.open('http://' + apiResponse.response.file);
            }

          }

        }(this)
      );
  }


  getAssetTypeImage(value) {
    if (value.indexOf('Bin') > -1) {
      return 'assets/images/iol/icon_sm_bin.png';
    } else {
      return 'assets/images/iol/icon_sm_truck.png';
    }


  }
}


