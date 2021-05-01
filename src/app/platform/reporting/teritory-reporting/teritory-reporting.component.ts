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

@Component({
  selector: 'app-teritory-reporting',
  templateUrl: './teritory-reporting.component.html',
  styleUrls: ['./teritory-reporting.component.css']
})
export class TeritoryReportingComponent implements OnInit {

  @Input() entity;
  @Input() isEntityTruck?= true;

  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();

  displayedColumns = ['device_name', 'violation_type_value', 'speed', 'threshold', 'location', 'driver_name', 'job_type', 'created_time', 'created_date'];
  filters = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '',  end_datetime: '', device_id: '', violation_type_id: 124};
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  
  violationLoader = new AppLoader();
  violations = [];
  violationDateRange = [];
  reportObj = new ReportResponse();
  selected = [];

  currentDate: any = new Date();
  zoneDate: any = new Date();

  violationInfoWindows = [];
  violationMarkers = [];
  violationMarkersIcons = [];

  sIcon = 8;

  Icons = ['assets/images/iol/geofencing-violation.png',
    'assets/images/iol/Idle.png',
    'assets/images/iol/over-speed.png'
  ];

  @ViewChild('violationMap') vMap: GoogleMapComponent;


  csvViolationCols = [
    { field: 'violation_type_value', header: 'Violation Type' },
    { field: 'device_name', header: 'Vehicle No' },
    { field: 'territory_name', header: 'Assigned Territory' },
    { field: 'vehicle_in_territory', header: 'In Zone' },
    { field: 'vehicle_out_territory', header: 'Out Of Zone' },
    { field: 'created_at', header: 'Datetime', time: true, format: 'MMM d, y, h:mm:ss a' },

  ];

  constructor(private truckService: TruckService, private swalService: SwalService) {
  }

  ngOnInit() {
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
    this.truckService.getViolationsReport(filters)
    .subscribe(data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        const response = data.response[0]['device_violation'];
        this.violations = response;
        if (response.length) {
          for (let i = 0; i < response.length; i++) {

            const info = `<table class="table font-size-12 no-border margin-bottom-0 table-sm">
              <tbody> 
              <tr>
                <th> Violation </th>
                <td class="text-left">${response[i].violation_type__value}</td>
              </tr> 
            </tbody> </table>`;

            if (response[i].vehicle_in_territory) {
              this.violations[i].territory_status = 1;
              this.zoneDate = new Date(this.violations[i].created_at);
              let totalTime = (this.currentDate) - this.zoneDate;
              var dif = Math.round((totalTime/1000)/60); 
              
              this.violations[i].in_zone = DateUtils.getDuration(dif);

            } else if (response[i].vehicle_out_territory) {
              this.violations[i].territory_status = 2
            } else {
              this.violations[i].territory_status = 3
            }

            this.violationInfoWindows.push(info);

            this.violationMarkersIcons.push(this.Icons[this.getTrucksIcons(this.violations[i].violation_type__value, true)])

            if (!isNullOrUndefined(response[i].latitude && !isNullOrUndefined(response[i].longitude))) {
              this.violationMarkers.push(new google.maps.LatLng(response[i].latitude, response[i].longitude));
            }
          }
        } else {
          this.violationMarkers = [];
        }
        this.vMap.createMarkers(this.violationMarkers, this.violationMarkersIcons, this.violationInfoWindows, 'mouseover', 50, 50);
        // this.vMap.createDummyMarkers(this.violationMarkers, this.violationInfoWindows);


      }
      if (data.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(data.message);
      }
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
    } else {
      this.sIcon = 8;
      return 8;
    }
  }


}

