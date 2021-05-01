import { Component, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { NotificationTypeEnum } from '../enum/iol-entity.enum';
import { ApiResponse } from '../../core/model/api.response';
import { HttpController } from '../../core/services/loading-controller';
import { AppLoader } from '../data/model/app-loader';
import { GotoPageService } from '../services/goto-page.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderService } from '../shared/services/header.service';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-notifications-dashboard',
  templateUrl: './notifications-dashboard.component.html',
  styleUrls: ['./notifications-dashboard.component.css']
})
export class NotificationsDashboardComponent implements OnInit {

  go: boolean = false;
  maxDate = new Date();
  dropdownOptions: any[] = [];
  selectedOption: any = [];
  selectedDate: any = [];
  appLoader = new AppLoader();
  sidebarCheck;


  activity_review = [
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_DRIVER_REJECT,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_TRUCK_CONFLICT,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ABORT,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_NO_ACTION_ACCEPT_REJECT,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_NO_ACTION_START_FAIL,
  ];
  admin_acknowledgement = [
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ACCEPT,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_SUSPEND,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_RESUME,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_COMPLETE,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START_SHIFT,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_END_SHIFT,
  ];
  admin_asset = [
    NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_BIN,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_DRIVER,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_SUPERVISOR,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_CARD,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_TAG,
    NotificationTypeEnum.NOTIFICATION_ADMIN_ADD_ASSET_RFID_SCANNER,
  ];
  notifications_list = [];
  showIndeterminateProgress: boolean;
  displayedColumns = ['title', 'minutes_ago', 'driver_name', 'assigned_device'];

  constructor(private headerService: HeaderService, private goto: GotoPageService, private router: Router, private authService: AuthService, private drawerService:DrawerService) {
  }

  ngOnInit() {

    this.drawerService.getValue().subscribe(res=>{
      this.sidebarCheck=res;
      console.log("ressssssssssssss1",res);
    console.log("ressssssssssssss2",this.sidebarCheck);
  })
    this.dropdownOptions = [
      { label: 'All', value: [] },
      { label: 'Activity Review', value: this.activity_review },
      { label: 'Admin Acknowledgement', value: this.admin_acknowledgement },
      { label: 'Admin Assets Related', value: this.admin_asset }
    ];
  }

  setupReport(event) {
    let dateRange = event[0];
    const start_date = DateUtils.getYYYYMMDD(dateRange[0].toString()) + ' 00:00:00';
    const end_date = DateUtils.getYYYYMMDD(dateRange[1].toString()) + ' 23:59:59';
    this.selectedDate[0] = start_date;
    this.selectedDate[1] = end_date;
    this.getNotifications(start_date, end_date);
  }

  getNotifications(start_date?, end_date?, sortParams?) {
    this.showIndeterminateProgress = true;
    let params = { type: this.selectedOption };
    if (start_date && end_date) {
      params['start_datetime'] = start_date;
      params['end_datetime'] = end_date;
    }
    if (sortParams) {
      params['order_by'] = sortParams.order_by;
      params['order'] = sortParams.order;
    }

    this.headerService.getIolNotifications('get_iol_notifications', params)
      .subscribe(new class extends HttpController<ApiResponse<any>> {


        onComplete(): void {
          this.context.notificationsReady = false;
        }

        onError(errorMessage: string, err: any) {
          console.log(errorMessage);
        }

        onNext(apiResponse: ApiResponse<any>): void {
          this.context.showIndeterminateProgress = false;
          if (apiResponse.status) {
            this.context.notifications_list = apiResponse.response;
          }
        }

      }(this)
      );
  }

  isViewed(event) {
    const user = this.authService.getUser().email;
    if (!isNullOrUndefined(event)) {
      for (let i = 0; i < event.length; i++) {
        if (event[i].email == user && event[i].viewed) {
          return false;
        }
      }
    }
    return true;
  }

  getIconClass(value) {
    if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_DRIVER_REJECT) {
      return 'glyphicon glyphicon-bell';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_TRUCK_CONFLICT) {
      return 'fa fa-exclamation-circle';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_ABORT) {
      return 'fa fa-ban';
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
      return 'fa fa-exclamation-circle';
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START_SHIFT) {
      return 'fa fa-clock-o';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_BIN_PICKUP) {
      return 'glyphicon glyphicons-trash';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_WASTE_COLLECTION) {
      return 'fa fa-recycle';
    } else if (value === NotificationTypeEnum.NOTIFICATION_DRIVER_BIN_DROPOFF) {
      return 'glyphicon glyphicon-trash';
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
      return 'fa fa-clock-o';
    } else {
      return 'glyphicon glyphicon-bell';
    }
  }

  getIconStyle(value) {
    return { 'color': '#3193c7', 'font-size': '20px' };
    // if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START_SHIFT) {
    //   return { 'color': '#3193c7', 'font-size': '48px' };
    //
    // else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_END_SHIFT) {
    //   return { 'color': '#c74645', 'font-size': '48px' };
    // }
  }

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
    } else if (value === NotificationTypeEnum.NOTIFICATION_ADMIN_ACTIVITY_REVIEW_BIN_CONFLICT) {
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

  goto_alert(notification) {
    const type = notification['notification_type'];
    console.log(type, notification);
    const value = notification['activity_id'];
    const status = notification['status_id'];
    if (status === 1) {
      console.log(type);
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
        this.gotoPagewithParams('activity', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_SUSPEND) {
        this.gotoPagewithParams('activity', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_RESUME) {
        this.gotoPagewithParams('activity', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_COMPLETE) {
        this.gotoPagewithParams('activity', value);
      } else if (type === NotificationTypeEnum.NOTIFICATION_ADMIN_ACKNOWLEDGE_DRIVER_START) {
        this.gotoPagewithParams('activity', value);
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

  gotoPagewithParams(pageName: string, value) {
    this.router.navigate(['iol/' + pageName, value]);
  }

  gotoPageWithRouteParams(pageName: string, value, value1?) {
    console.log('/iol/' + pageName + '/' + value);
    if (!isNullOrUndefined(value)) {
      console.log('value', value);
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

  gotoPage(pageName) {
    this.router.navigate(['/iol/' + pageName]);
  }

  modelChanged(newObj) {
    this.getNotifications(this.selectedDate[0], this.selectedDate[1]);
  }



  sortData(event) {
    if (event.active === 'title') {
      event.active = 'violation_type_id__label'
    }
    if (event.active === 'minutes_ago') {
      event.active = 'timestamp'
    }
    if (event.active === 'driver_name') {
      event.active = 'driver_id__name'
    }
    if (event.active === 'assigned_device') {
      event.active = 'device_id__name'
    }

    let params = {
      order_by: event.active,
      order: event.direction
    }
    this.getNotifications(this.selectedDate[0], this.selectedDate[1], params);
  }

  onPaginateChange(event) {
    console.log("paginateChange= ", event)
    // this.showIndeterminateProgress = true;
    // this.filters.offset = (event.pageIndex * event.pageSize);
    // this.optimized_violations_call(event.page, this.searchText);
  }


}
