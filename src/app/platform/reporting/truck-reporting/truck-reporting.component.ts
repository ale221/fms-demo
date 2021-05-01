import {AfterContentInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {DropDownItem} from '../../data/model/dropdown-item';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {TruckService} from '../../services/truck.service';
import {DateUtils} from '../../../core/date.utils';
import {MonthEnum} from '../../../core/enum/month-enum';
import {isNullOrUndefined} from 'util';
import {ConvertToGallon} from '../../data/model/covert_to_gallon';
import {CBMEnum} from '../../../core/enum/entity-type.enum';
import {AppLoader} from '../../data/model/app-loader';
import {GotoPageService} from '../../services/goto-page.service';
import {DatatableService} from '../../services/datatable.service';

@Component({
  selector: 'app-truck-reporting',
  templateUrl: './truck-reporting.component.html',
  styleUrls: ['./truck-reporting.component.css']
})
export class TruckReportingComponent implements OnInit, AfterContentInit {

  selectedTruckType: any;
  selectedMonth: any;
  selectedYear: any = 2019;
  reportErrorMessages;

  truckTypes = [];

  reportLoader = new AppLoader();
  isNullOrUndefined = isNullOrUndefined;
  reportingRows = [];
  reportingCols = [];
  temp = [];
  csvRows = [];
  reportDate;
  fileName = 'Reporting';

  inputValue;


  @Input() truckReporting?;
  @Input() driverReporting?;
  @Input() is_customer_client? = false;
  @ViewChild('reportingTable') reportingTable: any;


  constructor(private truckService: TruckService,
              private datatableService: DatatableService,
              public gotoService: GotoPageService) {
  }

  ngOnInit() {
  }

  ngAfterContentInit(): void {
    if (this.truckReporting) {
      this.getTruckTypes();
      this.fileName = 'Trucks ' + this.fileName;
    } else {
      this.fileName = 'Drivers ' + this.fileName;
    }
  }


  getTruckTypes() {
    this.truckService.getPurchaseTypes({option_key: 'trucktypes'})
      .subscribe(new class extends HttpController <LoginApiResponse<DropDownItem[]>> {

          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
            console.log('types', apiResponse);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.truckTypes = apiResponse.response['option_values'].map(function (obj) {
                return {label: obj.label, value: obj.value};
              });

              this.context.truckTypes.unshift({label: 'All'});

            } else {
              console.log(apiResponse.message);
            }

          }
        }(this)
      );


  }


  generateReport(event) {
    this.reportingRows = [];
    this.reportingCols = [];
    const dateRange = event[0];
    const type = event[1];
    const start_datetime = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const end_datetime = DateUtils.getUtcDateTimeStart(dateRange[1]);
    this.reportDate = end_datetime;
    const params = {start_datetime: start_datetime, end_datetime: end_datetime};
    if (this.selectedTruckType) {
      params['type'] = this.selectedTruckType;
    }
    if (this.driverReporting) {
      params['drivers'] = 1;
    }
    if (this.is_customer_client) {
      params['truck_ids'] = [10259, 10265];
    }
    console.log('event from reportingg', params);
    this.reportingCols = [
      {field: 'truck', header: 'Trucks'},
      // {field: 'shifts', header: 'No. of Shifts'},
      {field: 'total_distance', header: 'Distance Travelled'},
      {field: 'volume_consumed', header: 'Fuel Consumed'},
      {field: 'fuel_avg', header: 'Fuel Avg'},
      // {field: 'total_duration', header: 'Total Duration (mins)'},
      // {field: 'total_collections', header: 'Total Collections'},
      // {field: 'total_weight', header: 'Total Weight (kg)s'},
      // {field: 'total_trips', header: 'Total Trips'},
      // {field: 'shift_status', header: 'Shift Status'},
      // {field: 'manpower', header: 'Manpower (cbm/hour)'},
      // {field: '240 litres', header: '240 litres'},
      // {field: '1cbm', header: '1.1 cbm'},
      // {field: '2cbm', header: '2.5 cbm'},
      // {field: '5 cbm', header: '5 cbm'},
      // {field: '8 cbm', header: '8 cbm'},
      // {field: '10 cbm', header: '10 cbm'},
      // {field: '12 cbm', header: '12 cbm'},
      // {field: '14 cbm', header: '14 cbm'},
      // {field: '18 cbm', header: '18 cbm'},
      // {field: '20 cbm', header: '20 cbm'},
      // {field: '26 cbm', header: '26 cbm'},
      // {field: '30 cbm', header: '30 cbm'},
      // {field: '40 cbm', header: '40 cbm'},
      // {field: 'Medical Waste', header: 'Medical Waste'},
    ];
    if (this.driverReporting) {
      this.reportingCols.push({field: 'driver', header: 'Driver'});

      this.getStaffReporting(params);
    } else {
      this.getVehicleReporting(params);
    }


  }


  getStaffReporting(params) {
    this.truckService.getStaffReporting(params)
      .subscribe(new class extends HttpController <LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          console.log('reporting', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.csvRows = apiResponse.response;
            this.context.temp = apiResponse.response;
            this.context.reportingRows = apiResponse.response;
            for (let i = 0; i < this.context.csvRows.length; i++) {
              if (this.context.csvRows[i]['total_collections']) {
                // this.context.barChartLabels.push(this.context.csvRows[i].truck);
              }
              if (!isNullOrUndefined(this.context.csvRows[i]['total_volume_consumed'])) {
                this.context.csvRows[i]['total_volume_consumed'] = ConvertToGallon.convert_to_gallon(this.context.csvRows[i]['total_volume_consumed'], true);
              }
              // if (!isNullOrUndefined(this.context.csvRows[i]['total_duration'])) {
              //   this.context.csvRows[i]['total_duration'] = DateUtils.getDuration(this.context.csvRows[i]['total_duration']);
              // }
              // if (!isNullOrUndefined(this.context.csvRows[i]['running'])) {
              //   this.context.csvRows[i]['shift_status'] = this.context.csvRows[i]['running'] ? 'Running' : 'Completed';
              // }
              if (!isNullOrUndefined(this.context.csvRows[i]['1.1 cbm'])) {
                this.context.csvRows[i]['1cbm'] = this.context.csvRows[i]['1.1 cbm'];
                // this.context.barChartData[1].data.push(this.context.csvRows[i]['1.1 cbm']);
              }
              if (!isNullOrUndefined(this.context.csvRows[i]['2.5 cbm'])) {
                this.context.csvRows[i]['2cbm'] = this.context.csvRows[i]['2.5 cbm'];
                // this.context.barChartData[2].data.push(this.context.csvRows[i]['2.5 cbm']);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._5cbm])) {
                // this.context.barChartData[3].data.push(this.context.csvRows[i][CBMEnum._5cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._8cbm])) {
                // this.context.barChartData[4].data.push(this.context.csvRows[i][CBMEnum._8cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._10cbm])) {
                // this.context.barChartData[5].data.push(this.context.csvRows[i][CBMEnum._10cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._12cbm])) {
                // this.context.barChartData[6].data.push(this.context.csvRows[i][CBMEnum._12cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._14cbm])) {
                // this.context.barChartData[7].data.push(this.context.csvRows[i][CBMEnum._14cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._18cbm])) {
                // this.context.barChartData[8].data.push(this.context.csvRows[i][CBMEnum._18cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._20cbm])) {
                // this.context.barChartData[9].data.push(this.context.csvRows[i][CBMEnum._20cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._26cbm])) {
                // this.context.barChartData[10].data.push(this.context.csvRows[i][CBMEnum._26cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._30cbm])) {
                // this.context.barChartData[11].data.push(this.context.csvRows[i][CBMEnum._30cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._240litres])) {
                // this.context.barChartData[0].data.push(this.context.csvRows[i][CBMEnum._240litres]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._MedicalWaste])) {
                // this.context.barChartData[12].data.push(this.context.csvRows[i][CBMEnum._MedicalWaste]);
              }
            }
            this.context.reportErrorMessages = null;


          } else {
            console.log(apiResponse.message);
          }

        }
      }(this.reportLoader));
  }

  getVehicleReporting(params) {
    this.truckService.getTrucksReporting(params)
      .subscribe(new class extends HttpController <LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          console.log('reporting', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.csvRows = apiResponse.response;
            this.context.temp = apiResponse.response;
            this.context.reportingRows = apiResponse.response;
            for (let i = 0; i < this.context.csvRows.length; i++) {
              if (this.context.csvRows[i]['total_collections']) {
                // this.context.barChartLabels.push(this.context.csvRows[i].truck);
              }
              // if (!isNullOrUndefined(this.context.csvRows[i]['total_volume_consumed'])) {
                // this.context.csvRows[i]['total_volume_consumed'] = ConvertToGallon.convert_to_gallon(this.context.csvRows[i]['total_volume_consumed'], true);
              // }
              // if (!isNullOrUndefined(this.context.csvRows[i]['total_duration'])) {
              //   this.context.csvRows[i]['total_duration'] = DateUtils.getDuration(this.context.csvRows[i]['total_duration']);
              // }
              // if (!isNullOrUndefined(this.context.csvRows[i]['running'])) {
              //   this.context.csvRows[i]['shift_status'] = this.context.csvRows[i]['running'] ? 'Running' : 'Completed';
              // }
              if (!isNullOrUndefined(this.context.csvRows[i]['1.1 cbm'])) {
                this.context.csvRows[i]['1cbm'] = this.context.csvRows[i]['1.1 cbm'];
                // this.context.barChartData[1].data.push(this.context.csvRows[i]['1.1 cbm']);
              }
              if (!isNullOrUndefined(this.context.csvRows[i]['2.5 cbm'])) {
                this.context.csvRows[i]['2cbm'] = this.context.csvRows[i]['2.5 cbm'];
                // this.context.barChartData[2].data.push(this.context.csvRows[i]['2.5 cbm']);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._5cbm])) {
                // this.context.barChartData[3].data.push(this.context.csvRows[i][CBMEnum._5cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._8cbm])) {
                // this.context.barChartData[4].data.push(this.context.csvRows[i][CBMEnum._8cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._10cbm])) {
                // this.context.barChartData[5].data.push(this.context.csvRows[i][CBMEnum._10cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._12cbm])) {
                // this.context.barChartData[6].data.push(this.context.csvRows[i][CBMEnum._12cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._14cbm])) {
                // this.context.barChartData[7].data.push(this.context.csvRows[i][CBMEnum._14cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._18cbm])) {
                // this.context.barChartData[8].data.push(this.context.csvRows[i][CBMEnum._18cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._20cbm])) {
                // this.context.barChartData[9].data.push(this.context.csvRows[i][CBMEnum._20cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._26cbm])) {
                // this.context.barChartData[10].data.push(this.context.csvRows[i][CBMEnum._26cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._30cbm])) {
                // this.context.barChartData[11].data.push(this.context.csvRows[i][CBMEnum._30cbm]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._240litres])) {
                // this.context.barChartData[0].data.push(this.context.csvRows[i][CBMEnum._240litres]);
              }
              if (!isNullOrUndefined(this.context.csvRows[i][CBMEnum._MedicalWaste])) {
                // this.context.barChartData[12].data.push(this.context.csvRows[i][CBMEnum._MedicalWaste]);
              }
            }
            this.context.reportErrorMessages = null;
          } else {
            // console.log(apiResponse.message);
          }

        }
      }(this.reportLoader));
  }

  toggleReportingTable(tableType, row) {
    if (tableType === 1) {
      this.reportingTable.rowDetail.toggleExpandRow(row);
    }

  }

  updateFilter(event) {
    this.reportingRows = event;
  }


}
