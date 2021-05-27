import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormService } from '../../services/FormService';
import { UserRoleEnum } from '../../enum/user-role.enum';
import { HttpController } from 'src/app/core/services/loading-controller';
import { ApiResponse, ApiResponseNew, LoginApiResponse } from 'src/app/core/model/api.response';
import { AppLoader } from '../../data/model/app-loader';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { DatatableService } from '../../services/datatable.service';
import { isNullOrUndefined } from 'util';
import { SwalService } from 'src/app/core/services/swal.service';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { BrandingService } from '../../shared/services/branding.service';
import { CustomValidators } from 'src/app/core/custom.validator';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { ErrorMessage } from '../../error-message';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FiltersService } from 'src/app/core/services/filters.service';
import { DropDownItem } from "../../data/model/dropdown-item";
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
// import { debugger } from 'fusioncharts';
import { SelectionModel } from '@angular/cdk/collections';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { UtillsService } from '../../services/common/utills.service';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
@Component({
  selector: 'app-admin-user-form',
  templateUrl: './admin-user-form.component.html',
  styleUrls: ['./admin-user-form.component.css']
})
export class AdminUserFormComponent implements OnInit {
  // FORM GROUP & FORM CONTROLS
  bulkUploadForm: FormGroup;
  csvFiles: AbstractControl;
  // Global Variables
  notCSVExcel = false;
  selectedFileName = '';
  downloadableLink: string;
  downloadableLink1: string;
  customerID;
  selectedFile: any;
  isNullOrUndefined = isNullOrUndefined;

  csvRows = [];
  private csvCols = [
    { field: 'first_name', header: 'First Name' },
    { field: 'last_name', header: 'Last Name' },
    { field: 'email', header: 'Email' },
    { field: 'user_role_id', header: 'Role' },
    { field: 'password', header: 'Password' },
  ];
  private csvColsForRejectedBulkUpload = [
    { field: 'first_name', header: 'First Name' },
    { field: 'last_name', header: 'Last Name' },
    { field: 'email', header: 'Email' },
    { field: 'password', header: 'Password' },
  ];

  userForm: FormGroup;
  users;//: any = [];
  searchPlaceHolder = 'Search By Name...';
  btnLoading: boolean;
  btnText: string;
  passwordNotMatch = '';
  selectedClient;
  validEmail = false;
  submitted = false;
  formTitle = 'Add New User';
  isAuthorized = false;
  temp: any = [];
  @ViewChild('closeForm') public closeForm;
  @ViewChild('closeFormBulk') public closeFormBulk;
  loggedInUser;
  selectedUser;
  selectedUserId = 0;
  filters = {};
  appLoader = new AppLoader();
  userLoader = new AppLoader();
  UserRoleEnum = UserRoleEnum;
  deleteLoader = new AppLoader(false, false);
  theme;

  groupList;

