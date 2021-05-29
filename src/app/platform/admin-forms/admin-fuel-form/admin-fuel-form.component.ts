import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from 'src/app/core/custom.validator';
import { isNullOrUndefined } from 'util';
import swal from 'sweetalert2';
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
import { HttpController } from 'src/app/core/services/loading-controller';
import { TestApiResponse, LoginApiResponse, ApiResponseNew, ApiResponse } from 'src/app/core/model/api.response';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { ErrorMessage } from '../../error-message';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../../services/xls-pdf.service';

@Component({
  selector: 'app-admin-fuel-form',
  templateUrl: './admin-fuel-form.component.html',
  styleUrls: ['./admin-fuel-form.component.css']
})
export class AdminFuelFormComponent implements OnInit, OnDestroy {
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
  downloadableLink: string;
  downloadableLink1: string;

  loggedInUser;
  customerID;
  isNullOrUndefined = isNullOrUndefined;
  bsValue: any = null;
  maxDate = new Date();
  truckForm: FormGroup;
  purchaseTypes = [];
  truckTypes = [];
  deviceTypesFuel = [];
  territoriesList = [];
  errorMessages: string[];
  selectedTruck: any;
  trucks;//: TruckResponse[];
  temp: any[] = [];
  inputValue = '';

  startDateTime: Date;
  selectedRows = [];

  btnLoading: boolean;
  btnText: string;

  @ViewChild('closeForm') private closeForm;
  currentYear = new Date().getFullYear();
  currentDate = new Date();
  minYear = 1950;
  formTitle = 'Add FuelFillup';

  namePattern = '^[A-Za-z]+$';
  isAuthorized = false;

  hashMap: any = {};
  selectedPurchase;
  truckType;
  image;
  csvRows = [];
  private csvCols = [
    { field: 'device', header: 'Vehicle No' },
    { field: 'fuel_filled', header: 'Fuel Filled' },
    { field: 'location', header: 'Location' },
    { field: 'amount_paid', header: 'Amount Paid' },
    { field: 'payment_method', header: 'Payment Method' },
    { field: 'driver_name', header: 'Driver Name' },
    { field: 'fuel_supervisor_name', header: 'Supervisor Name' },
    { field: 'fill_up_date', header: 'Fillup Datetime' },
  ];

  theme;
  customerDevices: any;
  sidebarCheck;

