import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { isPlatformBrowser } from '@angular/common';
import am4themes_kelly from "@amcharts/amcharts4/themes/kelly";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrimengDropdownItem } from 'src/app/platform/data/model/primng-dropdown-item';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { UtillsService } from '../../services/common/utills.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
declare var $: any;


// theme
am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);
@Component({
  selector: 'app-maintenance-dashboard',
  templateUrl: './maintenance-dashboard.component.html',
  styleUrls: ['./maintenance-dashboard.component.css']
})
export class MaintenanceDashboardComponent implements OnInit {

  items = [{ label: 'Maintenance', url: null }];
  home = { label: 'Dashboard' };
  downloadableLink;
  downloadableLink1;

  loggedInUser = this.authService.getUser();
  customerID = this.loggedInUser.customer.id;

  widgetData = [
    { name: 'Refresh', icon: 'fa fa-refresh', route: '', reload: true },
    { name: 'Share', icon: 'fa fa-share-alt', subNav: [{ name: 'Whatsapp', route: "", page: 'maintenance', url: environment.baseUrl + '/iof/maintenance/records?&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&export=pdf&customer_id=' + this.customerID + '&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone }, { name: 'Email', route: '', page: 'maintenance' }] },
    { name: 'Manage', icon: 'ri-exchange-line', route: 'manage/maintenance', target: true, url: 'http://52.178.0.56/admin', queryParam: true },

    {
      name: 'Export', icon: 'fa fa-download', export: true,
      subNav: [
        { name: 'PDF', target: true, url: environment.baseUrl + '/iof/maintenance/records?' + '&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&export=pdf&customer_id=' + this.customerID + '&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone },
        { name: 'XLS', target: true, url: environment.baseUrl + '/iof/maintenance/records?' + '&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&export=excel&customer_id=' + this.customerID + '&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone }
      ]
    },


    // { name: 'Manage', icon: 'ri-exchange-line', route: '/iol/admin/config', target: true, url: 'http://52.178.0.56/admin', queryParam: true},
    { name: 'Predict', icon: 'fa fa-location-arrow', route: '/iol/territories' },
    { name: 'Create', icon: 'fa fa-file-text-o', route: '/iol/maintenance/manage/maintenance' }
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

  showIndeterminateProgress = false;
  isAuthorized = false;
  dataSource;
  totalLength = 0;
  bsModalRef: BsModalRef;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  filters = { offset: 0, limit: 10, vehicle_group_id: '', vehicle_id: '', maintenance_type_id: '', order: '', order_by: '', date_filter: '', search: '', export: '', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, start_date: '', end_date: '' };
  displayedColumns = ['id', 'device_id__name', 'driver_id__name', 'technician_name', 'maintenance_type_id__label', 'maintenance_status_id__label', 'start_datetime', 'end_datetime'];

  vehicleMaintenance = [];
  serial = [];
  searchForm: FormGroup;
  fleetListing = [];
  vehicleListing = [];
  serviceTypeList = [];

  csvCols = [
    { header: 'ID', field: 'id' },
    { header: 'Vehicle', field: 'vehicle_name' },
    { header: 'Driver', field: 'driver_name' },
    { header: 'Technician', field: 'technician_name' },
    { header: 'Service Type', field: 'maintenance_type' },
    { header: 'Maintenance Status', field: 'maintenance_status' },
    { header: 'Start Date', field: 'start_datetime' },
    { header: 'End Date', field: 'end_datetime' },
    { header: 'Description', field: 'description' }
  ];

  vehicleMaintenanceGraph: any;
  MaintenanceGraph: any;
  sidebarCheck: any;

  constructor(
    private brandingService: BrandingService,
    private getUsecase: GetUsecaseService,
    private swalService: SwalService,
    public gotoService: GotoPageService,
    private entityService: EntityService,
    private formService: FormService,
    private authService: AuthService,
    private modalService: BsModalService,
    private maintenanceService: MaintenanceService,
    private filtersService: FiltersService,
    private formBuilder: FormBuilder,
    private srvUtillsService: UtillsService, private drawerService: DrawerService
  ) {
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();

    this.searchForm = this.formBuilder.group({
      search: [''],
      searchFleet: [''],
      searchVehicle: [''],
      searchServiceType: ['']
    });

  }
  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    const appendExport = 'vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&start_date=&end_date=';
    this.downloadableLink = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=excel&customer_id=' + this.customerID + '&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=pdf&customer_id=' + this.customerID + '&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.loadDashboardCards(hypernymModules[6], DashboardEnum.Mainenance);

    // this.entityService.getVehicleMaintenanceChart().subscribe((data: any) => {
    //   if (data['status'] === HttpStatusCodeEnum.Success) {
    //     this.vehicleMaintenance = data.data.chart_data;
    //     console.log("this.vehicleMaintenance= ", this.vehicleMaintenance)
    //     setTimeout(() => {
    //       this.generateChart(this.vehicleMaintenance);
    //     }, 100)
    //   }
    // })

    //Get Fleet
    this.maintenanceService.getFleetListing().subscribe((data: any) => {
      if (!data.error) {
        this.fleetListing = data.data.data.map(
          item => new PrimengDropdownItem(item['id'], item['name'])
        );
      }
    })

    // Get Vehicle Listing
    this.maintenanceService.getVehicleListing().subscribe((data: any) => {
      // console.log("getVehicleListing== ", data);
      if (!data.error) {
        this.vehicleListing = data.data.data.map(
          item => new PrimengDropdownItem(item['id'], item['name'])
        );
      }
    })

    // Get Service Type
    this.maintenanceService.getServiceType().subscribe((data: any) => {
      if (!data.error) {
        this.serviceTypeList = data.data.map(
          item => new PrimengDropdownItem(item['id'], item['label'])
        );
      }
    })

    // Get Maintance Data
    this.getMaintanceTableData(this.filters);

  }


  resetFiltersExport(filters) {
    // console.log("resetFilter filters: ", filters)
    const appendExport = `vehicle_group_id=${filters.vehicle_group_id}&vehicle_id=${filters.vehicle_id}&maintenance_type_id=${filters.maintenance_type_id}&date_filter=${filters.date_filter}&search=${filters.search}&start_date=${filters.start_date}&end_date=${filters.end_date}`;
    this.downloadableLink = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=excel&customer_id=' + this.customerID + '&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = environment.baseUrl + '/iof/maintenance/records?' + appendExport + '&export=pdf&customer_id=' + this.customerID + '&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
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

        if (this.graphsArray.length > 0) {
          for (let i = 0; i < this.graphsArray.length; i++) {
            if (this.graphsArray[i].name == 'Vehicle Maintenance Graph') {
              this.vehicleMaintenanceGraph = this.graphsArray[i];
              this.vehicleMaintenance = this.graphsArray[i].data.chart_data;
              // console.log("this.vehicleMaintenance= ", this.vehicleMaintenance)
              setTimeout(() => {
                this.generateChart(this.vehicleMaintenance);
              }, 100)
              // break;
            } else if (this.graphsArray[i].name == 'Maintenance status ') {
              this.MaintenanceGraph = this.graphsArray[i];
            }
          }
        }
        // console.log("graphsArray= ", this.graphsArray)
      }
    })

  }

  getSelectedWidgetOption(event) {

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

  setupReport(event) {
    const start_date = DateUtils.getUtcDateTimeStart(event[0][0]);
    const end_date = DateUtils.getUtcDateTimeStart(event[0][1]);
    this.filters.start_date = start_date;
    this.filters.end_date = end_date;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters);
  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getMaintanceTableData(this.filters);
  }

  onPaginateChange(event) {
    this.filters.offset = (event.pageIndex * event.pageSize);
    this.getMaintanceTableData(this.filters);
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

  browserOnly(f: () => void) {
    // if (isPlatformBrowser(this.platformId)) {
    //   this.zone.runOutsideAngular(() => {
    //     f();
    //   });
    // }

  }

  generateChart(chartData) {
    am4core.ready(function () {
      // Themes
      am4core.useTheme(am4themes_animated);

      var chart = am4core.create("chartdiv", am4charts.XYChart);
      chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

      chart.data = chartData;
      // console.log("GEN CHART func= ", chartData);
      chart.colors.step = 5;

      // Add legend
      chart.legend = new am4charts.Legend();
      chart.legend.useDefaultMarker = false;
      let markerTemplate = chart.legend.markers.template;
      markerTemplate.width = 5;
      markerTemplate.height = 5;
      chart.legend.position = "bottom";
      chart.legend.valueLabels.template.disabled = false;

      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "fleet_name";


      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = false;
      categoryAxis.renderer.grid.template.opacity = 1;
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.minGridDistance = 0;

      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = 0;
      valueAxis.max = 100;
      valueAxis.strictMinMax = true;
      valueAxis.calculateTotals = true;
      valueAxis.renderer.minWidth = 50;

      var series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.columns.template.width = am4core.percent(80);
      series1.columns.template.tooltipText = "{in_maintenance}";
      series1.name = "Vehicles in maintenace";
      series1.dataFields.categoryX = "fleet_name";
      series1.dataFields.valueY = "in_maintenance";
      series1.dataFields.valueYShow = "totalPercent";
      series1.dataItems.template.locations.categoryX = 0.5;
      series1.stacked = true;
      series1.tooltip.pointerOrientation = "vertical";

      var bullet1 = series1.bullets.push(new am4charts.LabelBullet());
      bullet1.interactionsEnabled = false;
      bullet1.label.text = "{in_maintenance}";
      bullet1.label.fill = am4core.color("#ffffff");
      bullet1.locationY = 0.5;

      var series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.columns.template.width = am4core.percent(80);
      series2.columns.template.tooltipText = "{total_vehicles}";
      series2.name = "Available Vehicles";
      series2.dataFields.categoryX = "fleet_name";
      series2.dataFields.valueY = "total_vehicles";
      series2.dataFields.valueYShow = "totalPercent";
      series2.dataItems.template.locations.categoryX = 0.5;
      series2.stacked = true;
      series2.tooltip.pointerOrientation = "vertical";

      var bullet2 = series2.bullets.push(new am4charts.LabelBullet());
      bullet2.interactionsEnabled = false;
      bullet2.label.text = "{total_vehicles}";
      bullet2.locationY = 0.5;
      bullet2.label.fill = am4core.color("#ffffff");

      chart.scrollbarX = new am4core.Scrollbar();
    });
  }

  getMaintanceTableData(filters) {
    this.showIndeterminateProgress = true;

    let params = `offset=${filters.offset}&limit=${filters.limit}&order=${filters.order}&order_by=${filters.order_by}&vehicle_group_id=${filters.vehicle_group_id}&vehicle_id=${filters.vehicle_id}&maintenance_type_id=${filters.maintenance_type_id}&date_filter=${filters.date_filter}&search=${filters.search}&export=${filters.export}&timeZone=${filters.timeZone}&start_date=${filters.start_date}&end_date=${filters.end_date}`;
    // console.log("params for getMaintanceData()= ", params);

    this.maintenanceService.getMaintanceData(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      // console.log("getMaintanceData()== ", data)
      if (!data.error) {
        this.dataSource = data.data.data;
        this.totalLength = data.data.count;
        // this.dataSource.sort = this.sort;
        // this.dataSource.paginator = this.paginator;
      }
    })

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
    this.filters.maintenance_type_id = event.value;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters)
  }
  onSearch(formValue) {
    this.filters.search = formValue.search;
    this.resetFiltersExport(this.filters);
    this.getMaintanceTableData(this.filters)
  }
  selectPeriod(event) {
    // console.log("selectPeriod= ", event);
    const selectPeriodDate = DateUtils.getUtcDateTimeStart(event);
    // console.log("", selectPeriodDate);
    this.filters.date_filter = selectPeriodDate;
    this.getMaintanceTableData(this.filters);
  }
  //////////////////////////////////////////

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get('search').setValue('');
    this.searchForm.get('searchFleet').setValue('');
    this.searchForm.get('searchVehicle').setValue('');
    this.searchForm.get('searchServiceType').setValue('');

    $('.ui-inputtext.ui-widget.ui-state-default.ui-corner-all').val('');

    this.filters = { offset: 0, limit: 10, vehicle_group_id: '', vehicle_id: '', maintenance_type_id: '', order: '', order_by: '', date_filter: '', search: '', export: '', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, start_date: '', end_date: '' };
    this.getMaintanceTableData(this.filters);
  }


