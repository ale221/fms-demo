import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { isNullOrUndefined } from 'util';
import { BrandingService } from '../../shared/services/branding.service';
import { AppLoader } from '../../data/model/app-loader';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { TruckResponse } from '../../data/response/entity-response';
import { TruckService } from '../../services/truck.service';
import { GotoPageService } from '../../services/goto-page.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { DatatableService } from '../../services/datatable.service';
import { FormService } from '../../services/FormService';
import { CustomValidators } from 'src/app/core/custom.validator';
import { HttpController } from 'src/app/core/services/loading-controller';
import { TestApiResponse, ApiResponse, ApiResponseNew } from 'src/app/core/model/api.response';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { ErrorMessage } from '../../error-message';
import { MatPaginator } from '@angular/material/paginator';
import { DropdownItem } from 'primeng';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';

@Component({
  selector: 'app-admin-tool-form',
  templateUrl: './admin-tool-form.component.html',
  styleUrls: ['./admin-tool-form.component.css']
})

export class AdminToolFormComponent implements OnInit, OnDestroy {
  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  public appLoader = new AppLoader();

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;

  EntityType = EntityType;
  EntityStatusEnum = EntityStatusEnum;
  settings = {
    singleSelection: true,
    text: 'Select an Option',
    enableSearchFilter: false,
    showCheckbox: false
  };

  isAuthorized = false;
  isNullOrUndefined = isNullOrUndefined;
  bsValue: any = null;
  maxDate = new Date();
  truckForm: FormGroup;
  purchaseTypes = [];
  truckTypes = [];
  customerDevices = [];
  territoriesList = [];
  errorMessages: string[];
  selectedTruck: any;
  trucks;//: TruckResponse[];
  temp: any[] = [];
  inputValue = '';
  partner_id: any;
  startDateTime: Date;
  // leased_owned: any;
  selectedRows = [];
  itemListTrucks = [];

  btnLoading: boolean;
  btnText: string;

  @ViewChild('closeForm') private closeForm;
  currentYear = new Date().getFullYear();
  minYear = 1950;
  formTitle = 'Add Tool';
  namePattern = '^[A-Za-z]+$';
  hashMap: any = {};
  selectedPurchase;
  truckType;
  theme;
  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;
  csvRows = [];
  private csvCols = [
    { field: 'name', header: 'Name' },
    { field: 'entity_sub_type_name', header: 'Type' },
    { field: 'leased_owned', header: 'Leased/Owned' },
    { field: 'registration', header: 'Registration' },
    { field: 'volume_capacity (ltr)', header: 'tool Tank Capacity' },
    { field: 'wheels', header: 'Wheels' },
    { field: 'date_commissioned', header: 'Date Commissioned' },
  ];

