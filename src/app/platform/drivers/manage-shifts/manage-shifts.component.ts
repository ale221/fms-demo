import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { isValid } from 'date-fns';
import { of, Subject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
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
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';

@Component({
  selector: 'app-manage-shifts',
  templateUrl: './manage-shifts.component.html',
  styleUrls: ['./manage-shifts.component.css'],
  animations: [
    trigger('detailExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ManageShiftsComponent implements OnInit {

  items = [{ label: 'Drivers', url: null }];
  home = { label: 'Dashboard' };

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  trucks = [];
  users;//: any = [];
  weekarraylist = [];
  finalistArry = [];
  filtersUser = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search: '', status: '' };
  resetFilters = false;
  displayedColumns = ["name", 'start_date', 'end_date', 'status_id', 'driver_count', 'created_datetime', 'action'];
  locations: EntityWithIconLocation[] = [];
  mapData;
  customDayNames = {
    MondayStartTime: '',
    MondayEndTime: '',
    TuesdayStartTime: '',
    TuesdayEndTime: '',
    WednesdayStartTime: '',
    WednesdayEndTime: '',
    ThursdayStartTime: '',
    ThursdayEndTime: '',
    FridayStartTime: '',
    FridayEndTime: '',
    SaturdayStartTime: '',
    SaturdayEndTime: '',
    SundayStartTime: '',
    SundayEndTime: '',
  };
  EntityStatusEnum = EntityStatusEnum;
  connection: SignalRConnection;
  subscription: Subscription;
  signalRstarted = [];
  errorMessages: string[];
  searchText;
  currentDate = new Date();
  driverForm: FormGroup;
  searchForm: FormGroup;
  @ViewChild('closeForm') private closeForm;
  itemListMaritalStatus = [];
  showIndeterminateProgress: boolean;
  downloadableLink;
  downloadableLink1;
  loggedInUser;
  customerID;
  inactiveRecord;
  itemListGenders = [];
  onShift = null;
  submitted: boolean;
  formTitle = 'Add New Shift';
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
  dayChange;
  everyDayChecked = false;
  weekDaychecked = false;
  weekendDayChecked = false;
  getSelectedDates = [];
  getDayName = [];
  contractStartDate: Date;
  shiftstartDay;
  daysName = [{ name: "Sunday" }, { name: "Monday" }, { name: "Tuesday" }, { name: "WednesDay" }, { name: "Thursday" }, { name: "Friday" }, { name: "Saturday" }]
  weekArr = [];
  shiftsArray = [];
  selectedUser;
  demoTimeStart;
  demoTimeEnd;
  isAuthorized = false;

  @ViewChildren("startTime") getDayNames;
  @ViewChildren("endTime") getDayNamesEnd;
  @ViewChildren("itemHidden") itemHidden;
  @ViewChild('editpop') private editpop;

  driverLists = [];
  typeList = [];
  shiftOption = [{ id: 1, name: 'Morning' }, { id: 2, name: 'Evening' }, { id: 3, name: 'Night' }];
  widgetData = [
    { name: 'Refresh', icon: 'fa fa-refresh', route: '', reload: true },
    { name: 'Export', icon: 'fa fa-download', route: '' },
    { name: 'Share', icon: 'fa fa-share-alt', route: '', subNav: [{ name: 'Whatsapp', route: "" }, { name: 'Email', route: '' }] },
    { name: 'Manage', icon: 'fa fa-crosshairs-alt', route: '/iol/admin/config', target: true, url: 'http://52.178.0.56/admin', queryParam: true },
    { name: 'Allocate', icon: 'fa fa-location-arrow', route: '', subNav: [{ name: 'Vehice to Fleet', route: '' }, { name: 'Driver to Vehicle', route: '' }, { name: 'Driver to Shift', route: '' }] },
    { name: 'Shift', icon: 'fa fa-map-marker', route: 'shifts' },
    { name: 'Task', icon: 'fa fa-map-marker', route: 'template' }
  ]
  copySignalR: any;
  dataSource: any;
  cardsArray;
  graphsArray;
  itemListTrucks = [];
  mapZoom;
  theme;
  add_btn = 0;
  filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '', driver_group: '', driver_id: '' };

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
  selectedUserId = false;
  selectedCheckbox = false;
  statusList = [{ id: 1, name: "Active" }, { id: 2, name: "Inactive" }];
  selectedStatus;
  breadcrumbInner = [];
  tempIcon = 'assets/images/iol/icon-map-pin-end.png';
  @ViewChild(FiltersComponent) filtersComponent: FiltersComponent; // get child component to use its method resetFilter
  btnLoading: boolean;
  userForm: FormGroup;
  sidebarCheck: any;

  constructor(private driverService: DriverDetailsService, private userService: UserService, private formService: FormService, private swalService: SwalService, private entityService: EntityService, private formBuilder: FormBuilder,
    private brandingService: BrandingService,
    private getUsecase: GetUsecaseService,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private filtersService: FiltersService,
    private breadcrumbService: BreadcrumbsService,
    private drawerService: DrawerService,
    private xlsPdfService: XlsPdfService) {
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.connection = this.route.snapshot.data['connection'];
    this.searchForm = this.formBuilder.group({
      search: [''],
      selectGroup: [''],
      selectedDriver: ['']
    })
    this.driverForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      job_name: ['', [Validators.required]],
      selectShift: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: [null, [Validators.required]],
      status: [null, [Validators.required]],
    }, { emitEvent: false });
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
      }
    })

    if (this.breadcrumbInner[0] == 'admin/config') {
      setTimeout(() => {
        this.editpop.nativeElement.click();
      }, 1000);
    }
    this.statusList.forEach((element: any) => {
      element.label = element.name;
      element.value = element.id;
    });
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;

    // this.downloadableLink = environment.baseUrl + '/iof/shiftsxle/?customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/shiftspdf/?customer_id=' + this.customerID;

    this.downloadableLink = '';
    this.downloadableLink1 = '';


    this.shiftstartDay = new Date();
    this.shiftOption.forEach((element: any) => {
      element.label = element.name;
      element.value = element.id;
    });

    this.btnText = "Submit";
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
        // if (this.filters['fleet_id']) {
        //   this.getAllZones(this.filters['fleet_id'] ? this.filters['fleet_id'] : this.filters['fleet_id'].id);
        // }
        //Reset all map variables, arrays
        this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
        // this.getDriversForMap(this.filters)
        // this.showLabelsOnMap(this.filters['showLabels']);
      }
    });

    this.getDriversListing(this.filters)
    // this.getDriversForMap(null);
    // this.getAllZones(null);

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
    this.getGroupList();


    this.formService.getOptionsforDropDown('dropdown_data', { option_key: 'gender' }).subscribe((data: any) => {
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
    })


    this.formService.getOptionsforDropDown('dropdown_data', { option_key: 'maritalstatus' }).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.itemListMaritalStatus = data.response['option_values'].map(
          item => ({ value: item['id'], label: item['label'] })
        );
      } else {
        this.swalService.getErrorSwal(data.message);
      }
    })

  }

  getStartDate(event) {
    this.getSelectedDates = [];
    this.getSelectedDates.push(event);
    this.getDayName = [];
  }
  patchDatewithDays(start, end) {
    // this.getSelectedDates.push($event);
    var startDate = start; //YYYY-MM-DD
    var endDate = end; //YYYY-MM-DD

    var getDateArray = function (start, end) {
      var arr = new Array();
      var dt = new Date(start);
      while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
      }
      return arr;
    }
    var dateArr = getDateArray(startDate, endDate);

    // Output
    for (var i = 0; i < dateArr.length; i++) {
      this.getDayName.push(moment(dateArr[i]).format('dddd'));
    }
    this.getDayName = this.getDayName.filter((element, i) => i === this.getDayName.indexOf(element))
    // const result = Array.from(this.getDayName.reduce((m, t) => m.set(t.name, t), new Map()).values());
  }
  getEndDate(event) {
    this.getSelectedDates.push(event);
    if (this.getSelectedDates[1] != null) {
      this.getSelectedDates[1] = event;
    }
    let startDateConvert = DateUtils.getYYYYMMDD(this.getSelectedDates[0]);
    startDateConvert = startDateConvert + ' 00:00:00'
    var startDate = new Date(startDateConvert); //YYYY-MM-DD
    var endDate = new Date(this.getSelectedDates[1]); //YYYY-MM-DD

    var getDateArray = function (start, end) {
      var arr = new Array();
      var dt = new Date(start);
      while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
      }
      return arr;
    }

    var dateArr = getDateArray(startDate, endDate);

    // Output
    this.getDayName = [];
    for (var i = 0; i < dateArr.length; i++) {
      this.getDayName.push(moment(dateArr[i]).format('dddd'));
    }
    this.getDayName = this.getDayName.filter((element, i) => i === this.getDayName.indexOf(element))

    // const result = Array.from(this.getDayName.reduce((m, t) => m.set(t.name, t), new Map()).values());
    // let count=1;
    // for(let x=0;x<this.getDayName.length;x++)
    // {
    //   if(this.getDayName[x]['day'] === "Sunday")
    //   {
    //    count= count+1;
    //    this.getDayName[x]['value']=count;
    //   }
    //   else
    //   {
    //     this.getDayName[x]['value']=count;
    //   }

    // }






    //



    // best codeeeeeeeeeeeeeeeeeeeeeeeeeeeee

    // debugger
    // for(let finl=0;finl<this.getDayName.length;finl++)
    // {
    //   if(this.getDayName[finl] === "Sunday")
    //   {
    //     // this.weekarraylist
    //     // ['data'].pus

    //   }
    //   else{
    //     // this.weekarraylist['data'].push(this.getDayName[finl]);
    //   }

    //   this.weekarraylist
    // }


    // let params={
    //   week:'',
    //   days:[]
    // };
    // let val;
    // for(let c=0;c<this.weekarraylist.length;c++)
    // {

    //   params['week']='';
    //   params['days']=[];
    //   params['week']=this.weekarraylist[c];
    //   if(val === "Sunday")
    //   {
    //     params['days'].push("Sunday");
    //     this.getDayName.shift();
    //     val='';
    //   }
    //   for(let d=0;d<this.getDayName.length;d++)
    //   {
    // debugger
    //   if(this.getDayName[d] === "Sunday" && d === 0)
    //   {
    //     val=getDateArray[d];
    //     // // console.log(this.getDayName[d]);
    //     // params['days'].push(this.getDayName[d]);
    //     // this.getDayName.shift();
    //     break;
    //   }
    // else  if(this.getDayName[d] === "Sunday" && d != 0)
    //   {
    //     // params['days'].push(this.getDayName[d]);
    //     // this.getDayName.shift();
    //     // console.log(this.getDayName[d]);
    //     break;

    //   }
    //   else{
    //     // console.log(this.getDayName[d]);
    //     params['days'].push(this.getDayName[d]);
    //     this.getDayName.shift();
    //   }
    //   if(this.getDayName[d] === "Sunday")
    //   {
    //     val=this.getDayName[d];
    //     for(let x=0;x<d;x++)
    //     {
    //       this.getDayName.shift();
    //     }
    //     // console.log(this.getDayName,"oiuutyyut");
    //     break;
    //   }
    //   if(this.getDayName[d] !== "Sunday")
    //   {
    //     params['days'].push(this.getDayName[d]);
    //     // this.getDayName.shift();
    //   }
    //   }
    //   this.finalistArry.push(params);
    // }
    // // console.log(this.finalistArry);









    /*
    let xse=this.getRandomInt(weeknumberss);

    // let wyulsmkd=Math.random(weeknumberss);
    // // console.log("weeknumbers",xse);
    for(let xy=1;xy<=weeknumberss;xy++)
    {
      this.weekarraylist.push('week'+xy);
    }







      var startDate = this.getSelectedDates[0]; //YYYY-MM-DD
      var endDate = this.getSelectedDates[1]; //YYYY-MM-DD

      var getDateArray = function(start, end) {
          var arr = new Array();
          var dt = new Date(start);
          while (dt <= end) {
              arr.push(new Date(dt));
              dt.setDate(dt.getDate() + 1);
          }
          return arr;
      }

      var dateArr = getDateArray(startDate, endDate);

      // Output
      // console.log("<p>Start Date: " + startDate + "</p>");
      // console.log("<p>End Date: " + endDate + "</p>");
      // console.log("<p>Date Array</p>")
      for (var i = 0; i < dateArr.length; i++) {
        // console.log("<p>" + dateArr[i] + "</p>");
        this.getDayName.push(moment(dateArr[i]).format('dddd'))
      }
      // console.log(this.getDayName);
      let params={
        week:'',
        days:[]
      };
      let val;
      for(let c=0;c<this.weekarraylist.length;c++)
      {

        params['week']='';
        params['days']=[];
        params['week']=this.weekarraylist[c];
        if(val === "Sunday")
        {
          params.days[0].push("Sunday");
          val='';
        }
        for(let d=0;d<this.getDayName.length;d++)
        {
        //   if(this.getDayName[d] === "Sunday" && d === 0)
        //   {
        //     val=getDateArray[d];
        //     // // console.log(this.getDayName[d]);
        //     // params['days'].push(this.getDayName[d]);
        //     // this.getDayName.shift();
        //     break;
        //   }
        // else  if(this.getDayName[d] === "Sunday" && d != 0)
        //   {
        //     // params['days'].push(this.getDayName[d]);
        //     // this.getDayName.shift();
        //     // console.log(this.getDayName[d]);
        //     break;

        //   }
        //   else{
        //     // console.log(this.getDayName[d]);
        //     params['days'].push(this.getDayName[d]);
        //     this.getDayName.shift();
        //   }
        if(this.getDayName[d] === "Sunday")
        {
          val=this.getDayName[d];
          for(let x=0;x<d;x++)
          {
            this.getDayName.shift();
          }
          // console.log(this.getDayName,"oiuutyyut");


          break;
        }
        if(this.getDayName[d] !== "Sunday")
        {
          params['days'].push(this.getDayName[d]);
          // this.getDayName.shift();
        }
        }
        this.finalistArry.push(params);
      }
      // console.log(this.finalistArry);


      */
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }


  activeTabFuction(index) {
    this.add_btn = index.index;
  }
  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.driverForm.get('job_name').hasError('required')) {
      this.errorMessages.push('Job Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('selectShift').hasError('required')) {
      this.errorMessages.push('Shift Type ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('startDate').hasError('required')) {
      this.errorMessages.push('CNIC ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.driverForm.get('endDate').hasError('required')) {
      this.errorMessages.push('Date of Birth ' + ErrorMessage.REQUIRED);
      isValid = false;
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


  changeDay(event) {
    this.dayChange = event.target.value;
    if (this.dayChange == "everyday") {
      for (let x = 0; x < this.getDayName.length; x++) {
        let y = this.getDayName[x] + 'CB';
        this.driverForm.get(y).setValue(true);
      }

      this.everyDayChecked = true;
      this.weekDaychecked = false;
      this.weekendDayChecked = false;
    }
    else if (this.dayChange == "workingday") {
      this.everyDayChecked = false;
      this.weekDaychecked = true;
      this.weekendDayChecked = false;
      this.driverForm.get("SundayCB").setValue(true);
      this.driverForm.get("MondayCB").setValue(true);
      this.driverForm.get("TuesdayCB").setValue(true);
      this.driverForm.get("WednesdayCB").setValue(true);
      this.driverForm.get("ThursdayCB").setValue(true);
    }
    else if (this.dayChange == "weekend") {
      this.everyDayChecked = false;
      this.weekDaychecked = false;
      this.weekendDayChecked = true;
      this.driverForm.get("FridayCB").setValue(true);
      this.driverForm.get("SaturdayCB").setValue(true);
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
    // const mapProp = GoogleMapModel.getMapProp();
    // this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    // this.mapZoom = this.map.getZoom();
  }

  getSelectedWidgetOption(event) {
    if (event.reload) {
      this.filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '', driver_group: '', driver_id: '' };
      this.getDriversListing(this.filters);
      this.resetMap(); this.locations = []; this.trucks = []; this.mapData = [];
      // this.getDriversForMap(this.filters);
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
  getGroupList() {
    this.driverService.getDriverGroup().subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverGroup = data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
        //  this.driverGroup=data.data;
        this.driverLists = [];
        this.typeList = [];
        //  this.reportTypeTable=0;
      } else {
        // console.log(data.message);
      }
    });
  }
  shiftDropdownChange($event) {
    if ($event.value == 1) {
      this.demoTimeStart = ('09:30');
      this.demoTimeEnd = ('17:30');
    }
    else if ($event.value == 2) {
      this.demoTimeStart = ('17:30');
      this.demoTimeEnd = ('01:30');
    }
    else if ($event.value == 3) {
      this.demoTimeStart = ('01:30');
      this.demoTimeEnd = ('09:30');
    }
    // 9.30am 5.30pm
    // 5.30pm 1.30am
    // 1.30am 9.30am
    this.getDrivers($event.value);
  }
  selectDriverDropDownChange($event) {
    // console.log($event)
  }
  selectTypeDropDownChange($event) {


  }

  getType(typeId) {

  }
  getDrivers(driverGroupID) {
    this.driverService.getDriver(driverGroupID).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverLists = data.data.map(
          item => new DropDownItem(item['id'], item[
            'driver_name'])
        );
        this.typeList = [];
      } else {
        // console.log(data.message);
      }
    });
  }


  getDriversListing(filters) {
    this.loadingFilter = true;
    this.mapLoader = {
      visibility: this.loadingFilter,
      dataError: true
    }
    let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search_key}&time_zone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    this.entityService.getShift(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.loadingFilter = false;
        this.mapLoader = {
          visibility: this.loadingFilter,
          dataError: false
        }
        this.dataSource = apiResponse['data'].data;
        this.totalLength = apiResponse['data'].counts;
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

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getDriversListing(this.filters);
  }

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get("search").setValue('');
    this.filtersUser.search = "";
    this.getUsers(this.filtersUser);
    // this.downloadableLink = environment.baseUrl + '/iof/shiftsxle/?customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/shiftsxle/?customer_id=' + this.customerID;

    this.downloadableLink = '';
    this.downloadableLink1 = '';
  }

  // getDriversForMap (filters) {
  //   this.entityService.getFleetDriversForMap(filters).subscribe(apiResponse => {
  //     if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
  //       this.mapData = apiResponse['data'].data;
  //       if (this.mapData && this.mapData.length > 0) {
  //         this.trucks = [...this.mapData, ...this.trucks];
  //         this.setupLocations();
  //         this.setupSignalR();
  //       }
  //     }
  //   })
  // }

  // getAllZones(params) {
  //   if (params) {
  //     params = '?fleet_id=' + params;
  //   }
  //   this.entityService.getZonesDropdown(params).subscribe(apiResponse => {
  //     if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
  //       this.drawGeozones(apiResponse.data);
  //     }
  //   })
  // }

  // drawGeozones(geozones) {
  //   if (geozones && geozones.length > 0) {
  //     geozones.forEach(element => {
  //       this.drawTerritory(element.territory, element.name)
  //     });
  //   }
  // }

  // drawTerritory(cords, title?, opts?, height = 250) {
  //   // this.resetMap();
  //   const bounds = this.bounds;
  //   // let bounds = new google.maps.LatLngBounds();
  //   const arr = [];
  //   let cordsArray = [];
  //   cordsArray = cordsArray.concat(cords);
  //   for (let i = 0; i < cordsArray.length; i++) {
  //     // const obj = JSON.parse(cordsArray[i]);
  //     const polygonShape = new google.maps.Polygon({
  //       paths: cordsArray,
  //     });
  //     if (opts) {
  //       polygonShape.setOptions(({ strokeWeight: 1, strokeColor: opts[i].strokeColor, fillColor: opts[i].fillColor }));
  //     } else {
  //       polygonShape.setOptions(({ strokeWeight: 1, strokeColor: '#000', fillColor: '#7799b3' }));
  //     }
  //     // polygonShape.setOptions(({ strokeColor: '#9999ff', fillColor: '#7799b3'}));

  //     polygonShape.setMap(this.map);
  //     polygonShape.getPath().forEach(function (element, index) {
  //       const obj = { lat: null, lng: null };
  //       bounds.extend(element);
  //       obj.lat = element.lat();
  //       obj.lng = element.lng();
  //       arr.push(obj);

  //     });
  //     // strokeColor: '#000',
  //     //   fillColor: '#7799b3'
  //     if (title) {
  //       polygonShape.addListener('click', event => {
  //         polygonShape.setOptions({ fillColor: '#0000ff' });
  //         this.myInfowindow.setContent('Territory Name: ' + title);
  //         this.myInfowindow.setPosition(event.latLng);
  //         this.myInfowindow.open(this.map);
  //       });
  //       this.shapes[title] = polygonShape;
  //       polygonShape.addListener('mousemove', event => {
  //         this.myInfowindow.close();
  //         polygonShape.setOptions({ fillColor: opts ? opts[i].fillColor : '#7799b3' });

  //       });

  //     }

  //     this._markers.push(polygonShape);
  //   }
  //   //
  //   this.map.fitBounds(bounds);
  //   // const z = this.getBoundsZoomLevel(bounds, { height: height, width: 390 });
  //   // this.map.setZoom(z);
  //   this.map.setCenter(bounds.getCenter());
  //   if (cordsArray.length === 1) {
  //     return this._markers[0];
  //   }
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


  // setupSignalR() {
  //   this.connection.start()
  //     .then((c) => {
  //       this.trucks.forEach((item, i) => {
  //         this.setSignalRresponse(i);
  //         this.connection.invoke('register', item.device)
  //           .catch((err: any) => console.warn(item.device + ' Failed to invoke. Error occurred. Error:' + err));
  //       });
  //       const newMessage = new BroadcastEventListener<any>('newMessage');
  //       this.connection.listen(newMessage);
  //       this.subscription = newMessage.subscribe((response: string) => {
  //         const signalRresponse = JSON.parse(response) as SignalRresponse;

  //         // console.log('signalResponse', signalRresponse);
  //         if (signalRresponse && Number(signalRresponse.rtp) !== 1) {
  //           return;
  //         }

  //         for (let i = 0; i < this.trucks.length; i++) {
  //           if (this.trucks[i].device === signalRresponse.id) {
  //             this.trucks[i].online_status = true;
  //             if (this.cardsArray && this.cardsArray.length > 0) {
  //               this.cardsArray.forEach(element => {
  //                 if (element.name === 'Online Vehicles') {
  //                   element.data.total_count = this.mapData.filter(truck => truck.online_status === true).length;
  //                 }
  //                 if (element.name === 'Offline Vehicles') {
  //                   element.data.total_count = this.mapData.filter(truck => truck.online_status === false).length;
  //                 }
  //               });
  //             }
  //             if (this.verifySignalRData(signalRresponse, i)) {
  //               const oldLatLng = new google.maps.LatLng(this.trucks[i].signalRresponse.lat, this.trucks[i].signalRresponse.lon);

  //               this.signalRstarted[i] += 1;
  //               this.trucks[i].signalRresponse = new SignalRresponse(
  //                 signalRresponse.comp,
  //                 signalRresponse.customer,
  //                 signalRresponse.dens,
  //                 signalRresponse.temp,
  //                 signalRresponse.vol,
  //                 signalRresponse.id,
  //                 signalRresponse.lat,
  //                 signalRresponse.lon,
  //                 signalRresponse.module,
  //                 signalRresponse.spd,
  //                 signalRresponse.rtp,
  //                 ((!this.trucks[i].online_status) ? DateUtils.getLocalMMDDYYYYhhmmss(this.trucks[i]['last_update_unix']) : ((signalRresponse.t != 0) ? DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t) : '0')),
  //                 signalRresponse.type,
  //                 signalRresponse.nw,
  //                 signalRresponse.gw
  //               );

  //               let geocoder = new google.maps.Geocoder();
  //               this.copySignalR = this.trucks[i].signalRresponse;
  //               var latlng = { lat: parseFloat(signalRresponse.lat.toString()), lng: parseFloat(signalRresponse.lon.toString()) };
  //               this.findAddressFromLatLang(latlng, geocoder).then((result) => {
  //                 if (result) {
  //                   this.trucks[i]['location_address'] = result[0];
  //                   this.updateLocation(i, signalRresponse, oldLatLng, this.trucks, false);
  //                 }
  //               });

  //               this.trucks[i].signalRresponse.vol = ConvertToGallon.convert_to_gallon(((this.trucks[i].signalRresponse.vol / 100) * this.trucks[i].volume_capacity));
  //               this.trucks[i].signalRresponse['ignition_status'] = (this.trucks[i].signalRresponse.spd > 5) || (this.trucks[i].signalRresponse.nw !== 1);

  //               if (signalRresponse.t == 0) {
  //                 this.trucks[i].last_updated = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
  //                 this.trucks[i].signalRresponse['t'] = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
  //               }

  //               const newLatLng = new google.maps.LatLng(signalRresponse.lat, signalRresponse.lon);
  //               const differenceInDistance = (google.maps.geometry.spherical.computeDistanceBetween(newLatLng, oldLatLng));

  //               const tooLongOrtooShortDistance = 50 < differenceInDistance && differenceInDistance < 200000;
  //               if (!tooLongOrtooShortDistance && signalRresponse.lat && signalRresponse.lon) {
  //                 this.trucks[i].signalRresponse['spd'] = 0;
  //                 this.trucks[i].signalRresponse['ignition_status'] = false;
  //               }

  //               if (this.filters['vehicle_id']) {
  //                 if (this.trucks[i].id === this.filters['vehicle_id'].id) {
  //                   const latlng = new google.maps.LatLng(this.trucks[i].signalRresponse.lat, this.trucks[i].signalRresponse.lng);
  //                   this.map.setCenter(latlng);
  //                 }
  //               }

  //               this.updateLocation(i, signalRresponse, oldLatLng, this.trucks);
  //               this.trucks = [...this.trucks];
  //             } else if (!signalRresponse.lat && !signalRresponse.lon) {
  //               this.trucks[i].signalRresponse.t = DateUtils.getLocalYYYYMMDDHHmmss(signalRresponse.t);
  //               const oldLatLng = new google.maps.LatLng(this.trucks[i].signalRresponse.lat, this.trucks[i].signalRresponse.lon);
  //               this.updateLocation(i, signalRresponse, oldLatLng, this.trucks);
  //             } else {
  //               // this.trucks[i].signalRresponse['ignition_status'] = (this.trucks[i].signalRresponse.spd > 5) || (this.trucks[i].signalRresponse.nw !== 1);
  //               // if (signalRresponse.t == 0) {
  //               //   this.trucks[i].last_updated = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
  //               //   this.trucks[i].signalRresponse['t'] = DateUtils.getMMDDYYYYhhmmssA((this.currentDate).toString());
  //               // }
  //               // this.updateInvalidSignalData(i, this.trucks);
  //             }

  //           }
  //         }
  //       });
  //     });
  // }
  removeImage(data) {
    if (this.myInputVariable) {
      // this.myInputVariable.nativeElement.value = '';
    }
    this.avatar_url = null;
    this.avatar = null;
    if (!data) {
      // this.image.nativeElement.src = '/assets/images/iol/driver_placeholder.png';
    }
  }
  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }
  clearForm(data = null) {
    this.selectedUserId = false;
    this.removeImage(data);
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.driverForm.reset();
    this.getDayName = [];
    this.getDayNames = [];
    this.getTrucks(null);
    this.formTitle = 'Add Shift';
    this.selectedRole = null;
    this.show_password = false;
    this.selectedCheckbox = false;
    this.submitted = false;
  }
  getTrucks(value) {
    this.formService.getOptions('unassigned_trucks', {})
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          if (data.status === HttpStatusCodeEnum.Success) {
            this.itemListTrucks = data.response.map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );
          }
          if (!(value === null)) {
            // this.context.itemListTrucks.push(new PrimengDropdownItem(value['id'], value['itemName']));
            this.itemListTrucks.unshift(value);
          }

        } else {

        }
      })
  }
  // updateLocation(i, signalRresponse, oldLatLng, trucks, checkDistance = true) {
  //   const newLatLng = new google.maps.LatLng(signalRresponse.lat, signalRresponse.lon);
  //   const differenceInDistance = (google.maps.geometry.spherical.computeDistanceBetween(newLatLng, oldLatLng));
  //   const tooLongOrtooShortDistance = 50 < differenceInDistance && differenceInDistance < 200000;
  //   if (checkDistance) {
  //     if (tooLongOrtooShortDistance || isNaN(differenceInDistance)) {
  //       this.locations[i].last_longitude = this.locations[i].longitude;
  //       this.locations[i].last_latitude = this.locations[i].latitude;
  //       this.locations[i].latitude = this.trucks[i].signalRresponse.lat;
  //       this.locations[i].longitude = this.trucks[i].signalRresponse.lon;
  //       this.generateMapView(i, trucks);
  //     }
  //   }

  //   this.locations[i].infoList = [
  //     new Item('Name', this.trucks[i].name),
  //     new Item('Status', this.trucks[i].online_status),
  //     new Item('Speed', ((this.trucks[i].signalRresponse.spd > 5 && tooLongOrtooShortDistance) ? Math.round(this.trucks[i].signalRresponse.spd) : ((this.trucks[i].signalRresponse.spd && !signalRresponse.lat && !signalRresponse.lon) ? Math.round(this.trucks[i].signalRresponse.spd) : 0)) + ' km/h'),
  //     // new Item('Fuel', (this.trucks[i].signalRresponse.vol ? (this.trucks[i].signalRresponse.vol).toFixed(2) : 0) + ' gal'),
  //     // new Item('Temperature', ((this.trucks[i].signalRresponse.temp) ? this.trucks[i].signalRresponse.temp : 0) + ' °C'),
  //     // new Item('Net Weight', this.trucks[i].signalRresponse.nw + ' kg'),
  //     // new Item('Truck Type', this.trucks[i]['vehicle_type']),
  //     new Item('Last Updated', DateUtils.getMMDDYYYYhhmmssA(this.trucks[i].signalRresponse.t)),
  //     new Item('Locations',  (trucks[i]['location_address'] ? trucks[i]['location_address'] : '-'))
  //   ];
  //   this.updateInfoWindow(i);
  // }

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
    // // console.log('markers', this.markers);
  }
  onSearch(formValue) {
    this.filters.search_key = this.searchForm.get('search').value;
    this.filters.driver_group = this.searchForm.get('selectGroup').value;
    this.filters.driver_id = this.searchForm.get('selectedDriver').value;
    this.getDriversListing(this.filters);
    // this.downloadableLink = environment.baseUrl + '/iof/shiftsxle/?search=' + this.filters.search_key + '&customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/shiftspdf/?search=' + this.filters.search_key + '&customer_id=' + this.customerID;

    this.downloadableLink = 'search=' + this.filters.search_key;
    this.downloadableLink1 = 'search=' + this.filters.search_key;
  }

  togglePassword(value) {
    this.show_password = value;
    // this.hidePassword=false;
  }
  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }
  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return form_data;
  }
  onSubmit(formValue) {
    this.submitted = true;
    if (this.validate()) {
      const id = this.driverForm.getRawValue().id;
      // if (formValue['dob']) {
      //   const dob = new Date(formValue['dob']);

      //   if (formValue['date_of_joining']) {
      //     const date_of_joining = new Date(formValue['date_of_joining']);
      //     if (dob >= date_of_joining) {
      //       this.date_of_joining = null;
      //       this.swalService.getWarningSwal('Date of Joining Should be greater than Date of Birth');
      //       return;
      //     }
      //     formValue['date_of_joining'] = DateUtils.getYYYYMMDD(formValue['date_of_joining']);
      //   }
      //   formValue['dob'] = DateUtils.getYYYYMMDD(formValue['dob']);
      // }
      // formValue['text_password']=formValue['password'];
      // delete formValue['password'];
      // formValue['type_id'] = EntityType.DRIVER;

      if (this.getDayNames._results.length > 0) {
        for (let i = 0; i < this.getDayNames._results.length; i++) {
          if (this.getDayNames._results[i].nativeElement.value != "") {

            if (this.itemHidden._results[i].nativeElement.value === 'Monday') {
              this.customDayNames['MondayStartTime'] = this.getDayNames._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Tuesday') {
              this.customDayNames['TuesdayStartTime'] = this.getDayNames._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Wednesday') {
              this.customDayNames['WednesdayStartTime'] = this.getDayNames._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Thursday') {
              this.customDayNames['ThursdayStartTime'] = this.getDayNames._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Friday') {
              this.customDayNames['FridayStartTime'] = this.getDayNames._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Saturday') {
              this.customDayNames['SaturdayStartTime'] = this.getDayNames._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Sunday') {
              this.customDayNames['SundayStartTime'] = this.getDayNames._results[i].nativeElement.value;
            }
          }
        }
      }
      if (this.getDayNamesEnd._results.length > 0) {
        for (let i = 0; i < this.getDayNamesEnd._results.length; i++) {

          if (this.getDayNamesEnd._results[i].nativeElement.value != "") {
            if (this.itemHidden._results[i].nativeElement.value === 'Monday') {
              this.customDayNames['MondayEndTime'] = this.getDayNamesEnd._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Tuesday') {
              this.customDayNames['TuesdayEndTime'] = this.getDayNamesEnd._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Wednesday') {
              this.customDayNames['WednesdayEndTime'] = this.getDayNamesEnd._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Thursday') {
              this.customDayNames['ThursdayEndTime'] = this.getDayNamesEnd._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Friday') {
              this.customDayNames['FridayEndTime'] = this.getDayNamesEnd._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Saturday') {
              this.customDayNames['SaturdayEndTime'] = this.getDayNamesEnd._results[i].nativeElement.value;
            }
            if (this.itemHidden._results[i].nativeElement.value === 'Sunday') {
              this.customDayNames['SundayEndTime'] = this.getDayNamesEnd._results[i].nativeElement.value;
            }
          }
        }
      }

      formValue.MondayStartTime = (this.customDayNames.MondayStartTime) ? this.customDayNames.MondayStartTime : null;
      formValue.MondayEndTime = (this.customDayNames.MondayEndTime) ? this.customDayNames.MondayEndTime : null;
      formValue.TuesdayStartTime = (this.customDayNames.TuesdayStartTime) ? this.customDayNames.TuesdayStartTime : null;
      formValue.TuesdayEndTime = this.customDayNames.TuesdayEndTime ? this.customDayNames.TuesdayEndTime : null;
      formValue.WednesdayStartTime = this.customDayNames.WednesdayStartTime ? this.customDayNames.WednesdayStartTime : null;
      formValue.WednesdayEndTime = this.customDayNames.WednesdayEndTime ? this.customDayNames.WednesdayEndTime : null;
      formValue.ThursdayStartTime = this.customDayNames.ThursdayStartTime ? this.customDayNames.ThursdayStartTime : null;
      formValue.ThursdayEndTime = this.customDayNames.ThursdayEndTime ? this.customDayNames.ThursdayEndTime : null;
      formValue.FridayStartTime = this.customDayNames.FridayStartTime ? this.customDayNames.FridayStartTime : null;
      formValue.FridayEndTime = this.customDayNames.FridayEndTime ? this.customDayNames.FridayEndTime : null;
      formValue.SaturdayStartTime = this.customDayNames.SaturdayStartTime ? this.customDayNames.SaturdayStartTime : null;
      formValue.SaturdayEndTime = this.customDayNames.SaturdayEndTime ? this.customDayNames.SaturdayEndTime : null;
      formValue.SundayStartTime = this.customDayNames.SundayStartTime ? this.customDayNames.SundayStartTime : null;
      formValue.SundayEndTime = this.customDayNames.SundayEndTime ? this.customDayNames.SundayEndTime : null;
      formValue.startDate = DateUtils.getYYYYMMDD(formValue.startDate);
      formValue.endDate = DateUtils.getYYYYMMDD(formValue.endDate);
      formValue.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.disableSubmitButton();
      if (id) {
        formValue['id'] = id;
        this.patchDriver(formValue);
      } else {
        this.postDriverForm(formValue);
      }
    } else {
      // console.log(this.errorMessages);
    }
  }

  postDriverForm(param) {
    delete param['FridayCB'];
    delete param['SaturdayCB'];
    delete param['SundayCB'];
    delete param['MondayCB'];
    delete param['TuesdayCB'];
    delete param['WednesdayCB'];
    delete param['ThursdayCB'];

    let currentDate = DateUtils.getYYYYMMDD((new Date().toISOString()));

    param.MondayStartTime = param.MondayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.MondayStartTime).split('T')[1] : null;
    param.MondayEndTime = param.MondayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.MondayEndTime).split('T')[1] : null;
    param.TuesdayStartTime = param.TuesdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.TuesdayStartTime).split('T')[1] : null;
    param.TuesdayEndTime = param.TuesdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.TuesdayEndTime).split('T')[1] : null;
    param.WednesdayStartTime = param.WednesdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.WednesdayStartTime).split('T')[1] : null;
    param.WednesdayEndTime = param.WednesdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.WednesdayEndTime).split('T')[1] : null;
    param.ThursdayStartTime = param.ThursdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.ThursdayStartTime).split('T')[1] : null;
    param.ThursdayEndTime = param.ThursdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.ThursdayEndTime).split('T')[1] : null;
    param.FridayStartTime = param.FridayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.FridayStartTime).split('T')[1] : null;
    param.FridayEndTime = param.FridayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.FridayEndTime).split('T')[1] : null;
    param.SaturdayStartTime = param.SaturdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.SaturdayStartTime).split('T')[1] : null;
    param.SaturdayEndTime = param.SaturdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.SaturdayEndTime).split('T')[1] : null;
    param.SundayStartTime = param.SundayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.SundayStartTime).split('T')[1] : null;
    param.SundayEndTime = param.SundayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + param.SundayEndTime).split('T')[1] : null;

    this.formService.postShift(param).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.getDayName = [];
        this.closeForm.nativeElement.click();
        this.getDriversListing(this.filters);
        this.swalService.getSuccessSwal(data.message);
        this.getDayName = [];
        // this.getDrivers(this.filterDrivers);
      } else {
        // console.log(data.message);
        this.swalService.getErrorSwal(data.message);
      }
    })

    this.btnText = "Submit";

  }

  patchDriver(driver) { //driver: FormData

    // driver.append('id', String(this.selectedDriver.id));
    // driver.append('type', String(this.selectedRole));
    // Display the values

    let currentDate = DateUtils.getYYYYMMDD((new Date().toISOString()));

    driver.MondayStartTime = driver.MondayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.MondayStartTime).split('T')[1] : null;
    driver.MondayEndTime = driver.MondayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.MondayEndTime).split('T')[1] : null;
    driver.TuesdayStartTime = driver.TuesdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.TuesdayStartTime).split('T')[1] : null;
    driver.TuesdayEndTime = driver.TuesdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.TuesdayEndTime).split('T')[1] : null;
    driver.WednesdayStartTime = driver.WednesdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.WednesdayStartTime).split('T')[1] : null;
    driver.WednesdayEndTime = driver.WednesdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.WednesdayEndTime).split('T')[1] : null;
    driver.ThursdayStartTime = driver.ThursdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.ThursdayStartTime).split('T')[1] : null;
    driver.ThursdayEndTime = driver.ThursdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.ThursdayEndTime).split('T')[1] : null;
    driver.FridayStartTime = driver.FridayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.FridayStartTime).split('T')[1] : null;
    driver.FridayEndTime = driver.FridayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.FridayEndTime).split('T')[1] : null;
    driver.SaturdayStartTime = driver.SaturdayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.SaturdayStartTime).split('T')[1] : null;
    driver.SaturdayEndTime = driver.SaturdayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.SaturdayEndTime).split('T')[1] : null;
    driver.SundayStartTime = driver.SundayStartTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.SundayStartTime).split('T')[1] : null;
    driver.SundayEndTime = driver.SundayEndTime ? DateUtils.getUTCYYYYMMDDHHmmsstemp(currentDate + ' ' + driver.SundayEndTime).split('T')[1] : null;

    this.formService.patchShift(driver).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.getDayName = [];
        // this.getDrivers(this.filterDrivers)
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getDriversListing(this.filters);
      } else {
        this.swalService.getErrorSwal(data.message);
        // console.log(data.message);
      }
    })
  }
  closeFunction() {
    this.submitted = false;
    this.driverForm.reset();
    this.getDayName = [];
  }
  getUsers(filters) {
    this.showIndeterminateProgress = true;

    // let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}&status=${filters.status}`;

    this.userService.getUsers(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;

      if (data.status === HttpStatusCodeEnum.Success) {
        this.users = data['data'].data;
        this.totalUserLength = data['data'].count;
        this.users.pagination = this.totalUserLength;
      } else {
        // console.log(data.message);
      }
    });
  }
  returndob() {
    setTimeout(() => {
      if (this.dob) {
        if (this.date_of_joining) {
          const a: any = (this.dob.valueOf());
          const b: any = (this.date_of_joining.valueOf());
          if (a >= b) {
            this.date_of_joining = null;
          }
        }
      }
    }, 200);
  }

  // setupLocations() {
  //   this.locations = this.trucks.map(item =>
  //     new EntityWithIconLocation(item.id, item.last_latitude, item.last_longitude,
  //       [new Item('Name', item.name),
  //       new Item('Status', item.online_status),
  //       new Item('Speed', ((item.last_speed > 5) ? Math.round(item.last_speed) : 0) + ' km/h'),
  //       // new Item('Vehicle Type', item['vehicle_type']),
  //       new Item('Last Updated', DateUtils.getLocalMMDDYYYYhhmmss(item['last_updated'])),
  //       new Item('Location', (item['location_address']) ? item['location_address'] : '-')
  //       ], item['marker']));
  //   this.generateMapView(null, this.trucks);
  // }

  // generateMapView(i?, trucks?) {
  //   const colors = Colors.getColors();
  //   let colorIndex = -1;
  //   if (i || i === 0) {
  //     const newPos = new google.maps.LatLng(this.locations[i].latitude, this.locations[i].longitude);
  //     this.updateInfoWindow(i);
  //     if (this.signalRstarted[i] > 1 && trucks[i].signalRresponse['spd'] > 5) {
  //       this.markers[this.locations[i].entity_id].setPosition(newPos);
  //       const path = this.poly[i].getPath();
  //       this.markers[this.locations[i].entity_id].setMap(null);
  //       //Hardcode angle set
  //       const marker = this.createMarkers(newPos, i, 20);
  //       this.markers[this.locations[i].entity_id] = marker;
  //       path.push(newPos);
  //       this.poly[i].setPath(path);
  //       this.poly[i].setMap(this.map);
  //     }
  //   } else {
  //     for (let j = 0; j < this.locations.length; j++) {
  //       if (this.locations[j].entity_id && this.locations[j].latitude && this.locations[j].longitude) {
  //         const newPos = new google.maps.LatLng(this.locations[j].latitude, this.locations[j].longitude);
  //         this.updateInfoWindow(j);
  //         const marker = this.createMarkers(newPos, j);
  //         this.markers[this.locations[j].entity_id] = marker;
  //         this.bounds1.extend(marker.getPosition());
  //         const poly = new google.maps.Polyline({
  //           map: this.map,
  //           strokeColor: colors[j],
  //         });
  //         poly.setPath([newPos]);
  //         this.poly[j] = poly;
  //         this.map.fitBounds(this.bounds1);
  //       }
  //     }
  //   }
  // }

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

  /*Map */
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

  async showSwal(territory) {
    const shouldDelete = await this.swalService.getDeleteSwal2(territory, 'What do you want to do with this record?');
    if (shouldDelete) {
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteUser(territory.id, shouldDelete, 'Record has been' + message + 'successfully');
    }
  }

  // Delete bin
  deleteUser(userId, actionType, message?) {
    const params = {};
    params['id'] = (userId);
    params['status'] = actionType;

    this.userService.deleteShift(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal(message);
        this.getDriversListing(this.filters);
      } else {
        // console.log(data.message);
        this.swalService.getErrorSwal(data.message)
      }
    })
  }

  get formAltaControls(): any {
    return this.userForm['controls'];
  }
  openEditModal(group) {
    this.selectedUserId = true;
    for (let i = 0; i < this.statusList.length; i++) {
      if (group.status_id == this.statusList[i].id) {
        group.status = this.statusList[i].id;
        this.selectedStatus = { value: this.statusList[i].id, label: this.statusList[i].name, id: this.statusList[i].id, name: this.statusList[i].name }
      }
    }

    this.getDayName = [];
    this.btnText = "Update";
    // this.finallist=group;

    // this.updateEdit2=false;
    this.formTitle = "Update Shift";
    setTimeout(() => {
      let currentDate = DateUtils.getYYYYMMDD((new Date().toISOString()));

      if (this.getDayNames._results.length > 0) {
        for (let i = 0; i < this.getDayNames._results.length; i++) {
          if (this.itemHidden._results[i].nativeElement.value === 'Monday') {
            this.getDayNames._results[i].nativeElement.value = this.timeConversion(group.monday_start_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Tuesday') {
            this.getDayNames._results[i].nativeElement.value = this.timeConversion(group.tuesday_start_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Wednesday') {
            let wednesday = group.wednesday_start_time;
            this.getDayNames._results[i].nativeElement.value = this.timeConversion(wednesday);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Thursday') {
            this.getDayNames._results[i].nativeElement.value = this.timeConversion(group.thursday_start_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Friday') {
            this.getDayNames._results[i].nativeElement.value = this.timeConversion(group.friday_start_time);;
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Saturday') {
            this.getDayNames._results[i].nativeElement.value = this.timeConversion(group.saturday_start_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Sunday') {
            this.getDayNames._results[i].nativeElement.value = this.timeConversion(group.sunday_start_time);
          }
        }
      }
      if (this.getDayNamesEnd._results.length > 0) {
        for (let i = 0; i < this.getDayNamesEnd._results.length; i++) {
          if (this.itemHidden._results[i].nativeElement.value === 'Monday') {
            this.getDayNamesEnd._results[i].nativeElement.value = this.timeConversion(group.monday_end_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Tuesday') {
            this.getDayNamesEnd._results[i].nativeElement.value = this.timeConversion(group.tuesday_end_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Wednesday') {
            this.getDayNamesEnd._results[i].nativeElement.value = this.timeConversion(group.wednesday_end_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Thursday') {
            this.getDayNamesEnd._results[i].nativeElement.value = this.timeConversion(group.thursday_end_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Friday') {
            this.getDayNamesEnd._results[i].nativeElement.value = this.timeConversion(group.friday_end_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Saturday') {
            this.getDayNamesEnd._results[i].nativeElement.value = this.timeConversion(group.saturday_end_time);
          }
          if (this.itemHidden._results[i].nativeElement.value === 'Sunday') {
            this.getDayNamesEnd._results[i].nativeElement.value = this.timeConversion(group.sunday_end_time);
          }
        }
      }

      this.driverForm.patchValue({
        job_name: group.name,
        selectShift: group.selectShift,
        // FridayStartTime: group.friday_start_time,
        // FridayEndTime: group.friday_end_time,
        // SaturdayStartTime: group.saturday_start_time,
        // SaturdayEndTime: group.saturday_end_time,
        // SundayStartTime: group.sunday_start_time,
        // SundayEndTime: group.sunday_end_time,
        // MondayStartTime: group.monday_start_time,
        // MondayEndTime: group.monday_end_time,
        // TuesdayStartTime: group.tuesday_start_time,
        // TuesdayEndTime: group.tuesday_end_time,
        // WednesdayStartTime: group.wednesday_start_time,
        // WednesdayEndTime: group.wednesday_end_time,
        // ThursdayStartTime: group.thursday_start_time,
        // ThursdayEndTime: group.thursday_end_time,
        id: group.id,
        startDate: new Date(group.start_date),
        endDate: new Date(group.end_date),
        status: this.selectedStatus.id
      });
    }, 500);

    let x = new Date(group.start_date);
    let y = new Date(group.end_date);
    this.patchDatewithDays(x, y);
  }

  timeConversion(time) {
    let offset = Math.abs(new Date().getTimezoneOffset());
    var t = new Date();
    t.setSeconds(t.getSeconds() + offset);
    let currentDate = DateUtils.getYYYYMMDD(t.toDateString())
    currentDate = DateUtils.getLocalMMDDYYYYhhmmssATime(currentDate + ' ' + time);
    return currentDate;
  }


  downloadXLS(download) {
    this.entityService.downloadManageShiftsXLS(download).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url, 'Shift Report.xls')
      // window.open(url);
    })
  }


  downloadPDF(download) {
    this.entityService.downloadManageShiftsPDF(download).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url, 'Shift Report.pdf')
      // window.open(url);
    })
  }

}

