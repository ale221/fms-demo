import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { SelectionModel } from '@angular/cdk/collections';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
@Component({
  selector: 'app-admin-driver-form',
  templateUrl: './admin-driver-form.component.html',
  styleUrls: ['./admin-driver-form.component.css']
})
export class AdminDriverFormComponent implements OnInit, OnDestroy {

  selectedFile: any;
  notCSVExcel = false;
  disabledButton: boolean = true;
  selectedFileName = '';
  bulkUploadApiResponse: any;
  rejectedUsersList = [];
  bulkUploadForm: FormGroup;
  csvFiles: AbstractControl;
  selectedIDToDelete = [];
  selection = new SelectionModel<any>(true, []);

  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  optimizedTechCall: any;
  public appLoader = new AppLoader();
  resultFilterDropDownOptions: any;
  dataTableResultFilter: any;
  isAuthorized = false;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;

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

  selectedUserId = 0;

  driversLoader = new AppLoader();
  laborsLoader = new AppLoader();
  technicianLoader = new AppLoader();

  driversLength: number;
  laborsLength: number;
  techniciansLength: number;


  @ViewChild('closeForm') private closeForm;
  @ViewChild('formModal') private modal;
  @ViewChild('closeFormBulk') public closeFormBulk;


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
  btnText = 'SUbmit';
  sidebarCheck;

  @ViewChild('myInput')
  @ViewChild('editpop') private editpop;
  myInputVariable: any;
  @ViewChild('img')
  image: any;

  hashMap: any = {};
  deleteAllButton: boolean;


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
  filterDrivers = { type_id: 54, limit: 10, offset: 0, order_by: '', order: '', search: '' };
  @ViewChild('driverPaginator') driverPaginator: MatPaginator;
  totalDriverLength = 0;
  displayedDriverList = ["select", "name", "cnic", "status", "on_shift", "role", "modified_by_name", "modified_datetime", "created_datetime", "actions"];
  submitted: boolean;

