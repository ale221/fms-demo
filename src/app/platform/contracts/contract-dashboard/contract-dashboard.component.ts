import {Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import {ResizeDatatableService} from '../../shared/resize-datatable.service';
import {format, getDate, getDay, getMonth} from 'date-fns';
import swal from 'sweetalert2';
import { BrandingService } from '../../shared/services/branding.service';
import { AppLoader } from '../../data/model/app-loader';
import { EntityStatusEnum, EntityType } from 'src/app/core/enum/entity-type.enum';
import { FormService } from '../../services/FormService';
import { EntityService } from '../../services/entity.service';
import { DatatableService } from '../../services/datatable.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { TruckService } from '../../services/truck.service';
import { HttpController } from 'src/app/core/services/loading-controller';
import { LoginApiResponse, TestApiResponse } from 'src/app/core/model/api.response';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { DropDownItem } from '../../data/model/dropdown-item';
import { ReportResponse } from '../../model/reportResponse';

@Component({
  selector: 'app-contract-dashboard',
  templateUrl: './contract-dashboard.component.html',
  styleUrls: ['./contract-dashboard.component.css']
})
export class ContractDashboardComponent implements OnInit, OnDestroy {


  searchPlaceHolderContracts: string;
  searchPlaceHolderExpiring: string;
  searchPlaceHolderExpiringInThreeMonths: string;
  searchPlaceHolderExpired: string;
  searchPlaceHolderDeactivated: string;
  searchPlaceHolderRenewed: string;
  searchPlaceHolderNew: string;
  optimizedCall: any;
  optimizedCallexpiring: any;
  optimizedCallexpired: any;
  optimizedCalldeactivated: any;
  optimizedCallrenewal: any;
  optimizedCallnew: any;
  contracts = [];
  expiring = [];
  expiringInThreeMonths = [];
  expired = [];
  deactivated = [];
  renewed = [];
  newcontracts = [];
  activeContracts = [];

  tempActiveContracts = [];
  tempcontracts = [];
  tempexpiring = [];
  tempExpiringInThreeMonths = [];
  tempexpired = [];
  tempdeactivated = [];
  temprenewed = [];
  tempnew = [];

  results_remaining = false;

  files_list = [];
  renewalDate: any;

  contractsLoader = new AppLoader();
  expiringLoader = new AppLoader();
  expiredLoader = new AppLoader();
  deactivatedLoader = new AppLoader();
  renewedLoader = new AppLoader();
  newLoader = new AppLoader();

  showIndeterminateProgressContracts: boolean;
  showIndeterminateProgressExpiring: boolean;
  showIndeterminateProgressExpired: boolean;
  showIndeterminateProgressDeactivated: boolean;
  showIndeterminateProgressRenewed: boolean;
  showIndeterminateProgressNew: boolean;
  showIndeterminateProgressActive: boolean;

  EntityStatusEnum = EntityStatusEnum;
  inputValue = '';
  status = {total: 0, active: 0, inactive: 0, renewed: 0, expiring: 0, expired: 0, deactivated: 0, newcontracts: 0, expiring_in_3: 0};
  selectedArea;
  selected: any[] = [];
  @ViewChild('table') table: any;
  @ViewChild('closeForm') private closeForm;
  @ViewChild('cImage') private image;

  enableSearchContracts: boolean;
  enableSearchExpiring: boolean;
  enableSearchExpired: boolean;
  enableSearchDeactivated: boolean;
  enableSearchRenewed: boolean;
  enableSearchNew: boolean;

  activeTab = 1;

  contract_renewal: number;

  private csvCols = [
    {field: 'name', header: 'Contract Number'},
    {field: 'client_name', header: 'Customer'},
    {field: 'assigned_area_name', header: 'Area'},
    {field: 'assigned_location_name', header: 'Location'},
    {field: 'party_code', header: 'Party Code'},
    {field: 'date_commissioned', header: 'Start Date', time: true},
    {field: 'date_of_joining', header: 'End Date', time: true},
    {field: 'assigned_bins_count', header: 'No. of Bins'},
    {field: 'skip_rate', header: 'Skip Rate'},
    {field: 'skip_size_name', header: 'Skip Size'},
    {field: 'status_label', header: 'Status'},
  ];


  @ViewChild('tab1') private tab1;
  @ViewChild('tab2') private tab2;
  @ViewChild('tab3') private tab3;
  @ViewChild('tab4') private tab4;
  @ViewChild('tab5') private tab5;
  @ViewChild('tab6') private tab6;
  @ViewChild('tab7') private tab7;
  @ViewChild('tab8') private tab8;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;

  theme;
  constructor(private formService: FormService,
              private entityService: EntityService,
              private datatableService: DatatableService,
              private swalService: SwalService,
              public resizeDatatableSerivce: ResizeDatatableService,
              private brandingService: BrandingService,
              private truckService: TruckService) {
                this.theme = this.brandingService.styleObject();
  }

  ngOnInit() {
    this.getContracts();
  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }

  toggleExpandRow(row, expanded) {
    // this.table.rowDetail.toggleExpandRow(row);
    this.onSelect(row);

    if (expanded) {
      // this.map.resetMap();
      this.table.rowDetail.collapseAllRows();
      this.selectedArea = null;

    } else {
      console.log(row);
      this.table.rowDetail.collapseAllRows();
      this.table.rowDetail.toggleExpandRow(row);
      this.onSelect(row);
    }
  }

  inputValueContracts = '';
  inputActiveValueContracts = '';
  inputValueExpiring = '';
  inputValueExpired = '';
  inputValueDeactivated = '';
  inputValueNew = '';
  inputValueRenewed = '';
  inputValueExpiringInThreeMonths = '';

  getContracts() {
    this.searchPlaceHolderContracts = 'Loading...';
    this.enableSearchContracts = true;
    this.showIndeterminateProgressContracts = true;
    this.showIndeterminateProgressActive = true;
    this.status.total = 0;
    this.status.active = 0;
    this.status.inactive = 0;
    this.status.expiring = 0;
    this.status.expired = 0;
    this.status.deactivated = 0;
    this.status.renewed = 0;
    this.status.newcontracts = 0;
    this.status.expiring_in_3 = 0;
    let index_a = 0;
    let index_b = 100;
    let results_remaining = true;
    this.contracts = [];
    this.entityService.getListingCount('get_counts_listing',
      {
        type_id: EntityType.CONTRACT
      }).subscribe(new class extends HttpController <LoginApiResponse<any[]>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.status.total = apiResponse.response;
            this.context.getAllContracts();
            this.context.getExpiringContracts();
            this.context.getExpiringinThreeMonthsContracts();
            this.context.getExpiredContracts();
            this.context.getRenewedContracts();
            this.context.getNewContracts();
            this.context.getDeactivatedContracts();
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
    );
  }

  getAllContracts() {
    this.inputValueContracts = '';
    this.searchPlaceHolderContracts = 'Loading...';
    this.enableSearchContracts = true;
    this.showIndeterminateProgressContracts = true;
    this.showIndeterminateProgressActive = true;
    let index_a = 0;
    let index_b = 100;
    let results_remaining = true;
    this.contracts = [];
    this.activeContracts = [];
    this.status.active = 0;
    this.optimized_contracts_call(index_a, index_b);
  }

  optimized_contracts_call(index_a, index_b) {
    this.optimizedCall = this.formService.getContractsListing({
      // index_a: index_a,
      // index_b: index_b
    }).subscribe(new class extends HttpController <TestApiResponse<any[]>> {
        onComplete(): void {
          if (this.context.results_remaining) {
            index_a += 100;
            index_b += 100;
            this.context.optimized_contracts_call(index_a, index_b);
          } else {
            this.context.searchPlaceHolderContracts = 'Search';
            this.context.enableSearchContracts = false;
            this.context.showIndeterminateProgressContracts = false;
            this.context.showIndeterminateProgressActive = false;
            this.context.activeContracts = this.context.contracts;
            if (this.context.activeContracts.length > 1) {
              this.context.allActiveContracts(1);
            }
          }
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);

          // console.log(errorMessage);

        }

        onNext(apiResponse: TestApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.results_remaining = apiResponse.remaining;
            this.context.contracts = [];
            this.context.contracts = [...this.context.contracts, ...apiResponse.response];
            this.context.tempcontracts = this.context.contracts;
            this.context.status.active = 0;
            this.context.status.inactive = 0;
            for (let i = 0; i < apiResponse.response.length; i++) {
              if (apiResponse.response[i].status === EntityStatusEnum.Active) {
                this.context.status.active += 1;
              }
              if (apiResponse.response[i].status === EntityStatusEnum.Inactive) {
                this.context.status.inactive += 1;
              }

            }

          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }

        }
      }(this)
    );

  }

  getExpiringContracts() {
    this.inputValueExpiring = '';
    this.searchPlaceHolderExpiring = 'Loading...';
    this.enableSearchExpiring = true;
    this.showIndeterminateProgressExpiring = true;
    let index_a = 0;
    let index_b = 100;
    this.status.expiring = 0;
    let results_remaining = true;
    this.expiring = [];
    this.optimized_expiring_contracts_call(index_a, index_b);
  }

  optimized_expiring_contracts_call(index_a, index_b) {
    this.optimizedCallexpiring = this.formService.getContractsListing({
      type_id: 'expiring',
      // index_a: index_a,
      // index_b: index_b
    }).subscribe(new class extends HttpController <TestApiResponse<any[]>> {
        onComplete(): void {
          if (this.context.results_remaining) {
            index_a += 100;
            index_b += 100;
            this.context.optimized_expiring_contracts_call(index_a, index_b);
          } else {
            this.context.searchPlaceHolderExpiring = 'Search';
            this.context.enableSearchExpiring = false;
            this.context.showIndeterminateProgressExpiring = false;
          }
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);

          // console.log(errorMessage);

        }

        onNext(apiResponse: TestApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.results_remaining = apiResponse.remaining;
            this.context.expiring = [];
            this.context.expiring = [...this.context.expiring, ...apiResponse.response];
            this.context.tempexpiring = this.context.expiring;
            this.context.status.expiring = 0;
            for (let i = 0; i < apiResponse.response.length; i++) {
              this.context.status.expiring += 1;
            }
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }

        }
      }(this)
    );

  }


  expiringIn3MonthsLoader = new AppLoader();

  getExpiringinThreeMonthsContracts() {
    this.inputValueExpiringInThreeMonths = '';
    this.searchPlaceHolderExpiringInThreeMonths = 'Loading...';
    let index_a = 0;
    let index_b = 100;
    this.status.expiring_in_3 = 0;
    this.expiringInThreeMonths = [];
    this.optimized_expiring_in_3_contracts_call(index_a, index_b);
  }

  optimized_expiring_in_3_contracts_call(index_a, index_b) {
    this.optimizedCallexpiring = this.formService.getContractsListing({
      type_id: 'expiring_in_3',
    }).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.results_remaining = apiResponse['remaining'];
        this.expiringInThreeMonths = [];
        this.expiringInThreeMonths = [...this.expiringInThreeMonths, ...apiResponse['response']];
        this.status.expiring_in_3 = 0;
        for (let i = 0; i < apiResponse['response'].length; i++) {
          this.status.expiring_in_3 += 1;
        }
        if (this.results_remaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_expiring_contracts_call(index_a, index_b);
        } else {
          this.searchPlaceHolderExpiringInThreeMonths = 'Search';
          this.tempExpiringInThreeMonths = this.expiringInThreeMonths;
        }
      }
      if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });

  }

  getExpiredContracts() {
    this.inputValueExpired = '';
    this.searchPlaceHolderExpired = 'Loading...';
    this.enableSearchExpired = true;
    this.showIndeterminateProgressExpired = true;
    let index_a = 0;
    let index_b = 100;
    this.status.expired = 0;
    let results_remaining = true;
    this.expired = [];
    this.optimized_expired_contracts_call(index_a, index_b);
  }

  optimized_expired_contracts_call(index_a, index_b) {
    this.optimizedCallexpired = this.formService.getContractsListing({
      type_id: 'expired',
      // index_a: index_a,
      // index_b: index_b
    }).subscribe (apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.results_remaining = apiResponse['remaining'];
        this.expired = [];
        this.expired = [...this.expired, ...apiResponse['response']];
        this.tempexpired = this.expired;
        this.status.expired = 0;
        for (let i = 0; i < apiResponse['response'].length; i++) {
          this.status.expired += 1;
        }
        if (this.results_remaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_expired_contracts_call(index_a, index_b);
        } else {
          this.searchPlaceHolderExpired = 'Search';
          this.enableSearchExpired = false;
          this.showIndeterminateProgressExpired = false;
        }
      }
      if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });

  }


  getDeactivatedContracts() {
    this.inputValueDeactivated = '';
    this.searchPlaceHolderDeactivated = 'Loading...';
    this.enableSearchDeactivated = true;
    this.showIndeterminateProgressDeactivated = true;
    this.status.deactivated = 0;
    let index_a = 0;
    let index_b = 100;
    let results_remaining = true;
    this.deactivated = [];
    this.optimized_deactivated_contracts_call(index_a, index_b);
  }

  optimized_deactivated_contracts_call(index_a, index_b) {
    this.optimizedCalldeactivated = this.formService.getContractsListing({
      type_id: 'deactivated',
    }).subscribe (apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.results_remaining = apiResponse['remaining'];
        this.deactivated = [];
        this.deactivated = [...this.deactivated, ...apiResponse['response']];
        this.tempdeactivated = this.deactivated;
        this.status.deactivated = 0;
        for (let i = 0; i < apiResponse['response'].length; i++) {
          this.status.deactivated += 1;
        }
        if (this.results_remaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_deactivated_contracts_call(index_a, index_b);
        } else {
          this.searchPlaceHolderDeactivated = 'Search';
          this.enableSearchDeactivated = false;
          this.showIndeterminateProgressDeactivated = false;
        }
      }
      if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });

  }


  getRenewedContracts() {
    this.inputValueRenewed = '';
    this.searchPlaceHolderRenewed = 'Loading...';
    this.enableSearchRenewed = true;
    this.showIndeterminateProgressRenewed = true;
    let index_a = 0;
    let index_b = 100;
    this.status.renewed = 0;
    let results_remaining = true;
    this.renewed = [];
    this.optimized_renewed_contracts_call(index_a, index_b);
  }

  optimized_renewed_contracts_call(index_a, index_b) {
    this.optimizedCallrenewal = this.formService.getContractsListing({
      type_id: 'renewed',
      // index_a: index_a,
      // index_b: index_b
    }).subscribe(new class extends HttpController <TestApiResponse<any[]>> {
        onComplete(): void {
          if (this.context.results_remaining) {
            index_a += 100;
            index_b += 100;
            this.context.optimized_renewed_contracts_call(index_a, index_b);
          } else {
            this.context.searchPlaceHolderRenewed = 'Search';
            this.context.enableSearchRenewed = false;
            this.context.showIndeterminateProgressRenewed = false;
          }
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);

          // console.log(errorMessage);

        }

        onNext(apiResponse: TestApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.results_remaining = apiResponse.remaining;
            this.context.renewed = [];
            this.context.renewed = [...this.context.renewed, ...apiResponse.response];
            this.context.temprenewed = this.context.renewed;
            this.context.status.renewed = 0;
            for (let i = 0; i < apiResponse.response.length; i++) {
              this.context.status.renewed += 1;
            }

          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }

        }
      }(this)
    );

  }

  getNewContracts() {
    this.inputValueNew = '';
    this.searchPlaceHolderNew = 'Loading...';
    this.enableSearchNew = true;
    this.showIndeterminateProgressNew = true;
    let index_a = 0;
    this.status.newcontracts = 0;
    let index_b = 100;
    let results_remaining = true;
    this.newcontracts = [];
    this.optimized_new_contracts_call(index_a, index_b);
  }

  optimized_new_contracts_call(index_a, index_b) {
    this.optimizedCallnew = this.formService.getContractsListing({
      type_id: 'new',
      // index_a: index_a,
      // index_b: index_b
    }).subscribe (apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.results_remaining = apiResponse['remaining'];
        this.newcontracts = [];
        this.newcontracts = [...this.newcontracts, ...apiResponse['response']];
        this.tempnew = this.newcontracts;
        this.status.newcontracts = 0;
        for (let i = 0; i < apiResponse['response'].length; i++) {
          this.status.newcontracts += 1;
        }
        if (this.results_remaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_new_contracts_call(index_a, index_b);
        } else {
          this.searchPlaceHolderNew = 'Search';
          this.enableSearchNew = false;
          this.showIndeterminateProgressNew = false;
        }
      }
      if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });

  }

  getRefreshVisibility() {
    if (this.activeTab === 1) {
      return !this.enableSearchContracts;
    } else if (this.activeTab === 2) {
      return !this.enableSearchExpiring;
    } else if (this.activeTab === 3) {
      return !this.enableSearchRenewed;
    } else if (this.activeTab === 4) {
      return !this.enableSearchNew;
    } else if (this.activeTab === 5) {
      return !this.enableSearchExpired;
    } else if (this.activeTab === 6) {
      return !this.enableSearchDeactivated;
    } else if (this.activeTab === 7) {
      return !this.expiringIn3MonthsLoader.visibility;
    } else if (this.activeTab === 8) {
      return !this.enableSearchContracts;
    }
  }

  getRefreshContracts() {
    if (this.activeTab === 1) {
      this.getContracts();
    } else if (this.activeTab === 2) {
      this.getExpiringContracts();
    } else if (this.activeTab === 3) {
      this.getRenewedContracts();
    } else if (this.activeTab === 4) {
      this.getNewContracts();
    } else if (this.activeTab === 5) {
      this.getExpiredContracts();
    } else if (this.activeTab === 6) {
      this.getDeactivatedContracts();
    } else if (this.activeTab === 7) {
      this.getExpiringinThreeMonthsContracts();
    } else if (this.activeTab === 8) {
      this.getContracts();
    }
  }

  getRefreshToolTip() {
    if (this.activeTab === 1) {
      return 'Refresh All Contracts';
    } else if (this.activeTab === 2) {
      return 'Refresh Expiring Contracts';
    } else if (this.activeTab === 3) {
      return 'Refresh Renewed Contracts';
    } else if (this.activeTab === 4) {
      return 'Refresh New Contracts';
    } else if (this.activeTab === 5) {
      return 'Refresh Expired Contracts';
    } else if (this.activeTab === 6) {
      return 'Refresh Deactivated Contracts';
    } else if (this.activeTab === 7) {
      return 'Refresh Expiring in 3 Months Contracts';
    } else if (this.activeTab === 8) {
      return 'Refresh All Active Contracts';
    }
  }


  onSelect(selected) {
    console.log(selected);
    let arr = [];
    let infoArr = [];
    let items = selected.assigned_bin;
    if (selected.assigned_bins_count) {
      for (let i = 0; i < items.length; i++) {
        arr.push(items[i].source_latlong);
        let info = '';
        info += '<strong>' + 'Bin: ' + '</strong>' + items[i].name;
        infoArr.push(info);
      }

      // this.map.createMarkers(arr, 'assets/images/iol/icon-map-bin-moderate.png', infoArr);
    }
    this.selectedArea = selected;
  }

  updateFilterContracts(event) {
    this.contracts = this.datatableService.updateFilter(event.target.value, this.tempcontracts, ['name', 'client_name', 'assigned_area_name', 'party_code']);
  }

  /**
   * Filtering the active status contracts from all contracts
   * @param type
   */
  allActiveContracts(type) {
    this.activeContracts = this.datatableService.updateFilter(type, this.tempcontracts, ['status']);
    this.tempActiveContracts = this.activeContracts;
  }

  /**
   * filter exiting Active contracts
   * @param event
   */
  updateFilterActiveContracts(event) {
    this.activeContracts = this.datatableService.updateFilter(event.target.value, this.tempActiveContracts, ['name', 'client_name', 'assigned_area_name', 'party_code']);
  }

  updateFilterExpiring(event) {
    this.expiring = this.datatableService.updateFilter(event.target.value, this.tempexpiring, ['name', 'client_name', 'assigned_area_name', 'party_code']);
  }

  updateFilterExpiringInThreeMonths(event) {
    this.expiringInThreeMonths = this.datatableService.updateFilter(event.target.value, this.tempExpiringInThreeMonths, ['name', 'client_name', 'assigned_area_name', 'party_code']);
    console.log(this.expiringInThreeMonths);
  }

  updateFilterExpired(event) {
    this.expired = this.datatableService.updateFilter(event.target.value, this.tempexpired, ['name', 'client_name', 'assigned_area_name', 'party_code']);
  }

  updateFilterDeactivated(event) {
    this.deactivated = this.datatableService.updateFilter(event.target.value, this.tempdeactivated, ['name', 'client_name', 'assigned_area_name', 'party_code']);
  }

  updateFilterRenewed(event) {
    this.renewed = this.datatableService.updateFilter(event.target.value, this.temprenewed, ['name', 'client_name', 'assigned_area_name', 'party_code']);
  }

  updateFilterNew(event) {
    this.newcontracts = this.datatableService.updateFilter(event.target.value, this.tempnew, ['name', 'client_name', 'assigned_area_name', 'party_code']);
  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
    if (this.optimizedCallexpiring !== null && this.optimizedCallexpiring !== undefined) {
      this.optimizedCallexpiring.unsubscribe();
    }
    if (this.optimizedCallexpired !== null && this.optimizedCallexpired !== undefined) {
      this.optimizedCallexpired.unsubscribe();
    }
    if (this.optimizedCalldeactivated !== null && this.optimizedCalldeactivated !== undefined) {
      this.optimizedCalldeactivated.unsubscribe();
    }
    if (this.optimizedCallrenewal !== null && this.optimizedCallrenewal !== undefined) {
      this.optimizedCallrenewal.unsubscribe();
    }
    if (this.optimizedCallnew !== null && this.optimizedCallnew !== undefined) {
      this.optimizedCallnew.unsubscribe();
    }
  }


  renewContract(renew) {
    let params = {'contract_id': this.contract_renewal};
    if (renew) {
      params['date'] = DateUtils.getYYYYMMDD(this.renewalDate);
    }

    if (renew) {
      this.renewOrDeactivateBin(params);
    } else {
      swal({
        title: 'Deactivate Contract',
        text: 'Are you sure you want to deactivate this contract!',
        type: 'warning',
        showCancelButton: true,
        customClass: 'issue',
        showCloseButton: true,
        confirmButtonText: 'Deactivate Contract',
        cancelButtonText: 'Cancel',
        confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        buttonsStyling: false,
        allowOutsideClick: true,
      }).then((result) => {
        // Delete Record
        if (result.value) {
          this.renewOrDeactivateBin(params, true);
        }
      });
    }


  }


  /**
   * This method calls the API to deactive or renew the contracts
   * @param params
   */
  renewOrDeactivateBin(params, deactivate = false) {
    const end_time_month = getMonth(params.date);
    const end_time_date = getDate(params.date);
    const current_month = getMonth(new Date().toDateString());
    const current_date = getDate(new Date().toDateString());
    this.formService.renewContract(params).subscribe(new class extends HttpController <TestApiResponse<any[]>> {


        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: TestApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.swalService.getSuccessSwal(apiResponse.message);
            this.context.closeForm.nativeElement.click();

            if (deactivate) {
              this.context.getDeactivatedContracts();
            }

            if (this.context.activeTab === 2) {
              this.context.getExpiringContracts();
            } else if (this.context.activeTab === 5) {
              this.context.getExpiredContracts();
            } else if (this.context.activeTab === 1 || this.context.activeTab === 8) {
              this.context.getAllContracts();
            }
            this.context.getRenewedContracts();
            if (current_month === end_time_month) {
              if (end_time_date <= current_date) {
                this.context.getExpiredContracts();
              }
              console.log('same month');
              this.context.getExpiringContracts();
              this.context.getExpiringinThreeMonthsContracts();

            } else if (current_month > end_time_month) {
              console.log('expired case');
              this.context.getExpiringContracts();
              if (this.context.activeTab !== 5) {
                this.context.getExpiredContracts();
              }
              this.context.getExpiringinThreeMonthsContracts();
            } else if (current_month + 3 >= end_time_month) {
              console.log('in next 3 months');
              this.context.getExpiringinThreeMonthsContracts();
              this.context.getExpiringContracts();

            } else {
              console.log('default case');
              this.context.getExpiringContracts();
              this.context.getExpiredContracts();
              this.context.getExpiringinThreeMonthsContracts();
            }

            if (this.context.activeTab !== 1 || this.context.activeTab !== 8) {
              this.context.getAllContracts();
            }

          }


          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }

        }
      }(this)
    );
  }

  @ViewChild('cc') private cc;
  avatar_url;

  view(row) {
    if (row.photo) {
      this.avatar_url = row.photo;
    }
    this.deg = 0;
    this.image.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;');
    window.dispatchEvent(new Event('resize'));

  }

  files = [];

  newView(row) {
    console.log('row on click:', row);
    this.files_list = [];
    this.files = [];
    let i = 0;
    if (row.files_name) {
      row.files_name.forEach(item => {
        let arr = item.split('/');
        let picName = arr[arr.length - 1];
        this.files_list.push(new DropDownItem(i, picName));
        console.log(new DropDownItem(i, item));
        this.files.push(item);
        i++;
      });
      console.log('files list:', this.files_list);
    }
    if (row.photo) {
      let arr = row.photo.split('/');
      let picName = arr[arr.length - 1];
      this.files_list.push(new DropDownItem(i, picName));
      console.log(new DropDownItem(i, row.photo));
      this.files.push(row.photo);
      i++;
    }

  }

  openRenewModal(row) {
    this.selectedContract = row;
    this.renewalDate = undefined;
    console.log('AA gaya edit mein!', row);
    this.contract_renewal = row['id'];
  }

  reportObj = new ReportResponse();
  selectedContract;

  generatePDFReport(type: any) {
    this.reportObj.data = [];
    this.reportObj.cols = ['Name', 'Customer', 'Area', 'Location', 'Party Code', 'No. of Bins', 'Skip Rate(AED)', 'Skip Size', 'Start Date', 'End Date'];
    if (type === 'all') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'Expiring Contracts': this.expiring.length,
        'New Contracts': this.newcontracts.length,
        'Expired Contracts': this.expired.length,
        'Deactivated Contracts': this.deactivated.length,
        'Expiring in 3 Months': this.expiringInThreeMonths.length
      };
      this.reportObj.report_title = ' All Contracts Report';

      for (let j = 0; j < this.contracts.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.contracts[j])
        );
      }
    } else if (type === 'new') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'New Contracts': this.newcontracts.length
      };
      this.reportObj.report_title = 'New Contracts Report';
      for (let j = 0; j < this.newcontracts.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.newcontracts[j])
        );
      }

    } else if (type === 'expiring') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'Expiring Contracts': this.expiring.length,
      };
      this.reportObj.report_title = ' Expiring Contracts Report';
      for (let j = 0; j < this.expiring.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.expiring[j])
        );
      }
    } else if (type === 'expiring_in_3') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'Contracts Expiring in Three Months': this.expiringInThreeMonths.length,
      };
      this.reportObj.report_title = ' Expiring In Three Months Contracts Report';
      for (let j = 0; j < this.expiringInThreeMonths.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.expiringInThreeMonths[j])
        );
      }
    } else if (type === 'expired') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'Expired Contracts': this.expired.length,
      };
      this.reportObj.report_title = ' Expired Contracts Report';
      for (let j = 0; j < this.expired.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.expired[j])
        );
      }
    } else if (type === 'deactivated') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'Deactivated Contracts': this.deactivated.length,
      };
      this.reportObj.report_title = ' Deactivated Contracts Report';
      for (let j = 0; j < this.deactivated.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.deactivated[j])
        );
      }
    } else if (type === 'renewed') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'Renewed Contracts': this.renewed.length
      };
      this.reportObj.report_title = ' Renewed Contracts Reports';

      for (let j = 0; j < this.renewed.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.renewed[j])
        );
      }
    } else if (type === 'active') {
      this.reportObj.meta = {
        'Total Contracts': this.contracts.length,
        'Active Contracts': this.activeContracts.length
      };
      this.reportObj.report_title = ' Active Contracts Reports';

      for (let j = 0; j < this.activeContracts.length; j++) {
        // @ts-ignore
        this.reportObj.data.push(
          this.createReportObject(this.activeContracts[j])
        );
      }
    }
    this.getPDFReport();
  }

  private getPDFReport() {
    const startDate = DateUtils.getUtcDateTimeStart((new Date()).toDateString());
    const endDate = DateUtils.getUtcDateTimeStart((new Date()).toDateString());
    const params = {
      report_title: this.reportObj.report_title,
      meta: JSON.stringify(this.reportObj.meta),
      cols: this.reportObj.cols,
      data: JSON.stringify(this.reportObj.data),
      start_datetime: startDate,
      end_datetime: endDate
    };
    console.log('params', params, typeof (params.meta));
    this.truckService.generatePDFreport(params)
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {

          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            this.context.swalService.getErrorSwal(errorMessage);
            // console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            console.log('report', apiResponse);
            if (apiResponse.status === 200) {
              window.open('http://' + apiResponse.response.file);
            }

          }

        }(this)
      );
  }

  createReportObject(contract) {
    let obj = (
      {
        'Name': contract.name ? contract.name : '-',
        'Customer': contract.client_name ? contract.client_name : '-',
        'Area': contract.assigned_area_name ? contract.assigned_area_name : '-',
        'Location': contract.assigned_location_name ? contract.assigned_location_name : '-',
        'Party Code': contract.party_code ? contract.party_code : '-',
        'No. of Bins': contract.assigned_bins_count ? contract.assigned_bins_count : '-',
        'Skip Rate(AED)': contract.skip_rate ? contract.skip_rate : '-',
        'Skip Size': contract.skip_size_name ? contract.skip_size_name : '-',
        'Start Date': contract.date_commissioned ? format(
          contract.date_commissioned,
          'MM/DD/YYYY'
        ) : '-',
        'End Date': contract.date_of_joining ? format(
          contract.date_of_joining,
          'MM/DD/YYYY'
        ) : '-',

      });
    return obj;
  }

  deg = 0;

  rotate() {
    this.deg += 90;
    this.image.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;-webkit-transform:rotate(' + this.deg + 'deg);' + '-moz-transform:rotate(' + this.deg + 'deg);' + '-o-transform:rotate(' + this.deg + 'deg);' + '-ms-transform:rotate(' + this.deg + 'deg);' + 'transform:rotate(' + this.deg + 'deg);');
    window.dispatchEvent(new Event('resize'));
  }

  switchTabs(event) {
    if (event == '1') {
      this.tab1.nativeElement.click();
    }
    // Total tabs with active status
    else if (event == '8') {
      this.tab8.nativeElement.click();
      let status = 1; // for active status
      this.allActiveContracts(status);
    } else if (event == '2') {
      this.tab2.nativeElement.click();
    } else if (event == '3') {
      this.tab3.nativeElement.click();
    } else if (event == '4') {
      this.tab4.nativeElement.click();
    } else if (event == '5') {
      this.tab5.nativeElement.click();
    } else if (event == '6') {
      this.tab6.nativeElement.click();
    } else if (event == '7') {
      this.tab7.nativeElement.click();
    }

  }

  onFileChange(value) {
    console.log(value);
    window.open(this.files[value.id]);
  }
}
