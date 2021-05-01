import {Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { AppLoader } from '../../data/model/app-loader';
import { GotoPageService } from '../../services/goto-page.service';
import { TerritoryService } from '../../services/territory-service.service';
import { SwalService } from 'src/app/core/services/swal.service';

import { DatatableService } from '../../services/datatable.service';
import { FormService } from '../../services/FormService';
import { EntityService } from '../../services/entity.service';
import { GoogleMapModel } from 'src/app/model/GoogleMapModel';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { MatSort } from '@angular/material/sort';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { Subject, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';


@Component({
  selector: 'app-territories',
  templateUrl: './territories.component.html',
  styleUrls: ['./territories.component.css']
})
export class TerritoriesComponent implements OnInit, AfterViewInit  {

  items = [{ label: 'Geozones', url: null }];
  home = { label: 'Dashboard' };
  EntityStatusEnum = EntityStatusEnum;

  @ViewChild("modalmap") modalmap: GoogleMapComponent;
  
  displayedColumns: string[] = ['name', 'assigned_vehicles_count', 'status'];
  displayedColumnsForRoutes: string[] = ['name', 'assigned_vehicles_count', 'status'];
  territories: any[] = [];

  displayedColumnsForTerritoryReporting: string[] =
  ['device_name', 'violation_type_name', 'vehicle_out_territory', 'territory', 'location', 'created_at', 'detail'];

  @ViewChild(MatSort, {static: true}) sortZones: MatSort;
  @ViewChild(MatSort, {static: true}) sortRoutes: MatSort;
  @ViewChild(MatSort, {static: true}) sortTerritoryReporting: MatSort;
  @ViewChild('scrollToTop', {static: true}) scrollToTop: ElementRef;

  zoneId = 0;
  poiClicked = false;

  filters = { limit: 10, offset: 0, order_by: '', order: '' };
  filtersForReporting = { limit: 10, offset: 0, order_by: '', order: '' };
  filtersStops = {
                  limit: 10,
                  offset: 0,
                  order_by: '',
                  order: '', start_datetime: '2020-08-24 19:00:00',
                  end_datetime: '2020-11-25 18:59:59'
                };
  violationList: any;


  showIndeterminateProgress: boolean;

  routeList: any;
  zoneList: any;
  territoriesReportingList: any;

  searchParameters = {search_key: '', is_poi: false};

  isZoneSelected = true;
  optionSelection = 'Zones';

  selectedTerritory;
  selectedRoute;

  mapLoader = new AppLoader();
  appLoader = new AppLoader();
  @ViewChild("map") map: GoogleMapComponent;
  mapZoom: any;
  mapData: any;
  routeId = 0;

  searchText;

  useCaseId = 0;

  keyUp = new Subject<KeyboardEvent>();

  constructor(public gotoService: GotoPageService,
              private territoryService: TerritoryService,
              private swalService: SwalService,
              private getUsecase: GetUsecaseService,
              private datatableService: DatatableService,
              private formService: FormService,
              private entityService: EntityService) { 
                this.useCaseId = this.getUsecase.getUsecaseId();
              }

  ngOnInit() {
    this.getZonesList();
    this.getViolationList();

    this.keyUp.pipe(
      map(event => event.target['value']),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(newValue => {
      this.searchText = newValue;
      if (this.searchText.length > 3 || this.searchText.length === 0) {
        if (this.isZoneSelected) {
          this.getZonesList();
        } else {
          this.getRoutesList();
        }
      }
    });


  }

  ngAfterViewInit(): void {
    if (this.scrollToTop.nativeElement) {
      this.scrollToTop.nativeElement.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
    const mapProp = GoogleMapModel.getMapProp();
  }

  goTo( device: number) {
    this.gotoService.gotoVehicles()
  }

  getData(event: any): void {
    this.selectedTerritory = null;
    this.selectedRoute = null;
    this.zoneId = 0;
    this.routeId = 0;
    this.poiClicked = true;
    this.map.resetMap();
    if (event.target.value.includes('Routes')) {
      this.getRoutesList();
      this.isZoneSelected = false;
    } else if (event.target.value.includes('Zones')) {
      this.getZonesList();
      this.isZoneSelected = true;
    }

  }

  onRowClick(selected) {
    if (this.isZoneSelected) {
      this.zoneId = selected.id;
      if (this.selectedTerritory === this.zoneId) {
        this.map.resetMap();
        this.selectedTerritory = null;
        this.zoneId = 0;
      } else {
        this.selectedTerritory = this.zoneId;
        this.DrawTerritory(selected)
      }
    } else {
      this.routeId = selected.id;
      if (this.selectedRoute === this.routeId) {
        this.map.resetMap();
        this.selectedRoute = null;
        this.routeId = 0;
      } else {
        this.selectedRoute = this.routeId;
        this.DrawRoute(selected)
      }
    }
  }

  getRoutesList(): void {
    this.entityService.getRoutes(this.searchParameters).subscribe(response => {
      this.routeList = response['data'];
      this.poiClicked = false;
    }, err => {
      this.swalService.getErrorSwal(err.message);
    });

  }

  getZonesList(): void {
    this.entityService.getZones(this.searchParameters).subscribe(response => {
      this.zoneList = response['data'];
      this.poiClicked = false;
    }, err => {
      this.swalService.getErrorSwal(err.message);
    });
  }

  getViolationList(): void {
    this.showIndeterminateProgress = true;
    this.entityService.getViolationsReport(this.filtersStops).subscribe(response => {
        this.violationList = response['data'];
        this.showIndeterminateProgress = false;
    }, err => {
      this.swalService.getErrorSwal(err.message);
      this.showIndeterminateProgress = false;
    });
  }

  onToggleCheckboxSelection(event: any): void {
    this.poiClicked = true;
    if (this.optionSelection.includes('Zones')) {
      this.getZonesList();
      this.isZoneSelected = true;
    } else if (this.optionSelection.includes('Routes')) {
      this.getRoutesList();
      this.isZoneSelected = false;
    }
  }

  poiChanged() {
    this.map.resetMap();
    this.onToggleCheckboxSelection(null)
  }

  DrawTerritory(selected) {
    this.map.resetMap();
    this.map.drawTerritory(selected.territory, selected.name);
    // this.selectedTerritory = selected;
  }

  DrawRoute(selected) {
    this.map.resetMap();
    const directionsService = new google.maps.DirectionsService;
    const directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true
    });
    const start_pos = selected.source_latlong.lat + "," + selected.source_latlong.lng;
    const end_pos = selected.destination_latlong.lat + "," + selected.destination_latlong.lng;


    let tasksArr = [];
    let icons_u = [];
    let infowindow = [];
    let newLatLngStart = selected.source_latlong;
    let newLatLngEnd = selected.destination_latlong;

    let contentStart = `<div id="iw-container">
      <div class="iw-content">
        <div class="padding-5">
          <span class="iw-subTitle" style="color:black">Route: </span> <span style="color:black">Starting Position</span>
        </div>
      </div>
    </div>`;

    let contentEnd = `<div id="iw-container">
      <div class="iw-content">
        <div class="padding-5">
          <span class="iw-subTitle" style="color:black">Route: </span> <span style="color:black">Ending Position</span>
        </div>
      </div>
    </div>`;

    infowindow.push((contentStart));
    infowindow.push((contentEnd));
    icons_u.push('assets/images/iol/ic_dest_parcel.png');
    icons_u.push('assets/images/iol/ic_pickup_parcel.png');

    tasksArr.push(new google.maps.LatLng(newLatLngStart.lat, newLatLngStart.lng))
    tasksArr.push(new google.maps.LatLng(newLatLngEnd.lat, newLatLngEnd.lng))

    this.map.createMarkers(tasksArr, icons_u, infowindow, 'mouseover', 40, 30, 12);
    this.map.createRouteWithMultipleWaypoints(directionsService, directionsDisplay, start_pos, end_pos, null)
  }

  drawZones(): void {

  }

  filtersStopsListing(dateRange) {
    this.filtersStops.start_datetime = DateUtils.getUtcDateTimeStart(dateRange[0][0]);
    this.filtersStops.end_datetime = DateUtils.getUtcDateTimeStart(dateRange[0][1]);
    this.getViolationList();
  }

  onPaginate(event) {
    this.filtersStops.offset = (event.pageIndex * event.pageSize);
    this.getViolationList();
  }

  openTerritoryViolations(row) {
    this.modalmap.resetMap();
    let territoryGeo;
    if (this.territories && this.territories.length) {
      this.territories.forEach(element => {
        if (element.id === row.territory) {
          territoryGeo = element.territory;
        }
      });
    }
    let latLng = row.latitude + "," + row.longitude;

    let info = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
        '<tbody>';
      info += `<tr>
          <th> Territory Violation </th>
        <td class="text-left">${row.vehicle_in_territory ? 'In Zone' : 'Out of Zone'}</td>
        </tr>`;
      info += '</tbody> </table>';
      let icon = '';
      if (row.vehicle_in_territory) {
        icon = '/assets/images/iol/in-zone.png';
      } else {
        icon = '/assets/images/iol/harsh-braking.png';
      }
      this.modalmap.createMarker(latLng, null, icon, info, 'mouseover', null, false, 20, 20);

    this.modalmap.drawTerritory(territoryGeo);
  }

}