  keyUp = new Subject<KeyboardEvent>();
  searchText;
  loggedInUser;
  breadcrumbInner = [];
  constructor(private formService: FormService,
    public gotoService: GotoPageService,
    public resizeDatatableSerivce: ResizeDatatableService,
    private userService: UserService,
    //private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private datatableService: DatatableService,
    private brandingService: BrandingService,
    private swalService: SwalService,
    private authService: AuthService,
    private breadcrumbService: BreadcrumbsService,
    private drawerService: DrawerService) {

    this.selectedFile = new Object();

    this.searchForm = this.formBuilder.group({
      search: ['']
    })

    this.driverForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndSpace, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      cnic: ['', [Validators.required, CustomValidators.isNumbers, CustomValidators.isCNIC]],
      dob: [null, [Validators.required]],
      date_of_joining: [null, [Validators.required]],
      salary: ['', [Validators.required, CustomValidators.isNumbers]],
      marital_status_id: ['', [Validators.required]],
      gender_id: ['', [Validators.required]],
      contact_number: [null, [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/), this.noWhitespaceValidator]],
      type_id: [''],
      speed: [''],
      photo: [null],
      email: ['', [Validators.required, Validators.email, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]],
    }, { emitEvent: false });

    this.theme = this.brandingService.styleObject();

    this.bulkUploadForm = this.formBuilder.group({
      'csvFiles': [null, [Validators.required]],
    })
    this.csvFiles = this.bulkUploadForm.controls['csvFiles'];


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

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
    if (this.loggedInUser.package[0].package_id === PackageType.png) {
      this.isAuthorized = false;
    }
  }

  ngOnInit() {
    this.drawerService.getValue().subscribe(res=>{
      this.sidebarCheck=res;
      console.log("ressssssssssssss1",res);
    console.log("ressssssssssssss2",this.sidebarCheck);
  })
    this.breadcrumbService.getValue().subscribe(res => {
      if (res && res.length) {
        this.breadcrumbInner = []
        this.breadcrumbInner = res;
        this.breadcrumbInner[0] = `${res[0]}`;
        console.log("this.breadcrumbInner", this.breadcrumbInner);
      }
    })

    if (this.breadcrumbInner[0] == 'admin/config') {
      setTimeout(() => {
        this.editpop.nativeElement.click();
      }, 1000);
    }
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    // console.log("Tool typeID", EntityType.IMEI_DEVICE)
    // console.log("Driver typeID", EntityType.DRIVER)
    // console.log("Technian typeID", EntityType.Workshop_Technician)
    // console.log("Labor typeID", EntityType.LABOUR);

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

    this.downloadableLink = environment.baseUrl + '/iof/st1/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = environment.baseUrl + '/iof/st2/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;

    this.submitted = false;
    this.closeForm.nativeElement.click();
    this.driverForm.reset();
  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
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
          console.log(value);
          // this.context.itemListTrucks.push(new PrimengDropdownItem(value['id'], value['itemName']));
          this.itemListTrucks.unshift(value);
          console.log('trucks', this.itemListTrucks);
        }
      } else {

      }
    })
  }

  unassignedTruck() {
    console.log(this.selectedTruck);
    const item = this.driverForm.value.truck;
    this.selectedTruck = '';
    // this.itemListTrucks = [...this.itemListTrucks , (new DropDownItem( item.id, item.itemName))];
    // this.getTrucks( item);
  }

  getDrivers(filters): void {
    this.onShift = null;
    this.drivers = [];

    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}`;
    console.log("params== ", params);

    this.showIndeterminateProgress = true;
    this.formService.getEntitiesTool(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (data.status === HttpStatusCodeEnum.Success) {
        this.results_remaining = data['remaining'];
        this.drivers = data['data'].data[0];
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

  get f() {
    return this.driverForm.controls;
  }

  notImage = false;
  // fileChange(event) {
  //   const fileList: FileList = event.target.files;
  //   if (fileList.length > 0) {
  //     const file: File = fileList[0];
  //     const img = document.querySelector('#preview img') as HTMLImageElement;

  //     if (fileList[0].type.indexOf('image') === -1) {
  //       this.notImage = true;
  //     }

  //     if (file.size > 1000000) { // 1MB
  //       this.swalService.getWarningSwal('File is too big! Image must be less than 1 MB');
  //       this.avatar = null;
  //       return;
  //     } else {
  //       this.notImage = false;
  //       this.avatar = file;
  //       this.avatar_url = ' ';
  //       const reader = new FileReader();
  //       reader.onload = (function (aImg) {
  //         return function (e) {
  //           aImg.src = e.target.result;
  //         };
  //       })(img);
  //       reader.readAsDataURL(file);

  //     }
  //   }
  // }

  removeImage(data) {
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = '';
    }
    this.avatar_url = null;
    this.avatar = null;
    if (!data) {
      this.image.nativeElement.src = 'src/assets/images/driver_placeholder.png';
    }
  }

  //Submit Form
  onSubmit(formValue: Object) {
    this.submitted = true;

    if (this.validate()) {
      const id = this.driverForm.getRawValue().id;
      this.disableSubmitButton();

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

      formValue['type_id'] = EntityType.EMPLOYEE;

      if (!isNullOrUndefined(this.avatar)) {
        formValue['photo'] = this.avatar;
      } else {
        delete formValue['photo'];
      }

      // if (this.selectedUserId > 0) {
      //   delete formValue['text_password'];
      // }

      this.disableSubmitButton();
      if (id) {
        formValue['id'] = id;
        this.patchDriver(formValue);
      } else {
        formValue['password'] = 'Aa123456';
        delete formValue['speed'];
        this.postDriverForm(formValue);
      }
    } else {
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
    // if (!(formValue['truck'] === null)) {
    //   if (formValue['truck'].length < 1) {
    //     // do nothing
    //   } else {
    //     param.append('truck', this.selectedTruck);
    //   }
    // }

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
    console.log("param=== ", param)

    this.formService.postData(param).subscribe((data: any) => {
      this.enableSubmitButton();
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getDrivers(this.filterDrivers);
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
    // if (this.f.password.errors) {
    //   isValid = false;
    // }
    if (this.driverForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
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
    if (this.driverForm.get('cnic').hasError('isNumbers')) {
      this.errorMessages.push('CNIC ' + ErrorMessage.CNIC);
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

    if (this.selectedUserId > 0) {

      if (this.driverForm.get('name').hasError('required')) {
        this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
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
      if (this.driverForm.get('cnic').hasError('isNumbers')) {
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
    } else {

    }
    return isValid;
  }

  onClearSearch() {
    this.searchForm.reset();
    console.log(this.searchForm.value, this.searchForm.value.search);
    if (this.searchForm.value.search === null || this.searchForm.value.search === undefined) {
      this.filterDrivers.search = '';
    }
    this.filterDrivers.search = '';
    this.getDrivers(this.filterDrivers);
  }

  binEncode(data) {
    // console.log(data);
    var binArray = []
    var datEncode = "";

    for (let i = 0; i < data.length; i++) {
      binArray.push(data[i].charCodeAt(0).toString(2));
    }
    for (let j = 0; j < binArray.length; j++) {
      var pad = padding_left(binArray[j], '0', 8);
      datEncode += pad + ' ';
    }
    function padding_left(s, c, n) {
      if (!s || !c || s.length >= n) {
        return s;
      }
      var max = (n - s.length) / c.length;
      for (var i = 0; i < max; i++) {
        s = c + s;
      } return s;
    }
    console.log(binArray);
  }

  patchDriver(driver) { //driver: FormData

    // driver.append('id', String(this.selectedDriver.id));
    // driver.append('type', String(this.selectedRole));
    // Display the values
    // this.binEncode(driver.photo)

    this.formService.patchDriver(driver).subscribe((data: any) => {
      this.enableSubmitButton()
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.getDrivers(this.filterDrivers)
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
      } else {
        this.swalService.getErrorSwal(data.message);
        console.log(data.message);
      }
    })
  }

  onShift = null;
  openEditModal(driver) {
    this.selectedUserId = driver.id;
    this.show_password = false;
    this.avatar_url = ' ';
    this.clearForm(driver);
    this.formTitle = 'Update Staff';
    this.btnText = "Update"
    this.onShift = driver.on_shift;
    this.avatar = null;

    this.selectedGender = [{ value: driver['gender'], label: driver['gender_label'] }];

    let found = {};
    for (let i = 0; i < this.itemListMaritalStatus.length; i++) {
      if (this.itemListMaritalStatus[i].value == driver.marital_status) {
        found = this.itemListMaritalStatus[i].value;
        break;
      }
    }

    this.dob = driver['dob'] ? new Date(driver['dob']) : null;
    this.date_of_joining = driver['date_of_joining'] ? new Date(driver['date_of_joining']) : null;
    this.avatar_url = isNullOrUndefined(driver.photo) ? null : driver.photo;

    this.driverForm.patchValue({
      id: driver.id,
      name: driver.name,
      cnic: driver.employee_id,
      salary: isNullOrUndefined(driver.salary) ? '' : driver.salary,
      email: driver.driver_email,
      type: driver.type,
      marital_status_id: found,//this.selectedMaritalStatus, //driver.marital_status_id,
      gender_id: driver.gender,//setGender,//this.selectedGender, //driver.gender_id,
      dob: this.dob ? this.dob : '',
      date_of_joining: this.date_of_joining ? this.date_of_joining : '',
      contact_number: driver.contact_number

    }, { emitEvent: false })

    console.log("this.driverForm.value== ", this.driverForm.value)

  }

  togglePassword(value) {
    console.log(value);
    this.show_password = value;
  }
  togglePassword1() {
    this.show_password = false;
  }
  close() {
    this.submitted = false;
    this.closeForm.nativeElement.click();
    this.driverForm.reset();
    this.selectedUserId = 0;
    // this.formTitle = "Create Staff";
    this.btnText = "Submit";
  }

  async showSwal(driver) {
    const shouldDelete = await this.swalService.getDeleteSwal(driver, 'What do you want to do with ' + driver.name + ' ?');
    if (shouldDelete) {
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteUser(driver.id, shouldDelete, 'Record has been' + message +
        'successfully');
    }
  }

  deleteUser(driver, actionType, message?) {
    const params = {};
    params['id'] = (driver);
    params['status'] = actionType;
    this.hashMap[driver] = true;

    this.formService.deleteStaff(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.getDrivers(this.filterDrivers)
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
      } else {
        this.swalService.getErrorSwal(data.message);
        console.log(data.message);
      }
    }
    );

  }

  deleteDriver1(driverId, actionType, message?, type?) {
    const params = {};
    params['id_list'] = (driverId);
    params['status'] = actionType;
    this.formService.deleteData(params).subscribe(new class extends HttpController<ApiResponse<any>> {
      onComplete(): void {
      }

      onError(errorMessage: string, err: any) {
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

  formTitle = 'Add Staff';
  clearForm(data = null) {
    // this.removeImage(data);
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.driverForm.reset();
    this.getTrucks(null);
    this.formTitle = 'Add Staff';
    // kuch ni kr sakta ma mazrat dont have time to change code. bad code
    this.driverForm.get('email').setValue('');
    // this.driverForm.get('password').setValue('');
    //  this.driverForm.controls.email.setValidators(null);
    //  this.driverForm.controls.email.updateValueAndValidity();
    this.selectedRole = null;
    this.show_password = false;
    this.selectedCheckbox = false;
    this.submitted = false;
  }

  forgotPassword() {
    const params = {};
    // params['email'] = this.email;
    this.userService.forgotPasword(params).subscribe((data: any) => {
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
    this.filterDrivers.search = formValue['search'];
    if (this.filterDrivers.search === null || this.filterDrivers.search === undefined) {
      this.filterDrivers.search = '';
    }

    this.getDrivers(this.filterDrivers);

    this.downloadableLink = environment.baseUrl + '/iof/st1/?search=' + this.filterDrivers.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = environment.baseUrl + '/iof/st2/?search=' + this.filterDrivers.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;

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
  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.selectedFile = file;

      if (this.selectedFile.type.indexOf('.sheet') != -1 || this.selectedFile.type.indexOf('.ms-excel') != -1) { //|| this.selectedFile.type.indexOf('.ms-excel') != -1 //xlsx, xls
        this.notCSVExcel = false;
        this.disabledButton = false;
      } else {
        this.notCSVExcel = true;
        this.disabledButton = true;
      }

      this.selectedFileName = this.selectedFile.name;
    }
  }
  bulkUploadSubmit(formValue: Object) {
    console.log("inside submit function(formValue)= ", formValue);
    const params: FormData = new FormData();

    if (!isNullOrUndefined(formValue['csvFiles'])) {
      params.append('source_file', this.selectedFile);
    }
    console.log("params== ", params)

    this.formService.uploadUserBulkUpload(params).subscribe((data: any) => {
      console.log("uploadBulk() response= ", data);

      if (data.status === HttpStatusCodeEnum.Success) {
        this.bulkUploadApiResponse = data.data[0];
        // console.log("this.bulkUploadApiResponse- ", this.bulkUploadApiResponse);

        if (data.data[0].rejected_users.length > 0) {
          this.rejectedUsersList = data.data[0].rejected_users;

          if (data.data[0].created_users.length >= 1) {
            this.getDrivers(this.filterDrivers);
          }


        } else {
          this.closeFormBulk.nativeElement.click();
          this.swalService.getSuccessSwal("File uploaded successfully");
          this.getDrivers(this.filterDrivers);
          // this.clear();
          this.bulkUploadForm.reset();
          this.rejectedUsersList = [];
        }

      } else {
        console.log("data.message== ", data.message)
        this.swalService.getErrorSwal(data.message);
      }

    })
  }

  deleteThroughCheckbox() {
    this.selectedIDToDelete = [];

    if (this.selection.selected.length > 0) {
      for (let i = 0; i < this.selection.selected.length; i++) {
        if (this.selection.selected[i].id !== this.loggedInUser?.id && this.selection.selected[i].type !== 35) {
          this.selectedIDToDelete.push(this.selection.selected[i].id);
        }
      }
      console.log("this.selectedIDToDelete=== ", this.selectedIDToDelete)
    }

    if (this.selectedIDToDelete && this.selectedIDToDelete.length === 0) {
      this.swalService.getWarningSwal('Please provide valid users to delete');
      return false;
    }

    let params = {
      id: this.selectedIDToDelete
    }

    this.formService.multiDeleteUsers(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.selection = new SelectionModel<any>(true, []);
        this.swalService.getSuccessSwal('Record(s) has been deleted successfully');
        this.getDrivers(this.filterDrivers);
      } else {
        console.log(data.message);
        this.swalService.getErrorSwal(data.message)
      }
    })

  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.drivers.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.drivers.forEach(row => this.selection.select(row));
  }
  async showSwalBulk() {
    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
    const shouldDelete = await this.swalService.getDeleteSwalBulk("Do You Want to delete this record");
    console.log('shouldDelete', shouldDelete);
    if (shouldDelete) {
      console.log("coming in should del");
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteThroughCheckbox();
    }
  }
  downloadRejectedUser() {
    console.log("rejectedUsersList= ", this.rejectedUsersList);
    // if (this.rejectedUsersList.length > 0) {
    //   const result = this.rejectedUsersList.map(({
    //     first_name, last_name, email, password
    //   }) => ({
    //     first_name, last_name, email, password
    //   }));
    //   this.srvUtillsService.exportToExcel(this.csvColsForRejectedBulkUpload, 'RejectedUserList.xls', result);
    // }
    if (this.bulkUploadApiResponse && this.bulkUploadApiResponse.file_url) {
      window.open(this.bulkUploadApiResponse.file_url, '_blank');
    }
    // API call
    // if (this.rejectedUsersList.length > 0) {
    //   this.userService.downloadRejectedUserList(this.rejectedUsersList).subscribe((data: any) => {
    //     console.log("downloadRejectedUserList() response= ", data);
    //     window.open(data,'_blank')
    //   })
    // }
  }

  clearForm2() {
    this.disabledButton = true;
    this.selectedFileName = '';
    this.bulkUploadForm.reset();
    this.submitted = false;
    this.selectedUserId = 0;
    this.inactiveRecord = false;
    this.enableSubmitButton();
    this.bulkUploadForm.reset();
    this.selectedStatus = null;
    this.rejectedUsersList = [];

  }
  pageReload() {
    console.log("coming");
    window.location.reload()
  }




}
