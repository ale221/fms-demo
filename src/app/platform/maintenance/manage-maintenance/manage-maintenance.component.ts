import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { CustomValidators } from 'src/app/core/custom.validator';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { hypernymModules } from 'src/app/core/model/module';
import { FiltersService } from 'src/app/core/services/filters.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { AdminMaintenanceFormComponent } from '../../admin-maintenance-form/admin-maintenance-form.component';
import { DashboardEnum } from '../../enum/dashboard-enum';
import { EntityService } from '../../services/entity.service';
import { FormService } from '../../services/FormService';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { GotoPageService } from '../../services/goto-page.service';
import { MaintenanceService } from '../../services/mainenance-service.service';
import { BrandingService } from '../../shared/services/branding.service';
import { ErrorMessage } from '../../error-message';
import { PrimengDropdownItem } from 'src/app/platform/data/model/primng-dropdown-item';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-manage-maintenance',
  templateUrl: './manage-maintenance.component.html',
  styleUrls: ['./manage-maintenance.component.css']
})
export class ManageMaintenanceComponent implements OnInit {

  items = [{ label: 'Maintenance', url: null }];
  home = { label: 'Dashboard' };

  widgetData = [
    { name: 'Refresh', icon: 'fa fa-refresh', route: '', reload: true },
    { name: 'Export', icon: 'fa fa-download', route: '' },
    { name: 'Share', icon: 'fa fa-share-alt', route: '', subNav: [{ name: 'Whatsapp', route: "" }, { name: 'Email', route: '' }] },
    { name: 'Manage', icon: 'fa fa-crosshairs-alt', route: '/iol/admin/config', target: true, url: 'http://52.178.0.56/admin', queryParam: true },
    { name: 'Predict', icon: 'fa fa-location-arrow', route: '/iol/territories' },
    { name: 'Actions', icon: 'fa fa-map-marker', route: '' }
  ]

  graphColumns = ['col-md-8', 'col-md-4', 'col-md-6', 'col-md-6', 'col-md-8', 'col-md-4', 'col-md-5', 'col-md-7', 'col-md-8', 'col-md-4', 'col-md-6', 'col-md-6', 'col-md-8', 'col-md-4', 'col-md-5', 'col-md-7'];
  theme;
  useCaseId = 0;
  submitted = false;
  submittedForType = false;
  cardsArray;
  graphsArray;
  loading = false;
  selectedGraph;
  //set graph height for dashboard
  graphHeight = 240;
  searchForm: FormGroup;
  maintainForm: FormGroup;
  typeForm: FormGroup;
  resetFilters = false;
  showIndeterminateProgress = false;
  @ViewChild('closeForm') private closeForm;
  @ViewChild('editpop') private editpop;
  @ViewChild('closeTypeForm') private closeTypeForm;
  dataSource;
  // dataSourceType = [];
  totalLength = 0;
  totalLengthType = 0;
  bsModalRef: BsModalRef;
  isAuthorized = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sortType: MatSort;
  @ViewChild('paginator') paginatorType: MatPaginator;

  keyUp = new Subject<KeyboardEvent>();
  filters = { offset: 0, limit: 10, vehicle_group_id: '', vehicle_id: '', maintenance_type_id: '', maintenance_id: '', order: '', order_by: '', date_filter: '', search: '', export: '', timeZone: '', start_date: '', end_date: '' };
  filtersType = { offset: 0, limit: 10, order: '', order_by: '', search: '', export: '', timeZone: '' };
  displayedColumns = ['id', 'device_id__name', 'driver_id__name', 'technician_name', 'maintenance_type_id__label', 'maintenance_status_id__label', 'start_datetime', 'end_datetime', 'action'];
  // displayedColumnsType = ['label', 'action']

  fleetListing = [];
  vehicleListing = [];
  vehicleListingFromResponse = [];
  serviceTypeList = [];
  technicianListing = [];
  driversList = [];

