import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { BrandingService } from '../../shared/services/branding.service';
import { EntitySummaryResponse } from '../../data/response/EntitySummaryResponse';
import { AppLoader } from '../../data/model/app-loader';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { TruckResponse } from '../../data/response/entity-response';
import { EntityService } from '../../services/entity.service';
import { TruckService } from '../../services/truck.service';
import { GotoPageService } from '../../services/goto-page.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { DatatableService } from '../../services/datatable.service';
import { FormService } from '../../services/FormService';
import { CustomValidators } from 'src/app/core/custom.validator';
import { HttpController } from 'src/app/core/services/loading-controller';
import { LoginApiResponse, TestApiResponse, ApiResponseNew, ApiResponse } from 'src/app/core/model/api.response';
import { DropDownItem } from '../../data/model/dropdown-item';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { ErrorMessage } from '../../error-message';
import { AppConfig } from 'src/app/app.config';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FiltersService } from 'src/app/core/services/filters.service';
import { environment } from 'src/environments/environment';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
declare var $: any;

@Component({
  selector: 'app-admin-truck-form',
  templateUrl: './admin-truck-form.component.html',
  styleUrls: ['./admin-truck-form.component.css']
})

export class AdminTruckFormComponent implements OnInit, OnDestroy {

  public trucksSummaryResponse: EntitySummaryResponse = new EntitySummaryResponse();
  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  public appLoader = new AppLoader();
  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;
  globalTruckType;
  globalFleet;
  globalCategory;
  EntityType = EntityType;
  EntityStatusEnum = EntityStatusEnum;
  activeTab = 1;

  displayedVehicleList = ['name', 'status', 'modified_by_name', 'modified_datetime', 'created_datetime', 'customer_name', 'fleet', 'actions'];
  displayedVehicleType = ['label', 'total_vehicles', 'modified_by_name', 'modified_datetime', 'created_datetime', 'actions'];
  displayedFleet = ['name', 'total_vehicles', 'modified_by_name', 'modified_at', 'created_at', 'customer_name', 'actions'];
  displayedCategory = ['name', 'fleet_name', 'modified_by_name', 'modified_at', 'created_at', 'customer_name', 'actions'];


  isNullOrUndefined = isNullOrUndefined;
  maxDate = new Date();
  searchForm: FormGroup;
  truckForm: FormGroup;
  truckTypeForm: FormGroup;
  FleetForm: FormGroup;
  CategoryForm: FormGroup;
  purchaseTypes = [];
  truckTypes = [];
  vehicleTypes = [];
  vehicleTypesDropDown = [];
  customerDevices = [];
  fleets_id = []; //not used
  errorMessages: string[];
  selectedTruck: any;
  selectedTruckType: any;
  selectedTruckoption = [];
  selectedFleet: any;
  selectedCategory: any;
  trucks: any;
  fleets: any;
  fleet_id_bkp;

  temp: any[] = [];
  inputValue = '';

  startDateTime: Date;
  // leased_owned: any;
  selectedRows = [];

  btnLoading: boolean;
  btnText: string;

  @ViewChild('closeForm') private closeForm;
  @ViewChild('closeFormtype') private closeFormtype;
  @ViewChild('closeFleet') private closeFleet;
  @ViewChild('closeCategory') private closeCategory;
  currentYear = new Date().getFullYear();
  minYear = 1950;
  formTitle = 'Create Vehicle';
  formTitleType = 'Create Vehicle Type';
  formTitleFleet = 'Create Fleet';
  formTitleCategory = 'Create Category';

  namePattern = '^[A-Za-z]+$';
  obj;
  truckTypeFilters = [];
  hashMap: any = {};
  deleteAllButton: boolean;
  selectedPurchase;
  truckType;
  vehicles_list;
  category_list;
  driver_list;
  theme;
  registration;
  add_btn = 0;

  ptoolTip = 'Search by Vehicle';
  exportVariable = 'Export: Vehicle List';

  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;


  public avatar: File = null;
  public avatar_url: string = null;
  public markerMC: string = null;
  @ViewChild('myInput')
  myInputVariable: any;
  @ViewChild('img')
  image: any;
  @ViewChild('myInputType')
  myInputTypeVariable: any;
  @ViewChild('img2')
  imageForType: any;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sortDetailedReport: MatSort;
  @ViewChild('paginatorFleet') paginatorFleet: MatPaginator;
  @ViewChild(MatSort) sortTravelHistory: MatSort;
  @ViewChild('paginatorTrucks') paginatorTrucks: MatPaginator;
  @ViewChild(MatSort) sortStatistics: MatSort;
  @ViewChild('paginatorTrucksTypes') paginatorTrucksTypes: MatPaginator;
  @ViewChild(MatSort) sortStops: MatSort;
  @ViewChild('paginatorCategory') paginatorCategory: MatPaginator;
  @ViewChild('testOpen') testOpen: ElementRef;

  //old params
  // filtersTruck = { limit: 10, offset: 0, order_by: '', order: '' };
  // filtersTruckType = { limit: 10, offset: 0, order_by: '', order: '' };
  // filtersFleet = { limit: 10, offset: 0, order_by: '', order: '' };
  // filtersCategory = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '' };

  filtersTruck = { limit: 10, offset: 0, order_by: '', order: '', fleet_id: '', category_id: '', driver_id: [], entity_sub_type_id: '', vehicle_id: '', search: '' };
  filtersTruckType = { limit: 10, offset: 0, order_by: '', order: '', search: '', entity_sub_type_id: '' };
  filtersFleet = { limit: 10, offset: 0, order_by: '', order: '', search: '', entity_sub_type_id: '', fleet_id: '' };
  filtersCategory = { limit: 10, offset: 0, order_by: '', order: '', fleet_id: '', search: '', entity_sub_type_id: '' };

  fleetID = null;

  totalLengthTrucks = 0;
  totalLengthTrucksType = 0;
  totalLengthFleet = 0;
  totalLengthCategory = 0;
  vehicleImageRemoved: boolean = false;
  vehicleTypeImageRemoved: boolean = false;

  subTypeImageRemoved = false;
  isAuthorized = false;

  csvRows = [];
  csvCols = [
    { field: 'name', header: 'Name' },
    { field: 'entity_sub_type_name', header: 'Type' },
    { field: 'leased_owned', header: 'Leased/Owned' },
    // { field: 'registration', header: 'Registration' },
    { field: 'volume_capacity (ltr)', header: 'Fuel Tank Capacity' },
    { field: 'wheels', header: 'Wheels' },
    { field: 'date_commissioned', header: 'Date Commissioned' },
  ];

  keyUp = new Subject<KeyboardEvent>();
  searchText: string;
  vehicleSubmitted: boolean = false;
  vehicleTypeSubmitted: boolean = false;
  fleetSubmitted: boolean = false;
  categorySubmitted: boolean = false;
  fleetType;
  categoryType;
  fleets2;
  categories; //= [];
  selectedDrivers = [];
  breadcrumbInner = [];

  resetFilters = false;
  activePage = "vehicle";
  sidebarCheck;


  foundFleet = [];

