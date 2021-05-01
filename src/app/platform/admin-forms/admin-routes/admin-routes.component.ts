import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FormService } from '../../services/FormService';
import { UserRoleEnum } from '../../enum/user-role.enum';
import { User } from '../../../core/model/user';
import { HttpController } from '../../../core/services/loading-controller';
import { ApiResponse, ApiResponseNew, LoginApiResponse } from '../../../core/model/api.response';
import { AppLoader } from '../../data/model/app-loader';
import { hypernymModules, iolModules } from '../../../core/model/module';
import { EntityType, EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
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
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { ErrorMessage } from '../../error-message';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { DrawerService } from 'src/app/core/services/drawer.service';
declare var $: any;
declare var google: any;

@Component({
  selector: 'app-admin-routes',
  templateUrl: './admin-routes.component.html',
  styleUrls: ['./admin-routes.component.css']
})
export class AdminRouteComponent implements OnInit {

  // Global Variables
  filtersRoute = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search_key: '' };
  searchForm: FormGroup;
  displayedRouteList = ["name", "is_poi", "status", "assigned_vehicles_count", "actions"];
  totalRouteListLength = 0;
  @ViewChild('routePaginator') routePaginator: MatPaginator;
  showIndeterminateProgress: boolean;
  routeList;
  EntityType = EntityType;
  EntityStatusEnum = EntityStatusEnum;
  inactiveRecord;
  formTitle = 'Add Route';
  theme;
  routesForm: FormGroup;
  @ViewChild('viewMap')
  vMap: GoogleMapComponent;
  @ViewChild('binMap') binMap: GoogleMapComponent;
  @ViewChild('gmap') gmapElement: any;
  @ViewChild('closeForm') private closeForm;
  @ViewChild('editpop') private editpop;
  map: google.maps.Map;
  itemListTerritoryType = [];
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
  });

  isAuthorized = false;
  btnLoading: boolean;
  btnText: string;
  selectedshape: any = null;
  selectedTerritory: any = null;
  territoryPath = null;
  submitted: boolean;
  selectedTruck = [];
  selectedFleet = [];
  itemListTrucks = [];
  itemListFleets = [];
  filtersTruck = { limit: 0, offset: 0, order_by: '', order: '' };
  filtersFleet = { limit: 0, offset: 0, order_by: '', order: '' };

  markerCount = 0;
  errorMessages: string[];
  loggedInUser;
  source_latlong = null;
  destination_latlong = null;
  keyUp = new Subject<KeyboardEvent>();
  searchText;
  breadcrumbInner=[];
  sidebarCheck;

  constructor(private userService: UserService, private router: Router,
    private authService: AuthService,
    private swalService: SwalService,
    private formService: FormService,
    private formBuilder: FormBuilder,
    private brandingService: BrandingService,
    private datatableService: DatatableService,
    private breadcrumbService:BreadcrumbsService,
    private drawerService:DrawerService) {

    this.searchForm = this.formBuilder.group({
      search: ['']
    })

    this.routesForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: ['', [Validators.required, CustomValidators.isAlphabetsAndNumbers]],
      vehicles: [null, [Validators.required]],
      // fleet_list: [null, [Validators.required]],
      // description: [null, [Validators.required]],
      is_poi: [false],
      source_latlong: [null],
      destination_latlong: [null],
      status: [1]
      // This field doesn't actually exist on the form. This is just to carry out form validation effieciently.
      // territory: [null, Validators.required],
    });

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
    this.getRoutes(this.filtersRoute);
    this.getGeoFenceTypes();
    this.getTruckList(this.filtersTruck);
    // this.getFleetList(this.filtersFleet);

    // this.getTerritories(this.filterTerritory);
    // this.initMap();

    this.setupDrawingTools();

    this.keyUp.pipe(
      map(event => event.target['value']),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(newValue => {
      this.searchText = newValue;
      if (this.searchText.length > 3 || this.searchText.length === 0) {
        this.filtersRoute.search_key = this.searchText;
        this.getRoutes(this.filtersRoute)
      }
    });

  }

  ngAfterViewInit(): void {
    const mapProp = {
      center: { lat: 33.6844, lng: 73.047 },
      zoom: 6,
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
    console.log("this.map (after adding map)= ", this.map)
  }

  getRoutes(filters) {
    this.showIndeterminateProgress = true;
    let params = `type_id=${filters.type_id}&limit=${filters.limit}&offset=${filters.offset}&order=${filters.order}&order_by=${filters.order_by}&search_key=${filters.search_key}`;

    this.formService.getRoutes(params).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      if (data.status === HttpStatusCodeEnum.Success) {
        this.routeList = data['data'].data;
        this.totalRouteListLength = data['data'].count;
        this.routeList.pagination = this.totalRouteListLength;
      } else {
        console.log(data.message);
      }
      console.log("this.routeList[]= ", this.routeList);
    });
  }

  onClearSearch() {
    this.searchForm.reset();
    this.searchForm.get('search').setValue('');
    this.filtersRoute = { type_id: 213, limit: 10, offset: 0, order_by: '', order: '', search_key: '' };
    this.getRoutes(this.filtersRoute);
  }

  openEditModal(data) {
    this.binMap.resetMap();
    this.formTitle = 'Update Route';
    this.btnText = "Update";
    this.inactiveRecord = false;
    this.routesForm.patchValue(data)
    this.routesForm.get('status').setValue(data.status === 1 ? true : false);
    this.source_latlong = data.source_latlong;
    this.destination_latlong = data.destination_latlong;

    let inputDiv = $('#pac-input');

    setTimeout(() => {
      inputDiv.val('')
      inputDiv.focus();
    }, 10);

    this.selectedTruck = [];
    for (let i = 0; i < data.assigned_vehicles.length; i++) {
      this.selectedTruck.push(new DropDownItem(data.assigned_vehicles[i]['id'], data.assigned_vehicles[i]['name']));
    }

    this.selectedshape = data.source_latlong;

    if (!isNullOrUndefined(this.source_latlong) && !isNullOrUndefined(this.destination_latlong)) {
      let tasksArr = [];
      let waypts = [];
      let icons_u = [];
      let infowindow = [];
      let source = (this.source_latlong);
      let destination = (this.destination_latlong);
      this.routesForm.patchValue({
        source_latlong: JSON.stringify(this.source_latlong),
        destination_latlong: JSON.stringify(this.destination_latlong)
      })

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

  onSearch(formValue) {
    this.filtersRoute.search_key = this.searchForm.get('search').value;
    this.getRoutes(this.filtersRoute);
  }

  sortRouteList(event) {
    this.filtersRoute.order_by = event.active;
    this.filtersRoute.order = event.direction;
    this.getRoutes(this.filtersRoute);
  }
  onRouteListPagination(event) {
    this.filtersRoute.offset = (event.pageIndex * event.pageSize);
    this.getRoutes(this.filtersRoute);
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save';
  }
  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  addNew() {
    this.formTitle = 'Add Route';
    this.enableSubmitButton();
    this.inactiveRecord = false;
    this.selectedTruck = [];
    this.routesForm.reset();
    this.resetMap();
    this.setupDrawingTools();
    this.submitted = false;
    let inputDiv = $('#pac-input');

    setTimeout(() => {
      inputDiv.val('')
      inputDiv.focus();
    }, 10);
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
      this.routesForm.patchValue({ territory: JSON.stringify(arr) });
      if (!isNullOrUndefined(this.selectedshape)) { this.drawingManager.setMap(null); }
    });
  }

  resetMap() {
    this.binMap.resetMap();
    this.source_latlong = null;
    this.destination_latlong = null;
    this.markerCount = 0;
    this.routesForm.patchValue({
      source_latlong: null,
      destination_latlong: null
    })
  }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.routesForm.get('name').hasError('required')) {
      this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.routesForm.get('name').hasError('isAlphabetsAndNumbers')) {
      this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }

    // if (this.territoryForm.get('trucks_list').hasError('required')) {
    //   this.errorMessages.push('Vehicles ' + ErrorMessage.REQUIRED);
    //   isValid = false;
    // }

    if (this.routesForm.get('vehicles').hasError('required')) {
      this.errorMessages.push('Vehicles ' + ErrorMessage.REQUIRED);
      isValid = false;
    }

    if (isNullOrUndefined(this.destination_latlong)) {
      isValid = false;
      this.swalService.getWarningSwal('Please select route points!');
    }
    return isValid;
  }

  onSubmit(formValue) {
    this.submitted = true;
    if (this.validate()) {
      const id = this.routesForm.getRawValue().id;

      this.disableSubmitButton();
      if (isNullOrUndefined(id)) {
        this.postRoute(formValue);
      } else {
        formValue.id = id;
        this.patchRoute(formValue);
      }
    }
  }

  postRoute(data) {
    data.status = 1;
    data.is_poi = (data.is_poi === null || data.is_poi === false) ? false : true;
    this.formService.createRoutes(data).subscribe((apiResponse: any) => {
      this.enableSubmitButton();
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal('Route created successfully');
        this.getRoutes(this.filtersRoute);
        this.closeForm.nativeElement.click();
      } else {
        this.swalService.getErrorSwal(apiResponse.message);
        this.btnText = 'Save';
        this.btnLoading = false;
      }
    })
  }

  patchRoute(data) {
    data.status = data.status === true ? 1 : 2;
    data.is_poi = (data.is_poi === null || data.is_poi === false) ? false : true;
    this.formService.updateRoute(data).subscribe((apiResponse: any) => {
      this.enableSubmitButton();
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal('Route updated successfully');
        this.getRoutes(this.filtersRoute);
        this.closeForm.nativeElement.click();
      } else {
        this.swalService.getErrorSwal(apiResponse.message);
        this.btnText = 'Update';
        this.btnLoading = false;
      }
    })
  }

  getTruckList(filtersTruck) {
    let params = `limit=${filtersTruck.limit}&offset=${filtersTruck.offset}&order=${filtersTruck.order}&order_by=${filtersTruck.order_by}`;
    console.log("params for getVehicleList= ", params);

    this.formService.getVehiclesListNew(params).subscribe((data: any) => {
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

  // getFleetList(filtersFleet) {
  //   let params = `limit=${filtersFleet.limit}&offset=${filtersFleet.offset}&order=${filtersFleet.order}&order_by=${filtersFleet.order_by}`;

  //   this.showIndeterminateProgress = true;
  //   console.log("params for fleet tab= ", params)

  //   this.formService.getFleetsList(params).subscribe((data: any) => {
  //     console.log("getFleetsList() response= ", data);

  //     if (!data.error) {
  //       this.itemListFleets = data['data'].data;
  //       console.log("this.itemListFleets= ", this.itemListFleets);

  //     } else {
  //       this.swalService.getErrorSwal(data.message);
  //     }
  //   }
  //   );
  // }

  mapClicked(event) {
    console.log("mapclicked", event);
    if (event.latLng) {
      this.binMap.placeMarkerAndPanTo(event.latLng);
      // { "lat": 33.65775396431903, "lng": 73.04599508781457 }
      this.selectedshape = event;
      if (this.markerCount === 0) {
        this.markerCount = 1;
        this.source_latlong = JSON.stringify({ 'lat': event.latLng.lat(), 'lng': event.latLng.lng() });
      } else {
        this.destination_latlong = JSON.stringify({ 'lat': event.latLng.lat(), 'lng': event.latLng.lng() });
      }
      this.routesForm.patchValue({
        source_latlong: this.source_latlong,
        destination_latlong: this.destination_latlong
      })
      const directionsService = new google.maps.DirectionsService;
      const directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
      });


      let start_pos = '';
      let end_pos = '';

      if (this.destination_latlong) {
        let tasksArr = [];
        let waypts = [];
        let source = JSON.parse(this.source_latlong);
        let destination = JSON.parse(this.destination_latlong);

        start_pos = source.lat + "," + source.lng;
        end_pos = destination.lat + "," + destination.lng;

        tasksArr.push(new google.maps.LatLng(source.lat, source.lng))
        tasksArr.push(new google.maps.LatLng(destination.lat, destination.lng))

        var checkboxArray = tasksArr;
        for (var i = 0; i < checkboxArray.length; i++) {
          waypts.push({
            location: checkboxArray[i],
            stopover: true
          });
        }

        setTimeout(() => {
          this.binMap.createRouteWithMultipleWaypoints(directionsService, directionsDisplay, start_pos, end_pos, this, waypts);
        }, 500);
      }
    }
  }


  // Swal dialog for Delete/inactive
  async showSwal(route) {
    const shouldDelete = await this.swalService.getDeleteSwal(route, 'What do you want to do with this record?');

    if (shouldDelete) {
      const message = shouldDelete === EntityStatusEnum.Delete ? ' deleted ' : ' marked inactive ';
      this.confirmDelete(route.id, shouldDelete, 'Record has been' + message + 'successfully');
    }
  }

  confirmDelete(territoryId, actionType, message?) {
    let params = {
      'id': territoryId,
      'status': actionType
    }

    let showMessage: string = '';
    if (actionType == 2) {
      showMessage = 'Record updated successfully'
    } else {
      showMessage = 'Record deleted successfully'
    }

    this.formService.deleteRoute(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal(showMessage); //data.message
        this.getRoutes(this.filtersRoute);
      } else {
        this.swalService.getErrorSwal(data.message);
      }
    });

  }

  // deleteRoute(id, actionType, message?) {

  //   let params = {
  //     'id': id,
  //     'status': actionType
  //   }
  //   console.log("params== ", params)

  //   this.formService.deleteRoute(params).subscribe((data: any) => {
  //     if (data.status === HttpStatusCodeEnum.Success) {
  //       this.swalService.getSuccessSwal(data.message);
  //       this.getRoutes(this.filtersRoute);
  //     } else {
  //       this.swalService.getErrorSwal(data.message)
  //     }
  //   });
  // }

}
