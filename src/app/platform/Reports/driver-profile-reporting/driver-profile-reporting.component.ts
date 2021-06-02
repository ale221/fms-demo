import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { DriverDetailsService } from '../../services/drivers/driver-details.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { AuthService } from 'src/app/core/services/auth.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';

@Component({
  selector: 'app-driver-profile-reporting',
  templateUrl: './driver-profile-reporting.component.html',
  styleUrls: ['./driver-profile-reporting.component.css'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class DriverProfileReportingComponent implements OnInit {

  @ViewChild('userPaginator1') userPaginator: MatPaginator;
  @ViewChild('binMap') binMap: GoogleMapComponent;
  users;
  cities;
  totalUserLength = 0;
  driverGroupID = {};
  filtersTable = { limit: 10, offset: 0, driver_id: '', order_by: '', order: '' };
  selectedDriverForIncident = 0;
  filtersUser = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search: '', driver_id: [], report_type: '', report_id: '', date_filter: '', timeZone: '(Intl.DateTimeFormat().resolvedOptions().timeZone)', start_date: '', end_date: '', device_id: [] };
  displayedUserList = ["driver_id", "name", "avg_speed", "max_speed", "harsh_con"];
  driverSafetyReport = ["name", "total_distance", "total_points", "remaining_points"];
  vehicleUsageReport = ["driver_id", "driver_name", "vehicle_name", "working_distance", "working_hours", "non_working_distance", "non_working_hours", "total_distance_travelled"];
  ObdReport = ["vehicle_no", "speedo_meter", "driver_name", "ignition"];
  jobAnomalyReport = ["primary_entity__name", "started_at", "ended_at", "source_client_id__address", "destination_client_id__address", "start_datetime_format", "end_datetime_format", "planned_start_location", "planned_end_location", "planned_duration", "deviation"];
  FuelsReport = ["fill_up_date", "fuel_filled", "amount_paid", "payment_method_id__value", "vehicle", "driver_name"];
  fleetMaintenanceReport = ["device_id__name", "maintenance_type_id__value", "issued_datetime", "start_datetime", "maintenance_status_id__value"];
  driverPunctulityReport = ["id", "driver", "date", "loged_in_time", "shift_end_time", "deviation", "shift_time"];
  fleet_jobs = ["device_id__name", "maintenance_type_id__value", "technician_id__name", "total_jobs", "completed_jobs", "deviation"];
  driverGroupList = ["id", "name"];
  extendedReport = ["latitude", "created_at", "violation_name", "speed", "value", "violation_type__label"];
  EntityStatusEnum = EntityStatusEnum;
  showIndeterminateProgress: boolean;
  showIndeterminateProgressProfile: boolean;
  url = environment.baseUrl;
  reportClassId;
  reportTypeTable;
  dropDownDisable = false;
  dropDownDisable2 = false;
  driversID;
  exportsid = true;
  time_interval;
  tableHeading = 'Please Select Report Type';
  forFleetDropdown = false;
  forDriversDropdown = false;
  selectEndDateDisable = true;
  isAuthorized = false;
  driverReportclass = [];
  statusLists = [];
  driverGroup = [];
  reportType = [];
  tableHeader = [];
  fleetGroup = [];
  fleets = [];
  selectedDriversGroup = [];
  selectedDrivers = [];
  selectedFleets = [];
  selectedvehicles = [];
  extendedTableData = [];
  extendeduserlength;
  sidebarCheck;

  reportSearchForm: FormGroup;
  PackageType = PackageType;
  loggedInUser;
  pngUser;

  downloadableLink
  downloadableLink1

  constructor(
    private userService: UserService,
    private driverService: DriverDetailsService,
    private router: Router,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    public swalService: SwalService,
    public drawerService: DrawerService,
    private xlsPdfService: XlsPdfService
  ) {
    this.reportSearchForm = this.formBuilder.group({
      reportDropDown: [''],
      typeDropDown: [''],
      groupDriver: [''],
      driverDropDown: [''],
      fleetGroup: [''],
      fleet: ['']
    })
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.loggedInUser = this.authService.getUser();
    this.pngUser = this.loggedInUser.package[0].package_id;
    if (this.loggedInUser.package[0].package_id == 5) {
      this.getReportType(2);
    }
    this.getDrivers(this.driverGroupID);
    this.getReportClass();
    this.getDriversGroup();
    this.getFleetsGroup();

  }


  getReports(filtersUser) {
    this.showIndeterminateProgress = true;
    let params = `type_id=${filtersUser.type_id}&limit=${filtersUser.limit}&offset=${filtersUser.offset}&order=${filtersUser.order}&order_by=${filtersUser.order_by}&driver_id=${filtersUser.driver_id}&device_id=${filtersUser.device_id}&report_id=${filtersUser.report_id}&date_filter=${filtersUser.date_filter}&timeZone=${(Intl.DateTimeFormat().resolvedOptions().timeZone)}&start_date=${filtersUser.start_date}&end_date=${filtersUser.end_date}`;

    this.driverService.getByReportsId(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.reportTypeTable = filtersUser.report_id;
        this.users = data.data['data'];
        this.exportsid = false;
        this.showIndeterminateProgress = false;
        this.totalUserLength = data['data'].count;
      } else {
        // console.log(data.message);
      }
      // console.log("this.getByReportsId= ", this.users);
    });
  }

  profileNewTable(row, filters?) {

    this.showIndeterminateProgressProfile = true;

    this.selectedDriverForIncident = row && row.driver_id ? row.driver_id : this.selectedDriverForIncident;

    let params = `driver_id=${this.selectedDriverForIncident}&limit=${filters.limit}&offset=${filters.offset}&order_by=${filters.order_by}&order=${filters.order}`;

    this.driverService.getExtendedtable(params).subscribe((data: any) => {
      this.showIndeterminateProgressProfile = false;

      if (data.status === HttpStatusCodeEnum.Success) {
        this.extendedTableData = data.data.data;
        this.extendeduserlength = data['data'].count;
        if (data.data.data && data.data.data.length === 0) {
          this.swalService.getWarningSwal('No incidents found against this driver.');
        }
      } else {
        this.swalService.getWarningSwal('No incidents found against this driver.');
      }

    });

  }

  onProfilePagination(event) {
    this.filtersTable.offset = (event.pageIndex * event.pageSize);
    this.profileNewTable(null, this.filtersTable);
  }

  sortUserListProfile(event) {
    if (event.active === 'date_time') {
      this.filtersTable.order_by = 'created_at';
    }
    if (event.active === 'violation_name') {
      this.filtersTable.order_by = 'violation_type__label';
    } else {
      this.filtersTable.order_by = event.active;
    }

    this.filtersTable.order = event.direction;
    this.profileNewTable(null, this.filtersTable);
  }

  openEditModal(data) {
    this.binMap.resetMap();
    const latLng = new google.maps.LatLng(data.latitude, data.longitude)
    this.binMap.createMarker(latLng, null, '', '', 'mouseover', 12);
  }

  sortUserList(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getReports(this.filtersUser);
  }
  sortUserList2(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getReports(this.filtersUser);
  }
  sortUserList3(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getReports(this.filtersUser);
  }
  sortUserList4(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getReports(this.filtersUser);
  }
  sortUserList5(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getReports(this.filtersUser);
  }
  sortUserList6(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getReports(this.filtersUser);
  }
  sortUserList7(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getReports(this.filtersUser);
  }


  onUserPagination(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination1(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination2(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination3(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination4(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination5(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination6(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination7(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }
  onUserPagination8(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getReports(this.filtersUser);
  }

  changeGender(event) {
    this.selectEndDateDisable = true;

    if (event.target.value == "selectEndDate") {
      this.selectEndDateDisable = false;
    }
    this.filtersUser.start_date = '';
    this.filtersUser.end_date = '';
    this.filtersUser.date_filter = (event.target.value);
    this.getReports(this.filtersUser);
  }
  selectDateRange(event, time_type) { //end_timef
    const selectPeriodDate = DateUtils.getUtcDateTimeStart(event);
    if (time_type == 'start') {
      this.filtersUser.start_date = selectPeriodDate
    } else {
      this.filtersUser.end_date = selectPeriodDate
    }
    this.getReports(this.filtersUser);
  }
  exportExcel() {
    let val = this.loggedInUser.customer.id;

    this.filtersUser;
    this.downloadableLink = `order=&order_by=&driver_id=${this.selectedDrivers}&device_id=${this.selectedvehicles}&report_id=${this.filtersUser.report_id}&date_filter=${this.filtersUser.date_filter}&export=excel&time_zone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    this.downloadXLS(this.downloadableLink);

  }
  exportPdf() {
    let val = this.loggedInUser.customer.id;

    this.filtersUser
    this.downloadableLink1 = `${environment.baseUrl}/iof/get_multi_report/?limit=10&offset=0&order=&order_by=&driver_id=${this.selectedDrivers}&device_id=${this.selectedvehicles}&report_id=${this.filtersUser.report_id}&date_filter=${this.filtersUser.date_filter}&export=pdf&customer_id=${val}&time_zone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`
    this.downloadPDF(this.downloadableLink1);

  }

  downloadXLS(download) {
    this.driverService.downloadXLS(download).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url, this.tableHeading)
    })
  }

  downloadPDF(download1) {
    this.driverService.downloadPDF(download1).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.xlsPdfService.downloadXlsPdf(url, this.tableHeading)
    })
  }

  searchStatusDropDownChange(value) {
    if (!this.selectedDriversGroup.includes(value.itemValue.id)) {
      this.selectedDriversGroup.push(value.itemValue.id);
    } else {
      this.selectedDriversGroup.splice(this.selectedDriversGroup.indexOf(value.itemValue.id), 1);
    }

    if (this.selectedDriversGroup == []) {
      let driverGroupID = this.selectedDriversGroup;
      this.getDrivers(driverGroupID);
      this.dropDownDisable2 = false;
    } else {
      this.dropDownDisable2 = true;
    }

    let driverGroupID = this.selectedDriversGroup;
    this.getDrivers(driverGroupID);
  }

  FleetGroupDropDownChange(value) {
    if (!this.selectedFleets.includes(value.itemValue.id)) {
      this.selectedFleets.push(value.itemValue.id);
    } else {
      this.selectedFleets.splice(this.selectedFleets.indexOf(value.itemValue.id), 1);
    }

    if (value == '') {
      let driverGroupID = value;
      this.getFleet(driverGroupID);
      this.dropDownDisable2 = false;
    } else {
      this.dropDownDisable2 = true;
    }

    let driverGroupID = this.selectedFleets;
    this.getFleet(driverGroupID);
  }

  DriverDropDownChange(value) {
    if (!this.selectedDrivers.includes(value.itemValue.id)) {
      this.selectedDrivers.push(value.itemValue.id);
    } else {
      this.selectedDrivers.splice(this.selectedDrivers.indexOf(value.itemValue.id), 1);
    }
    if (this.selectedDrivers == []) {
      this.dropDownDisable2 = false;
    } else {
      this.dropDownDisable2 = true;
    }

    this.filtersUser.driver_id = this.selectedDrivers;
    this.getReports(this.filtersUser);
  }
  VehicleDropDownChange(value) {
    if (!this.selectedvehicles.includes(value.itemValue.id)) {
      this.selectedvehicles.push(value.itemValue.id);
    } else {
      this.selectedvehicles.splice(this.selectedvehicles.indexOf(value.itemValue.id), 1);
    }
    if (this.selectedvehicles == []) {
      this.dropDownDisable2 = false;
    } else {
      this.dropDownDisable2 = true;
    }

    this.filtersUser.device_id = this.selectedvehicles;
    this.getReports(this.filtersUser);
  }


  getDrivers(driverGroupID) {
    this.driverService.getDriver(driverGroupID).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.statusLists = data.data;
      } else {
      }
    });
  }
  getDriversGroup() {
    this.driverService.getDriverGroup().subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverGroup = data.data;

        this.statusLists = [];
        this.users = [];
        this.reportTypeTable = 0;
      } else {
      }
    });
  }

  getFleetsGroup() {
    this.driverService.getFleetGroup().subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.fleetGroup = data.data;
      } else {
        // console.log(data.message);
      }
    });
  }

  getFleet(fleetGroupId) {
    this.driverService.getFleetNew(fleetGroupId).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.fleets = data.data;
      } else {
        // console.log(data.message);
      }
    });
  }

  getReportClass() {
    this.driverService.getDriverReportClass().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverReportclass = data.data;
      } else {
        // // console.log(data.message);
      }
    });
  }

  ReportClassChange(event) {
    if (event == 2) {
      this.dropDownDisable = false;
      this.statusLists = [];
      this.users = [];
      this.driverGroup = [];
      this.reportTypeTable = 0;
      this.filtersUser.driver_id = [];
      this.reportClassId = event;
      this.getReportType(this.reportClassId);
      this.tableHeading = 'Please Select Report Type';

    } else if (event == 0) {
      this.statusLists = [];
      this.users = [];
      this.reportType = [];
      this.driverGroup = [];
      this.reportTypeTable = 0;
      this.filtersUser.driver_id = [];
      this.reportSearchForm.get('typeDropDown').setValue('');
      this.tableHeading = 'Please Select Report Type';
    } else {
      this.statusLists = [];
      this.users = [];
      this.driverGroup = [];
      this.reportTypeTable = 0;
      this.dropDownDisable = true;
      this.reportClassId = event;
      this.filtersUser.driver_id = [];
      this.tableHeading = 'Please Select Report Type';
      this.getReportType(this.reportClassId);
    }
    this.getDriversGroup();
  }

  getReportType(id) {
    this.driverService.getReportType(id).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.reportType = data.data;
      } else {
        // console.log(data.message);
      }
    });
  }
  reportTypeChange(event) {
    if (event == 1) {
      this.forFleetDropdown = false;
      this.forDriversDropdown = true;
      this.tableHeading = "Driver Profile Report"
    }
    else if (event == 5) {
      this.forDriversDropdown = false;
      this.forFleetDropdown = true;
      this.tableHeading = "Fleet Maintenance Report"
    }
    else if (event == 6) {
      this.forDriversDropdown = false;
      this.forFleetDropdown = true;
      this.tableHeading = "Fleet Maintenance Jobs Report"
    }
    else if (event == 2) {
      this.forFleetDropdown = false;
      this.forDriversDropdown = true;
      this.tableHeading = "Driver Safety Report"
    }
    else if (event == 7) {
      this.forFleetDropdown = false;
      this.forDriversDropdown = true;
      this.tableHeading = "Driver Jobs Anomaly Report"
    }
    else if (event == 8) {
      this.forFleetDropdown = false;
      this.forDriversDropdown = true;
      this.tableHeading = "Fuel Fill-up Report"
    }
    else if (event == 10) {
      this.forFleetDropdown = false;
      this.forDriversDropdown = true;
      this.tableHeading = "OBD Report"
    }
    else if (event == 3) {
      this.forFleetDropdown = false;
      this.forDriversDropdown = true;
      this.tableHeading = "Driver Vehicle Usage Report"
    }
    else if (event == 4) {
      this.forFleetDropdown = false;
      this.forDriversDropdown = true;
      this.tableHeading = "Driver Punctuality Report"
    }
    else if (event == '') {
      this.forFleetDropdown = false;
      this.forDriversDropdown = false;
      this.tableHeading = 'Please Select Report Type';
    }

    this.filtersUser.report_id = event;
    this.filtersUser.offset = 0;
    this.filtersUser.order_by = '';
    this.extendedTableData = [];
    this.getReports(this.filtersUser);
    this.reportTypeTable = event;
  }

  getTableHeader() {
    this.driverService.getTableHeader().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.tableHeader = data.data;
      } else {
        // console.log(data.message);
      }
    });
  }

  onSubmit(formValues) {

  }

  timeConversion(time) {
    let offset = Math.abs(new Date().getTimezoneOffset());
    var t = new Date();
    t.setSeconds(t.getSeconds() + offset);
    let currentDate = DateUtils.getYYYYMMDD(t.toDateString())
    currentDate = DateUtils.getLocalMMDDYYYYhhmmssATimee(currentDate + ' ' + time);
    if (currentDate === 'Invalid Date') {
      return time;
    } else {
      return currentDate;
    }
  }

}