  fleetDisable: boolean = true;
  maintanceStatusListing = []
  errorMessages: string[];
  selectedMaintenaceId = 0;
  selectedMaintenaceForDelete;
  selectedTypeID = 0;
  selectedTypeForDelete;
  formTitle: string = 'Add Maintenace Work Order';
  formTitleType: string = 'Add Maintenace Type';
  btnText: string;
  selectedServiceType;
  selectedVehicle;
  selectedDriver;
  selectedMaintenaceStatus;
  currentDate = new Date();
  public target_start_date: Date;
  public target_delivery_date: Date;
  public next_maintenance_date: Date;
  public min_next_maintenance_date: Date;
  footerArr = [
    { label: 'Accepted', count: 10 },
    { label: 'Accepted', count: 10 },
    { label: 'Accepted', count: 10 },
    { label: 'Accepted', count: 10 },
  ]
  EntityStatusEnum = EntityStatusEnum;

  listOfCards: any;
  downloadableLink
  downloadableLink1
  btnLoading: boolean;
  loggedInUser;
  PackageType = PackageType;
  customerID;
  breadcrumbInner = [];
  sidebarCheck;
  constructor(
    private formBuilder: FormBuilder,
    private brandingService: BrandingService,
    private getUsecase: GetUsecaseService,
    private swalService: SwalService,
    public gotoService: GotoPageService,
    private entityService: EntityService,
    private formService: FormService,
    private modalService: BsModalService,
    private maintenanceService: MaintenanceService,
    private filtersService: FiltersService,
    private authService: AuthService,
    private breadcrumbService: BreadcrumbsService,
    private drawerService: DrawerService,
    private sanitizer: DomSanitizer,
  ) {
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.searchForm = this.formBuilder.group({
      search: [''],
      searchFleet: [''],
      searchVehicle: [''],
      searchServiceType: [''],
      searchMaintenanceStatus: [''],
    });
    this.maintainForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      maintenance_type_id: [null, [Validators.required]],
      technician_name: [null, [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      device_id: [null, [Validators.required]],
      fleet: [{ value: null, disabled: this.fleetDisable }],

      driver_id: [null, [Validators.required]],
      maintenance_status_id: [null, [Validators.required]],
      description: [null],

      target_start_date: [null, [Validators.required]],
      target_delivery_date: [null, [Validators.required]],
      next_maintenance_date: [null],

      auto_reminder: false
    });

    this.typeForm = this.formBuilder.group({
      value: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]]
    });
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }


  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    // console.log("this.loggedInUser- ", this.loggedInUser, this.loggedInUser.package[0].package_id);

    const appendExport = 'order=&order_by=&vehicle_group_id=&vehicle_id=&maintenance_type_id=&maintenance_id=&date_filter=&search=';
    // this.downloadableLink = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&start_date=&end_date=';
    
    this.downloadableLink = appendExport + '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&start_date=&end_date=';
    // this.downloadXLS(this.downloadableLink);
    
    
    // this.downloadableLink1 = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID + '&start_date=&end_date=';
    this.downloadableLink1 = appendExport + '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&start_date=&end_date=';
    // this.downloadPDF(this.downloadableLink1);
    this.loadDashboardCards(hypernymModules[6], DashboardEnum.Mainenance);

    //Get Fleet
    this.maintenanceService.getFleetListing().subscribe((data: any) => {
      if (!data.error) {
        this.fleetListing = data.data.data.map(
          item => new PrimengDropdownItem(item['id'], item['name'])
        );
      }
    })

    //Get Service Type
    this.getMaintenanceServiceType();

    // Get Technician Listing
    this.maintenanceService.getTechnicianListing().subscribe((data: any) => {
      // console.log("getTechnicianListing== ", data);
      if (!data.error) {
        this.technicianListing = data.data.data.map(
          item => new PrimengDropdownItem(item['id'], item['name'])
        );
      }
    })

    // Get Vehicle Listing
    this.maintenanceService.getVehicleListing().subscribe((data: any) => {
      // console.log("getVehicleListing== ", data);
      if (!data.error) {
        this.vehicleListingFromResponse = data.data.data;
        this.vehicleListing = data.data.data.map(
          item => new PrimengDropdownItem(item['id'], item['name'])
        );
      }
    })

    // Get Drivers
    this.maintenanceService.getDrivers().subscribe((data: any) => {
      if (!data.error) {
        // this.driversList = data.data.data;
        this.driversList = data.data.data.map(
          item => new PrimengDropdownItem(item['id'], item['name'])
        );
      }
    })

    // Get Maintance-Status
    this.maintenanceService.getMaintanceStatus().subscribe((data: any) => {
      if (!data.error) {
        this.maintanceStatusListing = data.data.data.map(
          item => new PrimengDropdownItem(item['id'], item['label'])
        );
      }
    })

    // Get Maintance Data
    this.getMaintanceTableData(this.filters);

    // Get MaintanceType Data
    // this.getMaintanceTypeTableData(this.filtersType);

    // Get Cards
    this.getCardsData();

    this.breadcrumbService.getValue().subscribe(res => {
      if (res && res.length) {
        this.breadcrumbInner = []
        this.breadcrumbInner = res;
        this.breadcrumbInner[0] = `${res[0]}`;
      }
    })

    if (this.breadcrumbInner[0] == 'maintenance' || this.breadcrumbInner[0] == 'admin/config') {
      setTimeout(() => {
        this.editpop.nativeElement.click();
      }, 1000);
    }

    this.min_next_maintenance_date = this.target_delivery_date;

  }
  // get f() {
  //   return this.maintainForm['controls'];
  // }

  resetFiltersExport(filters) {
    const appendExport = `order=${filters.order}&order_by=${filters.order_by}&vehicle_group_id=${filters.vehicle_group_id}&vehicle_id=${filters.vehicle_id}&maintenance_type_id=${filters.maintenance_type_id}&maintenance_id=${filters.maintenance_id}&date_filter=${filters.date_filter}&search=${filters.search}`;
    // this.downloadableLink = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + `&start_date=${filters.start_date}&end_date=${filters.end_date}` + '&customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + `&start_date=${filters.start_date}&end_date=${filters.end_date}` + '&customer_id=' + this.customerID;

    this.downloadableLink = appendExport + '&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + `&start_date=${filters.start_date}&end_date=${filters.end_date}`;
    this.downloadableLink1 = appendExport + '&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + `&start_date=${filters.start_date}&end_date=${filters.end_date}`;
  }

  selectDateRange(event, time_type) { //end_timef
    // const formValue = this.filtersForm.value;
    const selectPeriodDate = DateUtils.getUtcDateTimeStart(event);
    if (time_type == 'start') {
      this.filters.start_date = selectPeriodDate
    }
    if (time_type === 'end') {
      this.filters.end_date = selectPeriodDate
    }
    this.resetFiltersExport(this.filters); ///not sure to uncomment this or not
    this.getMaintanceTableData(this.filters);
  }

  getCardsData() {
    this.maintenanceService.getMaintanceDashboardCards().subscribe((data: any) => {
      if (!data.error) {
        this.listOfCards = data.data;
      }
    })
  }

  getMaintenanceServiceType() {
    this.maintenanceService.getServiceType().subscribe((data: any) => {
      if (!data.error) {
        this.serviceTypeList = data.data.map(
          item => new PrimengDropdownItem(item['id'], item['label'])
        );
        // console.log("serviceTypeList== ", this.serviceTypeList);
      }
    })
  }

  getMaintanceTableData(filters) {
    this.showIndeterminateProgress = true;

    let params = `offset=${filters.offset}&limit=${filters.limit}&order=${filters.order}&order_by=${filters.order_by}&vehicle_group_id=${filters.vehicle_group_id}&vehicle_id=${filters.vehicle_id}&maintenance_type_id=${filters.maintenance_type_id}&maintenance_id=${filters.maintenance_id}&date_filter=${filters.date_filter}&search=${filters.search}&export=${filters.export}&timeZone=${filters.timeZone}&start_date=${filters.start_date}&end_date=${filters.end_date}`;
    // console.log("params for getMaintanceData()= ", params);

    this.maintenanceService.getMaintanceData(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      // console.log("getMaintanceData()== ", data)
      if (!data.error) {
        this.dataSource = data.data.data;
        this.totalLength = data.data.count;
        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
      } else {

      }
    })

  }

  filterIdsFromJSON() {
    if (this.filters && this.filters['fleet_id']) {
      this.filters['fleet_id'] = this.filters['fleet_id'].id;
    }
    if (this.filters && this.filters['maintenance_status_id']) {
      this.filters['maintenance_status_id'] = this.filters['maintenance_status_id'].id;
    }
    if (this.filters && this.filters['type_id']) {
      this.filters['type_id'] = this.filters['type_id'].id;
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
  clear() {
    this.submitted = false;
    this.submittedForType = false;
    if (this.closeForm && this.closeForm.nativeElement) {
      this.closeForm.nativeElement.click();
    }
    if (this.closeTypeForm && this.closeTypeForm.nativeElement) {
      this.closeTypeForm.nativeElement.click();
    }
    this.maintainForm.reset();
    this.typeForm.reset()
    this.maintainForm.controls['auto_reminder'].setValue(false);
  }

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get('search').setValue('');
    this.searchForm.get('searchFleet').setValue('');
    this.searchForm.get('searchVehicle').setValue('');
    this.searchForm.get('searchServiceType').setValue('');
    this.searchForm.get('searchMaintenanceStatus').setValue('');
    this.filters = { offset: 0, limit: 10, vehicle_group_id: '', vehicle_id: '', maintenance_type_id: '', maintenance_id: '', order: '', order_by: '', date_filter: '', search: '', export: '', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, start_date: '', end_date: '' };
    this.getMaintanceTableData(this.filters);
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }

  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  getSelectedWidgetOption(event) {

  }

  ///////// Filter Dropdowns change /////////
  selectFleetDropDownChange(event) {
    this.filters.vehicle_group_id = event.value;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters)
  }
  selectVehicleDropDownChange(event) {
    this.filters.vehicle_id = event.value;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters)
  }
  selectFilterServiceType(event) {
    // console.log("event-- ", event.value)
    this.filters.maintenance_type_id = event.value;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters)
  }
  selectFilterMaintenaceStatus(event) {
    this.filters.maintenance_id = event.value;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters)
  }
  onSearch(formValue) {
    this.filters.search = formValue.search;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters)
  }
  changeRadioButtons(event) {
    this.filters.date_filter = event.target.value;
    if (event.target.value == "today" || event.target.value == "week" || event.target.value == "month") {
      this.filters.start_date = '';
      this.filters.end_date = '';
    }
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters);
  }
  selectPeriod(event) {
    const selectPeriodDate = DateUtils.getUtcDateTimeStart(event);
    // console.log("", selectPeriodDate);
    this.filters.date_filter = selectPeriodDate;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters);
  }

  //////////////////////////////////////////

  selectGroupDropDownChange(event) {
    // console.log("device_id== ", this.maintainForm.controls['device_id'].value)
    for (let i = 0; i < this.vehicleListingFromResponse.length; i++) {
      if (event.value == this.vehicleListingFromResponse[i].id) {
        if (this.vehicleListingFromResponse[i].fleet_name != null) {
          this.fleetDisable = false;
          this.maintainForm.controls['fleet'].setValue(this.vehicleListingFromResponse[i].fleet_name);
        } else {
          this.fleetDisable = true;
          this.maintainForm.controls['fleet'].setValue(null)
        }
        break;
      }
    }

  }

  selectServiceTypeDropDownChange(event) {
    // console.log("ServiceTypeChanged- ", event.value);
    // console.log("maintenance_type_id== ", this.maintainForm.controls['maintenance_type_id'].value)
  }

  selectDriverDropDownChange(event) {
    // console.log("event= ", event.value);
    // console.log("driver_id== ", this.maintainForm.controls['driver_id'].value)
  }
  selectMaintenaceStatusDownChange(event) {
    // console.log("event= ", event.value);
    // console.log("maintenance_status_id== ", this.maintainForm.controls['maintenance_status_id'].value)
  }

  clearForm() {
    this.enableSubmitButton();
    this.submitted = false;
    this.submittedForType = false;

    this.selectedMaintenaceId = 0;
    this.selectedTypeID = 0;
    this.maintainForm.reset();
    this.typeForm.reset();
    this.maintainForm.controls['auto_reminder'].setValue(false);
    this.formTitle = 'Add Maintenace Work Order';
    this.formTitleType = 'Add Maintenace Type';
    this.btnText = 'Save';
    this.selectedServiceType = null;
    this.selectedVehicle = null;
    this.selectedDriver = null;
    this.selectedMaintenaceStatus = null;
  }


  onSubmitMaintainance(formValue) {
    this.submitted = true;
    const targetStartDate = DateUtils.getUtcDateTimeStart(formValue.target_start_date);
    const targetDelieveryDate = DateUtils.getUtcDateTimeStart(formValue.target_delivery_date);
    const nextMaintenanceDate = DateUtils.getUtcDateTimeStart(formValue.next_maintenance_date);

    formValue['target_start_date'] = targetStartDate;
    formValue['target_delivery_date'] = targetDelieveryDate;
    formValue['next_maintenance_date'] = nextMaintenanceDate;

    if (this.validate()) {
      if (formValue.next_maintenance_date == null) {
        delete formValue.next_maintenance_date;
      }
      if (formValue.description == null) {
        delete formValue.description;
      }

      // target delievery date should not be greater than target start date check
      if (formValue['target_start_date'] > formValue['target_delivery_date']) {
        this.target_delivery_date = null;
        this.swalService.getWarningSwal('Target End Date should be greater than Target Start Date');
        return;
      }

      this.disableSubmitButton();

      if (this.selectedMaintenaceId > 0) {
        formValue['id'] = this.selectedMaintenaceId;
        this.patchMaintenaceForm(formValue);
      } else {
        this.postMaintenaceForm(formValue);
      }
    } else {
      console.log("else condition", this.errorMessages);
    }
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];

    if (this.maintainForm.get('maintenance_type_id').hasError('required')) {
      this.errorMessages.push('Service Type ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.maintainForm.get('technician_name').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Technician ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.maintainForm.get('technician_name').hasError('required')) {
      this.errorMessages.push('Technician ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.maintainForm.get('device_id').hasError('required')) {
      this.errorMessages.push('Vehicle ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.maintainForm.get('driver_id').hasError('required')) {
      this.errorMessages.push('Driver ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.maintainForm.get('maintenance_status_id').hasError('required')) {
      this.errorMessages.push('Maintenance Status ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.maintainForm.get('target_start_date').hasError('required')) {
      this.errorMessages.push('Target Delivery Start Date ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.maintainForm.get('target_delivery_date').hasError('required')) {
      this.errorMessages.push('Target Delivery Date ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    return isValid;
  }

  postMaintenaceForm(formValue) {
    this.maintenanceService.postMaintanceData(formValue).subscribe((data: any) => {
      this.enableSubmitButton();
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getMaintanceTableData(this.filters);
        this.getCardsData();
      } else {
        console.log(data.message);
        this.swalService.getErrorSwal(data.message);
      }

    })
  }

  patchMaintenaceForm(formValue) {
    this.maintenanceService.patchMaintanceData(formValue).subscribe((data: any) => {
      this.enableSubmitButton();
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.getMaintanceTableData(this.filters);
        this.getCardsData();
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
      } else {
        this.swalService.getErrorSwal(data.message);
        console.log(data.message);
      }
    })

  }

  getSelectedGraphData(data) {
    this.selectedGraph = data.graphData.id;
    if (this.selectedGraph) {
      this.loading = true;
    }
    let params = {
      id: null,
      graph_id: null,
      second_filter: false
    };
    if (data.secondaryFilter) {
      params['id'] = data.secondaryFilter.id
      params['graph_id'] = data.graphData.id
      params['second_filter'] = true
    } else {
      params['id'] = data.graphFilter.id
      params['graph_id'] = data.graphData.id
    }
    this.entityService.getEntityGraphFilterById(params).subscribe(apiResponse => {
      this.loading = false;
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.graphsArray.forEach(element => {
          if (element.type === data.graphData.type && element.id === data.graphData.id) {
            element.data = apiResponse['data'].data;
          }
        });
      } else if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    })
  }

  // getMaintenanceListing(filters) {
  //   this.showIndeterminateProgress = true;
  //   this.maintenanceService.getMaintenances(filters).subscribe(apiResponse => {
  //     if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
  //       this.showIndeterminateProgress = false;
  //       this.dataSource = apiResponse['data'].data;
  //       this.totalLength = apiResponse['data'].count;
  //       this.dataSource.sort = this.sort;
  //       this.dataSource.paginator = this.paginator;
  //     }
  //   })
  // }

  setupReport(event) {
    // const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    // const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);
    // this.filters.start_datetime = start_date;
    // this.filters.end_datetime = end_date;

    // this.getMaintenanceListing(this.filters);
    this.getMaintanceTableData(this.filters);
  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getMaintanceTableData(this.filters);
  }

  // sortDataType(event) {
  //   this.filtersType.order_by = event.active;
  //   this.filtersType.order = event.direction;
  //   this.getMaintanceTypeTableData(this.filtersType);
  // }

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getMaintanceTableData(this.filters);
  }

  // onPaginateChangeType(event) {
  //   this.filtersType.offset = (event.pageIndex * event.pageSize);
  //   this.getMaintanceTypeTableData(this.filtersType);
  // }

  disableButton(row) {
    return this.formService.disableButton(row);
  }

  editMaintenance(row) {
    this.submitted = false;
    this.selectedMaintenaceId = row.id;
    this.formTitle = 'Edit Maintenace Work Order';
    this.btnText = 'Update';
    // console.log("this.serviceTypeList-- ", this.serviceTypeList);
    for (let i = 0; i < this.serviceTypeList.length; i++) {
      if (row.maintenance_type == this.serviceTypeList[i].label) {
        // console.log("this.serviceTypeList[i]== ", this.serviceTypeList[i]);
        row.maintenance_type = this.serviceTypeList[i].label;
        this.selectedServiceType = { value: this.serviceTypeList[i].value, label: this.serviceTypeList[i].label, id: this.serviceTypeList[i].value, name: this.serviceTypeList[i].label }
      }
    }

    // console.log("this.vehicleListing-- ", this.vehicleListing);
    for (let i = 0; i < this.vehicleListing.length; i++) {
      if (row.vehicle_name == this.vehicleListing[i].label) {
        // console.log("this.vehicleListing[i]== ", this.vehicleListing[i]);
        row.vehicle_name = this.vehicleListing[i].label;
        this.selectedVehicle = { value: this.vehicleListing[i].value, label: this.vehicleListing[i].label, id: this.vehicleListing[i].value, name: this.vehicleListing[i].label }
      }
    }

    // console.log("this.driversList-- ", this.driversList);
    for (let i = 0; i < this.driversList.length; i++) {
      if (row.driver_name == this.driversList[i].label) {
        // console.log("this.driversList[i]== ", this.driversList[i]);
        row.driver_name = this.driversList[i].label;
        this.selectedDriver = { value: this.driversList[i].value, label: this.driversList[i].label, id: this.driversList[i].value, name: this.driversList[i].label }
      }
    }

    // console.log("this.maintanceStatusListing-- ", this.maintanceStatusListing);
    for (let i = 0; i < this.maintanceStatusListing.length; i++) {
      if (row.maintenance_status == this.maintanceStatusListing[i].label) {
        // console.log("this.maintanceStatusListing[i]== ", this.maintanceStatusListing[i]);
        row.maintenance_status = this.maintanceStatusListing[i].label;
        this.selectedMaintenaceStatus = { value: this.maintanceStatusListing[i].value, label: this.maintanceStatusListing[i].label, id: this.maintanceStatusListing[i].value, name: this.maintanceStatusListing[i].label }
      }
    }

    // console.log("this.vehicleListingFromResponse===", this.vehicleListingFromResponse)
    for (let i = 0; i < this.vehicleListingFromResponse.length; i++) {
      if (row?.device_id == this.vehicleListingFromResponse[i].id) {
        if (this.vehicleListingFromResponse[i].fleet_name != null) {
          this.fleetDisable = false;
          this.maintainForm.controls['fleet'].setValue(this.vehicleListingFromResponse[i].fleet_name);
        } else {
          this.fleetDisable = true;
          this.maintainForm.controls['fleet'].setValue(null)
        }
        break;
      }
    }

    this.target_start_date = row['target_start_date'] ? new Date(row['target_start_date']) : null;
    this.target_delivery_date = row['target_delivery_date'] ? new Date(row['target_delivery_date']) : null;
    this.next_maintenance_date = row['next_maintenance_date'] ? new Date(row['next_maintenance_date']) : null;

    setTimeout(() => {

      this.maintainForm.patchValue({
        maintenance_type_id: this.selectedServiceType?.value ? this.selectedServiceType.value : null,
        technician_name: row.technician_name ? row.technician_name : null,
        description: row.description ? row.description : '',
        device_id: this.selectedVehicle?.value ? this.selectedVehicle.value : null,
        driver_id: this.selectedDriver?.value ? this.selectedDriver.value : null,
        maintenance_status_id: this.selectedMaintenaceStatus?.value ? this.selectedMaintenaceStatus.value : null,
        auto_reminder: row.auto_reminder,
        target_start_date: this.target_start_date ? this.target_start_date : null,
        target_delivery_date: this.target_delivery_date ? this.target_delivery_date : null,
        next_maintenance_date: this.next_maintenance_date ? this.next_maintenance_date : null,
        // fleet:
      })

    }, 100);

    if (row['next_maintenance_date']) {
      this.min_next_maintenance_date = new Date(row['next_maintenance_date']);
    } else {
      let t = new Date(row['target_delivery_date'])
      t.setSeconds(t.getSeconds() + 86400)
      this.min_next_maintenance_date = t;
    }

    // this.openNewMaintenanceForm(row);
  }

  async showSwal(row) {
    this.selectedMaintenaceForDelete = row;
    const shouldDelete = await this.swalService.getDeleteSwal(row, 'What do you want to do with this record?');

    if (shouldDelete) {
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.deleteMaintenace(row.id, shouldDelete, 'Record has been' + message +
        'successfully');
    }
  }

  deleteMaintenace(id, actionType, message?) {
    // const params = {};
    // params['id'] = id;
    // params['status'] = actionType;

    this.maintenanceService.deleteMaintenace(id).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        console.log("deleted Successfully")
        this.getMaintanceTableData(this.filters)
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getCardsData();
      } else {
        console.log("unanle to delete")
        this.swalService.getErrorSwal(data.message);
        console.log(data.message);
      }
    })
  }

  openNewMaintenanceForm(obj?) {
    const initialState = {
      formTitle: 'Create Maintenance',
    };
    if (obj) {
      initialState['formTitle'] = 'Edit Maintenance';
      initialState['preFilledData'] = obj;
    }


    this.bsModalRef = this.modalService.show(AdminMaintenanceFormComponent, {
      class: 'modal-center modal-success modal-lg',
      initialState,
      ignoreBackdropClick: false
    });


    this.bsModalRef.content.submitForm.subscribe((value) => {
      if (value) {
        // this.getMaintenances();
        // this.calculateWeekMaintenanceStatus();
        // this.getTruckMaintenanceSummary();
        // this.getMaintenanceTypeStats(this.maintenanceTypeDateRange[0], this.maintenanceTypeDateRange[1]);
        // this.getMaintenanceStatusStats(this.maintenanceStatusDateRange[0], this.maintenanceStatusDateRange[1], true);
        // this.refreshSummary.emit();
      }
    });
  }

  deleteMaintenaceType(id, actionType, message?) {
    // const params = {};
    // params['id'] = id;
    // params['status'] = actionType;
    this.maintenanceService.deleteMaintenaceType(id).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        // this.getMaintanceTypeTableData(this.filtersType);
        this.closeTypeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getMaintenanceServiceType();
        this.getCardsData();
      } else {
        this.swalService.getErrorSwal(data.message);
        // console.log(data.message);
      }
    })
  }

  TargetDeliveryDateChanged() {
    this.maintainForm.controls.next_maintenance_date.setValue(null);


    let t = new Date(this.target_delivery_date)
    t.setSeconds(t.getSeconds() + 86400)
    this.min_next_maintenance_date = t;
  }

  restrictDate(nextTargetDate) {
    let t = new Date(nextTargetDate);
    t.setSeconds(t.getSeconds() + 86400);
    return t;//nextTargetDate;
  }

  downloadXLS(download) {
    this.maintenanceService.downloadXLS(download).subscribe((apiResponse: any) => {
      console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      window.open(url);
    })
  }

  downloadPDF(download1) {
    this.maintenanceService.downloadPDF(download1).subscribe((apiResponse: any) => {
      console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    })
  }

}

