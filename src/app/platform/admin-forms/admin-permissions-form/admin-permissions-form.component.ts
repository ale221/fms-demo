import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { SwalService } from 'src/app/core/services/swal.service';
import { isNullOrUndefined } from 'util';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { EntityService } from '../../services/entity.service';
import { FormService } from '../../services/FormService';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { DrawerService } from 'src/app/core/services/drawer.service';

declare var $: any;

@Component({
  selector: 'app-admin-permissions-form',
  templateUrl: './admin-permissions-form.component.html',
  styleUrls: ['./admin-permissions-form.component.css']
})
export class AdminPermissionsFormComponent implements OnInit {
  displayedGroupColums = ['name', 'description', 'users', 'action'];
  permissionList: any;
  permissionListLength = 0;
  filters = { limit: 10, offset: 0, order_by: '', order: '', search_key: '' };
  showIndeterminateProgress = true;
  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  permissionForm: FormGroup;
  groupForm: FormGroup;
  searchForm: FormGroup;
  selectedEmails;
  selectedGroup;
  selectedGroup_new:any={
    id:0,
    name:"",
    description:""
  };
  searchText;
  submitted = false;
  submittedGroup = false;
  @ViewChild('closeForm') public closeForm;
  @ViewChild('closeFormGroup') public closeFormGroup;
  emailList = [];

  tab = 1;
  keepSorted = true;
  key: string;
  display: any;
  filter = false;
  source: Array<any>;
  confirmed: Array<any>;
  userAdd = '';
  disabled = false;
  btnloading: boolean = false;
  userGroup;
  userGroupList;
  selectedDesc;
  isAuthorized = false;
  roleaccessedit : any;
  sourceLeft = true;
  sourceStations: Array<any>;
  confirmedStations: Array<any>;
  stations = [];
  sidebarCheck;

  groupDriverList = [];
  selectedDriver = [];

