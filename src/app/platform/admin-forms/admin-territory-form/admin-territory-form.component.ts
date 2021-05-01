import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { isNullOrUndefined } from 'util';
import { BrandingService } from '../../shared/services/branding.service';
import { AppLoader } from '../../data/model/app-loader';
import { EntityStatusEnum, EntityType } from 'src/app/core/enum/entity-type.enum';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { GotoPageService } from '../../services/goto-page.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { DatatableService } from '../../services/datatable.service';
import { FormService } from '../../services/FormService';
import { CustomValidators } from 'src/app/core/custom.validator';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DropDownItem } from '../../data/model/dropdown-item';
import { ErrorMessage } from '../../error-message';
import { MatPaginator } from '@angular/material/paginator';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
declare var google: any;

@Component({
  selector: 'app-admin-territory-form',
  templateUrl: './admin-territory-form.component.html',
  styleUrls: ['./admin-territory-form.component.css']
})
export class AdminTerritoryFormComponent implements OnInit, OnDestroy {

  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  appLoader = new AppLoader();
  territories;//: any[];
  temp: any[];
  territoryForm: FormGroup;
  errorMessages: string[];
  itemListTerritoryType = [];
  selectedTerritoryType = [];
  itemListTrucks = [];
  selectedTruck = [];
  territoryPath = null;
  EntityStatusEnum = EntityStatusEnum;
  EntityType = EntityType;
  @ViewChild('closeForm') private closeForm;
  @ViewChild('editpop') private editpop;
  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;
  @ViewChild('viewMap')
  vMap: GoogleMapComponent;
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  @ViewChild("mapZone") mapZone: GoogleMapComponent;
  selectedshape: any = null;
  selectedTerritory: any = null;
  selectedRows = [];
  settings_readOnly = {
    singleSelection: true,
    text: 'Select an Option',
    enableSearchFilter: true,
    showCheckbox: false,
    disabled: true,
  };

  myInfowindow = new google.maps.InfoWindow();
  public _markers = [];

  mapZoom;
  markers = {};
  infoWindows = {};
  marker;
  poly = [];
  bounds = new google.maps.LatLngBounds();
  bounds1 = new google.maps.LatLngBounds();
  shapes = {};

