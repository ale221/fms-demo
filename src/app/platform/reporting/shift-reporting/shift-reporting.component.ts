import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AppLoader} from '../../data/model/app-loader';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {format} from 'date-fns';
import {GetNullOrUndefinedPipe} from '../../../core/pipes/get-null-or-undefined.pipe';
import {isNullOrUndefined} from 'util';
import {ReportResponse} from '../../model/reportResponse';
import {SwalService} from '../../../core/services/swal.service';
import { DateUtils } from 'src/app/Utils/DateUtils';

@Component({
  selector: 'app-shift-reporting',
  templateUrl: './shift-reporting.component.html',
  styleUrls: ['./shift-reporting.component.css']
})
export class ShiftReportingComponent implements OnInit {
  @Input() serviceObj;
  @Input() entity;
  @Input() isEntityTruck? = true;

  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();


  @ViewChild('shiftTable')
  shiftTable: any;


  shiftLoader = new AppLoader();

  shifts = [];
  violationMarkers = [];
  violationInfoWindows = [];
  shiftsDateRange = [];


  reportObj = new ReportResponse();


  csvShiftsCols = [
    {field: 'truck', header: 'Truck'},
    {field: 'driver', header: 'Staff'},
    {field: 'driver_type', header: 'Role'},
    {field: 'shift_start_time', header: 'Shift Start', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'shift_end_time', header: 'Shift End', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'shift_duration', header: 'Shift Duration'},
    {field: 'distance_travelled', header: 'Distance Travelled(km)'},
    {field: 'volume_consumed', header: 'Volume Consumed (gal)'},
    {field: 'fuel_avg', header: 'Fuel Avg'},
    {field: 'trips_completed', header: 'Trips Completed'},

  ];


  constructor(private swalService: SwalService) {
  }

  ngOnInit() {
  }


  setupReport(event) {
    this.getReport(event[0], event[1]);
  }


  private getReport(dateRange, type) {
    this.violationMarkers = [];
    this.violationInfoWindows = [];

    const start_date = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const end_date = DateUtils.getUtcDateTimeStart(dateRange[1]);

    this.shiftsDateRange = [DateUtils.getYYYYMMDD(dateRange[0]), DateUtils.getYYYYMMDD(dateRange[1])];
    this.getShiftsReport(start_date, end_date);
    // if (start_date === end_date) {
    //   end_date = DateUtils.getUtcDateTimeEnd(dateRange[1]);
    // }

  }

  getShiftsReport(startDate, endDate) {
    const params = {
      start_datetime: startDate,
      end_datetime: endDate
    };
    if (this.isEntityTruck) {
      params['t_id'] = this.entity;
    } else {
      params['d_id'] = this.entity;
    }
    // params.start_datetime += ' 00:00:00';
    // params.end_datetime += ' 23:59:59';
    //
    // // Convert to UTC
    // params.start_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.start_datetime);
    // params.end_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.end_datetime);
    this.serviceObj.getShiftData(params)
      .subscribe(new class extends HttpController <LoginApiResponse<any[]>> {

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
              this.context.shifts = apiResponse.response;
              for (let i = 0; i < this.context.shifts.length; i++) {
                //   this.context.shifts[i].volume_consumed = ConvertToGallon.convert_to_gallon(this.context.shifts[i].volume_consumed, true);
                //   if (this.context.shifts[i].shift_duration === 0 || !this.context.shifts[i].hasOwnProperty('shift_duration')) {
                //     if (!isNullOrUndefined(this.context.shifts[i].shift_end_time)) {
                //       this.context.shifts[i]['shift_duration'] = DateUtils.getDuration(differenceInMinutes(new Date(this.context.shifts[i].shift_end_time), new Date(this.context.shifts[i].shift_start_time)));
                //     }
                //     // else  { this.context.shifts[i]['shift_duration1'] = null; }
                //   } else {
                this.context.shifts[i]['shift_duration'] = DateUtils.getDuration(this.context.shifts[i]['shift_duration']);
              }
              // }
            }
            if (apiResponse.status === HttpStatusCodeEnum.Error) {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }

          }

        }(this.shiftLoader)
      );

  }


  generatePDFReport(type: any) {
    this.reportObj.data = [];

    this.reportObj.start_datetime = this.shiftsDateRange[1];
    this.reportObj.end_datetime = this.shiftsDateRange[0];

    this.reportObj.cols = ['Start\nDate', 'End\nDate', 'Driver', 'Shift\nDuration', 'Distance\nTravelled', 'Volume\nConsumed', 'Fuel\nAvg', 'Trips\nCompleted', 'Waste\nCompleted', 'Total\nBins'];
    for (let j = 0; j < this.shifts.length; j++) {
      // @ts-ignore
      this.reportObj.data.push(
        {
          'Start\nDate': this.shifts[j].shift_start_time ? format(
            this.shifts[j].shift_start_time,
            'MM/DD/YYYY h:mm a'
          ) : '-',
          'End\nDate': this.shifts[j].shift_end_time ? format(
            this.shifts[j].shift_end_time,
            'MM/DD/YYYY h:mm a'
          ) : '-',
          'Driver': this.shifts[j].driver ? this.shifts[j].driver : '-',
          'Shift\nDuration': this.shifts[j].shift_duration ? this.shifts[j].shift_duration : '-',
          'Distance\nTravelled': GetNullOrUndefinedPipe.prototype.transform(this.shifts[j].distance_travelled),
          'Volume\nConsumed': GetNullOrUndefinedPipe.prototype.transform(this.shifts[j].volume_consumed),
          'Fuel\nAvg': GetNullOrUndefinedPipe.prototype.transform(this.shifts[j].fuel_avg),
          'Trips\nCompleted': GetNullOrUndefinedPipe.prototype.transform(this.shifts[j].trips_completed),
          'Waste\nCompleted': GetNullOrUndefinedPipe.prototype.transform(this.shifts[j].waste_collected),
          'Total\nBins': GetNullOrUndefinedPipe.prototype.transform(this.shifts[j].collections['Total Bins']),
        });
    }
    this.pdfReportObj.emit(this.reportObj);
  }


  toggleExpandRow(row) {

    this.shiftTable.rowDetail.toggleExpandRow(row);

  }

}
