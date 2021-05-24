import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { isNullOrUndefined } from 'util';
import { subYears } from 'date-fns';
import { ResizeDatatableService } from '../../shared/resize-datatable.service';
// import {ConfirmationService} from 'primeng/api';
import { BrandingService } from '../../shared/services/branding.service';
import { AppLoader } from '../../data/model/app-loader';
import { EntityStatusEnum, EntityType } from 'src/app/core/enum/entity-type.enum';
import { FormService } from '../../services/FormService';
import { GotoPageService } from '../../services/goto-page.service';
import { UserService } from 'src/app/core/services/user.service';
import { DatatableService } from '../../services/datatable.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { CustomValidators } from 'src/app/core/custom.validator';
import { HttpController } from 'src/app/core/services/loading-controller';
import { LoginApiResponse, TestApiResponse, ApiResponseNew, ApiResponse } from 'src/app/core/model/api.response';
import { DropDownItem } from '../../data/model/dropdown-item';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { TruckResponse } from '../../data/response/entity-response';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { ErrorMessage } from '../../error-message';
import { MatPaginator } from '@angular/material/paginator';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { DriverDetailsService } from '../../services/drivers/driver-details.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-driver-vehicle-allocation',
  templateUrl: './driver-vehicle-allocation.component.html',
  styleUrls: ['./driver-vehicle-allocation.component.css']
})
export class DriverVehicleAllocationComponent implements OnInit, OnDestroy {

  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  optimizedTechCall: any;
  public appLoader = new AppLoader();
  resultFilterDropDownOptions: any;
  dataTableResultFilter: any;
  isAuthorized = false;
  contractStartDate: Date;
  contractEndDate: Date;
  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;
  driverLists = [];
  vehicleListing = [];
  public start_datetime: Date;
  public dob: Date;
  public date_of_joining: Date;
  driverForm: FormGroup;
  errorMessages: string[];
  customerDevices = [];
  selectedDriver = null;
  EntityStatusEnum = EntityStatusEnum;
  EntityType = EntityType;
  settings_truck = {
    singleSelection: true,
    text: 'No Assignment',
    enableSearchFilter: false,
    showCheckbox: false
  };
  settings = {
    singleSelection: true,
    text: 'Select an Option',
    enableSearchFilter: false,
    showCheckbox: false
  };

  selectedMaritalStatus;
  selectedGender;
  selectedTruck;
  selectedRole;

  activeTab = 1;


  driverGroup = [];
  driverDropdown = [];
  selectedUserID;


  driversLoader = new AppLoader();
  laborsLoader = new AppLoader();
  technicianLoader = new AppLoader();

  driversLength: number;
  laborsLength: number;
  techniciansLength: number;


  @ViewChild('closeForm') private closeForm;
  @ViewChild('formModal') private modal;


  //old
  all_statuses = [];
  itemListGenders = [];
  itemListTrucks = [];
  itemListRole = [{ value: EntityType.LABOUR, label: 'Labor' }, {
    value: EntityType.DRIVER,
    label: 'Driver'
  }, { value: EntityType.Workshop_Technician, label: 'Technician' }];
  itemListMaritalStatus = [];
  public avatar: File = null;
  public avatar_url: string = null;


  public birth_date: any;
  public join_date: any;
  inputValue = '';

  selectedCheckbox = false;

  selectedStatus: any;
  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;
  is_edit: boolean;
  drivers;//: any[];
  labors: any[];
  technicians: any[] = [];
  temp: any[] = [];
  tempLabors: any[] = [];
  tempTechnicians: any[] = [];
  selectedRows = [];
  selectedLaborRows = [];
  selectedTechnicianRows = [];
  show_password: boolean = false;

  settings_readOnly = {
    singleSelection: true,
    text: 'Select an Option',
    enableSearchFilter: true,
    showCheckbox: false,
    disabled: true,
  };

  currentDate = new Date();
  dateOfBirth = subYears(new Date(), 18);

  btnLoading: boolean;
  btnText: string;

  @ViewChild('myInput')
  myInputVariable: any;
  @ViewChild('img')
  image: any;

  hashMap: any = {};
  deleteAllButton: boolean;

