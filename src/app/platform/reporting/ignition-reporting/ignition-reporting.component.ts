import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AppLoader} from '../../data/model/app-loader';
import {ReportResponse} from '../../model/reportResponse';
import {GoogleMapComponent} from '../../google-map/google-map.component';
import {isNullOrUndefined} from 'util';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {ReportsData} from '../../data/model/reports-model';
import {Item} from '../../data/model/item';
import {TruckService} from '../../services/truck.service';
import {SwalService} from '../../../core/services/swal.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-ignition-reporting',
  templateUrl: './ignition-reporting.component.html',
  styleUrls: ['./ignition-reporting.component.css']
})

export class IgnitionReportingComponent implements OnInit {
  @Input() entity;
  @Input() isEntityTruck? = true;

  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();


  violationLoader = new AppLoader();
  violations: any;
  violationDateRange = [];
  reportObj = new ReportResponse();
  selected = [];
  totalLength = 0;

  zoom = 10;

  displayedColumns = ['duration', 'start_time', 'end_time'];
  filters = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '',  end_datetime: '', truck_id: ''};
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;


  @ViewChild('violationMap') vMap: GoogleMapComponent;
  showIndeterminateProgress = true;

  violationInfoWindows = [];
  violationMarkers = [];

  csvViolationCols = [
    {field: 'duration', header: 'Duration'},
    {field: 'start_time', header: 'Start Time'},
    {field: 'end_time', header: 'End Time'},
  ];

  constructor(private truckService: TruckService, private swalService: SwalService) {
  }

  ngOnInit() {
  }


  setupReport(event) {
    const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);
    this.filters.start_datetime = start_date;
    this.filters.end_datetime = end_date;
    this.filters['truck_id'] = this.entity;
    this.getIgnotionReport(this.filters);
  }

  onSelect({selected}, type) {
    if (!isNullOrUndefined(selected[0].lat) && !isNullOrUndefined(selected[0].long)) {
      if (type === 'violation') {
        this.vMap.zoomToMarker({lat: selected[0].lat, long: selected[0].long});
      }
    }
  }

  getIgnotionReport(filters) {
    this.showIndeterminateProgress = true;
    this.truckService.getIgnotionReport(filters)
    .subscribe (data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.showIndeterminateProgress = false;
        const response = data.response['ignition'];
        this.violations = response;
        this.violations.sort = this.sort;
        this.violations.paginator = this.paginator;
        this.totalLength = data.response['count'];
        this.violationMarkers = [];
        if (response.length) {
          console.log(response)
          for (let i = 0; i < response.length; i++) {
            response[i].duration = DateUtils.getDuration(response[i].duration);

            const temp = ReportsData.getViolationMarkerIcon(response[i].type);
            const info = [
              // new Item('Duration', DateUtils.getDuration(response[i].duration))
              new Item('Duration', response[i].duration )
            ];
            this.violationInfoWindows.push(info);
            if (!isNullOrUndefined(response[i].latitude && !isNullOrUndefined(response[i].longitude))) {
              this.violationMarkers.push({latitude: response[i].latitude, longitude: response[i].longitude, icon: temp.marker});
            }
          }
        } else {
          this.violationMarkers = [];
        }
        this.vMap.createDummyMarkers(this.violationMarkers, this.violationInfoWindows, null, null, this.zoom);
        this.zoom = null;
      }
      if (data.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(data.message);
      }
    })

  }

  sortData (event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getIgnotionReport(this.filters);
  }

  onPaginateChange (event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getIgnotionReport(this.filters);
  }

}
