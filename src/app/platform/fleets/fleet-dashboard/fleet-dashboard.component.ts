import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { hypernymModules } from 'src/app/core/model/module';
import { FiltersService } from 'src/app/core/services/filters.service';
import { DashboardEnum } from '../../enum/dashboard-enum';
import { EntityService } from '../../services/entity.service';
import { BrandingService } from '../../shared/services/branding.service';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { AppLoader } from '../../data/model/app-loader';
import { EntityWithIconLocation } from '../../data/model/location';
import { Item } from '../../data/model/item';
import { EntitySummaryResponse } from '../../data/response/EntitySummaryResponse';
import { TruckResponse } from '../../data/response/entity-response';
import { Colors } from '../../colors';
import { SignalRConnection, BroadcastEventListener } from 'src/app/core/wfw-ngx-signalr';
import { SignalRresponse } from '../../model/signalRresponse';
import { ConvertToGallon } from '../../data/model/covert_to_gallon';
import { Subscription } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { isValid } from 'date-fns';
import { ActivatedRoute } from '@angular/router';
import { GoogleMapModel } from 'src/app/model/GoogleMapModel';
import { GotoPageService } from '../../services/goto-page.service';
import { ApiResponse } from 'src/app/core/model/api.response';
import { UtillsService } from '../../services/common/utills.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { SwalService } from 'src/app/core/services/swal.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { User } from 'src/app/core/model/user';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { SignalRService } from 'src/app/Services/signal-r.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { XlsPdfService } from '../../services/xls-pdf.service';
declare var $: any;
declare var google: any;

