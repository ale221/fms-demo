import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { FiltersService } from 'src/app/core/services/filters.service';
import { EntityService } from '../../services/entity.service';
import { FormService } from '../../services/FormService';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { BrandingService } from '../services/branding.service';
import { Options } from '@angular-slider/ngx-slider';
import { DateUtils } from 'src/app/Utils/DateUtils';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit {

  @Input() activePage;
  @Input() resetFilters;
  @Input() listedVehicles;
  @Input() poiField;
  @Input() vehicleFleet;

  theme;
  filtersForm: FormGroup;
  fleetsOptions;
  searchText;
  filtersParams;
  fleetCategories;
  fleetsVehiclesOptions;
  categoriesArr = [];
  statusArr = [];
  fleet_id = 0;
  poi_id = 0;
  zone_id = 0;
  route_id = 0;
  service_id = 0;
  m_status_id = 0;
  shift_id = 0;
  poiOptions;
  zoneOptions;
  routeOptions;
  selectedFleetOption;
  selectedVehicleOption;
  selectedPoiOption;
  selectedZoneOption;
  selectedRouteOption;
  selectedShiftOption;
  selectedMaintenanceStatus;
  categoryIds: any = [];
  vehicleOptions;
  useCaseId = 0;
  itemListMaintenanceType;
  selectedServiceOption;
  itemListMaintenanceStatus;
  shiftOptions;
  changeZoneName
  trackingDate: Date;
  filters = new filters();
  minValue: number = 0;
  maxValue: number = 23;
  options: Options = {
    floor: 0,
    ceil: 23,
    step: 1,
    minRange: 1,
    noSwitching: true
  };
  poiDropdownDisabled = false;
  selectedPoiString = '';

  keyUp = new Subject<KeyboardEvent>();
  constructor(private brandingService: BrandingService,
    private formBuilder: FormBuilder,
    private filtersService: FiltersService,
    private formService: FormService,
    private getUsecase: GetUsecaseService,
    private entityService: EntityService) {
    this.theme = this.brandingService.styleObject();
    this.useCaseId = this.getUsecase.getUsecaseId();
  }


  ngOnInit(): void {

    console.log("activePage in filters component==== ", this.activePage)


    this.getFleetFilters();
    if (this.activePage === 'fleets' || this.activePage === 'drivers' || this.activePage === 'playback') {
      this.getPOIFilters(null);
      this.getZonesFilters(null);
      this.getRoutesFilters(null);
    }

    if (this.activePage === 'maintenance') {
      this.getMaintenanceType();
      this.getMaintenanceStatus();
    }
    if (this.activePage === 'drivers') {
      this.getShifts();
    }

    // this.getFleetVehicleData(null);
    this.filtersForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      trackVehicle: [''],
      showLabels: [null],
      automaticZoom: [null],
      fleet_id: [null],
      type_id: [null],
      vehicle_id: [null],
      category_id: this.formBuilder.array([]),
      search_key: [''],
      maintenance_status_id: [null],
      poi_id: [null],
      zone_id: [null],
      route_id: [null],
      shift_id: [null],
      stop_time: [null],
      track_date: [null],
      start_time: [null],
      end_time: [null],
      playBackTimeInterval: [null],
    });

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
        this.filtersForm.get("search_key").setValue(this.searchText);
        this.setDropdownValuesForAPI();

      }
    });
    if (this.listedVehicles) {
      this.vehicleOptions = this.listedVehicles;
    }
  }

  // this.filtersForm.disable();

  showLabels() {
    this.filtersService.setValue(this.filtersForm.value);
  }

  ngOnChanges() {
    this.vehicleOptions = this.listedVehicles;
    if (this.filtersForm) {
      this.filtersForm.get("trackVehicle").setValue(false);
      this.filtersForm.get("automaticZoom").setValue(false);
    }
    if (this.resetFilters) {
      this.filtersForm.reset();

      this.selectedPoiOption = null
      this.selectedZoneOption = null
      this.selectedRouteOption = null
      this.selectedFleetOption = null


      this.categoryIds = this.filtersForm.controls['category_id'] as FormArray;
      this.categoryIds['value'] = [];
      this.fleetCategories = [];
      this.categoriesArr.forEach(element => {
        this.categoryIds['value'].push(false);
      })
    }
  }

  filterReset() {
    // debugger
    this.filtersForm.reset();
    this.categoryIds = this.filtersForm.controls['category_id'] as FormArray;
    this.categoryIds['value'] = [];
    this.fleetCategories = [];
    this.categoriesArr.forEach(element => {
      this.categoryIds['value'].push(false);
    })
  }

  categoryCheckbox(data, event) {
    if (event.target.checked) {
      this.categoriesArr.push(data.id)
    } else {
      this.categoriesArr.forEach((element, i) => {
        if (element === data.id) {
          this.categoriesArr.splice(i, 1);
        }
      });
    }
    this.categoryIds = this.filtersForm.controls['category_id'] as FormArray;
    this.categoryIds['value'] = [];
    this.categoriesArr.forEach(element => {
      this.categoryIds['value'].push(element);
    })
    this.setDropdownValuesForAPI();
  }

  verifyEndDate(event) {
    if (event) {
      const start_date = DateUtils.getYYYYMMDD(event);
      this.filtersForm.get("track_date").setValue(start_date);
      this.filtersService.setValue(this.filtersForm.value);
    }
  }

  statusCheckbox(event, value) {
    if (event.target.checked) {
      this.statusArr.push(value)
    } else {
      this.statusArr.forEach((element, i) => {
        if (element === value) {
          this.statusArr.splice(i, 1);
        }
      });
    }
    this.filtersForm.value.status = this.statusArr
    this.filtersForm.value.poi_name_custom = this.changeZoneName
    this.filtersService.setValue(this.filtersForm.value);
  }

  getFleetFilters() {
    this.entityService.getFleetFiltersDropdown().subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.fleetsOptions = apiResponse.data.data;
      }
    })
  }

  fleetOptionChange(event) {
    this.fleetCategories = event.value.category;
    this.fleet_id = event.value.id;
    this.selectedFleetOption = event.value;
    if (this.activePage === 'fleets') {
      this.poiDropdownDisabled = true;
      this.poiField = true;
      this.getPOIFilters(this.fleet_id);
      this.getZonesFilters(this.fleet_id);
      this.getRoutesFilters(this.fleet_id);
      this.filtersForm.value.poi_name_custom = this.changeZoneName;
      this.filtersForm.value.poi_id = this.changeZoneName;
    }
    if (this.activePage === 'playback') {
      this.vehicleOptions = event.value.vehicles;
    }
    this.filtersForm.get("fleet_id").setValue(this.selectedFleetOption);
    this.filtersForm.get("trackVehicle").setValue(false);
    this.filtersForm.get("automaticZoom").setValue(false);
    this.filtersForm.get("search_key").setValue('');
    // Reset dependent filters
    this.poi_id = null; this.selectedPoiOption = null;
    this.zone_id = null; this.selectedZoneOption = null;
    this.route_id = null; this.selectedRouteOption = null;
    this.filtersForm.get("category_id").setValue([]);
    this.categoriesArr = [];
    this.filtersForm.get("vehicle_id").setValue(null);
    if (this.activePage === 'fleets') {
      this.filtersForm.value.poi_name_custom = this.changeZoneName;
    }
    this.filtersService.setValue(this.filtersForm.value);
  }

  vehicleOptionChange(event) {
    this.filters.vechicleId = event.value.id;
    this.filtersService.setPlaybackValue(this.filters);
    this.filtersForm.get("vehicle_id").setValue(event.value);
    this.filtersService.setValue(this.filtersForm.value);
  }

  // getFleetVehicleData (params) {
  //   this.entityService.getFleetVehicles(params).subscribe(apiResponse => {
  //     if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
  //       // this.fleetsVehiclesOptions = apiResponse.data.data;
  //     }
  //   })
  // }

  getPOIFilters(params) {
    if (params) {
      params = '?fleet_id=' + params;
    }
    this.entityService.getPOIDropdown(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.poiOptions = apiResponse.data;
        if (this.activePage === 'playback' && this.poiOptions && this.poiOptions.length > 0) {
          this.poiOptions = this.poiOptions.filter(value => {
            return value.name === 'Fleets' || value.name === 'Drivers'
          });
        }
      }
    })
  }
  getZonesFilters(params) {
    if (params) {
      params = '?fleet_id=' + params;
    }
    this.entityService.getZonesDropdown(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        // this.zoneOptions = apiResponse.data;
      }
    })
  }
  getRoutesFilters(params) {
    if (params) {
      params = '?fleet_id=' + params;
    }
    this.entityService.getRoutesDropdown(params).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.routeOptions = apiResponse.data;
      }
    })
  }


  POIChange(event, playback) {
    this.changeZoneName = event.value.name;
    console.log("coming in POI CHange", this.changeZoneName)

    this.entityService.getPOIDropdownChange(this.changeZoneName).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.zoneOptions = apiResponse.data;
        this.filters.poi_id = this.changeZoneName;
        this.filtersService.setValue(this.filters);
        this.filtersService.setPlaybackValue(this.filters);
        console.log("filters in poi change", this.filters);
      }
    })
  }


  poiOptionChange(event, playback) {
    this.selectedPoiOption = event.value.name;
    this.selectedPoiString = event.value.name;
     console.log("eventtttttttt",event,"playbackkkkkk",playback );
    console.log("this.selectedPoiOption", this.selectedPoiOption);
    this.poi_id = event.value.id;
    this.filters.poi_id = this.poi_id;

    if (playback == 'playback') {
      console.log("this.selectedPoiOption1", this.selectedPoiOption);
      // this.filtersForm.reset();
      this.filtersService.setPlaybackPolyValue(this.filtersForm.value);
    } else if (playback == 'fleets' || playback === 'playbackAdditional') {
      console.log("this.selectedPoiOption2", this.selectedPoiOption);
      this.vehicleFleet = true;
      this.selectedPoiOption = event.value.id;
      this.POIChange(event, playback);
    } else {
      console.log("this.selectedPoiOption3", this.selectedPoiOption);
      this.filtersService.setPlaybackValue(this.filters);
      this.setDropdownValuesForAPI();
    }

  }

  zoneOptionChange(event, playback) {

    this.zone_id = event.value.id;
    this.selectedZoneOption = event.value.id;
    this.filters.zone_id = this.zone_id;

    if (playback == 'playback') {
      // this.filtersForm.reset();
      this.filtersService.setPlaybackPolyValue(this.filtersForm.value);
    } else if (playback == 'fleets') {
      this.filters.zone_id = this.zone_id;
      this.filters.poi_id = this.changeZoneName;
      this.filtersService.setValue(this.filters);
      this.filtersService.setPlaybackValue(this.filters);
    } else {
      this.filtersService.setPlaybackValue(this.filters);
      this.setDropdownValuesForAPI();
    }

  }

  routeOptionChange(event) {
    this.route_id = event.value.id;
    this.selectedRouteOption = event.value;
    this.setDropdownValuesForAPI();
  }

  changeRangeDate() {
    this.filters.start_time_range = this.filtersForm.get('playBackTimeInterval').value
    this.filtersService.setPlaybackValue(this.filters);
  }


  setDropdownValuesForAPI() {
    this.filtersForm.get('poi_id').setValue(this.selectedPoiOption)
    this.filtersForm.get('zone_id').setValue(this.selectedZoneOption)
    this.filtersForm.get('route_id').setValue(this.selectedRouteOption)
    this.filtersForm.get('fleet_id').setValue(this.selectedFleetOption)
    this.filtersForm.get("vehicle_id").setValue(null);
    this.filtersForm.get("trackVehicle").setValue(false);
    this.filtersForm.get("automaticZoom").setValue(false);
    this.filtersService.setValue(this.filtersForm.value);
  }

  followSelectedVehicle() {
    this.filtersService.setValue(this.filtersForm.value);
  }

  getMaintenanceType() {
    this.formService.getOptions('dropdown_data', { option_key: 'iof_maintenance' })
      .subscribe(apiResponse => {
        this.itemListMaintenanceType = apiResponse['response']['option_values'].map(
          item => ({ id: item['id'], name: item['label'] })
        );
      });
  }

  serviceOptionChange(event) {
    this.filtersForm.get("search_key").setValue('');
    this.service_id = event.value.id;
    this.selectedServiceOption = event.value;
    this.filtersForm.get('type_id').setValue(this.selectedServiceOption)
    this.filtersService.setValue(this.filtersForm.value);
  }

  getMaintenanceStatus() {
    const params = { option_key: 'iof_maintenance_status' };
    this.formService.getOptions('dropdown_data', params)
      .subscribe(apiResponse => {
        this.itemListMaintenanceStatus = apiResponse['response']['option_values'].map(
          item => ({ id: item['id'], name: item['label'] })
        );
      });
  }

  statusOptionChange(event) {
    this.filtersForm.get("search_key").setValue('');
    this.m_status_id = event.value.id;
    this.selectedMaintenanceStatus = event.value;
    this.filtersForm.get('maintenance_status_id').setValue(this.selectedMaintenanceStatus)
    this.filtersService.setValue(this.filtersForm.value);
  }

  getShifts() {
    this.entityService.getShiftDropdown().subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.shiftOptions = apiResponse['data']
      }
    })
  }

  shiftOptionChange(event) {
    this.selectedShiftOption = event.value;
    this.shift_id = event.value.id;
    this.filtersForm.get("search_key").setValue('');
    this.filtersForm.get("shift_id").setValue(event.value);
    this.filtersService.setValue(this.filtersForm.value);
  }

  selectDateRange(event, time_type) { //end_timef
    const formValue = this.filtersForm.value;
    if (time_type == 'start') {
      this.filters.start_time = event
    } else {
      this.filters.end_time = event
    }
    this.filters.stop_time = this.filtersForm.value.stop_time;
    // console.log("this.filters-- ", this.filters)
    this.filtersService.setPlaybackValue(this.filters);
  }

}

class filters {
  start_time: string;
  end_time: string;
  vechicleId: number;
  poi_id: any;
  zone_id: any;
  start_time_range: string;
  stop_time: number;
}
