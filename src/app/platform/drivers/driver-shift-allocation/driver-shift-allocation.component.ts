import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ResizeDatatableService } from '../../shared/resize-datatable.service';

import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { BrandingService } from '../../shared/services/branding.service';
import { AppLoader } from '../../data/model/app-loader';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { SwalService } from 'src/app/core/services/swal.service';
import { FormService } from '../../services/FormService';
import { GetIconsService } from '../../services/get-icons.service';
import { ScheduleActivityService } from '../../services/schedule-activity.service';
import { TemplateAndRouteService } from '../../services/template-and-route.service';
import { EntityService } from '../../services/entity.service';
import { TruckService } from '../../services/truck.service';
import { HttpController } from 'src/app/core/services/loading-controller';
import { TestApiResponse, LoginApiResponse, ApiResponseNew } from 'src/app/core/model/api.response';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { environment } from 'src/environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { ErrorMessage } from '../../error-message';
import { AuthService } from 'src/app/core/services/auth.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';
// import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
// import { ContractsDropdownComponent } from '../../shared/contracts-dropdown/contracts-dropdown.component';
// import { ClientDropdownComponent } from '../../shared/client-dropdown/client-dropdown.component';
// import { LocationDropdownComponent } from '../../shared/location-dropdown/location-dropdown.component';
// import { AreaDropdownComponent } from '../../shared/area-dropdown/area-dropdown.component';

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
  selector: 'app-driver-shift-allocation',
  templateUrl: './driver-shift-allocation.component.html',
  styleUrls: ['./driver-shift-allocation.component.css']
})
export class DriverShiftAllocationComponent implements OnInit {
  TaskStatus = TaskStatus;
  searchForm: FormGroup;
  items = [{ label: 'Job' }];
  home = { label: 'Dashboard', url: '/iol/' };
  isAuthorized = false;
  activityPercentage = 0;
  taskHide = true;

  templateForm: FormGroup;
  editModel: boolean = false;
  selectedClients = [];
  selectedContracts = [];
  selectedClients1 = [];
  selectedContracts1 = [];
  selectedAreas = [];
  selectedLocations = [];
  selectedBins = [];
  btnLoading: boolean;
  errorMessages: string[];
  Submitted: boolean = false;
  EntityStatusEnum = EntityStatusEnum;
  selectedDriver;
  selectedShift;

  bins = [];
  trucks_list = [];
  drivers_list = [];
  shifts_list = [];
  dump_list = [];
  bins_list = [];
  templates;
  routes = [];
  tempRoutes = [];
  paramsToSearch = ['primary_entity_name', 'actor_name'];
  recommendations: RecommendationModel[] = [];
  activityDateRange = [];

  formTitle = 'Add';
  btnText = 'Save';
  area_list: any;
  completeEdit = false;
  selected_user;
  driverGroup = [];
  driverLists = [];

  binLoader: AppLoader = new AppLoader();
  templateLoader: AppLoader = new AppLoader();
  recommendationLoader: AppLoader = new AppLoader();
  activityLoader: AppLoader = new AppLoader();
  submitFormLoader: AppLoader = new AppLoader();
  currentDate = new Date();
  minCurrentDate; //= new Date();
  maxCurrentDate;// = new Date();

  branding: any;
  contract_list;
  viewJob: any;
  testing;
  showIndeterminateProgress: boolean;
  list = [[]];
  list1 = [[]];
  @ViewChild('userPaginator') userPaginator: MatPaginator;
  totalUserLength = 0;
  displayedUserList = ["driver_first_name", "shift_name", "start_date", "end_date", "shift_start_time", "shift_end_time", "status", "actions"]
  priority = [new PrimengDropdownItem(1, '1')];
  jobTypes = [new PrimengDropdownItem(215, 'Ad-Hoc'), new PrimengDropdownItem(216, 'Scheduled')];
  to_delete = [];
  edit: boolean = false;
  optimizedCall;
  contracts: any = [];
  inputValue: any;
  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;
  sendObj = { search: '', job_type: '' };
  Icons = ['assets/images/iol/icon-map-truck-CompactorOnline.png',
    'assets/images/iol/icon-map-minitruck-Online.png',
    'assets/images/iol/icon-map-truck-HookLoaderOnline.png',
    'assets/images/iol/icon-map-truck-ChainLoaderOnline.png',
    'assets/images/iol/icon-map-minitruck-Offline.png',
    'assets/images/iol/icon-map-truck-HookLoaderOffline.png',
    'assets/images/iol/icon-map-truck-ChainLoaderOffline.png',
    'assets/images/iol/icon-map-truck-CompactorOffline.png',
    'assets/images/iol/icon-map-truck-offline.png'
  ];

