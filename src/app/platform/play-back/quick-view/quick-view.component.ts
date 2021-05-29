import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { isValid } from 'date-fns';
import { Subscription } from 'rxjs';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { FiltersService } from 'src/app/core/services/filters.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { environment } from 'src/environments/environment';
import { isNullOrUndefined } from 'util';
import { AppConfig } from '../../../app.config';
import { CBMEnum, EntityType } from '../../../core/enum/entity-type.enum';
import { LoginApiResponse, TestApiResponse } from '../../../core/model/api.response';
import { AuthService } from '../../../core/services/auth.service';
import { HttpController } from '../../../core/services/loading-controller';
import { SwalService } from '../../../core/services/swal.service';
import { BroadcastEventListener, SignalRConnection } from '../../../core/wfw-ngx-signalr';
import { GoogleMapModel } from '../../../model/GoogleMapModel';
import { DropDownItemVehicle } from '../../../model/quick-view/dropDownItemVehical';
import { AppLoader } from '../../data/model/app-loader';
import { ConvertToGallon } from '../../data/model/covert_to_gallon';
import { DropDownItem } from '../../data/model/dropdown-item';
import { Item } from '../../data/model/item';
import { EntityWithIconLocation, TrailMarkerResponse, VehicleSummaryResponse } from '../../data/model/location';
import { TruckResponse } from '../../data/response/entity-response';
import { EntitySummaryResponse } from '../../data/response/EntitySummaryResponse';
import { TruckTypeEnum } from '../../enum/iol-entity.enum';
import { UserRoleEnum } from '../../enum/user-role.enum';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { SignalRresponse } from '../../model/signalRresponse';
import { DatatableService } from '../../services/datatable.service';
import { EntityService } from '../../services/entity.service';
import { FormService } from '../../services/FormService';
import { GotoPageService } from '../../services/goto-page.service';
import { TruckService } from '../../services/truck.service';
import { ResizeDatatableService } from '../../shared/resize-datatable.service';
import { BrandingService } from '../../shared/services/branding.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { SignalRService } from 'src/app/Services/signal-r.service';

export enum TruckPrimaryFiltersEnum {
  By_Gateway_Status = 'online_status',
  By_Truck_Type = 'entity_sub_type',
  By_Workshop_Status = 'maintenance_id'
}

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.css']
})

export class QuickViewComponent implements OnInit, OnDestroy, AfterViewInit {
  items = [{ label: 'Playback', url: null }];
  home = { label: 'Dashboard', url: '/iol' };

  displayedColumnsDetailedReport = ['name', 'assigned_driver', 'last_updated', 'current_speed'];
  // displayedColumnsTravelHistory = ['name', 'driver', 'distance', 'time', 'time_to', 'location', 'zone'];
  displayedColumnsTravelHistory = ['vehicle', 'driver', 'distance_travelled', 'timestamp', 'timestamp_to', 'geocode', 'zone'];
  displayedColumnsStatistics = ['employee_id', 'name', 'total_violations', 'saftey_score_card', 'total_jobs'];
  displayedColumnsStops = ['truck_name', 'driver_name', 'location', 'duration'];

