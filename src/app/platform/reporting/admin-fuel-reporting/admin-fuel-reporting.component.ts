import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {format} from 'date-fns';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {FillupResponse} from '../../data/response/reports-response';
import {AppLoader} from '../../data/model/app-loader';
import {isNullOrUndefined} from 'util';
import {DateUtils} from '../../../core/date.utils';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {Item} from '../../data/model/item';
import {TruckService} from '../../services/truck.service';
import * as moment from 'moment';
import {ReportResponse} from '../../model/reportResponse';
import {EntityType} from '../../../core/enum/entity-type.enum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { SwalService } from 'src/app/core/services/swal.service';

@Component({
  selector: 'app-admin-fuel-reporting',
  templateUrl: './admin-fuel-reporting.component.html',
  styleUrls: ['./admin-fuel-reporting.component.css']
})
export class AdminFuelReportingComponent implements OnInit {

  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();
  @Output() fillupCardStats: EventEmitter<any> = new EventEmitter<any>();

  // @ViewChild('fillupMap')
  // fMap: GoogleMapComponent;

  fillupDateRange: any[] = [];
  fillupLoader = new AppLoader();

  fillups: FillupResponse[] = [];
  selected = [];
  purchaseTypes = [];
  violationInfoWindows = [];
  violationMarkers = [];
  reportObj = new ReportResponse();


  isEntityTruck;

  csvFillupCols = [
    {field: 'fill_up_date', header: 'Fuel Date', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'fuel_filled', header: 'Fillup Quantity (L)'},
    {field: 'amount_paid', header: 'Fillup Amount (QAR)'},
    {field: 'payment_method_name', header: 'Payment Method'},
    {field: 'location', header: 'Fillup Location'},
    {field: 'fuel_supervisor_name', header: 'Fuel Supervisor'},
  ];


  constructor(private truckService: TruckService, private swalService: SwalService) {
  }
  
  ngOnInit() {

    this.truckService.getPurchaseTypes({ option_key: 'payment_method' })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          // console.log('purchase', apiResponse);

          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.purchaseTypes = apiResponse.response['option_values'];
          }
          else {
            // console.log(apiResponse.message);
          }

        }
      }(this)
      );
  }


  setupReport(event) {
    this.getReport(event[0], event[1]);
  }

  private getReport(dateRange, type) {
    this.violationInfoWindows = [];
    this.violationMarkers = [];
    const start_date = DateUtils.getYYYYMMDD(dateRange[0].toString()) + ' 00:00:00';
    const end_date = DateUtils.getUtcDateTimeStart(dateRange[1]);
    this.fillupDateRange = [DateUtils.getYYYYMMDD(dateRange[0]), DateUtils.getYYYYMMDD(dateRange[1])];
    this.getFillupReport(start_date, end_date);

  }


  private getFillupReport(start_date, end_date) {
    const params = {
      start_datetime: start_date,
      end_datetime: end_date
    };

    this.truckService.getFillupsReport(params).subscribe((data) => {
      const locations = [];
            const ids = [];
            let info = '';
            if (data.status === HttpStatusCodeEnum.Success) {
              const response = ((data.response[0]['fillups']));
              // console.log(response);
              let fields = [];
              if (response && response.length) {
                response.forEach(element => {
                  fields.push(element.fields);
                });
              }
              this.fillups = fields;
              this.fillupCardStats.emit((data.response[0]['fillups_stats']))
              
              if (response.length) {
                for (let i = 0; i < response.length; i++) {
                  if (!isNullOrUndefined(response[i].lat) && !isNullOrUndefined(response[i].long)) {
                    locations.push(response[i].lat + ',' + response[i].long);
                    info = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
                      '<tbody>';
                    const local = moment.utc(response[i].timestamp).local().format('MMM, DD, YYYY, hh:mm:ss A');

                    info += `<tr><th><b> ${'Timestamp'} </b> </th><td class="text-left">${local}</td> </tr>`;
                    info += `<tr><th><b>${'Fuel Before'}</b> </th><td class="text-left">${response[i].pre_volume + ' gal'}</td> </tr>`;
                    info += `<tr><th><b> ${'Fuel After'} </b></th><td class="text-left">${response[i].post_volume + ' gal'}</td> </tr>`;
                    info += `<tr><th><b> ${'Fuel Filled'}</b> </th><td class="text-left">${response[i].volume_consumed + ' gal'}</td> </tr>`;

                    info += '</tbody> </table>';
                  }

                  this.violationInfoWindows.push(info);
                  if (!isNullOrUndefined(response[i].lat && !isNullOrUndefined(response[i].long))) {

                    this.violationMarkers.push({
                      latitude: response[i].lat,
                      longitude: response[i].long,
                      icon: 'assets/images/iol/icon-map-fillup.png'
                    });
                  }
                }
              } else {
                this.violationMarkers = [];
              }
              // this.fMap.createDummyMarkers(this.violationMarkers, this.violationInfoWindows);
              // this.fillupCluster = this.fMap.createCluster(locations, this.violationInfoWindows, 'assets/images/iol/icon-map-fillup.png');


            }
            if (data.status === HttpStatusCodeEnum.Error) {
              this.swalService.getErrorSwal(data.message);
            }
    });
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
      // @ts-ignore
      this.reportObj.data.push(
        {
          'Date': format(
            Number(this.fillups[j].timestamp),
            'MM/DD/YYYY'
          ),
          'Time': format(
            Number(this.fillups[j].timestamp),
            'h:m a'
          ),
          'Fuel before (gal)': this.fillups[j].pre_volume ? this.fillups[j].pre_volume : '-',
          'Fuel after (gal)': this.fillups[j].post_volume ? this.fillups[j].post_volume : '-',
          'Fuel filled (gal)': this.fillups[j].volume_consumed ? this.fillups[j].volume_consumed : '-',
        });
    }


    this.pdfReportObj.emit(this.reportObj);

  }


  onSelect({selected}, type) {
    if (!isNullOrUndefined(selected[0].lat) && !isNullOrUndefined(selected[0].long)) {
      if (type === 'fillup') {
        // this.fMap.zoomToMarker({lat: selected[0].lat, long: selected[0].long});
      }
    }
  }


  // getMessageForOverlay(date, array, type = null) {
  //   if (isNullOrUndefined(type)) {
  //     if (!date) {
  //       return 'Select start & end date to generate report';
  //     }
  //     // else if(!selected && array) return "Select a record to view on map";
  //     else if (!array) {
  //       return 'No Data Found';
  //     }
  //   } else {
  //     if (!date) {
  //       return 'Select date & time to generate report';
  //     } else if (!array) {
  //       return 'No Data Found';
  //     }
  //   }
  // }


}
