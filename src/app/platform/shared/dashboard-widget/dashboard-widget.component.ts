import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';
import { EntityService } from '../../services/entity.service';


@Component({
  selector: 'app-dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.css']
})
export class DashboardWidgetComponent implements OnInit {

  @Input() widgetData;
  @Output() selectedWidget = new EventEmitter<any>();
  @Output() exportToCSV = new EventEmitter<any>();

  useCaseId;
  loggedInUser;
  customerID;
  userEmail;
  constructor(private router: Router, private entityService: EntityService,
    private getUsecase: GetUsecaseService,
    public breadcrumbsService: BreadcrumbsService,
    private authService: AuthService) {
  }
  url;

  ngOnInit(): void {
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.userEmail = this.loggedInUser.email;
  }

  whatsAppLink(page) {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (page == 'fleet') {
      this.url = environment.baseUrl + '/iof/share_fleet/' + this.customerID + '/' + timeZone + '/';
    } else if (page == 'drivers') {
      this.url = environment.baseUrl + '/iof/share_driver/' + this.customerID + '/' + timeZone + '/';
    } else if (page == 'maintenance') {
      this.url = environment.baseUrl + '/iof/share_maintenance/' + this.customerID + '/' + timeZone + '/';
    }
    else {
      this.url = window.location.href;
    }

    window.open(
      "https://api.whatsapp.com/send?text=" + this.url,
      '_blank'
    );
  }

  emailLink(page, url) {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (page == 'fleet') {
      this.url = environment.baseUrl + '/iof/share_fleet/' + this.customerID + '/' + timeZone + '/';

    } else if (page == 'drivers') {
      this.url = environment.baseUrl + '/iof/share_driver/' + this.customerID + '/' + timeZone + '/';
    } else if (page == 'maintenance') {
      this.url = environment.baseUrl + '/iof/share_maintenance/' + this.customerID + '/' + timeZone + '/';
    }

    else {
      this.url = window.location.href;

    }
    // let x = this.widgetData[3].shareUrls.pdf + ' ' + this.widgetData[3].shareUrls.xls;

    window.open(
      "mailto:" + this.userEmail + "?subject=VFQ-PDF Report!&body=" + this.url,
      '_blank'
    );
  }

  refreshOrScroll(reload, scroll) {
    let params = {
      reload,
      scroll
    }
    this.selectedWidget.emit(params);
  }

  ExportToCSV(event) {
    this.exportToCSV.emit(null);
  }
  manageTest() {
    let route = [];
    route[0] = "forChangingmanagepath";
    route[1] = "forChangingmanagepath";
    this.breadcrumbsService.setValue(route);
  }
  manageTest2() {
    let route = [];
    route[0] = "maintenance";
    route[1] = "Maintenance";
    this.breadcrumbsService.setValue(route);
  }

  downloadExcelPdf(item) {
    if (item.dashboard_Type === "fleet") {
      // console.log("fleet dashboard")
      if (item.name === "PDF") {
        let param = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.entityService.fleetdashboardExportPDF(param).subscribe((apiResponse: any) => {
          const data = apiResponse;
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob)
          window.open(url);
        })
      }
      else if (item.name === "XLS") {
        let param = 'time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.entityService.fleetdashboardExportXLS(param).subscribe((apiResponse: any) => {
          const data = apiResponse;
          const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
          const url = window.URL.createObjectURL(blob)
          window.open(url);
        })
      }

    }
    else if (item.dashboard_Type === "driver") {
      // console.log("driver dashboard")
      if (item.name === "PDF") {
        let param = 'export=pdf&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.entityService.driverdashboardExportPDF(param).subscribe((apiResponse: any) => {
          const data = apiResponse;
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob)
          window.open(url);
        })
      }
      else if (item.name === "XLS") {
        let param = 'export=xls&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.entityService.driverdashboardExportXLS(param).subscribe((apiResponse: any) => {
          const data = apiResponse;
          const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
          const url = window.URL.createObjectURL(blob)
          window.open(url);
        })
      }

    }
    else if (item.dashboard_Type === "maintenance") {
      if (item.name === "PDF") {
        let param = '&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&export=pdf&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.entityService.maintenancedashboardExportPDF(param).subscribe((apiResponse: any) => {
          const data = apiResponse;
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob)
          window.open(url);
        })
      }
      else if (item.name === "XLS") {
        let param = '&vehicle_group_id=&vehicle_id=&maintenance_type_id=&date_filter=&search=&export=excel&timeZone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.entityService.maintenancedashboardExportPDF(param).subscribe((apiResponse: any) => {
          const data = apiResponse;
          const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
          const url = window.URL.createObjectURL(blob)
          window.open(url);
        })
      }
    }
  }

}
