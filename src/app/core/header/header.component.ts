import { Component, Inject, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateNewAutocompleteGroup, SelectedAutocompleteItem } from 'ng-auto-complete';
import { isNullOrUndefined } from 'util';
import { AngularFireDatabase } from 'angularfire2/database';
import { Message } from 'primeng/api';
import { subHours } from 'date-fns';
import { AppLoader } from 'src/app/platform/data/model/app-loader';
import { AuthService } from '../services/auth.service';
import { DataTransferService } from '../services/data-transfer.service';
import { HttpController } from '../services/loading-controller';
import { hypernymModules, iolModules } from '../model/module';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { NotificationTypeEnum } from 'src/app/platform/enum/iol-entity.enum';
import { BrandingInterface, BrandingService } from 'src/app/platform/shared/services/branding.service';
import { HeaderService } from 'src/app/platform/shared/services/header.service';
import { ApiResponse } from '../model/api.response';
import { SearchResponse } from 'src/app/model/searchResponse';
import { UserRoleEnum } from 'src/app/platform/enum/user-role.enum';
import { GotoPageService } from 'src/app/platform/services/goto-page.service';
import { SwalService } from '../services/swal.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { GetUserService } from 'src/app/Services/get-profile.service';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { StorageService } from 'src/app/Services/local-storage.service';
import { Subscription } from 'rxjs';
import { DrawerService } from '../services/drawer.service';
import { trim } from '@amcharts/amcharts4/.internal/core/utils/Utils';

declare var google: any;
declare var $: any;