@Component({
  selector: '',
  templateUrl: './fleet-dashboard.component.html',
  styleUrls: ['./fleet-dashboard.component.css'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FleetDashboardComponent implements OnInit {

  items = [{ label: 'Fleet', url: null }];
  home = { label: 'Dashboard' };

  csvCols = [
    { header: 'ID', field: 'id' },
    { header: 'Name', field: 'name' },
    { header: 'Current Speed', field: 'last_speed' },
    { header: 'Driver', field: 'assigned_driver' },
    { header: 'KM/Day', field: 'distance_travelled' },
    { header: 'POI', field: 'poi_name' },
    { header: 'POI Time', field: 'poi_time' },
  ];

  isAuthorized = false;
  displayedColumns = ['name', 'current_speed'];
  displayedColumnsDetailedReport = ['name', 'current_speed', 'assigned_driver', 'last_updated', 'location_address'];
  displayedColumnsTravelHistory = ['name', 'last_speed', 'driver_name', 'distance_travelled', 'zone_name', 'created_datetime'];
  displayedColumnsStatistics = ['employee_id', 'name', 'total_violations', 'saftey_score_card', 'total_jobs'];
  displayedColumnsStops = ['location', 'zone_name'];
  searchForm: FormGroup;
  downloadableLink;
  downloadableLink1;
  dataSource: any;
  dataSource1: any;
  dataSourceDetailedReport: any;
  dataSourceTravelHistory: any;
  dataSourceStatistics: any;
  dataSourceStops: any;
  resetFilters = false;
  poiField = false;
  vehicleFleet = false;
  sidebarCheck;

  @ViewChild("scrollToTabs") scrollToTabs: ElementRef;

  locations: EntityWithIconLocation[] = [];
  trucksSummaryResponse: EntitySummaryResponse = new EntitySummaryResponse();
  trucks: TruckResponse[] = [];
  private connection: SignalRConnection;
  private subscription: Subscription;

  signalRstarted = [];
  truckTypeFilters = [];
  copySignalR: any;
  currentDate = new Date();

  myInfowindow = new google.maps.InfoWindow();
  public _markers = [];
  territories: any[] = [];

  signalRSubscription = new Subscription;

  mapZoom;
  markers = {};
  infoWindows = {};
  marker;
  poly = [];
  bounds = new google.maps.LatLngBounds();
  bounds1 = new google.maps.LatLngBounds();
  shapes = {};
  url = environment.baseUrl;
  loggedUser;
  loggedInUser = this.authService.getUser() as User;
  customerID = this.loggedInUser.customer.id;
  widgetData = [
    { name: 'Playback', icon: 'fa fa-forward', route: '/iol/quick-view' },
    { name: 'Refresh', icon: 'fa fa-refresh', route: '/iol/fleets', reload: true },
    {
      name: 'Export', icon: 'fa fa-download', export: true,
      subNav: [
        { name: 'PDF', target: true, url: environment.baseUrl + '/iof/fleet_pdf?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone, dashboard_Type: 'fleet' },
        { name: 'XLS', target: true, url: environment.baseUrl + '/iof/fleet_xls?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone, dashboard_Type: 'fleet' }
      ]
    },
    {
      name: 'Share',
      shareUrls:
      {
        pdf: environment.baseUrl + '/iof/fleet_pdf?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone,
        xls: environment.baseUrl + '/iof/fleet_xls?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      icon: 'fa fa-share-alt',
      subNav: [{ name: 'Whatsapp', route: "", page: 'fleet' }, { name: 'Email', route: '', page: 'fleet' }]
    },
    { name: 'Manage', icon: 'ri-exchange-line', route: '/iol/admin/truck', target: true, url: 'http://52.178.0.56/admin', queryParam: true },
    { name: 'Geozones', icon: 'fa fa-location-arrow', route: '/iol/admin/territory' },
    { name: 'Allocate', icon: 'fa fa-map-marker', subNav: [{ name: 'Driver to Vehicle', route: '/iol/drivers/allocation' }, { name: 'Driver to Shift', route: '/iol/drivers/shiftallocation' }] },
    { name: 'history', icon: 'fa fa-history', route: '', scrollToDiv: true },
  ]

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sortDetailedReport: MatSort;
  @ViewChild('paginatorDetailedReport') paginatorDetailedReport: MatPaginator;
  @ViewChild(MatSort) sortTravelHistory: MatSort;
  @ViewChild('paginatorTravelHistory') paginatorTravelHistory: MatPaginator;
  @ViewChild(MatSort) sortStatistics: MatSort;
  @ViewChild('paginatorStatistics') paginatorStatistics: MatPaginator;
  @ViewChild(MatSort) sortStops: MatSort;
  @ViewChild('paginatorStops') paginatorStops: MatPaginator;

  cardsArray;
  graphsArray;
  theme;

  filters = { limit: 10, offset: 0, order_by: '', order: '' };
  filtersDetailedReport = { limit: 10, offset: 0, order_by: '', order: '', search_key: '' };
  filtersTravelHistory = { limit: 10, offset: 0, order_by: '', order: '', search_key: '' };
  filtersStatistics = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '', search_key: '' };
  filtersStops = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '', search_key: '' };

  keyUp = new Subject<KeyboardEvent>();
  searchText: string;
  subscription$ = new Subscription;

  tableData;
  totalLength = 0;
  totalLengthDetailedReport = 0;
  totalLengthTravelHistory = 0;
  totalLengthStatistics = 0;
  totalLengthStops = 0;
  showIndeterminateProgress = true;
  loadingFilter = true;
  add_btn = 0;
  search_by = ' Search by Vehicle';
  statusID = [];

  mapData;
  // @ViewChild("map") map: GoogleMapComponent;
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  mapLoader = new AppLoader();
  trackVehicle = false;

  //set graph height for dashboard
  graphHeight = 240;
  geoZones;
  useCaseId = 0;
  packageType: any;

  // fileUrl;
  constructor(private entityService: EntityService,
    public gotoService: GotoPageService,
    private route: ActivatedRoute,
    private brandingService: BrandingService,
    private getUsecase: GetUsecaseService,
    private filtersService: FiltersService,
    private srvUtillsService: UtillsService,
    private swalService: SwalService,
    public formBuilder: FormBuilder,
    private authService: AuthService,
    private drawerService: DrawerService,
    private signalRService: SignalRService,
    private sanitizer: DomSanitizer,
    private _http: HttpClient,
    private xlsPdfService:XlsPdfService
  ) {
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.packageType = PackageType;
    this.searchForm = this.formBuilder.group({
      search: ['']
    })
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    // this.signalRService.init();
    this.loggedUser = this.authService.getUser()

    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })
    this.add_btn = 0;
    this.loadDashboardCards(hypernymModules[6], DashboardEnum.Fleets);
    this.getVehiclesListing(this.filters);
    this.connection = this.route.snapshot.data['connection'];

    this.subscription$ = this.filtersService.getValue().subscribe(data => {
      if (data) {
        this.filters = data;
        this.filters.limit = 10;
        this.filters.offset = 0;
        this.filters.order_by = '';
        this.filters.order = '';
        this.filterIdsFromJSON();
        this.setExportUrls(this.filters)
        if (this.filters['vehicle_id'] || this.filters['automaticZoom']) {
          this.zoomMapToVehicle(this.filters['vehicle_id']);
          if (this.filters['automaticZoom'] && this.filters['vehicle_id']) {
            this.trackVehicle = true;
          } else {
            this.trackVehicle = false;
          }
        } else if (this.filters['poi_id'] && this.filters['zone_id']) {
          this.filters['is_poi'] = true;
          if (this.filters['status'] && this.filters['status'].length > 0) {
            this.filters['poi_id'] = this.filters['poi_name_custom'];
          }
          if (this.filters['status'] && this.filters['status'].length === 0 && this.filters['poi_name_custom']) {
            this.filters['poi_id'] = this.filters['poi_name_custom'];
          }

          if (this.filters['poi_name_custom']) {
            this.filters['poi_id'] = this.filters['poi_name_custom'];
          }
          this.getVehiclesListing(this.filters);
          //Reset all map variables, arrays
          this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
          this.getVehiclesForMap(this.filters)
          if (this.filters['zone_id'] && this.filters['poi_id'] === 'Fleets') {
            this.filters['fleet_id'] = this.filters['zone_id'];
            if (this.filters['status'] && this.filters['status'].length > 0) {
              this.filters['poi_id'] = this.filters['poi_name_custom'];
            }
            if (this.filters['status'] && this.filters['status'].length === 0 && this.filters['poi_name_custom']) {
              this.filters['poi_id'] = this.filters['poi_name_custom'];
            }
            if (this.filters['poi_name_custom']) {
              this.filters['poi_id'] = this.filters['poi_name_custom'];
            }
            //Reset all map variables, arrays
            this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
            this.getVehiclesForMap(this.filters)
          }
        } else if (this.filters['status'] && this.filters['status'].length > 0) {
          this.trucks = [];
          if (this.filters['status'].includes(1) && this.filters['status'].includes(2)) {
            this.trucks = this.mapData;
            const dataSource = JSON.parse(localStorage.getItem('vehiclesListing'));
            // console.log("dataSourcedataSource1",dataSource);
            this.dataSource = dataSource.filter(function (data) {
              return data.online_status === true || data.online_status === false;
            });
            this.statusID = [];
            for (let i = 1; i <= this.dataSource.length; i++) {

              this.statusID.push(this.dataSource[i - 1]['id']);
            }
            let check = this.statusID.toString();
            this.filters['device_ids'] = check;
            this.setExportUrls(this.filters);
            this.totalLength = this.dataSource.length;
          } else if (this.filters['status'].includes(1)) {
            const dataSource = JSON.parse(localStorage.getItem('vehiclesListing'));
            // console.log("dataSourcedataSource2",dataSource);
            this.dataSource = dataSource.filter(function (data) {
              return data.online_status === true;
            });
            console.log("dataSourcedataSource2", this.dataSource);
            this.statusID = [];
            for (let i = 1; i <= this.dataSource.length; i++) {

              this.statusID.push(this.dataSource[i - 1]['id']);
            }
            let check = this.statusID.toString();
            this.filters['device_ids'] = check;
            this.setExportUrls(this.filters);


            this.totalLength = this.dataSource.length;
            this.trucks = this.mapData.filter(function (data) {
              return data.online_status === true;
            });
          } else if (this.filters['status'].includes(2)) {
            const dataSource = JSON.parse(localStorage.getItem('vehiclesListing'));
            // console.log("dataSourcedataSource3",dataSource);
            this.dataSource = dataSource.filter(function (data) {
              return data.online_status === false;
            });
            this.statusID = [];
            for (let i = 1; i <= this.dataSource.length; i++) {

              this.statusID.push(this.dataSource[i - 1]['id']);
            }
            let check = this.statusID.toString();
            this.filters['device_ids'] = check;
            this.setExportUrls(this.filters);
            this.totalLength = this.dataSource.length;
            this.trucks = this.mapData.filter(function (data) {
              return data.online_status === false;
            });
          }
          this.resetMap();
          this.locations = [];
          this.setupLocations();
        } else {
          this.trackVehicle = false;
          this.getVehiclesListing(this.filters);
          if (this.filters['fleet_id']) {
            this.getAllZones(this.filters['fleet_id'] ? this.filters['fleet_id'] : this.filters['fleet_id'].id);
          }
          //Reset all map variables, arrays
          this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
          this.getVehiclesForMap(this.filters)
          // this.showLabelsOnMap(this.filters['showLabels']);
        }
        this.setExportUrls(this.filters)
      }
      this.loggedInUser = this.authService.getUser();
      this.customerID = this.loggedInUser.customer.id;
      // this.downloadableLink = environment.baseUrl + '/iof/fleet_xls?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;


      const appendExport = 'trackVehicle=false&showLabels=null&automaticZoom=false&fleet_id=&type_id=&vehicle_id=&category_id=&search_key=&maintenance_status_id=&poi_id=&zone_id=&route_id=&shift_id=&stop_time=&track_date=&start_time=&end_time=&playBackTimeInterval=&poi_name_custom=&limit=&offset=&order_by=&order=';
      this.downloadableLink = appendExport + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
      // this.downloadXLS(this.downloadableLink)
      // this.downloadableLink1 = environment.baseUrl + '/iof/fleet_pdf?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.downloadableLink1 = appendExport + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
      // this.downloadPDF(this.downloadableLink1)
    });
    this.getDetailedReportListing(this.filtersDetailedReport);
    this.getTravelHistoryListing(this.filtersTravelHistory);
    this.getStatisticsListing(this.filtersStatistics);
    this.getStopsListing(this.filtersStops);
    this.getVehiclesForMap(null);
    this.getAllZones(null);

    this.keyUp.pipe(
      map(event => event.target['value']),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(newValue => {
      console.log("current tab = ", this.add_btn);
      console.log("newValue== ", newValue);
      this.searchText = newValue;

      if (this.searchText.length > 0 || this.searchText.length === 0) {
        // this.searchForm.get("search").setValue(this.searchText);
        console.log("this.search", this.searchText);
        if (this.add_btn == 0) {  //searching for vehicle tab
          this.search_by = 'Search by Vehicle';
          this.filtersDetailedReport.search_key = this.searchForm.get('search').value;
          this.getDetailedReportListing(this.filtersDetailedReport);
        } else if (this.add_btn == 1) { //searching for vehicle type tab
          this.filtersTravelHistory.search_key = this.searchForm.get('search').value;
          this.getTravelHistoryListing(this.filtersTravelHistory);
          this.search_by = 'Search by Vehicle';
        } else if (this.add_btn == 2) {  //searching for fleet tab
          this.search_by = 'Search by Driver';
          this.filtersStatistics.offset = 0;
          this.filtersStatistics.search_key = this.searchForm.get('search').value;
          this.getStatisticsListing(this.filtersStatistics);
        } else if (this.add_btn == 3) {
          this.search_by = 'Search by Stop Name';
          this.filtersStops.search_key = this.searchForm.get('search').value;
          this.getStopsListing(this.filtersStops);
        } else {
          console.log("inside else condition of search input")
        }

      }
    });

    if (this.loggedInUser['package'][0]?.package_id == this.packageType.png) {
      this.widgetData = [
        { name: 'Playback', icon: 'fa fa-forward', route: '/iol/quick-view' },
        { name: 'Refresh', icon: 'fa fa-refresh', route: '/iol/fleets', reload: true },
        {
          name: 'Export', icon: 'fa fa-download', export: true,
          subNav: [
            { name: 'PDF', target: true, url: environment.baseUrl + '/iof/fleet_pdf?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone, dashboard_Type: 'fleet' },
            { name: 'XLS', target: true, url: environment.baseUrl + '/iof/fleet_xls?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone, dashboard_Type: 'fleet' }
          ]
        },
        {
          name: 'Share',
          shareUrls:
          {
            pdf: environment.baseUrl + '/iof/fleet_pdf?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone,
            xls: environment.baseUrl + '/iof/fleet_xls?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          icon: 'fa fa-share-alt',
          subNav: [{ name: 'Whatsapp', route: "", page: 'fleet' }, { name: 'Email', route: '', page: 'fleet' }]
        },
        { name: 'Manage', icon: 'ri-exchange-line', route: '/iol/admin/truck', target: true, url: 'http://52.178.0.56/admin', queryParam: true },
        { name: 'Geozones', icon: 'fa fa-location-arrow', route: '/iol/admin/territory' },
        { name: 'history', icon: 'fa fa-history', route: '', scrollToDiv: true },
      ]
    }

  }

  onSearch(form: Object) {

  }

  setExportUrls(filters) {
    if (filters) {
      var query = Object.keys(this.filters).map(key => key + '=' + this.filters[key]).join('&');

      // const urlAppend = `is_poi=${filters.is_poi}&poi_value=${filters.poi_id}&poi_value_id=${filters.driver_id}&search=${filters.driver_group}`
      setTimeout(() => {
        // this.downloadableLink = environment.baseUrl + '/iof/fleet_xls?' + query + '&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        // this.downloadableLink1 = environment.baseUrl + '/iof/fleet_pdf?' + query + '&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

        this.downloadableLink = query + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.downloadableLink1 = query + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

        // this.downloadXLS(this.downloadableLink);
        // this.downloadPDF(this.downloadableLink1)
      }, 200);

      // this.downloadableLink = environment.baseUrl + '/iof/fleet_xls?customer_id=' + this.customerID + this.filters +'&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
      // this.downloadableLink1 = environment.baseUrl + '/iof/fleet_pdf?customer_id=' + this.customerID + this.filters + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

    }
  }

  ngAfterViewInit() {
    const mapProp = GoogleMapModel.getMapProp();
    // console.log("this.gmapElement.nativeElement", this.gmapElement.nativeElement)
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    // console.log("this.map-----", this.map)
    this.mapZoom = this.map.getZoom();
  }

  zoomMapToVehicle(vehicle) {
    if (!vehicle) {
      return;
    }
    setTimeout(() => {
      let selectedVehicle = this.trucks.filter(function (truckId) {
        return truckId.id === vehicle.id;
      });
      let lat, lng;
      if (selectedVehicle[0] && selectedVehicle[0]['signalRresponse']) {
        lat = selectedVehicle[0]['signalRresponse']['lat'];
        lng = selectedVehicle[0]['signalRresponse']['lon'];
      } else {
        lat = selectedVehicle[0]['last_latitude'];
        lng = selectedVehicle[0]['last_longitude'];
      }
      if (lat && lng) {
        this.zoomToMarker({ lat: lat, long: lng });
      }
    }, 500);
  }

  loadDashboardCards(module, dashboardId) {
    this.entityService.getDashboardCards(module, dashboardId).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.cardsArray = apiResponse.data.card;
        this.graphsArray = apiResponse.data.graph;
        // console.log(this.cardsArray, this.graphsArray);
      }
    })
  }

  convertUnixToLocal(dateTime) {
    return DateUtils.getLocalMMDDYYYYhhmmss(dateTime)
  }

  getVehiclesForMap(filters) {
    this.entityService.getFleetVehiclesForMap(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.mapData = apiResponse['data'].data;
        if (this.mapData && this.mapData.length > 0) {
          this.trucks = [...this.mapData, ...this.trucks];
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })
  }

  getVehiclesListing(filters) {
    this.loadingFilter = true;
    this.mapLoader = {
      visibility: this.loadingFilter,
      dataError: true
    }
    // if (!filters.search) {
    //   filters.search = '';
    // }
    // if (!filters.poi_id) {
    //   filters.poi_id = '';
    // }
    // if (!filters.is_poi) {
    //   filters.is_poi = '';
    // }
    // if (!filters.poi_value) {
    //   filters.poi_value = '';
    // }
    // if (!filters.poi_value_id) {
    //   filters.poi_value_id = '';
    // }
    // if (!filters.zone_id) {
    //   filters.zone_id = '';
    // }
    this.entityService.getFleetVehicles(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.loadingFilter = false;
        this.mapLoader = {
          visibility: this.loadingFilter,
          dataError: false
        }
        this.dataSource = apiResponse['data'].data;

        localStorage.setItem('vehiclesListing', JSON.stringify(this.dataSource));

        this.totalLength = apiResponse['data'].count;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      } else {
        this.mapLoader = {
          visibility: this.loadingFilter,
          dataError: false
        }
        this.swalService.getErrorSwal(apiResponse.message);
      }
    })
  }

  activeTabFuction(index) {
    this.add_btn = index.index;
    // console.log("this.add_btn== ", this.add_btn);
    if (this.add_btn == 0) {  //searching for vehicle tab
      this.search_by = 'Search by Vehicle';
      this.searchForm.reset();
      this.filtersDetailedReport.search_key = '';
      this.getDetailedReportListing(this.filtersDetailedReport);
    } else if (this.add_btn == 1) { //searching for vehicle type tab
      this.searchForm.reset();
      this.filtersTravelHistory.search_key = '';
      this.getTravelHistoryListing(this.filtersTravelHistory);
      this.search_by = 'Search by Vehicle';
    } else if (this.add_btn == 2) {  //searching for fleet tab
      this.searchForm.reset();
      this.search_by = 'Search by Driver';
      this.filtersStatistics.search_key = '';
      this.getStatisticsListing(this.filtersStatistics);
    } else if (this.add_btn == 3) {
      this.searchForm.reset();
      this.search_by = 'Search by Stop Name';
      this.filtersStops.search_key = '';
      this.getStopsListing(this.filtersStops);
    }
  }

  getDetailedReportListing(filters) {
    this.entityService.getFleetVehicles(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.dataSourceDetailedReport = apiResponse['data'].data;
        this.totalLengthDetailedReport = apiResponse['data'].count;
        this.dataSourceDetailedReport.sort = this.sortDetailedReport;
        this.dataSourceDetailedReport.paginator = this.paginatorDetailedReport;
      }
    })
  }

  getTravelHistoryListing(filters) {
    this.showIndeterminateProgress = true;
    // let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search_key=${filters.search_key}`;
    this.entityService.getTravelHistory(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.dataSourceTravelHistory = apiResponse['data'].data;
        this.totalLengthTravelHistory = apiResponse['data'].count;
        this.dataSourceTravelHistory.sort = this.sortTravelHistory;
        this.dataSourceTravelHistory.paginator = this.paginatorTravelHistory;
        this.showIndeterminateProgress = false;
      }
    })
  }

  getStatisticsListing(filters) {
    this.showIndeterminateProgress = true;
    let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&start_datetime=${filters.start_datetime}&end_datetime=${filters.end_datetime}&search_key=${filters.search_key}`;
    this.entityService.getStatistics(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.showIndeterminateProgress = false;
        this.dataSourceStatistics = apiResponse['data'].data;
        this.totalLengthStatistics = apiResponse['data'].count;
        this.dataSourceStatistics.sort = this.sortStatistics;
        this.dataSourceStatistics.paginator = this.paginatorStatistics;
      }
    })
  }

  getStopsListing(filters) {
    this.showIndeterminateProgress = true;
    // let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search_key=${filters.search_key}`;
    this.entityService.getStops(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.showIndeterminateProgress = false;
        this.dataSourceStops = apiResponse['data'].data;
        this.totalLengthStops = apiResponse['data'].count;
        this.dataSourceStops.sort = this.sortStops;
        this.dataSourceStops.paginator = this.paginatorStops;
      }
    })
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
        if (element.territory) {
          this.drawTerritory(element.territory, element.name)
        }
      });
    }
  }


  filterIdsFromJSON() {
    if (this.filters && this.filters['fleet_id']) {
      this.filters['fleet_id'] = this.filters['fleet_id'].id;
    }
    if (this.filters && this.filters['poi_id']) {
      if (this.filters['poi_id'].id) {
        this.filters['poi_id'] = this.filters['poi_id'].id;
      } else {
        this.filters['poi_id'] = this.filters['poi_id'];
      }
    }
    if (this.filters && this.filters['zone_id']) {
      if (this.filters['zone_id'].id) {
        this.filters['zone_id'] = this.filters['zone_id'].id;
      } else {
        this.filters['zone_id'] = this.filters['zone_id'];
      }
    }
    if (this.filters && this.filters['route_id']) {
      this.filters['route_id'] = this.filters['route_id'].id;
    }
  }


  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;

    // add code here //add order & order_by in downloadableLink

    this.getVehiclesListing(this.filters);
  }

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getVehiclesListing(this.filters);
  }

  sortDataDetailedReport(event) {
    this.filtersDetailedReport.order_by = event.active;
    this.filtersDetailedReport.order = event.direction;
    this.getDetailedReportListing(this.filtersDetailedReport);
  }

  onPaginateChangeDetailedReport(event) {
    this.filtersDetailedReport.offset = (event.pageIndex * event.pageSize);
    this.getDetailedReportListing(this.filtersDetailedReport);
  }

  sortDataTravelHistory(event) {
    this.filtersTravelHistory.order_by = event.active;
    this.filtersTravelHistory.order = event.direction;
    this.getTravelHistoryListing(this.filtersTravelHistory);
  }

  onPaginateChangeTravelHistory(event) {
    this.filtersTravelHistory.offset = (event.pageIndex * event.pageSize);
    this.getTravelHistoryListing(this.filtersTravelHistory);
  }

  sortDataStatistics(event) {
    this.filtersStatistics.order_by = event.active;
    this.filtersStatistics.order = event.direction;
    this.getStatisticsListing(this.filtersStatistics);
  }

  onPaginateChangeStatistics(event) {
    this.filtersStatistics.offset = (event.pageIndex * event.pageSize);
    this.getStatisticsListing(this.filtersStatistics);
  }

  sortDataStops(event) {
    this.filtersStops.order_by = event.active;
    this.filtersStops.order = event.direction;
    this.getStopsListing(this.filtersStops);
  }

  onPaginateChangeStops(event) {
    this.filtersStops.offset = (event.pageIndex * event.pageSize);
    this.getStopsListing(this.filtersStops);
  }

  filtersStatisticsListing(dateRange) {
    this.filtersStatistics.start_datetime = DateUtils.getUtcDateTimeStart(dateRange[0][0])
    this.filtersStatistics.end_datetime = DateUtils.getUtcDateTimeStart(dateRange[0][1])
    this.getStatisticsListing(this.filtersStatistics);
  }

  filtersStopsListing(dateRange) {
    this.filtersStops.start_datetime = DateUtils.getUtcDateTimeStart(dateRange[0][0])
    this.filtersStops.end_datetime = DateUtils.getUtcDateTimeStart(dateRange[0][1])
    this.getStopsListing(this.filtersStops);
  }

  setupLocations() {
    this.locations = this.trucks.map(item =>
      new EntityWithIconLocation(item.id, item.last_latitude, item.last_longitude,
        [new Item('Name', item.name),
        new Item('Status', item.online_status),
        new Item('Speed', ((item.last_speed > 5) ? Math.round(item.last_speed) : 0) + ' km/h'),
        new Item('Vehicle Type', item['vehicle_type']),
        new Item('Last Updated', DateUtils.getLocalMMDDYYYYhhmmss(item['last_updated']))
          // new Item('Location', (item['location_address']) ? item['location_address'] : '-')
        ], item['marker']));
    this.generateMapView(null, this.trucks);
  }

  generateMapView(i?, trucks?) {
    const colors = Colors.getColors();
    let colorIndex = -1;
    if (i || i === 0) {
      const newPos = new google.maps.LatLng(this.locations[i].latitude, this.locations[i].longitude);
      this.updateInfoWindow(i);
      if (this.signalRstarted[i] > 1 && trucks[i].signalRresponse['spd'] > 5) {
        // this.markers[this.locations[i].entity_id].setMap(null);
        if (this.markers[this.locations[i].entity_id]) {
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
      }
    } else {
      this.trafficLayer();
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
      if (this.locations.length === 1) {
        setTimeout(() => {
          this.map.setZoom(12);
        }, 800);
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
          value = 'Online';
        } else {
          clas = 'label-danger';
          value = 'Offline';
        }
        iValue += `&nbsp;<span ><span  class="label margin-top-3 ${clas} pull-right">${(value ? value : '-')}</span></span></th></tr></thead>`;
      }

    });
    iValue += '</tbody> </table>';
    if (this.infoWindows[this.locations[i].entity_id]) {
      this.infoWindows[this.locations[i].entity_id].setContent(iValue);
    }
  }

  // showLabelsOnMap (show) {
  //   this.map.displayAllInfoWindows();
  // }

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

  // SignalR with Azure Function
  /*
  setupSignalR() {
    if (this.signalRService && this.signalRService.mxChipData) {
      this.signalRSubscription = this.signalRService.mxChipData.subscribe(response => {

        const signalRresponse = JSON.parse(response) as SignalRresponse;

        console.log('signalResponse', signalRresponse);
        if (signalRresponse && Number(signalRresponse.rtp) !== 1) {
          return;
        }

        for (let i = 0; i < this.trucks.length; i++) {
          if (this.trucks[i].device_id === signalRresponse.id) {
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
              const oldLatLng = new google.maps.LatLng(this.trucks[i].signalRresponse?.lat, this.trucks[i].signalRresponse?.lon);

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

              if (this.filters['vehicle_id'] && this.trackVehicle) {
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
    }
  }*/


  setupSignalR() {
    this.connection.start()
      .then((c) => {
        this.trucks.forEach((item, i) => {
          this.setSignalRresponse(i);
          this.connection.invoke('register', item.device_id)
            .catch((err: any) => console.warn(item.device_id + ' Failed to invoke. Error occurred. Error:' + err));
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
            if (this.trucks[i].device_id === signalRresponse.id) {
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

                if (this.filters['vehicle_id'] && this.trackVehicle) {
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

              this.dataSource[i].signalRresponse = this.trucks[i].signalRresponse;

            }
          }
        });
      });
  }

  verifySignalRData(signalRresponse, i) {
    return (signalRresponse.lat !== 0 && signalRresponse.lon !== 0) &&
      (!isNullOrUndefined(signalRresponse.lat) && (!isNullOrUndefined(signalRresponse.lon)))
      &&
      (signalRresponse.t !== '-' && !isNullOrUndefined(signalRresponse.lat) && isValid(new Date(signalRresponse.t)));
  }

  updateLocation(i, signalRresponse, oldLatLng, trucks, checkDistance = true) {
    const newLatLng = new google.maps.LatLng(signalRresponse.lat, signalRresponse.lon);
    const differenceInDistance = (google.maps.geometry.spherical.computeDistanceBetween(newLatLng, oldLatLng));
    const tooLongOrtooShortDistance = 20 < differenceInDistance && differenceInDistance < 200000;
    if (checkDistance) {
      // if (tooLongOrtooShortDistance || isNaN(differenceInDistance)) {
      this.locations[i].last_longitude = this.locations[i].longitude;
      this.locations[i].last_latitude = this.locations[i].latitude;
      this.locations[i].latitude = this.trucks[i].signalRresponse.lat;
      this.locations[i].longitude = this.trucks[i].signalRresponse.lon;
      this.generateMapView(i, trucks);
      // }
    }

    this.locations[i].infoList = [
      new Item('Name', this.trucks[i].name),
      new Item('Status', this.trucks[i].online_status),
      new Item('Speed', ((this.trucks[i].signalRresponse.spd > 5 && tooLongOrtooShortDistance) ? Math.round(this.trucks[i].signalRresponse.spd) : ((this.trucks[i].signalRresponse.spd && !signalRresponse.lat && !signalRresponse.lon) ? Math.round(this.trucks[i].signalRresponse.spd) : 0)) + ' km/h'),
      // new Item('Fuel', (this.trucks[i].signalRresponse.vol ? (this.trucks[i].signalRresponse.vol).toFixed(2) : 0) + ' gal'),
      // new Item('Temperature', ((this.trucks[i].signalRresponse.temp) ? this.trucks[i].signalRresponse.temp : 0) + ' °C'),
      // new Item('Net Weight', this.trucks[i].signalRresponse.nw + ' kg'),
      new Item('Vehicle Type', this.trucks[i]['vehicle_type']),
      new Item('Last Updated', DateUtils.getMMDDYYYYhhmmssA(this.trucks[i].signalRresponse.t))
      // new Item('Locations',  (trucks[i]['location_address'] ? trucks[i]['location_address'] : '-'))
    ];
    this.updateInfoWindow(i);
  }

  drawTerritory(cords, title?, opts?, height = 250) {
    // this.resetMap();
    const bounds = this.bounds;
    // let bounds = new google.maps.LatLngBounds();
    const arr = [];
    let cordsArray = [];
    if (cords.radius) {
      const bounds = new google.maps.LatLngBounds();
      const obj = cords;
      this.map.setCenter(new google.maps.LatLng(obj.lat, obj.lng));
      const circleShape = new google.maps.Circle({
        paths: obj,
        strokeColor: "#000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#000",
        fillOpacity: 0.35,
        center: new google.maps.LatLng(obj.lat, obj.lng),
        radius: obj.radius
      });

      circleShape.setMap(this.map);
      // this.map.setZoom(12);
    } else {
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

  /*Map*/
  createMarkers(pos, i?, angle = 0) {
    let truckIcon = {
      url: this.trucks[i]['marker'],
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
          value = 'Online';
        } else {
          clas = 'label-danger';
          value = 'Offline';
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

    marker.addListener('mouseover', function () {
      infowindow.open(this.map, this);
    });
    marker.addListener('mouseout', function () {
      infowindow.close();
    });

    return marker;
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

  trafficLayer() {
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(this.map);
  }

  zoomToMarker(latLngObj, zoomLevel = 18) {
    let latlng;
    if (typeof (latLngObj) === 'string') {
      latlng = this.getLatLngFromString(latLngObj);
    } else {
      latlng = new google.maps.LatLng(latLngObj.lat, latLngObj.long);
    }
    this.map.setZoom(zoomLevel);
    this.map.panTo(latlng);
  }

  getLatLngFromString(ll) {
    const latlng = ll.split(/, ?/);
    // console.log(ll);
    const loc = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
    // console.log('Google loc:'+ loc.lat()+','+loc.lng());
    return new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
  }

  getSelectedWidgetOption(event) {
    if (event.reload) {
      this.filters = { limit: 10, offset: 0, order_by: '', order: '' };

      this.getVehiclesListing(this.filters);
      this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
      this.getVehiclesForMap(this.filters);
      this.resetFilters = true;
      this.poiField = null;
      this.vehicleFleet = null;
      setTimeout(() => this.resetFilters = false, 0);
    }
    if (event.scroll) {
      this.scrollToTabs.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
    }
  }

  ExportVehicleListAsCSV() {
    this.filters = { limit: 0, offset: 0, order_by: '', order: '' };
    this.entityService.getFleetVehiclesForMap(null).subscribe(response => {
      if (response.data.data) {
        const dataWithoutId = response.data.data.map(({ id, ...item }) => item);
        const output = this.srvUtillsService.addId(dataWithoutId);
        const result = output.map(({ id, name, last_speed,
          assigned_driver, distance_travelled, poi_name, poi_time }) => ({
            id, name, last_speed,
            assigned_driver, distance_travelled, poi_name, poi_time
          }));
        // this function is used to create csv from json
        this.srvUtillsService.exportToCsv(this.csvCols, 'vechile_list.csv', result)
      }
    }, error => {
      console.error(error);
    })
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscription$) {
      this.subscription$.unsubscribe();
      this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
    }
    if (this.connection) {
      this.connection.stop();
    }
    if (this.signalRSubscription) {
      this.signalRService.close();
      this.signalRSubscription.unsubscribe();
    }
  }


  downloadXLS(dowwn) { //async

    this.entityService.downloadFleetDashboardXLS(dowwn).subscribe((apiResponse: any) => {
      console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Fleets-Report.xls')
    })


    // const httpOptions = {
    //   responseType: 'blob',
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json', 
    //     'Access-Control-Allow-Origin':'*', 
    //     'Access-Control-Allow-Credentials': 'true'
    //   })
    // };

  }

  downloadPDF(dowwn) {
    this.entityService.downloadFleetDashboardPDF(dowwn).subscribe((apiResponse: any) => {
      console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Fleets-Report.pdf')
    })
  }


}


