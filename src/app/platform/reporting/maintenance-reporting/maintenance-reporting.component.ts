import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { AppLoader } from '../../data/model/app-loader';
import { ReportResponse } from '../../model/reportResponse';
import { HttpController } from '../../../core/services/loading-controller';
import { LoginApiResponse } from '../../../core/model/api.response';
import { HttpStatusCodeEnum } from '../../../core/HttpStatusCodeEnum';
import { format } from 'date-fns';
import { isNullOrUndefined } from 'util';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { GotoPageService } from '../../services/goto-page.service';
import { SwalService } from '../../../core/services/swal.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-maintenance-reporting',
  templateUrl: './maintenance-reporting.component.html',
  styleUrls: ['./maintenance-reporting.component.css']
})
export class MaintenanceReportingComponent implements OnInit, OnChanges {

  @Input() serviceObj;
  @Input() entity;
  @Input() isEntityTruck?= true;
  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('maintenanceMap') mMap: GoogleMapComponent;

  maintenanceLoader = new AppLoader();
  dataSource;
  violationMarkers = [];
  violationInfoWindows = [];
  maintenanceDateRange = [];
  selected = [];
  totalLength = 0;

  reportObj = new ReportResponse();
  displayedColumns = ['driver_id__name', 'maintenance_type_id__label', 'maintenance_status_id__label', 'start_datetime', 'end_datetime', 'issued_datetime', 'device__type_id__name',];
  filters = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '', truck_id: '' };
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  csvMaintenanceCols = [
    { field: 'maintenance_type_name', header: 'Type' },
    { field: 'driver_name', header: 'Driver' },
    { field: 'asset_entity_type', header: 'Asset Type' },
    // { field: 'status_label', header: 'Status' },
    { field: 'start_datetime_new', header: 'Start Date', time: true, format: 'MMM d, y, h:mm:ss a' },
    { field: 'end_datetime_new', header: 'End Date', time: true, format: 'MMM d, y, h:mm:ss a' },
    { field: 'issued_datetime_new', header: 'Issued Date', time: true, format: 'MMM d, y, h:mm:ss a' },
  ];

  downloadableLink;
  url = environment.baseUrl;
  loggedInUser: any;

  constructor(public gotoService: GotoPageService,
    private swalService: SwalService,
    private authService: AuthService) {

  }

  ngOnInit() {
    this.loggedInUser = this.authService.getUser();
    console.log("LoggedInUser object- ", this.loggedInUser.customer.id)

    // console.log("this.entity--- ", this.entity)
    if (this.filters && this.filters.truck_id) {
      this.getMaintenanceReport(this.filters)
    }
    // this.isEntityTruck = this.entity.type === EntityType.TRUCK;

    this.downloadableLink = environment.baseUrl + '/iof/maintenance/records?vehicle_group_id=&vehicle_id=' + this.entity + '&maintenance_type_id=&maintenance_id=&date_filter=&search=&export=csv&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.loggedInUser.customer.id + '&start_date=&end_date=';

  }

  ngOnChanges(changes: SimpleChanges): void {
  }


  setupReport(event) {
    console.log("Event of Maintenance tab", event)
    const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);

    this.downloadableLink = environment.baseUrl + '/iof/maintenance/records?vehicle_group_id=&vehicle_id=' + this.entity + '&maintenance_type_id=&maintenance_id=&date_filter=&search=&export=csv&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.loggedInUser.customer.id + '&start_date=' + start_date + '&end_date=' + end_date;


    this.filters.start_datetime = start_date;
    this.filters.end_datetime = end_date;
    if (this.isEntityTruck) {
      this.filters['truck_id'] = this.entity;
    } else {
      this.filters['driver_id'] = this.entity;
    }
    this.getMaintenanceReport(this.filters);
  }


  private getMaintenanceReport(filters) {
    this.serviceObj.getMaintenances(filters).subscribe(apiResponse => {
      if (apiResponse.status === HttpStatusCodeEnum.Success) {
        this.dataSource = apiResponse['data'].data;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.totalLength = apiResponse['data'].count;
      }
    })
  }

  sortData(event) {
    // console.log("event= ", event)
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getMaintenanceReport(this.filters);
  }

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getMaintenanceReport(this.filters);
  }


  generatePDFReport(type: any, event?: ReportResponse) {
    this.reportObj.data = [];
    this.reportObj.start_datetime = this.maintenanceDateRange[1];
    this.reportObj.end_datetime = this.maintenanceDateRange[0];

    if (this.isEntityTruck) {
      this.reportObj.cols = ['Type', 'Driver', 'Status', 'Start Date', 'End Date', 'Issued Date'];
    } else {
      this.reportObj.cols = ['Type', 'Truck', 'Status', 'Start Date', 'End Date', 'Issued Date'];
    }
    console.log("this.dataSource(generatepdfReport)= ", this.dataSource)
    for (let i = 0; i < this.dataSource.length; i++) {

      let a = moment(this.dataSource[i].issued_datetime * 1000).format('LLLL')

      // @ts-ignore
      this.reportObj.data.push(
        {
          'Type': this.dataSource[i].maintenance_type_name ? this.dataSource[i].maintenance_type_name : '-',
          'Driver': this.dataSource[i].driver_name ? this.dataSource[i].driver_name : '-',
          'Status': this.dataSource[i].status_label ? this.dataSource[i].status_label : '-',
          'Start Date': format(
            this.dataSource[i].start_datetime,
            'MM/DD/YYYY'
          ), 'End Date': format(this.dataSource[i].end_datetime,
            'MM/DD/YYYY'
          ), 'Issued Date': a

        });
    }

    console.log(this.reportObj)

    this.pdfReportObj.emit(this.reportObj);
  }


  onSelect({ selected }, type) {
    // console.log(selected);

    if (!isNullOrUndefined(selected[0].start_lat_lng) && !isNullOrUndefined(selected[0].end_lat_lng)) {
      this.mMap.zoomToMarker({
        lat: selected[0].start_lat_lng,
        long: selected[0].end_lat_lng
      });
    }
  }


  getAssetTypeImage(value) {
    if (value.indexOf('Bin') > -1) {
      return 'assets/images/iol/icon_sm_bin.png';
    } else {
      return 'assets/images/iol/icon_sm_truck.png';
    }
  }


}