  ExportMaintenanceListAsCSV() {
    this.filters = { offset: 0, limit: 10, vehicle_group_id: '', vehicle_id: '', maintenance_type_id: '', order: '', order_by: '', date_filter: '', search: '', export: '', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, start_date: '', end_date: '' };
    let params = `order=${this.filters.order}&order_by=${this.filters.order_by}&vehicle_group_id=${this.filters.vehicle_group_id}&vehicle_id=${this.filters.vehicle_id}&maintenance_type_id=${this.filters.maintenance_type_id}&date_filter=${this.filters.date_filter}&search=${this.filters.search}&export=${this.filters.export}&timeZone=${this.filters.timeZone}&start_date=${this.filters.start_date}&end_date=${this.filters.end_date}&customer_id=${this.customerID}`;

    this.maintenanceService.getMaintanceData(params).subscribe((data: any) => {
      if (data.data.data) {
        const result = data.data.data.map(({
          id, vehicle_name, driver_name, technician_name, maintenance_type, maintenance_status, start_datetime, end_datetime, description }) => ({
            id, vehicle_name, driver_name, technician_name, maintenance_type, maintenance_status, start_datetime, end_datetime, description
          }));
        // this function is used to create csv from json
        this.srvUtillsService.exportToCsv(this.csvCols, 'maintenance_list.csv', result)

      }
    }, error => {
      console.error(error);
    })

  }






  // https://dev.iot.vodafone.com.qa/backend/iof/maintenance/records?vehicle_group_id=&amp;vehicle_id=&amp;maintenance_type_id=&amp;date_filter=&amp;search=&amp;export=excel&amp;timeZone=Asia/Karachi&amp;customer_id=1&amp;start_date=&amp;end_date=


  // https://dev.iot.vodafone.com.qa/backend/iof/maintenance/records?order=&order_by=&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&export=&timeZone=Asia/Karachi&start_date=&end_date=




}
