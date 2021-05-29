import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { iolCombine } from 'src/app/platform/data/model/sidebar.model';
import { AuthService } from '../services/auth.service';
import { SidebarService } from '../services/sidebar.service';
import { UserRoleEnum } from 'src/app/platform/enum/user-role.enum';
import { User } from '../model/user';
import { hypernymModules, iolModules } from '../model/module';
import { FormService } from 'src/app/platform/services/FormService';
import { BrandingService } from 'src/app/platform/shared/services/branding.service';
import { DashboardService } from '../services/dashboard.service';
import { GetUsecaseService } from 'src/app/platform/services/get-usecase.service';
import { MenuService } from 'src/app/platform/shared/services/menu.service';
import { HttpStatusCodeEnum } from '../HttpStatusCodeEnum';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { StorageService } from 'src/app/Services/local-storage.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { DrawerService } from '../services/drawer.service';
import { BreadcrumbsService } from '../services/breadcrumbs-service';
declare var $: any;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit, AfterContentInit {

  // @Input() sidebarObj: SidebarModel;
  sidebarObj;
  fleetRoute = 'iol/fleets?usecase=1';
  // isCollapsed: boolean;
  isfmCollapsed: boolean = true;
  iswmCollapsed: boolean = true;
  lala = true;
  rla: any;
  rla1: any;
  rla2: any;
  rla3: any;
  dashboardIndex = 0;

  popNav = false;

  userRoleAdmin: any = false;
  userRoleF_Manager: any = false;
  public isShowingRouteLoadIndicator: boolean;

  user;
  basicUrl = '../../../../assets/images/iol/';
  csDemo = false;
  isClient = false;
  brandingColor;
  sidebarIconsBranding;
  useCaseId = 0;
  menu;
  displayMenu;
  packageType: any;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isCollapsed = false;
  selectedNav;

  constructor(private router: Router,
    private authService: AuthService,
    private sidebarsService: SidebarService,
    private _renderer2: Renderer2,
    private formService: FormService,
    private brandingService: BrandingService,
    private menuService: MenuService,
    private dashboardService: DashboardService,
    private getUsecase: GetUsecaseService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    public drawerService: DrawerService,
    public breadcrumbsService : BreadcrumbsService,
    private eRef: ElementRef
  ) {
    // // console.log('Pages Component');
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);

    // this.isCollapsed = !this.router.url.includes('admin');
    this.brandingColor = '#e60000';
    this.sidebarIconsBranding = brandingService.sidebarStyleObject();
    const user = JSON.parse(localStorage.getItem('user'));

    this.sidebarObj = iolCombine
    this.sidebarObj.dashboard = user['use_cases'].use_cases;
  }

  ngOnDestroy(): void {
    // tslint:disable-next-line: deprecation
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  hover = false;
  fleetHover = false;
  fleetClick = false;
  dashboardHover = false;
  dashboardClick = false;
  wasteHover = false;
  wasteClick = false;
  assetsHover = false;
  assetsClick = false;
  reportsClick = false;
  reportsHover = false;
  apiCall = 0;

  addHoverClass() {
    this.hover = true;
  }

  removeHoverClass() {
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.hover = false;
  }

  translateLoader() {
    let lang = this.getCookie('googtrans');
    lang = lang === '/en/ar' ? 'ar' : 'en';
    if (lang === 'ar') {
      this.isShowingRouteLoadIndicator = true;
      setTimeout(() => {
        this.isShowingRouteLoadIndicator = false;
      }, 4000);
    }
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.useCaseId = params['usecase'];
    });

    this.drawerService.getValue().subscribe(res=> {
      this.isCollapsed = res;
      if (this.menu && this.menu.length > 0) {
        this.menu.forEach(element => {
          element.expended = false;
        });
        this.menu = menuArray;
        this.popNav = false;
      }
    })

    this.menu = (this.menuService.menuObject());
    let menuArray = []
    if (this.menu && this.menu.length > 0) {
      this.menu.forEach(element => {
        element.expended = false;
        menuArray.push(element);
      });
      this.menu = menuArray;
    }

    // // console.log("This.Menu--- ", this.menu)
    this.packageType = PackageType;
    // // console.log("packageType= ", PackageType, this.packageType)
    this.user = this.authService.getUser() as User;
    // this.menu = JSON.parse(this.menu);
    // this.getGroupData();

    // watch for changes in localStorage, change header properties accordingly for user
    this.storageService.changes.subscribe(res => {
      setTimeout(() => {
        if (this.apiCall === 0) {
          this.menu = [];
          this.menu = (this.menuService.menuObject());
          this.apiCall = 1;
        }
      }, 200);
    });

    // if (this.translateDetector && this.translateDetector.menuData) {
    //   this.translateDetector.menuData.subscribe(response => {
      // TODO: store response in localStorage keep in mind that you response is same as menuArray as in login API.
      // after that you ust need to set this.apiCall = 0; 
    //   });
    // }

  }

  getGroupData() {
    this.formService.getGroupData().subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        if (apiResponse['data'] && apiResponse['data'].length > 0) {
          this.displayMenu = apiResponse['data'];
          this.displayMenu.forEach(element => {
            element.name = (element.name).toLowerCase();
            if (this.menu.includes(element.id)) {
              element.display = true
            } else {
              element.display = false;
            }
          });
        }
      }
    })
  }
  selectedIndex = 0;
  onItemSelected(item, i) {
    this.setTopMarginToSideBar(i)

    let popupFlag = false;

    this.selectedNav = item;

    if (this.selectedIndex !== i) {
      this.menu.forEach((element, j) => {
        if ( j !== i) {
          element.expended = false;
        }
      });
    }

    if (!this.popNav) {
      this.popNav = !this.popNav;
      popupFlag = true;
    }

    if (this.popNav && this.selectedIndex === i && !popupFlag) {
      this.popNav = false;
    } else {
      this.popNav = true;
    }

    this.selectedIndex = i;

    if (!item.child || !item.child.length) {
      // this.router.navigate([item.route]);
      // this.navService.closeNav();
    }
    if (item.child && item.child.length) {
      this.menu[i].expended = !this.menu[i].expended;
    }
  }

  setTopMarginToSideBar(index) {
    if (index === 0) {
      $('.collapse-view').css('top', '66px');
    }
    if (index === 1) {
      $('.collapse-view').css('top', '120px');
    }
    if (index === 2) {
      $('.collapse-view').css('top', '170px');
    }
    if (index === 3) {
      $('.collapse-view').css('top', '215px');
    }
    if (index === 4) {
      $('.collapse-view').css('top', '275px');
    }
    if (index === 5) {
      $('.collapse-view').css('top', '325px');
    }
    if (index === 6) {
      $('.collapse-view').css('top', '375px');
    }
    if (index === 7) {
      $('.collapse-view').css('top', '425px');
    }
    if (index === 8) {
      $('.collapse-view').css('top', '470px');
    }
  }

  ngAfterContentInit(): void {
    this.isfmCollapsed = !(this.router.url.includes('admin') && !this.iswmCollapsed);
    this.iswmCollapsed = !(this.router.url.includes('admin') && !this.isfmCollapsed);
    this.userRoleAdmin = this.authService.getUser().user_role_id === UserRoleEnum.Admin;
    this.userRoleF_Manager = this.authService.getUser().user_role_id === UserRoleEnum.FinanceManager;

    this.user = this.authService.getUser() as User;
    this.csDemo = this.user.preferred_module === iolModules.cs;
    const id = this.user.user_role_id;
    this.isClient = id === UserRoleEnum.CustomerClient;
  }

  loadUseCaseDashboard(dashboard, i) {
    this.dashboardIndex = i;
    this.dashboardService.setValue(dashboard);

    let module = hypernymModules[this.user.preferred_module];

    // changes the route without moving from the current view or
    // triggering a navigation event,
    this.router.navigate(['/' + module], {
      relativeTo: this.route,
      queryParams: {
        usecase: dashboard.id
      },
      queryParamsHandling: 'merge',
      // preserve the existing query params in the route
      skipLocationChange: true
      // do not trigger navigation
    });

    module = "/" + module;
    if (this.router.url !== module) {
      this.router.navigate(['/' + module], { queryParams: { usecase: dashboard.id } });

    }
  }

  checkMenuAccess(menu) {
    if (this.displayMenu) {
      let a = this.displayMenu.find(x => x.name === (menu).toLowerCase())
      // console.log(a)
      return (a && a['display']) ? true : false;
    }
  }

  ngAfterViewInit(): void {
    $('.page-content').click(() => {
      this.popNav = false
    });
    $('.header-loader').click(() => {
      this.popNav = false
    });
  }

  removeModal() {
    let element = document.body;
    element.className = element.className.replace('modal-open', '');
    var element1 = document.getElementsByClassName('modal-backdrop');
    if (element1.length) {
      element1[0].parentNode.removeChild(element1[0]);
    }
  }

  resetOverflow(src) {
    if (src === 'waste') {
      if ((<HTMLElement>document.getElementsByTagName('body')[0]).classList.contains('site-menubar-unfold')) {
        this.wasteHover = false;
      } else {
        this.wasteHover = false;
        this.wasteClick = false;
      }
    } else if (src === 'assets') {
      if ((<HTMLElement>document.getElementsByTagName('body')[0]).classList.contains('site-menubar-unfold')) {
        this.assetsHover = false;
      } else {
        this.assetsHover = false;
        this.assetsClick = false;
      }
    } else if (src === 'fleet') {
      if ((<HTMLElement>document.getElementsByTagName('body')[0]).classList.contains('site-menubar-unfold')) {
        this.fleetHover = false;
      } else {
        this.fleetHover = false;
        this.fleetClick = false;
      }
    } else if (src === 'dashboard') {
      if ((<HTMLElement>document.getElementsByTagName('body')[0]).classList.contains('site-menubar-unfold')) {
        this.dashboardHover = false;
      } else {
        this.dashboardHover = false;
        this.dashboardClick = false;
      }
    } else if (src === 'reports') {
      if ((<HTMLElement>document.getElementsByTagName('body')[0]).classList.contains('site-menubar-unfold')) {
        this.reportsHover = false;
      } else {
        this.reportsHover = false;
        this.reportsClick = false;
      }
    }
  }

  subNavItemRemove() {
    this.popNav = false;
  }

  navItemClicked(nav) {
    // console.log("coming in sidebar",nav);
    let route=[];
    route[0]=nav.route;
    route[1]=nav.name;
    this.breadcrumbsService.setValue(route);

  }
}