  filters = { limit: 10, offset: 0, order_by: '', order: '', search: '', vehicle_id: '', driver_id: '', type_id: 5 };

  csvCols = [
    { field: 'name', header: 'Name' },
    { field: 'type_name', header: 'Role' },
    { field: 'type', header: 'Role' },
    { field: 'gender_label', header: 'Gender' },
    { field: 'marital_status_label', header: 'Marital Status' },
    { field: 'salary', header: 'Salary (AED)' },
    { field: 'date_of_joining', header: 'DoJ' },
    // {field: 'driver_email', header: 'Email'},
  ];
  isNullOrUndefined = isNullOrUndefined;
  csvRows = [];

  items = [{ label: 'Staff Form', url: null }];
  home = { label: 'Dashboard' };

  results_remaining = false;

  datatableResultsLimit: any = 2;
  theme;

  // Added by wahab
  searchForm: FormGroup;
  // filterDrivers = { type_id: 5, limit: 10, offset: 0, order_by: '', order: '' };
  filterDrivers = { type_id: 5, limit: 10, offset: 0, order_by: '', order: '', search: '', vehicle_id: '', driver_id: '' };
  @ViewChild('driverPaginator') driverPaginator: MatPaginator;
  totalDriverLength = 0;
  displayedDriverList = ["vehicle_name", "driver_first_name", "start_date", "end_date", "actions"];
  submitted: boolean;

  keyUp = new Subject<KeyboardEvent>();
  searchText;
  sidebarCheck: any;