  isNullOrUndefined = isNullOrUndefined;
  btnLoading: boolean;
  btnText: string;
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon', 'circle']
    },
  });
  inactiveRecord;
  formTitle = 'Add New Zone';

  hashMap: any = {};
  deleteAllButton: boolean;
  csvCols: any[];
  csvRows: any[];

  theme;
  isAuthorized = false;

  zoneAccess = [
    new PrimengDropdownItem(1, 'Forbidden'),
    new PrimengDropdownItem(2, 'Allowed')
  ];

  zoneAccessDD = [
    new PrimengDropdownItem('', 'All'),
    new PrimengDropdownItem(1, 'Forbidden'),
    new PrimengDropdownItem(2, 'Allowed')
  ];

  zone_access_type;
  zone_access_type_dd;

  // Added by wahab
  searchForm: FormGroup;
  filterTerritory = { type_id: 6, limit: 10, offset: 0, order_by: '', order: '', search: '', zone_access_type: '' };
  displayedTerritoryList = ["name", "status", "zone_access_type", "is_poi", "assigned_vehicles_count", "actions"];
  @ViewChild('territoryPaginator') territoryPaginator: MatPaginator;

  @ViewChild('gmapZone') gmapElementZone: any;

  totalTerritoryLength = 0;
  submitted: boolean;
  submittedTerritory = false;
  filtersTruck = { limit: 0, offset: 0, order_by: '', order: '' };
  loggedInUser;
  searchText;
  breadcrumbInner=[];
  sidebarCheck;
  constructor(public formBuilder: FormBuilder,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private swalService: SwalService,
    private datatableService: DatatableService,
    private brandingService: BrandingService,
    public formService: FormService,
    private breadcrumbService: BreadcrumbsService,
    private drawerService:DrawerService) {

    this.searchForm = this.formBuilder.group({
      search: [''],
      zone_access_type: ['']
    })

    this.territoryForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      trucks_list: [null, [Validators.required]],
      description: [null, [Validators.required]],
      zone_access_type: ['', [Validators.required]],
      is_poi: false,
      status: [1]
      // This field doesn't actually exist on the form. This is just to carry out form validation effieciently.
      // territory: [null, Validators.required],
    });

    this.csvCols = [
      { field: 'name', header: 'Name' },
      { field: 'assigned_trucks_count', header: 'Trucks Count' },
    ];

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
    // console.log("entity.territory-- ", EntityType.TERRITORY);
    this.deleteAllButton = false;
    this.getGeoFenceTypes();
    this.getTruckList(this.filtersTruck);   //for vehicles
    this.getTerritories(this.filterTerritory);
    this.initMap();
    this.setupDrawingTools();
  }

  ngAfterViewInit(): void {
    if (this.scrollToTop && this.scrollToTop.nativeElement) {
      this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
    }

    const mapProp = {
      center: { lat: 25.3548, lng: 51.1839 },
      zoom: 9,
    };
    setTimeout(() => {
      this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    }, 1000);
    // this.mapZone = new google.maps.Map(this.gmapElementZone.nativeElement, mapProp);
    console.log("this.map (after adding map)= ", this.map)
  }

  // Initialize google map
  initMap() {
    // console.log("this.map= ", this.map)
    // const mapProp = {
    //   center: { lat: 33.6844, lng: 73.047 },
    //   zoom: 6,
    // };
    // const mapProp = GoogleMapModel.getMapProp();
    // this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    // console.log("this.map (after adding map)= ", this.map)
  }

  // setup drawing tools
  setupDrawingTools() {
    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (event) => {
      this.selectedshape = event;
      const a = event.getPath().getArray();
      const arr = [];
      for (let i = 0; i < a.length; i++) {
        const obj = { lat: null, lng: null };
        obj.lat = a[i].lat();
        obj.lng = a[i].lng();
        arr.push(obj);
      }
      if (this.selectedTerritory) {
        this.territoryPath = (arr);
      } else {
        this.territoryPath = JSON.stringify(arr);
      }
      this.territoryForm.patchValue({ territory: (arr) });
      if (!isNullOrUndefined(this.selectedshape)) { this.drawingManager.setMap(null); }
    });

    google.maps.event.addListener(this.drawingManager, 'circlecomplete', (event) => {
      this.selectedshape = event;
      let params = {
        radius: this.selectedshape.getRadius(),
        lat: this.selectedshape.getCenter().lat(),
        lng: this.selectedshape.getCenter().lng(),
      }
      if (this.selectedTerritory) {
        this.territoryPath = (params);
      } else {
        this.territoryPath = JSON.stringify(params);
      }
      this.territoryForm.patchValue({ territory: (params) });
      if (!isNullOrUndefined(this.selectedshape)) { this.drawingManager.setMap(null); }
    });
  }

  getTruckList(filtersTruck) {
    let params = `limit=${filtersTruck.limit}&offset=${filtersTruck.offset}&order=${filtersTruck.order}&order_by=${filtersTruck.order_by}`;
    console.log("params for getVehicleList= ", params);

    this.formService.getVehiclesListNew(params)
      .subscribe((data: any) => {
        console.log("getVehiclesList()-", data);
        if (!data.error) {
          this.itemListTrucks = data['data'].data.map(
            item => new DropDownItem(item['id'], item['name'])
          );

        } else {
          this.swalService.getErrorSwal(data.message);
        }
        console.log("this.itemListTrucks= ", this.itemListTrucks)
      }
      );
  }

  getGeoFenceTypes() {
    this.formService.getOptions('dropdown_data', { option_key: 'territorytype' })
      .subscribe((data: any) => {
        console.log("getOptions() response= ", data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.itemListTerritoryType = data.response['option_values'].map(
            item => new DropDownItem(item['id'], item['label'])
          );
        } else {
          this.swalService.getErrorSwal(data.message);
        }
      })
  }

  // Resets Form
  addNew() {
    this.formTitle = 'Add New Zone';
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.selectedTruck = [];
    this.territoryForm.reset();
    this.submitted = false;
    this.resetMap();
    this.setupDrawingTools();
    this.selectedTerritory = null;
  }
  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.territoryForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.territoryForm.get('name').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    if (this.territoryForm.get('zone_access_type').hasError('required')) {
      this.errorMessages.push('Access ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.territoryForm.get('trucks_list').hasError('required')) {
      this.errorMessages.push('Vehicles ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (this.territoryForm.get('description').hasError('required')) {
      this.errorMessages.push('Instruction ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (isNullOrUndefined(this.selectedshape)) {
      isValid = false;
      this.swalService.getWarningSwal('Please draw territory first!');
    }
    return isValid;
  }

  onSubmit(formValue: Object) {
    console.log("formvalue", formValue);
    this.submitted = true;
    if (this.validate()) {
      const id = this.territoryForm.getRawValue().id;
      formValue['trucks_list'] = [];
      formValue['territory'] = this.territoryPath;
      if (this.selectedTruck !== null && this.selectedTruck.length > 0) {
        for (let i = 0; i < this.selectedTruck.length; i++) {
          formValue['trucks_list'].push(this.selectedTruck[i].id);
        }
      }
      console.log("formvalue2", formValue);
      this.disableSubmitButton();
      if (isNullOrUndefined(id)) {
        this.postTerritory(formValue);
      } else {
        this.patchTerritory(formValue);
      }
    } else {
      console.log("form is inValid.", this.errorMessages);
    }
  }
  postTerritory(formValue): void {
    formValue['type_id'] = EntityType.TERRITORY;
    formValue.is_poi = (formValue.is_poi === null || formValue.is_poi === false) ? false : true;

    this.formService.postData(formValue).subscribe((data: any) => {
      console.log("reponse of update= ", data);
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal("Record added successfully"); //data.message
        this.enableSubmitButton();
        this.getTerritories(this.filterTerritory);
      } else {
        this.swalService.getErrorSwal(data.message);
        this.btnText = "Save";
        this.btnLoading = false;
        console.log(data.message);
      }
    })
  }

  zoneChanged(event) {
    this.zone_access_type = event.value;
  }

  zoneChangedSearch(event) {
    this.filterTerritory.zone_access_type = event.value;
    this.getTerritories(this.filterTerritory);
  }

  inputValue = '';
  getTerritories(filter): void {
    this.inputValue = '';
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.territories = [];
    this.submittedTerritory = true;
    this.resetMap();
    this.drawingManager.setDrawingMode(null);
    // this.mapZone.resetMap();
    let params = `zone_access_type=${filter.zone_access_type}&type_id=${filter.type_id}&limit=${filter.limit}&offset=${filter.offset}&order=${filter.order}&order_by=${filter.order_by}&search=${filter.search}`;
    // console.log("params--", params);

    this.formService.getTerritoryEntity(params)
      .subscribe((data: any) => {
        console.log("getEntities() response= ", data);
        this.showIndeterminateProgress = false;
        this.submittedTerritory = false;
        if (data.status === HttpStatusCodeEnum.Success) {

          // this.results_remaining = data.remaining;
          // this.territories = [...this.territories, ...data.response];

          this.territories = data['data'].data;
          this.totalTerritoryLength = data['data'].count;
          this.territories.pagination = this.totalTerritoryLength
          console.log("this.territories== ", this.territories, this.territories.length)
          // this.populateHashmap(data.response);
          this.temp = this.territories;
          this.drawGeozones(this.territories);
          // if (this.results_remaining) {
          //   index_a += 100;
          //   index_b += 100;
          //   this.optimized_territory_call(index_a, index_b);
          // } else {
          //   this.searchPlaceHolder = 'Search';
          //   this.enableSearch = false;
          //   this.showIndeterminateProgress = false;
          //   this.csvRows = this.territories;
          // }

        } else {

        }

      });

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

  // Update call for Bin
  patchTerritory(territory) {
    territory['id'] = String(this.selectedTerritory.id);
    territory['type'] = EntityType.TERRITORY;
    console.log(territory);
    territory.status = territory.status === true ? 1 : 2;
    territory.is_poi = (territory.is_poi === null || territory.is_poi === false) ? false : true;
    this.formService.patchDataTerritory(territory).subscribe((data: any) => {
      console.log("response of update - ", data);
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal("Record updated successfully"); //data.message
        this.enableSubmitButton();
        this.mapZone.resetMap();
        this.drawingManager.setMap(null);
        this.getTerritories(this.filterTerritory);
        // window.location.reload();
      } else {
        console.log(data.message);
        this.btnText = "Update";
        this.btnLoading = false;
        this.swalService.getErrorSwal(data.message);
      }
    })
  }
  openEditModal(territory, readOnly = false) {
    console.log("openeditmodel", territory);
    this.formTitle = 'Update Zone';
    this.btnText = "Update";
    this.inactiveRecord = this.disableButton(territory);
    this.selectedTerritory = territory;

    this.territoryForm.patchValue({
      id: territory.id,
      name: territory.name,
      trucks_list: this.selectedTruck,
      description: territory.description,
      zone_access_type: territory.zone_access_type,
      is_poi: territory.is_poi,
      status: territory.status === 1 ? true : false
    });

    // this.enableSubmitButton();
    this.resetMap();
    let stringTerrotory = (territory.territory);
    if (stringTerrotory && stringTerrotory.radius) {
      this.drawShapeCircle(territory.territory);
    } else {
      this.drawShape(territory.territory);
      if (readOnly) { this.vMap.drawTerritory(territory.territory); }
    }
    this.drawingManager.setMap(null);
    this.selectedTerritoryType = [{ id: territory.territory_type_id, itemName: territory.territory_type }];
    this.selectedTruck = [];
    for (let i = 0; i < territory.assigned_vehicles.length; i++) {
      // this.selectedTruck.push({id: territory.assigned_truck[i]['id'], itemName: territory.assigned_truck[i]['name'], code: territory.assigned_truck[i]['id'], name: territory.assigned_truck[i]['name']});
      this.selectedTruck.push(new DropDownItem(territory.assigned_vehicles[i]['id'], territory.assigned_vehicles[i]['name']));
    }
    this.territoryForm.patchValue({
      id: territory.id,
      name: territory.name,
      trucks_list: this.selectedTruck,
      description: territory.description,
      territory: territory.territory
    });
  }

  // Swal dialog for Delete/inactive
  async showSwal(territory) {
    const shouldDelete = await this.swalService.getDeleteSwal(territory, 'What do you want to do with this record?');

    if (shouldDelete) {
      console.log("coming in should del");
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.confirmDelete(territory.id, shouldDelete, 'Record has been' + message + 'successfully');
    }
  }


  confirmDelete(territoryId, actionType, message?) {
    this.hashMap[territoryId] = true;

    let params = {
      'id': territoryId,
      'status': actionType
    }

    this.formService.deleteterritory(params).subscribe((data: any) => { //{ 'id': [territoryId] }
      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal(message); //data.message
        this.drawingManager.setMap(null);
        this.resetMap();
        this.getTerritories(this.filterTerritory);
        this.inputValue = '';
        this.selectedRows = [];
      } else {
        console.log(message); //data.message
        this.swalService.getErrorSwal(message); //data.message
      }
    }
    );

  }

  deleteTerritory(binId, actionType, message?) {
    const params = {};
    params['id_list'] = (binId);
    params['status'] = actionType;
    this.formService.deleteData(params)
      .subscribe((data: any) => {
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(data.message);
          this.drawingManager.setMap(null);
          this.resetMap();
          this.getTerritories(this.filterTerritory);
          this.inputValue = '';
          this.selectedRows = [];
        } else {
          console.log(data.message);
          this.swalService.getErrorSwal(data.message)
        }

      })

  }
  getClass(status) {
    if (status === 'Red') {
      return 'label-danger';
    }
    if (status === 'Green') {
      return 'label-success';
    }
    if (status === 'Blue') {
      return 'label-primary';
    }
    return 'label-default';
  }

  resetMap() {
    if (!isNullOrUndefined(this.selectedshape)) {
      this.selectedshape.setMap(null);
      this.selectedshape = null;
      this.drawingManager.setMap(this.map);
      this.territoryPath = null;
    }
  }

  drawShapeCircle(cords) {
    this.resetMap();
    const bounds = new google.maps.LatLngBounds();
    const obj = (cords);
    this.map.setCenter(new google.maps.LatLng(obj.lat, obj.lng));
    const circleShape = new google.maps.Circle({
      paths: obj,
      strokeColor: "#000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#000",
      fillOpacity: 0.35,
      center: new google.maps.LatLng(obj.lat, obj.lng),
      radius: obj.radius
    });

    circleShape.setMap(this.map);
    this.map.setZoom(12);
    this.selectedshape = circleShape;
    this.territoryPath = cords;
  }


  drawShape(cords) {
    this.resetMap();
    const bounds = new google.maps.LatLngBounds();
    const arr = [];
    const obj = (cords);
    const polygonShape = new google.maps.Polygon({
      paths: obj,
    });
    polygonShape.setMap(this.map);
    polygonShape.getPath().forEach(function (element, index) {
      const obj = { lat: null, lng: null };
      bounds.extend(element);
      obj.lat = element.lat();
      obj.lng = element.lng();
      arr.push(obj);

    });
    // this.map.setCenter(bounds.getCenter());
    const z = this.getBoundsZoomLevel(bounds, { height: 250, width: 390 });
    this.map.fitBounds(bounds);
    this.map.setZoom(z);
    this.map.setCenter(bounds.getCenter());
    this.selectedshape = polygonShape;
    this.territoryPath = (arr);
  }

  getBoundsZoomLevel(bounds, mapDim) {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    function latRad(lat) {
      const sin = Math.sin(lat * Math.PI / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    const lngDiff = ne.lng() - sw.lng();
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  }

  disableButton(row) {
    return this.formService.disableButton(row);
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

  clearForm() {
    this.btnText = "Save";
    this.submitted = false;
  }

  onSearch(formValues) {
    this.filterTerritory.search = this.searchForm.get('search').value;
    this.filterTerritory.zone_access_type = this.searchForm.get('zone_access_type').value;
    this.getTerritories(this.filterTerritory);
  }

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get('search').setValue('');
    this.searchForm.get('zone_access_type').setValue('');
    this.filterTerritory = { type_id: 6, limit: 10, offset: 0, order_by: '', order: '', search: '', zone_access_type: '' };
    this.getTerritories(this.filterTerritory);
  }

  onTerritoryPagination(event) {
    this.filterTerritory.offset = (event.pageIndex * event.pageSize);
    this.getTerritories(this.filterTerritory);
  }
  sortTerritoryList(event) {
    this.filterTerritory.order_by = event.active;
    this.filterTerritory.order = event.direction;
    this.getTerritories(this.filterTerritory);
  }

  drawGeozones(geozones) {
    this.mapZone.resetMap();
    this.drawingManager.setMap(null)
    if (geozones && geozones.length > 0) {
      geozones.forEach(element => {
        this.mapZone.drawTerritory(element.territory, element.name)
      });
    }
  }

  drawTerritory(cords, title?, opts?, height = 250) {
    // this.resetMap();
    const bounds = this.bounds;
    // let bounds = new google.maps.LatLngBounds();
    const arr = [];
    let cordsArray = [];

    if (cords.radius) {
      let circleShape;

      if (circleShape) {
        circleShape.setMap(null);
      }

      const bounds = new google.maps.LatLngBounds();
      const obj = cords;
      // this.mapZone.setCenter(new google.maps.LatLng(obj.lat, obj.lng));
      circleShape = new google.maps.Circle({
        paths: obj,
        strokeColor: "#000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#000",
        fillOpacity: 0.35,
        center: new google.maps.LatLng(obj.lat, obj.lng),
        radius: obj.radius
      });

      circleShape.setMap(this.mapZone);

      if (title) {
        circleShape.addListener('click', event => {
          circleShape.setOptions({ fillColor: '#0000ff' });
          this.myInfowindow.setContent('Zone Name: ' + title);
          this.myInfowindow.setPosition(event.latLng);
          this.myInfowindow.open(this.mapZone);
        });
        this.shapes[title] = circleShape;
        circleShape.addListener('mousemove', event => {
          this.myInfowindow.close();
          circleShape.setOptions({ fillColor: '#7799b3' });

        });

      }

      this.mapZone.setCenter(new google.maps.LatLng(obj.lat, obj.lng));
      // this.map.setZoom(12);
    } else {
      cordsArray = cordsArray.concat(cords);
      for (let i = 0; i < cordsArray.length; i++) {
        // const obj = JSON.parse(cordsArray[i]);
        const polygonShape = new google.maps.Polygon({
          paths: cordsArray,
        });
        if (opts) {
          polygonShape.setOptions(({ strokeWeight: 1, strokeColor: opts[i].strokeColor, fillColor: opts[i].fillColor }));
        } else {
          polygonShape.setOptions(({ strokeWeight: 1, strokeColor: '#000', fillColor: '#7799b3' }));
        }
        // polygonShape.setOptions(({ strokeColor: '#9999ff', fillColor: '#7799b3'}));

        polygonShape.setMap(this.mapZone);
        polygonShape.getPath().forEach(function (element, index) {
          const obj = { lat: null, lng: null };
          bounds.extend(element);
          obj.lat = element.lat();
          obj.lng = element.lng();
          arr.push(obj);

        });
        // strokeColor: '#000',
        //   fillColor: '#7799b3'
        if (title) {
          polygonShape.addListener('click', event => {
            polygonShape.setOptions({ fillColor: '#0000ff' });
            this.myInfowindow.setContent('Zone Name: ' + title);
            this.myInfowindow.setPosition(event.latLng);
            this.myInfowindow.open(this.mapZone);
          });
          this.shapes[title] = polygonShape;
          polygonShape.addListener('mousemove', event => {
            this.myInfowindow.close();
            polygonShape.setOptions({ fillColor: opts ? opts[i].fillColor : '#7799b3' });

          });

        }

        this._markers.push(polygonShape);
      }
      //
      // this.mapZone.fitBounds(bounds);
      // const z = this.getBoundsZoomLevel(bounds, { height: height, width: 390 });
      // this.map.setZoom(z);
      this.mapZone.setCenter(bounds.getCenter());
      if (cordsArray.length === 1) {
        return this._markers[0];
      }
    }
  }

}
