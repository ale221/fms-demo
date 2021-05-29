// Created By Mushahid Hussain 01/09/2020
import { AfterViewInit, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EntityService } from './../services/entity.service';
import { filter } from 'rxjs/operators';
import { BrandingInterface, BrandingService } from '../shared/services/branding.service';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { SwalService } from 'src/app/core/services/swal.service';
import { GetUsecaseService } from '../services/get-usecase.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { DrawerService } from 'src/app/core/services/drawer.service';
declare var gtag;

@Component({
  selector: 'app-iol-dashboard',
  templateUrl: './iol-dashboard.component.html',
  styleUrls: ['./iol-dashboard.component.css']
})
export class IolDashboardComponent implements OnInit, AfterViewInit {
  defaultLoader = {
    visibility: true
  }

  user;
  response;
  theme: BrandingInterface;
  currentDashboard;
  cardsArray = [];
  graphsArray = [];
  multiCardsArray = [];
  colWidth = '';
  multiRows = false;
  loading = false;
  dateRange: any;
  selectedGraph;
  isAuthorized = false;
  useCaseId = 0;
  showDiv = true;
  graphColumns = ['col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4', 'col-md-4'];

  packageType: any;

  graphHeight = 240;
  largeGraph;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;
  sidebarCheck: any;
  language: any;

  constructor(private authService: AuthService,
    private entityService: EntityService,
    private router: Router,
    private _route: ActivatedRoute,
    private swalService: SwalService,
    private getUsecase: GetUsecaseService,
    private dashboardService: DashboardService,
    private brandingService: BrandingService,
    private drawerService: DrawerService) {    
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.user = this.authService.getUser();
    this.theme = this.brandingService.styleObject();
    
    // code for google analytics
    // const navEndsEvents = router.events.pipe(filter(event => event instanceof NavigationEnd));
    // navEndsEvents.subscribe((event: NavigationEnd) => {
    //   gtag('config', 'UA-147735645-1', {
    //     'page_path': event.urlAfterRedirects
    //   });
    // });
  }

