import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ResizeDatatableService } from '../../shared/resize-datatable.service';
import { EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
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
import { EntityType } from 'src/app/core/enum/entity-type.enum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { environment } from 'src/environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { ErrorMessage } from '../../error-message';
import { CustomValidators } from 'src/app/core/custom.validator';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { AuthService } from 'src/app/core/services/auth.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';


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
  selector: 'app-templateform',
  templateUrl: './templateform.component.html',
  styleUrls: ['./templateform.component.css'],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ],
})

export class TemplateformComponent implements OnInit, AfterViewInit {
  TaskStatus = TaskStatus;
  searchForm: FormGroup;
  items = [{ label: 'Job' }];
  home = { label: 'Dashboard', url: '/iol/' };

  activityPercentage = 0;
  taskHide = true;
  btnLoading = false;
  isAuthorized = false;
  templateForm: FormGroup;

  editModel: boolean = false;
  errorMessages;
  expandedElement: any;

  selectedClients = [];
  selectedContracts = [];
  selectedClients1 = [];
  selectedContracts1 = [];
  selectedAreas = [];
  selectedLocations = [];
  selectedBins = [];

  userId;

  bins = [];
  trucks_list = [];
  drivers_list = [];
  dump_list = [];
  bins_list = [];
  templates;
  routes = [];
  tempRoutes = [];
  paramsToSearch = ['primary_entity_name', 'actor_name'];
  recommendations: RecommendationModel[] = [];
  activityDateRange = [];

  btnText = 'Save';
  formTitle = 'Create';
  area_list: any;
  completeEdit = false;

  filtersUser = { type_id: '', limit: 10, offset: 0, order_by: '', order: '', search: '', status: '', job_type: '' };

  contractStartDate: Date;
  binLoader: AppLoader = new AppLoader();
  templateLoader: AppLoader = new AppLoader();
  recommendationLoader: AppLoader = new AppLoader();
  activityLoader: AppLoader = new AppLoader();
  submitFormLoader: AppLoader = new AppLoader();
  currentDate = new Date();
  submitted = false;
  branding: any;
  contract_list;
  viewJob: any;
  start_dateViewJob;
  end_dateViewjob;
  testing;
  showIndeterminateProgress: boolean;
  list = [[]];
  list1 = [[]];
  @ViewChild('userPaginator') userPaginator: MatPaginator;
  totalUserLength = 0;
  displayedUserList = ["job_name", "driver_name", "schedule_type_label", "job_tasks", "job_tasks1", "job_tasks2", "job_tasks3", "modified_by_name", "created_datetime", "schedule_activity_status", "actions"]
  priority = [new PrimengDropdownItem(1, '1')];
  jobTypes = [new PrimengDropdownItem(215, 'Ad-Hoc'), new PrimengDropdownItem(216, 'Scheduled')];
  to_delete = [];
  edit: boolean = false;
  optimizedCall;
  contracts: any = [];
  inputValue: any;
  downloadableLink;
  downloadableLink1;
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
  selectedJobToDelete;
  EntityStatusEnum = EntityStatusEnum;

  @ViewChild('googleMapComponent') googleMapComponent: GoogleMapComponent;
  @ViewChild('closeModalBtn') private closeModalBtn;
  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;
  finalObj = [];
  @ViewChild('gmap')
  gmap: GoogleMapComponent;
  selectedContract;
  priority_number = 2;
  sidebarCheck: any;

