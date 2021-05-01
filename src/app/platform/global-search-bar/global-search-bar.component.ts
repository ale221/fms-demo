import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SearchItem, SearchResponse } from '../../model/searchResponse';
import { SearchService } from '../services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-global-search-bar',
  templateUrl: './global-search-bar.component.html',
  styleUrls: ['./global-search-bar.component.css']
})

export class GlobalSearchBar implements OnInit {

  searchField: FormControl;
  coolForm: FormGroup;
  result: SearchResponse[] = [];
  country: any;

  countries: any[];


  ngOnInit(): void {
  }


  constructor(private searchService: SearchService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.searchField = new FormControl();
    this.coolForm = fb.group({ search: this.searchField });


    this.searchField.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(term => this.searchService.getSearch('search_iol', { search: term }))
      )
      .subscribe((result) => {
        console.log(result.response);
        if (result.response.length) {
          this.result = result.response;
        } else {
          this.result = [{ title: 'No Data Found', id: null, entity_type: null }];
        }
      });
  }


  filterCountrySingle(event) {
    const query = event.query;
    this.searchService.getSearch('search_iol', { search: query })
      .subscribe((result) => {
        this.countries = result.response;
      });
  }

  onOptionSelected(opt: any) {
    const entity_type = opt.entity_type;
    const client_type = opt.client_type;
    console.log("entity_type= ", entity_type)
    if (entity_type === 'Truck') {
      this.gotoPageWithRouteParams('fleets', opt['id']);
    } else if (entity_type === 'Bin') {
      this.gotoPageWithRouteParams('bins', opt['id']);
    } else if (entity_type === 'Driver' || entity_type === 'Labour') {
      this.gotoPageWithRouteParams('drivers/staff', opt['id']);
    } else if (entity_type === 'Territory') {
      this.gotoPageWithRouteParams('admin/territory');
    } else if (entity_type === 'Area') {
      this.gotoPageWithRouteParams('area');
    } else if (entity_type === 'Location') {
      this.gotoPageWithRouteParams('location');
    } else if (entity_type === 'Contract') {
      this.gotoPageWithRouteParams('admin/contract');
    } else if (entity_type === 'Dumping Site') {
      this.gotoPageWithRouteParams('dump');
    } else if (entity_type === 'Supervisor') {
      this.gotoPageWithRouteParams('supervisor');
    } else if (entity_type === 'Client') {
      this.gotoPageWithRouteParams('admin/customer');
    }else if (entity_type === 'POI') {
      this.gotoPageWithRouteParams('fleets/flt/poi');
    }
    else if (entity_type === 'Route') {
      this.gotoPageWithRouteParams('admin/route');
    }
    else if (entity_type === 'Contract') {
      this.gotoPageWithRouteParams('admin/contract');
    }
    else if (entity_type === 'Employee') {
      this.gotoPageWithRouteParams('admin/staff');
    }
    else if (entity_type === 'Fleet') {
      this.gotoPageWithRouteParams('admin/truck');
    }

  }


  gotoPageWithRouteParams(pageName: string, value?) {
    this.country = null;
    if (!isNullOrUndefined(value)) {
      if (window.location.pathname.includes(pageName)) {
        window.location.href = '/iol/' + pageName + '/' + value;
        return true;
      } else {
        this.router.navigate(['/iol/' + pageName, value]);
        return true;
      }
    } else {
      // this.router.navigate(['/iol/' + pageName]);
      this.router.navigateByUrl('/iol/' + pageName);
      return true;
    }
  }
}
