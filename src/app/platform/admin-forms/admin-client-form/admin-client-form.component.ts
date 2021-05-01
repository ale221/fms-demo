import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { ClientService } from 'src/app/platform/shared/services/client.service';
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
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';


@Component({
  selector: 'app-admin-client-form',
  templateUrl: './admin-client-form.component.html',
  styleUrls: ['./admin-client-form.component.css']
})
export class AdminClientFormComponent implements OnInit {
  addUser:boolean=true;
  bulkUploadForm: FormGroup;
  csvFiles: AbstractControl;
  // Global Variables
  notCSVExcel = false;
  selectedFileName = '';
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

  clientForm: FormGroup;
  users;//: any = [];
  searchPlaceHolder = 'Search By Name...';
  btnLoading: boolean;
  btnText: string;
  passwordNotMatch = '';
  selectedClient;
  validEmail = false;
  submitted = false;
  formTitle = 'Add New Customer';

  temp: any = [];
  @ViewChild('closeForm') private closeForm;
  @ViewChild('editpop') private editpop;
  isAuthorized = false;

  loggedInUser;
  selectedUser;
  selectedUserId = 0;

  filters = {};

  appLoader = new AppLoader();
  userLoader = new AppLoader();
  UserRoleEnum = UserRoleEnum;
  deleteLoader = new AppLoader(false, false);
  theme;

  // Added by wahab
  searchForm: FormGroup;
  // filterUser = { limit: 10, offset: 0, order_by: '', order: '', fleet_id: '' };
  @ViewChild('userPaginator') userPaginator: MatPaginator;
  totalUserLength = 0;
  displayedUserList = ["name","status","party_code","modified_by","modified_datetime", "created_datetime", "actions"]
  EntityType = EntityType;
  EntityStatusEnum = EntityStatusEnum;
  showIndeterminateProgress: boolean;
  // filtersUser = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '' };
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
  breadcrumbInner=[];
  sidebarCheck;
  // statusList = [{ value: 1, name: "Active" }, { value: 2, name: "InActive" }];
  statusList = [{id:'',name: "All"},{ id: 1, name: "Active" }, { id: 2, name: "Inactive" }];

  keyUp = new Subject<KeyboardEvent>();
  searchText;
  downloadableLink: string;
  downloadableLink1:string;
  customerID;
  constructor(private clientService: ClientService,
    private authService: AuthService,
    private swalService: SwalService,
    private formService: FormService,
    private filtersService: FiltersService,
    private formBuilder: FormBuilder,
    private brandingService: BrandingService,
    private datatableService: DatatableService,
    private breadcrumbService:BreadcrumbsService,
    private drawerService: DrawerService) {

    this.selectedFile = new Object();
    this.theme = this.brandingService.styleObject();

    this.searchForm = this.formBuilder.group({
      search: [''],
      searchStatus: []
    })

    this.clientForm = this.formBuilder.group({   //USER FORM
      email: ['', [Validators.required, Validators.email, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")]],
      // TODO: not required in costomer form
      // first_name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      // last_name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      // group: [null, [Validators.required]],
      // password: [null, [Validators.required]],
      // confirm_password: [null, [Validators.required]],
      status: [1],
      name: [null, [Validators.required, CustomValidators.isAlphabetsAndSpace]],
      party_code: [null, [Validators.required,Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]],
      contact_number: [null, [Validators.required]],
      ntn_number: [null, [Validators.required, CustomValidators.isNumbers]],
      address: [null, [Validators.required]],
      description: ['', [Validators.required]]
    });

    this.bulkUploadForm = this.formBuilder.group({
      'csvFiles': [null, [Validators.required]],
    })
    this.csvFiles = this.bulkUploadForm.controls['csvFiles'];

  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
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
        console.log("this.breadcrumbInner",this.breadcrumbInner);
      }
    })

    console.log("this.breadcrumbInner",this.breadcrumbInner);
  if(this.breadcrumbInner[0]=='admin/config'){
    setTimeout(() => {
      this.editpop.nativeElement.click();
    }, 1000);
  }
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;

    this.getUsers(this.filtersUser);
    // this.getGroupList(this.filtersPermission);

