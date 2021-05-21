import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EntityType, EntityStatusEnum, SkipSizeToMaterialEnum } from 'src/app/core/enum/entity-type.enum';
import { isNullOrUndefined } from 'util';
import { FileUpload } from 'primeng';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CustomValidators } from 'src/app/core/custom.validator';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { LoginApiResponse, ApiResponse } from 'src/app/core/model/api.response';
import { AuthService } from 'src/app/core/services/auth.service';
import { HttpController } from 'src/app/core/services/loading-controller';
import { SwalService } from 'src/app/core/services/swal.service';
import { AppLoader } from '../../data/model/app-loader';
import { DropDownItem } from '../../data/model/dropdown-item';
import { AppLocation } from '../../data/model/location';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { GoogleMapComponent } from '../../google-map/google-map.component';
import { BinService } from '../../services/bin-service.service';
import { DatatableService } from '../../services/datatable.service';
import { FormService } from '../../services/FormService';
import { GetIconsService } from '../../services/get-icons.service';
import { GotoPageService } from '../../services/goto-page.service';
import { BrandingService } from '../../shared/services/branding.service';
import { ErrorMessage } from '../../error-message';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DrawerService } from 'src/app/core/services/drawer.service';
declare var $: any;
declare var google: any;

@Component({
  selector: 'app-audit-document',
  templateUrl: './audit-document.component.html',
  styleUrls: ['./audit-document.component.css'],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ]
})
export class AuditDocumentComponent implements OnInit {

  searchForm: FormGroup;
  searchPlaceHolder: string;
  enableSearch: boolean;
  showIndeterminateProgress: boolean;
  showIndeterminateProgressforFile: boolean;
  optimizedCall: any;
  SkipSizeToMaterialEnum = SkipSizeToMaterialEnum;
  contractForm: FormGroup;
  itemListBins = [];
  binsList = [];
  selected_bins = [];
  area_list = [];
  location_list = [];
  client_list = [];
  skip_size_list = [];
  contract_type_list = [];
  selected_client: any;
  selected_skip_size: any;

  selected_entity_sub_type: any;
  minDate = new Date();
  theme;
  isAuthorized = false;
  selectedUser;
  selectedDocument;
  submitted = false;

  reportTypeTable=0;

  driverGroup = [];
  drivers = [];
  documentType = [];

  param_areas = [];
  param_locations = [];
  param_clients = [];
  isNullOrUndefined = isNullOrUndefined;
  @ViewChild('closeForm') private closeForm;
  @ViewChild('cImage') private image1;
  @ViewChild('closeP') private closeP;
  @ViewChild('showP') private showP;
  @ViewChild('fileuploader') private uploader: FileUpload;

  locations: AppLocation[] = [];
  clients_loader_flag: boolean;
  areas_loader_flag: boolean;
  locations_loader_flag: boolean;
  inputValue = '';
  uploadedPercentage = 0;
  fileUploadStatus = false;

  @ViewChild("scrollToTop")
  scrollToTop: ElementRef;

  @ViewChild('myInput')
  myInputVariable: any;
  @ViewChild('img')
  image: any;
  btnLoading: boolean;
  btnText: string;
  formTitle = 'Add Document';
  status = { total: 0, active: 0, inactive: 0, renewed: 0, expiring: 0, expired: 0, deactivated: 0, newcontracts: 0, expiring_in_3: 0 };

  contractStartDate: Date;
  contractEndDate: Date;
  hashMap: any = {};
  deleteAllButton: boolean;

  displayedColumns = ['id', 'entity', 'document_type', 'uploaded_documents', 'upload_date', 'upload_by', 'actions'];
  filters = { limit: 10, offset: 0, order_by: '', order: '', type_id: 42 };

  fileUploadProgressBar: boolean;
  appLoader = new AppLoader();
  contracts = [];
  errorMessages = [];
  selectedRows: any[] = [];
  temp = [];
  EntityStatusEnum = EntityStatusEnum;
  EntityType = EntityType;
  csvCols = [
    { field: 'name', header: 'Name' },
    { field: 'customer_name', header: 'Customer' },
    { field: 'party_code', header: 'Party Code' },
    { field: 'skip_rate', header: 'Skip Rate' },
    { field: 'date_commissioned', header: 'Start Date' },
    { field: 'date_of_joining', header: 'End Date' },
    { field: 'assigned_area_name', header: 'Area' },

    { field: 'assigned_location_name', header: 'Location' },
    { field: 'client_name', header: 'Customer' },
  ];
  csvRows = [];

  source_latlong = null;
  @ViewChild('binMap') binMap: GoogleMapComponent;
  downloadableLink: string;
  downloadableLink1: string;
  loggedInUser;
  customerID;

  totalContractsLength = 0;
  filtersContracts = { type: 2, limit: 5, offset: 0, order_by: '', order: '', search: '' };
  filtersFleet = { limit: 10, offset: 0, order_by: '', order: '', search: '', entity_sub_type_id: '', fleet_id: '' };
  selectedDriver = '';
  selectedFleet='';
  filesGreaterThanFive = [];
  sizeGreaterThanFive: boolean = false;
  expandedElement: any;
  sidebarCheck;

  statusList = [{ id: 1, name: "Driver" }, { id: 2, name: "Fleet" }];
  userType;
  selectedType='';
  fleets;
  vehicles;
  listVariable="Please Select From Dropdown";
  selectedValue;
  disableCheck=false;
  selectedTypeSearch='';