  theme;
  filters = {};
  filtersObject: any;
  filtersDetailedReport = { limit: 10, offset: 0, order_by: '', order: '' };
  filtersTravelHistory = { limit: 10, offset: 0, order_by: '', order: '' };
  filtersStatistics = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '' };
  filtersStops = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '' };
  dataSourceDetailedReport: any;  //DataSource of Detail Report
  dataSourceTravelHistory: MatTableDataSource<any>;   //DataSource of Travel History
  dataSourceStatistics: any;       //DataSource of Statistics
  dataSourceStops: any;           //DataSource of Source Stops

  totalLengthDetailedReport = 0;
  totalLengthTravelHistory = 0;
  totalLengthStatistics = 0;
  totalLengthStops = 0;
  loadingFilter = true;
  firstTime = true;

  signalRSubscription = new Subscription;

  @ViewChild("scrollToTop") scrollToTop: ElementRef;
  @ViewChild('trailMap') map: GoogleMapComponent;
  @ViewChild(MatSort) sortDetailedReport: MatSort;
  @ViewChild('paginatorDetailedReport') paginatorDetailedReport: MatPaginator;

  @ViewChild('sortTravelHistory') travelHistorySort: MatSort;
  @ViewChild('paginatorTravelHistory') travelHistoryPaginate: MatPaginator;

  @ViewChild(MatSort) sortStatistics: MatSort;
  @ViewChild('paginatorStatistics') paginatorStatistics: MatPaginator;
  @ViewChild(MatSort) sortStops: MatSort;
  @ViewChild('paginatorStops') paginatorStops: MatPaginator;

  /// old code -
  infoWindowsOpen = [];
  searchPlaceHolder: string;
  enableSearch: boolean;
  activeTab = 1;
  showIndeterminateProgress: boolean;
  optimizedCall: any;

  $subscription = new Subscription;
  $subscription1 = new Subscription;

  appLoader = new AppLoader();
  private connection: SignalRConnection;
  private subscription: Subscription;
  public trucks: TruckResponse[] = [];
  public trucksSummaryResponse: EntitySummaryResponse = new EntitySummaryResponse();
  selectedTruck;
  locations: EntityWithIconLocation[] = [];
  selectedDevice = 0;

  entityId = null;
  selected: any = [];
  speed_Selected: any = 3;
  inputValue = '';
  regNum = '';
  rows = [];
  temp: any[] = [];
  expanded = {};

  bounds1 = new google.maps.LatLngBounds();
  toggledRow = null;
  expandedId = [];

  violationMarkers = [];
  movingMarker = {};
  violationInfoWindows = [];
  trailDateRange: any[];
  reportDate;
  numDeltas = 100;
  delay = 10;

  i = 0;
  deltaLat;
  deltaLng;

  isNullOrUndefined = isNullOrUndefined;
  public barChartLabels = [];

  // copied code from fleet component
  mapZoom;
  markers = {};
  infoWindows = {};
  marker;
  poly = [];
  bounds = new google.maps.LatLngBounds();
  shapes = {};
  myInfowindow = new google.maps.InfoWindow();
  @ViewChild('gmap') gmapElement: any;
  maps: google.maps.Map;
  mapLoader = new AppLoader();
  // end

  public barChartData = [
    { data: [], label: CBMEnum._240litres },
    { data: [], label: CBMEnum._1cbm },
    { data: [], label: CBMEnum._2cbm },
    { data: [], label: CBMEnum._5cbm },
    { data: [], label: CBMEnum._8cbm },
    { data: [], label: CBMEnum._10cbm },
    { data: [], label: CBMEnum._12cbm },
    { data: [], label: CBMEnum._14cbm },
    { data: [], label: CBMEnum._18cbm },
    { data: [], label: CBMEnum._20cbm },
    { data: [], label: CBMEnum._26cbm },
    { data: [], label: CBMEnum._30cbm },
    { data: [], label: CBMEnum._MedicalWaste },
  ];

  @ViewChild('table') table: any;
  @ViewChild('shiftTable') shiftTable: any;
  @ViewChild('monthlyTable') monthlyTable: any;

  // map: google.maps.Map;

  signalRstarted = [];
  truckTypes = [];
  maintenancesStatus = [];
  //filters = [
  //  { label: 'By Status', value: TruckPrimaryFiltersEnum.By_Gateway_Status },
  //  { label: 'By Truck Type', value: TruckPrimaryFiltersEnum.By_Truck_Type },
  //  { label: 'By Workshop Status', value: TruckPrimaryFiltersEnum.By_Workshop_Status },
  //];


  secondaryFilters = [];
  selectedFilter;
  selectedSecondaryFilter;
  Icons = ['assets/images/iol/sedan.svg#markerOne'];
  customerDevices = [];
  is_customer_client = false;
  user;

  isValidMonthDateGiven = false;

  shiftDurationPieChartLabel = [];
  shiftDurationPieChartData = [];
  isAuthorized = false;

  showMap = false;
  public pieChartLabels = [['Download', 'Sales'], 'In-Store Sales', 'Mail Sales'];
  public pieChartData = [[300, 200], 500, 100];
  trailLoader = new AppLoader();
  resetFilters = false;
  sidebarOpened: boolean = true;

  st_date;
  end_date;
  stop_time;
  played: boolean = false;
  show_controls: boolean = false;
  playbackLoader = false;
  state: string = null;
  speed_marker: number = 500;
  zoomLevel = 15;
  dateRange;
  startDate;
  endDate;
  packageType;

  loggedInUser;
  customerID;
  sidebarCheck;

  downloadableLink;
  downloadableLink1;

  constructor(private route: ActivatedRoute,
    public router: Router,
    private swalService: SwalService,
    private authService: AuthService,
    private datatableService: DatatableService,
    public gotoService: GotoPageService,
    private formService: FormService,
    public resizeDatatableSerivce: ResizeDatatableService,
    private truckService: TruckService,
    private brandingService: BrandingService,
    private entityService: EntityService,
    private filtersService: FiltersService,
    private drawerService: DrawerService,
    private signalRService: SignalRService
  ) {
    this.user = this.authService.getUser();
    this.is_customer_client = this.user.user_role_id === UserRoleEnum.CustomerClient;
    this.theme = this.brandingService.styleObject();
  }

  onSearch() {
    // // console.log("this.filtersobject", this.filtersObject);

    if (!this.filtersObject) {
      this.swalService.getWarningSwal("Please select vehicle");
      return;
    }
    if (!this.filtersObject?.vechicleId) {
      this.swalService.getWarningSwal("Please select vehicle");
      return;
    }
    if (!this.filtersObject?.start_time && !this.filtersObject?.end_time) {   //!this.filtersObject?.playBackTimeInterval
      this.swalService.getWarningSwal("Please select time interval");
      return;
    }

    if (this.filtersObject?.start_time && this.filtersObject?.end_time && this.filtersObject?.start_time >= this.filtersObject?.end_time) {
      this.swalService.getErrorSwal('End date should be greater than start date!');
      return false;
    }

    this.playbackLoader = true;
    this.setupReport(this.filtersObject);
    this.getTravelHistoryListing(this.filtersTravelHistory);

  }

  onClearSearch() {
    this.state = "Stopped";
    this.played = false;
    this.map.stopAnimation();
    this.state = null;
    this.filtersObject.vechicleId = '';
    // this.filtersObject.start_time = null;
    // this.filtersObject.end_time = null;
    this.resetFilters = true;
    this.map.resetMap();
    this.show_controls = false;
    setTimeout(() => {
      this.resetFilters = false;
    }, 1000);
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    // this.signalRService.init();

    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.packageType = PackageType;
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;


    this.$subscription = this.filtersService.getPlaybackPolyValue().subscribe(data => {
      if (data) {
        if (data.zone_id && data.zone_id.id) {
          data.zone_id = data.zone_id.id;
          data.is_poi = true;
          data.poi_id = data.poi_id.name
        }
        this.getVehiclesForMap(data);
        this.filterIdsFromJSON();
      }
    });

    this.$subscription1 = this.filtersService.getPlaybackValue().subscribe(data => {
      if (data) {
        this.selectedDevice = data.vechicleId;
        this.filtersObject = data;
        if (data.start_time_range) {
          if (data.start_time_range === DaysRange.today) {
            this.dateRange = [DateUtils.getStartofToday(), DateUtils.getEndofToday()];
          }
          if (data.start_time_range === DaysRange.yesterday) {
            this.dateRange = [DateUtils.getLastDay(), DateUtils.getEndOfYesterday()];
          }
          if (data.start_time_range === DaysRange.week) {
            this.dateRange = [DateUtils.getStartOfThisWeek(), DateUtils.getEndofToday()];
          }
          if (data.start_time_range === DaysRange.month) {
            const startMonth = DateUtils.now();
            startMonth.setDate(1);
            startMonth.setHours(0);
            startMonth.setMinutes(0);
            startMonth.setSeconds(0);
            this.dateRange = [startMonth, DateUtils.getEndofToday()];
          }
          this.startDate = (this.dateRange[0]);
          this.endDate = (this.dateRange[1]);

          this.filtersObject.start_time = this.startDate;
          this.filtersObject.end_time = this.endDate;
          // this.setupReport(this.filtersObject);
          data.start_time_range = '';
        } else if (!data.start_time_range && (data.start_time && data.end_time) && this.selectedDevice) {
          // if (data.start_time >= data.end_time) {
          //   this.swalService.getErrorSwal('End date should be greater than start date!');
          //   return false;
          // }
          // this.setupReport(this.filtersObject);
        }
      }
    });

    const mapProp = GoogleMapModel.getMapProp();
    this.connection = this.route.snapshot.data['connection'];
    this.getTrucks();
    this.connection.status.subscribe((s) => console.warn('lala', s.name));
    this.getDropDownData(null);




    this.downloadableLink = 'limit=' + this.filtersTravelHistory.limit + '&offset=' + this.filtersTravelHistory.offset + '&order=' + this.filtersTravelHistory.order + '&order_by=' + this.filtersTravelHistory.order_by + '&search_key=&truck_id=' + this.selectedDevice + '&start_datetime=' + this.st_date + '&end_datetime=' + this.end_date + '&export=excel&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = 'limit=' + this.filtersTravelHistory.limit + '&offset=' + this.filtersTravelHistory.offset + '&order=' + this.filtersTravelHistory.order + '&order_by=' + this.filtersTravelHistory.order_by + '&search_key=&truck_id=' + this.selectedDevice + '&start_datetime=' + this.st_date + '&end_datetime=' + this.end_date + '&export=pdf&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.connection) {
      this.connection.stop();
    }
    if (this.$subscription) {
      this.$subscription.unsubscribe();
    }
    if (this.$subscription1) {
      this.$subscription1.unsubscribe();
    }

    this.filtersService.setValue(null);

    if (this.signalRSubscription) {
      this.signalRService.close();
      this.signalRSubscription.unsubscribe();
    }
  }

  navigateSideBar(state) {
    this.sidebarOpened = state;
  }

  ngAfterViewInit(): void {

    if (this.scrollToTop.nativeElement) {
      this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
    }

    this.maps = new google.maps.Map(this.gmapElement?.nativeElement, {
      zoom: 14,
      center: { lat: 25.3548, lng: 51.1839 },
      mapTypeId: 'roadmap'
    });

  }

  convertUnixToLocal(dateTime) {
    return DateUtils.getLocalMMDDYYYYhhmmss(dateTime)
  }

  /* Get Calls Start*/
  getTrucksSummary(): void {
    // this.inputValue = '';
    this.searchPlaceHolder = 'Loading...';
    // this.enableSearch = true;
    // this.showIndeterminateProgress = true;
    this.trucksSummaryResponse = new EntitySummaryResponse();
    const params1 = {
      type_id: EntityType.TRUCK
    };
    if (this.is_customer_client) {
      params1['truck_ids'] = [10259, 10265];
    }
    this.truckService.getEntitySummary(params1)
      .subscribe(new class extends HttpController<LoginApiResponse<EntitySummaryResponse>> {
        onComplete(): void {
          this.context.searchPlaceHolder = 'Search By Name';
          this.context.enableSearch = false;
          this.context.showIndeterminateProgress = false;
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<EntitySummaryResponse>): void {
          // // console.log('summary', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.trucksSummaryResponse = apiResponse.response;
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
      );

  }

  isActive(item) {
    return this.speed_Selected === item;
  };

  mimickPageLoad() {
    this.signalRstarted = [];
    this.getTrucks();
  }

  getTrucks(): void {
    this.rows = [];
    this.trucks = [];
    const index_a = 0;
    const index_b = 100;
    this.inputValue = '';
    this.regNum = '';
    const results_remaining = true;
    this.enableSearch = true;
    this.optimized_trucks_call(index_a, index_b);
  }
  getDropDownData(value) {

    this.formService.getBinsData('get_entity_dropdown', { customer: this.authService.getUser().customer.id, entity: EntityType.TERRITORY })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          // // console.log('territories', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.territoriesList = apiResponse.response.map(
              item => new DropDownItem(item['id'], item['label'])
            );

          } else {
            // // console.log(apiResponse.message);
          }
        }
      }(this)
      );
    this.truckService.getCustomerDevicesFuel({ type_id: EntityType.TRUCK })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItemVehicle[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItemVehicle[]>): void {
          // // console.log('devices', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.customerDevices = apiResponse.response;
            if (!(value === null)) {
              this.context.customerDevices.push(value);
            }
          }
          else {
            // // console.log(apiResponse.message);
          }
        }

      }(this)
      );
    this.truckService.getPurchaseTypes({ option_key: 'payment_method' })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          // // console.log('purchase', apiResponse);

          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.purchaseTypes = apiResponse.response['option_values'];
          }
          else {
            // // console.log(apiResponse.message);
          }

        }
      }(this)
      );
    this.truckService.getPurchaseTypes({ option_key: 'trucktypes' })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          // // console.log('types', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.truckTypes = apiResponse.response['option_values'];
          }
          else {
            // // console.log(apiResponse.message);
          }

        }
      }(this)
      );
  }
  optimized_trucks_call(index_a, index_b) {
    const params = {
      type_id: EntityType.TRUCK,
      index_a: index_a,
      index_b: index_b
    };
    if (this.is_customer_client) {
      params['truck_ids'] = [10259, 10265];
    }
    this.optimizedCall = this.truckService.getEntities(params
    ).subscribe(new class extends HttpController<TestApiResponse<TruckResponse[]>> {
      onComplete(): void {
        if (this.context.results_remaining) {
          index_a += 100;
          index_b += 100;
          this.context.optimized_trucks_call(index_a, index_b);
        } else {
          this.context.searchPlaceHolder = 'Search By Name';
          this.context.enableSearch = false;
          this.context.showIndeterminateProgress = false;
        }
      }

      onError(errorMessage: string, err: any) {
        // do
        this.context.swalService.getErrorSwal(errorMessage);
        // console.log(errorMessage);
      }

      onNext(apiResponse: TestApiResponse<TruckResponse[]>): void {
        if (apiResponse.status === HttpStatusCodeEnum.Success) {
          this.context.results_remaining = apiResponse.remaining;
          this.context.rows = apiResponse.response;

          this.context.trucksSummaryResponse.entity_count = this.context.rows.length;
          this.context.trucksSummaryResponse.total_online = this.context.rows.filter(truck => truck.online_status === true).length;
          this.context.trucksSummaryResponse.total_in_maintenance = this.context.rows.filter(truck => truck.maintenance_status).length;

          this.context.trucks = [...this.context.rows, ...this.context.trucks];
          this.context.setupSignalR();
        }
        if (apiResponse.status === HttpStatusCodeEnum.Error) {
          this.context.swalService.getErrorSwal(apiResponse.message);

        }
        this.context.temp = this.context.rows;
      }
    }(this)
    );
  }


  expand() {
    // this.table.rowDetail.collapseAllRows();
    for (let i = 0; i < this.trucks.length; i++) {
      if (this.expandedId.indexOf(this.trucks[i].id) > -1) {
        this.table.rowDetail.toggleExpandRow(this.trucks[i]);
      }
    }
  }

  toggleExpandRow(row, event, expanded) {
    event.stopPropagation();
    this.table.rowDetail.toggleExpandRow(row, true);
    // adding the expanded row to row id on expanding and removing row id on collapse.
    const index = this.expandedId.indexOf(row.id);
    if (index > -1) {
      this.expandedId.splice(index, 1);
    } else {
      this.expandedId.push(row.id);
    }
  }

  updateFilter(event, params = "name") {
    this.regNum = '';
    const filters = {};
    let tempArr = [];
    if (!isNullOrUndefined(this.selectedSecondaryFilter) && this.inputValue !== '') {
      filters[params] = this.inputValue;
      if (this.selectedSecondaryFilter === '-') {
        tempArr = this.filterMaintenanceStatus();
      } else {
        filters[this.selectedFilter] = this.selectedSecondaryFilter;
        tempArr = this.trucks;
      }
      this.rows = this.datatableService.myMultiFilter(tempArr, filters);
    } else if (this.inputValue === '' && !isNullOrUndefined(this.selectedFilter) && !isNullOrUndefined(this.selectedSecondaryFilter)) {
      if (this.selectedSecondaryFilter === '-') {
        tempArr = this.filterMaintenanceStatus();
      } else {
        filters[this.selectedFilter] = this.selectedSecondaryFilter;
        tempArr = this.trucks;
      }
      this.rows = this.datatableService.myMultiFilter(tempArr, filters);
    } else {
      this.rows = this.datatableService.updateFilter(event.target.value, this.temp, [params]);
    }
    this.appLoader.visibility = false;
  }

  updateFilterRegNumber(event, params = "registration") {
    this.inputValue = '';
    const filters = {};
    let tempArr = [];
    if (!isNullOrUndefined(this.selectedSecondaryFilter) && this.regNum !== '') {
      filters[params] = this.regNum;
      if (this.selectedSecondaryFilter === '-') {
        tempArr = this.filterMaintenanceStatus();
      } else {
        filters[this.selectedFilter] = this.selectedSecondaryFilter;
        tempArr = this.trucks;
      }
      this.rows = this.datatableService.myMultiFilter(tempArr, filters);
    } else if (this.regNum === '' && !isNullOrUndefined(this.selectedFilter) && !isNullOrUndefined(this.selectedSecondaryFilter)) {
      if (this.selectedSecondaryFilter === '-') {
        tempArr = this.filterMaintenanceStatus();
      } else {
        filters[this.selectedFilter] = this.selectedSecondaryFilter;
        tempArr = this.trucks;
      }
      this.rows = this.datatableService.myMultiFilter(tempArr, filters);
    } else {
      this.rows = this.datatableService.updateFilter(event.target.value, this.temp, [params]);
    }
    this.appLoader.visibility = false;
  }

  private filterMaintenanceStatus() {
    return this.trucks.filter(function (currentValue, index, arr) {
      if (!isNullOrUndefined(currentValue['maintenance_status'])) {
        return true;
      }
    });
  }


  setupReport(data) {
    this.getReport(data);
  }

  verifySignalRData(signalRresponse, i) {
    return (signalRresponse.lat !== 0 && signalRresponse.lon !== 0) &&
      (!isNullOrUndefined(signalRresponse.lat) && (!isNullOrUndefined(signalRresponse.lon)))
      &&
      (signalRresponse.t !== '-' && !isNullOrUndefined(signalRresponse.lat) && isValid(new Date(signalRresponse.t)));
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
    this.trucks[i].signalRresponse['ignition_status'] = false;
    if (!isNullOrUndefined(this.trucks[i].volume_capacity)) {
      this.trucks[i].signalRresponse.vol = ConvertToGallon.convert_to_gallon(((this.trucks[i].last_volume || 0) / 100) * this.trucks[i].volume_capacity, true);
    }
    this.rows = this.trucks;
  }


  //SignalR with Azure Functions
  /*
  setupSignalR(){
    if (this.signalRService && this.signalRService.mxChipData) {
      this.signalRSubscription = this.signalRService.mxChipData.subscribe(response => {
        // // console.log(response);
        const signalRresponse = JSON.parse(response) as SignalRresponse;
        // // console.log('signalResponse', signalRresponse);
        if (signalRresponse && Number(signalRresponse.rtp) !== 1) {
          return;
        }
        for (let i = 0; i < this.trucks.length; i++) {
          if (this.trucks[i].device_id === signalRresponse.id) {
            this.trucks[i].online_status = true;
            this.trucksSummaryResponse.total_online = this.trucks.filter(truck => truck.online_status === true).length;
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
                DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t),
                signalRresponse.type,
                signalRresponse.nw,
                signalRresponse.gw
              );


              this.trucks[i].signalRresponse.vol = ConvertToGallon.convert_to_gallon(((this.trucks[i].signalRresponse.vol / 100) * this.trucks[i].volume_capacity));

              this.trucks[i].signalRresponse['ignition_status'] = (this.trucks[i].signalRresponse.spd > 5) || (this.trucks[i].signalRresponse.nw !== 1);
              this.trucks = [...this.trucks];

              this.map.updateLocation(i, signalRresponse, oldLatLng, this.trucks, true, this.signalRstarted);
              if (!isNullOrUndefined(this.inputValue) && this.inputValue.length > 0 || (!isNullOrUndefined(this.selectedSecondaryFilter))) {
                this.updateFilter({ target: { value: this.inputValue } });
              } else {
                this.rows = [...this.trucks];
              }
              if (AppConfig.DEBUG) {
                // console.log(this.trucks[i].signalRresponse);
              }
            }

          }
        }        
      });
    }
  } */

  setupSignalR() {
    this.connection.stop();
    this.connection.start()
      .then((c) => {
        this.trucks.forEach((bin, i) => {
          this.setSignalRresponse(i);
          // // console.log(bin.device_id, this.connection);
          this.connection.invoke('register', bin.device_id)
            .catch((err: any) => console.warn(bin.device_id + ' Failed to invoke. Error occurred. Error:' + err));
        });
        const newMessage = new BroadcastEventListener<any>('newMessage');
        // register the listener
        this.connection.listen(newMessage);

        // subscribe to event
        this.subscription = newMessage.subscribe((response: string) => {
          // // console.log(response);
          const signalRresponse = JSON.parse(response) as SignalRresponse;
          // // console.log('signalResponse', signalRresponse);
          if (signalRresponse && Number(signalRresponse.rtp) !== 1) {
            return;
          }
          for (let i = 0; i < this.trucks.length; i++) {
            if (this.trucks[i].device_id === signalRresponse.id) {
              this.trucks[i].online_status = true;
              this.trucksSummaryResponse.total_online = this.trucks.filter(truck => truck.online_status === true).length;
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
                  DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t),
                  signalRresponse.type,
                  signalRresponse.nw,
                  signalRresponse.gw
                );


                this.trucks[i].signalRresponse.vol = ConvertToGallon.convert_to_gallon(((this.trucks[i].signalRresponse.vol / 100) * this.trucks[i].volume_capacity));

                this.trucks[i].signalRresponse['ignition_status'] = (this.trucks[i].signalRresponse.spd > 5) || (this.trucks[i].signalRresponse.nw !== 1);
                this.trucks = [...this.trucks];

                this.map.updateLocation(i, signalRresponse, oldLatLng, this.trucks, true, this.signalRstarted);
                if (!isNullOrUndefined(this.inputValue) && this.inputValue.length > 0 || (!isNullOrUndefined(this.selectedSecondaryFilter))) {
                  this.updateFilter({ target: { value: this.inputValue } });
                } else {
                  this.rows = [...this.trucks];
                }
                if (AppConfig.DEBUG) {
                  // console.log(this.trucks[i].signalRresponse);
                }
              }

            }
          }
        });
      });
  }

  getDurationForListing(value) {
    return DateUtils.getDuration(Number(value));
  }
  private getReport(data) {
    this.played = false;
    this.violationMarkers = [];
    this.violationInfoWindows = [];
    const start_date = DateUtils.getUtcDateTimeStart(data.start_time);
    const end_date = DateUtils.getUtcDateTimeStart(data.end_time);
    var device = data.vechicleId;

    if (data.stop_time == undefined || data.stop_time == null) {
      data.stop_time = 4;
    }
    this.getTrailReport(start_date, end_date, false, data.stop_time);
  }


  public getTrailReport(start_date, end_date, restart, stop_time) {
    this.speed_Selected = 3;
    this.speed_marker = 500;
    this.state = null;
    // this.show_controls = false;
    this.violationMarkers = [];
    this.st_date = start_date;
    this.end_date = end_date;
    this.stop_time = stop_time;
    if (this.selectedDevice == 0) {
      this.swalService.getWarningSwal('Please select vehicle.');
    } else {
      const params = {
        truck_id: this.selectedDevice,
        start_datetime: start_date,
        end_datetime: end_date,
        stop_time: stop_time
        // poi_id:poi_id,
        // zone_id: zone_id
      };

      params['ignition'] = true;
      this.mapLoader = {
        visibility: true,
        dataError: true
      }
      this.truckService.getTruckSummary(params).subscribe(new class extends HttpController<LoginApiResponse<VehicleSummaryResponse[]>> {

        onComplete(): void {

        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<VehicleSummaryResponse[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.fuel_consumed = apiResponse.response['volume_consumed'] || null;
            this.context.distance_travelled = ((apiResponse.response['distance_travelled'] || 0) / 1000).toFixed(2);
            this.context.activities_completed = apiResponse.response['activities_completed'];
            this.context.filtersTravelHistory.start_datetime = start_date;
            this.context.filtersTravelHistory.end_datetime = end_date;
          }

          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
      );

      this.truckService.getMapTrail(params).subscribe(new class extends HttpController<LoginApiResponse<TrailMarkerResponse[]>> {

        onComplete(): void {
          if (restart) {
            this.context.playMarkerAnimation();
          }
          this.context.mapLoader = {
            visibility: false,
            dataError: false
          }
        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
          this.context.mapLoader = {
            visibility: false,
            dataError: false
          }
          this.context.playbackLoader = false;
        }

        onNext(apiResponse: any): void {
          const markers = [];
          const infoWindows = [];
          this.context.playbackLoader = false;
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.mapLoader = {
              visibility: false,
              dataError: false
            }
            this.context.dataSourceDetailedReport = [apiResponse.data.vehicle_detail];
            if (this.context.filtersObject && this.context.filtersObject.start_time && this.context.filtersObject.end_time) {
              this.context.filtersStatistics.start_datetime = DateUtils.getUtcDateTimeStart(this.context.filtersObject.start_time);
              this.context.filtersStatistics.end_datetime = DateUtils.getUtcDateTimeStart(this.context.filtersObject.end_time);
            }
            // this.context.totalLengthDetailedReport = 1;
            this.context.dataSourceStops = apiResponse.data.stops;
            this.context.getStatisticsListing(this.context.filtersStatistics);

            const response = apiResponse.data.map_trail;
            const selectedVehicle = apiResponse.data.vehicle_detail;
            const stop_times = apiResponse.data.stops;
            if (response.length && response.length > 1) {
              // // console.log(this.context.map.createSnapToRoadQuickView(response));
              for (let j = 0; j < stop_times.length; j++) {
                markers.push({
                  latitude: stop_times[j].latitude,
                  longitude: stop_times[j].longitude,
                });

                infoWindows.push([
                  // new Item('Duration', DateUtils.getDuration(Number(stop_times[j].duration))),
                  // new Item('Start Time', DateUtils.getLocalMMDDYYYYhhmmss(stop_times[j].start_time)),
                  // new Item('End Time', DateUtils.getLocalMMDDYYYYhhmmss(stop_times[j].end_time)),
                  new Item('Duration', stop_times[j].duration),
                  new Item('Start Time', DateUtils.getMMDDYYYYhhmmssA(stop_times[j].start_time)),
                  new Item('End Time', DateUtils.getMMDDYYYYhhmmssA(stop_times[j].end_time)),
                ]);
              }
              for (let i = 0; i < response.length; i += 1) {
                if (i > -1) {
                  const info = [
                    DateUtils.getLocalMMDDYYYYhhmmss(response[i]['timestamp_unix']),
                    ((response[i].speed) ? Math.round(response[i].speed) : 0) + ' km/h'
                  ];
                  let im;
                  if (i === 0) {
                    im = this.context.createInfowindowTemplate(info, 'Starting Point');
                    // else
                    //   im = this.context.createInfowindowTemplate(info);
                    this.context.violationInfoWindows.push(im);
                  }
                  this.context.violationMarkers.push({ lat: response[i].lat, lng: response[i].long, timestamp: response[i].timestamp, title: selectedVehicle.vehicle });
                }

              }

              if (response.length > 1) {
                const info1 = [
                  DateUtils.getLocalMMDDYYYYhhmmss(response[response.length - 1]['timestamp_unix']),
                  ((response[response.length - 1].speed) ? Math.round(response[response.length - 1].speed) : 0) + ' km/h'
                ];
                const im = this.context.createInfowindowTemplate(info1, 'Ending Point');
                this.context.violationInfoWindows.push(im);
                this.context.violationMarkers.push({
                  lat: response[response.length - 1].lat,
                  lng: response[response.length - 1].long,
                });
              }

            } else {
              this.context.violationMarkers = [];
              this.context.swalService.getWarningSwal("No data found against this vehicle");
            }

            this.context.map.resetMap();
            this.context.map.createDummyMarkers(markers, infoWindows, 30);
            let selectedPackage = JSON.parse(localStorage.getItem('user'));
            selectedPackage = selectedPackage.package[0]
            if (selectedPackage.package_id === this.context.packageType.png) {
              this.context.map.createTrail(this.context.violationMarkers, this.context.violationInfoWindows, false);
            } else {
              // this.context.map.createTrail(this.context.violationMarkers, this.context.violationInfoWindows, false);
              this.context.map.createSnapToRoad(this.context.violationMarkers, this.context.violationInfoWindows);
            }
            // // console.log(this.context.map.createSnapToRoad(this.context.violationMarkers, this.context.violationInfoWindows));
          }
          //
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }

          if (this.context.violationMarkers.length > 0)
            this.context.show_controls = true;
        }
      }(this)
      );
    }
  }

  createInfowindowTemplate(msg, title?) {
    let content = `<div id="iw-container"> <div class="iw-content">`;
    if (title) {
      content += '<div  class="iw-title">' + title + '</div>';
    }

    content += '<div class="padding-5"><span class="iw-subTitle">' + 'TimeStamp:' + '</span> <span>' + (msg[0]) + '</span></div>';
    content += '<div class="padding-5"><span class="iw-subTitle">' + 'Speed:' + '</span> <span>' + (msg[1]) + '</span></div>';
    return content;
  }

  pause() {
    this.state = "Paused";
    this.map.stopAnimation();
  }

  stop() {
    this.state = "Stopped";
    this.played = false;
    this.getTrailReport(this.st_date, this.end_date, false, this.stop_time);
    this.map.stopAnimation();
  }

  resume() {
    this.state = "Resuming";
    setTimeout(() => {
      this.state = null;
    }, 1000);
    this.map.resumeAnimation(this.zoomLevel, this.speed_marker);
  }

  speed(value, index) {
    this.speed_Selected = index;
    this.speed_marker = value;
  }

  playMarkerAnimation(state) {
    if (state == 'play') {
      this.played = true;
    }

    this.state = null;

    const truckIcon = {
      url: this.Icons[0],
      // url: '../../assets/images/suv.svg'
      anchor: new google.maps.Point(15, 30)
    };
    const newPos = new google.maps.LatLng(this.violationMarkers[0].lat, this.violationMarkers[0].lng);
    this.map.animateMarkerWithoutPolylines(this.violationMarkers, newPos, truckIcon.url, this.speed_marker, this.zoomLevel);
  }

  restart() {
    this.state = null;
    this.getTrailReport(this.st_date, this.end_date, true, this.stop_time);
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


  OpenInfoWindow(marker) {
    for (let i = 0; i < this.infoWindowsOpen.length; i++) {
      google.maps.event.trigger(this.infoWindowsOpen[i], 'mouseout');
    }
    this.infoWindowsOpen.push(marker);
    google.maps.event.trigger(marker, 'mouseover');
  }


  /*Reports*/
  getMaintenanceStatus() {
    this.formService.getOptions('dropdown_data', { option_key: 'iof_maintenance_status' })
      .subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.maintenancesStatus = apiResponse.response['option_values'].map(
              item => ({ label: item.label, value: item.id })
            );
            this.context.maintenancesStatus.unshift({ label: 'All In Maintenances', value: '-' });
            // // console.log('maintenance status', this.context.maintenancesStatus);

          }
        }
      }(this)
      );
  }

  getTruckTypes() {
    this.truckService.getPurchaseTypes({ option_key: 'trucktypes' })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          // // console.log('types', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.truckTypes = apiResponse.response['option_values'].map(function (obj) {
              return { label: obj.label, value: obj.value };
            });

            this.context.truckTypes.unshift({ label: 'All' });

          } else {
            // // console.log(apiResponse.message);
          }

        }
      }(this)
      );
  }


  filtersChanged(typeOfFilterDropdown?) {
    const obj = [
      { label: 'All' },
      { label: 'Online', value: true },
      { label: 'Offline', value: false }
    ];
    // // console.log(typeOfFilterDropdown);

    // if (isNullOrUndefined(this.selectedFilter) || isNullOrUndefined(this.selectedSecondaryFilter)) {
    //   this.rows = [...this.trucks];
    // }
    if (isNullOrUndefined(this.selectedFilter)) {
      this.rows = [...this.trucks];
    }

    if (typeOfFilterDropdown === 'primary') {
      this.selectedSecondaryFilter = null;
      switch (this.selectedFilter) {
        case TruckPrimaryFiltersEnum.By_Gateway_Status:
          this.secondaryFilters = obj;
          break;
        case TruckPrimaryFiltersEnum.By_Workshop_Status:
          this.secondaryFilters = this.maintenancesStatus;
          this.selectedSecondaryFilter = '-';
          this.filtersChanged('secondary');
          break;
        default:
          this.secondaryFilters = this.truckTypes;

      }
    } else if (typeOfFilterDropdown === 'secondary') {
      if (isNullOrUndefined(this.selectedSecondaryFilter)) {
        this.rows = [...this.trucks];
      }// else if (this.selectedSecondaryFilter === '-' && this.selectedFilter === TruckPrimaryFiltersEnum.By_Workshop_Status) {
      //   this.rows = this.filterMaintenanceStatus();
      // }
      else {
        this.updateFilter({ target: { value: this.selectedSecondaryFilter } }, this.selectedFilter);
      }
    }


  }


  filterThroughCards(typeOfCard) {
    // this.appLoader.visibility = true;
    // // console.log('type of card', typeOfCard);
    if (typeOfCard === 'Trucks') {
      this.selectedFilter = null;
      this.selectedSecondaryFilter = null;
      this.filtersChanged(null);
    }
    if (typeOfCard === 'Online') {
      this.selectedFilter = TruckPrimaryFiltersEnum.By_Gateway_Status;
      this.secondaryFilters = [
        { label: 'All' },
        { label: 'Online', value: true },
        { label: 'Offline', value: false }
      ];
      this.selectedSecondaryFilter = true;
      this.filtersChanged('secondary');

    } else if (typeOfCard === 'Offline') {
      this.selectedFilter = TruckPrimaryFiltersEnum.By_Gateway_Status;
      this.secondaryFilters = [
        { label: 'All' },
        { label: 'Online', value: true },
        { label: 'Offline', value: false }
      ];
      this.selectedSecondaryFilter = false;
      this.filtersChanged('secondary');

    } else if (typeOfCard === 'In Maintenance') {
      this.selectedFilter = TruckPrimaryFiltersEnum.By_Workshop_Status;
      this.secondaryFilters = this.maintenancesStatus;
      this.selectedSecondaryFilter = '-';
      this.filtersChanged('secondary');
    }
  }

  lala() {
    if (this.selectedFilter === TruckPrimaryFiltersEnum.By_Gateway_Status) {
      // // console.log(this.datatableService.updateTestFilter(this.selectedSecondaryFilter, this.temp, this.selectedFilter));
    }
  }

  // new
  getDetailedReportListing(filters) {
    this.showIndeterminateProgress = true;

    this.entityService.getFleetVehicles(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.showIndeterminateProgress = false;
        this.dataSourceDetailedReport = apiResponse['data'].data;
        this.totalLengthDetailedReport = apiResponse['data'].count;
        this.dataSourceDetailedReport.sort = this.sortDetailedReport;
        this.dataSourceDetailedReport.paginator = this.paginatorDetailedReport;
      }
    })
  }

  selectedTab(event) {
    // Travel histroy must be at index
    // if (event.index === 1 && this.selectedDevice && this.st_date && this.end_date) {
    //   this.totalLengthTravelHistory = 0;
    //   this.dataSourceTravelHistory.data = []
    //   this.getTravelHistoryListing(this.filtersTravelHistory);
    // }
  }

  getTravelHistoryListing(filters) {
    this.showIndeterminateProgress = true;

    let params = {
      limit: filters.limit,
      offset: filters.offset,
      order: filters.order,
      order_by: filters.order_by,
      search_key: filters.search_key == undefined ? '' : filters.search_key,
      truck_id: this.selectedDevice,
      start_datetime: this.st_date,
      end_datetime: this.end_date,
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    this.entityService.getTravelHistoryPB(params).subscribe(apiResponse => {

      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.dataSourceTravelHistory = new MatTableDataSource();
        this.dataSourceTravelHistory.data = apiResponse['data'].data;
        this.totalLengthTravelHistory = apiResponse['data'].count;

        this.showIndeterminateProgress = false;
        setTimeout(() => {
          this.dataSourceTravelHistory.paginator = this.travelHistoryPaginate;
          this.dataSourceTravelHistory.sort = this.travelHistorySort;
          this.firstTime = false;
        }, 2000);
      }
    })
  }

  getStatisticsListing(filters) {
    this.showIndeterminateProgress = true;
    let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&start_datetime=${filters.start_datetime}&end_datetime=${filters.end_datetime}`;
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
    // // console.log("filters before getStops= ", filters)
    this.showIndeterminateProgress = true;
    // let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&start_datetime=${filters.start_datetime}&end_datetime=${filters.end_datetime}`;
    this.entityService.getStops2(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.showIndeterminateProgress = false;
        this.dataSourceStops = apiResponse['data'].data;
        this.totalLengthStops = apiResponse['data'].count;
        this.dataSourceStops.sort = this.sortStops;
        this.dataSourceStops.paginator = this.paginatorStops;
      }
    })
  }

  filterIdsFromJSON() {
    if (this.filters && this.filters['fleet_id']) {
      this.filters['fleet_id'] = this.filters['fleet_id'].id;
    }
    if (this.filters && this.filters['poi_id']) {
      this.filters['poi_id'] = this.filters['poi_id'].id;
    }
    if (this.filters && this.filters['zone_id']) {
      this.filters['zone_id'] = this.filters['zone_id'].id;
    }
    if (this.filters && this.filters['route_id']) {
      this.filters['route_id'] = this.filters['route_id'].id;
    }
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

  // poi copied from fleet component
  getVehiclesForMap(filters) {
    this.entityService.getFleetVehiclesForMap(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        const mapData = apiResponse['data'].data;
        if (mapData && mapData.length > 0) {
          this.trucks = mapData;
          this.setupLocations();
          this.setupSignalR();
        }
      }
    })
  }


  setupLocations() {
    this.locations = this.trucks.map(item =>
      new EntityWithIconLocation(item.id, item.last_latitude, item.last_longitude,
        [new Item('Name', item.name),
        new Item('Status', item.online_status),
        new Item('Speed', ((item.last_speed > 5) ? Math.round(item.last_speed) : 0) + ' km/h'),
        new Item('Vehicle Type', item['vehicle_type']),
        new Item('Last Updated', DateUtils.getLocalMMDDYYYYhhmmss(item['last_updated'])),
        new Item('Location', (item['location_address']) ? item['location_address'] : '-')
        ], item['marker']));
    this.map.generateMapView(null, this.trucks, this.locations);
  }

  exportExcel(download) {
    this.downloadableLink = 'limit=' + this.filtersTravelHistory.limit + '&offset=' + this.filtersTravelHistory.offset + '&order=' + this.filtersTravelHistory.order + '&order_by=' + this.filtersTravelHistory.order_by + '&search_key=&truck_id=' + this.selectedDevice + '&start_datetime=' + this.st_date + '&end_datetime=' + this.end_date + '&export=excel&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.entityService.downloadTravelHistoryQuickViewXLS(this.downloadableLink).subscribe((apiResponse: any) => {
      // console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      window.open(url);
    })

    // this.filtersTravelHistory
    // window.open(
    //   `${environment.baseUrl}/iof/get_map_travel_history?limit=${this.filtersTravelHistory.limit}&offset=${this.filtersTravelHistory.offset}&order=${this.filtersTravelHistory.order}&order_by=${this.filtersTravelHistory.order_by}&search_key=&truck_id=${this.selectedDevice}&start_datetime=${this.st_date}&end_datetime=${this.end_date}&customer_id=${this.customerID}&export=excel&time_zone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    //   '_blank'
    // );

  }

  exportPdf(download) {
    this.downloadableLink1 = 'limit=' + this.filtersTravelHistory.limit + '&offset=' + this.filtersTravelHistory.offset + '&order=' + this.filtersTravelHistory.order + '&order_by=' + this.filtersTravelHistory.order_by + '&search_key=&truck_id=' + this.selectedDevice + '&start_datetime=' + this.st_date + '&end_datetime=' + this.end_date + '&export=pdf&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.entityService.downloadTravelHistoryQuickViewXLS(this.downloadableLink1).subscribe((apiResponse: any) => {
      // console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob)
      window.open(url);
    })


    // this.filtersTravelHistory
    // window.open(
    //   `${environment.baseUrl}/iof/get_map_travel_history?limit=${this.filtersTravelHistory.limit}&offset=${this.filtersTravelHistory.offset}&order=${this.filtersTravelHistory.order}&order_by=${this.filtersTravelHistory.order_by}&search_key=&truck_id=${this.selectedDevice}&start_datetime=${this.st_date}&end_datetime=${this.end_date}&customer_id=${this.customerID}&export=pdf&time_zone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    //   '_blank'
    // );

  }


  // trafficLayer() {
  //   const trafficLayer = new google.maps.TrafficLayer();
  //   trafficLayer.setMap(this.maps);
  // }

}

enum DaysRange {
  today = 'today',
  yesterday = 'yesterday',
  week = 'week',
  month = 'month'
}
