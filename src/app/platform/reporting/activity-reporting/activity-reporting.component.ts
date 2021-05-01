import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {AppLoader} from '../../data/model/app-loader';
import {ReportResponse} from '../../model/reportResponse';
import {DateUtils} from '../../../core/date.utils';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {TruckResponse} from '../../data/response/entity-response';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {format} from 'date-fns';
import {GotoPageService} from '../../services/goto-page.service';
import {Router} from '@angular/router';
import {SwalService} from '../../../core/services/swal.service';

@Component({
  selector: 'app-activity-reporting',
  templateUrl: './activity-reporting.component.html',
  styleUrls: ['./activity-reporting.component.css']
})
export class ActivityReportingComponent implements OnInit, OnChanges {

  @Input() serviceObj;
  @Input() entity;
  @Input() isEntityTruck? = true;

  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();


  @ViewChild('shiftTable')
  shiftTable: any;


  activitiesLoader = new AppLoader();

  activities = [];
  violationMarkers = [];
  violationInfoWindows = [];
  activitiesDateRange = [];
  selected = [];


  reportObj = new ReportResponse();


  csvActivityCols = [
    {field: 'start_datetime', header: 'Start Datetime', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'end_datetime', header: 'End Datetime', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'activity_status_label', header: 'Status'},
    {field: 'actor_name', header: 'Driver'},
    {field: 'primary_entity_name', header: 'Truck'},
  ];

  constructor(private gotoService: GotoPageService,
              private router: Router,
              private swalService: SwalService,
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('previousValue' in changes.entity) {
      this.activities = [];
      this.activitiesDateRange = [];
      this.reportObj = new ReportResponse();

    }
  }


  setupReport(event) {
    console.log(event);
    this.getReport(event[0], event[1]);
  }


  getReport(dateRange, type) {
    this.violationMarkers = [];
    this.violationInfoWindows = [];
    const startDate = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const endDate = DateUtils.getUtcDateTimeStart(dateRange[1]);
    // this.activitiesDateRange = [startDate, endDate];
    this.activitiesDateRange = [DateUtils.getYYYYMMDD(dateRange[0]), DateUtils.getYYYYMMDD(dateRange[1])];
    this.getActivitiesByRange(startDate, endDate);
  }

  getActivitiesByRange(startDate, endDate) {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    if (this.isEntityTruck) {
      params['truck_id'] = this.entity;
    } else {
      params['driver_id'] = this.entity;
    }
    this.serviceObj.getScheduleActivities(params).subscribe(new class extends HttpController<LoginApiResponse<any>> {
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


  generatePDFReport(type: any) {
    this.reportObj.data = [];


    this.reportObj.start_datetime = this.activitiesDateRange[1];
    this.reportObj.end_datetime = this.activitiesDateRange[0];

    this.reportObj.cols = ['Start Date', 'Start Time', 'End Date', 'End Time', 'Status', 'Actor', 'Truck'];
    for (let j = 0; j < this.activities.length; j++) {
      // @ts-ignore
      this.reportObj.data.push(
        {
          'Start Date': this.activities[j].start_datetime ? format(
            this.activities[j].start_datetime,
            'MM/DD/YYYY'
          ) : '-',
          'Start Time': this.activities[j].start_datetime ? format(
            this.activities[j].start_datetime,
            'h:mm a'
          ) : '-',
          'End Date': this.activities[j].end_datetime ? format(
            this.activities[j].end_datetime,
            'MM/DD/YYYY'
          ) : '-',
          'End Time': this.activities[j].end_datetime ? format(
            this.activities[j].end_datetime,
            'h:mm a'
          ) : '-',
          'Actor': this.activities[j].actor_name ? this.activities[j].actor_name : '-',
          'Truck': this.activities[j].primary_entity_name ? this.activities[j].primary_entity_name : '-',
          'Status': this.activities[j].activity_status_label ? this.activities[j].activity_status_label : '-',
        });
    }
    this.pdfReportObj.emit(this.reportObj);
  }


  gotoActivity() {
    const activity = this.selected[0];
    if (activity.id) {
      const url = this.gotoService.gotoRouteDetail(activity.id);
      this.router.navigateByUrl(url);
    }
  }


  getClass(status) {
    return this.serviceObj.getClass(status);
  }


}
