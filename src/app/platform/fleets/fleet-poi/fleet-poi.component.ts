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
declare var $: any;

@Component({
  selector: 'app-fleet-poi',
  templateUrl: './fleet-poi.component.html',
  styleUrls: ['./fleet-poi.component.css']
})
export class FleetPoiComponent implements OnInit {

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
  zones = [];
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
  // @ViewChild('gmap') gmapElement: any;
  @ViewChild('binMap') binMap: GoogleMapComponent;
  map: google.maps.Map;
  mapZone: google.maps.Map;
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

  selected_poi_type = '';

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
  breadcrumbInner=[];
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
  formTitle = 'Add POI';

  hashMap: any = {};
  deleteAllButton: boolean;
  csvCols: any[];
  csvRows: any[];

  theme;

  zoneAccess = [
    new PrimengDropdownItem(73, 'Marker'),
    // new PrimengDropdownItem(6, 'Zone')
    // new PrimengDropdownItem(73, 'Route'),
  ];

  selectedPOI;

  // Added by wahab
  searchForm: FormGroup;
  filterTerritory = { type_id: 6, limit: 10, offset: 0, order_by: '', order: '', search: '', zone_id: '' };
  displayedPoiList = ["name", "status", "poi_type", "actions"];
  @ViewChild('territoryPaginator') territoryPaginator: MatPaginator;

  @ViewChild('gmapZone') gmapElementZone: any;
  @ViewChild(GoogleMapComponent) poiMap: GoogleMapComponent;

  totalTerritoryLength = 0;
  submitted: boolean;
  filtersTruck = { limit: 0, offset: 0, order_by: '', order: '' };

