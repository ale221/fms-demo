import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FormService } from '../../services/FormService';
import { UserRoleEnum } from '../../enum/user-role.enum';
import { User } from '../../../core/model/user';
import { HttpController } from '../../../core/services/loading-controller';
import { ApiResponse, ApiResponseNew, LoginApiResponse, TestApiResponse } from '../../../core/model/api.response';
import { AppLoader } from '../../data/model/app-loader';
import { hypernymModules, iolModules } from '../../../core/model/module';
import { EntityType, EntityStatusEnum, SkipSizeToMaterialEnum } from 'src/app/core/enum/entity-type.enum';
import { DatatableService } from '../../services/datatable.service';
import { isNullOrUndefined } from 'util';
import { SwalService } from '../../../core/services/swal.service';
import { HttpStatusCodeEnum } from '../../../core/HttpStatusCodeEnum';
// import { BrandingService } from '../../../shared/services/branding.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { BrandingService } from '../../shared/services/branding.service';

import { DropDownItem } from '../../data/model/dropdown-item';
import { CustomValidators } from 'src/app/core/custom.validator';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { FileUpload } from 'primeng';
import { AppLocation } from '../../data/model/location';
import { GotoPageService } from '../../services/goto-page.service';
import { BinService } from '../../services/bin-service.service';
import { GetIconsService } from '../../services/get-icons.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';
import { ErrorMessage } from '../../error-message';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
declare var $: any;
declare var google: any;


@Component({
  selector: 'app-admin-contract-form',
  templateUrl: './admin-contract-form.component.html',
  styleUrls: ['./admin-contract-form.component.css'],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ]
})
export class AdminContractFormComponent implements OnInit, OnDestroy {

  searchForm: FormGroup;
  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  SkipSizeToMaterialEnum = SkipSizeToMaterialEnum;
  contractForm: FormGroup;
  itemListBins = [];
  binsList = [];
  selected_bins = [];
  area_list = [];
  location_list = [];
  client_list = [];
  skip_size_list = [];
  contract_type_list = [];
  selected_client: any;
  selected_status: any;
  selected_skip_size: any;
  selected_entity_sub_type: any;
  minDate = new Date();
  theme;
  submitted = false;
  selected_status_d;

  param_areas = [];
  param_locations = [];
  param_clients = [];
  isNullOrUndefined = isNullOrUndefined;
  @ViewChild('closeForm') private closeForm;
  @ViewChild('cImage') private image1;
  @ViewChild('closeP') private closeP;
  @ViewChild('showP') private showP;
  @ViewChild('fileuploader') private uploader: FileUpload;
  @ViewChild('paginator') paginator: MatPaginator;
  locations: AppLocation[] = [];
  clients_loader_flag: boolean;
  areas_loader_flag: boolean;
  locations_loader_flag: boolean;
  inputValue = '';
  uploadedPercentage = 0;
  fileUploadStatus = false;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;

  @ViewChild('myInput')
  myInputVariable: any;
  @ViewChild('img')
  image: any;
  btnLoading: boolean;
  btnText: string;
  formTitle = 'Add Contract';
  status = { total: 0, active: 0, inactive: 0, renewed: 0, expiring: 0, expired: 0, deactivated: 0, newcontracts: 0, expiring_in_3: 0 };

  contractStartDate: Date;
  contractEndDate: Date;
  hashMap: any = {};
  deleteAllButton: boolean;

  isAuthorized = false;

  displayedColumns = ['name', 'client_name', 'status', 'date_commissioned', 'date_of_joining', 'created_datetime', 'actions'];
  filters = { limit: 10, offset: 0, order_by: '', order: '', type_id: 42, search: '' };
  statusList = [{ id: 1, name: "Active" }, { id: 2, name: "Inactive" }];
  fileUploadProgressBar: boolean;
  appLoader = new AppLoader();
  contracts;
  errorMessages = [];
  selectedRows: any[] = [];
  temp = [];
  EntityStatusEnum = EntityStatusEnum;
  EntityType = EntityType;
  csvCols = [
    { field: 'name', header: 'Name' },
    { field: 'customer_name', header: 'Customer' },
    { field: 'party_code', header: 'Party Code' },
    { field: 'skip_rate', header: 'Skip Rate' },
    { field: 'date_commissioned', header: 'Start Date' },
    { field: 'date_of_joining', header: 'End Date' },
    { field: 'assigned_area_name', header: 'Area' },

    { field: 'assigned_location_name', header: 'Location' },
    { field: 'client_name', header: 'Customer' },
  ];
  csvRows = [];

  source_latlong = null;
  @ViewChild('binMap') binMap: GoogleMapComponent;
  @ViewChild('editpop') private editpop;
  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;
  breadcrumbInner = [];

  totalContractsLength = 0;
  filtersContracts = { type: 2, limit: 5, offset: 0, order_by: '', order: '', search: '' };
  expandedElement: any;
  sidebarCheck;