  // Added by wahab
  searchForm: FormGroup;
  filterTool = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search: '' };
  displayedToolList = ["reg_number", "name", "cnic", "make", "model", "created_datetime", "actions"];
  @ViewChild('toolListPaginator') toolListPaginator: MatPaginator;
  totalToolLength = 0;
  submitted: boolean;
  user;
  user_id;

  keyUp = new Subject<KeyboardEvent>();
  searchText;
  sidebarCheck: any;
  constructor(public formBuilder: FormBuilder,
    public truckService: TruckService,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private swalService: SwalService,
    private datatableService: DatatableService,
    private formService: FormService,
    private brandingService: BrandingService,
    public router: Router,
    private activated_route: ActivatedRoute,
    private drawerService: DrawerService,
    private xlsPdfService: XlsPdfService) {

    this.searchForm = this.formBuilder.group({
      search: ['']
    })

    this.truckForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      make: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      model: ['', [Validators.required]], // CustomValidators.isAlphabetsAndNumbers
      cnic: ['', [Validators.required, CustomValidators.isNumbers]],
      truck: [null, [Validators.required]]
    });

    this.theme = this.brandingService.styleObject();
    this.user = JSON.parse(localStorage.getItem('user'));
    this.user_id = this.user['id'];

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
    this.getTrucks(this.filterTool);
    this.getDropDownData(null);

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
        // console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
        this.filterTool.search = this.searchForm.get('search').value;
        this.getTrucks(this.filterTool);
      }
    });

    

    // this.downloadableLink = environment.baseUrl + '/iof/tool1/?customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/tool2/?customer_id=' + this.customerID;

    this.downloadableLink = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
    this.downloadableLink1 = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }

  // Populate Form
  getTrucks(filterTool): void {
    this.inputValue = "";
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.trucks = [];

    // let params = `type_id=${filterTool.type_id}&limit=${filterTool.limit}&offset=${filterTool.offset}&order=${filterTool.order}&order_by=${filterTool.order_by}`;

    let params = `type_id=${filterTool.type_id}&limit=${filterTool.limit}&offset=${filterTool.offset}&order=${filterTool.order}&order_by=${filterTool.order_by}&search=${filterTool.search}`;

    // console.log("params for tool listing--", params);

    this.formService.getEntitiesTool(params).subscribe((data: any) => {   //{type_id: EntityType.IMEI_DEVICE, index_a: 0, index_b: 100}
      // console.log("getEntities()= ", data);
      if (data.status === HttpStatusCodeEnum.Success) {
        this.searchPlaceHolder = 'Search';
        this.enableSearch = false;
        this.showIndeterminateProgress = false;
        this.csvRows = this.trucks;

        // this.results_remaining = data.remaining;
        // this.trucks = [...this.context.trucks, ...apiResponse.response];
        this.trucks = data['data'].data[0];

        // console.log("trucks------ ", this.trucks)

        this.totalToolLength = data['data'].count;
        this.trucks.pagination = this.totalToolLength;
        // this.populateHashmap(data.response);
        // this.temp = data.response;
        // console.log("this.trucks---- ", this.trucks)
        // console.log("this.trucks.length---- ", this.trucks.length)
      } else {
        this.swalService.getErrorSwal(data.message);
        this.trucks.pagination = 0;
        this.totalToolLength = 0;
        this.showIndeterminateProgress = false;
      }
    })
  }

  populateHashmap(list) {
    for (const entry of list) {
      this.hashMap[entry.id] = false;
    }
    // console.log('hashmap', this.hashMap);
  }

  getprogress(area) {
    return this.hashMap[area.id];
  }

  getDropDownData(value) {
    this.formService.getData('animal_dropdown', { customer: 1, entity: 'Truck' })
      .subscribe((data: any) => {
        // console.log("getData() response= ", data);

        // if (data.status === HttpStatusCodeEnum.Success) {

        // this.itemListTrucks = data.response.map(
        //   item => new DropDownItem(item['id'], item['label'])
        // );

        this.itemListTrucks = data.response.map(function (obj) {
          return { id: obj.id, name: obj.label };
        });

        // }
        // console.log("this.itemListTrucks-- ", this.itemListTrucks);
      })
  }

  setVehicleDropdown(truck) {
    // console.log("kop", truck)
    this.itemListTrucks = [];

    this.formService.getData('animal_dropdown', { customer: 1, entity: 'Truck' })
      .subscribe((data: any) => {
        // // console.log("getData() response= ", data);

        this.itemListTrucks = data.response.map(function (obj) {
          return { id: obj.id, name: obj.label };
        });

        // console.log("itemListTrucks after api call = ", this.itemListTrucks)

        if (truck != null) {
          // console.log("setting vehicle value= ", truck.id, truck.name);
          this.itemListTrucks.unshift({ id: truck.id, name: truck.name })
          this.selectedDevice = { id: truck.id, name: truck.name }
        } else {
          // console.log("Sorry....")
        }

        // // console.log("this.itemListTrucks-- ", this.itemListTrucks);
      })
  }

  getParams(eDate) {
    let params = null;
    params = {
      end_datetime: DateUtils.getYYYYMMDD(eDate.toString())
    };
    params.end_datetime = DateUtils.getYYYYMMDD(params.end_datetime);
    return params;
  }

  disableButton(row) {
    return this.formService.disableButton(row);
  }

  selectedDevice: any;
  threshold_required: boolean;
  //Submit Form
  onSubmit(formValue: Object) {
    this.submitted = true;

    if (this.validate()) {
      const id = this.truckForm.getRawValue().id;

      if (!isNullOrUndefined(formValue['truck'] && this.selectedDevice)) { formValue['truck'] = this.selectedDevice.id; }

      this.disableSubmitButton();
      // console.log('form', formValue);
      if (isNullOrUndefined(id)) {
        this.postTrucks(formValue);
      } else {
        // console.log("ID of selected tool= ", id);
        this.patchTruck(formValue, id);
      }
    } else {
      // console.log(this.errorMessages);
    }
  }
  onClearSearch() {
    this.searchForm.reset();
    this.filterTool.search = '';
    this.getTrucks(this.filterTool);
    this.downloadableLink = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
    this.downloadableLink1 = 'order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.truckForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('name').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.truckForm.get('cnic').hasError('required')) {
      this.errorMessages.push('SIM ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('cnic').hasError('isNumbers')) {
      this.errorMessages.push('SIM ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('make').hasError('required')) {
      this.errorMessages.push('Make ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('make').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Make ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.truckForm.get('model').hasError('required')) {
      this.errorMessages.push('Model ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('truck').hasError('required')) {
      this.errorMessages.push('Truck ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    return isValid;
  }

  postTrucks(formValue): void {
    formValue['type'] = EntityType.IMEI_DEVICE;
    formValue['modified_by'] = this.user_id;
    this.formService.postData(formValue)
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          // this.enableSubmitButton();
          this.submitted = false;
          this.closeForm.nativeElement.click();
          this.truckForm.reset();
          this.swalService.getSuccessSwal("Record added successfuly"); //
          this.getTrucks(this.filterTool);
        } else {
          // this.enableSubmitButton();
          this.submitted = false;
          // // console.log("in");
          this.closeForm.nativeElement.click();
          this.truckForm.reset();
          this.swalService.getErrorSwal(data.message);
          // this.swalService.getErrorSwal(data.message);
        }

      })

  }

  inactiveRecord;
  clearForm() {
    this.formTitle = 'Add Tool';
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.truckForm.reset();
    this.selectedDevice = null;
    this.getDropDownData(null);
  }

  selectedTerri: string[] = [];
  openEditModal(truck) {
    // console.log(truck);
    // // console.log("this.itemListTrucks (before unshift)= ", this.itemListTrucks);
    this.formTitle = 'Update Tool';
    this.btnText = "Update";
    this.inactiveRecord = this.disableButton(truck);

    this.setVehicleDropdown(truck.truck)

    // console.log("this.itemListTrucks (after unshift)= ", this.itemListTrucks);
    // // console.log("this.selectedDevice=== ", this.selectedDevice)

    this.truckForm.patchValue({
      id: truck.id || {},
      name: truck.name || {},
      cnic: truck.cnic || {},
      make: truck.make || {},
      model: truck.model || {},
      truck: truck.id || {}
    }, { emitEvent: false });

    this.selectedTruck = truck;

    if (this.inactiveRecord) {
      this.truckForm.patchValue({ truck: null });
    }

    this.checkValidity();
  }

  patchTruck(truck, id) {
    // truck['id'] = String(this.selectedTruck.id);
    truck['type'] = EntityType.IMEI_DEVICE;

    truck['modified_by'] = this.user_id;
    // console.log("patchtruck", truck['modified_by']);
    // truck['status'] =

    this.formService.patchToolData(truck, id)
      .subscribe((data: any) => {
        // this.enableSubmitButton();
        if (data.status === HttpStatusCodeEnum.Success) {
          this.submitted = false;
          this.closeForm.nativeElement.click();
          this.truckForm.reset();
          this.swalService.getSuccessSwal("Record updated successfully"); //data.message
          this.getTrucks(this.filterTool);
        } else {
          // this.enableSubmitButton();
          this.submitted = false;
          // console.log("in");
          this.closeForm.nativeElement.click();
          this.truckForm.reset();
          this.swalService.getErrorSwal("Unable to update record");
          this.swalService.getErrorSwal(data.message);
        }
      })
  }

  async showDeleteConfirmation(row) {
    const response = await this.swalService.getConfirmSwal();
    if (response == true) {
      // console.log("call delete fuction()")
      this.deleteTool(row);
    }
  }

  deleteTool(id) {
    this.showIndeterminateProgress = true;

    this.formService.deleteData(id)
      .subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal("Record deleted successfully");
          this.inputValue = '';
          this.getTrucks(this.filterTool);
        } else {
          this.swalService.getErrorSwal("Unable to deleted record")
        }
      })
  }

  showSwal(truck) {
    this.hashMap[truck.id] = true;
    this.formService.deleteDataCheck({ 'id_list': [truck.id] })
      .subscribe((data: any) => {


        if (data.status === HttpStatusCodeEnum.Success) {
          this.submitted = false;
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal(data.message);
          this.getTrucks(this.filterTool);
        } else {
          // this.enableSubmitButton();
          this.swalService.getErrorSwal(data.message);
        }
        // onComplete(): void {
        // }

        // onError(errorMessage: string, err: any) {
        //   // do
        //   // console.log(errorMessage);
        //   this.context.hashMap[truck.id] = false;
        //   this.context.swalService.getErrorSwal(errorMessage);
        // }

        // async onNext(apiResponse: ApiResponseNew<any>) {
        //   // console.log(apiResponse);
        //   this.context.hashMap[truck.id] = false;
        //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
        //     const shouldDeleteOrInactive = await this.context.swalService.getDeleteSwal(truck);
        //     if (shouldDeleteOrInactive) {
        //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
        //       this.context.deleteTruck([truck.id], shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', truck.type);
        //     }
        //   } else if (apiResponse.status === HttpStatusCodeEnum.Bad_Request) {
        //     const shouldDeleteOrInactive = await this.context.swalService.getDeleteSwal(truck, apiResponse.message);
        //     if (shouldDeleteOrInactive) {
        //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
        //       this.context.deleteTruck([truck.id], shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', truck.type);
        //     }
        //   } else {
        //     this.context.swalService.getErrorSwal(apiResponse.message);
        //   }
        // }

      }
      );

  }

  deleteTruck(truckId, actionType, message?) {
    const params = {};
    params['id_list'] = (truckId);
    params['status'] = actionType;

    this.formService.deleteData(params)
      .subscribe((data: any) => {

        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(data.message);
          this.inputValue = '';
          this.selectedRows = [];
          this.getTrucks(this.filterTool);
        } else {
          this.swalService.getErrorSwal(data.message)
        }
      })

  }


  updateFilter(event) {
    // this.filterTool.search = event;
    // this.getTrucks(this.filterTool);
  }

  onSearch(formValue) {
    // console.log("inside onsearch function-- ", formValue);

    this.searchText = formValue.search;
    if (this.searchText.length > 0 || this.searchText.length === 0) {

      this.searchForm.get("search").setValue(this.searchText);
      // console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
      this.filterTool.search = this.searchForm.get('search').value;
      this.getTrucks(this.filterTool);

      this.downloadableLink =  'search=' + this.filterTool.search + '&order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone  ;
      this.downloadableLink1 = 'search=' + this.filterTool.search + '&order=&order_by=&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone  ;

    }
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }

  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }

  checkValidity() {
    const invalid = [];
    const controls = this.truckForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    // // console.log(invalid);
  }

  onPaginateTool(event) {
    this.filterTool.offset = (event.pageIndex * event.pageSize);
    this.getTrucks(this.filterTool);
  }
  sortFuelList(event) {
    this.filterTool.order_by = event.active;
    this.filterTool.order = event.direction;
    this.getTrucks(this.filterTool);
  }

  downloadXLS(download) {
    this.formService.downloadXLSTool(download).subscribe((apiResponse: any) => {
      // console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Tools Report.xls')
    })
  }

  downloadPDF(download1) {
    this.formService.downloadPDFTool(download1).subscribe((apiResponse: any) => {
      // console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.xlsPdfService.downloadXlsPdf(url,'Tools Report.pdf')
    })
  }


}
