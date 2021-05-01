// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-maintenance-summary',
//   templateUrl: './maintenance-summary.component.html',
//   styleUrls: ['./maintenance-summary.component.css']
// })
// export class MaintenanceSummaryComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }



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

@Component({
  selector: 'app-maintenance-summary',
  templateUrl: './maintenance-summary.component.html',
  styleUrls: ['./maintenance-summary.component.css']
})
export class MaintenanceSummaryComponent implements OnInit {

  items = [{ label: 'Maintenance', url: null }];
  home = { label: 'Dashboard' };

  widgetData = [
    { name: 'Refresh', icon: 'fa fa-refresh', route: '', reload: true },
    { name: 'Export', icon: 'fa fa-download', route: '' },
    { name: 'Share', icon: 'fa fa-share-alt', route: '', subNav: [{ name: 'Whatsapp', route: "" }, { name: 'Email', route: '' }] },
    { name: 'Manage', icon: 'fa fa-crosshairs-alt', route: '/iol/admin/config', target: true, url: 'http://52.178.0.56/admin', queryParam: true},
    { name: 'Predict', icon: 'fa fa-location-arrow', route: '/iol/territories' },
    { name: 'Actions', icon: 'fa fa-map-marker', route: ''}
    // { name: 'Actions', icon: 'fa fa-map-marker', route: '', subNav: [{ name: 'Add New Maintenance' }]}
  ]

  graphColumns = ['col-md-8', 'col-md-4', 'col-md-6', 'col-md-6', 'col-md-8', 'col-md-4', 'col-md-5', 'col-md-7', 'col-md-8', 'col-md-4', 'col-md-6', 'col-md-6', 'col-md-8', 'col-md-4', 'col-md-5', 'col-md-7'];

  theme;
  useCaseId = 0;

  cardsArray;
  graphsArray;
  loading = false;
  selectedGraph;
  //set graph height for dashboard
  graphHeight = 240;
  searchForm:FormGroup;
  maintainForm:FormGroup;
  downloadableLink1:any;
  downloadableLink:any;
  resetFilters = false;
  showIndeterminateProgress = false;

  dataSource;
  totalLength = 0;
  bsModalRef: BsModalRef;
  
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  keyUp = new Subject<KeyboardEvent>();
  filters = { limit: 10, offset: 0, order_by: '', order: '', start_datetime: '',  end_datetime: ''};
  displayedColumns = ['device_name', 'status_label', 'asset_entity_type', 'driver_name', 'technician_name', 'client_name', 'contract_name', 'start_datetime', 'end_datetime', 'issued_datetime', 'maintenance_type_name', 'action'];
  vehicleListingGroup=[];
  vehicleListing=[];
  serviceTypeList=[];
  technicianLisitng=[];
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
    private filtersService: FiltersService
  ) { 
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.searchForm=this.formBuilder.group({
      name:['',[Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      // selectDriver:[''],
      // driverShifts:[''],
      // countNumber:['']
    });
    this.maintainForm=this.formBuilder.group({
      name:['',[Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      // selectDriver:[''],
      // driverShifts:[''],
      // countNumber:['']
    });
  }

  ngOnInit(): void {
    this.loadDashboardCards(hypernymModules[6], DashboardEnum.Mainenance);
    this.getMaintenanceListing(this.filters);
    this.filtersService.getValue().subscribe(data => {
      if (data) {
        this.filters = data;
        this.filters.limit = 10;
        this.filters.offset = 0;
        this.filters.order_by = '';
        this.filters.order = '';
        this.filterIdsFromJSON();
        this.getMaintenanceListing(this.filters);
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

  getSelectedWidgetOption (event) {
    
  }
  selectGroupDropDownChange(event)
  {

  }
  selectVehicleDropDownChange(event){

  }
  selectServiceTypeDropDownChange(event)
  {}
  selectTechnicianDownChange(event)
  {}
  clearForm()
  {

  }
  onSearch(formValue)
  {

  }
  onSubmitMaintainance(formValue)
  {

  }
  getSelectedGraphData (data) {
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

  getMaintenanceListing (filters) {
    this.showIndeterminateProgress = true;
    this.maintenanceService.getMaintenances(filters).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.showIndeterminateProgress = false;
        this.dataSource = apiResponse['data'].data;
        this.totalLength = apiResponse['data'].count;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    })
  }
  
  setupReport(event) {
    const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);
    this.filters.start_datetime = start_date;
    this.filters.end_datetime = end_date;
    this.getMaintenanceListing(this.filters);
  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getMaintenanceListing(this.filters);
  }

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getMaintenanceListing(this.filters);
  }

  disableButton(row) {
    return this.formService.disableButton(row);
  }

  editMaintenance(row) {
    this.openNewMaintenanceForm(row);
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


    this.bsModalRef.content.submitForm
      .subscribe((value) => {
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
}
