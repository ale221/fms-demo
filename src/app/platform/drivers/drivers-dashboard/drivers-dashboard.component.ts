import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { isValid } from 'date-fns';
import { of, Subject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, delay, distinctUntilChanged, filter, map, mergeMap } from 'rxjs/operators';
import { CustomValidators } from 'src/app/core/custom.validator';
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
import { ErrorMessage } from '../../error-message';
import { SwalService } from 'src/app/core/services/swal.service';
import { EntityType } from 'src/app/core/enum/entity-type.enum';
import { FormService } from '../../services/FormService';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { UserService } from 'src/app/core/services/user.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DriverDetailsService } from '../../services/drivers/driver-details.service';
import { DropDownItem } from '../../data/model/dropdown-item';
import { environment } from 'src/environments/environment';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthService } from 'src/app/core/services/auth.service';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';
// import { debugger } from 'fusioncharts';

@Component({
  selector: 'app-drivers-dashboard',
  templateUrl: './drivers-dashboard.component.html',
  styleUrls: ['./drivers-dashboard.component.css'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DriversDashboardComponent implements OnInit {

  items = [{ label: 'Drivers', url: null }];
  home = { label: 'Dashboard' };

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  trucks = [];
  driverGroupListing: any;
  hashMap: any = {};
  finallist: any;
  users;//: any = [];
  filtersUser = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search: '', status: '' };
  resetFilters = false;
  displayedColumns = ['name', 'cnic', 'status', 'on_shift', 'driver_group_name', 'modified_by', 'modified_datetime', 'created_datetime', 'action'];  //'select',
  displayedGroupColums = ['name', 'count', 'action'];
  locations: EntityWithIconLocation[] = [];
  mapData;
  togglePlusMinus = false;
  EntityStatusEnum = EntityStatusEnum;
  connection: SignalRConnection;
  subscription: Subscription;
  signalRstarted = [];
  errorMessages: string[];
  searchText;
  currentDate = new Date();
  driverForm: FormGroup;
  GroupForm: FormGroup;
  searchForm: FormGroup;
  @ViewChild('closeForm') private closeForm;
  @ViewChild('closeForm2') private closeForm2;
  @ViewChild('closeFormBulk') public closeFormBulk;
  @ViewChild('editpop') private editpop;
  itemListMaritalStatus = [];
  showIndeterminateProgress: boolean;
  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;
  inactiveRecord;
  itemListGenders = [];
  passwordVisible: boolean = true;
  onShift = null;
  submitted: boolean;
  formTitle = 'Add Driver';
  myInputVariable: any;
  @ViewChild('img')
  passwordNotMatch = '';
  image: any;
  btnText: string;
  public dob: Date;
  public date_of_joining: Date;
  show_password: boolean = false;
  hidePassword: boolean = true;
  selectedRole;
  EntityType = EntityType;
  selectedMaritalStatus;
  selectedGender;
  public avatar: File = null;
  public avatar_url: string = null;
  totalUserLength = 0;
  driverGroup = [];
  groupDriverList = [];
  selectedDriver = [];
  statusList = [{ id: 1, name: "Active" }, { id: 2, name: "Inactive" }];
  selectedStatus;
  updateEdit2: boolean = true;

  ptoolTip = 'Search by Drivers,Employee ID';
  exportVariable = 'Export: Driver ';

  driverLists = [];
  driverDropdown;
  typeList = [];
  widgetData = [
    { name: 'Refresh', icon: 'fa fa-refresh', route: '', reload: true },
    { name: 'Export', icon: 'fa fa-download', route: '' },
    { name: 'Share', icon: 'fa fa-share-alt', route: '', subNav: [{ name: 'Whatsapp', route: "" }, { name: 'Email', route: '' }] },
    { name: 'Manage', icon: 'fa fa-crosshairs-alt', route: '/iol/drivers', target: true, url: 'http://52.178.0.56/admin', queryParam: true },
    { name: 'Allocate', icon: 'fa fa-location-arrow', subNav: [{ name: 'Vehice to Fleet', route: '' }, { name: 'Driver to Vehicle', route: '' }, { name: 'Driver to Shift', route: '' }] },
    { name: 'Shift', icon: 'fa fa-map-marker', route: 'shifts' },
    { name: 'Task', icon: 'fa fa-map-marker', route: 'template' }
  ]
  copySignalR: any;
  dataSource: any;
  cardsArray;
  graphsArray;
  itemListTrucks = [];
  driverShiftsList = [];
  totalFuelReportingLength = [];
  mapZoom;
  theme;
  add_btn = 0;
  filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '', driver_group: '', driver_id: '', type_id: 5 };

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
  useCaseId = 0;
  keyUp = new Subject<KeyboardEvent>();
  selectedClient;
  selectedUserId = 0;
  selectedGroupID = 0;
  selectedCheckbox = false;
  tempIcon = 'assets/images/iol/icon-map-pin-end.png';
  @ViewChild(FiltersComponent) filtersComponent: FiltersComponent; // get child component to use its method resetFilter
  btnLoading: boolean;
  userForm: FormGroup;
  bulkUploadForm: FormGroup;
  csvFiles: AbstractControl;
  notCSVExcel = false;
  selectedFileName = '';
  selectedFile: any;
  bulkSubmitted: boolean;
  disableButton: boolean = true;
  isAuthorized = false;
  isEditImage = false;
  yearsBeforeNow;
  minDateForBirth;
  breadcrumbInner = [];
  defaultDate: Date = new Date();

  selection = new SelectionModel<any>(true, []);//(true, []);
  selectedIDToDelete = [];
  dynamicMask = "9999999999";
  // countryCode = [{
  //   code: '+92',
  //   name: 'Pakistan'
  // }, {
  //   code: '+974',
  //   name: 'Qatar'
  // }]
  countryCode = [{
    code: '+974',
    name: 'Qatar'
  }]
  selectedCountry = '+974';
  sidebarCheck;

  constructor(private driverService: DriverDetailsService, private userService: UserService, private formService: FormService, private swalService: SwalService, private entityService: EntityService, private formBuilder: FormBuilder,
    private brandingService: BrandingService,
    private getUsecase: GetUsecaseService,
    private authService: AuthService,
    public gotoService: GotoPageService,
    private route: ActivatedRoute,
    private filtersService: FiltersService,
    private breadcrumbService: BreadcrumbsService,
    private drawerService: DrawerService,
    private xlsPdfService:XlsPdfService) {
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.connection = this.route.snapshot.data['connection'];
    this.selectedFile = new Object();
    this.searchForm = this.formBuilder.group({
      search: [''],
      selectGroup: [''],
      selectedDriver: ['']
    })
    this.GroupForm = this.formBuilder.group({
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndSpace]],
      selectDriver: [null, [Validators.required]],
      driverShifts: [''],
      countNumber: ['']
    });

    this.driverForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/), CustomValidators.isAlphabetsAndSpace, this.noWhitespaceValidator]],
      cnic: ['', [Validators.required, CustomValidators.isCNIC]],
      dob: [null, [Validators.required]],
      date_of_joining: [null, [Validators.required]],
      status: [null, [Validators.required]],
      salary: [null, [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      marital_status_id: [null, [Validators.required]],

      gender_id: [null, [Validators.required]],
      contact_number: [null, [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/), this.noWhitespaceValidator]],
      type_id: [''],
      photo: [null],
      email: ['', [Validators.required, Validators.email, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]],
      password: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$')])],
      driver_group_id: [''],
      is_poi: [''],
      speed: ['']
    }, { emitEvent: false });
    this.bulkUploadForm = this.formBuilder.group({
      'csvFiles': [null, [Validators.required]],
    })
    this.csvFiles = this.bulkUploadForm.controls['csvFiles'];
  }

  rowClick() {
    this.togglePlusMinus != this.togglePlusMinus;
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.breadcrumbService.getValue().subscribe(res => {
      if (res && res.length) {
        this.breadcrumbInner = []
        this.breadcrumbInner = res;
        this.breadcrumbInner[0] = `${res[0]}`;
        console.log("this.breadcrumbInner", this.breadcrumbInner);
      }
    })

    console.log("this.breadcrumbInner", this.breadcrumbInner);
    if (this.breadcrumbInner[0] == 'admin/config') {
      setTimeout(() => {
        this.editpop.nativeElement.click();
      }, 1000);
    }

    var d = new Date();

    console.log("d", d);
    console.log("aaaaaaaaaaaaaa", (d.getFullYear() - 18));
    this.yearsBeforeNow = d.getFullYear() - 18;
    var month = d.getMonth();
    var date = d.getDate();
    console.log("moth", month);
    this.minDateForBirth = new Date(this.yearsBeforeNow, month, date);
    console.log("this.minDateForBirth", this.minDateForBirth);
    this.defaultDate = new Date(1950, 1, 1);
    console.log("goooooddddd", this.defaultDate)
    // this.driverForm.get('dob').setValue(new Date(this.yearsBeforeNow));

    this.statusList.forEach((element: any) => {
      element.label = element.name;
      element.value = element.id;
    });
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.btnText = "Save";
    this.loadDashboardCards(hypernymModules[6], DashboardEnum.Driver);
    this.filtersService.getValue().subscribe(data => {
      if (data) {
        this.filters = data;
        this.filters.limit = 10;
        this.filters.offset = 0;
        this.filters.order_by = '';
        this.filters.order = '';
        this.filterIdsFromJSON();
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
    this.getGroupList();
    this.getDriversListing(this.filters);
    this.getGroupListingType(this.filters);
    this.getDriversForMap(null);
    this.getAllZones(null);
    this.getListGroupDriver();

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
      }
    });

    // this.downloadableLink = environment.baseUrl + '/iof/dm1/?customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/dm2/?customer_id=' + this.customerID;

    this.downloadableLink = '';
    this.downloadableLink1 = '';

    this.formService.getOptionsforDropDown('dropdown_data', { option_key: 'gender' })
      .subscribe((data: any) => {
        console.log("getOptionsforDropDown() response=== ", data.response['option_values']);

        if (data.status === HttpStatusCodeEnum.Success) {
          // this.itemListGenders = data.response['option_values'].map(function (obj) {
          //   return { value: obj.id, name: obj.label, id: obj.id, label: obj.label };
          // });
          this.itemListGenders = data.response['option_values'].map(
            item => ({ value: item['id'], label: item['label'] })
          );
        } else {
          this.swalService.getErrorSwal(data.message);
        }
        console.log("itemListGenders (from ngOninIt)", this.itemListGenders);
      })


    this.formService.getOptionsforDropDown('dropdown_data', { option_key: 'maritalstatus' })
      .subscribe((data: any) => {
        console.log("getOptionsforDropDown() response- ", data)
        if (data.status === HttpStatusCodeEnum.Success) {
          this.itemListMaritalStatus = data.response['option_values'].map(
            item => ({ value: item['id'], label: item['label'] })
          );
          console.log(this.itemListMaritalStatus)
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      })
  }

  get f() {
    return this.driverForm.controls;
  }

  resetExportUrls() {
    if (this.add_btn === 0) {
      // this.downloadableLink = environment.baseUrl + '/iof/dm1/?search=&customer_id=' + this.customerID + '&driver_id=&driver_group=';
      // this.downloadableLink1 = environment.baseUrl + '/iof/dm2/?search=&customer_id=' + this.customerID + '&driver_id=&driver_group=';

      this.downloadableLink = 'search=&driver_id=&driver_group=';
      this.downloadableLink1 = 'search=&driver_id=&driver_group=';

    } else {
      // this.downloadableLink = environment.baseUrl + '/iof/excletab/?search=&customer_id=' + this.customerID + '&driver_id=&driver_group=';
      // this.downloadableLink1 = environment.baseUrl + '/iof/dpftab/?search=&customer_id=' + this.customerID + '&driver_id=&driver_group=';

      this.downloadableLink = 'search=&driver_id=&driver_group=';
      this.downloadableLink1 = 'search=&driver_id=&driver_group=';

    }
  }

  activeTabFuction(index) {
    this.add_btn = index.index;
    if (this.add_btn == 0) {
      this.ptoolTip = ' Search by Drivers,Employee ID';
      this.searchForm.get("search").reset();
      this.exportVariable = 'Export: Driver  ';

    }
    else if (this.add_btn == 1) {
      this.ptoolTip = 'Search by Group';
      this.searchForm.get("search").reset();
      this.exportVariable = 'Export:Driver Group';
    }

    this.resetExportUrls();

  }
  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.driverForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.driverForm.get('name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.driverForm.get('cnic').hasError('required')) {
      this.errorMessages.push('CNIC ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('cnic').hasError('isCNIC')) {
      this.errorMessages.push('CNIC ' + ErrorMessage.CNIC);
      isValid = false;
    }

    if (this.driverForm.get('dob').hasError('required')) {
      this.errorMessages.push('Date of Birth ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.driverForm.get('date_of_joining').hasError('required')) {
      this.errorMessages.push('Date of Joining ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.driverForm.get('salary').hasError('required')) {
      this.errorMessages.push('Salary ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('salary').hasError('pattern')) {
      this.errorMessages.push('Salary ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.driverForm.get('marital_status_id').hasError('required')) {
      this.errorMessages.push('Marital Status ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.driverForm.get('gender_id').hasError('required')) {
      this.errorMessages.push('Gender ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.driverForm.get('contact_number').hasError('required') || this.driverForm.get('contact_number').hasError('whitespace')) {
      this.errorMessages.push('Contact Number ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.driverForm.get('email').hasError('required')) {
      this.errorMessages.push('Email ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('email').hasError('pattern')) {
      this.errorMessages.push('Email ' + ErrorMessage.PATTERN);
      isValid = false;
    }
    if (this.selectedUserId == 0) {
      if (this.driverForm.get('password').hasError('required')) {
        this.errorMessages.push('Password ' + ErrorMessage.REQUIRED);
        isValid = false;
      }
    }
    return isValid;
  }
  validate2(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.GroupForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.GroupForm.get('name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.selectedGroupID == 0) {
      if (this.GroupForm.get('selectDriver').hasError('required')) {
        this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
        isValid = false;
      }
    }
    return isValid;
  }
  notImage = false;
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
        this.avatar = file;
        this.isEditImage = true
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
      this.filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '', driver_group: '', driver_id: '', type_id: 5 };
      this.getDriversListing(this.filters);
      this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
      this.getDriversForMap(this.filters);
      this.resetFilters = true;
      this.filtersComponent.filterReset();
    }
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
    if (this.filters && this.filters['shift_id']) {
      this.filters['shift_id'] = this.filters['shift_id'].id;
    }
  }

  searchStatusDropDownChange(event) {

  }
  getGroupListingType(filters) {
    console.log(filters);
    this.loadingFilter = true;
    this.mapLoader = {
      visibility: this.loadingFilter,
      dataError: true
    }
    // filters.type_id=5;
    if (filters.search_key === undefined || filters.search_key === null) {
      filters.search = '';
    }
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search_key}`;
    console.log("params== ", params);
    this.entityService.getFeetType(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.loadingFilter = false;
        this.mapLoader = {
          visibility: this.loadingFilter,
          dataError: false
        }
        console.log(apiResponse['data'].data);
        this.driverGroupListing = apiResponse['data'].data;
        this.totalFuelReportingLength = apiResponse['data'].count;
        this.driverGroupListing.sort = this.sort;
        this.driverGroupListing.paginator = this.paginator;
        console.log(this.driverGroupListing);
      }
    })
  }
  onPaginateFuelReporting(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getGroupListingType(this.filters);
  }
  sortDriverGroup(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getGroupListingType(this.filters);
  }
  getGroupList() {
    console.log("coming in getDriversGroup");
    this.driverService.getDriverGroup().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        console.log(data.data);
        this.driverGroup = data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
        //  this.driverGroup=data.data;
        this.driverLists = [];
        this.typeList = [];
        //  this.reportTypeTable=0;
        console.log("coming in drivers", this.driverGroup);
      } else {
        console.log(data.message);
      }
    });
  }
  selectGroupDropDownChange($event) {
    this.getDrivers($event.value);
    this.filters.driver_group = this.searchForm.get('selectGroup').value;
    this.searchForm.get('selectedDriver').reset();
    this.filters.driver_id = '';
    console.log(this.filters);
    this.downloadableLink = 'search=' + this.filters.search_key + '&driver_group=' + this.filters.driver_group + '&driver_id=' + this.filters.driver_id;
    this.downloadableLink1 = 'search=' + this.filters.search_key + '&driver_group=' + this.filters.driver_group + '&driver_id=' + this.filters.driver_id;
    this.getDriversListing(this.filters);
    this.getDriversDropdown(this.filters);
  }

  selectDriverDropDownChange($event) {
    console.log(this.searchForm.get('selectedDriver').value)
    this.filters.driver_group = this.searchForm.get('selectGroup').value;
    this.filters.driver_id = this.searchForm.get('selectedDriver').value;
    this.downloadableLink = 'search=' + this.filters.search_key + '&driver_group=' + this.filters.driver_group + '&driver_id=' + this.filters.driver_id;
    this.downloadableLink1 = 'search=' + this.filters.search_key + '&driver_group=' + this.filters.driver_group + '&driver_id=' + this.filters.driver_id;
    this.getDriversListing(this.filters);
  }

  selectTypeDropDownChange($event) {


  }

  getType(typeId) {

  }

  getDrivers(driverGroupID) {
    console.log("coming in drivers");
    this.driverService.getDriver(driverGroupID).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverLists = data.data.map(
          item => new PrimengDropdownItem(item['id'], item['driver_name'])
        );
        this.typeList = [];
      } else {
        console.log(data.message);
      }
    });
  }

  getDriversDropdown(filters) {
    console.log("coming in driverdropdown", filters);
    this.loadingFilter = true;
    this.mapLoader = {
      visibility: this.loadingFilter,
      dataError: true
    }
    filters.type_id = 5;
    if (filters.search_key === undefined || filters.search_key === null) {
      filters.search = '';
    }

    let params = `type_id=${filters.type_id}&search=${filters.search_key}&driver_id=${filters.driver_id}&driver_group=${filters.driver_group}`;

    this.formService.getEntitiesDrivers(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.driverDropdown = apiResponse['data'].data[0].map(
          item => new DropDownItem(item['id'], item['name'])
        );
      }
    })
  }

  getDriversListing(filters) {
    this.loadingFilter = true;
    this.mapLoader = {
      visibility: this.loadingFilter,
      dataError: true
    }
    filters.type_id = 5;
    if (filters.search_key === undefined || filters.search_key === null) {
      filters.search = '';
    }
    // console.log(filters,"fillllllllllllllllllllllll");
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search_key}&driver_id=${filters.driver_id}&driver_group=${filters.driver_group}`;
    console.log("params== ", params);
    this.formService.getEntitiesTool(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.loadingFilter = false;
        this.mapLoader = {
          visibility: this.loadingFilter,
          dataError: false
        }
        this.dataSource = apiResponse['data'].data[0];
        this.totalLength = apiResponse['data'].count;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        console.log(this.dataSource);
      }
    })
  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getDriversListing(this.filters);
  }

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getDriversListing(this.filters);
  }

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get('search').setValue('');
    this.filters.driver_id = '';
    this.filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '', driver_group: '', driver_id: '', type_id: 5 };
    this.getDriversListing(this.filters);
    this.getGroupListingType(this.filters)
    // this.searchForm.get("search").setValue(this.searchText);
    //     console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
    this.filtersUser.search = "";
    this.filtersUser = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search: '', status: '' };
    this.getUsers(this.filtersUser);
    setTimeout(() => {
      this.resetExportUrls();
    }, 200);

  }

  getDriversForMap(filters) {
    this.entityService.getFleetDriversForMap(filters).subscribe(apiResponse => {
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
    // this.map.fitBounds(bounds);
    // const z = this.getBoundsZoomLevel(bounds, { height: height, width: 390 });
    // this.map.setZoom(z);
    if (this.map) {
      this.map.setCenter(bounds.getCenter());
      if (cordsArray.length === 1) {
        return this._markers[0];
      }
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

                let geocoder = new google.maps.Geocoder();
                this.copySignalR = this.trucks[i].signalRresponse;
                var latlng = { lat: parseFloat(signalRresponse.lat.toString()), lng: parseFloat(signalRresponse.lon.toString()) };
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
  removeImage(data) {
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = '';
    }
    this.avatar_url = null;
    this.avatar = null;
    this.isEditImage = true;
    if (!data) {
      if (this.image && this.image.nativeElement && this.image.nativeElement.src) {
        this.image.nativeElement.src = '/assets/images/iol/driver_placeholder.png';
      }
    }
  }
  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }
  clearForm(data = null) {
    this.btnText = "Save";
    this.onShift = null;
    this.driverForm.reset();
    this.submitted = false;
    this.selectedUserId = 0;
    this.selectedGroupID = 0;
    // this.getDrivers(this.filterDrivers)
    this.closeForm.nativeElement.click();
    console.log("==============>", this.driverForm);
    // this.driverForm.get('email').value.setValue('');
    // this.driverForm.get('password').value.setValue('');
    console.log(this.driverForm.get('email').value, this.driverForm.get('password').value)
    this.driverForm.get('email').setValue('');
    this.driverForm.get('password').setValue('');
    this.inactiveRecord = false;
    this.formTitle = 'Add Driver';
    this.passwordVisible = true;

    this.removeImage(data);
    this.enableSubmitButton();

    this.driverForm.reset();
    this.getTrucks(null);
    // this.formTitle = 'Create Staff';
    this.btnText = "Save";
    this.selectedRole = null;
    this.show_password = false;
    this.selectedCheckbox = false;
    this.submitted = false;
    console.log("==============>", this.driverForm);
  }
  clearForm2() {
    this.btnText = "Save";
    this.GroupForm.reset();
    this.updateEdit2 = true;
    this.formTitle = 'Add Driver Group';
    this.submitted = false;
  }
  getListGroupDriver() {
    this.driverService.getDriverForGroupAdd().subscribe(res => {
      console.log(res);
      this.groupDriverList = res['data'].map(
        item => new DropDownItem(item['id'], item['name'])
      );
    });
  }
  getTrucks(value) {
    this.formService.getOptions('unassigned_trucks', {})
      .subscribe((data: any) => {
        console.log('getOptions() response* ', data);

        if (data.status === HttpStatusCodeEnum.Success) {
          this.itemListTrucks = data.response.map(
            item => new PrimengDropdownItem(item['id'], item['label'])
          );
          if (!(value === null)) {
            console.log(value);
            // this.context.itemListTrucks.push(new PrimengDropdownItem(value['id'], value['itemName']));
            this.itemListTrucks.unshift(value);
            console.log('trucks', this.itemListTrucks);
          }

        } else {

        }
      })
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
      new Item('Status', this.trucks[i].online_status),
      new Item('Speed', ((this.trucks[i].signalRresponse.spd > 5 && tooLongOrtooShortDistance) ? Math.round(this.trucks[i].signalRresponse.spd) : ((this.trucks[i].signalRresponse.spd && !signalRresponse.lat && !signalRresponse.lon) ? Math.round(this.trucks[i].signalRresponse.spd) : 0)) + ' km/h'),
      // new Item('Fuel', (this.trucks[i].signalRresponse.vol ? (this.trucks[i].signalRresponse.vol).toFixed(2) : 0) + ' gal'),
      // new Item('Temperature', ((this.trucks[i].signalRresponse.temp) ? this.trucks[i].signalRresponse.temp : 0) + ' °C'),
      // new Item('Net Weight', this.trucks[i].signalRresponse.nw + ' kg'),
      // new Item('Truck Type', this.trucks[i]['vehicle_type']),
      new Item('Last Updated', DateUtils.getMMDDYYYYhhmmssA(this.trucks[i].signalRresponse.t)),
      new Item('Locations', (trucks[i]['location_address'] ? trucks[i]['location_address'] : '-'))
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
  onSearch(formValue) {
    if (this.add_btn === 0) {
      let selectGroup = this.searchForm.get('selectGroup').value;
      let selectedDriver = this.searchForm.get('selectedDriver').value;
      let search = this.searchForm.get('search').value

      if (selectGroup == null) {
        selectGroup = '';
      }
      if (selectedDriver == null) {
        selectedDriver = '';
      }
      if (search == null) {
        search = '';
      }

      this.filters.search_key = search;
      this.filters.driver_group = selectGroup;
      this.filters.driver_id = selectedDriver;

      this.getDriversListing(this.filters);
      // this.downloadableLink = environment.baseUrl + '/iof/dm1/?search=' + this.filters.search_key + '&customer_id=' + this.customerID + '&driver_id=' + selectedDriver + '&driver_group=' + selectGroup;
      // this.downloadableLink1 = environment.baseUrl + '/iof/dm2/?search=' + this.filters.search_key + '&customer_id=' + this.customerID + '&driver_id=' + selectedDriver + '&driver_group=' + selectGroup;

      this.downloadableLink =  'search=' + this.filters.search_key + '&driver_id=' + selectedDriver + '&driver_group=' + selectGroup;
      this.downloadableLink1 =  'search=' + this.filters.search_key + '&driver_id=' + selectedDriver + '&driver_group=' + selectGroup;



    }
    else if (this.add_btn === 1) {
      console.log(this.searchForm.get('search').value);
      this.filters.search_key = this.searchForm.get('search').value
      this.getGroupListingType(this.filters);
      // this.downloadableLink = environment.baseUrl + '/iof/excletab/?search=' + this.filters.search_key + '&customer_id=' + this.customerID;
      // this.downloadableLink1 = environment.baseUrl + '/iof/dpftab/?search=' + this.filters.search_key + '&customer_id=' + this.customerID;


      this.downloadableLink = 'search=' + this.filters.search_key + '&customer_id=' + this.customerID;
      this.downloadableLink1 = 'search=' + this.filters.search_key + '&customer_id=' + this.customerID;

    }
  }
  // async deleteDriv(user)
  // {
  //   const shouldDelete = await this.swalService.getDeleteSwal(user, 'What do you want to do with ' + user.email + ' ?');
  //   console.log('shouldDelete', shouldDelete);
  //   if (shouldDelete) {
  //     console.log("coming in should del");
  //     const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : '  ';
  //     // this.deleteUser(user.id, shouldDelete, 'Record has been' + message +
  //     //   'successfully');
  //   }
  // }
  // showSwal(driver) {
  //   this.hashMap[driver.id] = true;
  //   this.formService.deleteDataCheck({ 'id': [driver.id] })
  //     .subscribe((data: any) => {
  //       if (data.status === HttpStatusCodeEnum.Success) {
  //         this.submitted = false;
  //         this.getDriversListing(this.filters);
  //         this.closeForm.nativeElement.click();
  //         this.swalService.getSuccessSwal(data.message);
  //       } else {
  //         this.swalService.getErrorSwal(data.message);
  //         console.log(data.message);
  //       }
  //     }
  //     );
  // }

  async showSwal(user, tab) {
    this.selectedUserId = user;
    console.log('user', user);

    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
    const shouldDelete = await this.swalService.getDeleteSwal(user, 'What do you want to do with ' + user.email + ' ?');
    console.log('shouldDelete', shouldDelete);
    if (tab == 'driverList') {
      console.log("coming in check");
      if (shouldDelete) {
        console.log("coming in should del");
        const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
        this.deleteUser(user.id, shouldDelete, 'Record has been' + message +
          'successfully');
      }
    } else {
      if (shouldDelete) {
        console.log("coming in should del2");
        const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
        this.deleteDriverGroup(user.id, shouldDelete, 'Record has been' + message +
          'successfully');
      }
    }

  }

  // Delete bin
  deleteUser(userId, actionType, message?) {
    const params = {};
    params['id'] = (userId);
    params['status'] = actionType;

    console.log('params', params);
    this.formService.deleteDataCheck(params)
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(message);
          this.getDriversListing(this.filters);
          this.getGroupListingType(this.filters);
        } else {
          console.log(data.message);
          this.swalService.getErrorSwal(data.message)
        }
      })
  }
  deleteDriverGroup(userId, actionType, message?) {
    const params = {};
    params['id'] = (userId);
    params['status'] = actionType;

    console.log('params', params);
    this.entityService.deleteGroup(params)
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(message);
          this.getDriversListing(this.filters);
          this.getGroupListingType(this.filters);
          this.getGroupList();
        } else {
          console.log(data.message);
          this.swalService.getErrorSwal(data.message)
        }
      })
  }

  openEditModal1(group) {
    this.finallist = group;
    console.log(group)
    this.selectedGroupID = group.id;
    this.updateEdit2 = false;
    this.formTitle = "Update Driver Group";
    this.btnText = 'Update';

    let drivers_group = [];

    console.log(group.associated_group_driver)

    if (group.associated_group_driver && group.associated_group_driver.length > 0) {
      group.associated_group_driver.forEach(element => {
        drivers_group.push(element);
      });
    }
    console.log(group.other_group_driver);


    if (group.other_group_driver && group.other_group_driver.length > 0) {
      group.other_group_driver.forEach(element => {
        drivers_group.push(element);
      });
    }

    this.groupDriverList = drivers_group.map(
      item => new DropDownItem(item['id'], item['name'])
    );

    // this.selectDriver = group.associated_group_driver;

    this.selectedDriver = [];
    for (let i = 0; i < group.associated_group_driver.length; i++) {
      this.selectedDriver.push(new DropDownItem(group.associated_group_driver[i]['id'], group.associated_group_driver[i]['name']));
    }

    this.GroupForm.patchValue({
      name: group.name,
      id: group.id,
      countNumber: group.count
    });
  }

  openEditModal(driver) {

    // if (driver.contact_number.includes(this.countryCode[0]?.code)) {
    //   this.dynamicMask = "9999999999";
    // } else if (driver.contact_number.includes(this.countryCode[1]?.code)) {
    //   this.dynamicMask = "99999999";
    // }
    this.dynamicMask = "99999999";

    for (let i = 0; i < this.statusList.length; i++) {
      if (driver.status == this.statusList[i].id) {
        console.log("this.statusList[i]== ", this.statusList[i]);
        driver.status = this.statusList[i].id;
        this.selectedStatus = { value: this.statusList[i].id, label: this.statusList[i].name, id: this.statusList[i].id, name: this.statusList[i].name }
      }
    }
    console.log("driver data- ", driver)
    this.selectedUserId = driver.id;
    this.passwordVisible = false;
    this.show_password = false;
    this.avatar_url = '';
    // this.clearForm(driver);
    this.formTitle = 'Update Driver';
    this.btnText = "Update";
    // this.btnText = "Update"
    this.onShift = driver.on_shift;
    // this.avatar = null;

    this.selectedGender = [{ value: driver['gender'], label: driver['gender_label'] }];

    for (let i = 0; i < this.statusList.length; i++) {
      if (driver.status == this.statusList[i].id) {
        setTimeout(() => {
          driver.status = this.statusList[i].id;
        }, 500);
        this.selectedStatus = { value: this.statusList[i].id, label: this.statusList[i].name, id: this.statusList[i].id, name: this.statusList[i].name }
      }
    }

    let found = {};
    for (let i = 0; i < this.itemListMaritalStatus.length; i++) {
      if (this.itemListMaritalStatus[i].value == driver.marital_status) {
        found = this.itemListMaritalStatus[i].value;
        break;
      }
    }
    console.log("found=== ", found);

    // this.selectedMaritalStatus = { value: driver['marital_status'], label: driver['marital_status_label'] };
    // console.log("this.selectedMaritalStatus= ", this.selectedMaritalStatus);

    // this.inactiveRecord = (driver.status === this.EntityStatusEnum.Inactive);

    this.dob = driver['dob'] ? new Date(driver['dob']) : null;
    this.date_of_joining = driver['date_of_joining'] ? new Date(driver['date_of_joining']) : null;
    // let truck_list;
    // if (!(driver['assigned_truck'] === null)) {
    //   truck_list = new PrimengDropdownItem(driver.assigned_truck.id, driver.assigned_truck.name);
    //   this.getTrucks(truck_list);
    // } else {
    //   truck_list = null;
    //   this.getTrucks(null);
    // }
    this.avatar_url = isNullOrUndefined(driver.photo) ? null : driver.photo;

    // if (driver.contact_number.includes(this.countryCode[0]?.code)) {
    //   this.dynamicMask = "9999999999";
    //   this.selectedCountry = this.countryCode[0]?.code;
    //   driver.contact_number = driver.contact_number.replace(this.selectedCountry, '');
    // } else if (driver.contact_number.includes(this.countryCode[1]?.code)) {
    //   this.dynamicMask = "99999999";
    //   this.selectedCountry = this.countryCode[1]?.code;
    //   driver.contact_number = driver.contact_number.replace(this.selectedCountry, '');
    // }
    this.selectedCountry = this.countryCode[0]?.code;
    driver.contact_number = driver.contact_number.replace(this.selectedCountry, '');

    this.driverForm.patchValue({
      id: driver.id,
      name: driver.name,
      cnic: driver.employee_id,
      salary: isNullOrUndefined(driver.salary) ? '' : driver.salary,
      email: driver.driver_email,
      type: driver.type,
      marital_status_id: driver.marital_status,//this.selectedMaritalStatus, //driver.marital_status_id,
      gender_id: driver.gender,//setGender,//this.selectedGender, //driver.gender_id,
      dob: this.dob ? this.dob : '',
      date_of_joining: this.date_of_joining ? this.date_of_joining : '',
      contact_number: driver.contact_number,
      is_poi: driver.is_poi,
      driver_group_id: isNullOrUndefined(driver.driver_group) ? '' : driver.driver_group,
      status: this.selectedStatus.id
    }, { emitEvent: false })

    setTimeout(() => {
      this.driverForm.get('contact_number').setValue(driver.contact_number)
    }, 300);

  }

  togglePassword(value) {
    console.log(value);
    this.show_password = value;
    // this.hidePassword=false;
  }
  togglePassword1() {
    this.show_password = false;
  }
  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }
  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      // console.log(key,data[key]);
      form_data.append(key, data[key]);
    }
    return form_data;
  }
  onSubmitDriver(formValue) {
    this.submitted = true;
    // console.log(formValue);
    // if(formValue['driver_group_id'] === null || formValue['driver_group_id'] === undefined)
    // {
    //   formValue['driver_group_id']=1;
    // }
    if (this.validate2()) {
      if (formValue.countNumber != null) {
        console.log("patch");
        this.patchGroup(formValue);
        // formValue['id']=id;entityService
        // this.patchDriver(formValue);
        // this.driverForm.reset();
      } else {
        console.log(formValue);
        this.postGroup(formValue);
        // this.postDriverForm(formValue);
      }
    }
    else {
      console.log(this.errorMessages);
    }
  }
  // deleteGroup(id) {
  //   console.log(id);
  //   this.entityService.deleteGroup(id).subscribe(res => {
  //     console.log('postData() response=', res);
  //     if (res.status === HttpStatusCodeEnum.Success) {
  //       this.swalService.getSuccessSwal(res.message);
  //       this.getGroupListingType(this.filters);
  //       this.submitted = false;
  //       this.closeForm2.nativeElement.click();
  //       this.closeForm2.closeModal();

  //       // this.getDrivers(this.filterDrivers);
  //     } else {
  //       console.log(res.message);
  //       this.swalService.getErrorSwal(res.message);
  //     }
  //   })
  // }

  patchGroup(params) {
    let selectedIds = [];
    if (this.selectedDriver && this.selectedDriver.length > 0) {
      this.selectedDriver.forEach(element => {
        selectedIds.push(element.id);
      });
      params.driver_group_ids = selectedIds;
      this.entityService.updateDriverGroup(this.finallist.id, params).subscribe((data: any) => {
        console.log('postData() response=', data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(data.message);
          this.getDriversListing(this.filters);
          this.getGroupListingType(this.filters);
          this.getGroupList();
          this.submitted = false;
          this.closeForm2.nativeElement.click();
          this.closeForm2.closeModal();

          // this.getDrivers(this.filterDrivers);
        } else {
          console.log(data.message);
          this.swalService.getErrorSwal(data.message);
        }
      })
    }

  }
  postGroup(param) {
    let array = [];
    for (let x = 0; x < param.selectDriver.length; x++) {
      array.push(param.selectDriver[x].id);
    }
    console.log(array);
    // let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}&status=${filters.status}`;
    // let params =`name=${param.name}&driver_list=${array}`;
    let params =
    {

    };
    params['name'] = param.name;
    params['driver_list'] = array;
    // param['photo']=null;
    console.log(params, "21");

    this.entityService.setDriverGroup(params)
      .subscribe((data: any) => {
        console.log('postData() response=', data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(data.message);
          this.getDriversListing(this.filters);
          this.getGroupListingType(this.filters);
          this.getGroupList();
          this.submitted = false;
          this.closeForm2.nativeElement.click();
          this.closeForm2.closeModal();
        } else {
          console.log(data.message);
          this.swalService.getErrorSwal(data.message);
        }
      })

    this.btnText = "Save";

  }
  onSubmit(formValue) {
    this.submitted = true;

    if (this.validate()) {
      const id = this.driverForm.getRawValue().id;
      if (formValue['dob']) {
        const dob = new Date(formValue['dob']);
        if (formValue['date_of_joining']) {
          const date_of_joining = new Date(formValue['date_of_joining']);
          if (dob >= date_of_joining) {
            this.date_of_joining = null;
            this.swalService.getWarningSwal('Date of Joining Should be greater than Date of Birth');
            return;
          }
          formValue['date_of_joining'] = DateUtils.getYYYYMMDD(formValue['date_of_joining']);
        }
        formValue['dob'] = DateUtils.getYYYYMMDD(formValue['dob']);
      }
      formValue['text_password'] = formValue['password'];
      formValue['type_id'] = EntityType.DRIVER;

      if (!isNullOrUndefined(this.avatar) && !isNullOrUndefined(this.avatar_url)) {
        formValue['photo'] = this.avatar;
      } else {
        if (this.isEditImage) {
          formValue['photo'] = 'remove';
        } else {
          delete formValue['photo'];
        }
      }

      formValue['email'] = formValue.email.toLowerCase();
      console.log('formValue', formValue);

      // this.disableSubmitButton();
      if (id) {
        formValue['id'] = id;
        this.patchDriver(formValue);
        // this.driverForm.reset();
      } else {
        this.postDriverForm(formValue);
      }
    } else {
      console.log(this.errorMessages);
    }
  }
  postDriverForm(param) {
    // if (param.driver_group_id === null || param.driver_group_id === 'null') {
    //   param.driver_group_id = 1;
    // }
    param.contact_number = this.selectedCountry + param.contact_number;

    this.formService.postData(param)
      .subscribe((data: any) => {
        console.log('postData() response=', data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.submitted = false;
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getDriversListing(this.filters);
          this.getGroupListingType(this.filters);
          this.getListGroupDriver();
          // this.getDrivers(this.filterDrivers);
        } else {
          console.log(data.message);
          // this.closeForm.nativeElement.click();
          this.swalService.getErrorSwal(data.message);
        }
      })

    this.btnText = "Save";

  }

  patchDriver(driver) { //driver: FormData

    // driver.append('id', String(this.selectedDriver.id));
    // driver.append('type', String(this.selectedRole));
    // Display the values

    driver.contact_number = this.selectedCountry + driver.contact_number;

    this.formService.patchData(driver)
      .subscribe((data: any) => {
        console.log(data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.driverForm.reset();
          this.submitted = false;
          this.isEditImage = false;
          // this.getDrivers(this.filterDrivers)
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getDriversListing(this.filters);
          this.getGroupListingType(this.filters);
          this.getListGroupDriver();

        } else {
          this.swalService.getErrorSwal(data.message);
          // this.closeForm.nativeElement.click();
          console.log(data.message);
        }
      })
  }
  getUsers(filters) {
    this.showIndeterminateProgress = true;

    // let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}&status=${filters.status}`;
    console.log("params for getUserList()= ", params);

    this.userService.getUsers(params).subscribe((data: any) => {
      console.log("getUsers()- ", data);
      this.showIndeterminateProgress = false;

      if (data.status === HttpStatusCodeEnum.Success) {
        this.users = data['data'].data;
        this.totalUserLength = data['data'].count;
        this.users.pagination = this.totalUserLength;
      } else {
        console.log(data.message);
      }
      console.log("this.users= ", this.users);
    });
  }
  returndob() {
    setTimeout(() => {
      if (this.dob) {
        if (this.date_of_joining) {
          const a: any = (this.dob.valueOf());
          const b: any = (this.date_of_joining.valueOf());
          console.log(a, b);
          if (a >= b) {
            this.date_of_joining = null;
          }
        }
      }
    }, 200);
  }

  setupLocations() {
    this.locations = this.trucks.map(item =>
      new EntityWithIconLocation(item.id, item.last_latitude, item.last_longitude,
        [new Item('Name', item.name),
        new Item('Status', item.online_status),
        new Item('Speed', ((item.last_speed > 5) ? Math.round(item.last_speed) : 0) + ' km/h'),
        // new Item('Vehicle Type', item['vehicle_type']),
        new Item('Last Updated', DateUtils.getLocalMMDDYYYYhhmmss(item['last_updated'])),
        new Item('Location', (item['location_address']) ? item['location_address'] : '-')
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
          // this.map.fitBounds(this.bounds1);
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

    const map = this.map;

    marker.addListener('mouseover', function () {
      infowindow.open(map, this);
    });
    marker.addListener('mouseout', function () {
      infowindow.close();
    });

    return marker;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.connection) {
      this.connection.stop();
    }
  }


  clear() {
    this.bulkUploadForm.reset();
    this.selectedFileName = '';
    this.notCSVExcel = false;
    this.selectedFile = null;
    this.disableButton = true;
  }

  bulkUploadFileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.selectedFile = file;

      if (this.selectedFile.type.indexOf('.sheet') != -1 || this.selectedFile.type.indexOf('.ms-excel') != -1) {
        this.notCSVExcel = false;
        this.disableButton = false;
      } else {
        this.disableButton = true;
        this.notCSVExcel = true;
      }

      this.selectedFileName = this.selectedFile.name;
    }
  }

  // bulkUploadSubmit(formValue) {
  //   console.log("inside submit function(formValue)= ", formValue);
  //   const params: FormData = new FormData();

  //   if (!isNullOrUndefined(formValue['csvFiles'])) {
  //     params.append('file', this.selectedFile);
  //   }

  //   // this.userService.uploadUserBulkUpload(params).subscribe((data: any) => {
  //   //   console.log("uploadBulk() response= ", data);

  //   //   if (data.status === HttpStatusCodeEnum.Success) {
  //   //     this.closeFormBulk.nativeElement.click();
  //   //     this.swalService.getSuccessSwal(data.message);
  //   //     // this.getUsers(this.filtersUser);
  //   //     this.clear();
  //   //     this.bulkUploadForm.reset();
  //   //   } else {
  //   //     console.log("data.message== ", data.message)
  //   //     this.swalService.getErrorSwal(data.message['error_message']);
  //   //   }

  //   // })
  // }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.forEach(row => this.selection.select(row));
  }

  deleteThroughCheckbox() {
    this.selectedIDToDelete = [];

    if (this.selection.selected.length > 0) {
      for (let i = 0; i < this.selection.selected.length; i++) {
        this.selectedIDToDelete.push(this.selection.selected[i].id);
      }
      console.log("this.selectedIDToDelete=== ", this.selectedIDToDelete)
    }
  }

  async showSwalForSelectedDelete() {

    const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this record(s)?');
    // const shouldDelete = await this.swalService.getDeleteSwal(user, 'What do you want to do with this record? ');
    console.log('shouldDelete', shouldDelete);
    if (shouldDelete) {
      console.log("coming in should del");
      this.deleteThroughCheckbox()
    }

  }
  getSelectedCountry(country) {
    if (country.code == "+92") {
      this.dynamicMask = "9999999999";
    } else {
      this.dynamicMask = "99999999";
    }
    this.selectedCountry = country.code;
  }



  downloadXLS(download) {

    if (this.add_btn === 0) {
      this.formService.downloadDriverListingXLS(download).subscribe((apiResponse: any) => {
        console.log("downloadXLS response== ", apiResponse)
        const data = apiResponse;
        const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob)
        this.xlsPdfService.downloadXlsPdf(url,'Driver-Reports.xls')
      })
    } else {
      this.formService.downloadDriverGroupXLS(download).subscribe((apiResponse: any) => {
        console.log("downloadXLS response== ", apiResponse)
        const data = apiResponse;
        const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob)
        this.xlsPdfService.downloadXlsPdf(url,'Driver-Reports.xls')
      })
    }



  }

  downloadPDF(download) {
    if (this.add_btn === 0) {
      this.formService.downloadDriverListingPDF(download).subscribe((apiResponse: any) => {
        const data = apiResponse;
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob)
        this.xlsPdfService.downloadXlsPdf(url,'DriverGroup-Reports.pdf')
      })
    } else {
      this.formService.downloadDriverGroupPDF(download).subscribe((apiResponse: any) => {
        const data = apiResponse;
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob)
        this.xlsPdfService.downloadXlsPdf(url,'DriverGroup-Reports.pdf')
      })
    }
  }



}