  constructor(public formBuilder: FormBuilder,
    public truckService: TruckService,
    private entityService: EntityService,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private swalService: SwalService,
    private datatableService: DatatableService,
    private formService: FormService,
    private filtersService: FiltersService,
    private brandingService: BrandingService,
    public router: Router,
    public breadcrumbService: BreadcrumbsService,
    public drawerService: DrawerService) {

    this.searchForm = this.formBuilder.group({
      fleet_id: [''],
      category_id: [''],
      driver_id: [''],
      entity_sub_type_id: [''],
      search: ['']
    })

    this.truckTypeForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      label: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      marker: ['', [Validators.required]]
    });

    this.truckForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      engine_number: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      chassis_number: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      make: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      model: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      year: [null, [Validators.required, Validators.max(this.currentYear), Validators.min(this.minYear)]],
      color: ['', [Validators.required]],
      odo_reading: ['', [Validators.required]],
      engine_capacity: ['', [Validators.required]], // Validators.min(0)
      wheels: ['', [Validators.required, CustomValidators.isEven, Validators.min(2)]],
      volume_capacity: ['', [Validators.required, Validators.min(0)]],
      leased_owned: [null, [Validators.required]],
      entity_sub_type: [null, [Validators.required]],
      device_name: [null, [Validators.required]],
      date_commissioned: [null, [Validators.required]],

      fleet: [''],
      category: [''],




      // photo_method: [null],

      speed: [false],
      speed_threshold: [null, [Validators.required]], //threshold//[CustomValidators.isNumbers]
      harsh_acceleration: [false],
      harsh_breaking: [false],
      territory: [false],
      sharp_turning: [false],
      status: [false]

    });

    this.FleetForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      vehicle_name: ['', [Validators.required]]//new FormArray([]) //
    })

    this.CategoryForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      fleet_id: ['', [Validators.required]]//new FormArray([]) //
    })

    this.theme = this.brandingService.styleObject();
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
      console.log("ressssssssssssss1", res);
      console.log("ressssssssssssss2", this.sidebarCheck);
    })
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.add_btn = 0;
    this.deleteAllButton = false;
    this.getTrucks(this.filtersTruck);
    this.getTruckTypes(this.filtersTruckType);
    this.getFleets(this.filtersFleet);
    this.getFleetsTruck(this.fleetID, this.fleetID);
    this.getCategory(this.filtersCategory);
    this.getTrucksType(this.filtersTruckType);

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
        this.searchForm.get("search").setValue(this.searchText);

        if (this.add_btn == 0) {  //searching for vehicle tab
          this.filtersTruck.search = this.searchForm.get('search').value;
          this.setExportUrls(this.filtersTruck);
          this.getTrucks(this.filtersTruck);

        } else if (this.add_btn == 1) { //searching for vehicle type tab
          this.filtersTruckType.search = this.searchForm.get('search').value;
          this.setExportUrls(this.filtersTruckType);
          this.getTruckTypes(this.filtersTruckType);

        } else if (this.add_btn == 2) {  //searching for fleet tab
          this.filtersFleet.search = this.searchForm.get('search').value;
          this.setExportUrls(this.filtersFleet);
          this.getFleets(this.filtersFleet);

        } else if (this.add_btn == 3) {
          this.filtersCategory.search = this.searchForm.get('search').value;
          this.setExportUrls(this.filtersCategory);
          this.getCategory(this.filtersCategory);

        } else {
          console.log("inside else condition of search input")
        }

      }
    });

    this.FleetDropdown();

    this.filtersService.getValue().subscribe(data => {
      if (data) {
        console.log("data= ", data)
        if (data.modalNumber === 0) {
          // debugger
          this.testOpen.nativeElement.click();
          // this.nativeElement.trigger('click')
        }
      }
    });


    this.getAllDevices(null);

    // get Type of purchases
    this.truckService.getPurchaseTypes({ option_key: 'purchasestatus' })
      .subscribe((data: any) => {
        if (data.status === HttpStatusCodeEnum.Success) {
          this.purchaseTypes = data.response['option_values'];
        } else {
          this.swalService.getErrorSwal(data.message);
        }
        console.log("this.purchaseTypes[] ", this.purchaseTypes)
      }
      );

    this.getTruckTypeForm();
    this.setExportUrls(this.filtersTruck);

    this.breadcrumbService.getValue().subscribe(res => {
      console.log("coming in ressssssssssss", res);
      if (res && res.length) {
        this.breadcrumbInner = []
        this.breadcrumbInner = res;
        this.breadcrumbInner[0] = `${res[0]}`;
        console.log(this.breadcrumbInner);
      }
    })

  }

  FleetDropdown() {
    this.entityService.getFleetFiltersDropdown().subscribe(apiResponse => {
      this.fleets2 = apiResponse.data.data;
      console.log("this.fleets2----", this.fleets2);
    })
  }

  getTruckTypeForm() {
    this.truckService.getPurchaseTypes1().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        console.log(data.data['data']);
        this.truckTypes = data.data['data'].map(
          item => ({ value: item['id'], label: item['label'] })
        );
        console.log("trucktype1", this.truckType);
        // this.truckTypes = data.response['option_values'];
      } else {
        this.swalService.getErrorSwal(data.message);
      }
    })

    // this.downloadableLink = environment.baseUrl + "/iof/manage_xls/?report_id=" + this.add_btn + "&customer_id=" + this.customerID + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this.downloadableLink1 = environment.baseUrl + "/iof/manag_pdf/?report_id=" + this.add_btn + "&customer_id=" + this.customerID + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.downloadableLink = "report_id=" + this.add_btn + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = "report_id=" + this.add_btn + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;



  }
  getAllDevices(truck) {
    this.customerDevices = []
    // get Device attached
    this.truckService.getCustomerDevices({ type: EntityType.TRUCK, assigned: 0 }).subscribe((data: any) => {
      console.log("getCustomerDevices() response= ", data.response)
      if (data.status === HttpStatusCodeEnum.Success) {
        this.customerDevices = data.response.map(function (obj) {
          return { id: obj.device, name: obj.device_name };
        });
        if (truck) {
          this.customerDevices.unshift({ id: truck.device_name, name: truck.device_id })
          this.selectedDevice = { id: truck.device_name, name: truck.device_id }
        }
      } else {
        this.swalService.getErrorSwal(data.message);
      }
    })
  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }

  notImage = false;
  onSearch($event) {
    this.searchText = $event.search;
    console.log("this.searchText", this.searchText);
    if (this.searchText?.length > 0 || this.searchText?.length === 0) {
      this.searchForm.get("search").setValue(this.searchText);
      console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
      console.log("add button", this.add_btn);
      if (this.add_btn == 0) {  //searching for vehicle tab
        this.filtersTruck.search = this.searchForm.get('search').value;
        this.getTrucks(this.filtersTruck);
        this.setExportUrls(this.filtersTruck);
      } else if (this.add_btn == 1) { //searching for vehicle type tab
        this.filtersTruckType.search = this.searchForm.get('search').value;
        this.getTruckTypes(this.filtersTruckType);
        this.setExportUrls(this.filtersTruckType);
      } else if (this.add_btn == 2) {  //searching for fleet tab
        this.filtersFleet.search = this.searchForm.get('search').value;
        this.getFleets(this.filtersFleet);
        this.setExportUrls(this.filtersFleet);

      } else if (this.add_btn == 3) {
        this.filtersCategory.search = this.searchForm.get('search').value;
        this.getCategory(this.filtersCategory);
        this.setExportUrls(this.filtersCategory);

      } else {
        console.log("inside else condition of search input")
      }

    }

    // console.log("this.users= ", this.users);;
  }

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get("search").reset();
    // this.searchForm.get("search").setValue(this.searchText);
    //     console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);

    // this.filtersTruck.search = "";
    // this.filtersTruckType.search = "";
    // this.filtersFleet.search = "";
    // this.filtersCategory.search = "";

    this.filtersTruck = { limit: 10, offset: 0, order_by: '', order: '', fleet_id: '', category_id: '', driver_id: [], entity_sub_type_id: '', vehicle_id: '', search: '' }
    this.filtersTruckType = { limit: 10, offset: 0, order_by: '', order: '', search: '', entity_sub_type_id: '' };
    this.filtersFleet = { limit: 10, offset: 0, order_by: '', order: '', search: '', entity_sub_type_id: '', fleet_id: '' };
    this.filtersCategory = { limit: 10, offset: 0, order_by: '', order: '', fleet_id: '', search: '', entity_sub_type_id: '' };
    this.getTrucks(this.filtersTruck);
    this.getTruckTypes(this.filtersTruckType);
    this.getFleets(this.filtersFleet);
    this.getCategory(this.filtersCategory);

    this.searchForm.controls.fleet_id.setValue(''); //set empty value in fleet dropdown
    this.searchForm.controls.driver_id.setValue('');
    this.searchForm.controls.entity_sub_type_id.setValue('');
    this.searchForm.controls.category_id.setValue('')

    // this.downloadableLink = environment.baseUrl + "/iof/manage_xls/?report_id=" + this.add_btn + "&customer_id=" + this.customerID + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this.downloadableLink1 = environment.baseUrl + "/iof/manag_pdf/?report_id=" + this.add_btn + "&customer_id=" + this.customerID + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;


    this.downloadableLink = "report_id=" + this.add_btn + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = "report_id=" + this.add_btn + "&timeZone=" + Intl.DateTimeFormat().resolvedOptions().timeZone;

  }

  setExportUrls(filters) {
    if (filters) {
      if (this.add_btn == 0) {
        var query = Object.keys(this.filtersTruck).map(key => key + '=' + this.filtersTruck[key]).join('&');

      }
      if (this.add_btn == 1) {
        var query = Object.keys(this.filtersTruckType).map(key => key + '=' + this.filtersTruckType[key]).join('&');

      }
      if (this.add_btn == 2) {
        var query = Object.keys(this.filtersFleet).map(key => key + '=' + this.filtersFleet[key]).join('&');

      }
      if (this.add_btn == 3) {
        var query = Object.keys(this.filtersCategory).map(key => key + '=' + this.filtersCategory[key]).join('&');

      }

      // const urlAppend = `is_poi=${filters.is_poi}&poi_value=${filters.poi_id}&poi_value_id=${filters.driver_id}&search=${filters.driver_group}`
      setTimeout(() => {
        // this.downloadableLink = environment.baseUrl + '/iof/manage_xls/?' + query + "&report_id=" + this.add_btn + '&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        // this.downloadableLink1 = environment.baseUrl + '/iof/manag_pdf/?' + query + "&report_id=" + this.add_btn + '&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

        this.downloadableLink = query + "&report_id=" + this.add_btn + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.downloadableLink1 = query + "&report_id=" + this.add_btn + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;


      }, 200);

    }
  }

  fleetDropdownChanged(value, tab) {
    console.log("checking", tab);
    if (tab == 0) {
      this.filtersTruck.limit = 10;
      this.filtersTruck.offset = 0;
      this.filtersTruck.fleet_id = value;
      // this.paginatorTrucks =
      this.getTrucks(this.filtersTruck);
      this.setExportUrls(this.filtersTruck);
      this.getDrivers(value);
    } if (tab == 2) {
      this.filtersFleet.limit = 10;
      this.filtersFleet.offset = 0;
      this.filtersFleet.fleet_id = value;
      // this.paginatorTrucks =
      this.getFleets(this.filtersFleet);
      this.setExportUrls(this.filtersFleet);
    }
    else {
      this.filtersCategory.limit = 10;
      this.filtersCategory.offset = 0;
      this.filtersCategory.fleet_id = value;
      // this.paginatorTrucks =
      this.getCategory(this.filtersCategory);
      this.setExportUrls(this.filtersCategory);
    }
  }

  categoryDropdownChanged(value) {
    console.log("category changed== ", value);

    this.filtersTruck.limit = 10;
    this.filtersTruck.offset = 0;
    this.filtersTruck.category_id = value;
    // this.paginatorTrucks =
    this.getTrucks(this.filtersTruck);
    this.setExportUrls(this.filtersTruck);


  }

  driverDropdownChanged(value) {

    if (!this.selectedDrivers.includes(value.itemValue.id)) {
      this.selectedDrivers.push(value.itemValue.id);
    } else {
      this.selectedDrivers.splice(this.selectedDrivers.indexOf(value.itemValue.id), 1);
    }

    this.filtersTruck.limit = 10;
    this.filtersTruck.offset = 0;
    this.filtersTruck.driver_id = this.selectedDrivers;
    // this.paginatorTrucks =
    this.getTrucks(this.filtersTruck);
    this.setExportUrls(this.filtersTruck);



  }

  typeDropdownChanged(value, add_btn) {
    console.log("vehicleType changed== ", value);
    if (add_btn == 0) {
      this.filtersTruck.limit = 10;
      this.filtersTruck.offset = 0;
      this.filtersTruck.entity_sub_type_id = value;
      // this.paginatorTrucks =
      this.getTrucks(this.filtersTruck);
      this.setExportUrls(this.filtersTruck);
    }
    if (add_btn == 1) {

      this.filtersTruckType.entity_sub_type_id = value;
      // this.paginatorTrucks =
      this.getTruckTypes(this.filtersTruckType);
      this.setExportUrls(this.filtersTruckType);
    }
    if (add_btn == 2) {
      this.filtersTruck.limit = 10;
      this.filtersTruck.offset = 0;
      this.filtersFleet.entity_sub_type_id = value;
      // this.paginatorTrucks =
      this.getFleets(this.filtersFleet);
    }
    if (add_btn == 3) {
      this.filtersTruck.limit = 10;
      this.filtersTruck.offset = 0;
      this.filtersCategory.entity_sub_type_id = value;
      // this.paginatorTrucks =
      this.getCategory(this.filtersCategory);
    }

  }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const img = document.querySelector('#preview img') as HTMLImageElement;

      if (fileList[0].type.indexOf('image') === -1) {
        this.notImage = true;
      }

      if (file.size > 1000000) { // 1MB
        this.swalService.getWarningSwal('File is too big! Image must be less than 1 MB');
        this.avatar = null;
        return;
      } else {
        this.notImage = false;
        this.vehicleImageRemoved = false;
        this.avatar = file;
        this.avatar_url = ' ';
        const reader = new FileReader();
        reader.onload = (function (aImg) {
          return function (e) {
            aImg.src = e.target.result;
          };
        })(img);
        reader.readAsDataURL(file);
      }
    }
  }

  fileChangetype(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const img = document.querySelector('#type_img img') as HTMLImageElement;

      if (fileList[0].type.indexOf('image') === -1) {
        this.notImage = true;
      }

      if (file.size > 1000000) { // 1MB
        this.swalService.getWarningSwal('File is too big! Image must be less than 1 MB');
        this.avatar = null;
        return;
      } else {
        this.notImage = false;
        this.vehicleTypeImageRemoved = false
        this.avatar = file;
        this.markerMC = ' ';
        const reader = new FileReader();
        reader.onload = (function (aImg) {
          return function (e) {
            aImg.src = e.target.result;
          };
        })(img);
        reader.readAsDataURL(file);

      }
    }
  }

  removeImage() {
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = '';
    }
    this.avatar_url = null;
    this.avatar = null;
    this.vehicleImageRemoved = true;
    this.image.nativeElement.src = '/assets/images/iol/icon_trucks.png';
    // this.truckForm.patchValue({ 'photo_method': "Delete" });
  }
  removeImageType() {
    if (this.myInputTypeVariable) {
      this.myInputTypeVariable.nativeElement.value = '';
    }
    this.markerMC = null;
    this.avatar = null;
    this.subTypeImageRemoved = true;
    this.vehicleTypeImageRemoved = true;
    this.imageForType.nativeElement.src = '/assets/images/iol/icon_trucks.png';
    // this.truckTypeForm.patchValue({ 'marker': "Delete" });
  }

  activeTabFuction(index) {

    this.add_btn = index.index;
    if (this.add_btn == 0) {
      this.getTrucksType(this.filtersTruckType);
      this.ptoolTip = 'Search by Vehicle';
      this.searchForm.get("search").reset();
      this.exportVariable = 'Export: Vehicle List';
      this.setExportUrls(this.filtersTruck);

    }
    else if (this.add_btn == 1) {
      this.getTrucksType(this.filtersTruckType);
      this.ptoolTip = 'Search by Type Name';
      this.searchForm.get("search").reset();
      this.exportVariable = 'Export:Vehicle Type';
      this.setExportUrls(this.filtersTruckType);

    }
    else if (this.add_btn == 2) {
      this.ptoolTip = 'Search by Fleet Name';
      this.searchForm.get("search").reset();
      this.exportVariable = 'Export: Fleet ';
      this.setExportUrls(this.filtersFleet);

    }
    else if (this.add_btn == 3) {
      this.ptoolTip = 'Search by Category Name';
      this.searchForm.get("search").reset();
      this.exportVariable = 'Export:Category ';
      this.setExportUrls(this.filtersCategory);

    }
    console.log("this.add_btn== ", this.add_btn);
  }

  getTruckTypes(filtersTruckType) {

    // let params = `limit=${filtersTruckType.limit}&offset=${filtersTruckType.offset}&order=${filtersTruckType.order}&order_by=${filtersTruckType.order_by}`;
    let params = `limit=${filtersTruckType.limit}&offset=${filtersTruckType.offset}&order=${filtersTruckType.order}&order_by=${filtersTruckType.order_by}&entity_sub_type_id=${filtersTruckType.entity_sub_type_id}&search=${filtersTruckType.search}`;
    this.showIndeterminateProgress = true;

    console.log("params for truck type tab= ", params);
    this.truckService.getEntitySubType({ key: 'trucktypes' }, params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      console.log("getEntitySubType() response -- ", data);

      this.vehicleTypes = data['data'].data;
      this.totalLengthTrucksType = data['data'].count;
      // this.vehicleTypes.paginator = this.totalLengthTrucksType;
      // this.trucks.paginator = this.paginatorTrucksTypes;
      // this.truckTypeFilters = this.truckTypes;

      console.log("vehicleTypes[]= ", this.vehicleTypes);
    });

    this.truckService.getPurchaseTypes({ key: 'trucktypes' })
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          this.truckTypes = data.response['option_values'].map(function (obj) {
            console.log("trucktypes2", this.truckTypes);
            return { label: obj.label, value: obj.value };
          });

          this.truckTypes.unshift({ label: 'All' });

          this.truckTypeFilters = this.truckTypes;

          this.truckTypes.forEach(element => {
            if (element.value) {
              let countTypes = 0;
              let onlineCount = 0;
              this.trucks.forEach(truck => {
                if (truck.entity_sub_type === element.value) {
                  countTypes += 1;
                  element.total = countTypes;
                  if (truck.online_status) {
                    onlineCount += 1;
                    element.online = onlineCount;
                  }
                }
              });
            } else {
              element.total = this.trucks.length;
            }
          });

          setTimeout(() => {
            $('#blt').slick();
          }, 300);

        } else {
          console.log(data.message);
        }

      }
      );


  }

  getTrucksType(filtersTruckType) {
    let params = `limit=${filtersTruckType.limit}&offset=${filtersTruckType.offset}&order=${filtersTruckType.order}&order_by=${filtersTruckType.order_by}&entity_sub_type_id=${filtersTruckType.entity_sub_type_id}&search=${filtersTruckType.search}`;
    this.showIndeterminateProgress = true;

    console.log("params for truck type tab= ", params);
    this.truckService.getEntitySubType({ key: 'trucktypes' }, params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      console.log("getEntitySubType() response -- ", data);

      this.vehicleTypesDropDown = data['data'].data;


      console.log("vehicleTypes[]= ", this.vehicleTypesDropDown);
    });



  }

  // Populate Form
  getTrucks(filtersTruck): void {
    this.inputValue = "";
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.trucks = [];

    //let params = `limit=${filtersTruck.limit}&offset=${filtersTruck.offset}&order=${filtersTruck.order}&order_by=${filtersTruck.order_by}`;
    let params = `limit=${filtersTruck.limit}&offset=${filtersTruck.offset}&order=${filtersTruck.order}&order_by=${filtersTruck.order_by}&fleet_id=${filtersTruck.fleet_id}&category_id=${filtersTruck.category_id}&driver_id=${filtersTruck.driver_id}&vehicle_id=${filtersTruck.vehicle_id}&entity_sub_type_id=${filtersTruck.entity_sub_type_id}&search=${filtersTruck.search}`;

    console.log("params for vehicle tab== ", params);

    this.formService.getVehiclesList(params).subscribe((data: any) => {
      console.log("getVehiclesList()-", data);
      if (!data.error) {
        this.trucks = data['data'].data;
        this.totalLengthTrucks = data['data'].count;
        this.showIndeterminateProgress = false;
        this.trucks.paginator = this.paginatorTrucks;
      } else {
        this.swalService.getErrorSwal(data.message);
      }
    }
    );

  }

  getFleets(filtersFleet): void {
    // let params = `limit=${filtersFleet.limit}&offset=${filtersFleet.offset}&order=${filtersFleet.order}&order_by=${filtersFleet.order_by}`;
    let params = `limit=${filtersFleet.limit}&offset=${filtersFleet.offset}&order=${filtersFleet.order}&order_by=${filtersFleet.order_by}&fleet_id=${filtersFleet.fleet_id}&search=${filtersFleet.search}`;
    this.inputValue = "";
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    // this.trucks = [];

    this.formService.getFleetsList(params)
      .subscribe((data: any) => {
        if (!data.error) {
          this.fleets = data['data'].data;
          console.log("this.fleets= ", this.fleets);
          this.totalLengthFleet = data['data'].count;
          this.showIndeterminateProgress = false;
          this.fleets.paginator = this.paginatorFleet;
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      });

  }

  getFleetsTruck(param, fleetID) {
    this.formService.getFleetsTruck({ "fleet_id__isnull": true, "fleet_id": fleetID })
      .subscribe((data: any) => {
        if (!data.error) {
          this.vehicles_list = data.data;
          this.vehicles_list = [...this.vehicles_list];
          console.log("vehicles_listvehicles_list", this.vehicles_list);
          //  this.showIndeterminateProgress = false;
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      }
      );

  }
  getCategory(filtersCategory) {

    // let params = `limit=${filtersCategory.limit}&offset=${filtersCategory.offset}&order=${filtersCategory.order}&order_by=${filtersCategory.order_by}`;
    let params = `limit=${filtersCategory.limit}&offset=${filtersCategory.offset}&order=${filtersCategory.order}&order_by=${filtersCategory.order_by}&fleet_id=${filtersCategory.fleet_id}&entity_sub_type_id=${filtersCategory.entity_sub_type_id}&search=${filtersCategory.search}`;
    this.showIndeterminateProgress = true;

    console.log("params for category tab= ", params)
    this.formService.getCategoryList(params)
      .subscribe((data: any) => {
        if (!data.error) {
          this.category_list = data['data'].data;
          console.log("this.category_list= ", this.category_list, this.category_list.length)
          this.totalLengthCategory = data['data'].count;
          this.showIndeterminateProgress = false;
          this.category_list.paginator = this.paginatorCategory;
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      }
      );

  }
  getDrivers(value) {
    this.showIndeterminateProgress = true;
    console.log("params for drivers= ", value);
    this.formService.getDriverList(value)
      .subscribe((data: any) => {
        if (!data.error) {
          this.driver_list = data['data'];
          console.log("this.driver_list= ", this.driver_list)
          // this.totalLengthCategory = data['data'].count;
          // this.showIndeterminateProgress = false;
          // this.category_list.paginator = this.paginatorCategory;
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      }
      );

  }


  getTrucksSummary(): void {
    this.searchPlaceHolder = 'Loading...';
    this.trucksSummaryResponse = new EntitySummaryResponse();
    const params1 = {
      type_id: EntityType.TRUCK
    };
    this.showIndeterminateProgress = true;

    this.truckService.getEntitySummary(params1)
      .subscribe((data: any) => {
        console.log('getEntitySummary() response', data);

        if (data.status === HttpStatusCodeEnum.Success) {
          this.trucksSummaryResponse = data.response;
          this.searchPlaceHolder = 'Search By Name';
          this.enableSearch = false;
        } else {
          this.swalService.getErrorSwal(data.message);
        }
        this.showIndeterminateProgress = false;
      }
      );

  }

  onPaginateTruck(event) {
    this.filtersTruck.offset = (event.pageIndex * event.pageSize);
    this.getTrucks(this.filtersTruck);
  }
  onPaginateTruckType(event) {
    this.filtersTruckType.offset = (event.pageIndex * event.pageSize);
    this.getTruckTypes(this.filtersTruckType);
  }
  onPaginateFleet(event) {
    this.filtersFleet.offset = (event.pageIndex * event.pageSize);
    // this.getTruckTypes(this.filtersFleet);
    this.getFleets(this.filtersFleet);
  }
  onPaginateCategory(event) {
    this.filtersCategory.offset = (event.pageIndex * event.pageSize);
    this.getCategory(this.filtersCategory);
  }

  sortDataTrucks(event) {
    console.log("event= ", event, event.active)
    this.filtersTruck.order_by = event.active;
    this.filtersTruck.order = event.direction;
    this.getTrucks(this.filtersTruck);
  }
  sortDataTrucksType(event) {
    console.log("event= ", event, event.active)
    this.filtersTruckType.order_by = event.active;
    this.filtersTruckType.order = event.direction;
    // this.getTrucks(this.filtersTruckType);
    this.getTruckTypes(this.filtersTruckType);
  }
  sortDataFleet(event) {
    this.filtersFleet.order_by = event.active;
    this.filtersFleet.order = event.direction;
    // this.getTrucks(this.filtersFleet);
    this.getFleets(this.filtersFleet);
  }
  sortDataCategory(event) {
    this.filtersCategory.order_by = event.active;
    this.filtersCategory.order = event.direction;
    // this.getTrucks(this.filtersCategory);
    this.getCategory(this.filtersCategory);
  }

  populateHashmap(list) {
    for (const entry of list) {
      this.hashMap[entry.id] = false;
    }
    console.log('hashmap', this.hashMap);
  }

  getprogress(area) {
    return this.hashMap[area.id];
  }

  getParams(eDate) {
    let params = null;
    params = {
      end_datetime: DateUtils.getYYYYMMDD(eDate.toString())
    };
    // params.end_datetime += ' 00:00:00';
    // params.end_datetime = DateUtils.getUTCYYYYMMDDHHmmss(params.end_datetime);
    params.end_datetime = DateUtils.getYYYYMMDD(params.end_datetime);
    return params;
  }

  disableButton(row) {
    return this.formService.disableButton2(row);
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.truckForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  fleetDropdown(event) {
    console.log("event== ", event)
    console.log("event.value= ", event.value);
    // this.categories: //= [];
    this.categories = event.value.category;
    console.log("this.categories= ", this.categories);
  }

  speedChanged(event) {
    console.log("speed checkbox= ", event);
    console.log("this.truckForm.controls['speed'].value== ", this.truckForm.controls['speed'].value)

    if (this.truckForm.controls['speed'].value) {
      this.truckForm.controls['speed_threshold'].setValidators(Validators.required);
      this.truckForm.controls['speed_threshold'].updateValueAndValidity();
    } else {
      this.truckForm.controls['speed_threshold'].setValidators(null);
      this.truckForm.controls['speed_threshold'].updateValueAndValidity();
    }
  }

  selectedDevice: any;
  threshold_required: boolean;

  //Submit Form
  onSubmit(formValue: Object) {
    this.vehicleSubmitted = true;
    console.log("formvalue", formValue);
    if (this.validate()) {
      console.log("Form is valid");

      const d = this.getParams(this.startDateTime);
      const id = this.truckForm.getRawValue().id;

      formValue['date_commissioned'] = d['end_datetime'];

      if (!isNullOrUndefined(formValue['leased_owned'])) { formValue['leased_owned'] = this.selectedPurchase; }
      if (!isNullOrUndefined(formValue['entity_sub_type'])) { formValue['entity_sub_type'] = this.truckType; }
      if (!isNullOrUndefined(formValue['device_name'] && this.selectedDevice)) { formValue['device_name'] = this.selectedDevice.id; }

      if (!isNullOrUndefined(formValue['fleet'])) {
        formValue['fleet'] = this.fleetType.id ? this.fleetType.id : '';
      } else {
        console.log("coming in fleet")
        formValue['fleet'] = '';
      }

      if (!isNullOrUndefined(formValue['category'])) {
        formValue['category'] = this.categoryType.id ? this.categoryType.id : '';
      } else {
        console.log("coming in category")
        formValue['category'] = '';
      }
      console.log("formvalue", formValue);

      if (!formValue['speed']) {
        formValue['speed_threshold'] = "";
      } else {
        if (formValue['speed_threshold'] == null) {
          this.threshold_required = true;
          return;
        } else {
          this.threshold_required = false;
        }
      }

      this.disableSubmitButton();
      formValue['registration'] = formValue['name'];

      console.log("this.avatar= ", this.avatar);
      if (this.avatar) {
        formValue['photo'] = this.avatar;
      }

      if (this.vehicleImageRemoved) {
        formValue['photo'] = "Deleted";
      }

      if (formValue['status'] == null) {
        formValue['status'] = 1; // 0 means inactive // 1 means active
      } else {
        if (formValue['status'] == true) {
          formValue['status'] = 1;
        } else {
          formValue['status'] = 2;
        }
      }

      console.log("formValu====e", formValue)

      if (isNullOrUndefined(id)) {
        this.postTrucks(formValue);
        formValue['entity_sub_type'] = ' ';
      } else {
        this.patchTruck(formValue);
        console.log("coming in patchtruckkkkkk");
        formValue['entity_sub_type'] = ' ';
      }
    } else {
      console.log("Form is invalid[in else condition]", this.errorMessages);
    }
  }

  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      // console.log(key,data[key]);
      form_data.append(key, data[key]);
    }
    console.log(form_data);
    return form_data;
  }

  //SubmitType Form
  onSubmitType(formValue: Object) {
    this.vehicleTypeSubmitted = true;

    if (this.validateTypes()) {
      console.log("Form is valid");

      // let id = null;
      // if (this.globalTruckType)
      //   id = this.globalTruckType['id'];
      // console.log("id- ", id);

      formValue['marker'] = this.avatar;

      if (this.vehicleTypeImageRemoved) {
        formValue['marker'] = "Deleted";
      }

      console.log("formValue", formValue);
      console.log("formValue", this.globalTruckType);

      //this.disableSubmitButton();

      if (!this.globalTruckType) {
        this.postTrucksType(formValue);
      } else {
        formValue['id'] = this.globalTruckType
        this.patchTruckType(formValue);
      }

    } else {
      console.log("Form is In-valid", this.errorMessages);
    }

  }

  //SubmitFleet Form
  onSubmitFleet(formValue: Object) {
    this.fleetSubmitted = true;
    console.log("sdfsd", formValue['vehicle_name']);

    if (this.FleetForm.valid) {
      console.log("FORM is valid")
    } else {
      console.log("FORM is invalid");
      return;
    }

    let id = null;
    let testArr = [];
    if (formValue['vehicle_name']) {
      for (let i = 0; i < formValue['vehicle_name'].length; i++) {
        testArr.push(formValue['vehicle_name'][i].id)
      }

      console.log("testArr= ", testArr);
      this.obj = {
        "name": formValue['name'],
        "vehicles": testArr
      }
    } else {
      this.obj = {
        "name": formValue['name']
      }
    }

    console.log(this.globalFleet)
    if (this.globalFleet) {
      id = this.globalFleet['id'];
      console.log(id, "id")
    }
    this.disableSubmitButton();
    if (isNullOrUndefined(id)) {
      console.log("obj", this.obj);
      this.postFleet(this.obj);
    } else {
      this.obj['id'] = this.globalFleet['id']
      this.patchFleet(this.obj);
    }

  }

  //SubmitCategory Form
  onSubmitCategory(formValue: Object) {
    console.log("formValue= ", formValue)
    this.categorySubmitted = true;

    if (this.CategoryForm.valid) {
      console.log("Form is valid");
    } else {
      console.log("Form is invalid");
      return;
    }

    this.fleet_id_bkp = formValue['fleet_id'];
    let fleet_id = formValue['fleet_id'].id;
    console.log("fleet_id", fleet_id);
    let id = null;
    if (this.globalCategory)
      id = this.globalCategory['id'];
    console.log(id, "id")

    formValue['fleet_id'] = fleet_id;
    this.disableSubmitButton();
    if (isNullOrUndefined(id)) {
      this.postCategory(formValue);
    } else {
      formValue['id'] = this.globalCategory['id']
      this.patchCategory(formValue);
    }
  }

  validateTypes(): boolean {

    let isValid = true;
    this.errorMessages = [];
    if (this.truckTypeForm.get('label').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckTypeForm.get('label').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (!this.markerMC) {
      this.errorMessages.push('Image ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    return isValid;
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.truckForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.truckForm.get('name').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.truckForm.get('engine_number').hasError('required')) {
      this.errorMessages.push('Engine Number ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('engine_number').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Engine Number ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }


    if (this.truckForm.get('chassis_number').hasError('required')) {
      this.errorMessages.push('Chassis Number ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('chassis_number').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Chassis Number ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }


    if (this.truckForm.get('make').hasError('required')) {
      this.errorMessages.push('Make ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.truckForm.get('make').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Make ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.truckForm.get('model').hasError('required')) {
      this.errorMessages.push('Model ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.truckForm.get('model').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Model ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.truckForm.get('year').hasError('required')) {
      this.errorMessages.push('Manufacturing Year ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('year').hasError('max')) {
      this.errorMessages.push('Manufacturing Year should be current year');
      isValid = false;
    }
    if (this.truckForm.get('year').hasError('min')) {
      this.errorMessages.push('Manufacturing Year should be after 1990');
      isValid = false;
    }
    if (this.truckForm.get('color').hasError('required')) {
      this.errorMessages.push('Color ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('odo_reading').hasError('required')) {
      this.errorMessages.push('ODO ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('engine_capacity').hasError('required')) {
      this.errorMessages.push('Engine Capacity ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('wheels').hasError('required')) {
      this.errorMessages.push('Wheels ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('wheels').hasError('isEven')) {
      this.errorMessages.push('Wheels should be an even number');
      isValid = false;
    }

    if (this.truckForm.get('volume_capacity').hasError('required')) {
      this.errorMessages.push('Fuel Capacity ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.truckForm.get('leased_owned').hasError('required')) {
      this.errorMessages.push('Type of Purchase ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.truckForm.get('entity_sub_type').hasError('required')) {
      this.errorMessages.push('Type of Vehicle ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.truckForm.get('device_name').hasError('required')) {
      this.errorMessages.push('Device Attached ' + ErrorMessage.REQUIRED);
      isValid = false;
    }


    if (this.truckForm.get('date_commissioned').hasError('required')) {
      this.errorMessages.push('Commissioned Date' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    // if (this.truckForm.get('fleet').hasError('required')) {
    //   this.errorMessages.push('Fleet' + ErrorMessage.REQUIRED);
    //   isValid = false;
    // }
    // if (this.truckForm.get('category').hasError('required')) {
    //   this.errorMessages.push('Category' + ErrorMessage.REQUIRED);
    //   isValid = false;
    // }
    return isValid;
  }

  // create / post truck
  postTrucks(formValue): void {
    if (formValue['speed'] == null)
      formValue['speed'] = false;
    if (formValue['harsh_acceleration'] == null)
      formValue['harsh_acceleration'] = false;
    if (formValue['harsh_breaking'] == null)
      formValue['harsh_breaking'] = false;
    if (formValue['territory'] == null)
      formValue['territory'] = false;
    if (formValue['sharp_turning'] == null)
      formValue['sharp_turning'] = false;
    console.log("data before calling add vehicle api", formValue);

    this.formService.postDataTrck(this.converToFormdata(formValue)).subscribe((data: any) => {
      console.log(data);
      if (!data.error) {
        this.vehicleSubmitted = false;
        this.truckForm.reset();
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getTrucks(this.filtersTruck);
        formValue['entity_sub_type'] = '';
      } else {
        this.swalService.getWarningSwal(data.message);
      }
    }
    );

  }

  // create / post truck type
  postTrucksType(formValue): void {
    formValue['key'] = "trucktypes";
    console.log("ajaaaaaaaa", formValue);

    this.formService.postDataTrucktype(this.converToFormdata(formValue))
      .subscribe((data: any) => {
        console.log(data);
        if (!data.error) {
          this.vehicleTypeSubmitted = false;
          this.truckTypeForm.reset();
          this.closeFormtype.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getTruckTypes(this.filtersTruckType);
          this.getTruckTypeForm();


        } else {
          this.swalService.getWarningSwal(data.message);
        }
      }
      );

  }

  // create / post fleet
  postFleet(formValue): void {
    // formValue['type'] = EntityType.TRUCK;

    this.formService.postFleet(formValue)
      .subscribe((data: any) => {
        console.log(data);
        if (!data.error) {
          this.fleetSubmitted = false;
          this.FleetForm.reset();
          this.closeFleet.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getFleets(this.filtersFleet);
          this.getTrucks(this.filtersTruck);
          this.getTruckTypes(this.filtersTruckType);
          this.getCategory(this.filtersCategory);
          this.FleetDropdown();
        } else {
          this.swalService.getWarningSwal(data.message);
          this.enableSubmitButton();
        }
      }
      );

  }

  // create / post category
  postCategory(formValue): void {
    // formValue['type'] = EntityType.TRUCK;

    this.formService.postCategory(formValue)
      .subscribe((data: any) => {
        if (!data.error) {
          this.categorySubmitted = false;
          this.CategoryForm.reset();
          this.closeCategory.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getCategory(this.filtersCategory);
          this.getTrucks(this.filtersTruck);
          this.getFleets(this.filtersFleet);
          this.FleetDropdown();

          this.getTruckTypes(this.filtersTruckType);

        } else {
          this.swalService.getWarningSwal(data.message);
          this.inactiveRecordCategory = false;
          this.btnLoading = false;
          this.enableSubmitButton();
        }
      }
      );

  }

  inactiveRecord;
  inactiveRecordType;
  inactiveRecordFleet;
  inactiveRecordCategory;
  clearForm() {
    this.formTitle = 'Add Vehicle';
    this.formTitleType = 'Add Vehicle Type';
    this.formTitleFleet = "Add Fleet";
    this.formTitleCategory = "Add Category";
    this.vehicleImageRemoved = false;
    this.avatar = null;
    this.avatar_url = null;
    // this.removeImage();
    this.vehicleTypeImageRemoved = false
    this.markerMC = null;
    // this.removeImageType();
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.inactiveRecordType = false;
    this.inactiveRecordFleet = false;
    this.inactiveRecordCategory = false;

    this.truckForm.reset();
    this.truckTypeForm.reset();
    this.FleetForm.reset();
    this.CategoryForm.reset();

    this.vehicleSubmitted = false;
    this.vehicleTypeSubmitted = false;
    this.fleetSubmitted = false;
    this.categorySubmitted = false;

    this.selectedDevice = null;
    this.selectedCategory = null;
    this.vehicles_list = [];
    this.getFleetsTruck(null, null);

    this.globalFleet = '';
    this.globalCategory = '';

    if (this.add_btn == 0) { //Call the device api to get all devices from backend when user is going to create a new vehicle
      this.getAllDevices(null);
    }

  }

  openEditModal(truck) {  //Edit Modal for Vehicle List
    console.log(truck)
    this.formTitle = 'Update Vehicle';
    this.avatar_url = null;
    this.enableUpdateButton();
    this.inactiveRecord = this.disableButton(truck);
    setTimeout(() => {
      this.truckForm.get('status').enable();
    }, 200);
    console.log("this.inactiveRecord= ", this.inactiveRecord);
    const truck_data = { id: truck.d_id, itemName: truck.device_id, code: truck.d_id, name: truck.device_id };
    const matrial_data = { id: truck.entity_sub_type, itemName: truck.entity_sub_type_name, code: truck.entity_sub_type, name: truck.entity_sub_type_name };

    this.getAllDevices(truck);

    console.log("this.fleets2--- ", this.fleets2);

    let setFleet = {};
    let setCategory = {};
    for (let i = 0; i < this.fleets2.length; i++) {
      if (truck.fleet == this.fleets2[i].id) {
        setFleet = this.fleets2[i];
        this.categories = this.fleets2[i].category;

        if (this.fleets2[i].category && this.fleets2[i].category.length > 0) {
          setCategory = this.fleets2[i].category.filter(item => {
            if (item.id === truck.category) {
              return item
            }
          });
        }

        // for (let j = 0; j < this.fleets2[i].category.length; j++) {
        //   if (this.fleets2[i].category[j].id == truck.category) {
        //     setCategory = this.fleets2[i].category[j];
        //   } else {
        //     setCategory = '';
        //   }
        // }
        break;
      } else {
        setFleet = '';
      }
    }
    this.categoryType = setCategory[0];
    console.log("cominggggdddsssaaaa", setCategory);
    if (truck.status == 1) {
      this.truckForm.controls.status.setValue(true);
    } else {
      this.truckForm.controls.status.setValue(false);
    }

    this.registration = truck.registration;
    this.avatar_url = truck.photo;

    this.truckForm.patchValue({
      id: truck.id,
      name: truck.name,
      engine_number: truck.engine_number,
      chassis_number: truck.chassis_number,
      make: truck.make,
      model: truck.model,
      year: truck.year,
      color: truck.color,
      odo_reading: truck.odo_reading,
      engine_capacity: truck.engine_capacity,
      wheels: truck.wheels,
      volume_capacity: truck.volume_capacity,

      leased_owned: truck.leased_owned,
      entity_sub_type: truck.entity_sub_type,
      device_name: this.selectedDevice,
      date_commissioned: new Date(truck['date_commissioned']),

      fleet: setFleet,
      category: setCategory[0],

      speed: truck.speed,
      speed_threshold: truck.speed_threshold,

      harsh_acceleration: truck.harsh_acceleration,
      harsh_breaking: truck.harsh_breaking,
      territory: truck.territory,
      sharp_turning: truck.sharp_turning,
    }, { emitEvent: false });

    this.selectedTruck = truck;
    // if (this.inactiveRecord) {
    //   this.truckForm.patchValue({ device_name: null });
    // }

    console.log("this.avatar_url===== ", this.avatar_url)
    console.log("this.truckForm.controls['device_name'].value= ", this.truckForm.controls['device_name'].value)
    console.log("this.fleetType= ", this.fleetType)
    console.log("this.categoryType= ", this.categoryType)
    this.checkValidity();
  }

  openEditModalType(truckType) {  ///Edit Modal for Vehicle Type
    console.log("truckType= ", truckType)
    this.formTitleType = 'Update Vehicle Type';
    this.markerMC = null;
    // this.removeImage();
    // this.removeImageType();
    this.enableUpdateButton();
    this.inactiveRecordType = this.disableButton(truckType);
    this.globalTruckType = truckType.id;

    if (truckType.marker != null) {
      this.markerMC = truckType.marker;
    }
    this.truckTypeForm.patchValue({
      label: truckType.label,
    })
    console.log("thi.markerMC= ", this.markerMC)
    this.selectedTruckType = truckType;
  }

  openEditModalFleet(fleet) {  //Edit Modal for Fleet
    console.log(fleet)
    let idfleet = fleet.id;
    this.getFleetsTruck(null, idfleet);
    this.formTitleFleet = 'Update Fleet';
    this.enableUpdateButton();
    this.inactiveRecordFleet = this.disableButton(fleet);
    this.globalFleet = fleet;
    this.selectedTruckoption = [];
    for (let i = 0; i < fleet.vehicles.length; i++) {
      this.selectedTruckoption.push({ id: fleet.vehicles[i]['id'], name: fleet.vehicles[i]['name'], registration: fleet.vehicles[i]['registration'] });
    }
    console.log("selectedTruckoption", this.selectedTruckoption);
    this.FleetForm.patchValue({
      name: fleet.name,
      vehicle_name: this.selectedTruckoption,
    });

    this.selectedFleet = fleet;

  }

  openEditModalCategory(category) {  //Edit Modal for Category
    this.globalCategory = '';
    console.log("category== ", category);
    this.formTitleCategory = 'Update Category';
    this.enableUpdateButton();
    this.inactiveRecordCategory = this.disableButton(category);
    this.globalCategory = category;

    this.foundFleet = [];
    for (let i = 0; i < this.fleets.length; i++) {
      if (this.fleets[i].id == category.fleet_id) {
        this.foundFleet = this.fleets[i];
        break;
      }
    }

    this.CategoryForm.patchValue({
      name: category.name,
      fleet_id: this.foundFleet
    });
    // this.selectedCategory = category.fleet_id;
    console.log("this.CategoryForm.value= ", this.CategoryForm.value)
  }

  patchTruck(truck) {
    truck['id'] = String(this.selectedTruck.id);
    truck['type'] = EntityType.TRUCK;
    if (truck.threshold == "") ///threshold is not
      truck.threshold = ''; //null
    console.log("truckkkkkkkk", truck)
    var formdata = this.converToFormdata(truck)

    this.formService.patchTruckData(formdata)
      .subscribe((data: any) => {
        console.log(data);
        if (!data.error) {
          this.vehicleSubmitted = false;
          this.truckForm.reset();
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          truck['entity_sub_type'] = ' ';
          this.truckForm.get('entity_sub_type').setValue(null);
          this.getTrucks(this.filtersTruck);
          this.getTruckTypes(this.filtersTruckType);
        } else {
          this.swalService.getWarningSwal(data.message);
        }
      }
      );

  }

  patchTruckType(truck) {
    truck['key'] = 'trucktypes';
    if (isNullOrUndefined(truck.marker)) {
      delete truck.marker;
    } else {
      this.vehicleTypeImageRemoved = false;
      this.subTypeImageRemoved = false;
    }
    if (this.vehicleTypeImageRemoved) {   //subTypeImageRemoved
      truck.marker = "Deleted";
    }
    var formdata = this.converToFormdata(truck);
    console.log("before calling update api()====", formdata)

    this.formService.patchDataTrucktype(formdata)
      .subscribe((data: any) => {
        console.log(data);
        if (!data.error) {
          this.vehicleTypeSubmitted = false;
          this.truckTypeForm.reset();
          this.closeFormtype.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.globalTruckType = '';
          this.getTruckTypes(this.filtersTruckType);
          this.getTruckTypeForm();
        } else {
          this.swalService.getWarningSwal(data.message);
        }
      }
      );
  }

  patchFleet(fleet) {
    // fleet['id'] = String(this.selectedTruck.id);
    // var formdata = this.converToFormdata(truck)
    console.log("fleet data", fleet)
    this.formService.patchFleet(fleet)
      .subscribe((data: any) => {
        if (!data.error) {
          this.fleetSubmitted = false;
          this.FleetForm.reset();
          this.closeFleet.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getFleets(this.filtersFleet);
          this.getTrucks(this.filtersTruck);
          this.getTruckTypes(this.filtersTruckType);
          this.getCategory(this.filtersCategory);
          this.FleetDropdown();
        } else {
          this.swalService.getWarningSwal(data.message);
          this.enableUpdateButton();
        }
      }
      );
  }

  patchCategory(category) {
    category['fleet'] = category['fleet_id']
    delete category['fleet_id'];
    console.log("after changing keys== ", category);
    this.formService.patchCategory(category)
      .subscribe((data: any) => {
        console.log(data);
        if (!data.error) {
          this.categorySubmitted = false;
          this.inactiveRecordCategory = false;
          this.btnLoading = false;
          this.CategoryForm.reset();
          this.closeCategory.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getCategory(this.filtersCategory);
          this.getTruckTypes(this.filtersTruckType);
          this.getTrucks(this.filtersTruck);
          this.getFleets(this.filtersFleet);
          this.FleetDropdown();
        } else {
          this.swalService.getWarningSwal(data.message);
          this.inactiveRecordCategory = false;
          this.btnLoading = false;
          this.enableUpdateButton();
          this.CategoryForm.get('fleet_id').setValue(this.fleet_id_bkp);
        }
      }
      );
  }

  onSelect({ selected }) {
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  deleteTruck(truckId, actionType, message?) {
    const params = {};
    params['id_list'] = (truckId);
    params['status'] = actionType;
    this.formService.deleteData(params)
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(message);
          this.inputValue = '';
          this.selectedRows = [];
          this.getTrucks(this.filtersTruck);
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      }
      );
  }

  updateFilter(event) {
    this.trucks = this.datatableService.updateFilter(event.target.value, this.temp);
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }

  enableUpdateButton() {
    this.btnLoading = false;
    this.btnText = 'Update';
  }

  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }

  checkValidity() {
    const invalid = [];
    const controls = this.truckForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    // console.log(invalid);
  }

  async showDeleteCategoryConfirmation(id, currentTab) {
    console.log("idToDelete:: ", id);
    console.log("currentTab:: ", currentTab);

    const response = await this.swalService.getConfirmSwal();

    if (response == true && currentTab == 'category') {
      console.log("call delete category()")
      this.deleteCategoryById(id);
    }

    if (response == true && currentTab == 'fleet') {
      console.log("call delete fleet()")
      this.deleteFleetById(id);
    }

    // if (response == true && currentTab == 'vehicle') {
    //   console.log("call delete vehicle()")
    //   this.deleteVehicleById(id);
    // }
    if (response == true && currentTab == 'vehicle_type') {
      console.log("call delete vehicle()")
      this.deleteVehicleTypeById(id);
    }
  }


  async showSwal(vehicle) {
    // this.selectedUser = user;
    console.log('user', vehicle);

    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
    const shouldDelete = await this.swalService.getDeleteSwal(vehicle, 'What do you want to do with ' + vehicle.name + ' ?');
    console.log('shouldDelete', shouldDelete);
    if (shouldDelete) {
      console.log("coming in should del");
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteVehicleById(vehicle.id, shouldDelete, 'Record has been' + message +
        'successfully');
    }
  }


  deleteVehicleById(id, actionType, message?) {
    this.hashMap[id] = true;
    const params = {};
    params['id'] = (id);
    params['status'] = actionType;
    this.showIndeterminateProgress = true;
    // this.formService.deleteVehicleId({ 'id': id })
    this.formService.deleteVehicleId(params)
      .subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        if (!data.error) {
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getTrucks(this.filtersTruck);
        } else {
          this.swalService.getWarningSwal(data.message);
        }
      }
      );
  }
  deleteVehicleTypeById(id) {

    this.hashMap[id] = true;
    this.showIndeterminateProgress = true;
    this.formService.deleteVehicleTypeId({ 'id': id })
      .subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        if (!data.error) {
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal('Vehicle deleted successfully');
          this.getTruckTypes(this.filtersTruckType);
          this.getTruckTypeForm();
          this.getTruckTypeForm();

          this.globalTruckType = '';

        } else {
          this.swalService.getWarningSwal(data.message);
        }
      }
      );
  }

  deleteFleetById(id) {
    this.hashMap[id] = true;
    this.showIndeterminateProgress = true;
    this.formService.deleteFleet({ 'id': id })
      .subscribe((data: any) => {
        //console.log("deleteFleet()= ", data);
        this.showIndeterminateProgress = false;
        if (!data.error) {
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal("Fleet deleted successfully"); //data.message
          this.getFleets(this.filtersFleet);
          this.getTrucks(this.filtersTruck);
          this.getCategory(this.filtersCategory);

        } else {
          this.swalService.getWarningSwal(data.message);
        }
      }
      );
  }

  deleteCategoryById(id) {
    this.hashMap[id] = true;
    this.showIndeterminateProgress = true;
    this.formService.deleteCategory({ 'id': id })
      .subscribe((data: any) => {
        //console.log("deleteCategory()= ", data);
        this.showIndeterminateProgress = false;
        if (!data.error) {
          this.closeCategory.nativeElement.click();
          this.swalService.getSuccessSwal('Category deleted successfully'); //data.message
          this.getCategory(this.filtersCategory);
          this.getTrucks(this.filtersTruck);
          this.getFleets(this.filtersFleet);

          this.getTruckTypes(this.filtersTruckType);

        } else {
          this.swalService.getWarningSwal(data.message);
        }
      }
      );
  }
  toggle(event) {
    console.log("toffle", event);
  }


  closeFleetForm() {
    console.log("coming l");
  }
  exportExcel(add_btn) {
    console.log("coming in exportExcel", add_btn);

    window.open(
      environment.baseUrl + `/iof/manage_xls/?report_id=${add_btn}&timeZone=${(Intl.DateTimeFormat().resolvedOptions().timeZone)}`,
      '_blank' // <- This is what makes it open in a new window.
    );
  }
  exportPdf(add_btn) {
    console.log("coming in pdf");
    // this.filtersUser.export = "pdf";

    window.open(
      environment.baseUrl + `/iof/manag_pdf/?report_id=${add_btn}&timeZone=${(Intl.DateTimeFormat().resolvedOptions().timeZone)}`,
      '_blank' // <- This is what makes it open in a new window.
    );
  }



  downloadXLS(download) {
    this.formService.downloadFleetListingXLS(this.downloadableLink1).subscribe((apiResponse: any) => {
      console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      window.open(url);
    })
  }

  downloadPDF(download) {
    this.formService.downloadFleetListingPDF(this.downloadableLink1).subscribe((apiResponse: any) => {
      console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob)
      window.open(url);
    })
  }








}