  constructor(public formBuilder: FormBuilder,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private swalService: SwalService,
    private binService: BinService,
    private datatableService: DatatableService,
    private brandingService: BrandingService,
    public formService: FormService,
    public getIconsService: GetIconsService,
    private breadcrumbService: BreadcrumbsService,
    private drawerService: DrawerService) {
    this.contractForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      contract_name: [null, [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      // selected_contract_type: [null, [Validators.required]],
      // selected_entity_sub_type: [null],
      // selected_area: [null, [Validators.required]],
      // selected_location: [null, [Validators.required]],
      selected_client: [null, [Validators.required]],
      selected_status: [null, [Validators.required]],
      // unit_pricing: [null, [Validators.min(0), Validators.max(10000), Validators.required]],
      // selected_skip_size: [null, [Validators.required]],
      date_of_joining: [null, [Validators.required]],
      date_commissioned: [null, [Validators.required]],
      description: [null, [Validators.required]],
      // photo: [null],
      // photo_method: [null],
      files: [null],
      source_latlong: [null]
    });
    this.searchForm = this.formBuilder.group({
      search: ['']
    })

    this.theme = this.brandingService.styleObject();
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
      }
    })

    if (this.breadcrumbInner[0] == 'admin/config') {
      setTimeout(() => {
        this.editpop.nativeElement.click();
      }, 1000);
    }
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.areas_loader_flag = false;
    this.locations_loader_flag = false;
    this.clients_loader_flag = false;
    this.deleteAllButton = false;
    this.getContracts(this.filters);
    this.getContractTypes('invoice type');
    this.getSkipSizes('skip_sizes');
    this.getBinsTypes('bintypes');
    this.downloadableLink = environment.baseUrl + '/iof/xle/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = environment.baseUrl + '/iof/pdf/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }

  mapClicked(event) {
    if (event.latLng) {
      this.binMap.placeMarkerAndPanTo(event.latLng);
      // { "lat": 33.65775396431903, "lng": 73.04599508781457 }
      this.source_latlong = JSON.stringify({ "lat": event.latLng.lat(), "lng": event.latLng.lng() });
      this.contractForm.patchValue({
        source_latlong: this.source_latlong
      })
    }
  }

  resetMap() {
    this.binMap.resetMap();
    this.source_latlong = null;
    this.contractForm.patchValue({
      source_latlong: null
    })
  }

  onSubmit1(value) {
    this.submitted = true;
    if (this.validate()) {
      const param: FormData = new FormData();
      param.append('date_of_joining', DateUtils.getYYYYMMDD(value['date_of_joining']));
      param.append('date_commissioned', DateUtils.getYYYYMMDD(value['date_commissioned']));
      const date_start = Date.parse(value['date_commissioned']);
      const date_end = Date.parse(value['date_of_joining']);
      param.append('name', value['contract_name']);
      param.append('client', value['selected_client']['id']);
      param.append('status', value['selected_status']['id']);
      param.append('description', value['description']);
      param.append('source_latlong', this.source_latlong)
      param.append('type_id', EntityType.CONTRACT.toString());
      if (date_start > date_end) {
        this.swalService.getErrorSwal('End date should be greater than start date');
        return;
      }

      if (this.uploader.files.length > 0 && this.uploader.files.length <= 10) {
        for (let i = 0; i < this.uploader.files.length; i++) {
          param.append('files', <File>this.uploader.files[i]);
        }
        this.fileUploadStatus = true;
      } else if (this.uploader.files.length >= 10) {
        this.swalService.getWarningSwal('You cannot upload more than 10 files');
        return;
      }

      setTimeout(() => {
        console.log("For debuggggggggggginggg= ", param);
      }, 500);

      const id = this.contractForm.getRawValue().id;
      this.disableSubmitButton();
      if (isNullOrUndefined(id)) {
        this.postContract(param);
      } else {
        this.patchContract(param);
      }
    } else {
      console.log("Form is invalid[in else condition]", this.errorMessages);
    }
  }
  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];

    if (this.contractForm.get('contract_name').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Contract Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.contractForm.get('selected_client').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.contractForm.get('date_of_joining').hasError('required')) {
      this.errorMessages.push('Date of Joining ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.contractForm.get('date_commissioned').hasError('required')) {
      this.errorMessages.push('Date Comisioned ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.contractForm.get('description').hasError('required')) {
      this.errorMessages.push('Description ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.source_latlong == null) {
      this.swalService.getWarningSwal('Please drop marker first!');
      isValid = false;
    }
    // if(this.uploader.files==null){
    //   this.errorMessages.push('Files ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
    //   isValid = false;
    // }


    return isValid;
  }

  getContractTypes(value) {
    this.formService.getOptionsDropdown({ option_key: value })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.contract_type_list = apiResponse.response['option_values'];
          } else {
            console.log(apiResponse.message);
          }

        }
      }(this)
      );
  }

  getSkipSizes(value) {
    this.formService.getOptionsDropdown({ option_key: value })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.skip_size_list = apiResponse.response['option_values'].map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );
          }
        }
      }(this)
      );
  }

  materials = [];
  getBinsTypes(value) {
    this.formService.getOptionsDropdown({ option_key: value })
      .subscribe(new class extends HttpController<LoginApiResponse<DropDownItem[]>> {

        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<DropDownItem[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.materials = apiResponse.response['option_values'];
          }

          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
      );
  }

  patchContract(truck: FormData) {
    truck.append('id', String(this.selectedRow.id));
    // console.log("patchContract: ", truck);
    this.uploadedPercentage = 0;
    this.formService.patchDataWithUploadStatus(truck)
      .subscribe(new class extends HttpController<HttpEvent<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.enableSubmitButton();
          this.context.swalService.getErrorSwal(errorMessage);
          this.context.fileUploadStatus = false;
          this.context.closeP.nativeElement.click();
          console.log(errorMessage);
        }

        onNext(apiResponse: HttpEvent<any>): void {
          switch (apiResponse.type) {
            case HttpEventType.Sent:
              if (this.context.fileUploadStatus) {
                this.context.fileUploadStatus = true;
                this.context.showP.nativeElement.click();
                this.context.bringupModal();
              }
              break;
            case HttpEventType.Response:
              this.context.fileUploadStatus = false;
              if (apiResponse['status'] === 200) {
                this.context.enableSubmitButton();
                if (!apiResponse.body['error']) {
                  this.context.closeForm.nativeElement.click();
                  this.context.closeP.nativeElement.click();
                  this.context.swalService.getSuccessSwal(apiResponse.body.message);
                } else {
                  this.context.swalService.getErrorSwal(apiResponse.body.message);
                }
                // this.context.updateContractsRows(apiResponse['body']);

                this.context.getContracts(this.context.filters);
              } else {
                this.context.swalService.getWarningSwal(apiResponse.body.message);
              }
              break;
            case 1: {
              if (this.context.fileUploadStatus) {
                if (Math.round(this.context.uploadedPercentage) !== Math.round(event['loaded'] / event['total'] * 100)) {
                  this.context.uploadedPercentage = Math.ceil(event['loaded'] / event['total'] * 100);
                  if (Math.ceil(event['loaded'] / event['total'] * 100) == 100) {
                    setTimeout(() => {
                      this.context.closeP.nativeElement.click();
                    }, 400
                    );

                  }
                }
              }
              break;
            }
          }
          this.context.getContracts(this.context.filters);
        }

      }(this)
      );
  }

  bringupModal() {
    let element = document.body;
    element.className = element.className.replace('modal-open', '');
    var element1 = document.getElementsByClassName('modal-backdrop');
    if (element1.length) {
      (<HTMLElement>element1[1]).style.zIndex = '1500';
    }
  }

  postContract(param) {
    // console.log("postcontarct: ", param);
    this.uploadedPercentage = 0;
    this.formService.postContractWithUploadStatus(param)
      .subscribe(new class extends HttpController<HttpEvent<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.enableSubmitButton();
          this.context.swalService.getErrorSwal(errorMessage);
          this.context.fileUploadStatus = false;
          // this.context.closeP.nativeElement.click();
          console.log(errorMessage);
        }

        onNext(apiResponse: HttpEvent<any>): void {
          switch (apiResponse.type) {
            case HttpEventType.Sent:
              if (this.context.fileUploadStatus) {
                this.context.fileUploadStatus = true;
                this.context.showP.nativeElement.click();
                this.context.bringupModal();
              }
              break;
            case HttpEventType.Response:
              this.context.fileUploadStatus = false;
              this.context.closeP.nativeElement.click();
              if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
                this.context.enableSubmitButton();

                if (apiResponse['body'].status === HttpStatusCodeEnum.Success) {
                  this.context.swalService.getSuccessSwal(apiResponse.body.message);
                  this.context.closeForm.nativeElement.click();
                  // this.context.updateContractsRows(apiResponse['body']);

                  this.context.getContracts(this.context.filters);
                } else {
                  this.context.swalService.getWarningSwal(apiResponse.body.message);
                }
              } else {
                this.context.swalService.getWarningSwal(apiResponse.body.message);
              }
              break;
            case 1: {
              if (this.context.fileUploadStatus) {
                if (Math.round(this.context.uploadedPercentage) !== Math.round(event['loaded'] / event['total'] * 100)) {
                  this.context.uploadedPercentage = Math.ceil(event['loaded'] / event['total'] * 100);
                  if (Math.ceil(event['loaded'] / event['total'] * 100) == 100) {
                    setTimeout(() => {
                      this.context.closeP.nativeElement.click();
                    }, 400
                    );

                  }
                }
              }
              break;
            }
          }
        }
      }(this)
      );

  }

  updateContractsRows(apiResponse) {
    this.contracts.splice(this.rowIndexBeingEdited, 1);
    this.contracts.unshift(apiResponse.response);
    this.contracts = [...this.contracts];
    this.temp = this.contracts;
    this.csvRows = this.contracts;
  }

  onClientChange(event) {
    // this.param_clients = [];
    // this.param_clients.push(event['id']);
    // console.log(this.param_areas);
    // // this.resetMap();
    // this.getBins();
  }

  AdButtonClick() {
    this.submitted = false;
    this.deg = 0;
    this.uploader.files = [];
    this.image1.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;-webkit-transform:rotate(' + this.deg + 'deg);' + '-moz-transform:rotate(' + this.deg + 'deg);' + '-o-transform:rotate(' + this.deg + 'deg);' + '-ms-transform:rotate(' + this.deg + 'deg);' + 'transform:rotate(' + this.deg + 'deg);');
    window.dispatchEvent(new Event('resize'));
    this.formTitle = 'Add Contract';
    this.enableSubmitButton();
    this.contractForm.reset();
    this.itemListBins = [];
    this.picName = null;
    this.client_list = [];
    this.param_clients = [];
    this.param_areas = [];
    this.param_locations = [];
    this.inactiveRecord = false;
    this.avatar = null;
    this.avatar_url = null;
    this.getClients();
    this.getAreas();
    this.getLocations();
    this.resetMap();
    this.areas_loader_flag = true;
    this.locations_loader_flag = true;
    this.clients_loader_flag = true;
    let inputDiv = $('#pac-input');

    setTimeout(() => {
      inputDiv.val('')
      inputDiv.focus();
    }, 10);
  }

  getAreas() {
    this.formService.getBinsData('get_entity_dropdown', { entity: EntityType.AREA })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
          this.context.loader_flag = false;
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          console.log('areas', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            if (apiResponse.response !== undefined) {
              this.context.area_list = apiResponse.response.map(
                item => new DropDownItem(item['id'], item['label'])
              );
            }
          }
          this.context.areas_loader_flag = false;
        }
      }(this)
      );
  }

  getLocations() {
    this.formService.getBinsData('get_entity_dropdown', { entity: EntityType.LOCATION })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
          this.context.loader_flag = false;
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          console.log('locations', apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            if (apiResponse.response !== undefined) {
              this.context.location_list = apiResponse.response.map(
                item => new DropDownItem(item['id'], item['label'])
              );
            }
          }
          this.context.locations_loader_flag = false;
        }
      }(this)
      );
  }

  getClients() {
    this.formService.getBinsData('get_entity_dropdown', { entity: EntityType.CLIENT })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
          this.context.loader_flag = false;
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.client_list = apiResponse.response.map(
              item => new DropDownItem(item['id'], item['label'])
            );

          } else {
            console.log(apiResponse.message);
          }
          this.context.clients_loader_flag = false;
        }
      }(this)
      );

  }

  getBinsEdit(obj) {
    this.formService.getBinsData('get_bins_contract_dropdown', {}).subscribe(new class extends HttpController<ApiResponse<any>> {
      onComplete(): void {
      }

      onError(errorMessage: string, err: any) {
        // do
        console.log(errorMessage);
      }

      onNext(apiResponse: ApiResponse<any>): void {
        if (apiResponse.status) {
          console.log('bins ', apiResponse.response);
          this.context.binsList = apiResponse.response;
          if (apiResponse.response !== undefined) {
            this.context.itemListBins = apiResponse.response.map(
              item => new DropDownItem(item['id'], item['label'])
            );
          }
          for (let i = 0; i < obj.length; i++) {
            this.context.itemListBins = [...this.context.itemListBins, new DropDownItem(obj[i]['id'],
              obj[i]['name'])];
          }

        } else {
          console.log(apiResponse.message);
        }
      }
    }(this)
    );
  }

  // resetMap(){
  //   for (let i = 0; i < this.markers.length; i++) {
  //     this.markers[i].setMap(null);
  //   }
  //   this.markers = [];
  // }

  getParams(sDate) {
    let params = null;
    params = {
      inputDate: DateUtils.getUTCYYYYMMDDHHmmss(sDate.toString())
    };
    return params;
  }

  disableButton(row) {
    return this.formService.disableButton(row);
  }

  getContracts(filters) {
    console.log("coming in ");
    this.inputValue = '';
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.contracts = [];
    const index_a = 0;
    const index_b = 100;
    const results_remaining = false;
    this.optimized_contract_call(filters);
  }

  optimized_contract_call(filters) {
    console.log("coming in 3");
    this.showIndeterminateProgress = true;
    let params = `type=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    console.log("let params", params);
    console.log("filters")
    this.optimizedCall = this.formService.getContractsListing({
      type_id: filters.type_id,
      limit: filters.limit,
      offset: filters.offset,
      order: filters.order,
      order_by: filters.order_by,
      search: filters.search

    })
      .subscribe((data: any) => {

        if (!data.error) {
          console.log("coming in 4");
          // this.contracts=data.data['data'];
          this.contracts = data.response;
          this.temp = this.contracts;
          this.enableSearch = false;
          this.showIndeterminateProgress = false;
        } else {
          this.swalService.getWarningSwal(data.message);
        }
        console.log("contracts: ", data['data'].data);
        // this.contracts=data.data['data'];

        this.totalContractsLength = data.data.count;
        console.log("totalContractsLength", this.totalContractsLength);
        this.contracts = data['data'].data;
        this.contracts.paginator = this.paginator;


      }
      );

  }

  expiring = [];
  optimizedCallexpiring: any;
  getExpiringContracts() {
    let index_a = 0;
    let index_b = 100;
    this.status.expiring = 0;
    let results_remaining = true;
    this.expiring = [];
    this.optimized_expiring_contracts_call(index_a, index_b);
  }

  optimized_expiring_contracts_call(index_a, index_b) {
    this.optimizedCallexpiring = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_expiring_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderExpiring = 'Search';
      //     this.context.enableSearchExpiring = false;
      //     this.context.showIndeterminateProgressExpiring = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.expiring = [];
      //     this.context.expiring = [...this.context.expiring, ...apiResponse.response];
      //     this.context.tempexpiring = this.context.expiring;
      //     this.context.status.expiring = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.expiring += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  expiringInThreeMonths = [];
  getExpiringinThreeMonthsContracts() {
    // this.inputValueExpiringInThreeMonths = '';
    // this.searchPlaceHolderExpiringInThreeMonths = 'Loading...';
    let index_a = 0;
    let index_b = 100;
    this.status.expiring_in_3 = 0;
    this.expiringInThreeMonths = [];
    this.optimized_expiring_in_3_contracts_call(index_a, index_b);
  }

  optimized_expiring_in_3_contracts_call(index_a, index_b) {
    this.optimizedCallexpiring = this.formService.getContractsListing({
      type_id: 'expiring_in_3',
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_expiring_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderExpiringInThreeMonths = 'Search';
      //     this.context.tempExpiringInThreeMonths = this.context.expiringInThreeMonths;
      //     console.log('temp', this.context.tempExpiringInThreeMonths);


      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     console.log('expirung in 3', apiResponse.response);
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.expiringInThreeMonths = [];
      //     this.context.expiringInThreeMonths = [...this.context.expiringInThreeMonths, ...apiResponse.response];
      //     this.context.status.expiring_in_3 = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.expiring_in_3 += 1;
      //     }

      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  expired = [];
  optimizedCallexpired: any;
  getExpiredContracts() {
    // this.inputValueExpired = '';
    // this.searchPlaceHolderExpired = 'Loading...';
    // this.enableSearchExpired = true;
    // this.showIndeterminateProgressExpired = true;
    let index_a = 0;
    let index_b = 100;
    this.status.expired = 0;
    let results_remaining = true;
    this.expired = [];
    this.optimized_expired_contracts_call(index_a, index_b);
  }

  optimized_expired_contracts_call(index_a, index_b) {
    this.optimizedCallexpired = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_expired_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderExpired = 'Search';
      //     this.context.enableSearchExpired = false;
      //     this.context.showIndeterminateProgressExpired = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.expired = [];
      //     this.context.expired = [...this.context.expired, ...apiResponse.response];
      //     this.context.tempexpired = this.context.expired;
      //     this.context.status.expired = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.expired += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  renewed = [];
  optimizedCallrenewal: any;
  getRenewedContracts() {
    // this.inputValueRenewed = '';
    // this.searchPlaceHolderRenewed = 'Loading...';
    // this.enableSearchRenewed = true;
    // this.showIndeterminateProgressRenewed = true;
    let index_a = 0;
    let index_b = 100;
    this.status.renewed = 0;
    let results_remaining = true;
    this.renewed = [];
    this.optimized_renewed_contracts_call(index_a, index_b);
  }

  optimized_renewed_contracts_call(index_a, index_b) {
    this.optimizedCallrenewal = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_renewed_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderRenewed = 'Search';
      //     this.context.enableSearchRenewed = false;
      //     this.context.showIndeterminateProgressRenewed = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.renewed = [];
      //     this.context.renewed = [...this.context.renewed, ...apiResponse.response];
      //     this.context.temprenewed = this.context.renewed;
      //     this.context.status.renewed = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.renewed += 1;
      //     }

      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  newcontracts = [];
  optimizedCallnew: any;
  getNewContracts() {
    // this.inputValueNew = '';
    // this.searchPlaceHolderNew = 'Loading...';
    // this.enableSearchNew = true;
    // this.showIndeterminateProgressNew = true;
    let index_a = 0;
    this.status.newcontracts = 0;
    let index_b = 100;
    let results_remaining = true;
    this.newcontracts = [];
    this.optimized_new_contracts_call(index_a, index_b);
  }

  optimized_new_contracts_call(index_a, index_b) {
    this.optimizedCallnew = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_new_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderNew = 'Search';
      //     this.context.enableSearchNew = false;
      //     this.context.showIndeterminateProgressNew = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.newcontracts = [];
      //     this.context.newcontracts = [...this.context.newcontracts, ...apiResponse.response];
      //     this.context.tempnew = this.context.newcontracts;
      //     this.context.status.newcontracts = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.newcontracts += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  deactivated = [];
  optimizedCalldeactivated: any;
  getDeactivatedContracts() {
    // this.inputValueDeactivated = '';
    // this.searchPlaceHolderDeactivated = 'Loading...';
    // this.enableSearchDeactivated = true;
    // this.showIndeterminateProgressDeactivated = true;
    this.status.deactivated = 0;
    let index_a = 0;
    let index_b = 100;
    let results_remaining = true;
    this.deactivated = [];
    this.optimized_deactivated_contracts_call(index_a, index_b);
  }

  optimized_deactivated_contracts_call(index_a, index_b) {
    this.optimizedCalldeactivated = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_deactivated_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderDeactivated = 'Search';
      //     this.context.enableSearchDeactivated = false;
      //     this.context.showIndeterminateProgressDeactivated = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.deactivated = [];
      //     this.context.deactivated = [...this.context.deactivated, ...apiResponse.response];
      //     this.context.tempdeactivated = this.context.deactivated;
      //     this.context.status.deactivated = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.deactivated += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  populateHashmap(list) {
    for (const entry of list) {
      this.hashMap[entry.id] = false;
    }
    console.log('hashmap', this.hashMap);
  }

  getprogress(area) {
    return this.hashMap[area.id];
  }


  onSelect({ selected }) {
    console.log("onSelect: ", selected);
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  async showDeleteCategoryConfirmation(row) {
    const response = await this.swalService.getConfirmSwal();
    if (response) {
      this.hashMap[row.id] = true;
      this.formService.deleteContract({ 'id': [row.id] })
        .subscribe((data: any) => {
          if (!data.error) {
            this.closeForm.nativeElement.click();
            this.swalService.getSuccessSwal('Contract deleted successfully');
            this.getContracts(this.filters);
          } else {
            this.swalService.getWarningSwal(data.message);
          }
          // onComplete(): void {
          // }

          // onError(errorMessage: string, err: any) {
          //   // do
          //   console.log(errorMessage);
          //   this.context.hashMap[row.id] = false;
          //   this.context.swalService.getErrorSwal(errorMessage);
          // }

          // async onNext(apiResponse: ApiResponseNew<any>) {
          //   console.log(apiResponse);
          //   this.context.hashMap[row.id] = false;
          //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
          //     const shouldDeleteOrInactive = await this.context.swalService.getDeleteSwal(row);
          //     if (shouldDeleteOrInactive) {
          //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
          //       this.context.deleteContract([row.id], shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', row.type);
          //     }
          //   } else if (apiResponse.status === HttpStatusCodeEnum.Bad_Request) {
          //     const shouldDeleteOrInactive = await this.context.swalService.getDeleteSwal(row, apiResponse.message);
          //     if (shouldDeleteOrInactive) {
          //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
          //       this.context.deleteContract([row.id], shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', row.type);
          //     }
          //   } else {
          //     this.context.swalService.getErrorSwal(apiResponse.message);
          //   }

          // if (apiResponse.status === 200) {
          //   swal({
          //     title: 'What do you want to do with ' + row.name + ' ?',
          //     text: 'You won\'t be able to revert this!',
          //     type: 'warning',
          //     showCancelButton: (row.status === this.context.EntityStatusEnum.Active),
          //     showCloseButton: true,
          //     confirmButtonText: 'Delete Record',
          //     cancelButtonText: 'Mark as Inactive',
          //     confirmButtonClass: 'btn btn-sm btn-danger margin-5',
          //     cancelButtonClass: 'btn btn-sm btn-warning margin-5',
          //     buttonsStyling: false,
          //     allowOutsideClick: true,
          //   }).then((result) => {
          //     // Delete Record
          //     if (result.value) {
          //       this.context.deleteContract([row.id], EntityStatusEnum.Delete, 'Record has been deleted successfully');
          //     }
          //     //  Inactive
          //     else if (
          //       result.dismiss.toString() === 'cancel') {
          //       this.context.deleteContract([row.id], EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');
          //     }
          //   });
          // } else if (apiResponse.status === 400) {
          //   swal({
          //     title: apiResponse.message,
          //     text: 'You won\'t be able to revert this!',
          //     type: 'warning',
          //     showCancelButton: (row.status === this.context.EntityStatusEnum.Active),
          //     showCloseButton: true,
          //     confirmButtonText: 'Delete Record',
          //     cancelButtonText: 'Mark as Inactive',
          //     confirmButtonClass: 'btn btn-sm btn-danger margin-5',
          //     cancelButtonClass: 'btn btn-sm btn-warning margin-5',
          //     buttonsStyling: false,
          //     allowOutsideClick: true,
          //   }).then((result) => {
          //     // Delete Record
          //     if (result.value) {
          //       this.context.deleteContract([row.id], EntityStatusEnum.Delete, 'Record has been deleted successfully');
          //     }
          //     //  Inactive
          //     else if (
          //       result.dismiss.toString() === 'cancel') {
          //       this.context.deleteContract([row.id], EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');
          //     }
          //   });
          // } else {
          //   this.context.swalService.getErrorSwal(apiResponse.message);
          // }
          // }

        });
    }
  }

  // Swal dialog for Delete/inactive
  // async showSwal(row) {
  //   const response = await this.swalService.getConfirmSwal();
  //   if (response == true) {
  //   }
  // }
  async showSwal(row) {
    console.log('user', row);
    // const shouldDelete = await this.swalService.askForDeletion('Do you really want to delete this user?');
    const shouldDelete = await this.swalService.getDeleteSwal(row, 'What do you want to do with ' + row.name + ' ?');
    console.log('shouldDelete', shouldDelete);
    if (shouldDelete) {
      console.log("coming in should del");
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';

      this.deleteContract(row.id, shouldDelete, 'Record has been' + message + 'successfully');
    }
  }

  // Delete bin
  deleteContract(binId, actionType, message?) {
    const params = {};
    params['id_list'] = (binId);
    params['id'] = (binId);
    params['status'] = actionType;
    this.formService.deleteContract(params)
      .subscribe((data: any) => {

        if (!data.error) {
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getContracts(this.filters);
          // this.getTrucks(this.filtersTruck);
        } else {
          this.swalService.getWarningSwal(data.message);
        }
        // onComplete(): void {
        // }

        // onError(errorMessage: string, err: any) {
        //   // do
        //   console.log(errorMessage);
        //   this.context.swalService.getErrorSwal(errorMessage);
        // }

        // onNext(apiResponse: ApiResponse<any>): void {
        //   if (!this.context.selectedRows.length) {
        //     this.context.swalService.getSuccessSwal(message);
        //   } else {
        //     this.context.selectedRows = [];
        //   }
        //   this.context.inputValue = '';
        //   this.context.getContracts();
        // }

      }
      );
  }

  async showSwalForMultiple(type) {
    this.deleteAllButton = true;
    const arr = [];
    const id_list = [];
    let showInactive = false;
    this.selectedRows.forEach(item => {
      arr.push(item.name);
      id_list.push(item.id);
      if (item.status_id === this.EntityStatusEnum.Active) {
        showInactive = true;
      }
    });
    for (let single_id = 0; single_id < id_list.length; single_id++) {
      this.hashMap[id_list[single_id]] = true;
    }
    this.formService.deleteDataCheck({ 'id_list': id_list })
      .subscribe((data: any) => {
        // onComplete(): void {
        // }

        // onError(errorMessage: string, err: any) {
        //   // do
        //   console.log(errorMessage);
        //   this.context.deleteAllButton = false;
        //   for (let single_id = 0; single_id < id_list.length; single_id++) {
        //     this.context.hashMap[id_list[single_id]] = false;
        //   }
        //   this.context.swalService.getErrorSwal(errorMessage);
        // }

        // async onNext(apiResponse: ApiResponseNew<any>) {
        //   console.log(apiResponse);
        //   this.context.deleteAllButton = false;
        //   for (let single_id = 0; single_id < id_list.length; single_id++) {
        //     this.context.hashMap[id_list[single_id]] = false;
        //   }

        //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
        //     const shouldDeleteOrInactive = await this.context.swalService.getMultipleDeleteSwal(arr);
        //     if (shouldDeleteOrInactive) {
        //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
        //       this.context.deleteContract(id_list, shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', type);
        //     }
        //   } else if (apiResponse.status === HttpStatusCodeEnum.Bad_Request) {
        //     const shouldDeleteOrInactive = await this.context.swalService.getMultipleDeleteSwal(arr, apiResponse.message);
        //     if (shouldDeleteOrInactive) {
        //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
        //       this.context.deleteContract(id_list, shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', type);
        //     }
        //   } else {
        //     this.context.swalService.getErrorSwal(apiResponse.message);
        //   }

        // if (apiResponse.status === 200) {
        //   swal({
        //     title: 'What do you want to do with ' + arr + ' ?',
        //     text: 'You won\'t be able to revert this!',
        //     type: 'warning',
        //     showCancelButton: showInactive,
        //     showCloseButton: true,
        //     allowOutsideClick: true,
        //     confirmButtonText: 'Delete Records',
        //     cancelButtonText: 'Mark as Inactive',
        //     confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        //     cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        //     buttonsStyling: false,
        //   }).then((result) => {
        //     // Delete Record
        //     if (result.value) {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Delete, 'Record has been deleted successfully');
        //     }
        //     //  Inactive
        //     else if (
        //       result.dismiss.toString() === 'cancel') {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');
        //     }
        //   });
        // } else if (apiResponse.status === 400) {
        //   swal({
        //     title: apiResponse.message,
        //     text: 'You won\'t be able to revert this!',
        //     type: 'warning',
        //     showCancelButton: showInactive,
        //     showCloseButton: true,
        //     allowOutsideClick: true,
        //     confirmButtonText: 'Delete Records',
        //     cancelButtonText: 'Mark as Inactive',
        //     confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        //     cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        //     buttonsStyling: false,
        //   }).then((result) => {
        //     // Delete Record
        //     if (result.value) {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Delete, 'Record has been deleted successfully');
        //     }
        //     //  Inactive
        //     else if (
        //       result.dismiss.toString() === 'cancel') {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');
        //     }
        //   });
        // } else {
        //   this.context.swalService.getErrorSwal(apiResponse.message);
        // }
        // }

      }
      );
  }

  inactiveRecord;
  selectedRow;
  picName;
  rowIndexBeingEdited = null;

  openEditModal(row, index) {
    console.log("row= ", row);
    this.AdButtonClick();
    this.rowIndexBeingEdited = index;
    this.isFileImage = true;
    this.fileUploadProgressBar = true;
    this.deg = 0;
    this.uploader.files = [];
    this.image1.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;-webkit-transform:rotate(' + this.deg + 'deg);' + '-moz-transform:rotate(' + this.deg + 'deg);' + '-o-transform:rotate(' + this.deg + 'deg);' + '-ms-transform:rotate(' + this.deg + 'deg);' + 'transform:rotate(' + this.deg + 'deg);');
    window.dispatchEvent(new Event('resize'));
    this.formTitle = 'Update Contract';

    let inputDiv = $('#pac-input');

    setTimeout(() => {
      inputDiv.val('')
      inputDiv.focus();
    }, 10);

    this.picName = null;
    this.avatar_url = null;
    this.enableSubmitButton();
    this.itemListBins = [];
    this.param_clients = [];
    if (this.client_list.length < 1) {
      this.getClients();
    }
    if (this.area_list.length < 1) {
      this.getAreas();
    }
    if (this.location_list.length < 1) {
      this.getLocations();
    }
    this.param_clients.push(row['client']);
    this.inactiveRecord = this.disableButton(row);
    if (this.inactiveRecord === true) {
      this.btnText = 'Activate Contract';
    }

    this.inactiveRecord = (row.status === this.EntityStatusEnum.Inactive);
    this.selectedRow = row;
    this.contractForm.patchValue({ id: row.id });
    this.contractForm.patchValue({ contract_name: row.name });
    this.contractForm.patchValue({ unit_pricing: row.skip_rate });
    this.contractForm.patchValue({ description: row.description });

    this.contractForm.patchValue({ selected_client: row.client ? new DropDownItem(row.client, row.client_name) : null });
    this.contractForm.patchValue({ selected_entity_sub_type: row.entity_sub_type ? new DropDownItem(row.entity_sub_type, row.entity_sub_type_name) : null });
    this.contractForm.patchValue({ date_commissioned: row.date_commissioned ? new Date(row.date_commissioned) : null });
    this.contractForm.patchValue({ date_of_joining: row.date_of_joining ? new Date(row.date_of_joining) : null });

    this.contractForm.patchValue({ selected_status: row.status ? row.status : null });
    if (row.status === 1) {
      this.selected_status_d = { id: 1, name: "Active" }
    } else {
      this.selected_status_d = { id: 2, name: "Inactive" }
    }
    this.changeMaterial();
    this.source_latlong = row.source_latlong;
    if (!isNullOrUndefined(this.source_latlong)) {
      console.log(JSON.parse(this.source_latlong));
      // this.binMap.placeMarkerAndPanTo(event.latLng);
      this.binMap.createMarker(JSON.parse(row.source_latlong), null, null, null, 'mouseover', 10, true).getPosition();
    }
    if (row.photo_method) {
      this.avatar_url = row.photo_method;
      let arr = row.photo_method.split('/');
      this.picName = arr[arr.length - 1];
      console.log(arr, this.picName);
      // this.createFile(row.photo, this.picName);
    } else {
      this.contractForm.patchValue({ photo_method: null });
    }

    if (row.files_name) {
      for (let i = 0; i < row.files_name.length; i++) {
        const arr = row.files_name[i].split('/');
        let picName = arr[arr.length - 1];
        let picTooltip = '';
        if (picName.length > 30) {
          picTooltip = picName;
          // picName = picName.substring(0, 33) + '...';
        }
        console.log(arr, picName);

        this.createFile(row.files_name[i], picName, picTooltip);
      }
    } else {
      this.contractForm.patchValue({ files: null });
    }

    console.log(this.avatar_url);
    this.btnText = "Update";
    this.fileUploadProgressBar = false;
  }


  public getTruncatedFileName(fileName) {
    if (fileName.length > 30) {
      fileName = fileName.substring(0, 33) + '...';
    }
    return fileName;
  }

  async createFile(url, filename, fileTooltip) {
    var request = new Request(url);
    let response = await fetch(request, {
      mode: 'no-cors',
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    let data = await response.blob();
    let file = new File([data], filename);
    file['tooltip'] = fileTooltip;
    console.log('new file', file);
    this.uploader.files.push(file);
    this.fileUploadProgressBar = false;
  }

  onBinChange(obj) {
    if ('itemValue' in obj) {
      console.log(obj);
      if (obj.value.indexOf(obj.itemValue) > -1) {
        // this.tempMarkers[obj.itemValue['id']].setIcon(this.getMapIcon(true));
      } else {
        // this.tempMarkers[obj.itemValue['id']].setIcon(this.tempMarkers[obj.itemValue['id']].oldIcon);
      }
    } else {
      // if (obj.value.length) {
      //   for (let i = 0; i < obj.value.length; i++)
      //     this.tempMarkers[obj.value[i]['id']].setIcon(this.getMapIcon(true));
      // }
      // else {
      //   for (let i = 0; i <  this.markers.length; i++)
      //     this.markers[i].setIcon(this.markers[i].oldIcon);
      // }
    }
  }

  updateFilter(val) {
    console.log(this.searchForm.value.search);
    this.downloadableLink = environment.baseUrl + '/iof/xle/?search=' + this.searchForm.value.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = environment.baseUrl + '/iof/pdf/?search=' + this.searchForm.value.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    console.log("coming in updatefilter", this.downloadableLink);
    this.filters.search = this.searchForm.value.search;
    this.filters.offset = 0;
    this.contracts.paginator.pageIndex = 0;
    if (!this.filters.search) {
      this.filters.search = '';
    }
    this.optimized_contract_call(this.filters);
    console.log("coming in ");

    // this.inputValue = '';
    // this.searchPlaceHolder = 'Loading...';
    // this.enableSearch = true;
    // this.showIndeterminateProgress = true;
    // this.contracts = [];
    // const index_a = 0;
    // const index_b = 100;

    // this.downloadableLink = environment.baseUrl + '/iof/xle/?search=' + this.searchForm.value.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/pdf/?search=' + this.searchForm.value.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    // this.optimizedCall = this.formService.getContractsListing({
    //   type_id: 42,
    //   index_a: index_a,
    //   index_b: index_b,
    //   search: this.searchForm.value.search
    // })
    //   .subscribe((data: any) => {

    //     if (!data.error) {
    //       // this.contracts=data.data['data'];
    //       this.contracts = data.response;
    //       this.temp = this.contracts;
    //       this.enableSearch = false;
    //       this.showIndeterminateProgress = false;
    //     } else {
    //       this.swalService.getWarningSwal(data.message);
    //     }
    //     console.log("asaaaaaaaaaaaaa", data['data'].data);
    //     // this.contracts=data.data['data'];
    //     this.totalContractsLength = data.data.count;
    //     this.contracts = data['data'].data;
    //   }
    //   );
    // this.contracts = this.datatableService.updateFilter(this.searchForm.value.search, this.temp, ['name', 'client_name', 'party_code']);
  }
  onClearSearch() {
    this.downloadableLink = environment.baseUrl + '/iof/xle/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.downloadableLink1 = environment.baseUrl + '/iof/pdf/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    this.searchForm.reset();
    this.filters.search = '';
    this.filters.order = '';
    this.filters.order = '';
    this.filters.limit = 10;
    this.filters.offset = 0;
    var params;
    // this.downloadableLink = environment.baseUrl+'/options/get_export_files/?'+params;
    this.optimized_contract_call(this.filters);
  }
  onSearch(formval) {
    // console.log(this.searchForm.value.search);
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }

  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  isFileImage = true;
  avatar;
  avatar_url;
  uploadedFiles = [];

  fileChange(event) {
    console.log("filechange: ", event);
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const img = document.querySelector('#preview img') as HTMLImageElement;

      // if (fileList[0].type.indexOf('image') === -1) {
      //   this.notImage = true;
      // }
      this.isFileImage = fileList[0].type.indexOf('png') > -1 || fileList[0].type.indexOf('jpg') > -1 || fileList[0].type.indexOf('jpeg') > -1;
      console.log('file type', fileList[0].type, this.isFileImage);
      if (this.isFileImage) {

        if (file.size > 1000000000) { // 1MB
          this.swalService.getWarningSwal('File is too big! Image must be less than 1 MB');
          this.avatar = null;
          return;
        } else {
          this.avatar = file;
          const reader = new FileReader();
          var self = this;
          reader.onload = (function (aImg) {
            return function (e) {
              aImg.src = e.target.result;
              console.log(aImg, 'image');
              self.avatar_url = aImg.src;
            };
          })(img);
          reader.readAsDataURL(file);

        }
      }
    }
  }

  removeImage() {
    this.myInputVariable.nativeElement.value = '';
    this.avatar_url = null;
    this.avatar = null;
    this.image.nativeElement.src = '';
    this.contractForm.patchValue({ 'photo_method': null });
  }

  viewImage() {
    this.deg = 0;
    this.image.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;');
    window.dispatchEvent(new Event('resize'));
  }

  deg = 0;

  rotate() {
    this.deg += 90;
    this.image1.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;-webkit-transform:rotate(' + this.deg + 'deg);' + '-moz-transform:rotate(' + this.deg + 'deg);' + '-o-transform:rotate(' + this.deg + 'deg);' + '-ms-transform:rotate(' + this.deg + 'deg);' + 'transform:rotate(' + this.deg + 'deg);');
    window.dispatchEvent(new Event('resize'));
  }

  changeMaterial() {
    if (this.selected_skip_size) {
      console.log('option', this.getIconsService.getMaterialLabel(SkipSizeToMaterialEnum['_' + this.selected_skip_size]));
      this.selected_entity_sub_type = this.getIconsService.getMaterialLabel(SkipSizeToMaterialEnum['_' + this.selected_skip_size]);
    } else {
      this.selected_entity_sub_type = null;
    }
  }

  remove(file: File, uploader: FileUpload) {
    console.log("remove...");
    const index = uploader.files.indexOf(file);
    uploader.remove(null, index);
  }

  formatSize(bytes) {
    if (bytes == 0) {
      return '0 B';
    }
    var k = 1000, dm = 3, sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  fileSelected(event) {
    console.log('file selected', event);
  }

  onPaginateTool(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.optimized_contract_call(this.filters);
  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.optimized_contract_call(this.filters);
  }

  showPDF(row) {
    // console.log("data- ", row)
    // console.log("Download PDF= ", row.document_file[0])
    window.open(row, '_blank');
  }
  pageReload() {
    console.log("coming");
    window.location.reload()
  }

  getFileName(fileName) {
    var filename = fileName.replace(/^.*[\\\/]/, '')
    return filename;
  }
}