  //Added by wahab
  add_btn = 0;
  // filtersFuel = { limit: 10, offset: 0, order_by: '', order: '' };
  filtersFuel = { limit: 10, offset: 0, order_by: '', order: '', search: '' };
  filtersFuelReporting = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '', end_datetime: '' };
  searchForm: FormGroup;
  displayedFuelList = ['device_name', 'fuel_filled', 'location', 'amount_paid', 'payment_method_name', 'driver_name', 'fuel_supervisor_name', 'fill_up_date', 'actions'];
  displayedFuelReporting = ['fill_up_date', 'fuel_filled', 'amount_paid', 'payment_method_name', 'location', 'fuel_supervisor_name'];
  totalFuelLength = 0;
  totalFuelReportingLength = 0;
  @ViewChild('fuelListPaginator') fuelListPaginator: MatPaginator;
  @ViewChild('fuelReportingPaginator') fuelReportingPaginator: MatPaginator;
  fuelReporting;
  submitted: boolean;

  keyUp = new Subject<KeyboardEvent>();
  searchText;
  constructor(public formBuilder: FormBuilder,
    public truckService: TruckService,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private swalService: SwalService,
    private datatableService: DatatableService,
    private formService: FormService,
    private brandingService: BrandingService,
    public router: Router,
    private drawerService: DrawerService,
    private xlsPdfService:XlsPdfService) {

    this.searchForm = this.formBuilder.group({
      search: ['']
    })

    this.truckForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      device: [null, [Validators.required]],
      payment_method: [null, [Validators.required]],
      amount_paid: ['', [Validators.required]],
      driver_name: ['', [Validators.required, CustomValidators.isAlphabetsAndSpace]],
      fuel_filled: ['', [Validators.required]],
      device_name: ['', [Validators.required]],
      location: ['', [Validators.required]],
      fuel_supervisor_name: ['', [Validators.required, CustomValidators.isAlphabetsAndSpace]],
      fill_up_date: [null, [Validators.required]]
    });

    this.theme = this.brandingService.styleObject();
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
    this.add_btn = 0;
    // // console.log("EntityType.FUEL= ", EntityType.FUEL)
    this.getTrucks(this.filtersFuel);
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

        if (this.add_btn == 0) {
          this.filtersFuel.search = this.searchForm.get('search').value;
          this.getTrucks(this.filtersFuel);
        } else if (this.add_btn == 1) {
          this.filtersFuel.search = this.searchForm.get('search').value;
          this.getFuelReporting(this.filtersFuel);
        }
      }
    });

    // this.downloadableLink = environment.baseUrl + '/iof/FuelListexport1/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;
    // this.downloadableLink1 = environment.baseUrl + '/iof/FuelListexport2/?time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '&customer_id=' + this.customerID;

    this.downloadableLink = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
    this.downloadableLink1 = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;

  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }


  getTrucks(filters): void {
    this.showIndeterminateProgress = true;
    // let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}`;
    let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search=${filters.search}`;

    this.formService.getEntitiesFuel(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (data.status === HttpStatusCodeEnum.Success) {
        this.trucks = data['data'].data;
        this.trucks.paginator = this.fuelListPaginator;
        this.totalFuelLength = data['data'].count;
        // // console.log(this.trucks);
      } else {
        // console.log("Failed to getEntitiesFuel")
      }

    })
  }
  onPaginateFuel(event) {
    this.filtersFuel.offset = (event.pageIndex * event.pageSize);
    this.getTrucks(this.filtersFuel);
  }
  sortFuelList(event) {
    this.filtersFuel.order_by = event.active;
    this.filtersFuel.order = event.direction;
    this.getTrucks(this.filtersFuel);
  }

  populateHashmap(list) {
    for (const entry of list) {
      this.hashMap[entry.id] = false;
    }
    // // console.log('hashmap', this.hashMap);
  }
  getprogress(area) {
    return this.hashMap[area.id];
  }

  getDropDownData(value) {
    this.formService.getBinsData('get_entity_dropdown', { customer: this.authService.getUser().customer.id, entity: EntityType.TERRITORY })
      .subscribe((data: any) => {
        // // console.log("getBinsData() response-- ", data.response);

        if (data.status === HttpStatusCodeEnum.Success) {
          this.territoriesList = data.response.map(
            item => new DropDownItem(item['id'], item['label'])
          );
        } else {
          // console.log(data.message);
        }

      })

    this.truckService.getCustomerDevicesFuelFilup({ type_id: EntityType.TRUCK }).subscribe((data: any) => {
      // // console.log('getCustomerDevicesFuel()- ', data.response);
      if (data.status === HttpStatusCodeEnum.Success) {
        this.customerDevices = data.response;
        if (!(value === null)) {
          this.customerDevices.push(value);
        }
      } else {
        // console.log(data.message);
      }
      // // console.log("this.customerDevices[]= ", this.customerDevices)
    })

    this.truckService.getPurchaseTypes({ option_key: 'payment_method' }).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.purchaseTypes = data.response['option_values'];
      } else {
        // console.log(data.message);
      }
    })

    this.truckService.getPurchaseTypes({ option_key: 'trucktypes' }).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.truckTypes = data.response['option_values'];
      } else {
        // console.log(data.message);
      }
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
      if (!isNullOrUndefined(formValue['payment_method'])) { formValue['payment_method'] = this.selectedPurchase; }
      if (!isNullOrUndefined(formValue['device'] && this.selectedDevice)) { formValue['device'] = this.selectedDevice; }

      this.disableSubmitButton();

      const start_date = DateUtils.getUtcDateTimeStart(formValue['fill_up_date']);
      formValue['fill_up_date'] = start_date

      if (isNullOrUndefined(id)) {
        this.postTrucks(formValue);
      } else {
        this.patchTruck(formValue);
      }
    } else {
      // console.log("FORM is invalid", this.errorMessages);
    }
  }
  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.truckForm.get('device').hasError('required')) {
      this.errorMessages.push('Device ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('payment_method').hasError('required')) {
      this.errorMessages.push('Payment Method ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('fuel_filled').hasError('required')) {
      this.errorMessages.push('Fuel Filled ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('amount_paid').hasError('required')) {
      this.errorMessages.push('Amount Paid ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('driver_name').hasError('required')) {
      this.errorMessages.push('Driver Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('driver_name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Driver Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('location').hasError('required')) {
      this.errorMessages.push('Location ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('fuel_supervisor_name').hasError('required')) {
      this.errorMessages.push('Supervisor Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('fuel_supervisor_name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages.push('Supervisor Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.truckForm.get('fill_up_date').hasError('required')) {
      this.errorMessages.push('Fillup Dare' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    return isValid;
  }

  openEditModal2(row) {
    if (row.image) {
      this.image = row.image;
    } else {
      this.image = "../../../assets/images/Fuel form.png";
    }
  }

  postTrucks(formValue): void {
    formValue['type'] = EntityType.TRUCK;

    this.formService.postDataFuel(formValue).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.enableSubmitButton();
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getTrucks(this.filtersFuel);
      } else {
        this.enableSubmitButton();
        this.swalService.getErrorSwal(data.message);
      }

    });

  }
  inactiveRecord;
  clearForm() {
    this.formTitle = 'Add FuelFillup';
    this.btnText = "Save";
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.truckForm.reset();
    this.submitted = false;
    this.selectedDevice = null;
    this.getDropDownData(null);
  }

  selectedTerri: string[] = [];
  openEditModal(truck) {
    this.formTitle = 'Update FuelFillup';
    this.btnText = "Update";
    // this.enableSubmitButton();
    this.inactiveRecord = this.disableButton(truck);

    this.selectedDevice = truck.device;
    this.truckForm.patchValue({
      name: truck.device_name,
      id: truck.device,
      device: truck.device,
      payment_method: truck.payment_method,
      fuel_filled: truck.fuel_filled,
      amount_paid: Number(truck.amount_paid),
      driver_name: truck.driver_name,
      location: truck.location,
      fuel_supervisor_name: truck.fuel_supervisor_name,
      fill_up_date: new Date(truck.fill_up_date)
    }, { emitEvent: false });
    this.selectedTruck = truck;
    if (this.inactiveRecord) {
      // this.truckForm.patchValue({ device: null });
    }
  }

  openImageModal(truck) {
    this.selectedTruck = truck;
  }

  patchTruck(truck) {
    truck['id'] = Number(this.selectedTruck.id);
    truck['type'] = EntityType.TRUCK;

    this.formService.patchFuelData(truck).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal(data.message);
        this.getTrucks(this.filtersFuel);
      } else {
        this.enableSubmitButton();
        this.swalService.getErrorSwal(data.message);
      }
    })
  }

  async showDeleteConfirmation(row) {
    const response = await this.swalService.getConfirmSwal();

    if (response == true) {
      this.deleteTruck(row.id, response);
    }
  }

  async showSwal(truck) {
    this.hashMap[truck.id] = true;
    this.formService.deleteDataCheckFuel({ 'id': [truck.id] }).subscribe((data: any) => {

      if (data.status === HttpStatusCodeEnum.Success) {
        this.hashMap[truck.id] = false;
        // const shouldDeleteOrInactive = await this.swalService.getDeleteSwal(truck);
        // if (shouldDeleteOrInactive) {
        //   const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
        //   this.deleteTruck([truck.id], shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', truck.type);
        // }
      } else {
        this.hashMap[truck.id] = false;
        this.swalService.getErrorSwal(data.message);
      }
    })

  }
  onClearSearch() {
    this.searchForm.reset();
    this.filtersFuel.search = '';
    this.getTrucks(this.filtersFuel);
    this.getFuelReporting(this.filtersFuelReporting);
    this.downloadableLink =  '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
    this.downloadableLink1 =  '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone ;
  }

  deleteTruck(truckId, actionType) {
    // const params = {};
    // params['id_list'] = (truckId);
    // params['status'] = actionType;

    this.formService.deleteDataFuel(truckId).subscribe((data: any) => {
      // // console.log("deleteDataFuel()-- ", data.response);
      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal("Record deleted successfully");
        this.inputValue = '';
        this.selectedRows = [];
        this.getTrucks(this.filtersFuel);
      } else {
        this.swalService.getErrorSwal(data.message);
      }
    })
  }


  updateFilter(event) {
    this.filtersFuel.search = event;
    this.downloadableLink = 'search=' + event + '&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = 'search=' + event + '&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    // this.trucks = this.datatableService.updateFilter(event.target.value, this.temp);
    this.getTrucks(this.filtersFuel);
    this.getFuelReporting(this.filtersFuelReporting);
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


  activeTabFuction(index) {
    this.add_btn = index.index;
    // console.log("this.add_btn== ", this.add_btn);
  }

  onSearch(formValue) {

  }

  setupReport(event) {
    const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);
    this.filtersFuelReporting.start_datetime = start_date;
    this.filtersFuelReporting.end_datetime = end_date;
    this.getFuelReporting(this.filtersFuelReporting);
  }

  getFuelReporting(filters) {
    this.showIndeterminateProgress = true;
    let params = `limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&start_datetime=${filters.start_datetime}&end_datetime=${filters.end_datetime}&search=${filters.search}`;

    this.truckService.getFillupsReportTab(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;

      if (data.status === HttpStatusCodeEnum.Success) {
        this.fuelReporting = data['data'].data;
        this.fuelReporting.paginator = this.fuelReportingPaginator;
        this.totalFuelReportingLength = data['data'].count;
      } else {
        // console.log("Failed to getEntitiesFuel")
      }

    });

  }

  onPaginateFuelReporting(event) {
    this.filtersFuelReporting.offset = (event.pageIndex * event.pageSize);
    this.getFuelReporting(this.filtersFuelReporting);
  }

  sortFuelReporting(event) {
    this.filtersFuelReporting.order_by = event.active;
    this.filtersFuelReporting.order = event.direction;
    this.getFuelReporting(this.filtersFuelReporting);
  }


  // private getFillupReport(start_date, end_date) {

  //   this.truckService.getFillupsReport(params).subscribe((data) => {
  //     const locations = [];
  //           const ids = [];
  //           let info = '';
  //           if (data.status === HttpStatusCodeEnum.Success) {
  //             const response = ((data.response[0]['fillups']));
  //             // // console.log(response);
  //             let fields = [];
  //             if (response && response.length) {
  //               response.forEach(element => {
  //                 fields.push(element.fields);
  //               });
  //             }
  //             this.fillups = fields;
  //             this.fillupCardStats.emit((data.response[0]['fillups_stats']))

  //             if (response.length) {
  //               for (let i = 0; i < response.length; i++) {
  //                 if (!isNullOrUndefined(response[i].lat) && !isNullOrUndefined(response[i].long)) {
  //                   locations.push(response[i].lat + ',' + response[i].long);
  //                   info = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
  //                     '<tbody>';
  //                   const local = moment.utc(response[i].timestamp).local().format('MMM, DD, YYYY, hh:mm:ss A');

  //                   info += `<tr><th><b> ${'Timestamp'} </b> </th><td class="text-left">${local}</td> </tr>`;
  //                   info += `<tr><th><b>${'Fuel Before'}</b> </th><td class="text-left">${response[i].pre_volume + ' gal'}</td> </tr>`;
  //                   info += `<tr><th><b> ${'Fuel After'} </b></th><td class="text-left">${response[i].post_volume + ' gal'}</td> </tr>`;
  //                   info += `<tr><th><b> ${'Fuel Filled'}</b> </th><td class="text-left">${response[i].volume_consumed + ' gal'}</td> </tr>`;

  //                   info += '</tbody> </table>';
  //                 }

  //                 this.violationInfoWindows.push(info);
  //                 if (!isNullOrUndefined(response[i].lat && !isNullOrUndefined(response[i].long))) {

  //                   this.violationMarkers.push({
  //                     latitude: response[i].lat,
  //                     longitude: response[i].long,
  //                     icon: 'assets/images/iol/icon-map-fillup.png'
  //                   });
  //                 }
  //               }
  //             } else {
  //               this.violationMarkers = [];
  //             }
  //             // this.fMap.createDummyMarkers(this.violationMarkers, this.violationInfoWindows);
  //             // this.fillupCluster = this.fMap.createCluster(locations, this.violationInfoWindows, 'assets/images/iol/icon-map-fillup.png');


  //           }
  //           if (data.status === HttpStatusCodeEnum.Error) {
  //             this.swalService.getErrorSwal(data.message);
  //           }
  //   });
  // }

  downloadXLS(download) {
    this.truckService.downloadXLS(download).subscribe((apiResponse: any) => {
      // console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Fuel Fillup Report.xls')
    })
  }

  downloadPDF(download1) {
    this.truckService.downloadPDF(download1).subscribe((apiResponse: any) => {
      // console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.xlsPdfService.downloadXlsPdf(url,'Fuel Fillup Report.pdf')
    })
  }




}
