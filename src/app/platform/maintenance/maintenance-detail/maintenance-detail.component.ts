// import {Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
// import {ActivatedRoute, Router} from '@angular/router';
// import {isNullOrUndefined} from '@swimlane/ngx-datatable';
// import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
// import {Validators} from '@angular/forms';
// import { AppLoader } from '../../data/model/app-loader';
// import { MaintenanceService } from '../../services/mainenance-service.service';
// import { GotoPageService } from '../../services/goto-page.service';
// import { HttpController } from 'src/app/core/services/loading-controller';
// import { LoginApiResponse } from 'src/app/core/model/api.response';
// import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
// import { MaintenanceStatusEnum } from '../../enum/iol-entity.enum';
// import { AdminMaintenanceFormComponent } from '../../admin-maintenance-form/admin-maintenance-form.component';
// import { SwalService } from 'src/app/core/services/swal.service';

// @Component({
//   selector: 'app-maintenance-detail',
//   templateUrl: './maintenance-detail.component.html',
//   styleUrls: ['./maintenance-detail.component.css']
// })
// export class MaintenanceDetailComponent implements OnInit, OnDestroy {

//   home = {label: 'Dashboard', url: '/iol/'};
//   items = [
//     {label: 'Maintenances', url: '/iol/maintenances'}];

//   selectedId: any;
//   maintenancesData = [];
//   maintenance;

//   showMiddleTimeline = false;

//   today = new Date();

//   truckImage = 'assets/images/iol/icon_trucks.png';
//   binImage = 'assets/images/iol/icon-bin-photo.png';
//   assetsImage = '';

//   currentState;

//   totalCost = 0;
//   maxCost = {cost: 0, cost_type_label: ''};
//   bsModalRef: BsModalRef;
//   bsModalRef_1: BsModalRef;

//   @ViewChild("scrollToTop")
//   scrollToTop: ElementRef;

//   appLoader = new AppLoader();


//   constructor(private route: ActivatedRoute,
//               private maintenanceService: MaintenanceService,
//               private modalService: BsModalService,
//               public gotoService: GotoPageService,
//               public swalService: SwalService,
//               private router: Router) {
//     this.route.params.subscribe(params => {
//       this.selectedId = +params['id']; // (+) converts string 'id' to a number
//     });
//   }

//   ngOnInit() {
//     this.getMaintenance();
//     this.getMaintenanceData();
//   }


//   ngAfterViewInit(): void {
//     setTimeout(() => {
//       this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
//     }, 300);
//   }

//   ngOnDestroy(): void {
//     if (!isNullOrUndefined(this.bsModalRef)) {
//       this.bsModalRef.hide();
//     }
//   }

//   getMaintenance(): void {
//     const param = {
//       maintenance_id: this.selectedId
//     };
//     this.maintenanceService.getMaintenances(param)
//     .subscribe (data => {
//       if (data.status === HttpStatusCodeEnum.Success) {
//         const response = data['data'].data;
//         this.maintenance = response[0];
//         this.showMiddleTimeline = this.maintenance.status === MaintenanceStatusEnum.MAINTENANCE_COMPLETED;
//         this.getAssetImage();
//       }
//       if (data.status === HttpStatusCodeEnum.Error) {
//         this.swalService.getErrorSwal(data.response);
//       }
//     });
//   }

//   private getAssetImage() {
//     this.assetsImage = this.maintenance.asset_type === 'Truck' ? this.truckImage : this.binImage;
//   }

//   isMaintenanceCompleted() {
//     if (!isNullOrUndefined(this.maintenance)) {
//       const isCompleted = this.maintenance.status === MaintenanceStatusEnum.MAINTENANCE_COMPLETED;
//       return isCompleted;
//     }
//   }


//   getMaintenanceData() {
//     this.maintenancesData = [];
//     this.currentState = null;
//     this.totalCost = 0;
//     this.maxCost = {cost: 0, cost_type_label: ''};
//     const params = {
//       maintenance_id: this.selectedId
//     };
//     this.maintenanceService.getMaintenanceData(params)
//     .subscribe (data => {
//       this.maintenancesData = data.response;
//       this.currentState = data.response[0];
//       let total = 0;
//       for (let i = 0; i < data.response.length; i++) {
//         if (!isNullOrUndefined(data.response[i].cost)) {
//           total += data.response[i].cost;
//         }
//       }
//       const max = data.response.reduce(function (prev, current) {
//         return (prev.cost > current.cost) ? {cost: prev.cost, cost_type_label: prev.cost_type_label} : {
//           cost: current.cost,
//           cost_type_label: current.cost_type_label
//         };
//       });
//       max.cost = (max.cost / total) * 100;

//       // const total = data.response.reduce(function (prev, current) {
//       //   let total = 0;
//       //   if (!isNullOrUndefined(current.cost)) {
//       //     total += (prev.cost + current.cost);
//       //   }
//       //   // console.log(total);
//       //   return total;
//       // });
//       this.maxCost = max;
//       this.totalCost = total;
//     });
//   }

//   maintenanceDataSaved(event) {
//     if (event) {
//       // console.log('data saved successfully');
//       this.getMaintenanceData();
//     } else {
//       // console.log('data saved unsuccessfully');
//       this.getMaintenanceData();
//     }
//   }

//   getClass(id) {
//     return this.maintenanceService.getClass(id);
//   }

//   editMaintenance() {
//     // console.log(this.maintenance);
//     const obj = {
//       id: this.maintenance.id,
//       maintenance_type: this.maintenance.maintenance_type,
//       status: this.maintenance.status,
//       truck: this.maintenance.truck,
//       driver: this.maintenance.driver,
//       technician: this.maintenance.technician,
//       end_datetime: this.maintenance.end_datetime,
//       start_datetime: this.maintenance.start_datetime,

//     };

//     this.openNewMaintenanceForm(obj);
//   }

//   openNewMaintenanceForm(obj?) {
//     const initialState = {
//       formTitle: 'Create Maintenance',
//     };
//     if (obj) {
//       initialState['formTitle'] = 'Edit Maintenance';
//       initialState['preFilledData'] = obj;
//     }


