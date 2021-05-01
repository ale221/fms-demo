import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { isNullOrUndefined } from 'util';
import { BrandingService } from '../../shared/services/branding.service';
import { AppLoader } from '../../data/model/app-loader';
import { UserRoleEnum } from '../../enum/user-role.enum';
import { AuthService } from 'src/app/core/services/auth.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { DatatableService } from '../../services/datatable.service';
import { EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { UserService } from 'src/app/core/services/user.service';
import { HttpController } from 'src/app/core/services/loading-controller';
import { ApiResponseNew, LoginApiResponse, ApiResponse } from 'src/app/core/model/api.response';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { iolModules, hypernymModules } from 'src/app/core/model/module';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-admin-config-form',
  templateUrl: './admin-config-form.component.html',
  styleUrls: ['./admin-config-form.component.css']
})
export class AdminConfigFormComponent implements OnInit {

  roles;
  users: any = [];
  searchPlaceHolder = 'Search By Name...';
  btnLoading: boolean;
  btnText: string;
  selectedClient;
  selectedRole;
  formTitle = 'Add New Permission';
  temp: any = [];
  @ViewChild('closeForm') private closeForm;

  loggedInUser;
  selectedUser;
  selectedUserId = 0;

  filters = {};

  rolesCount = {
    admin: 0,
    manager: 0,
    user: 0,
    finance: 0,
    sales: 0,
    client: 0,
    technician: 0,
  };

  appLoader = new AppLoader();
  userLoader = new AppLoader();
  UserRoleEnum = UserRoleEnum;
  deleteLoader = new AppLoader(false, false);
  theme;
  useCaseId;
  isAuthorized = false;
  packageType: any;
  sidebarCheck;
  

  // defaultLoader = {
  //   visibility: true
  // }

  constructor(private userService: UserService,
    private authService: AuthService,
    private getUsecase: GetUsecaseService,
    private brandingService: BrandingService,
    public breadcrumbsService : BreadcrumbsService,
    public drawerService : DrawerService) {

    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.loggedInUser = this.authService.getUser();
    this.packageType = PackageType;

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
    // this.defaultLoader = {
    //   visibility: false
    // }

    this.roles = [
      { label: 'Admin', value: UserRoleEnum.Admin },
      { label: 'Manager', value: UserRoleEnum.Manager },
      { label: 'User', value: UserRoleEnum.User },
      { label: 'Finance', value: UserRoleEnum.FinanceManager },
      { label: 'Sales Manager', value: UserRoleEnum.Sales },
      { label: 'Technician', value: UserRoleEnum.WorkshopTechnician },
    ];

    // this.getUsersCount();
  }

  // getUsersCount() {
  //   this.rolesCount = {
  //     admin: 0,
  //     manager: 0,
  //     user: 0,
  //     finance: 0,
  //     sales: 0,
  //     client: 0,
  //     technician: 0,
  //   };
  //   this.userService.getUsersCount().subscribe(new class extends HttpController<LoginApiResponse<any>> {
  //     onComplete(): void {
  //       this.context.enableSearch = false;
  //     }

  //     onError(errorMessage: string, err: any) {
  //       this.context.enableSearch = false;
  //       console.log(errorMessage);
  //     }

  //     onNext(apiResponse: LoginApiResponse<any>): void {
  //       this.context.defaultLoader = {
  //         visibility: false
  //       }
  //       // console.log('count', apiResponse.response);
  //       if (apiResponse.status === HttpStatusCodeEnum.Success) {
  //         this.context.rolesCount.admin = apiResponse.response[UserRoleEnum.Admin] || 0;
  //         this.context.rolesCount.manager = apiResponse.response[UserRoleEnum.Manager] || 0;
  //         this.context.rolesCount.user = apiResponse.response[UserRoleEnum.User] || 0;
  //         this.context.rolesCount.finance = apiResponse.response[UserRoleEnum.FinanceManager] || 0;
  //         this.context.rolesCount.sales = apiResponse.response[UserRoleEnum.Sales] || 0;
  //         this.context.rolesCount.technician = apiResponse.response[UserRoleEnum.WorkshopTechnician] || 0;
  //       }
  //     }
  //   }(this)
  //   );

  // }
  pageReload(){
    console.log("coming");
    window.location.reload()
  }
  navItemClicked(){
    console.log("cominggggg on nav");
    let route=[];
    route[0]="admin/config";
    route[1]="Admin";
    this.breadcrumbsService.setValue(route);
  }
}

