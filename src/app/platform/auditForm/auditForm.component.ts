import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { DriverDetailsService } from '../services/drivers/driver-details.service';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from 'src/app/core/services/auth.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { XlsPdfService } from '../services/xls-pdf.service';

@Component({
  selector: 'app-auditForm',
  templateUrl: './auditForm.component.html',
  styleUrls: ['./auditForm.component.css']
})

export class AuditFormComponent implements OnInit {
  users;
  cities;
  totalUserLength = 0;
  filtersUser = { limit: 10, offset: 0, order_by: '', order: '', search: '', status: '' };
  displayedUserList = ["id", "entity", "action", "change", "created_at", "created_at_time", "user"]
  EntityStatusEnum = EntityStatusEnum;
  showIndeterminateProgress: boolean;
  keyUp = new Subject<KeyboardEvent>();
  statusLists = [];
  searchText: any;
  searchForm: FormGroup;
  formForFilter: FormGroup;
  getCategories: any;
  getTypes: any;
  selectedCategory: any;
  selectedType: any;
  sendValuesForExport: string;
  statusForExport: boolean = false;
  downloadableLink: string;
  downloadableLink1: string;
  customerID;
  loggedInUser;
  showExportFile: boolean = false;
  isAuthorized = false;
  sidebarCheck;

  @ViewChild('userPaginator') userPaginator: MatPaginator;
  constructor(
    private userService: UserService,
    private driverService: DriverDetailsService,
    private formBuilder: FormBuilder,
    private authService:AuthService,
    private router: Router,
    private drawerService:DrawerService,
    private xlsPdfService:XlsPdfService
  ) {
    this.searchForm = this.formBuilder.group({
      search: [''],
      searchStatus: []
    })
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res=>{
      this.sidebarCheck=res;
      // console.log("ressssssssssssss1",res);
    // console.log("ressssssssssssss2",this.sidebarCheck);
  })