    this.statusList.forEach((element: any) => {
      element.label = element.name;
      element.value = element.id;
    });

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
        this.filtersUser.search = this.searchForm.get('search').value;
        this.getUsers(this.filtersUser);
      }
    });
    this.downloadableLink = environment.baseUrl+'/hypernet/entity/xle/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = environment.baseUrl+'/hypernet/entity/pdf/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone+ '&customer_id=' + this.customerID;
    console.log("this.users= ", this.users);;
  }

  searchStatusDropDownChange(event) {
    console.log("event:: ", event.value);
    this.filtersUser.status = event.value;
    this.getUsers(this.filtersUser);
  }


  // getGroupList(filters) {
  //   let params = `type=${filters.type}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
  //   console.log("params for Group List= ", params);

  //   this.userService.getAllGroups(params).subscribe(
  //     (response: any) => {
  //       console.log("getAllGroups() [response.data] =", response.data['data']);

  //       if (!response.error) {
  //         // this.groups = response.data['data'];
  //         // console.log("this.groups= ", this.groups)

  //         // TOlD BY MUSHAHID BHAI
  //         // this.mapArrayGroups = response.data['data'].map(
  //         //   item => ({ id: item['id'], label: item['name'] })
  //         // )

  //         //Method2
  //         this.mapArrayGroups = response.data['data'];
  //         this.mapArrayGroups.forEach(element => {
  //           element.label = element.name;
  //           element.value = element.id;
  //         });

  //         console.log("mapArrayGroups== ", this.mapArrayGroups);

  //       } else {
  //         this.swalService.getErrorSwal(response.message);
  //       }
  //     }
  //   );
  // }

  groupDropDownChange(event) {
    console.log("event= ", event);

    this.selectedGroupDrop = event.value;
    this.clientForm.get('group').setValue(this.selectedGroupDrop);
  }

  statusDropDownChange(event) {
    console.log("this.ecevt= ", event);

    this.selectedStatusDrop = event.value;
    this.clientForm.get('status').setValue(this.selectedStatusDrop)
  }

  async showSwal(user) {
    this.selectedUser = user;
    console.log('user', user);

    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
    const shouldDelete = await this.swalService.getDeleteSwal(user, 'What do you want to do with ' + user.name + ' ?');
    console.log('shouldDelete', shouldDelete);
    if (shouldDelete) {
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteUser(user.id, shouldDelete, 'Record has been' + message +
        'successfully');
    }
  }


  get formAltaControls(): any {
    return this.clientForm['controls'];
  }

  // Delete bin
  deleteUser(userId, actionType, message?) {
    const params = {};
    params['user_id'] = (userId);
    params['status'] = actionType;

    console.log('params', params);
    this.clientService.deleteClient(params)
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(message);
          this.getUsers(this.filtersUser);
        } else {
          console.log(data.message);
          this.swalService.getErrorSwal(data.message)
        }
      })
  }

  openEditModal(user) {
    console.log("user=", user);
    this.selectedUserId = user.id;
    this.formTitle = 'Update Customer';
    this.btnText = 'Update';
    this.clientForm.get('status').setValue(user.status === 1 ? true : false);
    console.log("user.group.id=== ", user.id)
    // console.log("this.mapArrayGroups== ", this.mapArrayGroups);

    // let setGroup = {};
    // for (let i = 0; i < this.mapArrayGroups.length; i++) {
    //   if (user.group.id == this.mapArrayGroups[i].id) {
    //     console.log("this.mapArrayGroups[i]== ", this.mapArrayGroups[i]);
    //     setGroup = this.mapArrayGroups[i].id;
    //     //this.selectedGroup = this.mapArrayGroups[i];
    //     this.selectedGroup = { value: this.mapArrayGroups[i].id, label: this.mapArrayGroups[i].name };
    //   }
    // }
    // console.log("setGroup = ", setGroup);

    // console.log("this.statusList== ", this.statusList);
    // for (let i = 0; i < this.statusList.length; i++) {
    //   if (user.status == this.statusList[i].id) {
    //     console.log("this.statusList[i]== ", this.statusList[i]);
    //     user.status = this.statusList[i].id;
    //     // this.clientForm.get['status'] = this.statusList[i]
    //     this.clientForm.controls.status.setValue(this.statusList[i]);
    //     // this.selectedStatus = this.statusList[i];
    //     this.selectedStatus = { value: this.statusList[i].id, label: this.statusList[i].name, id: this.statusList[i].id, name: this.statusList[i].name }
    //   }
    // }

    console.log("selectedGroup=== ", this.selectedGroup);
    console.log("selectedStatus=== ", this.selectedStatus);
      if(user.description === 'null' || user.description === null)
      {
        user.description='';
      }
    this.clientForm.patchValue({
      name: user.name,
      party_code: user.party_code,
      email: user.email,
      contact_number: user.contact_number,//setGroup, ali = selectedGroup
      ntn_number: user.ntn_number,
      address: user.address,
      description: user.description
    })

    // this.clientForm.controls['email'].disable();

    // this.clientForm.controls.confirm_password.setValidators(null);
    // this.clientForm.controls.confirm_password.updateValueAndValidity();

    // this.clientForm.controls.password.setValidators(null);
    // this.clientForm.controls.password.updateValueAndValidity();
    console.log("this.clientForm.value= ", this.clientForm.value);
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
    // this.validEmail = true;
    // return true;
    this.validEmail = re.test(String(email).toLowerCase());
    return re.test(String(email).toLowerCase());
  }

  onSubmit(value) {
    console.log("coming value", value);
    this.addUser=false;

    this.submitted = true;
    if(this.clientForm.invalid) {
      this.addUser=true;
      return;
    }
    delete value.password;
    // delete value.email;
    delete value.confirm_password;
    delete value.first_name;
    delete value.last_name;
    delete value.group;
    if (!isNullOrUndefined(this.selectedClient)) {
      value['associated_client'] = this.selectedClient;
    }

    if (this.validate()) {
      console.log("Form is valid");
      this.disableSubmitButton();
      let http;
      if (this.selectedUserId > 0) {
        delete value.password;
        // delete value.email;
        delete value.confirm_password;
        delete value.first_name;
        delete value.last_name;
        value['id'] = this.selectedUserId;
        // data.status = data.status === true ? 1 : 2;
        value['status']= value.status === true ? 1 : 2;
        console.log("formValue (before convertToFormData)--", value);
        http = this.clientService.patchClient(this.converToFormdata(value));
      } else {
        value['type_id'] = 36;
        value['status'] = 1;
        console.log("formValue (before convertToFormData)=", value);
        http = this.clientService.postClient(this.converToFormdata(value));
      }

      http.subscribe((data: any) => {
        console.log("on-", data);

        if (data.status === HttpStatusCodeEnum.Success) {
          this.addUser=true;
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getUsers(this.filtersUser);
          this.submitted = false;
          this.clientForm.reset();
        } else {
          console.log(data.message);
          this.addUser=true;
         this.enableSubmitButton();
          this.swalService.getErrorSwal(data.message);
        }
      });

    } else {
      this.addUser=true;
      console.log("Form is invalid[in else condition]", this.errorMessages);
    }
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];

    if (this.clientForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.clientForm.get('name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.clientForm.get('party_code').hasError('required')) {
      this.errorMessages.push('party_code ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.clientForm.get('party_code').hasError('pattern')) {
      this.errorMessages.push('party_code ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.clientForm.get('email').hasError('email')) {
      this.errorMessages.push('email ' + ErrorMessage.REQUIRED);
      isValid = false;
      }
    if (this.clientForm.get('contact_number').hasError('required')) {
      this.errorMessages.push('contact_number ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.clientForm.get('ntn_number').hasError('required')) {
      this.errorMessages.push('ntn_number ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.clientForm.get('ntn_number').hasError('isNumbers')) {
      this.errorMessages.push('ntn_number ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.clientForm.get('address').hasError('required')) {
      this.errorMessages.push('address ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.selectedUserId > 0) {
      isValid = true;
    } else {
      // if (this.clientForm.get('email').hasError('required')) {
      //   this.errorMessages.push('Email ' + ErrorMessage.REQUIRED);
      //   isValid = false;
      // }

      // if (this.clientForm.get('email').hasError('pattern')) {
      //   this.errorMessages.push('Email ' + ErrorMessage.PATTERN);
      //   isValid = false;
      // }


      // if (this.clientForm.get('password').hasError('required')) {
      //   this.errorMessages.push('Password ' + ErrorMessage.REQUIRED);
      //   isValid = false;
      // }

      // if (this.clientForm.get('confirm_password').hasError('required')) {
      //   this.errorMessages.push('Confirm Password ' + ErrorMessage.REQUIRED);
      //   isValid = false;
      // }
    }

    return isValid;
  }

  clearForm() {
    this.selectedUser = null;
    this.selectedUserId = 0;
    this.selectedClient = null;
    this.selectedGroup = null;
    this.inactiveRecord = false;
    this.enableSubmitButton();
    this.clientForm.reset();
    this.formTitle = 'Add New Customer';
    this.clientForm.controls['email'].enable();
    this.selectedStatus = null;
  }

  // forgotPassword(row) {
  //   const params = {};
  //   params['email'] = row.email;
  //   this.clientService.forgotPasword(params)
  //     .subscribe((data: any) => {
  //       if (data.status === HttpStatusCodeEnum.Success) {
  //         this.swalService.getInfoSwal('Please check ' + row.email + ' for further assistance');
  //       } else {
  //         console.log(data.message)
  //       }
  //     })
  // }

  getUsers(filters) {
    this.showIndeterminateProgress = true;

    // let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}&status=${filters.status}`;
    console.log("params for getUserList()= ", params);
    // if(filters.search != null || filters.search != undefined || filters.search != '')
    // {
    //   this.userPaginator.firstPage();
    // }

    this.clientService.getClient(params).subscribe((data: any) => {

      this.showIndeterminateProgress = false;

      if (data.status === HttpStatusCodeEnum.Success) {


        this.users = data['data'].data;
        console.log("getUsers()- ", data['data'],data['data'].count);
        this.totalUserLength = data['data'].count;
        this.users.pagination = this.totalUserLength;
        if(this.totalUserLength < 10)
        {
          this.userPaginator.firstPage();
        }
        console.log(this.users);
      } else {
        console.log(data.message);
      }
      console.log("this.users= ", this.users);
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
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      console.log("file= ", file);
      this.selectedFile = file;

      if (this.selectedFile.type.indexOf('.sheet') != -1 || this.selectedFile.type.indexOf('.ms-excel') != -1) {
        console.log("inside IF condition")
        this.notCSVExcel = false;
      } else {
        console.log("inside ELSE condition")
        this.notCSVExcel = true;
      }

      this.selectedFileName = this.selectedFile.name;
    }
  }

  bulkUploadSubmit(formValue: Object) {
    console.log("inside submit function(formValue)= ", formValue);
    const params: FormData = new FormData();

    if (!isNullOrUndefined(formValue['csvFiles'])) {
      params.append('file', this.selectedFile);
    }

    // OLD CODE BY WAHAB
    // this.userService.uploadUserBulkUpload(params).subscribe((res: any) => {
    //   console.log("uploadUserBulkUpload res ", res);
    //   if (res.status == 200) {
    //     console.log("inside if condition");
    //     this.swalService.getSuccessSwal('User list has been uploaded successfully');

    //     this.clear();
    //   } else {
    //     console.log("inside else condition");
    //     this.swalService.getErrorSwal(res.message);

    //   }
    // }, err => {
    //   this.swalService.getErrorSwal('Invalid file structure');
    //   console.log("unable to upload user bulk upload");
    // })


    // NEW CODE FOR MODAL BY WAHAB
    // this.userService.uploadUserBulkUpload(params).subscribe((data: any) => {
    //   console.log("uploadBulk() response= ", data);

    //   if (data.status === HttpStatusCodeEnum.Success) {
    //     this.closeForm.nativeElement.click();
    //     this.swalService.getSuccessSwal(data.message);
    //     this.getUsers(this.filtersUser);
    //     this.clear();
    //     this.bulkUploadForm.reset();
    //   } else {
    //     console.log("data.message== ", data.message)
    //     this.swalService.getErrorSwal(data.message['error_message']);
    //   }

    // })
  }

  onSearch($event) {
    // this.keyUp.pipe(
    //   map(event => event.target['value']),
    //   debounceTime(500),
    //   distinctUntilChanged(),
    //   mergeMap(search => of(search).pipe(
    //     delay(500),
    //   )),
    // ).subscribe(newValue => {

      this.searchText = $event.search;
      if (this.searchText.length > 0 || this.searchText.length === 0) {
        this.searchForm.get("search").setValue(this.searchText);
        console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
        this.filtersUser.search = this.searchForm.get('search').value;
        this.getUsers(this.filtersUser);

      }
      this.downloadableLink = environment.baseUrl+'/hypernet/entity/xle/?search='+this.filtersUser.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
      this.downloadableLink1 = environment.baseUrl+'/hypernet/entity/pdf/?search='+this.filtersUser.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    console.log("this.users= ", this.users);;

  }
  onClearSearch() {
    this.searchForm.reset();
    // this.searchForm.get("search").setValue(this.searchText);
    //     console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
        this.filtersUser.search = "";
        this.getUsers(this.filtersUser);
        this.downloadableLink = environment.baseUrl+'/hypernet/entity/xle/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
        this.downloadableLink1 = environment.baseUrl+'/hypernet/entity/pdf/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
  }


  sortUserList(event) {
    console.log(event);
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    this.getUsers(this.filtersUser);
  }
  onUserPagination(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    this.getUsers(this.filtersUser);
  }
  pageReload(){
    console.log("coming");
    window.location.reload()
  }
}