  constructor(public formBuilder: FormBuilder,
    public gotoService: GotoPageService,
    private authService: AuthService,
    private swalService: SwalService,
    private binService: BinService,
    private datatableService: DatatableService,
    private brandingService: BrandingService,
    public formService: FormService,
    public getIconsService: GetIconsService,
    private drawerService: DrawerService) {
    this.contractForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      documentName: [null, [Validators.required]],
      select_group: [null, [Validators.required]],
      select_fleet: [null, [Validators.required]],
      select_vehicle: [null, [Validators.required]],
      // contract_name: [null, [Validators.required, CustomValidators.isNumbers]],
      // selected_client: [null, [Validators.required]],
      select_driver: [null, [Validators.required]],
      document_type: [null, [Validators.required]],
      // date_of_joining: [null, [Validators.required]],
      // date_commissioned: [null, [Validators.required]],
      // description: [null, [Validators.required]],
      // photo: [null],
      // photo_method: [null],
      files: [null],
      // source_latlong: [null]
    });
    this.searchForm = this.formBuilder.group({
      search: ['']
    })

    this.theme = this.brandingService.styleObject();
  }
  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit() {
    this.drawerService.getValue().subscribe(res=>{
      this.sidebarCheck=res;
      console.log("ressssssssssssss1",res);
    console.log("ressssssssssssss2",this.sidebarCheck);
  })

    this.loggedInUser = this.authService.getUser();
    console.log("loggedInUser",this.loggedInUser);
    this.statusList.forEach((element: any) => {
      element.label = element.name;
      element.value = element.id;
    });
    this.userType=this.loggedInUser.package[0].package_id;
    if(this.userType==6){
      this.statusList = [{ id: 1, name: "Driver" }, { id: 2, name: "Fleet" }];
    }else{
      this.statusList = [ { id: 2, name: "Fleet" }];
    }

    
    this.customerID = this.loggedInUser.customer.id;
    this.areas_loader_flag = false;
    this.locations_loader_flag = false;
    this.clients_loader_flag = false;
    this.deleteAllButton = false;
    
    this.getDriversGroup();
    
    this.getDriverFromGroup(null);
    this.sizeGreaterThanFive = false;

    this.FleetDropdown();
  }

  ngAfterViewInit(): void {
    this.scrollToTop.nativeElement.scrollIntoView({ behavior: "instant", block: "end" });
  }

  ngOnDestroy() {
    if (this.optimizedCall !== null && this.optimizedCall !== undefined) {
      this.optimizedCall.unsubscribe();
    }
  }

  getDriversGroup() {
    this.formService.driverGroupsDocument().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.driverGroup = data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
        console.log("driver_grp",this.driverGroup);
      } else {
        console.log(data.message);
      }
    });
  }
  FleetDropdown() {
    this.formService.getFleetFiltersDropdown().subscribe(apiResponse => {
      this.fleets = apiResponse.data.data.map(
        item => new DropDownItem(item['id'], item['name'])
      );;
      console.log("this.fleets2----", this.fleets);
    })
  }

  onFleetChange(event){
    console.log("evemn",event);
    this.filtersFleet.fleet_id=event.id;
   this.getFleets(event.id);
  }

  getFleets(fleetID): void {
    console.log("coming i getfleet");
    // let params = `limit=${filtersFleet.limit}&offset=${filtersFleet.offset}&order=${filtersFleet.order}&order_by=${filtersFleet.order_by}`;
    // let params = `limit=${filtersFleet.limit}&offset=${filtersFleet.offset}&order=${filtersFleet.order}&order_by=${filtersFleet.order_by}&fleet_id=${filtersFleet.fleet_id}&search=${filtersFleet.search}`;
    // this.inputValue = "";
    // this.searchPlaceHolder = 'Loading...';
    // this.enableSearch = true;
    // this.trucks = [];

    this.formService.getFleetsList(fleetID)
      .subscribe((data: any) => {
        if (!data.error) {
          this.vehicles = data['data'].map(
            item => new DropDownItem(item['id'], item['name'])
          );;
          console.log("this.vehicles= ", this.vehicles);
         
        }
      });

  }

  onDocumentNameChangeTwo(event){
    console.log("eventttt",event.id);
   if(event.id==1){
    
     this.selectedType="driver";
     this.selectedTypeSearch="driver";
     this.reportTypeTable=1;
     this.listVariable='Driver List';

   }else{
    this.selectedTypeSearch="fleet";
     this.selectedType="fleet";
     this.reportTypeTable=2;
     this.listVariable='Fleet List';
   }
   console.log("this.selectedType",this.selectedType)
  //  this.getDocumentType();
   this.getContracts();
  }
  onDocumentNameChange(event){
    console.log("eventttt",event.id);
   if(event.id==1){
    
     this.selectedType="driver";
     this.reportTypeTable=1;
     this.listVariable='Driver List';

   }else{
    
     this.selectedType="fleet";
     this.reportTypeTable=2;
     this.listVariable='Fleet List';
   }
   console.log("this.selectedType",this.selectedType)
   this.getDocumentType();
   this.getContracts();
  }

  onDriverGroupChange(event) {
    let id = event.id;
    this.getDriverFromGroup(id);
  }

  getDriverFromGroup(id) {
    this.formService.driverfromGroupsDocument(id).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.drivers = data.data.data.map(
          item => new DropDownItem(item['id'], item['name'])
        );
      } else {
        console.log(data.message);
      }
    });
  }
  getDocumentType() {
console.log("sekectedtype",this.selectedType);
    if(this.selectedType=="driver"){
      console.log("comin in driver");
      this.documentType=[];
      this.formService.getDocumentType().subscribe((data: any) => {
        if (data.status === HttpStatusCodeEnum.Success) {
          this.documentType = data.data.map(
            item => new DropDownItem(item['id'], item['name'])
          );
          //  this.drivers=data.data;
          // this.driverLists = [];
          // this.typeList = [];
          //  this.reportTypeTable=0;
          // console.log("coming in documentType", this.documentType);
        } else {
          console.log(data.message);
        }
      });
    }else{
    // console.log("coming in getDriversGroup");
    console.log("comin in fleet");
    this.documentType=[];
        this.formService.getDocumentTypeFleet().subscribe((data: any) => {
          if (data.status === HttpStatusCodeEnum.Success) {
            this.documentType = data.data.map(
              item => new DropDownItem(item['id'], item['name'])
            );
            //  this.drivers=data.data;
            // this.driverLists = [];
            // this.typeList = [];
            //  this.reportTypeTable=0;
            // console.log("coming in documentType", this.documentType);
          } else {
            console.log(data.message);
          }
        });
    }
  }
  // onDriverChange(event) {
  //   let id = event.id;
  //   this.formService.returnDocumentType(id).subscribe((data: any) => {
  //     // if (data.status === HttpStatusCodeEnum.Success) {
  //     //   this.drivers = data.data.data.map(
  //     //     item => new DropDownItem(item['id'], item['name'])
  //     //   );
  //     //   //  this.drivers=data.data;
  //     //   // this.driverLists = [];
  //     //   // this.typeList = [];
  //     //   //  this.reportTypeTable=0;
  //     // } else {
  //     //   console.log(data.message);
  //     // }
  //   });
  // }

  validate(): boolean {
    let isValid = true;
    this.errorMessages = [];
  if(this.selectedType=="driver"){
    if (this.contractForm.get('select_group').hasError('required')) {
      this.errorMessages.push('Group ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.contractForm.get('select_driver').hasError('isAlphabets')) {
      this.errorMessages.push('Driver ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
    if (this.contractForm.get('document_type').hasError('isEmptyValue')) {
      this.errorMessages.push('Document Type ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
  }else{
    if (this.contractForm.get('select_fleet').hasError('required')) {
      this.errorMessages.push('Fleet ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.contractForm.get('select_vehicle').hasError('isAlphabets')) {
      this.errorMessages.push('Driver ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
      isValid = false;
    }
  }

    return isValid;
  }

  onSubmit1(value) {
   console.log("valueeeee",value);
    const param: FormData = new FormData();
    this.submitted = true;
    if (this.validate()) {
      // console.log("this.uploader== ", this.uploader);
      if (this.uploader.files.length > 0) { //&& this.uploader.files.length <= 10
        for (let i = 0; i < this.uploader.files.length; i++) {
          param.append('files', this.uploader.files[i]);
        }
        this.fileUploadStatus = true;
      }
      // else if (this.uploader.files.length >= 10) {
      //   this.swalService.getWarningSwal('You cannot upload more than 10 documents');
      //   return;
      // }
      console.log("coming1",value['documentName'])
      console.log("coming1",value['documentName'].name)
    if(value['documentName'].name=="Driver"){
      console.log("coming11")
      param.append('driver_group_id', value['select_group']['id']);
      param.append('driver_id', value['select_driver']['id']);
      this.selectedDriver = value['select_driver']['id']
      console.log("coming2")
    }else{
      
      param.append('fleet_id', value['select_fleet']['id']);
      param.append('vehicle_id', value['select_vehicle']['id']);
      this.selectedFleet = value['select_fleet']['id']
      console.log("coming22")
    }
    
      // param.append('documentName', value['documentName']['id']);
      param.append('document_type_id', value['document_type']['id']);
      console.log('form', param);
      
      console.log("coming3")
      delete value['select_driver'];
      delete value['document_type'];
      delete value['select_group'];

      // delete value['select_fleet'];

      this.disableSubmitButton();
      if (this.selectedUser) {
        console.log("coming5",param)
        this.patchContract(param);
      } else {
        console.log("coming4")
        this.postContract(param);
      }
    } else {
      console.log("Form is invalid[in else condition]", this.errorMessages);
    }

  }

  postContract(param) {
    console.log("parammmmmmmmmmm",this.selectedType);
    this.uploadedPercentage = 0;
    if(this.selectedType=="driver"){
    // console.log("param before creating  document api= ", param)
    this.formService.postDocument(param).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.closeForm.nativeElement.click();
        this.selectedType='driver';
        this.getContracts();
        this.swalService.getSuccessSwal(data.message);
        // this.context.updateContractsRows(apiResponse['body']);
      }
      else {
        this.enableSubmitButton();
        this.swalService.getErrorSwalforDocument(data.message);
      }
    });
  }else{
    this.formService.postDocumentFleet(param).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.closeForm.nativeElement.click();
        this.selectedType='fleet';
        this.getContracts();
        this.swalService.getSuccessSwal(data.message);
        // this.context.updateContractsRows(apiResponse['body']);
      }
      else {
        this.enableSubmitButton();
        this.swalService.getErrorSwalforDocument(data.message);
      }
    });
  }
  }
  materials = [];
  patchContract(truck: FormData) {
    console.log("truck== ", truck)
    truck.append('id', this.selectedUser);
    if(this.selectedType=='driver'){
    truck.append('driver_id', this.selectedDriver);
    }
    // else{
    //   truck.append('vehicle_id', this.selectedFleet);
    // }
    // truck.delete('driver_id');
    this.uploadedPercentage = 0;
    // console.log("param before updating  document= ", truck);
    if(this.selectedType=='driver'){
    this.formService.patchDocument(truck).subscribe(new class extends HttpController<HttpEvent<any>> {
      onComplete(): void {
      }

      onError(errorMessage: string, err: any) {
        this.context.enableSubmitButton();
        this.context.swalService.getErrorSwal(errorMessage);
        this.context.fileUploadStatus = false;
        this.context.closeP.nativeElement.click();
        console.log(errorMessage);
      }

      onNext(apiResponse: HttpEvent<any>): void {
        switch (apiResponse.type) {
          case HttpEventType.Sent:
            if (this.context.fileUploadStatus) {
              this.context.fileUploadStatus = true;
              this.context.showP.nativeElement.click();
              this.context.bringupModal();
            }
            break;
          case HttpEventType.Response:
            this.context.closeP.nativeElement.click();
            this.context.fileUploadStatus = false;
            if (apiResponse.body.error === false) {
              this.context.enableSubmitButton();
              this.context.closeForm.nativeElement.click();
              this.context.swalService.getSuccessSwal(apiResponse.body.message);
              // this.context.updateContractsRows(apiResponse['body']);
              this.context.getContracts();
            } else {
              this.context.swalService.getErrorSwal(apiResponse.body.message);
              this.context.btnText = "Update";
              this.context.fileUploadStatus = false;
              this.context.closeP.nativeElement.click();
              // this.context.closeForm.nativeElement.click();
            }
            break;
          case 1: {
            if (this.context.fileUploadStatus) {
              if (Math.round(this.context.uploadedPercentage) !== Math.round(event['loaded'] / event['total'] * 100)) {
                this.context.uploadedPercentage = Math.ceil(event['loaded'] / event['total'] * 100);
                if (Math.ceil(event['loaded'] / event['total'] * 100) == 100) {
                  setTimeout(() => {
                    this.context.closeP.nativeElement.click();
                  }, 400
                  );
                }
              }
            }
            break;
          }
        }
        this.context.enableSubmitButton();
      }

    }(this)
    );
   }else{
    this.formService.patchDocumentFleet(truck).subscribe(new class extends HttpController<HttpEvent<any>> {
      onComplete(): void {
      }

      onError(errorMessage: string, err: any) {
        this.context.enableSubmitButton();
        this.context.swalService.getErrorSwal(errorMessage);
        this.context.fileUploadStatus = false;
        this.context.closeP.nativeElement.click();
        console.log(errorMessage);
      }

      onNext(apiResponse: HttpEvent<any>): void {
        switch (apiResponse.type) {
          case HttpEventType.Sent:
            if (this.context.fileUploadStatus) {
              this.context.fileUploadStatus = true;
              this.context.showP.nativeElement.click();
              this.context.bringupModal();
            }
            break;
          case HttpEventType.Response:
            this.context.closeP.nativeElement.click();
            this.context.fileUploadStatus = false;
            if (apiResponse.body.error === false) {
              this.context.enableSubmitButton();
              this.context.closeForm.nativeElement.click();
              this.context.swalService.getSuccessSwal(apiResponse.body.message);
              // this.context.updateContractsRows(apiResponse['body']);
              this.context.getContracts();
            } else {
              this.context.swalService.getErrorSwal(apiResponse.body.message);
              this.context.btnText = "Update";
              this.context.fileUploadStatus = false;
              this.context.closeP.nativeElement.click();
              // this.context.closeForm.nativeElement.click();
            }
            break;
          case 1: {
            if (this.context.fileUploadStatus) {
              if (Math.round(this.context.uploadedPercentage) !== Math.round(event['loaded'] / event['total'] * 100)) {
                this.context.uploadedPercentage = Math.ceil(event['loaded'] / event['total'] * 100);
                if (Math.ceil(event['loaded'] / event['total'] * 100) == 100) {
                  setTimeout(() => {
                    this.context.closeP.nativeElement.click();
                  }, 400
                  );
                }
              }
            }
            break;
          }
        }
        this.context.enableSubmitButton();
      }

    }(this)
    );
   }
  }

  getFileName(fileName) {
    var filename = fileName.replace(/^.*[\\\/]/, '')
    return filename;
  }

  bringupModal() {
    let element = document.body;
    element.className = element.className.replace('modal-open', '');
    var element1 = document.getElementsByClassName('modal-backdrop');
    if (element1.length) {
      (<HTMLElement>element1[1]).style.zIndex = '1500';
    }
  }

  updateContractsRows(apiResponse) {
    this.contracts.splice(this.rowIndexBeingEdited, 1);
    this.contracts.unshift(apiResponse.response);
    this.contracts = [...this.contracts];
    this.temp = this.contracts;
    this.csvRows = this.contracts;
  }

  AdButtonClick(data) {
    this.selectedType='';
    this.disableCheck=false;
    this.submitted = false;
    this.deg = 0;
    this.uploader.files = [];
    this.image1.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;-webkit-transform:rotate(' + this.deg + 'deg);' + '-moz-transform:rotate(' + this.deg + 'deg);' + '-o-transform:rotate(' + this.deg + 'deg);' + '-ms-transform:rotate(' + this.deg + 'deg);' + 'transform:rotate(' + this.deg + 'deg);');
    window.dispatchEvent(new Event('resize'));
    this.formTitle = 'Add Document';
    this.enableSubmitButton();
    this.contractForm.reset();
    this.itemListBins = [];
    this.picName = null;
    this.client_list = [];
    this.param_clients = [];
    this.param_areas = [];
    this.param_locations = [];
    this.inactiveRecord = false;
    this.avatar = null;
    this.avatar_url = null;
    // this.getBins();
    this.getClients();
    this.getAreas();
    this.getLocations();
    this.areas_loader_flag = true;
    this.locations_loader_flag = true;
    this.clients_loader_flag = true;
    let inputDiv = $('#pac-input');
    if (!data) {
      this.selectedUser = 0;
      this.selectedDriver = '';
      this.selectedFleet='';
    }

    setTimeout(() => {
      inputDiv.val('')
      inputDiv.focus();
    }, 10);
  }

  getAreas() {
    this.formService.getBinsData('get_entity_dropdown', { entity: EntityType.AREA })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          console.log(errorMessage);
          this.context.loader_flag = false;
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            if (apiResponse.response !== undefined) {
              this.context.area_list = apiResponse.response.map(
                item => new DropDownItem(item['id'], item['label'])
              );
            }
          }
          this.context.areas_loader_flag = false;
        }
      }(this)
      );
  }

  getLocations() {
    this.formService.getBinsData('get_entity_dropdown', { entity: EntityType.LOCATION })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
          this.context.loader_flag = false;
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            if (apiResponse.response !== undefined) {
              this.context.location_list = apiResponse.response.map(
                item => new DropDownItem(item['id'], item['label'])
              );
            }
          }
          this.context.locations_loader_flag = false;
        }
      }(this)
      );
  }

  getClients() {
    this.formService.getBinsData('get_entity_dropdown', { entity: EntityType.CLIENT })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
          this.context.loader_flag = false;
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.client_list = apiResponse.response.map(
              item => new DropDownItem(item['id'], item['label'])
            );
          } else {
            console.log(apiResponse.message);
          }
          this.context.clients_loader_flag = false;
        }
      }(this)
      );

  }

  getBinsEdit(obj) {
    this.formService.getBinsData('get_bins_contract_dropdown', {})
      .subscribe(new class extends HttpController<ApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: ApiResponse<any>): void {
          if (apiResponse.status) {
            this.context.binsList = apiResponse.response;
            if (apiResponse.response !== undefined) {
              this.context.itemListBins = apiResponse.response.map(
                item => new DropDownItem(item['id'], item['label'])
              );
            }
            for (let i = 0; i < obj.length; i++) {
              this.context.itemListBins = [...this.context.itemListBins, new DropDownItem(obj[i]['id'],
                obj[i]['name'])];
            }
          } else {
            console.log(apiResponse.message);
          }
        }
      }(this)
      );
  }

  getParams(sDate) {
    let params = null;
    params = {
      inputDate: DateUtils.getUTCYYYYMMDDHHmmss(sDate.toString())
    };
    return params;
  }

  disableButton(row) {
    return this.formService.disableButton(row);
  }

  getContracts() {
    // console.log("coming in ");
    this.inputValue = '';
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.contracts = [];
    const index_a = 0;
    const index_b = 100;
    const results_remaining = false;
    this.optimized_contract_call(index_a, index_b, this.filters);
  }

  optimized_contract_call(index_a, index_b, filters) {
    this.showIndeterminateProgress = true;
    if(this.selectedType=='driver'){
      this.optimizedCall = this.formService.getDocumentListing({
        type_id: 42,
        index_a: index_a,
        index_b: index_b,
        order: filters.order,
        order_by: filters.order_by,
      })
        .subscribe((data: any) => {

          if (!data.error) {
            // this.contracts=data.data['data'];
            this.contracts = data.response;
            this.temp = this.contracts;
            this.enableSearch = false;
            this.showIndeterminateProgress = false;
          } else {
            this.swalService.getWarningSwal(data.message);
          }
          // this.contracts=data.data['data'];

          this.totalContractsLength = data.data.count;
          this.contracts = data['data'].data;
          // this.contracts.paginator = this.totalpermissionLength;

          this.downloadableLink = environment.baseUrl + '/hypernet/entity/documents?export=excel&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
          this.downloadableLink1 = environment.baseUrl + '/hypernet/entity/documents?export=pdf&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        );
    } else{
      this.optimizedCall = this.formService.getDocumentListingFleet({
        type_id: 42,
        index_a: index_a,
        index_b: index_b,
        order: filters.order,
        order_by: filters.order_by,
      })
        .subscribe((data: any) => {

          if (!data.error) {
            // this.contracts=data.data['data'];
            this.contracts = data.response;
            this.temp = this.contracts;
            this.enableSearch = false;
            this.showIndeterminateProgress = false;
          } else {
            this.swalService.getWarningSwal(data.message);
          }
          // this.contracts=data.data['data'];

          this.totalContractsLength = data.data.count;
          this.contracts = data['data'].data;
          // this.contracts.paginator = this.totalpermissionLength;

          this.downloadableLink = environment.baseUrl + '/hypernet/entity/documents?export=excel&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
          this.downloadableLink1 = environment.baseUrl + '/hypernet/entity/documents?export=pdf&customer_id=' + this.customerID + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        );
    } 
  }

  expiring = [];
  optimizedCallexpiring: any;
  getExpiringContracts() {
    let index_a = 0;
    let index_b = 100;
    this.status.expiring = 0;
    let results_remaining = true;
    this.expiring = [];
    this.optimized_expiring_contracts_call(index_a, index_b);
  }

  optimized_expiring_contracts_call(index_a, index_b) {
    this.optimizedCallexpiring = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_expiring_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderExpiring = 'Search';
      //     this.context.enableSearchExpiring = false;
      //     this.context.showIndeterminateProgressExpiring = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.expiring = [];
      //     this.context.expiring = [...this.context.expiring, ...apiResponse.response];
      //     this.context.tempexpiring = this.context.expiring;
      //     this.context.status.expiring = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.expiring += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  expiringInThreeMonths = [];
  getExpiringinThreeMonthsContracts() {
    // this.inputValueExpiringInThreeMonths = '';
    // this.searchPlaceHolderExpiringInThreeMonths = 'Loading...';
    let index_a = 0;
    let index_b = 100;
    this.status.expiring_in_3 = 0;
    this.expiringInThreeMonths = [];
    this.optimized_expiring_in_3_contracts_call(index_a, index_b);
  }

  optimized_expiring_in_3_contracts_call(index_a, index_b) {
    this.optimizedCallexpiring = this.formService.getContractsListing({
      type_id: 'expiring_in_3',
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_expiring_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderExpiringInThreeMonths = 'Search';
      //     this.context.tempExpiringInThreeMonths = this.context.expiringInThreeMonths;
      //     console.log('temp', this.context.tempExpiringInThreeMonths);


      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     console.log('expirung in 3', apiResponse.response);
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.expiringInThreeMonths = [];
      //     this.context.expiringInThreeMonths = [...this.context.expiringInThreeMonths, ...apiResponse.response];
      //     this.context.status.expiring_in_3 = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.expiring_in_3 += 1;
      //     }

      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  expired = [];
  optimizedCallexpired: any;
  getExpiredContracts() {
    // this.inputValueExpired = '';
    // this.searchPlaceHolderExpired = 'Loading...';
    // this.enableSearchExpired = true;
    // this.showIndeterminateProgressExpired = true;
    let index_a = 0;
    let index_b = 100;
    this.status.expired = 0;
    let results_remaining = true;
    this.expired = [];
    this.optimized_expired_contracts_call(index_a, index_b);
  }

  optimized_expired_contracts_call(index_a, index_b) {
    this.optimizedCallexpired = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_expired_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderExpired = 'Search';
      //     this.context.enableSearchExpired = false;
      //     this.context.showIndeterminateProgressExpired = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.expired = [];
      //     this.context.expired = [...this.context.expired, ...apiResponse.response];
      //     this.context.tempexpired = this.context.expired;
      //     this.context.status.expired = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.expired += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  renewed = [];
  optimizedCallrenewal: any;

  getRenewedContracts() {
    // this.inputValueRenewed = '';
    // this.searchPlaceHolderRenewed = 'Loading...';
    // this.enableSearchRenewed = true;
    // this.showIndeterminateProgressRenewed = true;
    let index_a = 0;
    let index_b = 100;
    this.status.renewed = 0;
    let results_remaining = true;
    this.renewed = [];
    this.optimized_renewed_contracts_call(index_a, index_b);
  }

  optimized_renewed_contracts_call(index_a, index_b) {
    this.optimizedCallrenewal = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_renewed_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderRenewed = 'Search';
      //     this.context.enableSearchRenewed = false;
      //     this.context.showIndeterminateProgressRenewed = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.renewed = [];
      //     this.context.renewed = [...this.context.renewed, ...apiResponse.response];
      //     this.context.temprenewed = this.context.renewed;
      //     this.context.status.renewed = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.renewed += 1;
      //     }

      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  newcontracts = [];
  optimizedCallnew: any;

  getNewContracts() {
    // this.inputValueNew = '';
    // this.searchPlaceHolderNew = 'Loading...';
    // this.enableSearchNew = true;
    // this.showIndeterminateProgressNew = true;
    let index_a = 0;
    this.status.newcontracts = 0;
    let index_b = 100;
    let results_remaining = true;
    this.newcontracts = [];
    this.optimized_new_contracts_call(index_a, index_b);
  }

  optimized_new_contracts_call(index_a, index_b) {
    this.optimizedCallnew = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_new_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderNew = 'Search';
      //     this.context.enableSearchNew = false;
      //     this.context.showIndeterminateProgressNew = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.newcontracts = [];
      //     this.context.newcontracts = [...this.context.newcontracts, ...apiResponse.response];
      //     this.context.tempnew = this.context.newcontracts;
      //     this.context.status.newcontracts = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.newcontracts += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }

  deactivated = [];
  optimizedCalldeactivated: any;

  getDeactivatedContracts() {
    // this.inputValueDeactivated = '';
    // this.searchPlaceHolderDeactivated = 'Loading...';
    // this.enableSearchDeactivated = true;
    // this.showIndeterminateProgressDeactivated = true;
    this.status.deactivated = 0;
    let index_a = 0;
    let index_b = 100;
    let results_remaining = true;
    this.deactivated = [];
    this.optimized_deactivated_contracts_call(index_a, index_b);
  }

  optimized_deactivated_contracts_call(index_a, index_b) {
    this.optimizedCalldeactivated = this.formService.getContractsListing({
      type_id: 42,
      index_a: index_a,
      index_b: index_b
    }).subscribe((data: any) => {
      // onComplete(): void {
      //   if (this.context.results_remaining) {
      //     index_a += 100;
      //     index_b += 100;
      //     this.context.optimized_deactivated_contracts_call(index_a, index_b);
      //   } else {
      //     this.context.searchPlaceHolderDeactivated = 'Search';
      //     this.context.enableSearchDeactivated = false;
      //     this.context.showIndeterminateProgressDeactivated = false;
      //   }
      // }

      // onError(errorMessage: string, err: any) {
      //   // do
      //   this.context.swalService.getErrorSwal(errorMessage);

      //   // console.log(errorMessage);

      // }

      // onNext(apiResponse: TestApiResponse<any[]>): void {
      //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
      //     this.context.results_remaining = apiResponse.remaining;
      //     this.context.deactivated = [];
      //     this.context.deactivated = [...this.context.deactivated, ...apiResponse.response];
      //     this.context.tempdeactivated = this.context.deactivated;
      //     this.context.status.deactivated = 0;
      //     for (let i = 0; i < apiResponse.response.length; i++) {
      //       this.context.status.deactivated += 1;
      //     }
      //   }
      //   if (apiResponse.status === HttpStatusCodeEnum.Error) {
      //     this.context.swalService.getErrorSwal(apiResponse.message);
      //   }

      // }
    }
    );

  }


  populateHashmap(list) {
    for (const entry of list) {
      this.hashMap[entry.id] = false;
    }
    console.log('hashmap', this.hashMap);
  }

  getprogress(area) {
    return this.hashMap[area.id];
  }


  onSelect({ selected }) {
    console.log("onSelect: ", selected);
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  async showDeleteCategoryConfirmation(row) {
    // console.log("call delete api = ", row);
    const response = await this.swalService.getConfirmSwal();
    if (response) {
      this.hashMap[row.id] = true;
      if(row.driver_id){
        this.formService.deleteDocument({ 'id': [row.driver_id], 'documentTypeId': [row.document_type_id] }).subscribe((data: any) => {
          if (!data.error) {
            this.closeForm.nativeElement.click();
            this.swalService.getSuccessSwal('Contract deleted successfully');
            this.getContracts();
          } else {
            this.swalService.getWarningSwal(data.message);
          }
        });
      }else{
        this.formService.deleteDocumentFleet({ 'id': [row.vehicle_id], 'documentTypeId': [row.document_type_id] }).subscribe((data: any) => {
          if (!data.error) {
            this.closeForm.nativeElement.click();
            this.swalService.getSuccessSwal('Contract deleted successfully');
            this.getContracts();
          } else {
            this.swalService.getWarningSwal(data.message);
          }
        });
      }
    }
  }

  // Swal dialog for Delete/inactive
  async showSwal(row) {
    const response = await this.swalService.getConfirmSwal();
    if (response == true) {
    }
  }

  // Delete bin
  deleteContract(binId, actionType, message?) {
    const params = {};
    params['id_list'] = (binId);
    params['status'] = actionType;
    this.formService.deleteData(params)
      .subscribe((data: any) => {

        if (!data.error) {
          this.closeForm.nativeElement.click();
          this.swalService.getSuccessSwal('Contract deleted successfully');
          // this.getTrucks(this.filtersTruck);
        } else {
          this.swalService.getWarningSwal(data.message);
        }
        // onComplete(): void {
        // }

        // onError(errorMessage: string, err: any) {
        //   // do
        //   console.log(errorMessage);
        //   this.context.swalService.getErrorSwal(errorMessage);
        // }

        // onNext(apiResponse: ApiResponse<any>): void {
        //   if (!this.context.selectedRows.length) {
        //     this.context.swalService.getSuccessSwal(message);
        //   } else {
        //     this.context.selectedRows = [];
        //   }
        //   this.context.inputValue = '';
        //   this.context.getContracts();
        // }

      }
      );
  }

  async showSwalForMultiple(type) {
    this.deleteAllButton = true;
    const arr = [];
    const id_list = [];
    let showInactive = false;
    this.selectedRows.forEach(item => {
      arr.push(item.name);
      id_list.push(item.id);
      if (item.status_id === this.EntityStatusEnum.Active) {
        showInactive = true;
      }
    });
    for (let single_id = 0; single_id < id_list.length; single_id++) {
      this.hashMap[id_list[single_id]] = true;
    }
    this.formService.deleteDataCheck({ 'id_list': id_list })
      .subscribe((data: any) => {
        // onComplete(): void {
        // }

        // onError(errorMessage: string, err: any) {
        //   // do
        //   console.log(errorMessage);
        //   this.context.deleteAllButton = false;
        //   for (let single_id = 0; single_id < id_list.length; single_id++) {
        //     this.context.hashMap[id_list[single_id]] = false;
        //   }
        //   this.context.swalService.getErrorSwal(errorMessage);
        // }

        // async onNext(apiResponse: ApiResponseNew<any>) {
        //   console.log(apiResponse);
        //   this.context.deleteAllButton = false;
        //   for (let single_id = 0; single_id < id_list.length; single_id++) {
        //     this.context.hashMap[id_list[single_id]] = false;
        //   }

        //   if (apiResponse.status === HttpStatusCodeEnum.Success) {
        //     const shouldDeleteOrInactive = await this.context.swalService.getMultipleDeleteSwal(arr);
        //     if (shouldDeleteOrInactive) {
        //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
        //       this.context.deleteContract(id_list, shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', type);
        //     }
        //   } else if (apiResponse.status === HttpStatusCodeEnum.Bad_Request) {
        //     const shouldDeleteOrInactive = await this.context.swalService.getMultipleDeleteSwal(arr, apiResponse.message);
        //     if (shouldDeleteOrInactive) {
        //       const message = shouldDeleteOrInactive === EntityStatusEnum.Delete ? 'deleted' : 'marked inactive';
        //       this.context.deleteContract(id_list, shouldDeleteOrInactive, 'Record has been ' + message + ' successfully', type);
        //     }
        //   } else {
        //     this.context.swalService.getErrorSwal(apiResponse.message);
        //   }

        // if (apiResponse.status === 200) {
        //   swal({
        //     title: 'What do you want to do with ' + arr + ' ?',
        //     text: 'You won\'t be able to revert this!',
        //     type: 'warning',
        //     showCancelButton: showInactive,
        //     showCloseButton: true,
        //     allowOutsideClick: true,
        //     confirmButtonText: 'Delete Records',
        //     cancelButtonText: 'Mark as Inactive',
        //     confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        //     cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        //     buttonsStyling: false,
        //   }).then((result) => {
        //     // Delete Record
        //     if (result.value) {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Delete, 'Record has been deleted successfully');
        //     }
        //     //  Inactive
        //     else if (
        //       result.dismiss.toString() === 'cancel') {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');
        //     }
        //   });
        // } else if (apiResponse.status === 400) {
        //   swal({
        //     title: apiResponse.message,
        //     text: 'You won\'t be able to revert this!',
        //     type: 'warning',
        //     showCancelButton: showInactive,
        //     showCloseButton: true,
        //     allowOutsideClick: true,
        //     confirmButtonText: 'Delete Records',
        //     cancelButtonText: 'Mark as Inactive',
        //     confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        //     cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        //     buttonsStyling: false,
        //   }).then((result) => {
        //     // Delete Record
        //     if (result.value) {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Delete, 'Record has been deleted successfully');
        //     }
        //     //  Inactive
        //     else if (
        //       result.dismiss.toString() === 'cancel') {
        //       this.context.deleteContract(id_list, EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');
        //     }
        //   });
        // } else {
        //   this.context.swalService.getErrorSwal(apiResponse.message);
        // }
        // }

      }
      );
  }

  inactiveRecord;
  selectedRow;
  picName;
  rowIndexBeingEdited = null;
  openEditModal(row, index) {
    console.log("rowwww",row);
    this.selectedUser = row.id;
    this.selectedDocument = row;
    // console.log("row", row);
    this.AdButtonClick(this.selectedUser);
    if(row.driver_id){
      this.selectedType="driver";
    }else{
      this.selectedType="fleet";
    }
    this.disableCheck=true;
    this.rowIndexBeingEdited = index;
    this.isFileImage = true;
    this.fileUploadProgressBar = true;
    this.deg = 0;
    this.uploader.files = [];
    // this.image1.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;-webkit-transform:rotate(' + this.deg + 'deg);' + '-moz-transform:rotate(' + this.deg + 'deg);' + '-o-transform:rotate(' + this.deg + 'deg);' + '-ms-transform:rotate(' + this.deg + 'deg);' + 'transform:rotate(' + this.deg + 'deg);');
    window.dispatchEvent(new Event('resize'));
    this.formTitle = 'Update Document';
    this.btnText = 'Update';
    let inputDiv = $('#pac-input');

    setTimeout(() => {
      inputDiv.val('')
      inputDiv.focus();
    }, 10);

    this.getDriverFromGroup(row.driver_group_id);
    if(!row.fleet_name){
      console.log("coming in fleet name empty");
    this.contractForm.patchValue({ select_group: row.driver_group_id ? new DropDownItem(row.driver_group_id, row.driver_group_name) : null });
    this.contractForm.patchValue({ select_driver: row.driver_id ? new DropDownItem(row.driver_id, row.driver_name) : null });
    this.contractForm.patchValue({ document_type: row.document_type_id ? new DropDownItem(row.document_type_id, row.document_type) : null });
    // this.selectedValue = [{ id: 1, name: "Driver" }, { id: 2, name: "Fleet" }]; 
    this.selectedValue = [{ id: 1, name: "Driver" },{ id: 2, name: "Fleet" }] 
    console.log("selectedValue",this.selectedValue);
  }else{
      console.log("coming in fleet name ");
      console.log("row.vehicle_id",row.vehicle_id)
    this.contractForm.patchValue({ select_fleet: row.fleet_id ? new DropDownItem(row.fleet_id, row.fleet_name) : null });
    this.contractForm.patchValue({ select_vehicle: row.vehicle_id ? new DropDownItem(row.vehicle_id, row.vehicle_name) : null });
    this.contractForm.patchValue({ document_type: row.document_type_id ? new DropDownItem(row.document_type_id, row.document_type) : null });
    this.selectedValue = { id: 2, name: "Fleet" } 
    console.log("selectedValue",this.selectedValue);
  }
    if (row.document_file) {
      for (let i = 0; i < row.document_file.length; i++) {
        const arr = row.document_file[i].split('/');
        let picName = arr[arr.length - 1];
        let picTooltip = '';
        if (picName.length > 30) {
          picTooltip = picName;
          // picName = picName.substring(0, 33) + '...';
        }
        // console.log(arr, picName);

        this.createFile(row.document_file[i], picName, picTooltip);
      }
    } else {
      this.contractForm.patchValue({ files: null });
    }
  }


  public getTruncatedFileName(fileName) {
    if (fileName.length > 30) {
      fileName = fileName.substring(0, 33) + '...';
    }
    return fileName;
  }

  async createFile(url, filename, fileTooltip) {
    var request = new Request(url);
    let response = await fetch(request, {
      mode: 'no-cors',
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    let data = await response.blob();
    let file = new File([data], filename);
    file['tooltip'] = fileTooltip;
    console.log('new file', file);
    this.uploader.files.push(file);
    this.fileUploadProgressBar = false;
  }

  onBinChange(obj) {
    if ('itemValue' in obj) {
      console.log(obj);
      if (obj.value.indexOf(obj.itemValue) > -1) {
        // this.tempMarkers[obj.itemValue['id']].setIcon(this.getMapIcon(true));
      } else {
        // this.tempMarkers[obj.itemValue['id']].setIcon(this.tempMarkers[obj.itemValue['id']].oldIcon);
      }
    } else {
      // if (obj.value.length) {
      //   for (let i = 0; i < obj.value.length; i++)
      //     this.tempMarkers[obj.value[i]['id']].setIcon(this.getMapIcon(true));
      // }
      // else {
      //   for (let i = 0; i <  this.markers.length; i++)
      //     this.markers[i].setIcon(this.markers[i].oldIcon);
      // }
    }
  }

  updateFilter(val) {
    console.log(this.searchForm.value.search);

    console.log("coming in ");
    // this.inputValue = '';
    this.searchPlaceHolder = 'Loading...';
    this.enableSearch = true;
    this.showIndeterminateProgress = true;
    this.contracts = [];
    const index_a = 0;
    const index_b = 100;

    this.downloadableLink = environment.baseUrl + '/hypernet/entity/documents?export=excel&customer_id=' + this.customerID + '&search=' + this.searchForm.value.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.downloadableLink1 = environment.baseUrl + '/hypernet/entity/documents?export=excel&customer_id=' + this.customerID + '&search=' + this.searchForm.value.search + '&time_zone=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(this.selectedTypeSearch=="driver"){
        this.optimizedCall = this.formService.getDocumentListingSearch({
          type_id: 42,
          index_a: index_a,
          index_b: index_b,
          search: this.searchForm.value.search
        })
          .subscribe((data: any) => {

            if (!data.error) {
              // this.contracts=data.data['data'];
              this.contracts = data.response;
              this.temp = this.contracts;
              this.enableSearch = false;
              this.showIndeterminateProgress = false;
            } else {
              this.swalService.getWarningSwal(data.message);
            }
            console.log("asaaaaaaaaaaaaa", data['data'].data);
            // this.contracts=data.data['data'];
            this.totalContractsLength = data.data.count;
            this.contracts = data['data'].data;
          }
          );
    }else{

      this.optimizedCall = this.formService.getDocumentListingSearchfleet({
        type_id: 42,
        index_a: index_a,
        index_b: index_b,
        search: this.searchForm.value.search
      })
        .subscribe((data: any) => {
  
          if (!data.error) {
            // this.contracts=data.data['data'];
            this.contracts = data.response;
            this.temp = this.contracts;
            this.enableSearch = false;
            this.showIndeterminateProgress = false;
          } else {
            this.swalService.getWarningSwal(data.message);
          }
          console.log("asaaaaaaaaaaaaa", data['data'].data);
          // this.contracts=data.data['data'];
          this.totalContractsLength = data.data.count;
          this.contracts = data['data'].data;
        }
        );
    }     
    // this.contracts = this.datatableService.updateFilter(this.searchForm.value.search, this.temp, ['name', 'client_name', 'party_code']);
  }
  onClearSearch() {
    this.searchForm.reset();
    var params;
    // this.downloadableLink = environment.baseUrl+'/options/get_export_files/?'+params;
    this.optimized_contract_call(0, 100, this.filters);
  }
  onSearch(formval) {
    // console.log(this.searchForm.value.search);
  }

  enableSubmitButton() {
    this.btnLoading = false;
    this.btnText = 'Save ';
  }

  disableSubmitButton() {
    this.btnLoading = true;
    this.btnText = 'Loading...';
  }

  isFileImage = true;
  avatar;
  avatar_url;
  uploadedFiles = [];
  fileChange(event) {
    console.log("filechange: ", event);
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const img = document.querySelector('#preview img') as HTMLImageElement;

      // if (fileList[0].type.indexOf('image') === -1) {
      //   this.notImage = true;
      // }
      this.isFileImage = fileList[0].type.indexOf('png') > -1 || fileList[0].type.indexOf('jpg') > -1 || fileList[0].type.indexOf('jpeg') > -1;
      console.log('file type', fileList[0].type, this.isFileImage);
      if (this.isFileImage) {

        if (file.size > 1000000000) { // 1MB
          this.swalService.getWarningSwal('File is too big! Image must be less than 1 MB');
          this.avatar = null;
          return;
        } else {
          this.avatar = file;
          const reader = new FileReader();
          var self = this;
          reader.onload = (function (aImg) {
            return function (e) {
              aImg.src = e.target.result;
              console.log(aImg, 'image');
              self.avatar_url = aImg.src;
            };
          })(img);
          reader.readAsDataURL(file);

        }
      }
    }
  }

  removeImage() {
    this.myInputVariable.nativeElement.value = '';
    this.avatar_url = null;
    this.avatar = null;
    this.image.nativeElement.src = '';
    this.contractForm.patchValue({ 'photo_method': null });
  }

  viewImage() {
    this.deg = 0;
    this.image.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;');
    window.dispatchEvent(new Event('resize'));
  }

  deg = 0;
  rotate() {
    this.deg += 90;
    this.image1.nativeElement.setAttribute('style', 'max-width:400px !important;max-height:400px !important;-webkit-transform:rotate(' + this.deg + 'deg);' + '-moz-transform:rotate(' + this.deg + 'deg);' + '-o-transform:rotate(' + this.deg + 'deg);' + '-ms-transform:rotate(' + this.deg + 'deg);' + 'transform:rotate(' + this.deg + 'deg);');
    window.dispatchEvent(new Event('resize'));
  }

  changeMaterial() {
    if (this.selected_skip_size) {
      console.log('option', this.getIconsService.getMaterialLabel(SkipSizeToMaterialEnum['_' + this.selected_skip_size]));
      this.selected_entity_sub_type = this.getIconsService.getMaterialLabel(SkipSizeToMaterialEnum['_' + this.selected_skip_size]);
    } else {
      this.selected_entity_sub_type = null;
    }
  }

  remove(file: File, uploader: FileUpload) {
    console.log("remove...");
    const index = uploader.files.indexOf(file);
    uploader.remove(null, index);
  }

  formatSize(bytes) {
    if (bytes == 0) {
      return '0 B';
    }
    var k = 1000, dm = 3, sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }


  fileSelected(event) {
    console.log("eventttttttttttttt",event);
    this.showIndeterminateProgressforFile=true;
    if(event){
      this.showIndeterminateProgressforFile=false;
    }
    console.log('file selected', event);
  }

  onPaginateTool(event) {
    this.filtersContracts.offset = (event.pageIndex * event.pageSize);
    this.getContracts();
  }

  sortData(event) {
    this.filters.order_by = event.active;
    this.filters.order = event.direction;
    this.getContracts();
  }

  showPDF(row) {
    // console.log("data- ", row)
    // console.log("Download PDF= ", row.document_file[0])
    var data: string = row;

    const newBlob = new Blob([data], { type: 'application/pdf' }); //'text/plain' //application/pdf
    window.open(row, '_blank');
  }
}