  constructor(public resizeDatatableSerivce: ResizeDatatableService,
    public formBuilder: FormBuilder,
    public swalService: SwalService,
    private router: Router,
    private formService: FormService,
    private getIconsService: GetIconsService,
    private scheduleService: ScheduleActivityService,
    private templateRouteService: TemplateAndRouteService,
    private brandingService: BrandingService,
    private entityService: EntityService,
    public truckService: TruckService,
    public authService: AuthService,
    private drawerService: DrawerService,
    private xlsPdfService:XlsPdfService
  ) {
    this.searchForm = this.formBuilder.group({
      search: [''],
      jobtype: ['']
    })
    //source_contract_list, destination_contract_list to render conrtacts for each task
    this.templateForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      activity_route: [null, [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      primary_entity: [null, [Validators.required]],
      start_date: [null, [Validators.required]],
      end_date: [null, [Validators.required]],
      schedule_type_id: [null, [Validators.required]],
      job_tasks: this.formBuilder.array([
        this.formBuilder.group({
          source_client: [null, [Validators.required]],
          source_contract1: ['', [Validators.required]],
          source_contract: [null],
          destination_client: [null, [Validators.required]],
          destination_contract1: [null, [Validators.required]],
          destination_contract: [null],
          priority: [1, [Validators.required]]
        })
      ])
    });
    this.getAllContracts();
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.getTrucks();
    this.getDrivers();
    this.getTemplates(this.filtersUser);
    this.branding = this.brandingService.styleObject();

    // this.downloadableLink = environment.baseUrl + '/iof/job1/?customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/job2/?customer_id=' + this.customerID;

    this.downloadableLink = '';
    this.downloadableLink1 = '';

  }

  getProgress(value, type) {
    if (value != null)
      return this.getStatusCount(value, type) + "/" + value.length;
  }

  getTaskProgress(status) {
    var value = '';
    if (status != null) {
      Object.keys(TaskStatus).forEach(function (key) {
        value = TaskStatus[status];
      });
      return value;
    }
  }

  getProgress1(value, type) {
    if (value != null)
      return this.getStatusCount(value, type);
  }

  getFillClass(value, type) {
    if (value != null)
      return 'p' + Number(this.getStatusCount(value, type));
  }

  getAllContracts() {
    // console.log(this.priority);
    let index_a = 0;
    let index_b = 100;
    let results_remaining = true;
    this.contracts = [];
    var val;
    this.optimized_contracts_call(index_a, index_b, this.sendObj);
  }