  constructor(private entityService: EntityService,
    private formBuilder: FormBuilder,
    private swalService: SwalService,
    private authService: AuthService,
    private formService: FormService,
    public translate: TranslateService,
    private drawerService : DrawerService) { };

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    this.drawerService.getValue().subscribe(res=>{
      this.sidebarCheck=res;
      console.log("ressssssssssssss1",res);
    console.log("ressssssssssssss2",this.sidebarCheck);
  })
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.permissionForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      email: ['', [Validators.required]],
      group_id: ['', [Validators.required]]
    });

    this.groupForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
    this.searchForm = this.formBuilder.group({
      search: ['']
    })

    this.initListBox();
    this.getGroupData();
    // this.permissionForm.get('emails').setValue(this.emailList);
    // this.permissionForm.get('group').setValue(this.userGroup);

    this.getGroupListingType(this.filters);

    this.getGroupsForDropdown();
    this.getEmailsForDropdown();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translate.use(event.lang);
    });

    this.downloadableLink = environment.baseUrl + '/api/users/rolexle/?search=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = environment.baseUrl + '/api/users/pdfrole/?search=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;

  }


  getEmailsForDropdown() {
    this.formService.getUsersEmailsDD({}).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.emailList = [];
        if (apiResponse['data'] && apiResponse['data'] && apiResponse['data'].length > 0) {
          this.emailList = apiResponse['data'].map(
            item => ({ id: item['id'], name: item['email'] })
          )
        }
      }
    })
  }

  getGroupsForDropdown() {
    this.formService.getGroup('').subscribe(apiResponse => {
      this.showIndeterminateProgress = false;
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.userGroupList = []
        this.userGroup = []
        if (apiResponse['data'].data && apiResponse['data'].data.length > 0) {
          this.userGroupList = [...apiResponse['data'].data];
          this.userGroup = apiResponse['data'].data.map(
            item => new PrimengDropdownItem(item['id'], item['name'])
          )
        }
      }
    })
  }

  getGroupListingType(filters) {
    this.showIndeterminateProgress = true;
    if (filters.search_key === undefined || filters.search_key === null) {
      filters.search = '';
    }
    let params = `?type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search_key}`;
    this.formService.getGroup(params).subscribe(apiResponse => {
      this.showIndeterminateProgress = false;
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.permissionList = apiResponse['data'].data;
        this.permissionListLength = apiResponse['data'].count;
        this.permissionList.sort = this.sort;
        this.permissionList.paginator = this.paginator;
        this.groupForm.reset();
      }
    })
  }

  changeGroup(e) {
    this.selectedDesc = this.userGroupList.filter(item => {
      return item.id === e;
    });
    this.selectedDesc = this.selectedDesc[0];
  }

  getGroupData() {
    const user = this.authService.getUser();

    this.formService.getGroupData().subscribe(apiResponse => {
      this.showIndeterminateProgress = false;
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        if (apiResponse['data'] && apiResponse['data'].length > 0) {

          apiResponse['data'].forEach(element => {
            if (element.child && element.child.length > 0) {
              element.child.forEach(child => {
                if (child.id && user['package'][0].package_id === PackageType.standard) {
                  child.key = child.id;
                  child.station = child.name;
                  this.stations.push(child);
                }
                if (child.id && user['package'][0].package_id === PackageType.png && child.plug_and_go) {
                  child.key = child.id;
                  child.station = child.name;
                  if (child.station != "Card Setting" && child.station != "Graph Setting") {
                    this.stations.push(child);
                  }
                }
              });
            }
          });
        }
      }
    })
  }

  addNewPermission() {
    this.selectedDesc = [];
    this.permissionForm.reset();
    this.submitted = false;
    this.getGroupsForDropdown();
  }

  addNewGroup() {
    // this.groupForm.
    this.groupForm.reset();
    this.submittedGroup = false;
    this.initListBox();
  }

  getPermissions(filters) {

  }

  openEditModal(row) {
    console.log("role access>>>>>>>>>>=", row);
    this.selectedGroup_new.id=row.id;
    this.roleaccessedit = row;
    this.selectedGroup_new.name=row.name;
    this.selectedGroup_new.description=row.description;

    let drivers_group = [];

    if (row.accociated_email && row.accociated_email.length > 0) {
      row.accociated_email.forEach(element => {
        drivers_group.push(element);
      });
    }


    if (row.unaccociated_email && row.unaccociated_email.length > 0) {
      row.unaccociated_email.forEach(element => {
        drivers_group.push(element);
      });
    }

    this.groupDriverList = drivers_group.map(
      item => new DropDownItem(item, item)
    );

    // this.selectDriver = group.associated_group_driver;

    this.selectedDriver = [];
    for (let i = 0; i < row.accociated_email.length; i++) {
      this.selectedDriver.push(new DropDownItem(row.accociated_email[i], row.accociated_email[i]));
    }


  }
  UpdateRoleaccessGroup(id){
    this.submittedGroup = true;

    if (!this.selectedGroup_new.name || !this.selectedGroup_new.description || this.selectedDriver.length === 0) {
      return false;
    }

    if (!this.selectedGroup_new.name) {
      return false;
    }
    if (!this.selectedGroup_new.description) {
      return false;
    }
    if (this.selectedDriver.length === 0) {
      return false;
    }

    let emails = [];
    if (this.selectedDriver && this.selectedDriver.length > 0) {
      this.selectedDriver.forEach(element=> {
        emails.push(element.id)
      })
    }

    this.selectedGroup_new.emails = emails;

    this.formService.UpdateRoleAccessGroup(this.selectedGroup_new)
      .subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.submittedGroup = false;
          this.swalService.getSuccessSwal('Role Updated successfully');
          this.getPermissions(this.filters);
          this.getGroupListingType(this.filters);
          this.getEmailsForDropdown();
          this.permissionForm.reset();
          this.groupForm.reset();
          this.closeForm.nativeElement.click();
          $('#closeDialog').click();
        } else {
          this.swalService.getErrorSwal('Error occured while creating role');
          this.submittedGroup = false;
        }
      })

  }

  openViewModal(row) {
    this.selectedGroup = row;
    console.log(this.selectedGroup)
    const menuitems = (row.menuitems);
    if (menuitems && menuitems.length > 0) {
      let selectedMenu = [];
      menuitems.forEach(element => {
        if (element.child && element.child.length > 0) {
          element.child.forEach(child => {
            const childPush = { id: child.id, key: child.id, name: child.name, station: child.name };
            selectedMenu.push(childPush);
          });
        }
      });
      this.confirmed = selectedMenu;
    }
  }

  deleteGroup(id) {

  }

  onPaginatePermission(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getGroupListingType(this.filters);
  }

  sortDriverGroup(event) { }

  onSubmit(formData) {
    this.submitted = true;
    if (!this.permissionForm.get('email').valid || !this.permissionForm.get('group_id').valid) {
      return;
    }

    if (formData) {
      let emails = [];
      if (formData.email && formData.email.length > 0) {
        formData.email.forEach(element => {
          emails.push(element.name);
        });
      }
      formData.email = emails;
    }

    const id = this.permissionForm.getRawValue().id;
    if (isNullOrUndefined(id)) {
      this.postPermission(formData);
    } else {
      formData.id = id;
      this.patchPermission(formData);
    }
  }

  postPermission(data) {
    this.formService.createPermission(data)
      .subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal('Role created successfully');
          this.getPermissions(this.filters);
          this.getGroupListingType(this.filters);
          this.getEmailsForDropdown();
          this.permissionForm.reset();
          this.groupForm.reset();
          this.closeForm.nativeElement.click();
        } else {
          this.swalService.getErrorSwal('Error occured while creating role');
        }
      })
  }

  patchPermission(data) {
    // this.formService.updatePermissions(data)
    //   .subscribe(apiResponse => {
    //     if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
    //       this.swalService.getSuccessSwal('Role updated successfully');
    //       this.getPermissions(this.filters);
    //       this.closeForm.nativeElement.click();
    //     }
    //   })
  }

  // Swal dialog for Delete/inactive
  async showSwal(permission) {
    const shouldDelete = await this.swalService.getDeleteSwal(permission, 'What do you want to do with this record?');
    if (shouldDelete) {
      this.formService.deletePermissions(permission).subscribe((data: any) => {
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal("Group deleted successfully");
          this.getGroupListingType(this.filters);
          this.getEmailsForDropdown();
          this.getGroupsForDropdown();
        } else {
          this.swalService.getErrorSwal(data.message)
        }
      });
    }
  }

  stationLabel(item: any) {
    return item.station;
  }

  useStations() {
    this.key = 'key';
    this.display = this.stationLabel;
    this.keepSorted = true;
    this.source = this.sourceStations;
    this.confirmed = this.confirmedStations;
  }

  initListBox() {
    this.sourceStations = JSON.parse(JSON.stringify(this.stations));
    this.confirmedStations = new Array<any>();
    // this.confirmedStations.push(this.stations[31]);
    this.useStations();
  }

  onSubmitGroup(formData) {
    this.submittedGroup = true;

    if (!this.groupForm.get('name').valid || !this.groupForm.get('description').valid || this.confirmed.length === 0) {
      // this.btnloading = true;
      return;
    }
    let menuitems = [];
    if (this.confirmed && this.confirmed.length > 0) {
      this.confirmed.forEach(items => {
        menuitems.push(items.key);
      })
    }

    formData.menuitems = menuitems;
    // if (menuitems.length > 0) {
    //   this.btnloading = false;
    // } else {
    //   this.btnloading = true;
    // }

    console.log("formData before api call= ", formData)

    this.formService.createGroup(formData).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal('Group created successfully');
        this.btnloading = false;
        this.closeFormGroup.nativeElement.click();
        this.getGroupListingType(this.filters);
        this.getGroupsForDropdown();
      } else {
        this.swalService.getErrorSwal('Error occured while creating role');
      }
    })
  }

  onSearch($event) {
    this.searchText = $event.search;
    console.log("this.searchText", this.searchText);

    if (this.searchText?.length > 0 || this.searchText?.length === 0) {
      this.searchForm.get("search").setValue(this.searchText);
      console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);

      this.filters.search_key = this.searchForm.get('search').value;
      this.getGroupListingType(this.filters);

      // this.downloadableLink = environment.baseUrl + '/hypernet/entity/xle/?search=' + this.filters.search_key + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
      // this.downloadableLink1 = environment.baseUrl + '/hypernet/entity/pdf/?search=' + this.filters.search_key + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;


      this.downloadableLink = environment.baseUrl + '/api/users/rolexle/?search=' + this.filters.search_key + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
      this.downloadableLink1 = environment.baseUrl + '/api/users/pdfrole/?search=' + this.filters.search_key + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;

    }
  }

  onClearSearch() {
    this.searchForm.get("search").reset();
    // this.searchForm.get("search").setValue(this.searchText);
    //     console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
    this.filters.search_key = "";
    this.getGroupListingType(this.filters);

    this.downloadableLink = environment.baseUrl + '/api/users/rolexle/?search=' + this.filters.search_key + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = environment.baseUrl + '/api/users/pdfrole/?search=' + this.filters.search_key + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

  }
  sortRoles(event) {
    console.log("event= ", event, event.active)
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getGroupListingType(this.filters);
  }
  pageReload(){
    console.log("coming");
    window.location.reload()
  }

}
