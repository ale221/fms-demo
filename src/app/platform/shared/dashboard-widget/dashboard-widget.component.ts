import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { BreadcrumbsService } from 'src/app/core/services/breadcrumbs-service';


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
  constructor(private router: Router,
     private getUsecase: GetUsecaseService,
     public breadcrumbsService : BreadcrumbsService,
     private authService:AuthService) {

  }
  url;

  ngOnInit(): void {
    this.useCaseId = this.getUsecase.getUsecaseId();
    this.loggedInUser = this.authService.getUser();
    console.log("loggedinuser",this.loggedInUser);
      this.customerID = this.loggedInUser.customer.id;
      this.userEmail=this.loggedInUser.email;
      console.log("mailllll", this.userEmail)
  }

  whatsAppLink(page) {

    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if(page=='fleet'){
      this.url=environment.baseUrl + '/iof/share_fleet/' + this.customerID + '/' + timeZone  + '/';
    }else if(page=='drivers'){
      this.url= environment.baseUrl + '/iof/share_driver/' + this.customerID + '/' + timeZone  + '/';
    }else if(page=='maintenance'){
      this.url=environment.baseUrl + '/iof/share_maintenance/' + this.customerID + '/' + timeZone  + '/';
          }

    else{
      this.url = window.location.href;

    }
    // [
    //   {pdf: environment.baseUrl + '/iof/fleet_pdf?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone},
    //   {xls: environment.baseUrl + '/iof/fleet_xls?customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone}
    // ];
    // console.log("widgetData= ", this.widgetData[3].shareUrls.pdf)
    // let x = this.widgetData[3].shareUrls.pdf + ' ' + this.widgetData[3].shareUrls.xls;
    window.open(
      "https://api.whatsapp.com/send?text=" + this.url,
      '_blank'
    );
  }

  emailLink(page,url) {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if(page=='fleet'){
      this.url=environment.baseUrl + '/iof/share_fleet/' + this.customerID + '/' + timeZone + '/';

    }else if(page=='drivers'){
      this.url= environment.baseUrl + '/iof/share_driver/' + this.customerID + '/' + timeZone + '/';
    }else if(page=='maintenance'){
      this.url=environment.baseUrl + '/iof/share_maintenance/' + this.customerID + '/' + timeZone + '/';
    }

    else{
      this.url = window.location.href;

    }
    // let x = this.widgetData[3].shareUrls.pdf + ' ' + this.widgetData[3].shareUrls.xls;

    window.open(
      "mailto:"+this.userEmail+"?subject=VFQ-PDF Report!&body=" + this.url,
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
    // console.log("event= ", event)
    this.exportToCSV.emit(null);
  }
  manageTest(){
     let route=[];
    route[0]="forChangingmanagepath";
    route[1]="forChangingmanagepath";
    this.breadcrumbsService.setValue(route);
  }
  manageTest2(){
    console.log("managetest22");
    let route=[];
   route[0]="maintenance";
   route[1]="Maintenance";
   this.breadcrumbsService.setValue(route);
 }
}
