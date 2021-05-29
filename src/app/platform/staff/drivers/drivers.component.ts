import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';

import { isNullOrUndefined } from 'util';
import { ResizeDatatableService } from '../../shared/resize-datatable.service';
import { endOfMonth, getMonth, getYear, startOfMonth } from 'date-fns';
import { EntityType } from 'src/app/core/enum/entity-type.enum';
import { AppLoader } from '../../data/model/app-loader';
import { EntityResponse } from 'src/app/model/entity.response';
import { EntityService } from '../../services/entity.service';
import { DriverService } from '../../services/driver.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { TruckService } from '../../services/truck.service';
import { MonthDropdown, MonthEnum } from 'src/app/core/enum/month-enum';
import { HttpController } from 'src/app/core/services/loading-controller';
import { LoginApiResponse, TestApiResponse } from 'src/app/core/model/api.response';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { ConvertToGallon } from '../../data/model/covert_to_gallon';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})
export class DriversComponent implements OnInit, OnDestroy {

  searchPlaceHolder = ' Search driver name or truck...';
  EntityType = EntityType;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  optimizedTechnicianCall: any;
  appLoader = new AppLoader();
  technicianLoader = new AppLoader();
  laborLoader = new AppLoader();
  drivers: any[] = [];
  technicians: any[] = [];
  temp: any[] = [];
  tempTotalTechnicians: any[] = [];
  tempassigned: any[] = [];
  tempunassigned: any[] = [];
  tempavailable: any[] = [];
  tempactivity: any[] = [];
  totalDrivers: any[] = [];
  tempTotalDrivers: any[] = [];
  totalLabors: any[] = [];
  totalTechnicians: any[] = [];
  tempTotalLabors: any[] = [];
  // response: EntityResponse[] = [];
  response;
  onShift: number;
  onActivity: number;
  assigned: number;
  unassigned: number;
  available: number;
  onActivityList: any = [];
  assignedList: any = [];
  allStaffList = [];
  unassignedList: any = [];
  availableList: any = [];
  driversLength: number;
  laborsLength: number;
  techniciansLength: number;
  now = Date.now();
  results_remaining = false;

  @ViewChild('tab1') private tab1;
  @ViewChild('tab2') private tab2;
  @ViewChild('tab3') private tab3;
  @ViewChild('tab4') private tab4;
  @ViewChild('tab5') private tab5;
  @ViewChild('tab6') private tab6;
  @ViewChild('tab7') private tab7;

  currentActiveTab: any = '1';

  activeTab = 1;
  mainActiveTab = 1;
  truckTypes = [];
  selectedTruckType: any;
  selectedMonth: any;
  selectedYear: any = 2019;
  reportingRows = [];
  csvRows = [];
  reportingMonthlyRows = [];
  reportingCols = [];
  reportErrorMessages = null;
  reportLoader = new AppLoader();
  reportMonthlyLoader = new AppLoader();
  months = [];
  years = [];
  reportDate;
  isNullOrUndefined = isNullOrUndefined;
  isValidMonthDateGiven = false;

  selectedRole;
  itemListRole = [
    { value: EntityType.LABOUR, label: 'Labor' },
    { value: EntityType.Workshop_Technician, label: 'Workshop Technician' },
    { value: EntityType.DRIVER, label: 'Driver' }];


  @ViewChild('table') table: any;
  @ViewChild('shiftTable') shiftTable: any;
  @ViewChild('monthlyTable') monthlyTable: any;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;

  constructor(private entityService: EntityService,
    private driverService: DriverService,
    private swalService: SwalService,
    private truckService: TruckService,
    public resizeDatatableSerivce: ResizeDatatableService) {
  }