  // @ViewChild('clientDropdownComponent') clientDropdownComponent: ClientDropdownComponent;
  // // @ViewChild('contractDropdownComponent') contractDropdownComponent: ContractsDropdownComponent;
  // @ViewChild('locationDropdownComponent') locationDropdownComponent: LocationDropdownComponent;
  // @ViewChild('areaDropdownComponent') areaDropdownComponent: AreaDropdownComponent;
  @ViewChild('googleMapComponent') googleMapComponent: GoogleMapComponent;
  @ViewChild('closeModalBtn') private closeModalBtn;
  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;
  finalObj = [];
  @ViewChild('gmap')
  gmap: GoogleMapComponent;

  filters = { limit: 10, offset: 0, order_by: '', order: '', fleet_id: '', category_id: '', shift_id: '', driver_id: '', entity_sub_type_id: '', vehicle_id: '', search: '' };
  sidebarCheck: any;

  allShifts = [];

  constructor(public resizeDatatableSerivce: ResizeDatatableService,
    public formBuilder: FormBuilder,
    public swalService: SwalService,
    private router: Router,
    private formService: FormService,
    private authService: AuthService,
    private getIconsService: GetIconsService,
    private scheduleService: ScheduleActivityService,
    private templateRouteService: TemplateAndRouteService,
    private brandingService: BrandingService,
    private entityService: EntityService,
    public truckService: TruckService, public drawerService: DrawerService,
    private xlsPdfService:XlsPdfService
  ) {

    this.searchForm = this.formBuilder.group({
      search: [''],
      jobtype: [''],
      selectGroup: [''],
      selectedDriver: ['']
    })
    //source_contract_list, destination_contract_list to render conrtacts for each task
    this.templateForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      driver_id: [null, [Validators.required]],
      shift_id: [null, [Validators.required]],
      start_date: [null, [Validators.required]],
      end_date: [null, [Validators.required]],
      // hidden:['']
    });
  }

  getProgress(value, type) {
    if (value != null)
      return this.getStatusCount(value, type) + "/" + value.length;
  }

  getProgress1(value, type) {
    if (value != null)
      return this.getStatusCount(value, type);
  }

  getFillClass(value, type) {
    if (value != null)
      return 'p' + Number(this.getStatusCount(value, type));
  }


  getStatusCount(value, type) {
    let count = 0;
    value?.forEach(element => {
      if (element.job_status == type) {
        count++;
      }
    });
    return count.toString();
  }

  addTask(name?, value?) {
    var arr = <FormArray>this.templateForm.get('job_tasks');
    const task = this.formBuilder.group({
      id: [null],
      source_client: [null, [Validators.required]],
      source_contract: [null, [Validators.required]],
      destination_client: [null, [Validators.required]],
      destination_contract: [null, [Validators.required]],
      priority: [1, [Validators.required]]
    });
    arr.insert(0, task);
    // this.list.splice(0, 0, []);
    // this.list1.splice(0, 0, []);

    if (parseInt(this.priority[0].value) == 0)
      this.priority.push(new PrimengDropdownItem(this.priority.length, (this.priority.length).toString()));
    else {
      this.priority.push(new PrimengDropdownItem(this.priority.length + 1, (this.priority.length + 1).toString()));
    }
  }

  isExecuted: boolean = false;

  updateTask(job, count) {
    if (this.isExecuted) return;
    this.isExecuted = true;
    // console.log("Update task ...");

    this.getJobFormArray.clear();
    this.getJobFormArray.reset();

    const task = this.formBuilder.group({
      id: [job.id],
      source_client: [job.source_client, [Validators.required]],
      source_contract: [job.source_contract, [Validators.required]],
      destination_client: [job.destination_client, [Validators.required]],
      destination_contract: [job.destination_contract, [Validators.required]],
      priority: [job.priority, [Validators.required]]
    });
    // console.log(task);
    this.getJobFormArray.insert(count, task);
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    this.minCurrentDate = new Date();
    this.maxCurrentDate = null;

    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    // this.getTrucks();
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.getGroupList();
    this.getDrivers();
    this.getShifts();
    this.getTemplates(this.filters);
    this.branding = this.brandingService.styleObject();

    'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id
    
    // this.downloadableLink = environment.baseUrl + '/iof/sdxle/?customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/sdpdf/?customer_id=' + this.customerID;

    this.downloadableLink = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;
    this.downloadableLink1 = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;

  }

  timeConversion(time) {
    var splitted = time.split("T");
    let offset = Math.abs(new Date().getTimezoneOffset());
    var t = new Date();
    t.setSeconds(t.getSeconds() + offset);
    let currentDate = DateUtils.getYYYYMMDD(t.toDateString())
    currentDate = DateUtils.getLocalMMDDYYYYhhmmssATimee(currentDate + ' ' + splitted[1]);
    // console.log(currentDate)
    return currentDate;
  }

  getTemplates(filters) {
    let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}&shift_id=${filters.shift_id}&driver_id=${filters.driver_id}&time_zone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    // console.log("coming");
    this.showIndeterminateProgress = true;
    this.templates = [];

    this.templateRouteService.getShiftsData(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      this.templates = data.data.data;
      this.totalUserLength = data['data'].count;
    }
    );
  }
  getDrivers() {
    this.showIndeterminateProgress = true;
    // this.templates = [];

    this.templateRouteService.getDriversShift().subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      this.drivers_list = data.data.map(
        item => new PrimengDropdownItem(item['id'], item['name'])
      );
    }
    );

  }
  getShifts() {
    this.showIndeterminateProgress = true;
    // this.templates = [];
    this.templateRouteService.getShiftDrivers().subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      this.allShifts = data.data.data;
      // console.log("this.allShifts===== ", this.allShifts);
      this.shifts_list = data.data.data.map(
        item => new PrimengDropdownItem(item['id'], item['name'])
      );
    }
    );
  }
  async showSwal(driver) {
    const response = await this.swalService.getConfirmSwal();
    if (response) {
      this.templateRouteService.deleteShiftDrivers(driver.id).subscribe((data: any) => {
        if (data.status === HttpStatusCodeEnum.Success) {
          // this.submitted = false;
          this.getTemplates(this.filters)
          // this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
        } else {
          this.swalService.getErrorSwal(data.message);
          console.log(data.message);
        }
      }
      );
    }
  }
  // async showSwal(user) {
  //   console.log("userrrrrrrr",user);
  //   // this.selectedUser = user;
  //   // console.log('user', user);

  //   // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
  //   const shouldDelete = await this.swalService.getDeleteSwal(user, 'What do you want to do with ' + user.driver_first_name + ' ?');
  //   console.log('shouldDelete', shouldDelete);
  //   if (shouldDelete) {
  //     console.log("coming in should del");
  //     const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
  //     this.deleteUser(user.id, shouldDelete, 'Record has been' + message +
  //       'successfully');
  //   }
  // }

  // Delete bin
  // deleteUser(userId, actionType, message?) {
  //   const params = {};
  //   params['id'] = (userId);
  //   params['status'] = actionType;

  //   console.log('params', params);
  //   this.templateRouteService.deleteShiftDrivers(params)
  //     .subscribe((data: any) => {

  //       if (data.status === HttpStatusCodeEnum.Success) {
  //         this.swalService.getSuccessSwal(message);
  //         this.getTemplates(this.filters);
  //       } else {
  //         console.log(data.message);
  //         this.swalService.getErrorSwal(data.message)
  //       }
  //     })
  // }
  getGroupList() {
    this.templateRouteService.getDriverGroup().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        // console.log(data.data);
        this.driverGroup = data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
        //  this.driverGroup=data.data;
        // this.driverLists = [];
        // this.typeList = [];
        //  this.reportTypeTable=0;
      } else {
        console.log(data.message);
      }
    });
  }
  selectGroupDropDownChange($event) {
    this.filters.shift_id = $event.value;
    this.getTemplates(this.filters);
    this.downloadableLink = 'shift_id=' + this.filters.shift_id + '&driver_id=' + this.filters.driver_id ;
    this.downloadableLink1 = 'shift_id=' + this.filters.shift_id + '&driver_id=' + this.filters.driver_id ;
    // this.getDriverFilter($event.value);
    // this.filters.shift_id = this.searchForm.get('selectGroup').value;
    // this.filters.driver_id=this.searchForm.get('selectedDriver').value;
    // this.getDriversDropdown(this.filters);
  }
  selectDriverDropDownChange($event) {
    this.filters.driver_id = $event.value;
    this.downloadableLink = 'shift_id=' + this.filters.shift_id + '&driver_id=' + this.filters.driver_id + '&customer_id=' + this.customerID;
    this.downloadableLink1 = 'shift_id=' + this.filters.shift_id + '&driver_id=' + this.filters.driver_id + '&customer_id=' + this.customerID;
    this.getTemplates(this.filters);
    // this.getDriverFilter($event.value);
    // this.filters.shift_id = this.searchForm.get('selectGroup').value;
    // this.filters.driver_id=this.searchForm.get('selectedDriver').value;
    // this.getDriversDropdown(this.filters);
  }
  getDriverFilter(driverGroupID) {
    this.templateRouteService.getDriverFilterShift(driverGroupID).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverLists = data.data.map(
          item => new DropDownItem(item['id'], item[
            'driver_name'])
        );
        // this.typeList = [];
      } else {
        console.log(data.message);
      }
    });
  }
  onUserPagination(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    // console.log("event= ", event, event.active)
    // this.filters.order_by = event.active;
    // this.filters.order = event.direction;
    this.getTemplates(this.filters);
  }

  createNewTemplate() {
    this.formTitle = 'Add';
    this.edit = false;
    this.resetEverything();
  }

  resetEverything() {
    this.taskHide = true;
    this.templateForm.reset();
    this.formTitle = 'Add';
    this.btnText = "Save";
    this.templateForm.reset();

    this.bins_list = [];
    this.selectedContracts = [];
    this.selectedClients = [];
    this.selectedAreas = [];
    this.selectedLocations = [];
    this.selectedBins = [];
    this.list1 = [];
    this.list = [];

    this.templateForm.setControl('job_tasks',
      this.formBuilder.array([
        this.formBuilder.group({
          source_client: [null, [Validators.required]],
          source_contract: [null, [Validators.required]],
          destination_client: [null, [Validators.required]],
          destination_contract: [null, [Validators.required]],
          priority: [1, [Validators.required]]
        })
      ]))

    // this.googleMapComponent.resetMap();

    // this.priority = [new PrimengDropdownItem(1, '1')];

  }

  disableSubmitButton() {
    this.btnLoading = true;
    // this.btnText = 'Loading...';
  }

  enableSubmitButton() {
    this.btnLoading = false;
    // this.btnText = 'Save';
  }

  onSubmitTemplate(formValue) {
    this.Submitted = true;
    if (this.validate()) {
      const id = this.selected_user;
      formValue['start_date'] = DateUtils.getUtcDateTimeStart(formValue['start_date']);
      formValue['end_date'] = DateUtils.getUtcDateTimeStart(formValue['end_date']);
      // formValue['start_date']=new Date(formValue['start_date']);
      // formValue['end_date']=new Date(formValue['end_date']);
      this.disableSubmitButton();
      formValue.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // isNullOrUndefined(id)
      if (!id) {
        this.Submitted = false;
        this.postTemplate(formValue);
      } else {
        this.Submitted = false;
        this.patchTemplate(formValue, id);
      }
    }
    else {
      console.log("Form is invalid[in else condition]", this.errorMessages);
    }
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];

    if (this.templateForm.get('driver_id').hasError('required')) {
      this.errorMessages.push('Driver ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.templateForm.get('shift_id').hasError('required')) {
      this.errorMessages.push('Shift ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.templateForm.get('start_date').hasError('required')) {
      this.errorMessages.push('Start Time ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.templateForm.get('end_date').hasError('required')) {
      this.errorMessages.push('End Time ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    // if (this.userForm.get('group').hasError('required')) {
    //   this.errorMessages.push('Group ' + ErrorMessage.REQUIRED);
    //   isValid = false;
    // }

    return isValid;
  }

  checkDuplicate(arr) {
    // empty object
    let map = {};
    let result = false;
    for (let i = 0; i < arr.length; i++) {
      // check if object contains entry with this element as key
      if (map[arr[i].priority]) {
        result = true;
        // terminate the loop
        break;
      }
      // add entry in object with the element as key
      map[arr[i].priority] = true;
    }
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  postTemplate(formValue) {
    this.templateRouteService.postDriverShift(formValue).subscribe((data: any) => {
      this.enableSubmitButton();
      if (data.status === HttpStatusCodeEnum.Success) {
        this.btnLoading = false;
        this.submitFormLoader.visibility = false;
        this.closeModalBtn.nativeElement.click();
        this.templateForm.reset();
        this.swalService.getSuccessSwal(data.message);
        this.getTemplates(this.filters);
      } else {
        // this.enableSubmitButton();
        this.swalService.getErrorSwal(data.message);
      }
    }
    );
  }

  patchTemplate(formValue, id) {
    // formValue['start_date'] = (formValue['start_date'].toISOString()).split("T")[0];
    // formValue['end_date'] = (formValue['end_date'].toISOString()).split("T")[0];
    this.templateRouteService.patchShiftDrivers(formValue, id).subscribe((data: any) => {
      this.enableSubmitButton();
      if (data.status === HttpStatusCodeEnum.Success) {
        this.btnLoading = null;
        this.submitFormLoader.visibility = false;
        this.closeModalBtn.nativeElement.click();
        this.templateForm.reset();
        this.selected_user = '';
        this.swalService.getSuccessSwal(data.message);
        this.getTemplates(this.filters);
      } else {
        // this.enableSubmitButton();
        this.swalService.getErrorSwal(data.message);
      }
    }
    );


  }

  get getJobFormArray(): FormArray {
    // console.log(this.templateForm.get('job_tasks') as FormArray);
    return this.templateForm.get('job_tasks') as FormArray;
  }

  openEditModal(row) {
    this.formTitle = 'Update';
    this.btnText = 'Update';
    this.selected_user = row.id;
    this.selectedDriver = this.drivers_list.filter((data) => {
      return data.value === row.driver;
    });
    // this.selectedShift = this.shifts_list.filter((data) => {
    //   return data.value === row.working_hour;
    // });

    // if (this.selectedDriver && this.selectedDriver.length > 0) {
    //   this.selectedDriver = this.selectedDriver.map(
    //     item => ({ id: item['value'], name: item['label'] })
    //   )
    // }

    // if (this.selectedShift && this.selectedShift.length > 0) {
    //   this.selectedShift = this.selectedShift.map(
    //     item => ({ id: item['value'], name: item['label'] })
    //   )
    // }

    // this.templateForm.patchValue({hidden : '1'});
    // setTimeout(() => {
    this.templateForm.patchValue({
      start_date: row.start_date ? new Date(row.start_date) : null,
      end_date: row.end_date ? new Date(row.end_date) : null,
      driver_id: row.driver,
      shift_id: row.working_hour
    });
    // }, 500);
  }
  updateTaskArray(job, count) {
    this.getJobFormArray.clear();
    this.getJobFormArray.reset();
    let task = [];

    if (this.isExecuted) return;
    this.isExecuted = true;
    for (let x = 0; x < job.length; x++) {
      task.push(this.formBuilder.group({
        id: [job.id],
        source_client: [job[x].source_client, [Validators.required]],
        source_contract: [job[x].source_contract, [Validators.required]],
        destination_client: [job[x].destination_client, [Validators.required]],
        destination_contract: [job[x].destination_contract, [Validators.required]],
        priority: [job[x].priority, [Validators.required]]
      }))

      if (parseInt(this.priority[0].value) == 0)
        this.priority.push(new PrimengDropdownItem(this.priority.length, (this.priority.length).toString()));
      else {
        this.priority.push(new PrimengDropdownItem(this.priority.length + 1, (this.priority.length + 1).toString()));
      }
    }

    let cunt = 0;
    for (let z = 0; z < task.length; z++) {
      cunt = cunt + 1;
      this.getJobFormArray.insert(cunt, task[z]);
    }

  }

  clearForm() {
    this.selected_user = '';
    this.Submitted = false;
  }
  onSearch(val) {
    this.sendObj.search = this.searchForm.value.search;
    this.filters.search = this.searchForm.value.search;
    this.getTemplates(this.filters);
    this.downloadableLink = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id + '&search=' + this.searchForm.value.search ;
    this.downloadableLink1 = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id+ '&search=' + this.searchForm.value.search ;
  }
  onChange($event) {
    var val = $event.value;
    this.sendObj.job_type = $event.value;
  }

  onClearSearch() {
    this.downloadableLink = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;
    this.downloadableLink1 = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;
    this.searchForm.reset();
    this.filters.shift_id = '';
    this.filters.driver_id = '';
    this.searchForm.get('search').setValue('');
    this.sendObj.search = '';
    this.sendObj.job_type = '';
    this.getTemplates(this.filters);
  }
  sortUserList(event) {
    this.filters.order_by = event.active;
    if (event.active == 'end_time') {
      this.filters.order_by = "created_datetime";
    }

    this.filters.order = event.direction;
    this.getTemplates(this.filters);
  }


  // getTrucks() {

  //   this.truckService.getCustomerDevicesFuel({ type_id: EntityType.DRIVER })
  //     .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

  //       onComplete(): void {
  //       }

  //       onError(errorMessage: string, err: any) {
  //         // do
  //         // console.log(errorMessage);
  //       }

  //       onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
  //         // console.log('devices', apiResponse);
  //         if (apiResponse.status === HttpStatusCodeEnum.Success) {
  //           this.context.customerDevices = apiResponse.response;
  //           this.context.trucks_list = apiResponse.response.map(
  //             item => new PrimengDropdownItem(item['id'], item['label'])
  //           );
  //         }
  //         else {
  //           // console.log(apiResponse.message);
  //         }
  //       }

  //     }
  //     );


  // }

  cluster;
  /////////////////////////////////////// LISTING END /////////////////////////////////////////////

  /***
   * Returns if bin is present in selectedBins
   * @param id
   */
  private getBinIcon(id: any) {
    return this.selectedBins.indexOf(id) > -1;
  }

  applyFilter(row: RecommendationModel) {
    this.selectedClients.push(row.client_id);
    // this.clientDropdownComponent.selectedValue.push(row.client_id);
    // this.clientDropdownComponent.selectedValue = [...this.clientDropdownComponent.selectedValue];
  }

  selectShift(event) {
    for (let i = 0; i < this.allShifts.length; i++) {
      if (this.allShifts[i].id == event.value) {
        let startDate = new Date(this.allShifts[i].start_date)
        let endDate = new Date(this.allShifts[i].end_date)
        this.minCurrentDate = startDate;
        this.maxCurrentDate = endDate;
        this.templateForm.controls.start_date.setValue(null);
        this.templateForm.controls.end_date.setValue(null);
        break;
      }
    }
  }

  startTimeConvert(time) {
    let ts = time;
    let H: any = +ts.substr(0, 2);
    let h: any = (H % 12) || 12;
    h = (h < 10) ? ("0" + h) : h;  // leading 0 at the left for 1 digit hours
    let ampm = H < 12 ? " AM" : " PM";
    ts = h + ts.substr(2, 3) + ampm;
    return ts;
  }

  endTimetConvert(time) {
    let ts = time;
    let H: any = +ts.substr(0, 2);
    let h: any = (H % 12) || 12;
    h = (h < 10) ? ("0" + h) : h;  // leading 0 at the left for 1 digit hours
    let ampm = H < 12 ? " AM" : " PM";
    ts = h + ts.substr(2, 3) + ampm;
    return ts;
  }


  startTimeConversion(time) {
    let offset = Math.abs(new Date().getTimezoneOffset());
    var t = new Date();
    t.setSeconds(t.getSeconds() + offset);
    let currentDate = DateUtils.getYYYYMMDD(t.toDateString())
    currentDate = DateUtils.getLocalMMDDYYYYhhmmssATime(currentDate + ' ' + time);
    return this.startTimeConvert(currentDate);
    // return currentDate;
  }

  endTimeConversion(time) {
    let offset = Math.abs(new Date().getTimezoneOffset());
    var t = new Date();
    t.setSeconds(t.getSeconds() + offset);
    let currentDate = DateUtils.getYYYYMMDD(t.toDateString())
    currentDate = DateUtils.getLocalMMDDYYYYhhmmssATime(currentDate + ' ' + time);
    return this.endTimetConvert(currentDate);
    // return currentDate;
  }


  downloadXLS(download) {
    this.templateRouteService.downloadXLS(download).subscribe((apiResponse: any) => {
      console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Shift Allocation Report.xls')
    })
  }

  downloadPDF(download1) {
    this.templateRouteService.downloadPDF(download1).subscribe((apiResponse: any) => {
      console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.xlsPdfService.downloadXlsPdf(url,'Shift Allocation Report.pdf')
    })
  }

}


export class RecommendationModel {
  client__name: string;
  client_id: number;
  count_of_bins: number;
  area_name: string;
  location_name: string;
}

export class TemplatesModel {
  action_items: string;
  activity_end_point: string;
  activity_end_point_latlong: string;
  activity_end_point_name: string;
  activity_route: string;
  activity_type: number;
  activity_type_label: string;
  actor: number;
  actor_name: string;
  created_datetime: string;
  customer: number;
  customer_name: string;
  id: number;
  modified_by: number;
  modified_by_name: string;
  module: number;
  module_name: string;
  primary_entity: number;
  primary_entity_name: string;
  schedule_activity_status: number;
  schedule_activity_status_label: string;
  schedule_clients: string;
  schedule_contracts: string;
}