interface user {
  first_name: string,
  last_name: string,
  type: string,
  image: string;

}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  customerName = '';
  isActive = true;
  notificationsReady = false;
  isCollapsed = true;
  unRead: any;
  dropdownOpen = false;
  msgs: Message[] = [];

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;

  @Input() bgColor = 'bg-iol-800';
  @Input() bgStyle = '#e60000';


  @ViewChild('closeForm') private closeForm;
  @ViewChild('try') private try;

  public array = [];
  notificationLoader = new AppLoader();

  public itemgroups = [
    CreateNewAutocompleteGroup(
      'Search / choose in / from list',
      'completer',
      this.array,
      { titleKey: 'title', childrenKey: null },
      '',
      true
    ),
  ];
  notifications_list = [];

  bgStyleBranding;
  text: string;
  country: any;
  selected: string;
  states: string[] = [];
  results: string[];
  theme: BrandingInterface;

  toggle() {
    this.isActive = !this.isActive;
  }

  show(item) {
    if (item === 0) {
      return;
    }
    // this.renderer.setStyle(this.try, 'z-index', '1003');
    // this.msgs.push({ severity: 'success', summary: 'You have new notification', detail: '' });
    this.toast.success('You have a new notification');

    // setTimeout(() => this.clear(), 4000);
  }

  clear() {
    this.msgs = [];
    this.renderer.setStyle(
      this.try, 'z-index', '-1');
  }

  useCaseId = 0;
  userSubscription$ = new Subscription;

  defaultLoader = {
    visibility: false
  }

  constructor(private authService: AuthService,
    private route: Router,
    private router: Router,
    public fdb: AngularFireDatabase,
    private dataTransferService: DataTransferService,
    private gotoService: GotoPageService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private toast: ToastrService,
    public storageService: StorageService,
    private headerService: HeaderService,
    public getUserService: GetUserService,
    private renderer: Renderer2, private brandingService: BrandingService,
    @Inject(DOCUMENT) private document: Document,
    private idle: Idle, private keepalive: Keepalive,
    public drawerService: DrawerService) {

    this.user = this.authService.getUser();

    if (this.user && this.user.language && this.user.language.name === 'Arabic') {
      this.document.body.classList.add('rtl-direction');
    } else {
      this.document.body.classList.remove('rtl-direction');
    }

    let lang = this.getCookie('googtrans');
    lang = lang === '/en/ar' ? 'ar' : 'en';
    this.theme = this.brandingService.styleObject();

    this.dataTransferService.dataUpdated.subscribe(
      data => {
        this.user = data;
        this.userName = data.first_name + ' ' + data.last_name;
      });

    this.activatedRoute.queryParams.subscribe(params => {
      this.useCaseId = params['usecase'];
    });





    // sets an idle timeout of 600 seconds, for testing purposes.
    idle.setIdle(600);
    // sets a timeout period of 600 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(600);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.'
      console.log(this.idleState);
      this.reset();
    });

    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      console.log(this.idleState);
      this.logout();
    });

    idle.onIdleStart.subscribe(() => {
        this.idleState = 'You\'ve gone idle!'
        console.log(this.idleState);
        // this.childModal.show();
    });

    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!'
      console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    keepalive.interval(15);

    keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.reset();

  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  getUpdateUser(data) {
    console.log("getUpdateUser() from header component= ", data);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.googleTranslateElementInit('en');
    }, 500);
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  googleTranslateElementInit(lang) {
    this.defaultLoader = {
      visibility: true
    }
    new google.translate.TranslateElement({ pageLanguage: lang, includedLanguages: 'en,ar', layout: google.translate.TranslateElement.InlineLayout.SIMPLE }, 'google_translate_element');
    
    
    setTimeout(() => {
      this.defaultLoader = {
        visibility: false
      }
      $('.sidenav-container.mat-drawer-container.mat-sidenav-container').css('position', 'fixed');
      console.log('hello')
    }, 5000);
  }

  Selected(item: SelectedAutocompleteItem) {
    const entity_type = item['item']['original']['entity_type'];
    console.log(entity_type)
    if (entity_type === 'Truck') {
      this.gotoPageWithRouteParams('trucks', item['item']['id']);
    } else if (entity_type === 'Job') {
      this.gotoPageWithRouteParams('jobs', item['item']['id'], item['item']['original']['j_status']);
    } else if (entity_type === 'Bin') {
      this.gotoPageWithRouteParams('bins', item['item']['id']);
    } else if (entity_type === 'Driver') {
      this.gotoPageWithRouteParams('drivers', item['item']['id']);
    } else if (entity_type === 'Territory') {
      this.gotoPage('territories');
    } else if (entity_type === 'Area') {
      this.gotoPage('area');
    } else if (entity_type === 'Contract') {
      this.gotoPage('contract');
    } else if (entity_type === 'Dump') {
      this.gotoPage('dump');
    } else if (entity_type === 'Supervisor') {
      this.gotoPage('supervisor');
    }else if (entity_type.trim() === 'POI') {
      this.gotoPage('fleets/flt/poi');
    }
    else if (entity_type === 'Route') {
      this.gotoPage('admin/territory');
    }


  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    let abc = '';
    abc = abc + val;
    this.getQueryset(abc);
  }

  getQueryset(param) {
    this.headerService.getSearch('search_iol', { search: param })
      .subscribe(new class extends HttpController<ApiResponse<SearchResponse[]>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: ApiResponse<SearchResponse[]>): void {
          if (apiResponse.status) {
            this.context.states = apiResponse.response.map(a => a.title);
            this.context.states = [...this.context.states];
            // this.context.itemgroups[0].SetValues(apiResponse.response);
            // this.context.itemgroups = [...this.context.itemgroups];
          }
        }
      }(this)
      );
  }

  userName = null;
  userEmail;
  user;
  isAdmin = false;
  isManager = false;
  disablePreferences = true;

  ngOnInit() {
    this.setUserInfo();

    this.getUserService.getValue()
      .subscribe(res => {
        if (res) {
          this.user = res;
          this.setUserInfo();
        }
      });

      // watch for changes in localStorage, change header properties accordingly for user
      this.userSubscription$ = this.storageService.changes.subscribe(res => {
      const loggedInUserService = this.storageService.getItem('user');
      if(loggedInUserService) {
        this.user = loggedInUserService;
        this.setUserInfo1();
        // if(this.userSubscription$) {
        //   this.userSubscription$.unsubscribe();
        // }
      }
      if (!loggedInUserService) {
        window.location.reload()
      }

  });


    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translate.use(event.lang);
      if (event.lang === 'ar') {
        this.document.body.classList.add('rtl-direction');
      } else {
        this.document.body.classList.remove('rtl-direction');
      }
    });

  }

  setUserInfo1() {
    this.user = this.authService.getUser();
    if (this.user.first_name !== '' && this.user.last_name !== '') {
      this.userName = this.user.first_name;
    }
    this.userEmail = this.user.email;
    this.customerName = this.user.customer.name;
    this.isAdmin = this.user.user_role_id === UserRoleEnum.Admin;
    this.isManager = this.user.user_role_id === UserRoleEnum.Manager || this.user.user_role_id === UserRoleEnum.FinanceManager;
    this.disablePreferences = this.user.preferred_module === hypernymModules.iop;
  }

  setUserInfo() {
    this.setUserInfo1();
    const newEmail = this.userEmail.replace('.', '-').replace('.', '-');
    this.fdb.object(newEmail).valueChanges().subscribe((item) => {
      let u = JSON.parse(localStorage.getItem('user'));
      if (u.config_notification && item) {
        this.updateAlertCount(item)
        // this.getAlertList();
      }
    });
    setTimeout(() => {
      if (!(<HTMLElement>document.getElementsByTagName('body')[0]).classList.contains('site-menubar-unfold')) {
        this.toggleOverflow(true);
      }
    }, 500);
  }

  hideFeature() {
    if (this.disablePreferences) {
      return true;
    } else {
      return !this.isAdmin || this.isManager;
    }
  }

  /**
   * Counter updation and hits the alert API
   * @param item
   */
  updateAlertCount(item) {
    // console.log('update --- alert ---- count')
    // console.log(this.unRead)
    if (this.unRead) {
      this.alert_count = this.unRead.length;
      // this.renderer.setStyle(
      //   this.try, 'z-index', '-1');
      if (this.alert_count > 999) {
        this.alert_count = '999+';
      } else {
        this.alert_count = this.alert_count + 1;
      }
      this.show(this.alert_count);
      if (this.alert_count === 0) {
        return;
      }
    }
    this.getAlertList();
  }

  /**
   * Method to navigate with page name and parameters
   * @param pageName
   * @param value
   */
  gotoPagewithParams(pageName: string, value) {
    this.router.navigate(['iol/' + pageName, value]);
  }

  /**
   * method used to invoke page using router with param and value and return success and failure
   * @param pageName
   * @param value
   * @param value1
   */
  gotoPageWithRouteParams(pageName: string, value, value1?) {
    if (!isNullOrUndefined(value)) {
      this.router.navigate(['/iol/' + pageName, value]);
      return true;
    }
    if (!isNullOrUndefined(value1)) {
      this.router.navigate(['/iol/' + pageName, value, value1]);
      return true;
    } else {
      this.router.navigate(['/iol/' + pageName]);
      return true;
    }
  }

  /**
   * simple navigation without parameters
   * @param pageName
   */
  gotoPage(pageName) {
    this.router.navigate(['/iol/' + pageName]);
  }

  /*** logout the cureent logged In user */
  logout() {
    this.authService.unsetUser();
    let val = localStorage.getItem('setvalue');

    if (val) {
      this.route.navigateByUrl('/');
    }
    else {
      localStorage.setItem('setvalue', "false");
      this.route.navigateByUrl('/');
    }
    window.location.reload()
  }

  alert_count: any;
  /*** Method that hits the API to get the total alerts count from bakend */
  getAlertCount() {
    console.log('alert----count')
    if (this.authService.isLoggedIn()) {
      this.headerService.getIoLNotificationCount()
        .subscribe(new class extends HttpController<ApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);
          }

          onNext(apiResponse: ApiResponse<any>): void {
            if (apiResponse.status) {
              // console.log('notifications count ', apiResponse.response[0].count);
              this.context.alert_count = apiResponse.response[0].count;
            }

          }

        }(this)
        );
    }
  }

  dateRange = [];
  /*** Method that hits the API to get Notification list */
  getAlertList() {
    // console.log('alert----list')
    const current_date = new Date();
    const threeHoursEarlier = subHours(current_date, 3);

    this.dateRange = [threeHoursEarlier, current_date];
    const start = DateUtils.getUtcDateTimeStart(this.dateRange[0].toString());
    const end = DateUtils.getUtcDateTimeEnd(this.dateRange[1].toString());

    this.headerService.getIolNotifications('get_iol_notifications', { 'start_datetime': start, 'end_datetime': end })
      .subscribe(apiResponse => {
        if (apiResponse.status) {
          this.notifications_list = apiResponse.response;
          this.notificationsReady = true;
          if (this.notifications_list && this.notifications_list.length > 0) {
            this.unRead = this.notifications_list.filter(item => {
              return item.is_viewed.viewed === false;
            });
            if (this.unRead) {
              this.alert_count = this.unRead.length;
              if (this.alert_count > 999) {
                this.alert_count = '999+';
              }
            }
          }
        }
      });
  }


  /*** reset the notification counts */
  resetCount() {
    console.log('reset---count')
    this.headerService.getIolNotifications('reset_count', {})
      .subscribe(new class extends HttpController<ApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: ApiResponse<any>): void {
          if (apiResponse.status) {
          }
        }

      }(this)
      );
  }

  /*** Icon style is based on notification type
   * @param value
   */
  getIconClass(value) {
    if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_DRIVER_REJECT) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_TRUCK_CONFLICT) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ABORT) {
      return 'fa fa-window-close';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ACCEPT) {
      return 'glyphicon glyphicon-ok-circle';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_SUSPEND) {
      return 'glyphicon glyphicon-pause';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_RESUME) {
      return 'fa fa-play';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_COMPLETE) {
      return 'glyphicon glyphicon-ok';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START) {
      return 'fa fa-play-circle';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_NO_ACTION_ACCEPT_REJECT) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START_SHIFT) {
      return 'fa fa-play-circle';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_BIN_PICKUP) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_WASTE_COLLECTION) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_BIN_DROPOFF) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_BIN) {
      return 'glyphicon glyphicon-trash';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_DRIVER) {
      return 'fa fa-user-plus';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_SUPERVISOR) {
      return 'fa fa-user-circle';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_CARD) {
      return 'fa fa-credit-card';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_TAG) {
      return 'fa fa-tags';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_SCANNER) {
      return 'glyphicon glyphicon-phone';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_END_SHIFT) {
      // return 'glyphicon glyphicon-info-sign';
      return 'glyphicon glyphicon-bell';
    } else {
      return 'glyphicon glyphicon-bell';
    }
  }

  /**
   * Icon style chages based on its type
   * @param value
   */
  getIconStyle(value) {
    return { 'color': '#3193c7', 'font-size': '25px' };
    // if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START_SHIFT) {
    //   return { 'color': '#3193c7', 'font-size': '48px' };
    // }
    // else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_END_SHIFT) {
    //   return { 'color': '#c74645', 'font-size': '48px' };
    // }
  }

  /**
   * Get Notification type using Enum list
   * @param value
   */
  get_type(value) {

    if (value) {
      value = value.split(' ');
      return value[0] + " " + value[1];
    }

    if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW) {
      return 'Review';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_DRIVER_REJECT) {
      return 'Activity Rejected';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_TRUCK_CONFLICT) {
      return 'Conflict';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ABORT) {
      return 'Activity Aborted';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ACCEPT) {
      return 'Activity Accepted';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_SUSPEND) {
      return 'Activity Suspended';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_RESUME) {
      return 'Activity Resumed';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_COMPLETE) {
      return 'Activity Completed';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START) {
      return 'Activity Started';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_NO_ACTION_ACCEPT_REJECT) {
      return 'No Action';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START_SHIFT) {
      return 'Shift Status';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_BIN_PICKUP) {
      return 'Bin Action';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_WASTE_COLLECTION) {
      return 'Waste Collected';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_BIN_DROPOFF) {
      return 'Bin Action';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_BIN) {
      return 'Bin Added';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_DRIVER) {
      return 'Staff Added';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_SUPERVISOR) {
      return 'Supervisor Added';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_CARD) {
      return 'RFID Card';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_TAG) {
      return 'RFID Tag';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_SCANNER) {
      return 'RFID Scanner';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_END_SHIFT) {
      return 'Shift Status';
    } else {
      return 'Default';
    }
  }

  /*** Method Removes the drop down of notification*/
  close_dropdown() {
    this.removeModal();
    this.closeForm.nativeElement.click();
  }

  /**
   * Notification, activity, status based route / navigation
   * @param notification
   */
  goto_alert(notification) {
    console.log(notification);
    this.removeModal();
    const type = notification['notification_type'];
    const value = notification['activity_id'];
    const status = notification['status_id'];
    if (status === 1) {
      this.closeForm.nativeElement.click();
      if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW) {
        this.gotoPagewithParams('job-review', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_DRIVER_REJECT) {
        this.gotoPagewithParams('job-review', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_TRUCK_CONFLICT) {
        this.gotoPagewithParams('job-review', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_BIN_CONFLICT) {
        this.gotoPagewithParams('job-review', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ABORT) {
        this.gotoPagewithParams('job-review', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ACCEPT) {
        this.gotoPagewithParams('route', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_SUSPEND) {
        this.gotoPagewithParams('route', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_RESUME) {
        this.gotoPagewithParams('route', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_COMPLETE) {
        this.gotoPagewithParams('route', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START) {
        this.gotoPagewithParams('route', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_NO_ACTION_ACCEPT_REJECT) {
        this.gotoPagewithParams('job-review', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_NO_ACTION_START_FAIL) {
        this.gotoPagewithParams('job-review', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_BIN) {
        this.gotoPage('bins');
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_DRIVER) {
        // this.gotoPagewithParams('drivers', notification['assigned_device_id']);
        this.gotoPagewithParams('staff', notification['assigned_device_id']); // this route exits, not the above one

      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_SUPERVISOR) {
        this.gotoPage('supervisor');
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_CARD) {
        this.gotoPage('assets');
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_TAG) {
        this.gotoPage('assets');
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_SCANNER) {
        this.gotoPage('assets');
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START_SHIFT) {
        // this.gotoPagewithParams('drivers', notification['driver_id']);
        this.gotoPagewithParams('staff', notification['driver_id']);

      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_END_SHIFT) {
        // this.gotoPagewithParams('drivers', notification['driver_id']);
        this.gotoPagewithParams('staff', notification['driver_id']);

      } else {
        // take no action
      }
    }
  }

  btnClick() {
    this.resetCount();
    setTimeout(() =>
      this.alert_count = 0, 200);
    setTimeout(() => {
      this.getAlertList()
    }, 1000);
  }

  /*** Method hits the API Again on refersh button action*/
  refreshNotifications() {
    this.getAlertList();
  }

  setZIndex() {
    setTimeout(() =>
      (<HTMLElement>document.getElementsByClassName('ui-tooltip')[0]).style.zIndex = '3000', 100);
  }

  resetZIndex() {
    document.getElementsByClassName('ui-tooltip')[0].setAttribute('z-index', '0');
  }

  /*** User authentication and his/her module association verification*/
  redirectToHome() {
    const module = hypernymModules[this.user.preferred_module];
    if (this.user.preferred_module < 2 && this.user.preferred_module > 1) {
      let module = iolModules[this.user.preferred_module];
      if (isNullOrUndefined(module)) {
        module = '';
      }
      this.router.navigate(['/iol/' + module]);
    } else {
      this.router.navigate(['/iol']);


    }

  }

  removeModal() {
    const element = document.body;
    element.className = element.className.replace('modal-open', '');
    const element1 = document.getElementsByClassName('modal-backdrop');
    if (element1.length) {
      element1[0].parentNode.removeChild(element1[0]);
    }
  }

  navigateToProfile() {
    // console.log("inside navigate profile func");
    this.router.navigate(['iol/profile']);
  }

  resizeWindow() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);
  }


  /**
   * User  email verification
   * @param event
   */
  isViewed(event) {
    const user = this.authService.getUser().email;
    if (!isNullOrUndefined(event)) {
      for (let i = 0; i < event.length; i++) {
        if (event[i].email === user && event[i].viewed) {
          return false;
        }
      }
    }
    return true;
  }

  toggleSideMenu () {
    if ($('.mat-drawer-container.mat-sidenav-container').hasClass('collapseDrawer')) {
      console.log("coming in iffffffffffff");
      $('.mat-drawer-container.mat-sidenav-container').removeClass('collapseDrawer');
      $('.page-content.container-fluid').addClass('full-open-sidebar');
      $('.page-content.container-fluid').removeClass('half-open-sidebar');
      $('.breadcrumb-box').addClass('full-open-breadcrum');
      $('.breadcrumb-box').removeClass('half-open-breadcrum');

      $('.navbar-brand-text.hidden-xs').css('display', 'inline');
      this.drawerService.setValue(false);
    } else {
      console.log("coming in elseeeeeeeeeeeeee");
      $('.mat-drawer-container.mat-sidenav-container').addClass('collapseDrawer');
      $('.page-content.container-fluid').addClass('half-open-sidebar');
      $('.page-content.container-fluid').removeClass('full-open-sidebar');

      $('.breadcrumb-box').removeClass('full-open-breadcrum');
      $('.breadcrumb-box').addClass('half-open-breadcrum');
      $('.navbar-brand-text.hidden-xs').css('display', 'none' );


      this.drawerService.setValue(true);
    }
  }

  toggled = true;
  toggleOverflow(pos = false) {
    // if (!pos) {
    //   this.toggled = (<HTMLElement>document.getElementsByTagName('body')[0])?.classList.contains('site-menubar-unfold');
    // }
    // if (this.toggled) {

    //   (<HTMLElement>document.getElementsByClassName('site-menubar-body')[0]).style.overflowY = '';
    //   (<HTMLElement>document.getElementsByClassName('site-menubar-footer')[0])?.classList.add('hidden');

    // } else {
    //   (<HTMLElement>document.getElementsByClassName('site-menubar-body')[0]).style.overflowY = 'scroll';
    //   (<HTMLElement>document.getElementsByClassName('site-menubar-footer')[0])?.classList.remove('hidden');
    // }
  }

}