  constructor(
    private driverService: DriverDetailsService, private formService: FormService,
    public gotoService: GotoPageService,
    public resizeDatatableSerivce: ResizeDatatableService,
    private userService: UserService,
    private authService: AuthService,
    //private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private datatableService: DatatableService,
    private brandingService: BrandingService,
    private swalService: SwalService,
    private drawerService: DrawerService) {

    this.searchForm = this.formBuilder.group({
      search: [''],
      selectGroup: [''],
      selectedDriver: ['']
    })

    this.driverForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      driver_id: ['', [Validators.required]],
      vehicle_id: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    }, { emitEvent: false });

    this.theme = this.brandingService.styleObject();

    this.resultFilterDropDownOptions = [
      { label: '2 Results', value: 1 },
      { label: '4 Results', value: 2 },
      { label: '6 Results', value: 3 },
      { label: '10 Results', value: 4 },
      { label: '15 Results', value: 5 },
      { label: '20 Results', value: 6 }
    ];

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
  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    // console.log("Tool typeID", EntityType.IMEI_DEVICE)
    // console.log("Driver typeID", EntityType.DRIVER)
    // console.log("Technian typeID", EntityType.Workshop_Technician)
    // console.log("Labor typeID", EntityType.LABOUR);

    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.getGroupList();
    this.getDrivers(this.filterDrivers);
    this.getDriversDropdown(this.filters);
    this.getVehicleList();
    this.btnText = "Save";
    this.csvRows = [];
    this.deleteAllButton = false;
    this.formService.getOptionsforDropDown('dropdown_data', { option_key: 'gender' }).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
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

    this.getTrucks(null);
    this.getDrivers(this.filterDrivers);

    this.keyUp.pipe(
      map(event => event.target['value']),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(newValue => {
      this.searchText = newValue;
      if (this.searchText.length > 0 || this.searchText.length === 0) {
        this.searchForm.get("search").setValue(this.searchText);
        console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
        this.filterDrivers.search = this.searchForm.get('search').value;
        this.getDrivers(this.filterDrivers);
      }
    });

    this.formService.getDriverListing().subscribe(res => {
      this.driverLists
    });

    // this.downloadableLink = environment.baseUrl + '/iof/dvxle/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/dvpdf/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;

     this.downloadableLink = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
     this.downloadableLink1 = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;

    
  }

  dateFinal(event) {
    console.log(this.contractStartDate);
  }
  getTrucks(value) {
    this.formService.getOptions('unassigned_trucks', {}).subscribe((data: any) => {

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

  getGroupList() {
    this.driverService.getDriverGroup().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverGroup = data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
      } else {
        console.log(data.message);
      }
    });
  }

  getDriversDropdown(filters) {
    filters.type_id = 5;
    if (filters.search === undefined || filters.search === null) {
      filters.search = '';
    }

    let params = `type_id=${filters.type_id}&search=${filters.search}&driver_id=${filters.driver_id}`;

    this.formService.getDriversVehicleAllocations2(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.driverDropdown = apiResponse['data'].map(
          item => new DropDownItem(item['id'], item['name'])
        );
      }
    })
  }

  getVehicleList() {
    this.driverService.getVehicleDrivertoVehicleAllocation().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.vehicleListing = data.response.map(
          item => new DropDownItem(item['id'], item['label'])
        );
      } else {
        console.log(data.message);
      }
    });
  }

  selectDriverDropDownChange(event) {
    this.filters.vehicle_id = event.value;
    this.downloadableLink = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&vehicle_id=' + this.filters.vehicle_id + '&driver_id=' + this.filters.driver_id;
    this.downloadableLink1 = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&vehicle_id=' + this.filters.vehicle_id + '&driver_id=' + this.filters.driver_id;
    this.getDrivers(this.filters);
  }
  selectVehicleDropDownChange(event) {
    this.filters.driver_id = event.value;
    this.downloadableLink = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&driver_id=' + event.value + '&vehicle_id=' + this.filters.vehicle_id;
    this.downloadableLink1 = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&driver_id=' + event.value + '&vehicle_id=' + this.filters.vehicle_id;
    this.getDrivers(this.filters);
  }


  unassignedTruck() {
    const item = this.driverForm.value.truck;
    this.selectedTruck = '';
    // this.itemListTrucks = [...this.itemListTrucks , (new DropDownItem( item.id, item.itemName))];
    // this.getTrucks( item);
  }


  getDrivers(filters): void {
    // let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}&vehicle_id=${filters.vehicle_id}&driver_id=${filters.driver_id}`;

    this.showIndeterminateProgress = true;
    this.formService.getVehicleAllocation(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (data.status === HttpStatusCodeEnum.Success) {
        this.results_remaining = data['remaining'];
        this.drivers = data['data'].data;
        this.drivers.pagination = this.totalDriverLength;
        this.totalDriverLength = data['data'].count;
        this.temp = data['response'];
      } else {
        this.swalService.getErrorSwal(data.message);
      }
    });
  }

  changeMaterial() {
    this.datatableResultsLimit = this.dataTableResultFilter.value;
  }

  populateHashmap(list) {
    for (const entry of list) {
      this.hashMap[entry.id] = false;
    }
    // console.log('hashmap' , this.hashMap);
  }

  getprogress(area) {
    return this.hashMap[area.id];
  }

  disableButton(row) {
    return this.formService.disableButton(row);
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

  // removeImage(data) {
  //   if (this.myInputVariable) {
  //     this.myInputVariable.nativeElement.value = '';
  //   }
  //   this.avatar_url = null;
  //   this.avatar = null;
  //   if (!data) {
  //     this.image.nativeElement.src = '/assets/images/iol/driver_placeholder.png';
  //   }
  // }

  //Submit Form
  onSubmit(formValue: Object) {
    this.submitted = true;
    formValue['start_date'] = DateUtils.getUtcDateTimeStart(formValue['start_date']);
    formValue['end_date'] = DateUtils.getUtcDateTimeStart(formValue['end_date']);

    if (this.validate()) {
      this.disableSubmitButton();
      if (this.selectedUserID) {
        this.patchDriver(formValue, this.selectedUserID);
      } else {
        this.postDriverForm(formValue);
      }
    }
    else {
      console.log(this.errorMessages);
    }
  }

  /* Takes object of current form & convert it to formValue for picture */
  createFormGroupWithFormValue(formValue): FormData {
    const param: FormData = new FormData();
    if (!isNullOrUndefined(formValue['marital_status_id'])) {
      param.append('marital_status_id', this.selectedMaritalStatus);
    }
    if (!isNullOrUndefined(formValue['cnic'])) {
      param.append('cnic', formValue['cnic']);
    }
    if (!isNullOrUndefined(formValue['salary'])) {
      param.append('salary', formValue['salary']);
    }
    if (!isNullOrUndefined(formValue['gender'])) {
      param.append('gender_id', this.selectedGender);
    }
    param.append('email', 'test@gmail.com');

    if (!isNullOrUndefined(this.avatar)) {
      param.append('photo', this.avatar);
    } else if (!isNullOrUndefined(formValue['photo'])) {
      let image = formValue['photo'].split('/');
      image = image[image.length - 1];
      param.append('photo', image);
    }
    if (!isNullOrUndefined(formValue['date_of_joining'])) {
      param.append('date_of_joining', DateUtils.getYYYYMMDD(formValue['date_of_joining']));
    }
    if (!isNullOrUndefined(formValue['dob'])) {
      param.append('dob', DateUtils.getYYYYMMDD(formValue['dob']));
    }
    param.append('name', formValue['name']);
    param.append('email', '');
    param.append('contact_number', formValue['contact_number']);
    param.append('type', String(this.selectedRole));

    return param;

  }

  postDriverForm(param) {
    console.log("cominf in post", param);
    this.formService.postVehicleShift(param)
      .subscribe((data: any) => {
        console.log('postData() response=', data);
        this.enableSubmitButton();
        if (data.status === HttpStatusCodeEnum.Success) {
          this.submitted = false;
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.driverForm.reset();
          this.getDrivers(this.filterDrivers);
          this.getDriversDropdown(this.filters)
        } else {
          console.log(data.message);
          this.swalService.getErrorSwal(data.message);
        }
      })

  }

  email;
  inactiveRecord;
  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.driverForm.get('driver_id').hasError('required')) {
      this.errorMessages.push('Driver Id ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('vehicle_id').hasError('required')) {
      this.errorMessages.push('Vehicle Id ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('start_date').hasError('required')) {
      this.errorMessages.push('Start Date ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.driverForm.get('end_date').hasError('required')) {
      this.errorMessages.push('End Date ' + ErrorMessage.REQUIRED);
      isValid = false;
    }





    return isValid;
  }
  onClearSearch() {
    // this.searchForm.get("search").setValue(this.searchText);
    // console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
    // this.filterDrivers.search = this.searchForm.get('search').value;
    //   this.searchForm.reset();
    //  console.log(this.searchForm.value,this.searchForm.value.search);
    //  if(this.searchForm.value.search === null || this.searchForm.value.search === undefined)
    //  {
    //    this.filterDrivers.search='';
    //  }
    //  this.filterDrivers.search='';
    //   this.getDrivers(this.filterDrivers);
    this.downloadableLink = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.searchForm.reset();
    this.searchForm.get('search').setValue('');
    this.filters = { limit: 10, offset: 0, order_by: '', order: '', search: '', vehicle_id: '', driver_id: '', type_id: 5 };
    this.getDrivers(this.filters);

  }

  patchDriver(driver, id) { //driver: FormData

    // driver.append('id', String(this.selectedDriver.id));
    // driver.append('type', String(this.selectedRole));
    // Display the values
    console.log("coming in patch", driver);
    this.formService.patchVehicleShift(driver, id)
      .subscribe((data: any) => {
        console.log(data);
        this.enableSubmitButton();
        if (data.status === HttpStatusCodeEnum.Success) {
          this.submitted = false;
          this.getDrivers(this.filterDrivers);
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getDriversDropdown(this.filters)
        } else {
          this.swalService.getErrorSwal(data.message);
          console.log(data.message);
        }
      })
  }

  onShift = null;
  openEditModal(driver) {
    console.log("openEditModal", driver);
    this.selectedUserID = driver.id;
    // this.clearForm(driver);
    this.formTitle = 'Update Allocation';
    this.btnText = "Update"
    // this.onShift = driver.on_shift;

    // this.selectedMaritalStatus = {id: driver.vehicle_id,value: driver.vehicle_id, name: driver.vehicle_name, label: driver.vehicle_name};
    // this.selectedMaritalStatus = {id: driver.vehicle_id, name: driver.vehicle_name};
    let driver_id = driver.driver_first_name ? driver.driver : '';
    this.driverForm.patchValue({
      id: driver.id,
      start_date: new Date(driver.start_date),
      end_date: new Date(driver.end_date),
      vehicle_id: driver.vehicle_id,
      driver_id: driver_id
    });


  }

  togglePassword(value) {
    console.log(value);
    this.show_password = value;
  }

  async showSwal(driver) {
    const response = await this.swalService.getConfirmSwal();
    if (response) {
      this.hashMap[driver.id] = true;
      this.formService.deleteVehicleShift(driver.id)
        .subscribe((data: any) => {


          if (data.status === HttpStatusCodeEnum.Success) {
            this.submitted = false;
            this.getDrivers(this.filterDrivers)
            this.getDriversDropdown(this.filters)
            this.closeForm.nativeElement.click();
            this.swalService.getSuccessSwal(data.message);
          } else {
            this.swalService.getErrorSwal(data.message);
            console.log(data.message);
          }

          //  onNext(data) {
          //   console.log(data);
          //   this.context.hashMap[driver.id] = false;
          //   if (data.status === HttpStatusCodeEnum.Success) {
          //     const shouldDeleteOrInactive = await this.context.swalService.getDeleteSwal(driver);
          //     if (shouldDeleteOrInactive) {
          //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
          //       this.data.deleteDriver1([driver.id], shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', driver.type);
          //     }
          //   } else if (data.status === HttpStatusCodeEnum.Bad_Request) {
          //     const shouldDeleteOrInactive = await this.context.swalService.getDeleteSwal(driver, apiResponse.message);
          //     if (shouldDeleteOrInactive) {
          //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
          //       this.context.deleteDriver1([driver.id], shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', driver.type);
          //     }
          //   } else {
          //     this.context.swalService.getErrorSwal('Operation Unsuccessful', apiResponse.message);
          //   }
          // }

        }
        );
    }

  }

  deleteDriver1(driverId, actionType, message?, type?) {
    const params = {};
    params['id_list'] = (driverId);
    params['status'] = actionType;
    this.formService.deleteData(params)
      .subscribe(new class extends HttpController<ApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: ApiResponse<any>): void {
          this.context.swalService.getSuccessSwal(message);
          console.log(type);
          if (type === EntityType.LABOUR) {
            this.context.selectedLaborRows = [];
          } else if (type === EntityType.DRIVER) {
            this.context.selectedRows = [];
            // this.context.getDrivers(this.filterDrivers);
          } else if (type === EntityType.Workshop_Technician) {
            this.context.selectedTechnicianRows = [];
          }
        }

      }(this)
      );
  }

  formTitle = 'Create Allocation';

  clearForm(data = null) {
    this.selectedUserID = '';
    this.driverForm.reset();
    // this.removeImage(data);
    this.enableSubmitButton();
    this.inactiveRecord = false;

    this.getTrucks(null);
    this.formTitle = 'Add Allocation';
    this.btnText = "Save"
    this.selectedRole = null;
    this.show_password = false;
    this.selectedCheckbox = false;
    this.submitted = false;
  }

  forgotPassword() {
    const params = {};
    // params['email'] = this.email;
    this.userService.forgotPasword(params)
      .subscribe((data: any) => {
        console.log("forgotPasword() response=, ", data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getInfoSwal('Please check your email for further assistance');
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      })
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }

  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  getFormTitle() {
  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }

  onSearch(formValue) {
    console.log(formValue, "Runnign");
    //  this.searchForm.get("search")
    //         console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
    this.filterDrivers.search = formValue['search'];
    if (this.filterDrivers.search != null || this.filterDrivers.search != undefined) {
      this.filterDrivers.search = formValue['search'];
    }
    console.log(formValue);
    this.getDrivers(this.filterDrivers);
  }

  getAllocation(params) {
    this.formService.getAllocationListing().subscribe(res => {

    });

  }

  sortDrivers(event) {
    this.filterDrivers.order_by = event.active;
    this.filterDrivers.order = event.direction;
    this.getDrivers(this.filterDrivers);
  }

  onDriverPagination(event) {
    this.filterDrivers.offset = (event.pageIndex * event.pageSize);
    this.getDrivers(this.filterDrivers);
  }

  downloadXLS(download) {
    this.formService.downloadXLSVehicleAllocation(download).subscribe((apiResponse: any) => {
      console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      window.open(url);
    })
  }

  downloadPDF(download1) {
    this.formService.downloadPDFVehicleAllocation(download1).subscribe((apiResponse: any) => {
      console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    })
  }
}