    this.loggedInUser = this.authService.getUser();
    this.customerID = this.loggedInUser.customer.id;
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });

    this.getDropDOwnData();
    this.keyUp.pipe(
      map(event => event.target['value']),
      debounceTime(500),
      distinctUntilChanged(),

      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(newValue => {
      this.searchText = newValue;
      this.filtersUser = { limit: 10, offset: 0, order_by: '', order: '', search: '', status: '' };
      if (this.searchText.length > 0 || this.searchText.length === 0) {
        this.searchForm.get("search").setValue(this.searchText);
        // console.log("this.searchForm.get('search')== ", this.searchForm.get('search').value);
        this.filtersUser.search = this.searchForm.get('search').value;
        this.generateReport();
      }
    });
    this.formForFilter = this.formBuilder.group({
      category: [''],
      type: ['']
    })

  }


  getDropDOwnData() {
    this.userService.getDropDownData().subscribe((data: any) => {
      // console.log("getDropDownData()- ", data);

      if (data.status === HttpStatusCodeEnum.Success) {
        this.getCategories = data.data['category'];
        this.getTypes = data.data['type'];

      } else {
        // console.log(data.message);
      }
      // console.log("this.getCategories= ", this.getCategories);
      // console.log("this.getTypes= ", this.getTypes);
    });
  }

  sortUserList(event) {
    this.filtersUser.order_by = event.active;
    this.filtersUser.order = event.direction;
    let params = `category=${this.formForFilter.value.category}&type=${this.formForFilter.value.type}&limit=${this.filtersUser.limit}&offset=${this.filtersUser.offset}&order=${this.filtersUser.order}&order_by=${this.filtersUser.order_by}&search=${this.filtersUser.search}&status=${this.filtersUser.status}&customer_id=${this.customerID}`;
    //
    this.statusForExport = false;
    this.userService.sendDataForExportAudit(params).subscribe((data: any) => {
      // console.log("sendDataForExportAudit()- ", data);

      if (data.status === HttpStatusCodeEnum.Success) {
        this.users = data.data['data'];
        this.showIndeterminateProgress = false;
        this.totalUserLength = data['data'].count;
        this.users.pagination = this.totalUserLength;
        // this.downloadableLink = environment.baseUrl + '/options/xle/?' + params;
        // this.downloadableLink1 = environment.baseUrl + '/options/pdf/?' + params;
        this.downloadableLink =  params;
        this.downloadableLink1 =  params;

        this.showExportFile = true;
      }
      else if (data.error == true) {
        // console.log("error");
        this.users.pagination = 0;
        this.totalUserLength = 0;
        this.users = [];
        this.statusForExport = true;
        this.showExportFile = false;

      }
      else {
        // console.log(data.message);
      }

    });
  }

  onUserPagination(event) {
    this.filtersUser.offset = (event.pageIndex * event.pageSize);
    // console.log(this.filtersUser);
    this.generateReportPagination();
    // sorry last hour work
  }
  searchStatusDropDownChangeforCategory(value) {
    // console.log("event:: ", value);
    this.selectedCategory = value;
    this.formForFilter.patchValue({
      category: this.selectedCategory
    });


  }
  searchStatusDropDownChangeforType(value) {
    // console.log("event:: ", value);
    this.selectedType = value;
    this.formForFilter.patchValue({
      type: this.selectedType
    });

  }
  generateReportPagination() {
    let params = `category=${this.formForFilter.value.category}&type=${this.formForFilter.value.type}&limit=${this.filtersUser.limit}&offset=${this.filtersUser.offset}&order=${this.filtersUser.order}&order_by=${this.filtersUser.order_by}&search=${this.filtersUser.search}&status=${this.filtersUser.status}&customer_id=${this.customerID}`;
    //
    this.statusForExport = false;
    this.userService.sendDataForExportAudit(params).subscribe((data: any) => {
      // console.log("sendDataForExportAudit()- ", data);

      if (data.status === HttpStatusCodeEnum.Success) {
        this.users = data.data['data'];
        this.showIndeterminateProgress = false;
        this.totalUserLength = data['data'].count;
        this.users.pagination = this.totalUserLength;
        this.downloadableLink =  params;
        this.downloadableLink1 =  params;
        this.showExportFile = true;
      }
      else if (data.error == true) {
        // console.log("error");
        this.users.pagination = 0;
        this.totalUserLength = 0;
        this.users = [];
        this.statusForExport = true;
        this.showExportFile = false;
      }
      else {
        // console.log(data.message);
      }

    });
  }
  generateReport() {
    this.filtersUser.offset = 0;
    let params = `category=${this.formForFilter.value.category}&type=${this.formForFilter.value.type}&limit=${this.filtersUser.limit}&offset=${this.filtersUser.offset}&order=${this.filtersUser.order}&order_by=${this.filtersUser.order_by}&search=${this.filtersUser.search}&status=${this.filtersUser.status}&customer_id=${this.customerID}`;
    //
    this.statusForExport = false;
    this.userPaginator.firstPage();
    this.userService.sendDataForExportAudit(params).subscribe((data: any) => {
      // console.log("sendDataForExportAudit()- ", data);

      if (data.status === HttpStatusCodeEnum.Success) {
        this.users = data.data['data'];
        this.showIndeterminateProgress = false;
        this.totalUserLength = data['data'].count;
        this.users.pagination = this.totalUserLength;
        this.downloadableLink =  params;
        this.downloadableLink1 =  params;
        this.showExportFile = true;
      }
      else if (data.error == true) {
        // console.log("error");
        this.users.pagination = 0;
        this.totalUserLength = 0;
        this.users = [];
        this.statusForExport = true;
        this.showExportFile = false;
      }
      else {
        // console.log(data.message);
      }

    });
  }

  downloadXLS(download) {
    this.userService.downloadXLSAuditForm(download).subscribe((apiResponse: any) => {
      // console.log("downloadXLS response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob)
      this.xlsPdfService.downloadXlsPdf(url,'Audit Report.xls')
    })
  }

  downloadPDF(download1) {
    this.userService.downloadPDFAuditForm(download1).subscribe((apiResponse: any) => {
      // console.log("downloadPDF response== ", apiResponse)
      const data = apiResponse;
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      this.xlsPdfService.downloadXlsPdf(url,'Audit Report.pdf')
    })
  }
}