  ngOnInit() {
    this.allStaffList = [];
    this.months = MonthDropdown.getMonthDropdown();
    this.years = MonthDropdown.getYearDropdown();
    this.getTruckTypes();
    this.getDrivers();
    this.optimized_labours_call(0, 100);
    this.optimized_technicians_call(0, 100);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
    }, 300);
  }

  /**
   * methods switches tabs
   * @param event
   */
  switchTabs(event) {
    if (this.activeTab !== 1)
      return;
    this.currentActiveTab = event;
    this.resizeDatatableSerivce.recalculate();


  }

  /**
   * Refreshes the list of data of current active tab, flters data according to data list
   */
  refreshCurrentTabData() {
    // console.log('this.currentActiveTab  : ', this.currentActiveTab);
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    if (this.currentActiveTab == 1) {
      this.allStaffList = [];
      this.totalLabors = [];
      this.totalDrivers = [];
      this.totalTechnicians = [];
      this.getDrivers();
      this.optimized_labours_call(0, 100);
      this.optimized_technicians_call(0, 100);
    } else if (this.currentActiveTab == 2) {
      this.totalLabors = [];
      this.tempTotalLabors = [];
      this.optimized_labours_call(0, 100);
    } else if (this.currentActiveTab == 3) {
      this.onShift = 0;
      this.onActivity = 0;
      this.assigned = 0;
      this.unassigned = 0;
      this.available = 0;
      this.onActivityList = [];
      this.assignedList = [];
      this.unassignedList = [];
      this.availableList = [];
      this.tempactivity = [];
      this.totalDrivers = [];
      this.tempTotalDrivers = [];
      this.optimized_drivers_call(0, 100);
    } else if (this.currentActiveTab == 4) {
      this.totalTechnicians = [];
      this.optimized_technicians_call(0, 100);

    } else {
      this.onShift = 0;
      this.onActivity = 0;
      this.assigned = 0;
      this.unassigned = 0;
      this.available = 0;
      this.onActivityList = [];
      this.assignedList = [];
      this.unassignedList = [];
      this.availableList = [];
      this.tempactivity = [];
      this.totalDrivers = [];
      this.tempTotalDrivers = [];
      this.optimized_drivers_call(0, 100);
    }
  }

  getDrivers(): void {
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.onShift = 0;
    this.onActivity = 0;
    this.assigned = 0;
    this.unassigned = 0;
    this.available = 0;
    this.onActivityList = [];
    this.tempactivity = [];
    this.assignedList = [];
    this.tempassigned = [];
    this.unassignedList = [];
    this.tempunassigned = [];
    this.availableList = [];
    this.tempavailable = [];
    this.totalDrivers = [];
    this.tempTotalDrivers = [];
    this.tempTotalLabors = [];
    this.totalLabors = [];
    this.drivers = [];
    this.temp = [];
    const index_a = 0;
    const index_b = 100;
    const results_remaining = true;
    this.drivers = [];
    this.entityService.getListingCount('get_counts_listing', { type_id: EntityType.DRIVER })
      .subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          // console.log('driver count', apiResponse);

          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.driversLength = apiResponse.response;
            // this.context.optimized_drivers_call(index_a, index_b);
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
      );
    this.entityService.getListingCount('get_counts_listing', { type_id: EntityType.LABOUR })
      .subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
        onComplete(): void {

        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          // console.log('labor count', apiResponse);

          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.laborsLength = apiResponse.response;
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
      );

    this.entityService.getListingCount('get_counts_listing', { type_id: EntityType.Workshop_Technician })
      .subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
        onComplete(): void {
          this.context.optimized_drivers_call(index_a, index_b);

        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          // console.log('technician count', apiResponse);

          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.techniciansLength = apiResponse.response;
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
      );
  }

  optimized_drivers_call(index_a, index_b) {
    let resultsRemaining;
    this.optimizedTechnicianCall = this.entityService.getEntities({
      index_a: index_a,
      index_b: index_b,
      type_id: EntityType.DRIVER,
    }).subscribe(data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.response = data.response;
        // resultsRemaining = data.remaining;
        resultsRemaining = false;
        const response = data.response;
        this.totalDrivers = [...this.totalDrivers, ...response];
        this.tempTotalDrivers = this.totalDrivers;
        for (let i = 0; i < response.length; i++) {


          if (response[i]['on_activity']) {
            this.onActivity += 1;
            this.onActivityList.push(response[i]);
            this.tempactivity.push(response[i]);
          }
          if (response[i]['on_shift']) {
            if (isNullOrUndefined(response[i]['on_activity'])) {
              this.available += 1;
              this.availableList.push(response[i]);
              this.tempavailable.push(response[i]);
            }
            this.onShift += 1;
          }
          if (!isNullOrUndefined(response[i]['assigned_truck'])) {
            this.assigned += 1;
            this.assignedList.push(response[i]);
            this.tempassigned.push(response[i]);
          } else {
            this.unassigned += 1;
            this.unassignedList.push(response[i]);
            this.tempunassigned.push(response[i]);
          }
        }

        if (resultsRemaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_drivers_call(index_a, index_b);
        } else {
          this.searchPlaceHolder = 'Search driver name or truck...';
          this.enableSearch = false;
          this.showIndeterminateProgress = false;
          this.allStaffList = this.allStaffList.concat(this.totalDrivers);
          this.temp = this.allStaffList;


          // this.allStaffList = [...this.totalDrivers, this.allStaffList];
          // this.totalDrivers.map(driver => this.allStaffList.push(driver));
          // this.optimized_labours_call(0, 100);
        }

      }
      if (data.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(data.message);
      }
    })
  }

  optimized_labours_call(index_a, index_b) {
    this.showIndeterminateProgress = true;
    this.optimizedCall = this.entityService.getEntities({
      index_a: index_a,
      index_b: index_b,
      type_id: EntityType.LABOUR,
    }).subscribe(data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        const response = data.response;
        this.totalLabors = [...this.totalLabors, ...response];
        this.tempTotalLabors = this.totalLabors;
        for (let i = 0; i < response.length; i++) {
          this.drivers['type_name'] = 'Labour';
          if (response[i]['on_shift']) {
            this.onShift += 1;
          }
        }
        if (this.results_remaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_labours_call(index_a, index_b);
        } else {
          // this.allStaffList = [...this.totalLabors];
          // this.totalLabors.map(labor => this.allStaffList.push(labor));
          this.allStaffList = this.allStaffList.concat(this.totalLabors);
          this.temp = this.allStaffList;


          this.enableSearch = false;
          this.showIndeterminateProgress = false;
          // console.log('call completed and list of all staff', this.allStaffList.length, this.temp.length);
        }
      }
      if (data.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(data.message);
      }
    });
  }

  optimized_technicians_call(index_a, index_b) {
    let resultsRemaining;
    this.optimizedCall = this.entityService.getEntities({
      index_a: index_a,
      index_b: index_b,
      type_id: EntityType.Workshop_Technician,
    }).subscribe(data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        resultsRemaining = false;
        // resultsRemaining = data.remaining;
        const response = data.response;
        this.totalTechnicians = [...this.totalTechnicians, ...response];
        this.tempTotalTechnicians = this.totalTechnicians;
        if (resultsRemaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_technicians_call(index_a, index_b);
        } else {
          // this.allStaffList = [...this.totalTechnicians, this.allStaffList];
          this.allStaffList = this.allStaffList.concat(this.totalTechnicians);
          this.temp = this.allStaffList;

          // console.log('call completed and list of all staff', this.allStaffList.length, this.temp.length);
        }
      }
      if (data.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(data.message);
      }
    });
  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }

  fineSaved(event) {
    if (event) {
      // console.log('saved successfully');
    } else {
      // console.log('saved unsuccessfully');
    }
  }

  filter(event, id) {
    if (event.target.checked) {
      // console.log(id);
      this.currentActiveTab = id;
    }
  }

  updateFilter(event, type) {
    if (type === 'all') {
      this.allStaffList = event;
      // this.drivers = this.datatableservice.updateFilter(event.target.value, this.temp, ['name']);
    } else if (type === 'available') {
      this.availableList = event;
      // this.availableList = this.datatableservice.updateFilter(event.target.value, this.tempavailable, ['name', 'assigned_truck']);
    } else if (type === 'onactivity') {
      this.onActivityList = event;
      // this.onActivityList = this.datatableservice.updateFilter(event.target.value, this.tempactivity, ['name', 'associated_truck']);
    } else if (type === 'unassigned') {
      // this.unassignedList = this.datatableservice.updateFilter(event.target.value, this.tempunassigned, ['name']);
      this.unassignedList = event;
    } else if (type === 'assigned') {
      this.assignedList = event;
      // this.assignedList = this.datatableservice.updateFilter(event.target.value, this.tempassigned, ['name', 'associated_truck']);
    } else if (type === 'labor') {
      this.totalLabors = event;
      // this.assignedList = this.datatableservice.updateFilter(event.target.value, this.tempassigned, ['name', 'associated_truck']);
    } else if (type === 'driver') {
      this.totalDrivers = event;
      // this.assignedList = this.datatableservice.updateFilter(event.target.value, this.tempassigned, ['name', 'associated_truck']);
    } else if (type === 'technicians') {
      this.totalTechnicians = event;
    }
  }


  toggleExpandRow(row) {
    // console.log('Toggled Expand Row!', row);

    this.table.rowDetail.toggleExpandRow(row);
  }


  /*
  Reports
   */
  getTruckTypes() {
    this.truckService.getPurchaseTypes({ option_key: 'trucktypes' })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          // console.log('types', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.truckTypes = apiResponse.response['option_values'].map(function (obj) {
              return { label: obj.label, value: obj.value };
            });
            // console.log('lala', this.context.truckTypes);

            // console.log('types', apiResponse);

            this.context.truckTypes.unshift({ label: 'All' });

          } else {
            // console.log(apiResponse.message);
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
      this.isValidMonthDateGiven = true;
    }
    // console.log(this.reportErrorMessages, this.isValidMonthDateGiven);
  }

  generateReport(event) {
    this.reportingRows = [];
    this.reportingCols = [];
    const dateRange = event[0];
    const type = event[1];
    const start_datetime = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const end_datetime = DateUtils.getUtcDateTimeStart(dateRange[1]);
    if (type === 'monthly') {
      this.reportDate = MonthEnum[this.selectedMonth] + ',' + this.selectedYear;
    } else {
      this.reportDate = end_datetime;
    }

    const params = { start_datetime: start_datetime, end_datetime: end_datetime, drivers: 1 };
    if (this.selectedTruckType) {
      params['type'] = this.selectedTruckType;
    }

    this.truckService.getTrucksReporting(params)
      .subscribe(data => {
        if (data.status === HttpStatusCodeEnum.Success) {
          this.csvRows = data.response;
          if (type === 'monthly') {
            this.reportingMonthlyRows = data.response;
          } else {
            this.reportingRows = data.response;
          }
          for (let i = 0; i < this.csvRows.length; i++) {
            if (!isNullOrUndefined(this.csvRows[i]['total_volume_consumed'])) {
              this.csvRows[i]['total_volume_consumed'] = ConvertToGallon.convert_to_gallon(this.csvRows[i]['total_volume_consumed'], true);
            }
            if (!isNullOrUndefined(this.csvRows[i]['total_duration'])) {
              this.csvRows[i]['total_duration'] = DateUtils.getDuration(this.csvRows[i]['total_duration']);
            }
            if (!isNullOrUndefined(this.csvRows[i]['running'])) {
              this.csvRows[i]['shift_status'] = this.csvRows[i]['running'] ? 'Running' : 'Completed';
            }
            if (!isNullOrUndefined(this.csvRows[i]['1.1 cbm'])) {
              this.csvRows[i]['1cbm'] = this.csvRows[i]['1.1 cbm'];
            }
            if (!isNullOrUndefined(this.csvRows[i]['2.5 cbm'])) {
              this.csvRows[i]['2cbm'] = this.csvRows[i]['2.5 cbm'];
            }
          }
          this.reportErrorMessages = null;
          this.reportingCols = [
            { field: 'truck', header: 'Trucks' },
            { field: 'driver', header: 'Driver' },
            { field: 'shifts', header: 'Shifts' },
            { field: 'total_distance', header: 'Distance Travelled' },
            { field: 'volume_consumed', header: 'Volume Consumed' },
            { field: 'fuel_avg', header: 'Fuel Avg' },
            { field: 'total_duration', header: 'Total Duration (mins)' },
            { field: 'total_collections', header: 'Total Collections' },
            { field: 'total_trips', header: 'Total Trips' },
            { field: 'total_weight', header: 'Total Weight (kg)s' },
            { field: 'shift_status', header: 'Shift Status' },
            { field: 'manpower', header: 'Manpower (cbm/hour)' },
            { field: '240 litres', header: '240 litres' },
            { field: '1cbm', header: '1.1 cbm' },
            { field: '2cbm', header: '2.5 cbm' },
            { field: '5 cbm', header: '5 cbm' },
            { field: '8 cbm', header: '8 cbm' },
            { field: '10 cbm', header: '10 cbm' },
            { field: '12 cbm', header: '12 cbm' },
            { field: '14 cbm', header: '14 cbm' },
            { field: '18 cbm', header: '18 cbm' },
            { field: '20 cbm', header: '20 cbm' },
            { field: '26 cbm', header: '26 cbm' },
            { field: '30 cbm', header: '30 cbm' },
            { field: '40 cbm', header: '40 cbm' },
            { field: 'Medical Waste', header: 'Medical Waste' },
          ];
        } else {
          // console.log(data.message);
        }
      });
    // }
    // else {
    //   this.reportErrorMessages = 'Please select Truck type';
    // }
  }

  generateMonthlyReport() {
    // // console.log(new Date(this.selectedYear, this.selectedMonth, 1));
    const start_month = startOfMonth(new Date(this.selectedYear, this.selectedMonth - 1, 1));
    const end_month = endOfMonth(new Date(this.selectedYear, this.selectedMonth - 1, 1));

    // var date = new Date();
    // var firstDay = new Date(this.selectedYear, this.selectedMonth, 1);
    // var lastDay = new Date(this.selectedYear, this.selectedMonth, 0);

    // // console.log(firstDay, lastDay);
    // console.log('start date', start_month, end_month);
    this.generateReport([[start_month, end_month], 'monthly']);
  }

  toggleReportingTable(tableType, row) {
    if (tableType === 1) {
      this.shiftTable.rowDetail.toggleExpandRow(row);
    }
    if (tableType === 2) {
      this.monthlyTable.rowDetail.toggleExpandRow(row);
    }

  }

  getShiftClass(value) {
    if (value === '') {
      return 'label-default';
    } else if (value) {
      return 'label-success';
    } else {
      return 'label-info';
    }
  }


  filtersChanged() {
    switch (this.selectedRole) {
      case EntityType.Workshop_Technician:
        this.allStaffList = this.tempTotalTechnicians;
        break;
      case EntityType.DRIVER:
        this.allStaffList = this.tempTotalDrivers;
        break;
      case EntityType.LABOUR:
        this.allStaffList = this.tempTotalLabors;
        break;

      default:
        this.allStaffList = this.temp;

    }
    // this.drivers = this.datatableservice.updateFilter(this.selectedRole, this.temp, ['type']);
  }
}
