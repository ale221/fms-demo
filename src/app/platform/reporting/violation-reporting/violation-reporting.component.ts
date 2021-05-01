import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppLoader } from '../../data/model/app-loader';
import { ReportResponse } from '../../model/reportResponse';
import { isNullOrUndefined } from 'util';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { HttpStatusCodeEnum } from '../../../core/HttpStatusCodeEnum';
import { TruckService } from '../../services/truck.service';
import { SwalService } from '../../../core/services/swal.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { EntityType } from 'src/app/core/enum/entity-type.enum';
declare var google: any;

@Component({
  selector: 'app-violation-reporting',
  templateUrl: './violation-reporting.component.html',
  styleUrls: ['./violation-reporting.component.css']
})
export class ViolationReportingComponent implements OnInit {
  @Input() entity;
  @Input() isEntityTruck?= true;
  @Input() displayFilter;
  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();

  violationLoader = new AppLoader();
  violations: any;
  violationDateRange = [];
  reportObj = new ReportResponse();
  selected = [];
  totalLength = 0;
  zoom = 15;
  customerDevices: any;
  trucks_list = [];
  markerHW = [];
  violation_type_id;
  violationInfoWindows = [];
  violationMarkers = [];
  violationMarkersIcons = [];
  selectedViolationType = '';
  theme;

  violationTypesDropDown = [
    new PrimengDropdownItem('', 'All'),
    new PrimengDropdownItem(63, 'Harsh Braking'),
    new PrimengDropdownItem(64, 'Harsh Acceleration'),
    new PrimengDropdownItem(59, 'Speed'),
    new PrimengDropdownItem(124, 'Geozone')
  ];
  showIndeterminateProgress = true;
  sIcon = 8;

  Icons = ['assets/images/iol/geofencing-violation.png',
    'assets/images/iol/Idle.png',
    'assets/images/iol/over-speed.png',
    'assets/images/iol/harsh-acceleration.png',
    'assets/images/iol/harsh-braking.png',
    'assets/images/iol/sharp-turn.png',
  ];

  @ViewChild('violationMap') vMap: GoogleMapComponent;

  displayedColumns = ['device_name', 'violation_type_name', 'speed', 'threshold', 'location', 'driver_name', 'zone', 'job_type', 'created_time', 'created_date'];
  filters = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '', device_id: '', driver_id: '', violation_type_id: '' };
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  csvViolationCols = [
    { field: 'violation_type_name', header: 'Violation Type' },
    { field: 'device_name', header: 'Vehicle No' },
    { field: 'speed', header: 'Speed' },
    { field: 'created_at', header: 'Datetime', time: true, format: 'MMM d, y, h:mm:ss a' },
  ];

  constructor(private truckService: TruckService, private swalService: SwalService) {
  }

  ngOnInit() {
    this.getDriverDD();
  }


  setupReport(event) {
    this.violationInfoWindows = [];
    this.violationMarkers = [];
    this.violationMarkersIcons = [];
    const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);
    this.filters.start_datetime = start_date;
    this.filters.end_datetime = end_date;
    if (this.isEntityTruck) {
      this.filters['device_id'] = this.entity;
    } else {
      this.filters['driver_id'] = this.entity;
    }
    this.getViolationReport(this.filters);
  }

  onSelect({ selected }, type) {
    if (!isNullOrUndefined(selected[0].latitude) && !isNullOrUndefined(selected[0].longitude)) {
      if (type === 'violation') {
        this.vMap.zoomToMarker({ lat: selected[0].latitude, long: selected[0].longitude });
      }
    }
  }


  getMessageForOverlay(date, selected, array, key?) {
    if (!date) {
      return 'Select start & end date to generate report';
    } else if (!selected && array) {
      return 'Select a record to view on map';
    } else if (!array) {
      return 'No Data Found';
    }
  }

  getViolationReport(filters) {
    this.showIndeterminateProgress = true;
    this.markerHW = [];
    if (this.vMap) {
      this.vMap.resetMap();
      this.violationMarkers = [];
    }
    this.truckService.getViolationsReport(filters).subscribe(data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.showIndeterminateProgress = false;
        const response = data['data'].data;
        this.violations = response;
        this.violations.sort = this.sort;
        this.violations.paginator = this.paginator;
        this.totalLength = data['data'].count;
        if (response.length) {
          for (let i = 0; i < response.length; i++) {

            let info = `<table class="table font-size-12 no-border margin-bottom-0 table-sm">
                  <tbody>
                  <tr>
                    <th> Violation </th>
                    <td class="text-left">${response[i].violation_type_name}</td>
                  </tr>`;

            if (response[i].violation_type_name === 'Speed') {
              info += `<tr>
                            <th> Speed </th>
                            <td class="text-left">${Math.round(response[i].speed)} km/h</td>
                          </tr>`;
            }
            if (response[i].violation_type_name === 'Territory Violation') {
              info += `<tr>
                              <th> Territory Type </th>
                              <td class="text-left">${(response[i].vehicle_out_territory) ? 'Out of Zone' : response[i].vehicle_in_territory ? 'In Zone' : 'N/A'}</td>
                            </tr>
                            <tr>
                              <th> Territory </th>
                              <td class="text-left">${response[i].territory_name}</td>
                            </tr> `;

              this.vMap.drawTerritory(response[i].territory_latlong, response[i].territory)
            }

            info += `<tr>
                          <th> Location </th>
                          <td class="text-left">${(response[i].location) ? response[i].location : '-'}</td>
                        </tr>`;

            info += `</tbody> </table>`;
            if (this.violations[i].violation_type_name === 'Speed' || this.violations[i].violation_type_name === 'Territory Violation') {
              this.markerHW.push(50);
            } else {
              this.markerHW.push(20);
            }
            this.violationInfoWindows.push(info);

            this.violationMarkersIcons.push(this.Icons[this.getTrucksIcons(this.violations[i].violation_type_name, true)])

            if (!isNullOrUndefined(response[i].latitude && !isNullOrUndefined(response[i].longitude))) {
              this.violationMarkers.push(new google.maps.LatLng(response[i].latitude, response[i].longitude));
            }
          }
        } else {
          this.violationMarkers = [];
        }
        this.vMap.createMarkers(this.violationMarkers, this.violationMarkersIcons, this.violationInfoWindows, 'mouseover', 20, 20, this.zoom, this.markerHW);
        // this.vMap.createDummyMarkers(this.violationMarkers, this.violationInfoWindows);
        this.zoom = null;
      }
      if (data.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(data.message);
      }
    });

  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getViolationReport(this.filters);
  }

  onPaginateChange(event) {

    if (this.showIndeterminateProgress == false) {
      this.filters.offset = (event.pageIndex * event.pageSize);
      console.log("this.showintermediateprogress")
      this.getViolationReport(this.filters);
    }

  }

  driverChanged(event) {
    this.filters.driver_id = (event.value) ? event.value : '';
    this.violations.paginator.pageIndex = 0;
    this.getViolationReport(this.filters)
  }


  violationTypeChanged(event) {
    this.filters.limit = 10;
    this.filters.offset = 0;
    this.violations.paginator.pageIndex = 0;
    this.filters.violation_type_id = event.value;
    this.getViolationReport(this.filters)
  }

  getDriverDD() {
    this.truckService.getCustomerDevicesFuel({ type_id: EntityType.DRIVER })
      .subscribe(apiResponse => {
        this.customerDevices = apiResponse.response;
        this.trucks_list = apiResponse.response.map(
          item => new PrimengDropdownItem(item['id'], item['label'])
        );
        this.trucks_list.unshift({ label: 'All' });
      })

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


}