  removeDiv(divNumber) {
    if (divNumber === 9) {
      this.showDiv = false;
    }
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })
    this.packageType = PackageType;
    this.defaultLoader = {
      visibility: true
    }
  }

  getUsecaseDashboard(useCase) {
    this.defaultLoader = {
      visibility: true
    }
    const start_datetime = (this.dateRange[0].toISOString()).split("T")[0];
    const end_datetime = (this.dateRange[1].toISOString()).split("T")[0];
    let params;
    if (useCase && useCase.id) {
      params = { start_datetime: start_datetime, end_datetime: end_datetime, usecase_id: useCase.id };
      this.entityService.getCustomerDashboard(params).subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.defaultLoader = {
            visibility: false
          }
          this.response = apiResponse['data'];

          // Cards Management
          this.cardsArray = this.response['cards'];
          if (this.cardsArray.length > 8) {
            this.cardsArray = this.cardsArray.slice(0, 8)
          }
          // Check user account type
          if (this.user.package[0].package_id == this.packageType.standard) {
            // show all graphs to standard user
            this.graphsArray = this.response['graphs'];
            this.largeGraph = this.graphsArray.filter(function (index) {
              return index.name == 'Driver Violations';
            })
            // this.graphsArray = this.graphsArray.filter(function (index) {
            //   return index.name != 'Driver Violations';
            // })
            this.largeGraph = this.largeGraph[0];
          } else {
            // show specific graphs to plug & go user
            let dataFromResponse = [];
            let filterArray = [];
            dataFromResponse = this.response['graphs'];
            filterArray = dataFromResponse.filter(function (index) {
              return index.name != 'Maintenance status ' && index.name != 'Probability of Vehicle Maintenance' && index.name != 'Driver Violations' && index.name != 'Driver Tasks Status' && index.name != 'Driver Allocations' && index.name != 'Aggressively Driven Vehicles' && index.name != 'Driver Safety Scorecard';
            })
            this.graphsArray = filterArray;
          }
          // // console.log("graphsArray+graphsArray= ", this.graphsArray);
          let multiRowsArr = [];
          this.multiRows = false;
          if (this.cardsArray.length === 7 || this.cardsArray.length === 8) {
            this.multiRows = true;
            this.multiCardsArray = [];
            let myArr = [];
            this.cardsArray.forEach((element, i) => {
              if (i != 0 && i % 4 === 0) {
                multiRowsArr.push(myArr);
                myArr = [];
                myArr.push(element);
              } else if (i + 1 === this.cardsArray.length) {
                myArr.push(element);
                multiRowsArr.push(myArr);
                myArr = [];
              } else {
                myArr.push(element)
              }
            });

            this.multiCardsArray = multiRowsArr;

            this.multiCardsArray.forEach(element => {
              this.colWidth = this.getCardsCol(element.length, true)
            });
          } else {
            this.colWidth = this.getCardsCol(this.cardsArray.length, false);
          }
        } else if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
          this.defaultLoader = {
            visibility: false
          }
          this.swalService.getErrorSwal(apiResponse['message']);
        }
      })
    } else {
      this.defaultLoader = {
        visibility: false
      }
    }
    // // console.log("this.this.graphsArray--- ", this.graphsArray)
  }


  getCardsCol(totalCards, isMulti) {
    let colWidth;
    if (totalCards === 1 || totalCards === 2 || totalCards === 3) {
      if (isMulti) {
        colWidth = ['col-md-3', 'col-md-4'];
      } else {
        colWidth = 'col-md-4';
      }
    } else if (totalCards === 4) {
      if (isMulti) {
        colWidth = ['col-md-3', 'col-md-3'];
      } else {
        colWidth = 'col-md-3';
      }
    } else if (totalCards === 5) {
      colWidth = ['col-md-4', 'col-md-2']
    } else if (totalCards === 6) {
      colWidth = 'col-md-2';
    } else {
      colWidth = 'col-md-3';
    }
    return colWidth;
  }

  ngAfterViewInit(): void {
    this.monthClicked();
    let userCaseId = JSON.parse(localStorage.getItem('user'));
    userCaseId = userCaseId.use_cases.use_cases[0];

    if (this.useCaseId) {
      userCaseId.id = this.useCaseId
    }

    this.getUsecaseDashboard(userCaseId);
    this.dashboardService.getValue().subscribe(data => {
      this.currentDashboard = data;
      setTimeout(() => {
        this.defaultLoader = {
          visibility: true
        }
        this.getUsecaseDashboard(this.currentDashboard);
      }, 300);
    })
    setTimeout(() => {
      this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
    }, 300);

    // this.router.navigate(['/'], { queryParams: { usecase: 'world' }, queryParamsHandling: 'merge' })
    // changes the route without moving from the current view or
    // triggering a navigation event,
    // this.router.navigate(['/'], {
    //   relativeTo: this._route,
    //   queryParams: {
    //     usecase: this.useCaseId.toString()
    //   },
    //   queryParamsHandling: 'merge',
    //   // preserve the existing query params in the route
    //   skipLocationChange: true
    //   // do not trigger navigation
    // });
  }

  monthClicked() {
    const startMonth = DateUtils.now();
    startMonth.setDate(1);
    startMonth.setHours(0);
    startMonth.setMinutes(0);
    startMonth.setSeconds(0);
    const f = DateUtils.addDa(startMonth);
    this.dateRange = [f, DateUtils.getEndofToday()];
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

    this.entityService.getEntityGraphFilterById(params).subscribe((apiResponse: any) => {
      this.loading = false;
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {

        this.graphsArray?.forEach(element => {
          if (element.type === data.graphData.type && element.id === data.graphData.id) {
            element.data = apiResponse['data'].data;
          }
        });

        // Check user account type
        if (this.user.package[0].package_id == this.packageType.standard) {
          // show all graphs to standard user
          this.graphsArray = this.response['graphs'];
          for (let i = 0; i < this.graphsArray.length; i++) {
            if (this.graphsArray[i].name == 'Driver Allocations' && this.graphsArray[i].id == 59 && this.selectedGraph === 59) {
              if (apiResponse.data[0] && apiResponse.data[0]?.fleets) {
                this.graphsArray[i].fleets = apiResponse.data[0]?.fleets;
              } else {
                this.graphsArray[i].fleets = apiResponse.data[0];
              }
            }
          }

          const largeGraph = this.graphsArray.filter(function (index) {
            return index.name == 'Driver Violations';
          })
          // this.graphsArray = this.graphsArray.filter(function (index) {
          //   return index.name != 'Driver Violations';
          // })
          this.largeGraph = largeGraph[0];
        } else {
          // show specific graphs to plug & go user
          let dataFromResponse = [];
          let filterArray = [];
          dataFromResponse = this.response['graphs'];
          filterArray = dataFromResponse.filter(function (index) {
            return index.name != 'Maintenance status ' && index.name != 'Probability of Vehicle Maintenance' && index.name != 'Driver Violations' && index.name != 'Driver Tasks Status' && index.name != 'Driver Allocations' && index.name != 'Aggressively Driven Vehicles' && index.name != 'Driver Safety Scorecard';
          })
          this.graphsArray = filterArray;
        }

      } else if (apiResponse['status'] === HttpStatusCodeEnum.Error) {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    })
  }

  redirect(page) {
    this.router.navigate(['/iol/' + page]);
  }
}