  // Added by wahab
  searchForm: FormGroup;
  @ViewChild('userPaginator') userPaginator: MatPaginator;
  @ViewChild('addEditUser') private addEditUser;
  totalUserLength = 0;
  displayedUserList = ["select", "first_name", "last_name", "email", "group", "date_joined", "status", "actions"]
  EntityType = EntityType;
  EntityStatusEnum = EntityStatusEnum;
  showIndeterminateProgress: boolean;
  filtersUser = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search: '', status: '' };
  errorMessages: string[];
  filtersPermission = { type: 2, limit: 10, offset: 0, order_by: '', order: '' };
  groups;
  selectedGroup;
  inactiveRecord;
  mapArrayGroups: any;
  selectedGroupDrop;
  selectedStatus;
  selectedStatusDrop;
  breadcrumbInner = [];
  addUser: boolean = true;
  statusList = [{ id: 1, name: "Active" }, { id: 2, name: "Inactive" }];
  statusLists = [{ id: '', name: "All" }, { id: 1, name: "Active" }, { id: 2, name: "Inactive" }];

  keyUp = new Subject<KeyboardEvent>();
  searchText;
  disableButton: boolean = true;

  selection = new SelectionModel<any>(true, []);
  selectedIDToDelete = [];
  rejectedUsersList = [];
  bulkUploadApiResponse: any;
  sidebarCheck;

  login_user;

  constructor(private userService: UserService,
    private authService: AuthService,
    private swalService: SwalService,
    private formService: FormService,
    private filtersService: FiltersService, private srvUtillsService: UtillsService,
    private formBuilder: FormBuilder,
    private brandingService: BrandingService,
    private datatableService: DatatableService,
    private breadcrumbService: BreadcrumbsService,
    private drawerService: DrawerService) {

    this.selectedFile = new Object();
    this.theme = this.brandingService.styleObject();

    this.searchForm = this.formBuilder.group({
      search: [''],
      searchStatus: []
    })

    this.userForm = this.formBuilder.group({   //USER FORM
      first_name: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/), CustomValidators.isAlphabetsAndSpace, this.noWhitespaceValidator]],
      last_name: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/), CustomValidators.isAlphabetsAndSpace, this.noWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]],
      group: [null],
      password: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$')
      ])
      ],
      confirm_password: [null, [Validators.required]],
      status: [null, [Validators.required]],
      read_only: false
    });

    this.bulkUploadForm = this.formBuilder.group({
      'csvFiles': [null, [Validators.required]],
    })
    this.csvFiles = this.bulkUploadForm.controls['csvFiles'];

  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
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
        this.addEditUser.nativeElement.click();
      }, 1000);
    }

    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.getUsers(this.filtersUser);
    this.getGroupList(this.filtersPermission);

    this.statusList.forEach((element: any) => {
      element.label = element.name;
      element.value = element.id;
    });
    this.statusLists.forEach((element: any) => {
      element.label = element.name;
      element.value = element.id;
    });

    this.getRoleGroups()

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
        this.filtersUser.search = this.searchForm.get('search').value;
        this.getUsers(this.filtersUser);
      }
    });
    // this.downloadableLink = environment.baseUrl + '/api/users/user_data_export_xle/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&login_user=' + this.loggedInUser.id;
    // this.downloadableLink1 = environment.baseUrl + '/api/users/user_data_export_pdf/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&login_user=' + this.loggedInUser.id;

    this.downloadableLink = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;
    this.downloadableLink1 = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;

  }
  get f() {
    return this.userForm.controls;
  }
  searchStatusDropDownChange(event) {
    this.filtersUser.status = event.value;
    this.getUsers(this.filtersUser);
  }

  getRoleGroups() {
    let params = ``;
    this.formService.getGroup(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.groupList = apiResponse['data'].data;

        this.groupList?.forEach(element => {
          element.label = element.name;
          element.value = element.id;
        });

      }
    })
  }

  alphaOnly(event) {
    var key = event.keyCode;
    if ((key >= 49 && key <= 57) || key == 48) {
      this.userForm.get('first_name').setValue('')
      return false;
    }
  }


  getGroupList(filters) {
    let params = `type=${filters.type}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    this.userService.getAllGroups(params).subscribe((response: any) => {
      if (!response.error) {
        //Method2
        this.mapArrayGroups = response.data['data'];
        this.mapArrayGroups?.forEach(element => {
          element.label = element.name;
          element.value = element.id;
        });

      } else {
        this.swalService.getErrorSwal(response.message);
      }
    }
    );
  }

  groupDropDownChange(event) {
    this.selectedGroupDrop = event.value;
    this.userForm.get('group').setValue(this.selectedGroupDrop);
  }

  statusDropDownChange(event) {
    this.selectedStatusDrop = event.value;
    this.userForm.get('status').setValue(this.selectedStatusDrop)
  }

  async showSwal(user) {
    this.selectedUser = user;
    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
    const shouldDelete = await this.swalService.getDeleteSwal(user, 'What do you want to do with ' + user.email + ' ?');
    if (shouldDelete) {
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteUser(user.id, shouldDelete, 'Record has been' + message + 'successfully');
    }
  }
  async showSwalBulk() {
    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
    const shouldDelete = await this.swalService.getDeleteSwalBulk2('Do you want to delete these record(s)');
    if (shouldDelete) {
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteThroughCheckbox();
    }
  }

  get formAltaControls(): any {
    return this.userForm['controls'];
  }

  // Delete bin
  deleteUser(userId, actionType, message?) {
    const params = {};
    params['user_id'] = (userId);
    params['status'] = actionType;
    this.userService.deleteUsers(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal(message);
        this.getUsers(this.filtersUser);
      } else {
        this.swalService.getErrorSwal(data.message)
      }
    })
  }
  ngOnChanges() {
    // this.openEditModal()
  }

  openEditModal(user) {
    this.submitted = false;
    this.selectedUserId = user.id;
    this.formTitle = 'Update User';
    this.btnText = 'Update';

    for (let i = 0; i < this.statusList.length; i++) {
      if (user.status == this.statusList[i].id) {
        user.status = this.statusList[i].id;
        this.selectedStatus = { value: this.statusList[i].id, label: this.statusList[i].name, id: this.statusList[i].id, name: this.statusList[i].name }
      }
    }

    setTimeout(() => {
      this.userForm.patchValue({
        first_name: user.first_name || {},
        last_name: user.last_name || {},
        email: user.email || {},
        status: this.selectedStatus.id || {},
        read_only: user.read_only ? user.read_only : false,
        group: user?.group_id || '',//setGroup, ali = selectedGroup
        //user.status,  ali:selectedStatus
      })

      this.userForm.controls['email'].disable();
      this.userForm.controls.confirm_password.setValidators(null);
      this.userForm.controls.confirm_password.updateValueAndValidity();

      this.userForm.controls.password.setValidators(null);
      this.userForm.controls.password.updateValueAndValidity();
    }, 300);
  }

  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      // console.log(key,data[key]);
      form_data.append(key, data[key]);
    }
    return form_data;
  }

  validateEmail(email) {
    const re = /\w+@\w+\.\w{2,10}/;
    this.validEmail = re.test(String(email).toLowerCase());
    return re.test(String(email).toLowerCase());
  }

  onSubmit(value) {
    this.addUser = false;
    this.submitted = true;

    if (!isNullOrUndefined(this.selectedClient)) {
      value['associated_client'] = this.selectedClient;
    }
    // console.log(this.f.password.errors,this.f.password.errors.pattern)
    if (this.f.password.errors || this.userForm.get('first_name').getError('required') || this.userForm.get('first_name').hasError('whitespace') || this.userForm.get('last_name').hasError('whitespace')) {
      this.addUser = true;
      // console.log(value['first_name'].errors, this.f.password.errors)
      // this.swalService.getErrorSwal("Please provide correct pattern");
      // console.log("Form is invalid[in else condition]", this.errorMessages);
      return;
    }

    if (this.validate()) {
      if (value['password'] != value['confirm_password'] && !this.selectedUserId) {
        this.passwordNotMatch = 'Password does not match.';
        this.addUser = true;
        return;
      }
      // if (!this.selectedUserId && (!value['password'] || !value['confirm_password'])) {
      //   return;
      // }
      this.disableSubmitButton();

      let http;
      if (this.selectedUserId > 0) {
        delete value.password;
        delete value.email;
        delete value.confirm_password;
        value['id'] = this.selectedUserId;
        http = this.userService.editNewUser(this.converToFormdata(value));
      } else {
        value['type_id'] = 36;
        value['status'] = 1;
        value['email'] = value.email.toLowerCase();
        http = this.userService.addNewUser(this.converToFormdata(value));
      }

      http.subscribe((data: any) => {
        if (data.status === HttpStatusCodeEnum.Success) {
          this.submitted = false;
          this.userForm.reset();
          this.closeForm.nativeElement.click();
          this.addUser = true;
          this.swalService.getSuccessSwal(data.message);
          this.getUsers(this.filtersUser);
        } else if (data.message === 'A user already exist with same email') {
          this.swalService.getErrorSwal(data.message);
          this.addUser = true;
          this.submitted = false;
          // this.submitted = false;
          // this.addUser = false;
          this.enableSubmitButton();
          this.submitted = true;
        } else {
          this.addUser = true;
          // this.userForm.reset();
          // this.closeForm.nativeElement.click();
          this.btnText = 'Save';
          this.submitted = false;
          this.swalService.getErrorSwal(data.message);
        }
      });

      // this.userForm.reset();
      // this.closeForm.nativeElement.click();
      // this.submitted = false;

    } else {
      this.addUser = true;
    }
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];

    if (this.userForm.get('first_name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.userForm.get('first_name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.userForm.get('first_name').hasError('isEmptyValue')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.userForm.get('last_name').hasError('required')) {
      this.errorMessages.push('Engine Number ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.userForm.get('last_name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Engine Number ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.userForm.get('last_name').hasError('isEmptyValue')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    // if (this.userForm.get('group').hasError('required')) {
    //   this.errorMessages.push('Group ' + ErrorMessage.REQUIRED);
    //   isValid = false;
    // }


    if (this.selectedUserId > 0) {
      if (this.userForm.get('first_name').hasError('required')) {
        this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
        isValid = false;
      }
      if (this.userForm.get('first_name').hasError('isAlphabets')) {
        this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
        isValid = false;
      }
      if (this.userForm.get('first_name').hasError('isEmptyValue')) {
        this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
        isValid = false;
      }

      if (this.userForm.get('last_name').hasError('required')) {
        this.errorMessages.push('Engine Number ' + ErrorMessage.REQUIRED);
        isValid = false;
      }
      if (this.userForm.get('last_name').hasError('isAlphabets')) {
        this.errorMessages.push('Engine Number ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
        isValid = false;
      }
      if (this.userForm.get('last_name').hasError('isEmptyValue')) {
        this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
        isValid = false;
      }
      // isValid = true;
    } else {
      if (this.userForm.get('email').hasError('required')) {
        this.errorMessages.push('Email ' + ErrorMessage.REQUIRED);
        isValid = false;
      }

      // if (this.userForm.get('email').hasError('pattern')) {
      //   this.errorMessages.push('Email ' + ErrorMessage.PATTERN);
      //   isValid = false;
      // }


      if (this.userForm.get('password').hasError('required')) {
        this.errorMessages.push('Password ' + ErrorMessage.REQUIRED);
        isValid = false;
      }

      if (this.userForm.get('confirm_password').hasError('required')) {
        this.errorMessages.push('Confirm Password ' + ErrorMessage.REQUIRED);
        isValid = false;
      }
    }
    return isValid;
  }

  clearForm() {
    this.submitted = false;
    this.selectedUser = null;
    this.selectedUserId = 0;
    this.selectedClient = null;
    this.selectedGroup = null;
    this.inactiveRecord = false;
    this.enableSubmitButton();
    this.userForm.reset();
    this.userForm.controls.confirm_password.setValidators(Validators.required);
    this.userForm.controls.confirm_password.updateValueAndValidity();

    this.userForm.controls.password.setValidators(Validators.compose([Validators.required, Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$')]));
    // this.userForm.controls.password.setValidators(Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$'))
    this.userForm.controls.password.updateValueAndValidity();
    this.formTitle = 'Add New User';
    this.userForm.controls['email'].enable();
    this.selectedStatus = null;
    this.userForm.controls['read_only'].setValue(false);
  }

  forgotPassword(row) {
    const params = {};
    params['email'] = row.email;
    this.userService.forgotPasword(params)
      .subscribe((data: any) => {
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getInfoSwal('Please check ' + row.email + ' for further assistance');
        } else {

        }
      })
  }

  getUsers(filters) {
    this.showIndeterminateProgress = true;

    // let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}&status=${filters.status}`;
    // console.log("params for getUserList()= ", params);

    this.userService.getUsers(params).subscribe((data: any) => {
      // console.log("getUsers()- ", data);
      this.showIndeterminateProgress = false;
      let allUsers = [];
      if (data.status === HttpStatusCodeEnum.Success) {
        this.users = data['data'].data;

        // for (let i = 0; i < this.users.length; i++) {
        //   if (this.users[i].id != this.loggedInUser.id) {
        //     allUsers.push(this.users[i]);
        //   }
        // }

        // this.users = allUsers;

        this.totalUserLength = data['data'].count;
        this.users.pagination = this.totalUserLength;
        // if (this.totalUserLength < 10) {
        //   this.userPaginator.firstPage();
        // }
      } else {
        console.log(data.message);
      }
      // console.log("this.users= ", this.users);
    });
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }

  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  clientSelected(event) {
    this.selectedClient = event;
  }

  getProgress(row) {
    return isNullOrUndefined(this.selectedUser) ? false : (this.selectedUser.id === row.id) && this.deleteLoader.visibility;
  }

  clear() {
    this.bulkUploadForm.reset();
    this.selectedFileName = '';
    this.notCSVExcel = false;
    this.selectedFile = null;
    this.disableButton = true;
    this.rejectedUsersList = [];
    this.bulkUploadApiResponse = null;
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.selectedFile = file;

      if (this.selectedFile.type.indexOf('.sheet') != -1 || this.selectedFile.type.indexOf('.ms-excel') != -1) { //|| this.selectedFile.type.indexOf('.ms-excel') != -1 //xlsx, xls
        this.notCSVExcel = false;
        this.disableButton = false;
      } else {
        this.notCSVExcel = true;
        this.disableButton = true;
      }
      this.selectedFileName = this.selectedFile.name;
    }
  }

  bulkUploadSubmit(formValue: Object) {
    const params: FormData = new FormData();
    if (!isNullOrUndefined(formValue['csvFiles'])) {
      params.append('source_file', this.selectedFile);
    }

    this.userService.uploadUserBulkUpload(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.bulkUploadApiResponse = data.data[0];

        if (data.data[0].rejected_users.length > 0) {
          this.rejectedUsersList = data.data[0].rejected_users;
          if (data.data[0].created_users.length >= 1) {
            this.getUsers(this.filtersUser);
          }
        } else {
          this.closeFormBulk.nativeElement.click();
          this.swalService.getSuccessSwal("File uploaded successfully");
          this.getUsers(this.filtersUser);
          this.clear();
          this.bulkUploadForm.reset();
          this.rejectedUsersList = [];
        }
      } else {
        this.swalService.getErrorSwal(data.message);
      }

    })
  }
  onClearSearch() {
    this.selection = new SelectionModel<any>(true, []);
    this.searchForm.reset();
    this.filtersUser.search = "";
    this.getUsers(this.filtersUser);
    // this.downloadableLink = environment.baseUrl + '/api/users/user_data_export_xle/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&login_user=' + this.loggedInUser.id;
    // this.downloadableLink1 = environment.baseUrl + '/api/users/user_data_export_pdf/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&login_user=' + this.loggedInUser.id;

    this.downloadableLink = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;
    this.downloadableLink1 = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;

  }
  onSearch($event) {
    this.searchText = $event.search;
    if (this.searchText.length > 0 || this.searchText.length === 0) {
      this.searchForm.get("search").setValue(this.searchText);
      this.filtersUser.search = this.searchForm.get('search').value;
      this.getUsers(this.filtersUser);
      this.downloadableLink = 'order=&order_by=&search=' + this.filtersUser.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;
      this.downloadableLink1 = 'order=&order_by=&search=' + this.filtersUser.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&login_user=' + this.loggedInUser.id;
    }
  }

  sortUserList(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getUsers(this.filtersUser);
  }
  onUserPagination(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getUsers(this.filtersUser);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.users.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.users.forEach(row => this.selection.select(row));
  }

  deleteThroughCheckbox() {
    this.selectedIDToDelete = [];
    if (this.selection.selected.length > 0) {
      for (let i = 0; i < this.selection.selected.length; i++) {
        if (this.selection.selected[i].id !== this.loggedInUser?.id && this.selection.selected[i].type !== 35) {
          this.selectedIDToDelete.push(this.selection.selected[i].id);
        }
      }
    }
    if (this.selectedIDToDelete && this.selectedIDToDelete.length === 0) {
      this.swalService.getWarningSwal('Please provide valid users to delete');
      return false;
    }
    let params = {
      id: this.selectedIDToDelete
    }
    this.userService.multiDeleteUsers(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.selection = new SelectionModel<any>(true, []);
        this.swalService.getSuccessSwal('Record(s) has been deleted successfully');
        this.getUsers(this.filtersUser);
      } else {
        this.swalService.getErrorSwal(data.message)
      }
    })
  }

  async showSwalForSelectedDelete() {
    const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this record(s)?');
    if (shouldDelete) {
      this.deleteThroughCheckbox()
    }
  }

  downloadRejectedUser() {
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
  pageReload() {
    window.location.reload()
  }
  downloadXLS(download) {
    this.userService.downloadXLS(download).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      var fileLink = document.createElement('a');
      fileLink.href = url
      fileLink.download = 'User Managemwnt'
      fileLink.click();
    })
  }

  downloadPDF(download1) {
    this.userService.downloadPDF(download1).subscribe((apiResponse: any) => {
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      var fileLink = document.createElement('a');
      fileLink.href = url
      fileLink.download = 'User Managemwnt'
      fileLink.click();
    })
  }

}
