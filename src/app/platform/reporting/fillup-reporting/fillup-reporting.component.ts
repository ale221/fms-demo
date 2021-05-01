import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {format} from 'date-fns';
import {AppLoader} from '../../data/model/app-loader';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {TruckService} from '../../services/truck.service';
import {ReportResponse} from '../../model/reportResponse';
import {EntityType} from '../../../core/enum/entity-type.enum';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { SwalService } from 'src/app/core/services/swal.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/Services/auth.service';
declare var $: any;

@Component({
  selector: 'app-fillup-reporting',
  templateUrl: './fillup-reporting.component.html',
  styleUrls: ['./fillup-reporting.component.css']
})
export class FillupReportingComponent implements OnInit {
  @Input() entity;
  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();
  selectedTruck: any;

  fillupDateRange: any[] = [];
  fillupLoader = new AppLoader();

  fillups: any;
  fillupCount = 0;
  selected = [];
  purchaseTypes: any;
  violationInfoWindows = [];
  violationMarkers = [];
  reportObj = new ReportResponse();
  downloadableLink = ''

  isEntityTruck;

  displayedColumns = ['fill_up_date', 'fuel_filled', 'amount_paid', 'payment_method_name', 'location', 'fuel_supervisor_name', 'actions'];
  filters = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '',  end_datetime: '', truck_id: ''};
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  csvFillupCols = [
    {field: 'fill_up_date', header: 'Fuel Date', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'fuel_filled', header: 'Fillup Quantity (L)'},
    {field: 'amount_paid', header: 'Fillup Amount (QAR)'},
    {field: 'payment_method_name', header: 'Payment Method'},
    {field: 'location', header: 'Fillup Location'},
    {field: 'fuel_supervisor_name', header: 'Fuel Supervisor'}
  ];

  loggedInUser;
  customerID;

  constructor(private truckService: TruckService, private swalService: SwalService, private authService: AuthService) {
  }

  ngOnInit() {
    this.isEntityTruck = this.entity.type === EntityType.TRUCK;
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    // this.truckService.getPurchaseTypes({ option_key: 'payment_method' })
    // .subscribe(apiResponse => {
    //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
    //     this.purchaseTypes = apiResponse.response['option_values'];
    //   }
    // })
  }

  openImageModal(truck) {
    this.selectedTruck = truck;
    setTimeout(() => {
      $('.modal-backdrop.fade.in').addClass('fuel-fillup-opacity');
    }, 500);
  }

  setupReport(event) {
    const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);
    this.filters.start_datetime = start_date;
    this.filters.end_datetime = end_date;
    this.filters.truck_id = this.entity
    this.getFillupReport(this.filters);

    this.downloadableLink = environment.baseUrl + '/iof/vehicle_detail_fuellist_export_xls/?device_id='+this.entity+'&customer_id=' + this.customerID + '&start_datime='+this.filters.start_datetime+'&end_datetime='+this.filters.end_datetime+'&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this.downloadableLink = 'https://dev.iot.vodafone.com.qa/backend/iof/vehicle_detail_fuellist_export_xls/?device_id='+this.entity+'&customer_id=' + this.customerID + '&start_datime='+this.filters.start_datetime+'&end_datetime='+this.filters.end_datetime+'&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

  }

  private getFillupReport(filters) {
    const params = filters;
    this.truckService.getFillupsReport(params)
    .subscribe(apiResponse => {
      if (apiResponse.status === HttpStatusCodeEnum.Success) {
        this.fillups = apiResponse['data'].data;
        this.fillupCount = apiResponse['data'].count;
        this.fillups.sort = this.sort;
        this.fillups.paginator = this.paginator;
      }
      if (apiResponse.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse.message);
      }
    })
  }

  sortData (event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getFillupReport(this.filters);
  }

  onPaginateChange (event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getFillupReport(this.filters);
  }

  generatePDFReport(type: any) {
    this.reportObj.data = [];
    this.reportObj.start_datetime = this.fillupDateRange[1];
    this.reportObj.end_datetime = this.fillupDateRange[0];

    if (this.isEntityTruck) {
      this.reportObj.cols = ['Date', 'Time', 'Fuel before (gal)', 'Fuel after (gal)', 'Fuel filled (gal)', 'Distance Travelled (km)', 'Fuel Average (km/gal)'];
    } else {
      this.reportObj.cols = ['Date', 'Time', 'Fuel before (gal)', 'Fuel after (gal)', 'Fuel filled (gal)'];

    }

    for (let j = 0; j < this.fillups.length; j++) {
      this.reportObj.data.push(
        {
          'Date': format(
            this.fillups[j].timestamp,
            'MM/DD/YYYY'
          ),
          'Time': format(
            this.fillups[j].timestamp,
            'h:m a'
          ),
          'Fuel before (gal)': this.fillups[j].pre_volume ? this.fillups[j].pre_volume : '-',
          'Fuel after (gal)': this.fillups[j].post_volume ? this.fillups[j].post_volume : '-',
          'Fuel filled (gal)': this.fillups[j].volume_consumed ? this.fillups[j].volume_consumed : '-',
        });
    }
    this.pdfReportObj.emit(this.reportObj);
  }
}
