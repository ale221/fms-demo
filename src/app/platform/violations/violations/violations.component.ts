import { Component, OnDestroy, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { EntityType } from '../../../core/enum/entity-type.enum';
import { HttpStatusCodeEnum } from '../../../core/HttpStatusCodeEnum';
import { LoginApiResponse, TestApiResponse } from '../../../core/model/api.response';
import { HttpController } from '../../../core/services/loading-controller';
import { SwalService } from '../../../core/services/swal.service';
import { DateUtils } from '../../../Utils/DateUtils';
import { AppLoader } from '../../data/model/app-loader';
import { DropDownItem } from '../../data/model/dropdown-item';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { ViolationResponse } from '../../data/response/reports-response';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { EntityResponse } from '../../model/entity.response';
import { DatatableService } from '../../services/datatable.service';
import { EntityService } from '../../services/entity.service';
import { FormService } from '../../services/FormService';
import { GotoPageService } from '../../services/goto-page.service';
import { TerritoryService } from '../../services/territory-service.service';
import { TruckService } from '../../services/truck.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { environment } from 'src/environments/environment';

import { AuthService } from 'src/app/core/services/auth.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';

@Component({
  selector: 'app-violations',
  templateUrl: './violations.component.html',
  styleUrls: ['./violations.component.css']
})
export class ViolationsComponent implements OnInit, OnDestroy {

  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  appLoader = new AppLoader();
  violations: any;//[] = [];
  isAuthorized = false;
  theme;
  violationTypesDropDown = [
    new PrimengDropdownItem('', 'All'),
    new PrimengDropdownItem(63, 'Harsh Braking'),
    new PrimengDropdownItem(64, 'Harsh Acceleration'),
    new PrimengDropdownItem(59, 'Speed'),
    new PrimengDropdownItem(124, 'Geozone'),
    new PrimengDropdownItem(204, 'Sharp Turning')
  ];
  @ViewChild("myMap") MyMap: ElementRef;
  select_violation = null;
  territoriesCount: any = { total: 0, red: 0, green: 0, blue: 0 };
  selected: any[] = [];
  selectedTerritory;
  temp: any[];
  @ViewChild('table') table: any;
  @ViewChild(GoogleMapComponent) map: GoogleMapComponent;
  @ViewChild('paginator') paginator: MatPaginator;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;
  currentDate = new Date();
  violationInfoWindows = [];
  violationMarkers = [];
  violationMarkersIcons = [];
  markerHW = [];
  violation_type = '';
  sIcon = 8;
  inputValue = "";
  searchText = '';
  trucks_list = [];
  apiResponse = {
    count: 0,
    next: false,
    previous: false,
    results: []
  }

  Icons = ['assets/images/iol/geofencing-violation.png',
    'assets/images/iol/Idle.png',
    'assets/images/iol/over-speed.png',
    'assets/images/iol/harsh-acceleration.png',
    'assets/images/iol/harsh-braking.png',
    'assets/images/iol/sharp-turn.png',
  ];

  selectedViolationType = '';
  selectedDriver = '';

  mockViolations = [
    { violation: 'Geo Fence', dateTime: '2020-02-29 19:00:00' },
    { violation: 'Over Speeding', dateTime: '2020-02-29 19:00:00' },
    { violation: 'Idling', dateTime: '2020-02-29 19:00:00' }
  ];
  downloadableLink
  downloadableLink1;
  loggedInUser;
  customerID;

  page = 1;
  selectedCount = 0;
  startDate;
  endDate;
  driverName = '';
  @Input() isEntityTruck?= true;
  @Input() entity;
  violationLoader = new AppLoader();
  filters = { offset: 0, limit: 10, order_by: '', order: '', days: 1000, search_text: '', violation_type: '', driver_id: '', start_datetime: '', end_datetime: '' };

  displayedColumns = ['device', 'violation_type_id', 'speed', 'created_at', 'vehicle_out_territory'];
  totalLength = 0;
  sidebarCheck;


  constructor(public gotoService: GotoPageService,
    private territoryService: TerritoryService,
    private swalService: SwalService,
    private datatableService: DatatableService,
    private truckService: TruckService,
    private formService: FormService,
    private entityService: EntityService,

    private authService: AuthService,
    private drawerService: DrawerService,
    private xlsPdfService:XlsPdfService) { }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }


  ngOnInit() {
    this.drawerService.getValue().subscribe(res=>{
      this.sidebarCheck=res;
  })

    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    const appendExport = 'order=&order_by=&days=1000&search_text=&violation_type=&driver_id=&start_datetime=&end_datetime=';
    // this.downloadableLink = environment.baseUrl + '/iof/get_violation_data_report/?' + appendExport + '&customer_id=' + this.customerID + '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    this.downloadableLink = appendExport +  '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

    // this.downloadableLink1 = environment.baseUrl + '/iof/get_violation_data_report/?' + appendExport + '&customer_id=' + this.customerID + '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    this.downloadableLink1 =  appendExport +  '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // /iof/get_violation_data_report/?offset=${this.filters.offset}&search_text=${this.filters.search_text}&days=1000&violation_type=${this.filters.violation_type}&driver_id=${this.filters.driver_id}&export=excel&timeZone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`

    this.inputValue = "";
    this.searchPlaceHolder = 'Loading...';
    this.showIndeterminateProgress = true;
    this.enableSearch = true;
    this.getDriverDD();
  }
  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
    // this.optimized_violations_call(1);
  }
  setupReport(event) {
    // console.log("coming in setup repoert");
    // this.filters.search_text= '';
    // this.inputValue="";
    this.page = 1;
    this.selectedCount = 0;
    this.getReport(event[0], 1, false);
  }
  getReport(dateRange, page, pagination) {
    // console.log("coming in getreport");
    this.violationInfoWindows = [];
    this.violationMarkers = [];
    this.violationMarkersIcons = [];
    if (!pagination) {
      this.startDate = DateUtils.getUtcDateTimeStart(dateRange[0]);
      this.endDate = DateUtils.getUtcDateTimeStart(dateRange[1]);
    } else {
      this.startDate = dateRange[0];
      this.endDate = dateRange[1];
    }
    this.getViolationReport(this.startDate, this.endDate, page);
  }
  getViolationReport(startDate, endDate, pageNumber?) {
    // console.log("coming in getViolationReport");
    this.showIndeterminateProgress = true;
    if (this.map) {
      this.map.resetMap();
    }
    this.filters.start_datetime = startDate;
    this.filters.end_datetime = endDate;
    this.filters.search_text = this.searchText;

    this.optimizedCall = this.formService.getViolationEntities(this.filters)
      .subscribe(new class extends HttpController<TestApiResponse<EntityResponse[]>> {
        onComplete(): void {
          this.context.searchPlaceHolder = 'Search By Reg #';
          this.context.enableSearch = false;
          this.context.showIndeterminateProgress = false;
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);
          console.error(err);
        }

        onNext(apiResponse: TestApiResponse<EntityResponse[]>): void {
          // console.log("apiResponse---", apiResponse)
          this.context.apiResponse = apiResponse;
          this.context.violations = this.context.apiResponse.results;
          this.context.temp = this.context.violations;
          this.context.totalLength = this.context.apiResponse.count;

          if (this.context.violations.length) {
            for (let i = 0; i < this.context.violations.length; i++) {

              this.context.violations[i].name = this.context.violations[i].device_name;

              let info = `<table class="table font-size-12 no-border margin-bottom-0 table-sm">
              <tbody>
              <tr>
                <th> Vehicle No </th>
                <td class="text-left">${this.context.violations[i].device_name}</td>
              </tr>`;

              if (this.context.violations[i].violation_type_name === 'Speed') {
                info += `<tr>
                  <th> Speed </th>
                  <td class="text-left">${Math.round(this.context.violations[i].speed)} km/h</td>
                </tr>`;
              }

              info += `<tr>
                <th> Violation </th>
                <td class="text-left">${this.context.violations[i].violation_type_name}</td>
              </tr>
              <tr>
                <th> Date/Time </th>
                <td class="text-left">${DateUtils.getLocalMMDDYYYYhhmmss(this.context.violations[i].created_at_unix)}</td>
              </tr>
              <tr>
                <th> Location </th>
                <td class="text-left">${(this.context.violations[i].location) ? this.context.violations[i].location : '-'}</td>
              </tr>
            </tbody> </table>`;

              if (this.context.violations[i].violation_type_name === 'Speed' || this.context.violations[i].violation_type_name === 'Territory Violation') {
                this.context.markerHW.push(50);
              } else {
                this.context.markerHW.push(20);
              }

              this.context.violationInfoWindows.push(info);
              this.context.violationMarkersIcons.push(this.context.Icons[this.context.getTrucksIcons(this.context.violations[i].violation_type_name, true)])

              if (!isNullOrUndefined(this.context.apiResponse.results[i].latitude && !isNullOrUndefined(this.context.apiResponse.results[i].longitude))) {
                this.context.violationMarkers.push(new google.maps.LatLng(this.context.apiResponse.results[i].latitude, this.context.apiResponse.results[i].longitude));
              }
            }

            this.context.map.createMarkers(this.context.violationMarkers, this.context.violationMarkersIcons, this.context.violationInfoWindows, 'mouseover', 20, 20, null, this.context.markerHW);

            if (apiResponse.status === HttpStatusCodeEnum.Error) {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }
          }
        }
      }(this)
      );

    this.resetFiltersExport(this.filters);
  }
  scrollToMap() {
    this.MyMap.nativeElement.scrollIntoView({ behavior: "smooth", block: "center", });
  }
  getDriverDD() {
    this.truckService.getCustomerDevicesFuel({ type_id: EntityType.DRIVER })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          // console.log('devices', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.customerDevices = apiResponse.response;
            this.context.trucks_list = apiResponse.response.map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );
            this.context.trucks_list.unshift({ label: 'All' });
          }
          else {
            // console.log(apiResponse.message);
          }
        }

      }(this)
      );

  }
  optimized_violations_call(pageNumber, search_text?) {
    this.showIndeterminateProgress = true;
    // this.enableSearch=true;
    this.violations = [];
    this.markerHW = [];
    this.map.resetMap();
    this.violationInfoWindows = [];
    this.violationMarkers = [];
    this.violationMarkersIcons = [];

    this.optimizedCall = this.formService.getViolationEntities(this.filters)
      .subscribe(new class extends HttpController<TestApiResponse<EntityResponse[]>> {
        onComplete(): void {
          this.context.searchPlaceHolder = 'Search By Reg #';
          this.context.enableSearch = false;
          this.context.showIndeterminateProgress = false;
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);
          console.error(err);
        }

        onNext(apiResponse: TestApiResponse<EntityResponse[]>): void {
          // console.log("apiResponse== ", apiResponse)
          this.context.apiResponse = apiResponse;
          this.context.violations = this.context.apiResponse.results;
          this.context.violations.paginator = this.context.paginator;
          this.context.totalLength = this.context.apiResponse.count;
          this.context.temp = this.context.violations;

          if (this.context.violations.length) {
            for (let i = 0; i < this.context.violations.length; i++) {

              this.context.violations[i].name = this.context.violations[i].device_name;

              let info = `<table class="table font-size-12 no-border margin-bottom-0 table-sm">
                <tbody>
                <tr>
                  <th> Vehicle No </th>
                  <td class="text-left">${this.context.violations[i].device_name}</td>
                </tr>`;

              if (this.context.violations[i].violation_type_name === 'Speed') {
                info += `<tr>
                    <th> Speed </th>
                    <td class="text-left">${Math.round(this.context.violations[i].speed)} km/h</td>
                  </tr>`;
              }

              info += `<tr>
                  <th> Violation </th>
                  <td class="text-left">${this.context.violations[i].violation_type_name}</td>
                </tr>
                <tr>
                  <th> Date/Time </th>
                  <td class="text-left">${DateUtils.getLocalMMDDYYYYhhmmss(this.context.violations[i].created_at_unix)}</td>
                </tr>
                <tr>
                  <th> Location </th>
                  <td class="text-left">${(this.context.violations[i].location) ? this.context.violations[i].location : '-'}</td>
                </tr>
              </tbody> </table>`;

              if (this.context.violations[i].violation_type_name === 'Speed' || this.context.violations[i].violation_type_name === 'Territory Violation') {
                this.context.markerHW.push(50);
              } else {
                this.context.markerHW.push(20);
              }

              this.context.violationInfoWindows.push(info);
              this.context.violationMarkersIcons.push(this.context.Icons[this.context.getTrucksIcons(this.context.violations[i].violation_type_name, true)])

              if (!isNullOrUndefined(this.context.apiResponse.results[i].latitude && !isNullOrUndefined(this.context.apiResponse.results[i].longitude))) {
                this.context.violationMarkers.push(new google.maps.LatLng(this.context.apiResponse.results[i].latitude, this.context.apiResponse.results[i].longitude));
              }
            }

            this.context.map.createMarkers(this.context.violationMarkers, this.context.violationMarkersIcons, this.context.violationInfoWindows, 'mouseover', 20, 20, null, this.context.markerHW);

            if (apiResponse.status === HttpStatusCodeEnum.Error) {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }
          }
        }
      }(this)
      );
  }
  driverChanged(event) {
    this.selectedDriver = event.value;
    this.filters.driver_id = (this.selectedDriver) ? this.selectedDriver : '';
    if (this.violations.paginator && this.violations.paginator.pageIndex) {
      this.violations.paginator.pageIndex = 0;
      this.filters.offset = 0;
    }
    this.resetFiltersExport(this.filters);
    this.optimized_violations_call(1);
  }
  violationTypeChanged(event) {
    this.selectedViolationType = event.value;
    this.filters.violation_type = this.selectedViolationType ? this.selectedViolationType : '';
    if (this.violations.paginator && this.violations.paginator.pageIndex) {
      this.violations.paginator.pageIndex = 0;
      this.filters.offset = 0;
    }
    this.resetFiltersExport(this.filters);
    this.optimized_violations_call(1);
  }
  getClass(status) {
    if (status === 'Red') {
      return 'label-danger';
    }
    if (status === 'Green') {
      return 'label-success';
    }
    if (status === 'Blue') {
      return 'label-primary';
    }
    return 'label-default';
  }
  createMarkers(selected) {
    this.map.resetMap();
    const parsedPosition = [new google.maps.LatLng(selected.latitude, selected.longitude)];
    let info = [`<table class="table font-size-12 no-border margin-bottom-0 table-sm">
      <tbody>
      <tr>
        <th> Vehicle No </th>
        <td class="text-left">${selected.device_name}</td>
      </tr>
      <tr>
        <th> Violation </th>
        <td class="text-left">${selected.violation_type_name}</td>
      </tr>
      <tr>
        <th> Date/Time </th>
        <td class="text-left">${DateUtils.getLocalMMDDYYYYhhmmss(selected.created_at_unix)}</td>
      </tr>
    </tbody> </table>`];

    this.map.createMarkers(parsedPosition, this.Icons[this.getTrucksIcons(131, true)], info, 'mouseover', 20, 20, 18);
  }
  onSelectViolation({ selected }) {
    let area = this.selected[0];
    if (this.selectedTerritory === area) {
      this.map.resetMap();
      this.selectedTerritory = null;
      this.selected = [];
    }
    else {
      this.selectedTerritory = area;
      this.createMarkers(area)
    }
  }
  onSelect({ selected }) {
    let area = this.selected[0];
    if (this.selectedTerritory === area) {
      // this.map.resetMap();
      // this.selectedTerritory = null;
      // this.selected = [];
    }
    else {
      this.scrollToMap()
      this.selectedTerritory = area;
      // this.createMarkers(area)
      // const latLng = selected[0].latitude +", "+ selected[0].longitude;
      setTimeout(() => {
        this.map.zoomToMarker({ lat: selected[0].latitude, long: selected[0].longitude });
      }, 500);
      // this.map.panTo(latLng)
    }
  }
  getTerritoriesCount() {
    this.territoryService.getTerritoryInfo()
      .subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          // console.log(apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.territoriesCount = apiResponse.response;
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message)
          }
        }
      }(this)
      );

  }
  updateFilter(event) {
    if (event.target.value) {
      this.searchText = event.target.value;
      if (this.violations.paginator && this.violations.paginator.pageIndex) {
        this.violations.paginator.pageIndex = 0;
      }
      this.filters.search_text = this.searchText;
      this.optimized_violations_call(1, this.searchText);
    } else {
      this.searchText = '';
      this.filters.search_text = this.searchText;
      if (this.violations.paginator && this.violations.paginator.pageIndex) {
        this.violations.paginator.pageIndex = 0;
      }
      this.optimized_violations_call(1);
    }
    this.filters.offset = 0;
    this.resetFiltersExport(this.filters);
    this.updateFilter(this.filters);
  }

  private getTrucksIcons(entity_sub_type, status) {
    if (entity_sub_type == 'Territory Violation' && status) {
      this.sIcon = 0;
      return 0;
    } else if (entity_sub_type == 'Idle' && status) {
      this.sIcon = 1;
      return 1;
    } else if (entity_sub_type == 'Speed' && status) {
      this.sIcon = 2;
      return 2;
    } else if (entity_sub_type == 'HarshAcceleration' && status) {
      this.sIcon = 3;
      return 3;
    } else if (entity_sub_type == 'HarshBraking' && status) {
      this.sIcon = 4;
      return 4;
    } else if (entity_sub_type == 'SharpTurn' && status) {
      this.sIcon = 5;
      return 5;
    } else {
      this.sIcon = 8;
      return 8;
    }
  }

  toggleExpandRow(row, expanded, event) {
    event.stopPropagation();
    if (expanded) {
      this.map.resetMap();
      this.table.rowDetail.collapseAllRows();
      this.selectedTerritory = null;
    }
    else {
      // console.log(row);
      this.table.rowDetail.collapseAllRows();
      this.table.rowDetail.toggleExpandRow(row);
      this.onSelect(row)
    }
  }
  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }

  sortData(event) {
    // console.log("sortData= ", event)
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.optimized_violations_call(1, this.searchText);
  }

  onPaginateChange(event) {
    this.showIndeterminateProgress = true;
    this.violations = [];
    this.markerHW = [];
    this.map.resetMap();
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.optimized_violations_call(event.page, this.searchText);
  }

  resetFiltersExport(filters) {
    const appendExport = `order=${filters.order}&order_by=${filters.order_by}&search_text=${filters.search_text}&days=1000&violation_type=${filters.violation_type}&driver_id=${filters.driver_id}&start_datetime=${filters.start_datetime}&end_datetime=${filters.end_datetime}`;
    // this.downloadableLink = environment.baseUrl + '/iof/get_violation_data_report/?' + appendExport + '&customer_id=' + this.customerID + '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this.downloadableLink1 = environment.baseUrl + '/iof/get_violation_data_report/?' + appendExport + '&customer_id=' + this.customerID + '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.downloadableLink =  appendExport +  '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = appendExport +  '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

  }

  downloadXLS(download) {
    this.formService.downloadXLS(download).subscribe((apiResponse: any) => {
      console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Violations Report.xls')
    })
  }

  downloadPDF(download1) {
    console.log("ajaoh ahhh sajna",download1);
    this.formService.downloadPDF(download1).subscribe((apiResponse: any) => {
      console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.xlsPdfService.downloadXlsPdf(url,'Violations Report.pdf')
      console.log("urlllllll",url)
    })
  }

}
