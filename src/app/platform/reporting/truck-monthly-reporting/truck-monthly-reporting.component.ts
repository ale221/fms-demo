import {AfterContentInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {AppLoader} from '../../data/model/app-loader';
import {DateUtils} from '../../../core/date.utils';
import {endOfMonth, getMonth, getYear, startOfMonth} from 'date-fns';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {DropDownItem} from '../../data/model/dropdown-item';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {TruckService} from '../../services/truck.service';
import {MonthDropdown, MonthEnum} from '../../../core/enum/month-enum';
import {isNullOrUndefined} from 'util';
import {ConvertToGallon} from '../../data/model/covert_to_gallon';
import {CBMEnum} from '../../../core/enum/entity-type.enum';
import {GotoPageService} from '../../services/goto-page.service';

@Component({
  selector: 'app-truck-monthly-reporting',
  templateUrl: './truck-monthly-reporting.component.html',
  styleUrls: ['./truck-monthly-reporting.component.css']
})
export class TruckMonthlyReportingComponent implements OnInit, AfterContentInit {


  @ViewChild('monthlyTable') monthlyTable: any;
  @Input() is_customer_client? = false;
  @Input() truckReporting?;
  @Input() driverReporting?;

  selectedTruckType: any;
  selectedMonth: any;
  selectedYear: any = MonthDropdown.getCurrentYear();

  temp = [];
  csvRows = [];
  reportingMonthlyRows = [];
  reportingCols = [];
  reportErrorMessages = null;
  reportLoader = new AppLoader();
  reportMonthlyLoader = new AppLoader();
  months = [];
  years = [];
  truckTypes = [];
  reportDate;
  fileName = 'Monthly Reporting';
  isNullOrUndefined = isNullOrUndefined;


  isValidMonthDateGiven = false;

  constructor(private truckService: TruckService, public gotoService: GotoPageService) {
  }

  ngOnInit() {
  }

  ngAfterContentInit(): void {
    this.months = MonthDropdown.getMonthDropdown();
    this.years = MonthDropdown.getYearDropdown();
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


  verifyMonth() {
    const date = DateUtils.now();
    if (this.selectedMonth === (getMonth(date) + 1) && this.selectedYear === getYear(date)) {
      this.reportErrorMessages = null;
      this.isValidMonthDateGiven = true;
    } else if (this.selectedYear === getYear(date) && (this.selectedMonth > getMonth(date) + 1)) {
      this.reportErrorMessages = 'Please select valid date';
      this.isValidMonthDateGiven = false;
    } else {
      this.reportErrorMessages = null;
      this.isValidMonthDateGiven = !isNullOrUndefined(this.selectedMonth) && !isNullOrUndefined(this.selectedYear);
    }
    console.log(this.reportErrorMessages, this.isValidMonthDateGiven);
  }


  generateReport(event) {
    this.reportingCols = [];
    this.reportingMonthlyRows = [];
    this.csvRows = [];
    const dateRange = event[0];
    const type = event[1];
    const start_datetime = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const end_datetime = DateUtils.getUtcDateTimeStart(dateRange[1]);
    if (type === 'monthly') {
      this.reportDate = MonthEnum[this.selectedMonth] + ',' + this.selectedYear;
    }

    const params = {start_datetime: start_datetime, end_datetime: end_datetime};
    if (this.selectedTruckType) {
      params['type'] = this.selectedTruckType;
    }
    if (this.is_customer_client) {
      params['truck_ids'] = [10259, 10265];
    }
    if (this.driverReporting) {
      params['drivers'] = 1;
    }
    console.log('event from reporting', event, this.selectedTruckType, params);
    this.reportingCols = [
      {field: 'total_collections', header: 'Total Collections'},
      {field: 'total_trips', header: 'Total Trips'},
      // {field: 'truck', header: 'Trucks'},
      // {field: 'shifts', header: 'No. of Shifts'},
      // {field: 'total_distance', header: 'Distance Travelled'},
      // {field: 'volume_consumed', header: 'Volume Consumed'},
      // {field: 'fuel_avg', header: 'Fuel Avg'},
      // {field: 'total_duration', header: 'Total Duration (mins)'},
      // {field: 'total_weight', header: 'Total Weight (kg)s'},
      // // {field: 'shift_status', header: 'Shift Status'},
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

  getVehicleReporting(params) {
    this.truckService.getTrucksReporting(params)
      .subscribe(new class extends HttpController <LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
          console.log('csv', this.context.csvRows[2]);
          console.log('reportingMonthlyRows', this.context.reportingMonthlyRows[2]);
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          console.log('reporting', apiResponse);

          // const pieChartData = [];
          // const pieChartLabels = [];
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.csvRows = apiResponse.response;
            this.context.temp = apiResponse.response;
            this.context.reportingMonthlyRows = apiResponse.response;

            for (let i = 0; i < this.context.csvRows.length; i++) {
              if (this.context.csvRows[i]['total_collections']) {
                // this.context.barChartLabels.push(this.context.csvRows[i].truck);
              }
              if (!isNullOrUndefined(this.context.csvRows[i]['total_volume_consumed'])) {
                // this.context.csvRows[i]['total_volume_consumed'] = ConvertToGallon.convert_to_gallon(this.context.csvRows[i]['total_volume_consumed'], true);
              }
              if (!isNullOrUndefined(this.context.csvRows[i]['total_duration'])) {
                if (this.context.csvRows[i]['total_duration'] !== 0) {
                  // pieChartData.push(this.context.csvRows[i]['total_duration']);
                  // pieChartLabels.push(this.context.csvRows[i]['truck']);
                }
                // this.context.csvRows[i]['total_duration'] = DateUtils.getDuration(this.context.csvRows[i]['total_duration']);
              }
              if (!isNullOrUndefined(this.context.csvRows[i]['running'])) {
                this.context.csvRows[i]['shift_status'] = this.context.csvRows[i]['running'] ? 'Running' : 'Completed';
              }
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


            // this.context.shiftDurationPieChartData = pieChartData;
            // this.context.shiftDurationPieChartLabel = pieChartLabels;
            this.context.reportErrorMessages = null;
          } else {
            console.log(apiResponse.message);
          }

        }
      }(this.reportMonthlyLoader));
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
            this.context.reportingMonthlyRows = apiResponse.response;
            for (let i = 0; i < this.context.csvRows.length; i++) {
              if (this.context.csvRows[i]['total_collections']) {
                // this.context.barChartLabels.push(this.context.csvRows[i].truck);
              }
              // if (!isNullOrUndefined(this.context.csvRows[i]['total_volume_consumed'])) {
              //   this.context.csvRows[i]['total_volume_consumed'] = ConvertToGallon.convert_to_gallon(this.context.csvRows[i]['total_volume_consumed'], true);
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
            console.log(apiResponse.message);
          }

        }
      }(this.reportMonthlyLoader));
  }

  generateMonthlyReport() {
    const start_month = startOfMonth(new Date(this.selectedYear, this.selectedMonth - 1, 1));
    const end_month = endOfMonth(new Date(this.selectedYear, this.selectedMonth - 1, 1));
    console.log('start date', start_month, end_month);
    this.generateReport([[start_month, end_month], 'monthly']);
  }

  toggleReportingTable(tableType, row) {
    this.monthlyTable.rowDetail.toggleExpandRow(row);

  }

  updateFilter(event) {
    this.reportingMonthlyRows = event;
  }


}