//     this.bsModalRef = this.modalService.show(AdminMaintenanceFormComponent, {
//       class: 'modal-center modal-success modal-lg',
//       initialState,
//       ignoreBackdropClick: false
//     });


//     this.bsModalRef.content.submitForm
//       .subscribe((value) => {
//         if (value) {
//           this.getMaintenance();
//           this.getMaintenanceData();
//         }
//       });
//   }


//   getAssetTypeImage(value) {
//     if (isNullOrUndefined(value)) {
//       return '';
//     }
//     if (value.indexOf('Bin') > -1) {
//       return 'assets/images/iol/icon_sm_bin.png';
//     } else {
//       return 'assets/images/iol/icon_sm_truck.png';
//     }


//   }

// }

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { format, isValid } from 'date-fns';
import { Subscription } from 'rxjs';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { hypernymModules } from 'src/app/core/model/module';
import { SwalService } from 'src/app/core/services/swal.service';
import { BroadcastEventListener, SignalRConnection } from 'src/app/core/wfw-ngx-signalr';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { isNullOrUndefined } from 'util';
import { ConvertToGallon } from '../../data/model/covert_to_gallon';
import { Item } from '../../data/model/item';
import { AppLocation } from '../../data/model/location';
import { FillupResponse, SnapshotResponse } from '../../data/response/reports-response';
import { DashboardEnum } from '../../enum/dashboard-enum';
import { JobTypes } from '../../enum/iol-entity.enum';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { SignalRresponse } from '../../model/signalRresponse';
import { TruckService } from '../../services/truck.service';
import { BrandingService } from '../../shared/services/branding.service';
import * as moment from 'moment';
import { ParentDropDown } from '../../data/model/parent-dropdown';
import { DropDownItem } from '../../data/model/dropdown-item';
import { EntityVariable } from '../../data/model/entity-variable';
import { VariableDropDown } from '../../data/model/variable-dropdown';
import { AggregationTypeEnum } from '../../enum/aggregation-type.enum';
import { MaintenanceService } from '../../services/mainenance-service.service';
import { ReportResponse } from '../../model/reportResponse';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GotoPageService } from '../../services/goto-page.service';

enum TaskStatus {
  RUNNING = 52,
  PENDING = 53,
  ABORTED = 54,
  COMPLETED = 55,
  SUSPENDED = 78,
  RESUMED = 79,
  FAILED = 117,
  STARTED = 94
}

@Component({
  selector: 'app-maintenance-detail',
  templateUrl: './maintenance-detail.component.html',
  styleUrls: ['./maintenance-detail.component.css']
})
export class MaintenanceDetailComponent implements OnInit {
  TaskStatus = TaskStatus;
  variableDropdown: VariableDropDown;
  xAxisLabel = 'Years';
  legendTitle = 'Sensors';
  items = [{ label: 'Fleet', url: '' }];
  home = { label: 'Dashboard' };
  entityId = 0;
  truck;
  private connection: SignalRConnection;
  private subscription: Subscription;

  truck_image = null;
  theme;
  cardsArray = [];
  colWidth = '';
  locations: AppLocation[] = [];
  tooLongOrtooShortDistance = false;
  currentDateString = '';
  currentDate = new Date();

  snapForm: FormGroup;

  marker;
  infoWindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  markers: any = [];
  zoom = 10;
  signalRstarted = 0;
  _oldLatLng = [];
  _newLatLng = [];
  numDeltas = 100;
  delay = 10; //milliseconds
  i = 0;
  deltaLat;
  deltaLng;
  poly = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: '#08b',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  copySignalR: any;
  signalsStrength = 0;
  showSignals = false;
  // Initialize google map
  map: google.maps.Map;

  @ViewChild('gmap') gmapElement: any;

  jobSummary;
  jobSummaryTasks;
  jobSummary_driver;
  jobSummary_fillup_data;
  jobSummary_violations_data;
  jobSummary_name;
  jobSummary_maintainance_data;
  d_travelled = 0;
  min_speed = 0;
  max_speed = 0;
  shift_distance_travelled = 0;
  shift_volume_consumed = 0;
  fuel_consumed = 0;
  shift_fuel_avg = 0;
  @ViewChild('jobTrailMap') gmap: GoogleMapComponent;
  showMarkersForTrail = false;
  showMarkersForTrail2 = false;

  // Statistics
  trailDateRange: any[];
  collectionsDateRange: any[];
  finesDateRange: any[];
  fillupDateRange: any[];
  snapshotDate: Date;
  dateRange: Date[] = [];
  violationMarkers = [];
  violationInfoWindows = [];
  snapshotData: SnapshotResponse = new SnapshotResponse();
  
  fillups: FillupResponse[] = [];
  fillupCluster;
  lastupdated;
  lastFillUp;

  @ViewChild('fillupMap') fMap: GoogleMapComponent;
  @ViewChild('trailMap') tMap: GoogleMapComponent;
  @ViewChild('snapshotMap') sMap: GoogleMapComponent;
  @ViewChild('maintenanceMap') mMap: GoogleMapComponent;
  @ViewChild('violationMap') vMap: GoogleMapComponent;

  trailWithStopsInfo = [];
  getTotalDistance;
  displayMapTrailCheck = false;
  distance_travelled;
  activities_completed = 0;
  fines = [];
  
  reportObj = new ReportResponse();