  markerCount = 0;
  source_latlong = null;
  destination_latlong = null;
  isAuthorized = false;
  loggedInUser;
  keyUp = new Subject<KeyboardEvent>();
  searchText;
  sidebarCheck;
  constructor(public formBuilder: FormBuilder,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private swalService: SwalService,
    private datatableService: DatatableService,
    private brandingService: BrandingService,
    public formService: FormService,
    private breadcrumbService : BreadcrumbsService,
    private drawerService : DrawerService) {

    this.searchForm = this.formBuilder.group({
      search: [''],
      // filter_type:['']
    })

    this.territoryForm = this.formBuilder.group({
      id: [],
      name: ['', [Validators.required]],
      poi_radius: [],
      zone: [],
      // description: [],
      poi_type: ['', [Validators.required]],
      status_id: [1]

      // is_poi: false
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
      // console.log("ressssssssssssss1",res);
    // console.log("ressssssssssssss2",this.sidebarCheck);
  })

    this.breadcrumbService.getValue().subscribe(res => {
      if (res && res.length) {
        this.breadcrumbInner = []
        this.breadcrumbInner = res;
        this.breadcrumbInner[0] = `${res[0]}`;
        // console.log("this.breadcrumbInner",this.breadcrumbInner);
      }
    })

    // console.log("this.breadcrumbInner",this.breadcrumbInner);
  if(this.breadcrumbInner[0]=='admin/config'){
    setTimeout(() => {
      this.editpop.nativeElement.click();
    }, 1000);
  }
    this.loggedInUser = this.authService.getUser();
    //
    this.deleteAllButton = false;
    this.getGeoFenceTypes();
    this.getTruckList(this.filtersTruck);   //for vehicles

    this.initMap();
    this.setupDrawingTools();
    this.getZone();

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

        this.filterTerritory.search = this.searchForm.get('search').value;
        this.getTerritories(this.filterTerritory);
      }
    });
  }

  ngAfterViewInit(): void {
    // this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });

    setTimeout(() => {
      // const mapProp = {
      //   center: { lat: 25.3548, lng: 51.1839 },
      //   zoom: 9,
      // };
      // this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
      // this.mapZone = new google.maps.Map(this.gmapElementZone.nativeElement, mapProp);
      //
      this.getTerritories(this.filterTerritory);
    }, 1000);


  }

  // Initialize google map
  initMap() {
    //
    // const mapProp = {
    //   center: { lat: 33.6844, lng: 73.047 },
    //   zoom: 6,
    // };
    // const mapProp = GoogleMapModel.getMapProp();
    // this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    //
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
      this.territoryPath = JSON.stringify(arr);
      this.territoryForm.patchValue({ territory: JSON.stringify(arr) });
      if (!isNullOrUndefined(this.selectedshape)) { this.drawingManager.setMap(null); }
    });

    google.maps.event.addListener(this.drawingManager, 'circlecomplete', (event) => {
      this.selectedshape = event;
      let params = {
        radius: this.selectedshape.getRadius(),
        lat: this.selectedshape.getCenter().lat(),
        lng: this.selectedshape.getCenter().lng(),
      }
      this.territoryPath = JSON.stringify(params);
      this.territoryForm.patchValue({ territory: JSON.stringify(params) });
      if (!isNullOrUndefined(this.selectedshape)) { this.drawingManager.setMap(null); }
    });
  }

  getTruckList(filtersTruck) {
    let params = `limit=${filtersTruck.limit}&offset=${filtersTruck.offset}&order=${filtersTruck.order}&order_by=${filtersTruck.order_by}`;


    this.formService.getVehiclesList(params)
      .subscribe((data: any) => {

        if (!data.error) {
          this.itemListTrucks = data['data'].data.map(
            item => new DropDownItem(item['id'], item['name'])
          );

        } else {
          this.swalService.getErrorSwal(data.message);
        }

      }
      );
  }

  getZone() {
    let param = { poi: "Zones" }
    this.formService.getZone(param)
      .subscribe((data: any) => {

        if (!data.error) {
          this.zones = data['data'];
          this.zones.forEach(element => {
            element.label = element.name;
            element.value = element.id;
          });
        } else {
          this.swalService.getErrorSwal(data.message);
        }

      }
      );
  }

  getGeoFenceTypes() {
    this.formService.getOptions('dropdown_data', { option_key: 'territorytype' })
      .subscribe((data: any) => {

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
    this.formTitle = 'Add POI';
    this.submitted = false;
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.selectedTruck = [];
    this.territoryForm.reset();
    this.resetMap();
    this.setupDrawingTools();

    let inputDiv = $('#pac-input');

    setTimeout(() => {
      inputDiv.val('')
      inputDiv.focus();
    }, 10);
  }
  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.territoryForm.get('poi_type').hasError('required')) {
      this.errorMessages.push('Poi Type ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.territoryForm.get('name').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.territoryForm.get('poi_radius').hasError('required')) {
      this.errorMessages.push('Radius ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.territoryForm.get('poi_radius').value < 50) {
      this.errorMessages.push('POI Radius ' + ErrorMessage.REQUIRED);
      isValid = false;
    }


    if (isNullOrUndefined(this.selectedshape)) {
      isValid = false;
      this.swalService.getWarningSwal('Please select a drop marker first!');
    }
    return isValid;
  }

  onSubmit(formValue: Object) {

    this.submitted = true;
    if (this.validate()) {


      const id = formValue['id'];
      this.disableSubmitButton();

      if (id) {
        this.patchpoi(formValue);
      } else {
        this.postPoi(formValue);
      }
    } else {

    }
  }
  postPoi(formValue): void {
    formValue['type_id'] = EntityType.TERRITORY;
    formValue['source_latlong'] = this.source_latlong;
    formValue['type_id'] = 73;
    formValue['is_poi'] = true;
    formValue['status_id']=1;
    delete formValue['id'];
    if (formValue['zone'] != null) {
      this.formService.postPoiZone(formValue).subscribe((data: any) => {

        this.enableSubmitButton()
        if (data.status === HttpStatusCodeEnum.Success) {
          this.submitted = false;
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal("Record added successfully"); //data.message
          this.getTerritories(this.filterTerritory);
        } else {
          this.swalService.getErrorSwal(data.message);

        }

      });
    } else {
      this.formService.postPoi(formValue)
        .subscribe((data: any) => {

          this.enableSubmitButton()
          if (data.status === HttpStatusCodeEnum.Success) {
            this.submitted = false;
            this.closeForm.nativeElement.click();
            this.swalService.getSuccessSwal("Record added successfully"); //data.message
            this.getTerritories(this.filterTerritory);
          } else {
            this.swalService.getErrorSwal(data.message);

          }

        })
    }
  }
  mapClicked(event) {
    if (event.latLng) {
      this.selectedshape = event;
      this.binMap.placeMarkerAndPanTo(event.latLng);
      if (this.selectedTerritory && this.selectedTerritory.id) {
        this.source_latlong = ({ 'lat': event.latLng.lat(), 'lng': event.latLng.lng() });
      } else {
        this.source_latlong = JSON.stringify({ 'lat': event.latLng.lat(), 'lng': event.latLng.lng() });
      }
      this.territoryForm.patchValue({
        source_latlong: this.source_latlong
      })
    }
  }

  TypeChanged(event) {
    this.filterTerritory.zone_id = event.value;
    this.getTerritories(this.filterTerritory);
    // this.zone_access_type = event.value;
    //
  }

  inputValue = '';
  getTerritories(filter): void {
    const mapProp = {
      center: { lat: 25.3548, lng: 51.1839 },
      zoom: 12,
    };

    setTimeout(() => {
      this.mapZone = new google.maps.Map(this.gmapElementZone.nativeElement, mapProp);

      this.searchPlaceHolder = 'Loading...';
      this.enableSearch = true;
      this.showIndeterminateProgress = true;
      this.territories = [];

      let params = `type_id=${filter.type_id}&limit=${filter.limit}&offset=${filter.offset}&order=${filter.order}&order_by=${filter.order_by}&search=${filter.search}&zone_id=${filter.zone_id}`;


      this.formService.getPois(params)
        .subscribe((data: any) => {

          this.showIndeterminateProgress = false;

          if (data.status === HttpStatusCodeEnum.Success) {

            // this.results_remaining = data.remaining;
            // this.territories = [...this.territories, ...data.response];

            this.territories = data['data'].data;
            this.totalTerritoryLength = data['data'].count;
            this.territories.pagination = this.totalTerritoryLength

            // this.populateHashmap(data.response);
            this.temp = this.territories;

            if (this.totalTerritoryLength > 0) {
              let taskAry = [];
              let infowindow = [];
              for (let i = 0; i < this.territories.length; i++) {
                if (this.territories[i].source_latlong) {
                  taskAry.push(this.territories[i].source_latlong);
                  let info = `Name : ${this.territories[i].name}`;
                  infowindow.push(info);
                }
              }


              this._markers = [];

              this.createMarkers(taskAry, null, infowindow, 'mouseover', null, null, 12);
            }

            // let source = (this.source_latlong);
            //
            // if (source && source.lat && source.lng) {
            //   const latLng = new google.maps.LatLng(source.lat, source.lng)
            // }

            // this.drawGeozones(JSON.parse(this.territories.territory));
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
    }, 1000);


  }

  populateHashmap(list) {
    for (const entry of list) {
      this.hashMap[entry.id] = false;
    }

  }
  getprogress(area) {
    return this.hashMap[area.id];
  }

  // Update call for Bin
  patchpoi(territory) {

    territory['status_id'] = territory.status_id === true ? 1 : 2;
    territory['id'] = territory.id;

    if (this.selected_poi_type !== 'Routes') {
      territory['source_latlong'] = JSON.stringify(this.source_latlong);
    }

    // territory['type'] = EntityType.TERRITORY;


    this.formService.patchPoi(territory).subscribe((data: any) => {

      this.enableSubmitButton()
      if (data.status === HttpStatusCodeEnum.Success) {
        this.submitted = false;
        this.closeForm.nativeElement.click();
        this.swalService.getSuccessSwal("Record updated successfully"); //data.message
        this.getTerritories(this.filterTerritory);
      } else {

        this.swalService.getErrorSwal(data.message);
      }
    })
  }

  openEditModal(territory, readOnly = false) {

    this.territoryForm.get('status_id').setValue(territory.status === 1 ? true : false);
    this.binMap.resetMap();

    this.selected_poi_type = '';

    // this.binMap.resetMap();
    this.formTitle = 'Update POI';
    this.btnText = "Update";
    this.inactiveRecord = this.disableButton(territory);
    this.source_latlong = territory.source_latlong;

    if (territory.poi_type === 73) {
      this.selectedPOI = { value: 73, label: 'Marker' }
    } else {
      this.selectedPOI = { value: 6, label: 'Zone' }
    }
    this.territoryForm.patchValue({
      id: territory.id,
      name: territory.name,
      trucks_list: this.selectedTruck,
      description: territory.description,
      is_poi: territory.is_poi,
      poi_type: territory.poi_type,
      poi_radius: territory.poi_radius
    });

    
    if (territory.poi_type_name === 'Zones') {
      this.binMap.drawTerritory(territory.territory, territory.territory.name)
    }

    this.selected_poi_type = territory.poi_type_name;

    if (territory.poi_type_name === 'Routes') {
      this.source_latlong = territory.source_latlong;
      this.destination_latlong = territory.destination_latlong;
      if (!isNullOrUndefined(this.source_latlong) && !isNullOrUndefined(this.destination_latlong)) {
        let tasksArr = [];
        let waypts = [];
        let icons_u = [];
        let infowindow = [];
        let source = (this.source_latlong);
        let destination = (this.destination_latlong);
  
        tasksArr.push(new google.maps.LatLng(source.lat, source.lng))
        tasksArr.push(new google.maps.LatLng(destination.lat, destination.lng));
  
        infowindow.push('Start Point');
        infowindow.push('End Point');
  
        let start_pos = '';
        let end_pos = '';
  
        start_pos = source.lat + "," + source.lng;
        end_pos = destination.lat + "," + destination.lng;
  
  
        icons_u.push(null);
        icons_u.push(null);
        var checkboxArray = tasksArr;
        for (var i = 0; i < checkboxArray.length; i++) {
          waypts.push({
            location: checkboxArray[i],
            stopover: true
          });
        }
        const directionsService = new google.maps.DirectionsService;
        const directionsDisplay = new google.maps.DirectionsRenderer({
          suppressMarkers: true
        });
  
        setTimeout(() => {
          this.binMap.createMarkers(tasksArr, icons_u, infowindow, 'mouseover', 40, 30, 12);
          this.binMap.createRouteWithMultipleWaypoints(directionsService, directionsDisplay, start_pos, end_pos, this, waypts);
        }, 500);
  
      }
    }

    if (!isNullOrUndefined(this.source_latlong)) {
      const latLng = new google.maps.LatLng(this.source_latlong.lat, this.source_latlong.lng)
      this.binMap.createMarker(latLng, null, '', 'Name:' + territory.name, 'mouseover', 12);
    }

    // this.enableSubmitButton();
    // this.resetMap();
    // let stringTerrotory = JSON.parse(territory.territory);
    // if (stringTerrotory && stringTerrotory.radius) {
    //   this.drawShapeCircle(territory.territory);
    // } else {
    //   this.drawShape(territory.territory);
    //   if (readOnly) { this.vMap.drawTerritory(territory.territory); }
    // }
    // this.drawingManager.setMap(null);
    // this.selectedTerritoryType = [{ id: territory.territory_type_id, itemName: territory.territory_type }];
    // this.selectedTruck = [];
    // for (let i = 0; i < territory.assigned_truck.length; i++) {
    //   // this.selectedTruck.push({id: territory.assigned_truck[i]['id'], itemName: territory.assigned_truck[i]['name'], code: territory.assigned_truck[i]['id'], name: territory.assigned_truck[i]['name']});
    //   this.selectedTruck.push(new DropDownItem(territory.assigned_truck[i]['id'], territory.assigned_truck[i]['name']));
    // }
    // this.territoryForm.patchValue({
    //   id: territory.id,
    //   name: territory.name,
    //   trucks_list: this.selectedTruck,
    //   description: territory.description,
    // });
    this.selectedTerritory = territory;
    this.selectedshape = territory;
  }

  // Swal dialog for Delete/inactive
  async showSwal(territory) {
    const shouldDelete = await this.swalService.getDeleteSwal(territory, 'What do you want to do with this record?');


    if (shouldDelete) {

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

    this.formService.deletePoi(params).subscribe((data: any) => { //{ 'id': [territoryId] }
      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal("Deleting zone (poi) will delete it from everywhere"); //data.message
        this.binMap.resetMap();
        this.setupDrawingTools();
        this.getTerritories(this.filterTerritory);
        this.inputValue = '';
        this.selectedRows = [];
      } else {

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
          this.getTerritories(this.filterTerritory);
          this.inputValue = '';
          this.selectedRows = [];
        } else {

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
    this.binMap.resetMap();
    this.source_latlong = null;
    this.destination_latlong = null;
    this.markerCount = 0;
    this.selectedshape = null;
    this.territoryForm.patchValue({
      source_latlong: null,
      destination_latlong: null
    })
  }

  drawShapeCircle(cords) {
    this.resetMap();
    const bounds = new google.maps.LatLngBounds();
    const obj = JSON.parse(cords);
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

    circleShape.setMap(this.binMap);
    // this.map.setZoom(12);
    this.selectedshape = circleShape;
    this.territoryPath = cords;
  }


  drawShape(cords) {
    this.resetMap();
    const bounds = new google.maps.LatLngBounds();
    const arr = [];
    const obj = JSON.parse(cords);
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
    // this.map.fitBounds(bounds);
    // this.map.setZoom(z);
    this.map.setCenter(bounds.getCenter());
    this.selectedshape = polygonShape;
    this.territoryPath = JSON.stringify(arr);
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
    if (geozones && geozones.length > 0) {
      geozones.forEach(element => {
        if (!element.radius) {
          this.drawTerritory(element.territory, element.name)
        }
      });
    }
  }

  drawTerritory(cords, title?, opts?, height = 250) {
    // this.resetMap();
    const bounds = this.bounds;
    // let bounds = new google.maps.LatLngBounds();
    const arr = [];
    let cordsArray = [];
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

      polygonShape.setMap(this.map);
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
          this.myInfowindow.setContent('Territory Name: ' + title);
          this.myInfowindow.setPosition(event.latLng);
          this.myInfowindow.open(this.map);
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
    // this.map.fitBounds(bounds);
    // const z = this.getBoundsZoomLevel(bounds, { height: height, width: 390 });
    // this.map.setZoom(z);
    this.map.setCenter(bounds.getCenter());
    if (cordsArray.length === 1) {
      return this._markers[0];
    }
  }

  updateFilter(value) {

    this.filterTerritory.search = value;
    this.getTerritories(this.filterTerritory);
  }
  onClearSearch() {
    this.searchForm.reset();
    this.filterTerritory.zone_id = '';
    this.filterTerritory.search = '';
    this.getTerritories(this.filterTerritory);
    var params;
  }

  createMarkers(positions, iconUrl = null, info, actionType = 'mouseover', height = 50, width = 50, zoom?, markerHW?) {
    let position;

    for (let i = 0; i < positions.length; i++) {
      if (typeof (positions[i]) === 'string') {
        position = this.getLatLngFromString(positions[i]);
      } else {
        position = positions[i];
      }
      const marker = new google.maps.Marker({
        position: position,
        map: this.mapZone
      });
      marker.addListener(actionType, event => {
        this.myInfowindow.setContent((info[i]));
        this.myInfowindow.open(this.mapZone, marker);
      });
      // this.dict_map['infoWinObj'] = info[i];
      // this.dict_map['markerObj'] = marker;

      //push JSON dict in array
      // this.allInfoWindows.push(this.dict_map);

      if (actionType === 'mouseover') {
        marker.addListener('mouseout', event => {
          this.myInfowindow.close();
        });
      }
      marker.addListener(actionType, event => {
        this.myInfowindow.setContent((info[i]));
        this.myInfowindow.open(this.mapZone, marker);
      });

      if (actionType === 'mouseover') {
        marker.addListener('mouseout', event => {
          this.myInfowindow.close();
        });
      }

      if (markerHW && markerHW.length > 0) {
        height = markerHW[i];
        width = markerHW[i];
      }

      this._markers.push(marker);

      let x = marker.getPosition()

      if (x.lat() && x.lng()) {
        this.bounds.extend(marker.getPosition());
      }

      if (iconUrl instanceof Array) {
        const icon = this.createIcon(iconUrl[i], height, width);
        marker.setIcon(icon);
      } else if (iconUrl) {
        const icon = this.createIcon(iconUrl, height, width);
        marker.setIcon(icon);
      } else {
        marker.setIcon(null);
      }
    }

    if (zoom && this.mapZone) {
      this.mapZone.setZoom(zoom);
    }

    if (this.bounds && this.mapZone) {
      this.mapZone.fitBounds(this.bounds);
    }

    // if (position.length < 2) {
    //   this.map.setZoom(12);
    // }
    // let z = this.getBoundsZoomLevel(bounds,{height: this.height, width: 390});
    // this.map.setZoom(z);
    // this.map.setCenter(this.bounds.getCenter());

    return this._markers;

  }
  getLatLngFromString(ll) {
    const latlng = ll.split(/, ?/);
    //
    const loc = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
    //
    return new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
  }

  createIcon(url, height = 50, width = 50) {
    const icon = {
      url: url,
      scaledSize: new google.maps.Size(width, height), // scaled size
    };
    return icon;
  }

}

