import {Component, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import { AppLoader } from '../../data/model/app-loader';
import { EntityStatusEnum, EntityType } from 'src/app/core/enum/entity-type.enum';
import { FormService } from '../../services/FormService';
import { EntityService } from '../../services/entity.service';
import { DatatableService } from '../../services/datatable.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { GotoPageService } from '../../services/goto-page.service';
import { HttpController } from 'src/app/core/services/loading-controller';
import { LoginApiResponse, TestApiResponse } from 'src/app/core/model/api.response';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { TruckResponse } from '../../data/response/entity-response';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit, OnDestroy {

  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  optimizedCall: any;
  clients = [];
  temp = [];
  allClients = [];
  appLoader = new AppLoader();
  EntityStatusEnum = EntityStatusEnum;
  inputValue = '';
  status = {total: 0, active: 0, inactive: 0};
  clientLoader = new AppLoader();
  results_remaining = false;

  @ViewChild("scrollToTop") 
  scrollToTop: ElementRef;

  constructor(private formService: FormService, private entityService: EntityService, private datatableService: DatatableService, private swalService: SwalService, private gotoService: GotoPageService) {
  }

  ngOnInit() {
    this.getClients();
  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }

  updateFilter(event) {
    // this.clients = this.datatableService.updateFilter(event.target.value, this.temp, ['name', 'party_code']);
    this.clients = event;
  }

  getClients(): void {
    this.inputValue = '';
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.status.total = 0;
    this.status.active = 0;
    this.status.inactive = 0;
    let index_a = 0;
    let index_b = 100;
    let results_remaining = true;
    this.clients = [];
    this.entityService.getListingCount('get_counts_listing',
      {
        type_id: EntityType.CLIENT
      }).subscribe(new class extends HttpController <LoginApiResponse<any[]>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          this.context.swalService.getErrorSwal(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.status.total = apiResponse.response;
            this.context.optimized_clients_call(index_a, index_b);
          }
          if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
    );
  }

  optimized_clients_call(index_a, index_b) {
    this.optimizedCall = this.formService.getClientEntities({
      type_id: EntityType.CLIENT,
      index_a: index_a,
      index_b: index_b
    }).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.clients = apiResponse['response'];
        this.results_remaining = false;
        this.temp = this.clients;
        this.allClients = this.clients;
        for (let i = 0; i < apiResponse['response'].length; i++) {
          if (apiResponse['response'][i].status === EntityStatusEnum.Active) {
            this.status.active += 1;
          }
          if (apiResponse['response'][i].status === EntityStatusEnum.Inactive) {
            this.status.inactive += 1;
          }

        }

        if (this.results_remaining) {
          index_a += 100;
          index_b += 100;
          this.optimized_clients_call(index_a, index_b);
        } else {
          this.searchPlaceHolder = 'Search';
          this.enableSearch = false;
          this.showIndeterminateProgress = false;
        }

      }
      if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['response']);
      }
    });

  }


  filterClientOnStatus(filterItems) {
    // this.clients = [];
    const filterClients = [];


    switch (filterItems) {
      case 'Active':
        this.allClients.filter((client: any) => {
          if (client.status === EntityStatusEnum.Active) {
            filterClients.push(client);
          }
        });
        this.clients = [];
        this.clients = filterClients;
        this.temp = this.clients;
        break;
      case 'Inactive':
        this.allClients.filter((client: any) => {
          if (client.status === EntityStatusEnum.Inactive) {
            filterClients.push(client);
          }
        });
        this.clients = [];
        this.clients = filterClients;
        this.temp = this.clients;
        break;
      case 'All':
        this.clients = [];
        this.clients = this.allClients;
        this.temp = this.clients;
        break;
    }


  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }
}