  constructor(private truckService: TruckService, 
    private brandingService: BrandingService,
    public maintenanceService: MaintenanceService,
    public gotoService: GotoPageService,
    private formBuilder: FormBuilder,
    private swalService: SwalService,
    private route: ActivatedRoute) { 
      this.theme = this.brandingService.styleObject();
      this.connection = this.route.snapshot.data['connection'];
    }


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.entityId = params['id'];
    });
    this.snapForm = this.formBuilder.group({
      snapshotDate: null
    });
    this.getDetailCards(hypernymModules[6], DashboardEnum.FleetDetail, this.entityId);
    this.getFleetDetail(this.entityId);
    this.getJobSummary();
  }
  
  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    const mapProp = {
      center: { lat: 25.3548, lng: 51.1839 },
      zoom: 9,
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  getDetailCards (module, dashboardId, entityId) {
    this.truckService.getTruckCards(module, dashboardId, entityId)
    .subscribe (data => {
      this.cardsArray = data['data'].card;
      this.colWidth = this.getCardsCol(this.cardsArray.length, false);
    });
  }

  private setSignalRresponse() {
    // // console.log('setSignalRresponse fired');
    this.truck['signalRresponse'] = new SignalRresponse(
      null,
      null,
      null,
      // this.truck.last_density ? this.truck.last_density : null,
      null,
      // this.truck.last_temperature ? this.truck.last_temperature : null,
      0,
      // this.truck.last_volume ? this.truck.last_volume : 0,
      null,
      this.truck.last_latitude ? this.truck.last_latitude : null,
      this.truck.last_longitude ? this.truck.last_longitude : null,
      null,
      null,
      null,
      this.truck.last_updated || null,
      this.truck.type || null,
      null,
      null,
      null,
      null
    );

    if (!isNullOrUndefined(this.truck.volume_capacity)) {
      this.truck['vol'] = ConvertToGallon.convert_to_gallon(((this.truck.last_volume || 0) / 100) * this.truck.volume_capacity, true);
    }
  }

  findAddressFromLatLang(location, geocoder) {
    return new Promise(function(resolve, reject) {
        geocoder.geocode({'location': location}, function(results, status) {
          if (status === 'OK') {
              resolve([results[0].formatted_address]);
          }
      })
    })
  }

  setupLocations() {
    this.trafficLayer();
    // // console.log(this.truck['location_address']);
    // // console.log('setupLocations fired');
    this.locations = new Array(new AppLocation(
      this.truck.id,
      this.truck.last_latitude,
      this.truck.last_longitude,
      [
        new Item('Speed', Math.round((this.truck.last_speed > 5) ? this.truck.last_speed : 0) + ' km/h'),
        // new Item('Fuel', this.truck.vol + ' gal'),
        // new Item('Temperature', this.truck.last_temperature + ' °C'),
        new Item('Last Updated', DateUtils.getLocalMMDDYYYYhhmmss(this.truck.last_updated)),
        // new Item('Location', (this.truck['location_address']) ? this.truck['location_address'] : '-')
      ]));

    if (!isNullOrUndefined(this.truck.last_latitude) && !isNullOrUndefined(this.truck.last_longitude)) {
      this.createMarker(this.truck.last_latitude, this.truck.last_longitude);
      const parsedPosition = new google.maps.LatLng(this.truck.last_latitude, this.truck.last_longitude);
      const poly = new google.maps.Polyline({
        map: this.map,
        strokeColor: '#08b',
      });
      poly.setPath([parsedPosition]);
      this.poly = poly;
    }


  }

  trafficLayer () {
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(this.map);
  }

  private createMarker(lat, long) {

    // // console.log('createMarker fired');
    // TODO: check if polyline not create, than remove @if (this.marker && this.marker.setMap) check
    if (!isNullOrUndefined(this.marker)) {
      this.marker.setMap(null);
      this.marker = null;
    }
    const truckIcon = {
      url: this.truck.marker,
      scaledSize: new google.maps.Size(50, 50), // scaled size
      anchor: new google.maps.Point(25, 40), // anchor
      rotation: 0
    };
    const parsedPosition = new google.maps.LatLng(lat, long);
    let info = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
      '<tbody>';
    this.locations[0].infoList.forEach((e) => {
      const key = e.key;
      const value = e.value;
      info += `<tr>
          <th> ${key} </th>
        <td class="text-left">${value}</td>
        </tr>`;
    });
    info += '</tbody> </table>';
    const infowindow = new google.maps.InfoWindow({
      content: info
    });
    const marker = new google.maps.Marker({
      position: parsedPosition,
      map: this.map,
      icon: truckIcon
    });

    const map = this.map;
    marker.addListener('mouseover', function () {
      infowindow.open(map, marker);
    });

    marker.addListener('mouseout', event => {
      infowindow.close();
    });
    this.infoWindow = infowindow;
    this.marker = marker;
    if (this.map) {
      this.map.setCenter(parsedPosition);
      this.map.setZoom(15);
    }
    this._oldLatLng = [this.marker.position.lat(), this.marker.position.lng()];
  }

  private setupSignalR() {
    // // console.log('setupSignalR fired');
    if (!isNullOrUndefined(this.connection)) {
      this.connection.start().then((c) => {
        this.connection.invoke('register', this.truck.device_id)
          .catch((err: any) => console.warn(this.truck.device_id + ' Failaed to invoke. Error occurred. Error:' + err));
        const newMessage = new BroadcastEventListener<any>('newMessage');
        // register the listener
        this.connection.listen(newMessage);

        // subscribe to event
        // subscribe to event
        this.subscription = newMessage.subscribe((response: string) => {
          const signalRresponse = JSON.parse(response) as SignalRresponse;
          // console.log('signalResponse', signalRresponse);
          if (signalRresponse && Number(signalRresponse.rtp) !== 1) {
            return;
          }

          this.truck.online_status = true;

          if (signalRresponse.d && this.signalRstarted < 1) {
            this.verifyFirmware(signalRresponse.d); //gate version check
          }
          if (this.verifySignalRData(signalRresponse)) { //validate the lang, long
            const oldLatLng = new google.maps.LatLng(this.truck.signalRresponse.lat, this.truck.signalRresponse.lon);
            this.signalRstarted += 1;
            this.truck.signalRresponse = new SignalRresponse(  //revamp the data to show on frontend
              signalRresponse.comp,
              signalRresponse.customer,
              signalRresponse.dens,
              signalRresponse.temp,
              signalRresponse.vol,
              signalRresponse.id,
              signalRresponse.lat,
              signalRresponse.lon,
              signalRresponse.module,
              signalRresponse.spd,
              signalRresponse.rtp,
              DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t),
              signalRresponse.type,
              signalRresponse.nw,
              signalRresponse.gw,
              signalRresponse.d,
              signalRresponse.mss
            );


            // let geocoder = new google.maps.Geocoder(); //return location in text

            this.copySignalR = this.truck.signalRresponse;

            var latlng = {lat: parseFloat(signalRresponse.lat.toString()), lng: parseFloat(signalRresponse.lon.toString())};

            // this.findAddressFromLatLang(latlng, geocoder).then((result) => {   //promise
            //   if (result) {
            //     this.truck['location_address'] = result[0];
            //     this.updateLocation(this.truck, this.tooLongOrtooShortDistance);
            //   }
            // });

            // // console.log(this.truck);

            // if(this.showSignals){
            //   this.mss = this.truck.signalRresponse.mss;
            // }
            if (!isNullOrUndefined(this.truck.volume_capacity)) {
              this.truck['vol'] = ConvertToGallon.convert_to_gallon(((this.truck.signalRresponse.vol || 0) / 100) * this.truck.volume_capacity);
            }
            this._newLatLng = [signalRresponse.lat, signalRresponse.lon];
            const newLatLng = new google.maps.LatLng(signalRresponse.lat, signalRresponse.lon);
            const differenceInDistance = (google.maps.geometry.spherical.computeDistanceBetween(newLatLng, oldLatLng));
            this.tooLongOrtooShortDistance = 20 < differenceInDistance && differenceInDistance < 200000;
            
            this.updateLocation(this.truck, this.tooLongOrtooShortDistance);

            if (isNullOrUndefined(this.marker)) {
              this.createMarker(this._newLatLng[0], this._newLatLng[1]);
            }

            if (this.tooLongOrtooShortDistance) {
              this.transition(this._newLatLng, signalRresponse.spd);
            }

            if (signalRresponse.t == 0) {
              this.currentDateString = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString())
              this.truck.signalRresponse['t'] = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
              this.updateInvalidSignalData(this.truck);
            }
            // if (AppConfig.DEBUG) {
            //   console.info(this.truck.signalRresponse);
            // }
          } else if (!signalRresponse.lat && !signalRresponse.lon) {
            this.truck.signalRresponse.t = DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t);
            this.tooLongOrtooShortDistance = true;
            this.updateLocation(this.truck, this.tooLongOrtooShortDistance, signalRresponse.t);
          } else {
            if (signalRresponse.t == 0) {
              this.currentDateString = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString())
              this.truck.signalRresponse['t'] = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
            }
            this.updateInvalidSignalData(this.truck);
          }
        });
      });
    }
  }

  private verifyFirmware(d?) {
    // // console.log('verifyFirmware fired');
    const version = d.split(',');
    this.showSignals = version[0] > '6.2.2';
    this.signalsStrength = version[2];
  }

  private updateLocation(truck, tooLongOrtooShortDistance?, isUpdateTimeOnly?) { //data in popover 
    if (this.locations.length) {
      this.locations[0].latitude = this.truck.signalRresponse.latitude;
      this.locations[0].longitude = this.truck.signalRresponse.longitude;
      this.locations[0].infoList = [
        new Item('Speed', Math.round((this.truck.signalRresponse.spd > 5 && tooLongOrtooShortDistance) ? this.truck.signalRresponse.spd : 0) + ' km/h'),
        // new Item('Fuel', ((this.truck['vol']) ? this.truck['vol'].toFixed(3) : 0) + ' gal'),
        // new Item('Temperature', ((this.truck.signalRresponse.temp) ? this.truck.signalRresponse.temp : 0) + ' °C'),
        new Item('Last Updated', (!isUpdateTimeOnly) ? DateUtils.getMMDDYYYYhhmmssA(this.truck.signalRresponse.t) : DateUtils.getLocalYYYYMMDDHHmmss(isUpdateTimeOnly)),
        // new Item('Location', truck.location_address)
      ];
    }
    this.updateInfoWindow();
  }

  updateInvalidSignalData (truck) {
    this.locations[0].infoList = [
      new Item('Speed', Math.round(this.truck.signalRresponse.spd) + ' km/h'),
      // new Item('Fuel', ((this.truck['vol']) ? this.truck['vol'].toFixed(3) : 0) + ' gal'),
      // new Item('Temperature', ((this.truck.signalRresponse.temp) ? this.truck.signalRresponse.temp : 0) + ' °C'),
      new Item('Last Updated', DateUtils.getMMDDYYYYhhmmssA(this.truck.signalRresponse.t)),
      // new Item('Location', truck.location_address)
    ];
    this.updateInfoWindow();
  }

  private transition(_newLatLng, spd) {
    // // console.log('transition fired');
    this.i = 0;
    if (isNullOrUndefined(this._oldLatLng)) {
      this._oldLatLng = [0, 0];
    }

    this.deltaLat = (_newLatLng[0] - this._oldLatLng[0]) / this.numDeltas;
    this.deltaLng = (_newLatLng[1] - this._oldLatLng[1]) / this.numDeltas;
    this.moveMarker(spd);
    this.updateInfoWindow();
  }


  verifySignalRData(signalRresponse) {
    // // console.log('verifySignalRData fired');
    return (signalRresponse.lat !== 0 && signalRresponse.lon !== 0)
      &&
      (!isNullOrUndefined(signalRresponse.lat) && (!isNullOrUndefined(signalRresponse.lon)))
      &&
      (signalRresponse.t !== '-') && !isNullOrUndefined(signalRresponse.lat) && isValid(new Date(signalRresponse.t));
  }

  private moveMarker(spd) {
    let path;
    this._oldLatLng[0] += this.deltaLat;
    this._oldLatLng[1] += this.deltaLng;

    const latlng = new google.maps.LatLng(this._newLatLng[0], this._newLatLng[1]);
    if (!isNullOrUndefined(latlng) && !isNullOrUndefined(this.marker)) {
      this.createMarker(this._newLatLng[0], this._newLatLng[1]);
      path = this.poly.getPath();
      path.push(new google.maps.LatLng(latlng.lat(), latlng.lng()));
      this.poly.setPath(path);
      this.poly.setMap(this.map);
      let info = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
        '<tbody>';
      this.locations[0].infoList.forEach((e) => {
        const key = e.key;
        const value = e.value;
        info += `<tr>
          <th> ${key} </th>
        <td class="text-left">${value}</td>
        </tr>`;
      });
      info += '</tbody> </table>';
      this.map.setCenter(this.marker.position);
    }
    if (this.i != this.numDeltas) {
      this.i++;
    }
  }

  getFleetDetail(entityId) {
    this.truckService.getFleetDetailById(entityId).subscribe(data => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.truck = data['data'];
        // console.log("this.truckkkkkkkkkk",this.truck);
        this.lastupdated=DateUtils.getLocalMMDDYYYYhhmmss(this.truck.last_updated);
        this.lastFillUp = DateUtils.getLocalMMDDYYYYhhmmss(this.truck.fill_up_date);
        // console.log("---------222222",this.truck.fill_up_date);
        // console.log("-----------",this.lastFillUp);
        this.setSignalRresponse();
        this.setupLocations();
        this.setupSignalR();
      }
    });
  }

  getCardsCol(totalCards, isMulti) {
    let colWidth;
    if (totalCards === 1 || totalCards === 2 || totalCards === 3) {
      if (isMulti) {
        colWidth = ['col-md-3', 'col-md-4'];
      } else {
        colWidth = 'col-md-4';
      }
    } else if (totalCards === 4) {
      if (isMulti) {
        colWidth = ['col-md-3', 'col-md-3'];
      } else {
        colWidth = 'col-md-3';
      }
    } else if (totalCards === 5) {
      colWidth = ['col-md-4', 'col-md-2']
    } else if (totalCards === 6) {
      colWidth = 'col-md-2';
    } else {
      colWidth = 'col-md-3';
    }
    return colWidth;
  }

  // Reporting Section End
  private updateInfoWindow() {
    let info = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
      '<tbody>';
    this.locations[0].infoList.forEach((e) => {
      const key = e.key;
      const value = e.value;
      info += `<tr>
          <th> ${key} </th>
        <td class="text-left">${value}</td>
        </tr>`;
    });
    info += '</tbody> </table>';
    this.infoWindow.setContent(info);
  }

  
  private getJobSummary() {
    this.truckService.getShiftFuelAndDistance({ parent_id: this.entityId })
      .subscribe(apiResponse => {
        this.jobSummary = apiResponse['data'];
          this.jobSummaryTasks = apiResponse['data'].job_tasks;
          if (this.jobSummaryTasks && this.jobSummaryTasks.length > 0) {
            const directionsService = new google.maps.DirectionsService;
            const directionsDisplay = new google.maps.DirectionsRenderer({
              suppressMarkers: true
            });

            let start_pos = '';
            let end_pos = '';

            let tasksArr = [];
            let waypts = [];
            let icons_u = [];
            let infowindow = [];
            this.jobSummaryTasks.forEach((element, i) => {
              let newLatLngStart = element.source_latlng;
              if (i === 0) {
                start_pos = newLatLngStart.lat + "," + newLatLngStart.lng;
              }

              let newLatLngEnd = element.destination_latlng;
              if ((i + 1) === this.jobSummaryTasks.length) {
                end_pos = newLatLngEnd.lat + "," + newLatLngEnd.lng;
              }

              let contentDrop = `<div id="iw-container">
                <div class="iw-content">
                  <div class="padding-5">
                    <span class="iw-subTitle" style="color:black">Task: </span> <span style="color:black">${Number(i + 1)} Pickup</span>
                  </div>
                  <div class="padding-5">
                    <span class="iw-subTitle" style="color:black">Pickup Date: </span> <span style="color:black">${(this.jobSummaryTasks[i].started_at_unix) ? DateUtils.getLocalMMDDYYYYhhmmss((this.jobSummaryTasks[i].started_at_unix)) : '-'}</span>
                  </div>
                </div>
              </div>`;

              let contentPickup = `<div id="iw-container">
                <div class="iw-content">
                  <div class="padding-5">
                    <span class="iw-subTitle" style="color:black">Task: </span> <span style="color:black">${Number(i + 1)} Dropoff</span>
                  </div>
                  <div class="padding-5">
                    <span class="iw-subTitle" style="color:black">Dropoff Date: </span> <span style="color:black">${(this.jobSummaryTasks[i].ended_at_unix) ? DateUtils.getLocalMMDDYYYYhhmmss(this.jobSummaryTasks[i].ended_at_unix) : '-'}</span>
                  </div>
                </div>
              </div>`;

              infowindow.push((contentPickup));
              infowindow.push((contentDrop));
              icons_u.push('assets/images/iol/ic_dest_parcel.png');
              icons_u.push('assets/images/iol/ic_pickup_parcel.png');

              tasksArr.push(new google.maps.LatLng(newLatLngStart.lat, newLatLngStart.lng))
              tasksArr.push(new google.maps.LatLng(newLatLngEnd.lat, newLatLngEnd.lng))
            });

            var checkboxArray = tasksArr;
            for (var i = 0; i < checkboxArray.length; i++) {
              waypts.push({
                location: checkboxArray[i],
                stopover: true
              });
            }
            
            setTimeout(() => {
              this.gmap.createMarkers(tasksArr, icons_u, infowindow, 'mouseover', 40, 30, 12);
              this.gmap.createRouteWithMultipleWaypoints(directionsService, directionsDisplay, start_pos, end_pos, this, waypts);
            }, 500);
          }

          if (apiResponse.status === HttpStatusCodeEnum.Error) {
          } else if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.swalService.getErrorSwal(apiResponse.message);
          }
      })
  }

  getProgress1(value, type) {
    if (value != null && value != undefined)
      return this.getStatusCount(value, type);
  }

  getJobType(job) {
    let key = Object.keys(JobTypes).find(k => JobTypes[k] === job);
    return key;
  }
  getFillClass(value, type) {
    if (value != null)
      return 'p' + Number(this.getStatusCount(value, type));
  }
  getStatusCount(value, type) {
    let count = 0;
    value.forEach(element => {
      if (element.job_status == type) {
        count++;
      }
    });
    return count.toString();
  }

  showMarkerValueChanges() {
    // // console.log('showMarkerValueChanges fired');
    if (this.trailDateRange) {
      this.getReport(this.trailDateRange, 'trail', this.showMarkersForTrail2);
    }
  }

  // showMarkerValueChanges2() {
  //   this.getReport(this.trailDateRange, 'trail', this.showMarkersForTrail2);
  // }

  setupReport(event) {
    // // console.log('setupReport fired');
    this.getReport(event[0], event[1]);
  }

  // Reporting Section

  private getReport(dateRange, type, actual?) {
    // // console.log('getReport fired');
    this.violationMarkers = [];
    this.violationInfoWindows = [];

    const start_date = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const end_date = DateUtils.getUtcDateTimeStart(dateRange[1]);
    // if (start_date === end_date) {
    //   end_date = DateUtils.getUtcDateTimeEnd(dateRange[1]);
    // }
    switch (type) {
      case 'fillup':
        this.fillupDateRange = [DateUtils.getYYYYMMDD(dateRange[0]), DateUtils.getYYYYMMDD(dateRange[1])];
        this.getFillupReport(start_date, end_date);
        break;
      case 'snapshot':
        this.snapshotDate = dateRange;
        this.getSnapshot();
        break;
      case 'trail':
        this.trailDateRange = dateRange;
        this.getTrailReport(start_date, end_date);
        break;
      case 'fines':
        this.finesDateRange = dateRange;
        this.getFinesReport(start_date, end_date);
        break;
    }

  }


  private getFillupReport(start_date, end_date) {
    // // console.log('getFillupReport fired');
    const params = {
      truck_id: this.entityId,
      start_datetime: start_date,
      end_datetime: end_date
    };

    // params.start_datetime += ' 00:00:00';
    // params.end_datetime += ' 23:59:59';
    // // Convert to UTC
    // params.start_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.start_datetime);
    // params.end_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.end_datetime);

    this.truckService.getFillupsReport(params)
    .subscribe(apiResponse => {
      const locations = [];
      const ids = [];
      let info = '';
      if (apiResponse.status === HttpStatusCodeEnum.Success) {
        const response = apiResponse.response[0]['fillups'];
        this.fillups = response;
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
                lat: response[i].lat,
                lon: response[i].long,
              });
            }
          }
        } else {
          this.violationMarkers = [];
        }
        // this.fMap.createDummyMarkers(this.violationMarkers, this.violationInfoWindows);
        this.fillupCluster = this.fMap.createCluster(locations, this.violationInfoWindows, 'assets/images/iol/icon-map-fillup.png');

      }
      if (apiResponse.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    })
  }

  private getSnapshot() {
    // // console.log('getSnapshot fired');
    this.snapshotData = new SnapshotResponse();
    const params = {
      truck_id: this.entityId,
      start_datetime: DateUtils.getMMDDYYYYhhmmssA(this.snapshotDate.toString()),
    };
    params.start_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.start_datetime);
    this.truckService.getSnapshotReport(params)
    .subscribe (apiResponse => {
      if (apiResponse.status === HttpStatusCodeEnum.Success) {
        const response = apiResponse['data'];
        this.snapshotData = apiResponse['data'][0];
        this.snapshotData.volume = ConvertToGallon.convert_to_gallon(this.snapshotData.volume);
        this.snapshotData['driver'] = this.snapshotData.assigned_driver ? this.snapshotData.assigned_driver.name : '-';
        if (response.length) {
          for (let i = 0; i < response.length; i++) {
            const info = [
              new Item('Truck Name', response[i].truck_name),
              new Item('Speed', Math.round((response[i].speed)) + ' km/h'),
              // new Item('Fuel', ((response[i].volume.toFixed(2)) || '-') + ' gal'),
              // new Item('Temperature', (response[i].temperature || '-') + ' ℃')
            ];
            this.violationInfoWindows.push(info);
            if (!isNullOrUndefined(response[i].lat && !isNullOrUndefined(response[i].long))) {
              this.violationMarkers.push({
                latitude: response[i].lat,
                longitude: response[i].long
              });
            }
          }
        } else {
          this.violationMarkers = [];
        }
        this.sMap.createDummyMarkers(this.violationMarkers, this.violationInfoWindows);
      }
      if (apiResponse.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse.message);
      }
    })

  }

  private getTrailReport(start_date, end_date) {
    // // console.log('getTrailReport fired');
    this.trailWithStopsInfo = [];
    const params = {
      truck_id: this.entityId,
      start_datetime: start_date,
      end_datetime: end_date
    };
    if (this.showMarkersForTrail) {
      params['stops'] = true;
    }

    params['ignition'] = true;

    this.displayMapTrailCheck = false;

    // params.start_datetime += ' 00:00:00';
    // params.end_datetime += ' 23:59:59';
    // // Convert to UTC
    // params.start_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.start_datetime);
    // params.end_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.end_datetime);
    this.truckService.getMapTrail(params) .subscribe(apiResponse => {
      const markers = [];
      const infoWindows = [];
      // let days = differenceInCalendarDays(end_date, start_date);
      // let ratio;
      // if (days >= 30) ratio = 60;
      // else if (days >= 7) ratio = 30;
      // else ratio = 1;

      this.getTotalDistance = apiResponse['data'];

      this.displayMapTrailCheck = true;

      this.distance_travelled = ((this.getTotalDistance.total_distance || 0) / 1000).toFixed(2);
      if (apiResponse.status === HttpStatusCodeEnum.Success) {
        const response = apiResponse['data'].map_trail;
        const stop_times = this.getTotalDistance.stops;
        if (response.length && response.length > 1) {

          if (this.showMarkersForTrail) {

            // // console.log(stop_times);
            this.trailWithStopsInfo = stop_times;

            for (let j = 0; j < stop_times.length; j++) {
              stop_times[j].duration = DateUtils.getDuration(Number(stop_times[j].duration));

              markers.push({
                latitude: stop_times[j].latitude,
                longitude: stop_times[j].longitude,
              });

              infoWindows.push([
                new Item('Duration', (stop_times[j].duration)),
                new Item('Start Time', DateUtils.getLocalMMDDYYYYhhmmss(stop_times[j].start_time)),
                new Item('End Time', DateUtils.getLocalMMDDYYYYhhmmss(stop_times[j].end_time)),
                new Item('Stop Type', (stop_times[j].stop_type || 'N/A')),
              ]);
            }
          }

          for (let i = 0; i < response.length; i += 1) {
            if (i > -1) {
              // let info = 'TimeStamp: ' + DateUtils.getLocalMMDDYYYYhhmmssA(response[i].timestamp);
              // info += '<br/>' + 'Speed: ' + response[i].speed + ' km/h';
              const info = [
                DateUtils.getLocalMMDDYYYYhhmmss(response[i]['timestamp_unix']),
                ((response[i].speed) ? Math.round(response[i].speed) : 0) + ' km/h'
              ];
              let im;
              if (i === 0) {
                im = this.createInfowindowTemplate(info, 'Starting Point');
                // else
                //   im = this.createInfowindowTemplate(info);
                this.violationInfoWindows.push(im);
              }
              this.violationMarkers.push({ lat: response[i].lat, lng: response[i].long });
            }
          }
          if (response.length > 1) {
            const info1 = [
              DateUtils.getLocalMMDDYYYYhhmmss(response[response.length - 2]['timestamp_unix']),
              ((response[response.length - 2].speed) ? Math.round(response[response.length - 2].speed) : 0) + ' km/h'
            ];
            const im = this.createInfowindowTemplate(info1, 'Ending Point');
            this.violationInfoWindows.push(im);
            this.violationMarkers.push({
              lat: response[response.length - 1].lat,
              lng: response[response.length - 1].long
            });
          }
        } else {
          this.violationMarkers = [];
        }

        this.tMap.resetMap();
        this.tMap.createDummyMarkers(markers, infoWindows);
        if (this.violationMarkers && this.violationMarkers.length > 1) {
          this.tMap.createTrail(this.violationMarkers, this.violationInfoWindows, false);
        } else {
          this.swalService.getWarningSwal("No data found against this vehicle");
        }

      }
      //
      if (apiResponse.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse.message);
      }
    })
  }

  validate(): boolean {
    // // console.log('validate fired');
    if (this.snapForm.value) {
      return true;
    }
    return false;
  }

  onSubmit(formValue: Object) {
    // // console.log('onSubmit fired');
    if (this.validate()) {
      this.getReport(this.snapshotDate, 'snapshot');
    }
  }

  createInfowindowTemplate(msg, title?) {
    // // console.log('createInfowindowTemplate fired');
    // InfoWindow content
    let content = `<div id="iw-container"> <div class="iw-content">`;
    if (title) {
      content += '<div  class="iw-title">' + title + '</div>';
    }

    content += '<div class="padding-5"><span class="iw-subTitle">' + 'TimeStamp:' + '</span> <span>' + (msg[0]) + '</span></div>';
    // content += '<div class="padding-5"><span class="iw-subTitle">' + 'Speed:' + '</span> <span>' + (msg[1]) + '</span></div>';
    return content;
  }

  getFinesReport(startDate, endDate) {
    // // console.log('getFinesReport fired');
    const params = {
      truck_id: this.entityId,
      start_datetime: startDate,
      end_datetime: endDate
    };

    this.truckService.getMaintenanceData(params)
    .subscribe(apiResponse=> {
      if (apiResponse.status === HttpStatusCodeEnum.Success) {
        this.fines = apiResponse.response;
      }
      if (apiResponse.status === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse.message);
      }
    })
  }

  selected = [];

  onSelect({ selected }, type) {

    if (type === 'trail') {
      if (this.selected[0] === selected) {
        this.selected = [];
        this.tMap.unZoomMarker();
      } else {
        this.selected[0] = selected;
        this.tMap.zoomToMarker({ lat: selected.latitude, long: selected.longitude });
      }
    } else if (type === 'maintenance') {
      if (!isNullOrUndefined(selected[0].start_lat_lng) && !isNullOrUndefined(selected[0].end_lat_lng)) {
        this.mMap.zoomToMarker({
          lat: selected[0].start_lat_lng,
          long: selected[0].end_lat_lng
        });
      }
    } else {
      if (!isNullOrUndefined(selected[0].lat) && !isNullOrUndefined(selected[0].long)) {
        if (type === 'fillup') {
          this.fMap.zoomToMarker({ lat: selected[0].lat, long: selected[0].long });
          // const markers = this.fillupCluster.getMarkers();
          // markers.forEach(marker => {
          //   if (marker.getPosition().lat() == +selected[0].lat) {
          //     this.fMap.openInfoWindow(marker);
          //   }
          // });



        }
        if (type === 'violation') {
          this.vMap.zoomToMarker({ lat: selected[0].lat, long: selected[0].long });
        }
      }

    }
  }

  setVariablesDropDown() {
    this.variableDropdown = new VariableDropDown(
      [
        new ParentDropDown(EntityVariable.SPEED, 'Max Speed',
          [
            new DropDownItem(AggregationTypeEnum.MAX, 'Max'),
          ]),
        new ParentDropDown(EntityVariable.DISTANCE_TRAVELLED, 'Total Distance',
          [
            // new DropDownItem(AggregationTypeEnum.AVG, 'Avg'),
            new DropDownItem(AggregationTypeEnum.MAX, 'Max'),
          ])
      ]
    );
  }

  generatePDFReport(type: any, event?: ReportResponse) {
    this.reportObj.data = [];
    this.reportObj.meta = {
      'Name': this.truck.name,
      'Type': this.truck['entity_sub_type_name'],
      'Purchase': this.truck['leased_owned'],
      'Driver': this.truck.assigned_driver ? this.truck.assigned_driver['name'] : '-'
    };
    if (type === 'fillup') {
      this.reportObj.report_title = this.truck.name + ' Fillup Report';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;
    } else if (type === 'shifts') {
      this.reportObj.report_title = this.truck.name + ' Shift Report';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;
    } else if (type === 'activities') {
      if (type === 'activities') {
        this.reportObj.report_title = this.truck.name + ' Activities Report';
        this.reportObj.start_datetime = event.start_datetime;
        this.reportObj.end_datetime = event.end_datetime;
        this.reportObj.cols = event.cols;
        this.reportObj.data = event.data;
      }
    } else if (type === 'snapshot') {
      this.reportObj.start_datetime = null;
      this.reportObj.end_datetime = null;
      this.reportObj.report_title = this.truck.name + ' Snapshot Report';

      this.reportObj.cols = ['Date', 'Time', 'Truck Name', 'Fuel (gal)', 'Temperature(\u2103)', 'Speed (km/h)', 'Driver Name'];
      if (!isNullOrUndefined(this.snapshotData)) {
        // @ts-ignore
        this.reportObj.data.push(
          {
            'Date': isNullOrUndefined(this.snapshotData.timestamp) ? '-' : format(
              this.snapshotData.timestamp,
              'MM/DD/YYYY'
            ),
            'Time': isNullOrUndefined(this.snapshotData.timestamp) ? '-' : format(
              this.snapshotData.timestamp,
              'h:mm a'
            ),
            'Truck Name': isNullOrUndefined(this.truck.name) ? '-' : this.truck.name,
            'Fuel (gal)': this.snapshotData.volume ? parseFloat(this.snapshotData.volume).toFixed(3) : '-',
            'Temperature(\u2103)': this.snapshotData.temperature ? this.snapshotData.temperature : '-',
            'Speed (km/h)': isNullOrUndefined(this.snapshotData.speed) ? '-' : this.snapshotData.speed,
            'Driver Name': this.snapshotData.assigned_driver ? this.snapshotData.assigned_driver.name : '-',
          });
      }
    } else if (type === 'fines') {
      this.reportObj.start_datetime = this.finesDateRange[1];
      this.reportObj.end_datetime = this.finesDateRange[0];
      this.reportObj.report_title = this.truck.name + ' Fine Report';

      this.reportObj.cols = ['Truck', 'Driver', 'Cost', 'Notes', 'Date', 'Time'];
      for (let j = 0; j < this.fines.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          {
            'Date': format(
              this.fines[j].timestamp,
              'MM/DD/YYYY'
            ),
            'Time': format(
              this.fines[j].timestamp,
              'h:mm a'
            ),
            'Truck': this.fines[j].truck_name ? this.fines[j].truck_name : '-',
            'Driver': this.fines[j].driver_name ? this.fines[j].driver_name : '-',
            'Cost': this.fines[j].cost ? this.fines[j].cost : '-',
            'Notes': this.fines[j].notes ? this.fines[j].notes : '-',
          });
      }
    } else if (type === 'collections') {
      this.reportObj.report_title = this.truck.name + ' Collections Report';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;

    } else if (type === 'maintenances') {
      this.reportObj.report_title = this.truck.name + ' Maintenance Reports';
      this.reportObj.start_datetime = event.start_datetime;
      this.reportObj.end_datetime = event.end_datetime;
      this.reportObj.cols = event.cols;
      this.reportObj.data = event.data;
    }
    this.getPDFReport();
  }
  
  private getPDFReport() {
    // // console.log('getPDFReport fired');
    const params = {
      report_title: this.reportObj.report_title,
      meta: JSON.stringify(this.reportObj.meta),
      cols: this.reportObj.cols,
      data: JSON.stringify(this.reportObj.data),
    };

    if (!isNullOrUndefined(this.reportObj.start_datetime)) {
      params['start_datetime'] = this.reportObj.start_datetime;
    }
    if (!isNullOrUndefined(this.reportObj.end_datetime)) {
      params['end_datetime'] = this.reportObj.end_datetime;
    }

    this.truckService.generatePDFreport(params)
    .subscribe(apiResponse => {
      if (apiResponse['status'] === 200) {
        this.swalService.getSuccessSwal('Report generated successfully');
        window.open('http://' + apiResponse['file']);
      }
    })
  }

  getSignalsClasses(truck) {
    if (truck && truck.debug) {
      const version = truck.debug.split(',');
      this.signalsStrength = version[2];
      if (this.signalsStrength >= 0 && this.signalsStrength <= 8) {
        return 'uniform one-bar';
      } else if (this.signalsStrength >= 9 && this.signalsStrength <= 15) {
        return 'uniform two-bars';
      } else if (this.signalsStrength >= 16 && this.signalsStrength <= 20) {
        return 'uniform three-bars';
      } else if (this.signalsStrength >= 21 && this.signalsStrength <= 25) {
        return 'uniform four-bars';
      } else if (this.signalsStrength >= 26 && this.signalsStrength <= 31) {
        return 'uniform five-bars';
      } else {
        return 'no-bars';
      }
    } else {
      if (this.signalsStrength >= 0 && this.signalsStrength <= 8) {
        return 'uniform one-bar';
      } else if (this.signalsStrength >= 9 && this.signalsStrength <= 15) {
        return 'uniform two-bars';
      } else if (this.signalsStrength >= 16 && this.signalsStrength <= 20) {
        return 'uniform three-bars';
      } else if (this.signalsStrength >= 21 && this.signalsStrength <= 25) {
        return 'uniform four-bars';
      } else if (this.signalsStrength >= 26 && this.signalsStrength <= 31) {
        return 'uniform five-bars';
      } else {
        return 'no-bars';
      }
    }
  }


}