  optimized_contracts_call(index_a, index_b, sendObj) {
    let params = `job_type=${sendObj.jobtype}&search=${sendObj.search}`;
    this.optimizedCall = this.formService.getContractsDropdownListing({
      // index_a: index_a,
      // index_b: index_b
      job_id: 42,
      job_type: sendObj.job_type,
      search: sendObj.search
      // exclude_expired: 1
    }).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.contract_list = data.data.data.map(
          item => ({ id: item['id'], client: item['client'], source_latlng: item['source_latlong'], name: item['client_name'] + '-' + item['name'], label: item['client_name'] + '-' + item['name'] })
        );
      } else {
        // console.log(data.message);
      }
    }
    );
  }

  // generateReport(event) {
  //   this.templates = [];
  //   const dateRange = event[0];
  //   const type = event[1];
  //   const start_datetime = DateUtils.getUtcDateTimeStart(dateRange[0]).split(" ")[0];
  //   const end_datetime = DateUtils.getUtcDateTimeStart(dateRange[1]).split(" ")[0];
  //   const params = { start_time: start_datetime, end_time: end_datetime };
  //   this.templates = [];
  //   this.templateRouteService.getTemplates(params)
  //     .subscribe(new class extends HttpController<LoginApiResponse<TemplatesModel[]>> {
  //       onComplete(): void {
  //       }

  //       onError(errorMessage: string, err: any) {
  //         // do
  //         this.context.swalService.getErrorSwal(errorMessage);
  //         // // console.log(errorMessage);
  //       }

  //       onNext(apiResponse: LoginApiResponse<TemplatesModel[]>): void {
  //         // // console.log('templates', apiResponse);
  //         if (apiResponse.status === HttpStatusCodeEnum.Success) {
  //           this.context.templates = apiResponse.response as TemplatesModel[];
  //         }
  //         if (apiResponse.status === HttpStatusCodeEnum.Error) {
  //           this.context.swalService.getErrorSwal(apiResponse.message);
  //         }

  //       }
  //     }(this.templateLoader)
  //     );

  // }


  onUserPagination(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getTemplates(this.filtersUser);
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
      source_contract1: [null, [Validators.required]],
      source_contract: [null],
      destination_client: [null, [Validators.required]],
      destination_contract1: [null, [Validators.required]],
      destination_contract: [null],
      priority: [this.priority_number, [Validators.required]]
    });
    this.priority_number = this.priority_number + 1;
    arr.insert(0, task);
    // this.list.splice(0, 0, []);
    // this.list1.splice(0, 0, []);

    if (this.priority.length > 0 && parseInt(this.priority[0].value) == 0) {
      this.priority.push(new PrimengDropdownItem(this.priority.length, (this.priority.length).toString()));
    } else {
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
      source_contract1: [job.source_contract, [Validators.required]],
      source_contract: [job.source_contract],
      destination_client: [job.destination_client, [Validators.required]],
      destination_contract1: [job.destination_contract, [Validators.required]],
      destination_contract: [job.destination_contract],
      priority: [job.priority, [Validators.required]]
    });
    // console.log(task);
    this.getJobFormArray.insert(count, task);
  }

  removeTask() {
    var arr = this.templateForm.get('job_tasks');
    (arr as FormArray).removeAt(0);
    this.priority.pop();
  }

  removeTaskAtIndex(index) {
    var arr = this.templateForm.get('job_tasks');
    (arr as FormArray).removeAt(index);
    this.priority.pop();
    this.priority_number = this.priority_number - 1;
    const cont = this.templateForm.controls['job_tasks'] as FormArray;
    let k = arr.value.length;
    for (let i = 0; i < index; i++) {
      cont.controls[i].get('priority').setValue(k - i);
    }

    // this.priority = [];
    // for (let i = 1; i < arr.value.length + 1; i++) {
    //   this.priority.push(new PrimengDropdownItem(i, (i).toString()));
    // }
  }

  deleteChecked(event, index) {
    // // console.log(event.target.checked);
    if (event.target.checked) {
      let exists = this.to_delete.includes(index);
      if (!exists)
        this.to_delete.push(index);
    }
    else {
      // removeA(ary, 'seven');
      // this.to_delete.remove()
    }
  }


  ngAfterViewInit(): void {
    // this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }

  /////////////////////////////////////// FORM FUNCTIONS START /////////////////////////////////////////////
  createNewTemplate() {
    this.edit = false;
    this.resetEverything();
  }

  resetEverything() {
    this.taskHide = true;
    this.templateForm.reset();
    this.formTitle = 'Create';
    this.btnText = 'Save';
    this.templateForm.reset();
    this.submitted = false;
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
          source_contract1: [null, [Validators.required]],
          source_contract: [null],
          destination_client: [null, [Validators.required]],
          destination_contract1: [null, [Validators.required]],
          destination_contract: [null],
          priority: [1, [Validators.required]]
        })
      ]))
  }

  enableSubmitButton() {
    this.btnLoading = false;
  }

  disableSubmitButton() {
    this.btnLoading = true;
  }


  onSubmitTemplate(formValue) {
    // console.log(formValue)
    // console.log(this.templateForm);
    this.completeEdit = true;
    this.submitFormLoader.visibility = true;
    this.submitted = true;
    let id = this.userId;

    if (this.validate()) {

      if (!this.editModel) {
        if (this.templateForm.value.job_tasks && this.templateForm.value.job_tasks.length > 0) {
          let samePriority = this.checkDuplicate(this.templateForm.value.job_tasks);
          if (samePriority) {
            this.completeEdit = false;
            this.submitFormLoader.visibility = false;
            this.swalService.getWarningSwal("Priority can not be same.");
            this.submitFormLoader.visibility = false;
            return;
          }
        }
        this.disableSubmitButton();
        this.postTemplate(this.templateForm.value);
      }
      else {
        formValue['id'] = id;
        if (formValue['job_tasks'] && formValue['job_tasks'].length > 0) {
          let samePriority = this.checkDuplicate(formValue['job_tasks']);
          if (samePriority) {
            this.completeEdit = false;
            this.submitFormLoader.visibility = false;
            this.swalService.getWarningSwal("Priority can not be same.");
            this.submitFormLoader.visibility = false;
            return;
          }
        }
        formValue['id'] = id;
        if (formValue['job_tasks'] && formValue['job_tasks'].length > 0) {
          formValue['job_tasks'].forEach(element => {
            if (element.source_contract1 && element.destination_contract1) {
              element.source_contract = element.source_contract1;
              element.destination_contract = element.destination_contract1;
            }
          });
        }
        this.disableSubmitButton();
        this.patchTemplate(formValue);
      }
    }
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
    this.templateRouteService.postTemplateForm(formValue).subscribe((data: any) => {
      this.enableSubmitButton();
      if (data.status === HttpStatusCodeEnum.Success) {
        this.completeEdit = false;
        this.submitFormLoader.visibility = false;
        this.closeModalBtn.nativeElement.click();
        this.templateForm.reset();
        this.swalService.getSuccessSwal(data.message);
        this.getTemplates(this.filtersUser);
      } else {
        this.swalService.getErrorSwal(data.message);
        // this.closeModalBtn.nativeElement.click();
        this.completeEdit = true;
      }
    }
    );
  }

  patchTemplate(formValue) {
    // console.log('patch', formValue);

    this.templateRouteService.patchTemplateForm(formValue).subscribe(res => {
      this.enableSubmitButton();
      if (res['error'] === true) {
        this.completeEdit = false;
        this.editModel = false;
        this.submitFormLoader.visibility = false;
        this.swalService.getErrorSwal(res['message']);
      } else {
        this.editModel = false;
        this.taskHide = true;
        this.completeEdit = false;
        this.submitFormLoader.visibility = false;
        this.swalService.getSuccessSwal("Record updated successfully.");
        this.closeModalBtn.nativeElement.click();
        this.getTemplates(this.filtersUser)
      }

    });
  }

  sortAccounts(prop: string) {
    const sorted = this.viewJob.job_tasks.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
    if (prop.charAt(0) === '-') { sorted.reverse(); }
    return sorted;
  }

  get getJobFormArray(): FormArray {
    return this.templateForm.get('job_tasks') as FormArray;
  }

  openEditModal(row, type) {
    this.formTitle = 'Update';
    this.userId = row.id;
    // console.log("row", row);
    this.edit = true;
    // this.resetEverything();
    this.editModel = true;

    if (row.schedule_activity_status_label === 'Completed' && type === 1) {
      this.completeEdit = true;
    } else {
      this.completeEdit = false;
    }
    this.viewJob = row;
    this.resetEverything();
    this.taskHide = false;
    this.formTitle = 'Update';
    this.btnText = 'Update';
    let clients = [];
    let contracts = [];
    this.list = [];
    this.list1 = [];
    this.priority = [];
    this.templateForm.get('id').setValue(row.id);
    this.templateForm.get('activity_route').setValue(row.job_name);
    this.templateForm.get('primary_entity').setValue(row.driver_id);
    this.templateForm.get('start_date').setValue(new Date(row.start_datetime));
    this.templateForm.get('end_date').setValue(new Date(row.end_datetime));
    this.templateForm.get('schedule_type_id').setValue(row.schedule_type_id);

    var arr = <FormArray>this.templateForm.get('job_tasks');
    (arr as FormArray).removeAt(0);
    for (let i = 1; i < row.job_tasks.length + 1; i++) {
      this.priority.push(new PrimengDropdownItem(i, (i).toString()));
    }
    for (let i = 0; i < row.job_tasks.length; i++) {
      let element = row.job_tasks[i];
      let task = this.formBuilder.group({
        id: element.id,
        source_client: [element.source_client, [Validators.required]],
        source_contract1: [element.source_contract, [Validators.required]],
        source_contract: [element.source_contract],
        destination_client: [element.destination_client, [Validators.required]],
        destination_contract1: [element.destination_contract, [Validators.required]],
        destination_contract: [element.destination_contract],
        priority: [element.priority, [Validators.required]]
      });
      arr.push(task);
      this.list.push([]);
      this.list1.push([]);
    }
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
        source_contract1: [job[x].source_contract, [Validators.required]],
        source_contract: [job[x].source_contract],
        destination_client: [job[x].destination_client, [Validators.required]],
        destination_contract1: [job[x].destination_contract, [Validators.required]],
        destination_contract: [job[x].destination_contract],
        priority: [job[x].priority, [Validators.required]]
      }))

      if (parseInt(this.priority[0].value) == 0)
        this.priority.push(new PrimengDropdownItem(this.priority.length, (this.priority.length).toString()));
      else {
        this.priority.push(new PrimengDropdownItem(this.priority.length + 1, (this.priority.length + 1).toString()));
      }
    }

    let count1 = 0;
    for (let z = 0; z < task.length; z++) {
      count1 = count1 + 1;
      this.getJobFormArray.insert(count1, task[z]);
    }
  }
  /////////////////////////////////////// FORM FUNCTIONS END /////////////////////////////////////////////

  openEditModal2(row, type) {
    // console.log(row);
    this.viewJob = row;
    this.start_dateViewJob = DateUtils.getMMMMDY(row.created_datetime);
    this.end_dateViewjob = DateUtils.getMMMMDY(row.end_datetime);

    this.gmap.resetMap();

    if (row.schedule_activity_status_label === 'Completed' && type === 1) {
      this.completeEdit = true;
    } else {
      this.completeEdit = false;
    }

    this.formTitle = 'Edit';

    this.viewJob = row;

    let directionsService = null;
    let directionsDisplay = null;

    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true
    });

    let start_pos = '';
    let end_pos = '';

    let tasksArr = [];
    let waypts = [];
    let icons = [];
    let infowindow = [];
    // console.log(this.viewJob.job_tasks);
    this.viewJob.job_tasks.forEach((element, i) => {
      let newLatStart = element.source_latlng;
      let newLngStart = element.source_latlng;
      if (i === 0) {
        start_pos = newLatStart.lat + "," + newLngStart.lng;

      }

      let newLatEnd = element.destination_latlng;
      let newLngEnd = element.destination_latlng;
      if ((i + 1) === this.viewJob.job_tasks.length) {
        end_pos = newLatEnd.lat + "," + newLatEnd.lng;
      }

      let violationInfoWindows = [];

      // const info = [
      //   DateUtils.getLocalMMDDYYYYhhmmss(this.viewJob.started_at_unix)
      // ];
      // let im = this.createInfowindowTemplate(info, 'Starting Point');
      // violationInfoWindows.push(im);

      // const info1 = [
      //   DateUtils.getLocalMMDDYYYYhhmmss(this.viewJob.ended_at_unix)
      // ];

      // im = this.createInfowindowTemplate(info1, 'Ending Point');

      // violationInfoWindows.push(im);

      // let violationMarkers = [];
      // if (this.viewJob.map_trail && this.viewJob.map_trail.length) {
      //   this.viewJob.map_trail.forEach(element => {
      //     violationMarkers.push({
      //       lat: parseFloat(element.latitude),
      //       lng: parseFloat(element.longitude)
      //     })
      //   });
      // }

      // this.gmap.createTrail(violationMarkers, violationInfoWindows, false);


      let contentDrop = `<div id="iw-container">
      <div class="iw-content">
        <div class="padding-5">
          <span class="iw-subTitle" style="color:black">Task: </span> <span style="color:black">${Number(i + 1)} Dropoff</span>
        </div>
        <div class="padding-5">
          <span class="iw-subTitle" style="color:black">Dropoff Date: </span> <span style="color:black">${(element.ended_at_unix) ? DateUtils.getLocalMMDDYYYYhhmmss((element.ended_at_unix)) : '-'}</span>
        </div>
      </div>
    </div>`;

      let contentPickup = `<div id="iw-container">
      <div class="iw-content">
        <div class="padding-5">
          <span class="iw-subTitle" style="color:black">Task: </span> <span style="color:black">${Number(i + 1)} Pickup</span>
        </div>
        <div class="padding-5">
          <span class="iw-subTitle" style="color:black">Pickup Date: </span> <span style="color:black">${(element.started_at_unix) ? DateUtils.getLocalMMDDYYYYhhmmss(element.started_at_unix) : '-'}</span>
        </div>
      </div>
    </div>`;

      infowindow.push((contentPickup));
      infowindow.push((contentDrop));

      // infowindow.push(this.createInfowindowTemplate('Task ' + Number(i + 1), "Pickup"));
      // infowindow.push(this.createInfowindowTemplate('Task ' + Number(i + 1), "Dropoff"));
      icons.push('assets/images/iol/ic_pickup_parcel.png');
      icons.push('assets/images/iol/ic_dest_parcel.png');


      tasksArr.push(new google.maps.LatLng(newLatStart.lat, newLngStart.lng))
      tasksArr.push(new google.maps.LatLng(newLatEnd.lat, newLngEnd.lng))
    });


    // tasksArr = ["Karachi", "Lahore", "Islamabad"];
    // waypts.push({location: tasksArr}, {suppressMarkers: true});
    // // console.log(waypts);



    var checkboxArray = tasksArr;

    for (var i = 0; i < checkboxArray.length; i++) {
      waypts.push({
        location: checkboxArray[i],
        stopover: true
      });

    }

    this.gmap.createMarkers(tasksArr, icons, infowindow, 'mouseover', 40, 30, 12);
    this.gmap.createRouteWithMultipleWaypoints(directionsService, directionsDisplay, start_pos, end_pos, this, waypts);

  }
  /////////////////////////////////////// DROPDOWN CHANGE EVENTS START /////////////////////////////////////////////
  createInfowindowTemplate(data, title?) {
    let content = `<div id="iw-container">
                      <div class="iw-content">
                        <div class="padding-5">
                          <span class="iw-subTitle" style="color:black">${title}: </span> <span style="color:black">${data}</span>
                        </div>
                      </div>
                    </div>`;
    return content;
  }
  clearForm() {
    this.edit = false;
    this.resetEverything();
  }
  onSearch(val) {
    this.filtersUser.search = this.searchForm.value.search;
    this.filtersUser.offset = 0;
    this.getTemplates(this.filtersUser);
    // this.downloadableLink = environment.baseUrl + '/iof/job1/?search=' + this.searchForm.value.search + '&customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/job2/?search=' + this.searchForm.value.search + '&customer_id=' + this.customerID;

    this.downloadableLink =  'search=' + this.searchForm.value.search;
    this.downloadableLink1 =  'search=' + this.searchForm.value.search;


  }
  onChange($event) {
    var val = $event.value;
    this.sendObj.job_type = $event.value;
    this.filtersUser.job_type = $event.value;
    this.getTemplates(this.filtersUser)
    // this.downloadableLink = environment.baseUrl + '/iof/job1/?search=' + this.searchForm.value.search + '&customer_id=' + this.customerID + '&job_type=' + $event.value;
    // this.downloadableLink1 = environment.baseUrl + '/iof/job2/?search=' + this.searchForm.value.search + '&customer_id=' + this.customerID + '&job_type=' + $event.value;

    this.downloadableLink =  'search=' + this.searchForm.value.search + '&job_type=' + $event.value;
    this.downloadableLink1 =  'search=' + this.searchForm.value.search + '&job_type=' + $event.value;


  }

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get('search').setValue('');
    this.sendObj.search = '';
    this.sendObj.job_type = '';
    this.optimized_contracts_call(0, 100, this.sendObj);
    this.filtersUser = { type_id: '', limit: 10, offset: 0, order_by: '', order: '', search: '', status: '', job_type: '' };
    this.getTemplates(this.filtersUser)
  }

  getContracts1(client_id, index) {
    const params = new FormData();
    if (typeof (client_id) == 'number') {
      params.append('client', client_id.toString());
    }
    else {
      for (let i = 0; i < client_id.length; i++) {
        params.append('client', client_id[i]);
      }
    }

    this.entityService.getContractsOfClient(params)
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          // // console.log(apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.contract_list1 = apiResponse.response.map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );

            this.context.list1[index] = apiResponse.response.map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );

          } else {
            // // console.log(apiResponse.message);
          }
        }
      }(this)
      );
  }

  onContractChanged(event: any, index) {
    // console.log('contracts', event);
    // console.log('cominffff', this.selectedContract);
    let ind = this.contract_list.findIndex(x => x.id == event.target.value);
    let contract = this.contract_list[ind];

    this.selectedContracts = event;
    let array = this.templateForm.get('job_tasks') as FormArray;
    array.at(index).patchValue({
      source_contract: contract.id,
      source_client: contract.client
    });
  }

  onContractChanged1(event: any, index) {
    let ind = this.contract_list.findIndex(x => x.id == event.target.value);
    let contract = this.contract_list[ind];
    // console.log('cd', contract);
    let array = this.templateForm.get('job_tasks') as FormArray;
    array.at(index).patchValue({
      destination_contract: contract.id,
      destination_client: contract.client
    });
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];

    if (this.templateForm.get('activity_route').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.templateForm.get('activity_route').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.templateForm.get('primary_entity').hasError('required')) {
      this.errorMessages.push('Driver ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.templateForm.get('start_date').hasError('required')) {
      this.errorMessages.push('Start Date ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.templateForm.get('end_date').hasError('required')) {
      this.errorMessages.push('End Date ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.templateForm.get('schedule_type_id').hasError('required')) {
      this.errorMessages.push('Job Type ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    const jobTasks = this.templateForm.get('job_tasks').value;

    if (jobTasks && jobTasks.length > 0) {
      jobTasks.forEach(element => {
        if (!element.priority || !element.source_contract1 || !element.destination_contract1) {
          isValid = false;
        }
      });
    }

    return isValid;
  }

  checkError(index, Name) {
    const cont = this.templateForm.controls['job_tasks'] as FormArray;
    return cont.controls[index].get(Name);
  }

  /////////////////////////////////////// DROPDOWN CHANGE EVENTS END /////////////////////////////////////////////

  /////////////////////////////////////// LISTING  START /////////////////////////////////////////////


  getTrucks() {
    this.truckService.getCustomerDevicesFuel({ type_id: EntityType.DRIVER })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          // // console.log('devices', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.customerDevices = apiResponse.response;
            this.context.trucks_list = apiResponse.response.map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );
          }
          else {
            // // console.log(apiResponse.message);
          }
        }

      }(this)
      );
  }


  getDrivers() {
    this.formService.getBinsData('get_entity_dropdown', { customer: 1, entity: EntityType.DRIVER })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          // // console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.drivers_list = apiResponse.response.map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );
          } else {
            // // console.log(apiResponse.message);
          }
        }
      }(this)
      );

  }


  getTemplates(filtersUser) {
    let params = `type_id=${filtersUser.type_id}&limit=${filtersUser.limit}&offset=${filtersUser.offset}&order=${filtersUser.order}&order_by=${filtersUser.order_by}&search=${filtersUser.search}&job_type=${filtersUser.job_type}`;
    this.showIndeterminateProgress = true;
    this.templates = [];

    this.templateRouteService.getTemplates(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (data.status === HttpStatusCodeEnum.Success) {
        this.templates = data.data.data;
        this.totalUserLength = data['data'].count;
      }
    }
    );
  }

  sortUserList(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getTemplates(this.filtersUser);
  }

  onPaginateFuelReporting(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getTemplates(this.filtersUser);
  }

  cluster;

  /////////////////////////////////////// LISTING END /////////////////////////////////////////////


  /**** Returns if bin is present in selectedBins
   * @param id
   */
  private getBinIcon(id: any) {
    return this.selectedBins.indexOf(id) > -1;
  }

  applyFilter(row: RecommendationModel) {
    this.selectedClients.push(row.client_id);
  }

  async showSwal(job) {
    // console.log("job---- ", job)
    this.selectedJobToDelete = job;

    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this job?');
    const shouldDelete = await this.swalService.getDeleteSwal(job, 'What do you want to do with this record?');
    // // console.log('shouldDelete', shouldDelete);
    if (shouldDelete) {
      // // console.log("coming in should del");
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteJob(job.id, shouldDelete, 'Record has been' + message + 'successfully');
    }
  }


  // Delete bin
  deleteJob(jobId, actionType, message?) {
    // const params = {};
    // params['id'] = (jobId);
    // params['status'] = actionType;

    // // console.log('params', params);

    this.templateRouteService.deleteJob(jobId).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal(message);
        this.getTemplates(this.filtersUser);
      } else {
        // console.log(data.message);
        this.swalService.getErrorSwal(data.message)
      }

    })
  }




  downloadXLS(download) {
    this.templateRouteService.downloadManageJobsXLS(download).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Job Report.xls')
    })
  }

  downloadPDF(download) {
    this.templateRouteService.downloadManageJobsPDF(download).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Job Report.pdf')
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
