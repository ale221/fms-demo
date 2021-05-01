import { Component, OnInit, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { FiltersService } from 'src/app/core/services/filters.service';
import { EntityService } from '../../services/entity.service';
import { FormService } from '../../services/FormService';
import { BrandingService } from '../services/branding.service';

@Component({
  selector: 'app-admin-filters',
  templateUrl: './admin-filters.component.html',
  styleUrls: ['./admin-filters.component.css']
})
export class AdminFiltersComponent implements OnInit {

  @Input() activePage;
  @Input() activeTab;
  @Input() resetFilters;
  @Input() listedVehicles;
  theme;

  searchForm: FormGroup;

  keyUp = new Subject<KeyboardEvent>();

  constructor(private brandingService: BrandingService,
    private formBuilder: FormBuilder,
    private filtersService: FiltersService,
    private formService: FormService,
    private entityService: EntityService) {

    console.log("INSIDE ADMIN FILTER COMPONENT")
    this.theme = this.brandingService.styleObject();

  }

  ngOnInit(): void {
    console.log("this.activePage====== ", this.activePage);
    console.log("this.activeTab====== ", this.activeTab);

    this.searchForm = this.formBuilder.group({
      modalNumber: [null]
    });

    if (this.activePage === 'vehicle') {
      // this.getPOIFilters(null);
      // this.getZonesFilters(null);
      // this.getRoutesFilters(null);
    }

    if (this.activePage === 'territory') {
      // this.getMaintenanceType();
      // this.getMaintenanceStatus();
    }



    this.keyUp.pipe(
      map(event => event.target['value']),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(newValue => {
      // this.searchText = newValue;
      // this.filtersForm.get("search_key").setValue(this.searchText);
      // this.setDropdownValuesForAPI();
    });
  }

  ngOnChanges() {
    // this.vehicleOptions = this.listedVehicles;
    // if (this.filtersForm) {
    //   this.filtersForm.get("trackVehicle").setValue(false);
    //   this.filtersForm.get("automaticZoom").setValue(false);
    // }
    if (this.resetFilters) {
      // this.filtersForm.reset();
      // this.categoryIds = this.filtersForm.controls['category_id'] as FormArray;
      // this.categoryIds['value'] = [];
      // this.fleetCategories = [];
      // this.categoriesArr.forEach(element => {
      //   this.categoryIds['value'].push(false);
      // })
    }
  }

  openTabModal(modal) {
    this.searchForm.get("modalNumber").setValue(modal);
    this.filtersService.setValue(this.searchForm.value);
  }

}
