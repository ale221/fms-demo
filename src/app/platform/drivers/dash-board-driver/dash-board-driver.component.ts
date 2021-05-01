import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { isValid } from 'date-fns';
import { of, Subject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { hypernymModules } from 'src/app/core/model/module';
import { FiltersService } from 'src/app/core/services/filters.service';
import { BroadcastEventListener } from 'src/app/core/wfw-ngx-signalr';
import { SignalRConnection } from 'src/app/core/wfw-ngx-signalr/src/services/connection/signalr.connection';
import { GoogleMapModel } from 'src/app/model/GoogleMapModel';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { isNullOrUndefined } from 'util';
import { Colors } from '../../colors';
import { AppLoader } from '../../data/model/app-loader';
import { ConvertToGallon } from '../../data/model/covert_to_gallon';
import { Item } from '../../data/model/item';
import { EntityWithIconLocation } from '../../data/model/location';
import { TruckResponse } from '../../data/response/entity-response';
import { DashboardEnum } from '../../enum/dashboard-enum';
import { SignalRresponse } from '../../model/signalRresponse';
import { EntityService } from '../../services/entity.service';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { GotoPageService } from '../../services/goto-page.service';
import { FiltersComponent } from '../../shared/filters/filters.component';
import { BrandingService } from '../../shared/services/branding.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DriverDetailsService } from '../../services/drivers/driver-details.service';
import { DropDownItem } from '../../data/model/dropdown-item';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-dash-board-driver',
  templateUrl: './dash-board-driver.component.html',
  styleUrls: ['./dash-board-driver.component.css'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class DashBoardDriverComponent implements OnInit {

  items = [{ label: 'Drivers', url: null }];
  home = { label: 'Dashboard' };

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('paginator') paginatorForMap: MatPaginator;

  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  trucks = [];
  resetFilters = false;
  displayedColumns = ['name', 'employee_id', 'status', 'on_shift', 'modified_by_name', 'modified_datetime', 'created_datetime'];
  displayedColumns2 = ['name', 'current_speed'];
  displayedColumnsLive = ['name', 'truck_name'];

  locations: EntityWithIconLocation[] = [];
  mapData;
  EntityStatusEnum = EntityStatusEnum;
  connection: SignalRConnection;
  subscription: Subscription;
  signalRstarted = [];
  searchText;
  searchTextForMapFilter;
  currentDate = new Date();

  loggedInUser = this.authService.getUser();
  customerID = this.loggedInUser.customer.id;
  widgetData = [
    { name: 'Refresh', icon: 'fa fa-refresh', route: '', reload: true },
    {
      name: 'Export', icon: 'fa fa-download', export: true,
      subNav: [
        { name: 'PDF', target: true, url: environment.baseUrl + '/iof/Export_driver_dashboard?export=pdf&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone },
        { name: 'XLS', target: true, url: environment.baseUrl + '/iof/Export_driver_dashboard?export=xls&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone }
      ]
    },
    {
      name: 'Share',
      shareUrls:
      {
        pdf: environment.baseUrl + '/iof/Export_driver_dashboard?export=pdf&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone,
        xls: environment.baseUrl + '/iof/Export_driver_dashboard?export=xls&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      icon: 'fa fa-share-alt',
      subNav: [{ name: 'Whatsapp', route: "" ,page:'drivers' }, { name: 'Email', route: '',page:'drivers' }]
    },
    { name: 'Manage', icon: 'ri-exchange-line', route: '/iol/drivers', target: true, url: 'http://52.178.0.56/admin', queryParam: true },
    { name: 'Allocate', icon: 'fa fa-location-arrow',  subNav: [{ name: 'Driver to Vehicle', route: '/iol/drivers/allocation' }, { name: 'Driver to Shift', route: '/iol/drivers/shiftallocation' }] },
    { name: 'Shift', icon: 'fa fa-map-marker', route: '/iol/drivers/shifts' },
    { name: 'Jobs', icon: 'fa fa-map-marker', route: '/iol/templates' }
  ]
  copySignalR: any;

  dataSource: any;
  dataSourceForMap: any;

  cardsArray;
  graphsArray;

  mapZoom;
  theme;

  downloadableLink
  downloadableLink1;
  filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '', driver_group: '', driver_id: '', is_poi: false, poi_id: '', zone_id: '' };
  markers = {};
  infoWindows = {};
  marker;
  poly = [];
  bounds = new google.maps.LatLngBounds();
  bounds1 = new google.maps.LatLngBounds();
  shapes = {};
  myInfowindow = new google.maps.InfoWindow();
  public _markers = [];
  loadingFilter = true;
  mapLoader = new AppLoader();
  totalLength = 0;
  totalLengthForMap = 0;
  useCaseId = 0;
  keyUp = new Subject<KeyboardEvent>();
  keyUp2 = new Subject<KeyboardEvent>();

  tempIcon = 'assets/images/iol/icon-map-pin-end.png';
  @ViewChild(FiltersComponent) filtersComponent: FiltersComponent; // get child component to use its method resetFilter

  filtersForm: FormGroup;
  driverGroup = [];
  driverLists = [];
  selectedDriver: [''];
  poiOptions = [];
  poi_id = 0;
  selectedPoiOption;
  zoneOptions;
  showFilterDropdown: boolean = false;
  fleetsOptions;
  selectedFleetOption;

  changeZoneName;
  selectedZoneOption;
  zone_id = 0;
  isAuthorized = false;
  sidebarCheck: any;

  constructor(private entityService: EntityService, private driverService: DriverDetailsService,
    private brandingService: BrandingService,
    private getUsecase: GetUsecaseService,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private route: ActivatedRoute, private formBuilder: FormBuilder,
    private filtersService: FiltersService,
    private drawerService: DrawerService) {
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.connection = this.route.snapshot.data['connection'];
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.downloadableLink = environment.baseUrl + '/iof/Export_driver_dashboard?export=xls&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = environment.baseUrl + '/iof/Export_driver_dashboard?export=pdf&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.loadDashboardCards(hypernymModules[6], DashboardEnum.Driver);
    this.filtersService.getValue().subscribe(data => {
      if (data) {
        this.filters = data;
        this.filters.limit = 10;
        this.filters.offset = 0;
        this.filters.order_by = '';
        this.filters.order = '';
        // this.filterIdsFromJSON();
        this.setExportUrls(this.filters);
        this.getDriversListing(this.filters);
        if (this.filters['fleet_id']) {
          this.getAllZones(this.filters['fleet_id'] ? this.filters['fleet_id'] : this.filters['fleet_id'].id);
        }
        //Reset all map variables, arrays
        this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
        this.getDriversForMap(this.filters)
        // this.showLabelsOnMap(this.filters['showLabels']);
      }
    });

    this.getDriversListing(this.filters)
    this.getDriversForMap(null);
    this.getAllZones(null);

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
        this.filters.search_key = this.searchText;
        this.getDriversListing(this.filters)
        this.setExportUrls(this.filters);
      }
    });


    this.filtersForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      search_key_map: [''],
      selectGroup: [''],
      selectedDriver: [''],
      poi_id: [null],
      zone_id: [null],
      fleet_id: [null]
    });

    this.keyUp2.pipe(
      map(event => event.target['value']),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(newValue => {
      this.searchTextForMapFilter = newValue;
      if (this.searchTextForMapFilter.length > 3 || this.searchTextForMapFilter.length === 0) {
        this.filtersForm.get("search_key_map").setValue(this.searchTextForMapFilter);
        this.filters.search_key = this.searchTextForMapFilter;
        this.getDriversForMap(this.filters)
        this.setExportUrls(this.filters);
      }
    });

    this.getGroupList();
    this.getPOIFilters(null);
    this.getFleetFilters();

  }

  getGroupList() {
    this.driverService.getDriverGroup().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        console.log(data.data);
        this.driverGroup = data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
        this.driverLists = [];
        console.log("coming in drivers", this.driverGroup);
      } else {
        console.log(data.message);
      }
    });
  }

  selectGroupDropDownChange($event) {
    this.getDrivers($event.value);
    // let param = { 'driver_group': $event.value }
    this.filters.driver_group = $event.value;
    this.setExportUrls(this.filters);
    this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
    this.entityService.getFleetDriversForMap(this.filters).subscribe(apiResponse => {
      // console.log("apiResponse[getDriversForMap]---> ", apiResponse);

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.dataSourceForMap = apiResponse['data'].data;
        this.totalLengthForMap = apiResponse['data'].count;
        // this.dataSourceForMap.sort = this.sort;
        this.dataSourceForMap.paginator = this.paginatorForMap;

        this.mapData = apiResponse['data'].data;
        if (this.mapData && this.mapData.length > 0) {
          this.trucks = [...this.mapData, ...this.trucks];
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })

  }

  getDrivers(driverGroupID) {
    this.driverService.getDriver(driverGroupID).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        console.log(data.data);
        this.driverLists = data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
      } else {
        console.log(data.message);
      }
    });
  }

  selectDriverDropDownChange($event) {
    // let param = { 'driver_id': $event.value }
    this.filters.driver_id = $event.value;
    this.setExportUrls(this.filters);
    this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
    this.entityService.getFleetDriversForMap(this.filters).subscribe(apiResponse => {
      // console.log("apiResponse[getDriversForMap]---> ", apiResponse);

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.dataSourceForMap = apiResponse['data'].data;
        this.totalLengthForMap = apiResponse['data'].count;
        // this.dataSourceForMap.sort = this.sort;
        this.dataSourceForMap.paginator = this.paginatorForMap;

        this.mapData = apiResponse['data'].data;
        if (this.mapData && this.mapData.length > 0) {
          this.trucks = [...this.mapData, ...this.trucks];
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })
  }

  getPOIFilters(params) {
    if (params) {
      params = '?fleet_id=' + params;
    }
    this.entityService.getPOIDropdown(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.poiOptions = apiResponse.data;
        // this.poiOptions = this.poiOptions.filter(value => {
        //   return value.name === 'Fleets' || value.name === 'Drivers'
        // });
      }
    })
  }

  poiOptionChange(event) {
    this.selectedPoiOption = event.value.id;
    // this.selectedPoiString = event.value.name;

    console.log("this.selectedPoiOption", this.selectedPoiOption);
    this.poi_id = event.value.id;

    // if (this.filtersForm.controls['poi_id'].value.name == 'Fleets') {
    //   console.log("inside if condition")
    //   this.showFilterDropdown = true;

    // } else {
    console.log("inside else condition")
    this.showFilterDropdown = false;

    this.filters.is_poi = true;
    this.filters.poi_id = this.selectedPoiOption;
    this.setExportUrls(this.filters);
    //Reset all map variables, arrays
    // this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
    this.entityService.getFleetDriversForMap(this.filters).subscribe(apiResponse => {
      // console.log("apiResponse[getDriversForMap]---> ", apiResponse);

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.dataSourceForMap = apiResponse['data'].data;
        this.totalLengthForMap = apiResponse['data'].count;
        // this.dataSourceForMap.sort = this.sort;
        this.dataSourceForMap.paginator = this.paginatorForMap;

        this.mapData = apiResponse['data'].data;
        if (this.mapData && this.mapData.length > 0) {
          this.trucks = [...this.mapData, ...this.trucks];
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })

    // }



    // get geozones
    this.changeZoneName = event.value.name;
    console.log("this.changeZoneName= ", this.changeZoneName)

    this.entityService.getPOIDropdownChange(this.changeZoneName).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.zoneOptions = apiResponse.data;
        console.log("this.zoneOptions= ", this.zoneOptions);
        this.filters.poi_id = this.changeZoneName;
        // this.filtersService.setValue(this.filters);
        // this.filtersService.setPlaybackValue(this.filters);
        console.log("filters in poi change", this.filters);


      }
    })



  }

  zoneOptionChange(event) {
    console.log('zoneDropDown change= ', event)
    this.zone_id = event.value.id;
    this.selectedZoneOption = event.value.id;
    this.filters.zone_id = event.value.id;//this.zone_id;
    this.setExportUrls(this.filters);
    //Reset all map variables, arrays
    this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
    this.entityService.getFleetDriversForMap(this.filters).subscribe(apiResponse => {
      // console.log("apiResponse[getDriversForMap]---> ", apiResponse);

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.dataSourceForMap = apiResponse['data'].data;
        this.totalLengthForMap = apiResponse['data'].count;
        // this.dataSourceForMap.sort = this.sort;
        this.dataSourceForMap.paginator = this.paginatorForMap;

        this.mapData = apiResponse['data'].data;
        if (this.mapData && this.mapData.length > 0) {
          this.trucks = [...this.mapData, ...this.trucks];
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })
  }







  getFleetFilters() {
    this.entityService.getFleetFiltersDropdown().subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.fleetsOptions = apiResponse.data.data;
      }
    })
  }

  fleetOptionChange(event) {
    // console.log("event--- ", event.value.id)

    let params = {
      'is_poi': true,
      'poi_id': 'Fleets',
      'zone_id': event.value.id
    }

    // console.log("params with zone_id---", params)
    this.entityService.getFleetDriversForMap(params).subscribe(apiResponse => {
      // console.log("apiResponse[getDriversForMap]---> ", apiResponse);

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.dataSourceForMap = apiResponse['data'].data;
        this.totalLengthForMap = apiResponse['data'].count;
        // this.dataSourceForMap.sort = this.sort;
        this.dataSourceForMap.paginator = this.paginatorForMap;

        this.mapData = apiResponse['data'].data;
        if (this.mapData && this.mapData.length > 0) {
          this.trucks = [...this.mapData, ...this.trucks];
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })


    // this.fleetCategories = event.value.category;
    // this.fleet_id = event.value.id;
    // this.selectedFleetOption = event.value;
    // if (this.activePage === 'fleets') {
    //   this.poiDropdownDisabled=true;
    //   this.poiField = true;
    //   this.getPOIFilters(this.fleet_id);
    //   this.getZonesFilters(this.fleet_id);
    //   this.getRoutesFilters(this.fleet_id);
    // }
    // if (this.activePage === 'playback') {
    //   this.vehicleOptions = event.value.vehicles;
    // }
    // this.filtersForm.get("fleet_id").setValue(this.selectedFleetOption);
    // this.filtersForm.get("trackVehicle").setValue(false);
    // this.filtersForm.get("automaticZoom").setValue(false);
    // this.filtersForm.get("search_key").setValue('');
    // // Reset dependent filters
    // this.poi_id = null; this.selectedPoiOption = null;
    // this.zone_id = null; this.selectedZoneOption = null;
    // this.route_id = null; this.selectedRouteOption = null;
    // this.filtersForm.get("category_id").setValue([]);
    // this.filtersForm.get("vehicle_id").setValue(null);
    // this.filtersService.setValue(this.filtersForm.value);
  }


















  loadDashboardCards(module, dashboardId) {
    this.entityService.getDashboardCards(module, dashboardId).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.cardsArray = apiResponse.data.card;
        this.graphsArray = apiResponse.data.graph;
      }
    })
  }

  ngAfterViewInit() {
    const mapProp = GoogleMapModel.getMapProp();
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    this.mapZoom = this.map.getZoom();
  }

  getSelectedWidgetOption(event) {
    if (event.reload) {
      this.filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '', driver_group: '', driver_id: '', is_poi: false, poi_id: '', zone_id: '' };
      this.getDriversListing(this.filters);
      this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
      this.getDriversForMap(this.filters);
      this.resetFilters = true;
      this.filtersForm.reset()
      // this.filtersComponent.filterReset();
    }
  }

  // filterIdsFromJSON() {
  //   if (this.filters && this.filters['fleet_id']) {
  //     this.filters['fleet_id'] = this.filters['fleet_id'].id;
  //   }
  //   if (this.filters && this.filters['poi_id']) {
  //     this.filters['poi_id'] = this.filters['poi_id'].id;
  //   }
  //   if (this.filters && this.filters['zone_id']) {
  //     this.filters['zone_id'] = this.filters['zone_id'].id;
  //   }
  //   if (this.filters && this.filters['route_id']) {
  //     this.filters['route_id'] = this.filters['route_id'].id;
  //   }
  //   if (this.filters && this.filters['shift_id']) {
  //     this.filters['shift_id'] = this.filters['shift_id'].id;
  //   }
  // }


  getDriversListing(filters) {
    this.loadingFilter = true;
    this.mapLoader = {
      visibility: this.loadingFilter,
      dataError: true
    }
    this.entityService.getFleetDrivers(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.setExportUrls(this.filters);

        this.loadingFilter = false;
        this.mapLoader = {
          visibility: this.loadingFilter,
          dataError: false
        }
        this.dataSource = apiResponse['data'].data;
        console.log("this.datasource",this.dataSource);
        this.totalLength = apiResponse['data'].count;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    })
  }


  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getDriversListing(this.filters);
  }

  sortDataForMap(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getDriversForMap(this.filters);
  }

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getDriversListing(this.filters);
  }

  onPaginateChangeForMap(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getDriversForMap(this.filters);
  }


  getDriversForMap(filters) {
    this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
    this.entityService.getFleetDriversForMap(filters).subscribe(apiResponse => {
      // console.log("apiResponse[getDriversForMap]---> ", apiResponse);

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.dataSourceForMap = apiResponse['data'].data;
        this.totalLengthForMap = apiResponse['data'].count;
        // this.dataSourceForMap.sort = this.sort;
        // this.dataSourceForMap.paginator = this.paginatorForMap;

        this.mapData = apiResponse['data'].data;
        if (this.mapData && this.mapData.length > 0) {
          this.trucks = [...this.mapData, ...this.trucks];
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })
  }

  setExportUrls(filters) {
    if (filters) {
      // const urlAppend = `is_poi=${filters.is_poi}&poi_id=${filters.poi_id}&driver_id=${filters.driver_id}&driver_group=${filters.driver_group}&search_key=${filters.search_key}`
      var query = Object.keys(this.filters).map(key => key + '=' + this.filters[key]).join('&');

      setTimeout(() => {
        this.downloadableLink = environment.baseUrl + '/iof/Export_driver_dashboard?' + query + '&export=xls&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.downloadableLink1 = environment.baseUrl + '/iof/Export_driver_dashboard?' + query + '&export=pdf&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
      }, 500);

    }
  }

  getAllZones(params) {
    if (params) {
      params = '?fleet_id=' + params;
    }
    this.entityService.getZonesDropdown(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.drawGeozones(apiResponse.data);
      }
    })
  }

  drawGeozones(geozones) {
    if (geozones && geozones.length > 0) {
      geozones.forEach(element => {
        this.drawTerritory(element.territory, element.name)
      });
    }
  }

  drawTerritory(cords, title?, opts?, height = 250) {
    // this.resetMap();
    const bounds = this.bounds;
    // let bounds = new google.maps.LatLngBounds();
    const arr = [];
    let cordsArray = [];
    cordsArray = cordsArray.concat(cords);
    for (let i = 0; i < cordsArray.length; i++) {
      // const obj = JSON.parse(cordsArray[i]);
      const polygonShape = new google.maps.Polygon({
        paths: cordsArray,
      });
      if (opts) {
        polygonShape.setOptions(({ strokeWeight: 1, strokeColor: opts[i].strokeColor, fillColor: opts[i].fillColor }));
      } else {
        polygonShape.setOptions(({ strokeWeight: 1, strokeColor: '#000', fillColor: '#7799b3' }));
      }
      // polygonShape.setOptions(({ strokeColor: '#9999ff', fillColor: '#7799b3'}));

      polygonShape.setMap(this.map);
      polygonShape.getPath().forEach(function (element, index) {
        const obj = { lat: null, lng: null };
        bounds.extend(element);
        obj.lat = element.lat();
        obj.lng = element.lng();
        arr.push(obj);

      });
      // strokeColor: '#000',
      //   fillColor: '#7799b3'
      if (title) {
        polygonShape.addListener('click', event => {
          polygonShape.setOptions({ fillColor: '#0000ff' });
          this.myInfowindow.setContent('Territory Name: ' + title);
          this.myInfowindow.setPosition(event.latLng);
          this.myInfowindow.open(this.map);
        });
        this.shapes[title] = polygonShape;
        polygonShape.addListener('mousemove', event => {
          this.myInfowindow.close();
          polygonShape.setOptions({ fillColor: opts ? opts[i].fillColor : '#7799b3' });

        });

      }

      this._markers.push(polygonShape);
    }
    //
    this.map.fitBounds(bounds);
    // const z = this.getBoundsZoomLevel(bounds, { height: height, width: 390 });
    // this.map.setZoom(z);
    this.map.setCenter(bounds.getCenter());
    if (cordsArray.length === 1) {
      return this._markers[0];
    }
  }


  setSignalRresponse(i) {
    this.signalRstarted[i] = 0;
    this.trucks[i].signalRresponse = new SignalRresponse(
      null,
      null,
      null,
      this.trucks[i].last_temperature,
      ConvertToGallon.convert_to_gallon(((this.trucks[i].last_volume || 0) / 100) * this.trucks[i].volume_capacity, true),
      this.trucks[i].device_id,
      this.trucks[i].last_latitude,
      this.trucks[i].last_longitude,
      null,
      this.trucks[i].last_speed || 0,
      null,
      this.trucks[i].last_updated,
      this.trucks[i].type,
      1,
      1
    );
  }

  verifySignalRData(signalRresponse, i) {
    return (signalRresponse.lat !== 0 && signalRresponse.lon !== 0) &&
      (!isNullOrUndefined(signalRresponse.lat) && (!isNullOrUndefined(signalRresponse.lon)))
      &&
      (signalRresponse.t !== '-' && !isNullOrUndefined(signalRresponse.lat) && isValid(new Date(signalRresponse.t)));
  }


  findAddressFromLatLang(location, geocoder) {
    return new Promise(function (resolve, reject) {
      geocoder.geocode({ 'location': location }, function (results, status) {
        if (status === 'OK') {
          resolve([results[0].formatted_address]);
        }
        // else {
        //     reject(new Error('Couldnt\'t find the location ' + location));
        // }
      })
    })
  }


  setupSignalR() {
    this.connection.start()
      .then((c) => {
        this.trucks.forEach((item, i) => {
          this.setSignalRresponse(i);
          this.connection.invoke('register', item.device)
            .catch((err: any) => console.warn(item.device + ' Failed to invoke. Error occurred. Error:' + err));
        });
        const newMessage = new BroadcastEventListener<any>('newMessage');
        this.connection.listen(newMessage);
        this.subscription = newMessage.subscribe((response: string) => {
          const signalRresponse = JSON.parse(response) as SignalRresponse;

          console.log('signalResponse', signalRresponse);
          if (signalRresponse && Number(signalRresponse.rtp) !== 1) {
            return;
          }

          for (let i = 0; i < this.trucks.length; i++) {
            if (this.trucks[i].device === signalRresponse.id) {
              this.trucks[i].online_status = true;
              if (this.cardsArray && this.cardsArray.length > 0) {
                this.cardsArray.forEach(element => {
                  if (element.name === 'Online Vehicles') {
                    element.data.total_count = this.mapData.filter(truck => truck.online_status === true).length;
                  }
                  if (element.name === 'Offline Vehicles') {
                    element.data.total_count = this.mapData.filter(truck => truck.online_status === false).length;
                  }
                });
              }
              if (this.verifySignalRData(signalRresponse, i)) {
                const oldLatLng = new google.maps.LatLng(this.trucks[i].signalRresponse.lat, this.trucks[i].signalRresponse.lon);

                this.signalRstarted[i] += 1;
                this.trucks[i].signalRresponse = new SignalRresponse(
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
                  ((!this.trucks[i].online_status) ? DateUtils.getLocalMMDDYYYYhhmmss(this.trucks[i]['last_update_unix']) : ((signalRresponse.t != 0) ? DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t) : '0')),
                  signalRresponse.type,
                  signalRresponse.nw,
                  signalRresponse.gw
                );

                // let geocoder = new google.maps.Geocoder();
                // this.copySignalR = this.trucks[i].signalRresponse;
                // var latlng = { lat: parseFloat(signalRresponse.lat.toString()), lng: parseFloat(signalRresponse.lon.toString()) };
                // this.findAddressFromLatLang(latlng, geocoder).then((result) => {
                //   if (result) {
                //     this.trucks[i]['location_address'] = result[0];
                //     this.updateLocation(i, signalRresponse, oldLatLng, this.trucks, false);
                //   }
                // });

                this.trucks[i].signalRresponse.vol = ConvertToGallon.convert_to_gallon(((this.trucks[i].signalRresponse.vol / 100) * this.trucks[i].volume_capacity));
                this.trucks[i].signalRresponse['ignition_status'] = (this.trucks[i].signalRresponse.spd > 5) || (this.trucks[i].signalRresponse.nw !== 1);

                if (signalRresponse.t == 0) {
                  this.trucks[i].last_updated = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
                  this.trucks[i].signalRresponse['t'] = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
                }

                const newLatLng = new google.maps.LatLng(signalRresponse.lat, signalRresponse.lon);
                const differenceInDistance = (google.maps.geometry.spherical.computeDistanceBetween(newLatLng, oldLatLng));

                const tooLongOrtooShortDistance = 50 < differenceInDistance && differenceInDistance < 200000;
                if (!tooLongOrtooShortDistance && signalRresponse.lat && signalRresponse.lon) {
                  this.trucks[i].signalRresponse['spd'] = 0;
                  this.trucks[i].signalRresponse['ignition_status'] = false;
                }

                if (this.filters['vehicle_id']) {
                  if (this.trucks[i].id === this.filters['vehicle_id'].id) {
                    const latlng = new google.maps.LatLng(this.trucks[i].signalRresponse.lat, this.trucks[i].signalRresponse.lng);
                    this.map.setCenter(latlng);
                  }
                }

                this.updateLocation(i, signalRresponse, oldLatLng, this.trucks);
                this.trucks = [...this.trucks];
              } else if (!signalRresponse.lat && !signalRresponse.lon) {
                this.trucks[i].signalRresponse.t = DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t);
                const oldLatLng = new google.maps.LatLng(this.trucks[i].signalRresponse.lat, this.trucks[i].signalRresponse.lon);
                this.updateLocation(i, signalRresponse, oldLatLng, this.trucks);
              } else {
                // this.trucks[i].signalRresponse['ignition_status'] = (this.trucks[i].signalRresponse.spd > 5) || (this.trucks[i].signalRresponse.nw !== 1);
                // if (signalRresponse.t == 0) {
                //   this.trucks[i].last_updated = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
                //   this.trucks[i].signalRresponse['t'] = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
                // }
                // this.updateInvalidSignalData(i, this.trucks);
              }

            }
          }
        });
      });
  }

  updateLocation(i, signalRresponse, oldLatLng, trucks, checkDistance = true) {
    const newLatLng = new google.maps.LatLng(signalRresponse.lat, signalRresponse.lon);
    const differenceInDistance = (google.maps.geometry.spherical.computeDistanceBetween(newLatLng, oldLatLng));
    const tooLongOrtooShortDistance = 50 < differenceInDistance && differenceInDistance < 200000;
    if (checkDistance) {
      if (tooLongOrtooShortDistance || isNaN(differenceInDistance)) {
        this.locations[i].last_longitude = this.locations[i].longitude;
        this.locations[i].last_latitude = this.locations[i].latitude;
        this.locations[i].latitude = this.trucks[i].signalRresponse.lat;
        this.locations[i].longitude = this.trucks[i].signalRresponse.lon;
        this.generateMapView(i, trucks);
      }
    }

    this.locations[i].infoList = [
      new Item('Name', this.trucks[i].name),
      new Item('Status', this.trucks[i].on_shift),
      new Item('Speed', ((this.trucks[i].signalRresponse.spd > 5 && tooLongOrtooShortDistance) ? Math.round(this.trucks[i].signalRresponse.spd) : ((this.trucks[i].signalRresponse.spd && !signalRresponse.lat && !signalRresponse.lon) ? Math.round(this.trucks[i].signalRresponse.spd) : 0)) + ' km/h'),
      // new Item('Fuel', (this.trucks[i].signalRresponse.vol ? (this.trucks[i].signalRresponse.vol).toFixed(2) : 0) + ' gal'),
      // new Item('Temperature', ((this.trucks[i].signalRresponse.temp) ? this.trucks[i].signalRresponse.temp : 0) + ' °C'),
      // new Item('Net Weight', this.trucks[i].signalRresponse.nw + ' kg'),
      // new Item('Truck Type', this.trucks[i]['vehicle_type']),
      new Item('Last Updated', DateUtils.getMMDDYYYYhhmmssA(this.trucks[i].signalRresponse.t)),
      // new Item('Locations', (trucks[i]['location_address'] ? trucks[i]['location_address'] : '-'))
    ];
    this.updateInfoWindow(i);
  }

  resetMap() {
    for (const key in this.markers) {
      // let value = this.markers[key];
      this.markers[key].setMap(null);
    }
    for (let i = 0; i < this.poly.length; i++) {
      if (this.poly[i]) {
        this.poly[i].setMap(null);
      }
    }
    this.poly = [];
    this.markers = {};
    this.bounds1 = new google.maps.LatLngBounds();
    // console.log('markers', this.markers);
  }


  setupLocations() {
    this.locations = [];
    console.log("this.trucks--", this.trucks);
    console.log("this.locations--", this.locations)
    this.locations = this.trucks.map(item =>
      new EntityWithIconLocation(item.id, item.last_latitude, item.last_longitude,
        [new Item('Name', item.name),
        new Item('Status', item.on_shift),
        new Item('Speed', ((item.last_speed > 5) ? Math.round(item.last_speed) : 0) + ' km/h'),
        // new Item('Vehicle Type', item['vehicle_type']),
        new Item('Last Updated', DateUtils.getLocalMMDDYYYYhhmmss(item['last_updated'])),
          // new Item('Location', (item['location_address']) ? item['location_address'] : '-')
        ], item['marker']));
    console.log("this.locations222--", this.locations)
    this.generateMapView(null, this.trucks);
  }

  generateMapView(i?, trucks?) {
    const colors = Colors.getColors();
    let colorIndex = -1;
    if (i || i === 0) {
      const newPos = new google.maps.LatLng(this.locations[i].latitude, this.locations[i].longitude);
      this.updateInfoWindow(i);
      if (this.signalRstarted[i] > 1 && trucks[i].signalRresponse['spd'] > 5) {
        this.markers[this.locations[i].entity_id].setPosition(newPos);
        const path = this.poly[i].getPath();
        this.markers[this.locations[i].entity_id].setMap(null);
        //Hardcode angle set
        const marker = this.createMarkers(newPos, i, 20);
        this.markers[this.locations[i].entity_id] = marker;
        path.push(newPos);
        this.poly[i].setPath(path);
        this.poly[i].setMap(this.map);
      }
    } else {
      for (let j = 0; j < this.locations.length; j++) {
        if (this.locations[j].entity_id && this.locations[j].latitude && this.locations[j].longitude) {
          const newPos = new google.maps.LatLng(this.locations[j].latitude, this.locations[j].longitude);
          this.updateInfoWindow(j);
          const marker = this.createMarkers(newPos, j);
          this.markers[this.locations[j].entity_id] = marker;
          this.bounds1.extend(marker.getPosition());
          const poly = new google.maps.Polyline({
            map: this.map,
            strokeColor: colors[j],
          });
          poly.setPath([newPos]);
          this.poly[j] = poly;
          this.map.fitBounds(this.bounds1);
        }
      }
    }
  }

  updateInfoWindow(i) {
    let info = '';
    let iValue = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
      '<tbody>';
    this.locations[i].infoList.forEach((e) => {
      info += '<p><b>' + e.key + '</b> :' + e.value + '</p>';
      const key = e.key;
      let value: string;
      value = e.value;

      // tslint:disable-next-line:triple-equals
      if (key != 'Name' && key != 'Status') {
        iValue += `<tr>
          <th> ${key} </th>
        <td class="text-left">${value}</td>
        </tr>`;
      } else if (key == 'Name') {
        iValue += `<thead> <tr> <th colspan=2>${value}`;
      } else if (key == 'Status') {
        let clas = null;
        if (value) {
          clas = 'label-success';
          value = 'On Shift';
        } else {
          clas = 'label-danger';
          value = 'Off Shift';
        }
        iValue += `&nbsp;<span ><span  class="label margin-top-3 ${clas} pull-right">${(value ? value : '-')}</span></span></th></tr></thead>`;
      }

    });
    iValue += '</tbody> </table>';
    if (this.infoWindows[this.locations[i].entity_id]) {
      this.infoWindows[this.locations[i].entity_id].setContent(iValue);
    }
  }

  /*
    Map
     */
  createMarkers(pos, i?, angle = 0) {
    let truckIcon = {
      url: this.tempIcon,
      scaledSize: new google.maps.Size(50, 50), // scaled size
      anchor: new google.maps.Point(25, 40), // anchor
      rotation: angle
    };

    let info = '';
    let iValue = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
      '<tbody>';
    this.locations[i].infoList.forEach((e) => {
      info += '<p><b>' + e.key + '</b> :' + e.value + '</p>';
      const key = e.key;
      let value = e.value;
      if (key != 'Name' && key != 'Status') {
        iValue += `<tr>
          <th> ${key} </th>
        <td class="text-left">${value}</td>
        </tr>`;
      } else if (key == 'Name') {
        iValue += `<thead> <tr> <th colspan=2>${value}`;
      } else if (key == 'Status') {
        let clas = null;
        if (value) {
          clas = 'label-success';
          value = 'On Shift';
        } else {
          clas = 'label-danger';
          value = 'Off Shift';
        }
        iValue += `&nbsp;<span ><span  class="label margin-top-3 ${clas} pull-right">${value}</span></span></th></tr></thead>`;
      }
    });
    iValue += '</tbody> </table>';
    const infowindow = new google.maps.InfoWindow({
      content: iValue
    });
    this.infoWindows[this.locations[i].entity_id] = infowindow;

    const marker = new google.maps.Marker({
      position: pos,
      map: this.map,
      icon: truckIcon
    });

    const map = this.map;

    marker.addListener('mouseover', function () {
      infowindow.open(map, this);
    });
    marker.addListener('mouseout', function () {
      infowindow.close();
    });

    return marker;
  }


  ExportDriverListAsCSV() {
    this.setExportUrls(this.filters);
    window.open(this.downloadableLink, '_blank');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.connection) {
      this.connection.stop();
    }
  }

}
