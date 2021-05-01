import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormService } from '../../services/FormService';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { SwalService } from '../../../core/services/swal.service';
import { AuthService } from 'src/app/Services/auth.service';
import { StorageService } from 'src/app/Services/local-storage.service';
import { User } from 'src/app/core/model/user';
import { DrawerService } from 'src/app/core/services/drawer.service';
@Component({
  selector: 'app-admin-configurations',
  templateUrl: './admin-configurations.component.html',
  styleUrls: ['./admin-configurations.component.css']
})
export class AdminConfigurationsComponent implements OnInit {

  gatewayThreshold;
  DriverScoreArray;
  geoZoneArray;
  fuelThresholdArray;
  displayedGatewayColumns = ['vehicle_type', 'values'];
  displayedDriverColumns = ['parameter', 'values'];
  displayedGeoZoneColumns = ['label', 'value'];
  fuelThresholdColumns = ['label', 'value'];
  displayedNotificationColumns = ['label', 'value'];
  gatewayForm: FormGroup;
  driverForm: FormGroup;
  index;
  DropDowmData = [];
  driverScoreCard;
  zone;
  isAuthorized = false;
  notifications;

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild("selectType") selectRef: ElementRef;
  @ViewChildren('inputElement') inputValues;
  @ViewChildren('inputElementDriveScore') inputValuesDriverScore;
  @ViewChildren('inputElementGeozone') inputValuesGeoZone;
  @ViewChildren('inputElementFuelThres') inputValuesFuelThres;

  showInputErrorMsg: boolean = false;
  showVehicleInputMsg: boolean = false;
  submitted: boolean = false;
  varType;  //to store value on select type dropdown
  showIndeterminateProgress = false;
  notificationAlert = false;
  emailAlert = false;
  SMSAlert = false;
  loggedInUser;
  sidebarCheck;

  constructor(private formService: FormService,
    private swalService: SwalService,
    public storageService: StorageService,
    private authService: AuthService,
    private drawerService: DrawerService) {
    this.gatewayThreshold = [
      {
        threshold: 'Over Speeding',
        value: '',
        id: 1,
        paramKey: 'over_speeding_threshold'
      },
      {
        threshold: 'Sharp Acceleration Threshold',
        value: '',
        id: 2,
        paramKey: 'sharp_accerelation_threshold'
      },
      {
        threshold: 'Sharp Deceleration Threshold',
        value: '',
        id: 3,
        paramKey: 'sharp_deaccerelation_threshold'
      },
      {
        threshold: 'Sharp Turning Threshold',
        value: '',
        id: 4,
        paramKey: 'sharp_turning_threshold'
      }
    ]

    this.DriverScoreArray = [
      {
        vehicle: 'Deduction on Harsh Acceleration',
        value: '',
        id: 1,
        paramKey: 'harsh_acceleration'
      },
      {
        vehicle: 'Deduction on Harsh Braking',
        value: '',
        id: 2,
        paramKey: 'harsh_braking'
      },
      {
        vehicle: 'Deduction on Over Speeding',
        value: '',
        id: 3,
        paramKey: 'over_speeding'
      },
      {
        vehicle: 'Deduction on Sharp Turning',
        value: '',
        id: 4,
        paramKey: 'sharp_turning'
      },
      {
        vehicle: 'Increment Distance',
        value: '',
        id: 5,
        paramKey: 'increment_distance'
      },
      {
        vehicle: 'Increment Point',
        value: '',
        id: 6,
        paramKey: 'increment_point'
      }

    ]

    this.geoZoneArray = [
      {
        label: 'Radius',
        value: '',
        id: 1,
        paramKey: 'radius'
      }
    ]

    this.fuelThresholdArray = [
      {
        label: 'Fuel Threshold',
        value: '',
        id: 1,
        paramKey: 'fuel_threshold'
      }
    ]
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    });

    this.loggedInUser = this.authService.getUser();
    this.formService.getNotificationValue().subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.notifications = data.data[0];
        // console.log("this.notifications (from ngoninit)== ", this.notifications)
        this.notificationAlert = this.notifications.notification;
        this.emailAlert = this.notifications.email;
        this.SMSAlert = this.notifications.sms;
      }
    })


    this.formService.getGatewayDropdownData().subscribe((data: any) => {
      // console.log("getGatewayDropdownData ", data);
      if (data.status === HttpStatusCodeEnum.Success) {
        this.DropDowmData = data.data.data;
        // console.log("this.DropDowmData --- ", this.DropDowmData);
      } else {
        console.log("Failed to getEntitiesFuel")
      }
    })

  }

  ngAfterViewInit() {

  }

  activeTabFuction(index) {
    // this.add_btn = index.index;
    // console.log("index== ", index.index);

    if (index.index == 1) {
      // initialize the default array for tab change
      this.DriverScoreArray = [
        {
          vehicle: 'Deduction on Harsh Acceleration',
          value: '',
          id: 1,
          paramKey: 'harsh_acceleration'
        },
        {
          vehicle: 'Deduction on Harsh Braking',
          value: '',
          id: 2,
          paramKey: 'harsh_braking'
        },
        {
          vehicle: 'Deduction on Over Speeding',
          value: '',
          id: 3,
          paramKey: 'over_speeding'
        },
        {
          vehicle: 'Deduction on Sharp Turning',
          value: '',
          id: 4,
          paramKey: 'sharp_turning'
        },
        {
          vehicle: 'Increment Distance',
          value: '',
          id: 5,
          paramKey: 'increment_distance'
        },
        {
          vehicle: 'Increment Point',
          value: '',
          id: 6,
          paramKey: 'increment_point'
        }

      ]

      this.showIndeterminateProgress = true;
      this.formService.getDriverScoreCardData().subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        // console.log("getDriverScoreCardData ++ ", data.data);

        delete data?.data[0]?.id
        // console.log("after deleteing ID+ ", data?.data[0]);

        if (data.status === HttpStatusCodeEnum.Success) {

          if (data.data && data.data.length > 0) {
            const p = data.data[0];
            this.driverScoreCard = p;

            this.DriverScoreArray.forEach(element => {
              for (var key in p) {
                if (p.hasOwnProperty(key)) {
                  if (key === element.paramKey) {
                    element.value = p[key];
                  }
                }
              }
            });
          } else {
            const u = this.authService.getUser() as User;
            this.driverScoreCard = [{
              addNew: true,
              customer: u?.customer?.id,
              harsh_acceleration: '',
              harsh_braking: '',
              increment_distance: '',
              increment_point: '',
              over_speeding: '',
              radius: '',
              sharp_turning: ''
            }]
          }
        } else {
          console.log("Failed to getEntitiesFuel")
        }
      })

    } else if (index.index == 2) {
      // initialize the default array for tab change
      this.geoZoneArray = [
        {
          label: 'Radius',
          value: '',
          id: 1,
          paramKey: 'radius'
        }
      ]

      this.showIndeterminateProgress = true;
      this.formService.getDriverScoreCardData().subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        // console.log("getDriverScoreCardData ++ ", data.data);

        if (data.status === HttpStatusCodeEnum.Success) {

          if (data.data && data.data.length > 0) {
            const p = data.data[0];
            this.zone = p;
            this.geoZoneArray.forEach(element => {
              for (var key in p) {
                if (p.hasOwnProperty(key)) {
                  if (key === element.paramKey) {
                    element.value = p[key];
                  }
                }
              }
            });
          }
        } else {
          console.log("Failed to getEntitiesFuel")
        }
      })
    } else if (index.index == 3) {
      // initialize the default array for tab change
      this.fuelThresholdArray = [
        {
          label: 'Fuel Threshold',
          value: '',
          id: 1,
          paramKey: 'fuel_threshold'
        }
      ]

      this.showIndeterminateProgress = true;
      this.formService.getDriverScoreCardData().subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        // console.log("getDriverScoreCardData ++ ", data.data);

        if (data.status === HttpStatusCodeEnum.Success) {

          if (data.data && data.data.length > 0) {
            const p = data.data[0];
            this.zone = p;
            this.fuelThresholdArray.forEach(element => {
              for (var key in p) {
                if (p.hasOwnProperty(key)) {
                  if (key === element.paramKey) {
                    element.value = p[key];
                  }
                }
              }
            });
          }
        } else {
          console.log("Failed to get driverScoreCard data")
        }
      })
    }
  }

  saveGatway() {
    this.submitted = true;

    if (this.varType == undefined || this.varType == '') {
      // console.log("Group Name is undefined = ", this.varType);
      this.showInputErrorMsg = true;
    } else {
      // console.log("Group Name is = ", this.varType);
      this.showInputErrorMsg = false;


      if (this.inputValues._results.length > 0) {
        let notEmpty: boolean = false;

        for (let i = 0; i < this.inputValues._results.length; i++) {
          if (this.inputValues._results[i].nativeElement.value != '') {
            notEmpty = true
          }
        }

        // console.log("notEmpty=", notEmpty)

        if (notEmpty) {
          this.showVehicleInputMsg = false;

          for (let i = 0; i < this.inputValues._results.length; i++) {

            if (this.inputValues._results[i].nativeElement.value != '') {
              this.gatewayThreshold[i].value = parseInt(this.inputValues._results[i].nativeElement.value);
            } else {
              this.gatewayThreshold[i].value = 0;
            }

          }

          // console.log("this.gatewayThreshold==== ", this.gatewayThreshold);

          let paramsToSend = { vehicle_type: parseInt(this.varType) }
          for (let k = 0; k < this.gatewayThreshold.length; k++) {
            paramsToSend[this.gatewayThreshold[k].paramKey] = this.gatewayThreshold[k].value;
          }
          // console.log("paramsToSend", paramsToSend);
          this.showIndeterminateProgress = true;

          this.formService.saveGatewayData(paramsToSend).subscribe((data: any) => {
            this.showIndeterminateProgress = false;
            // console.log("getGatewayDropdownData ", data);
            if (data.status === HttpStatusCodeEnum.Success) {

              // this.varType = '';
              // this.selectRef.nativeElement.value = "";

              this.swalService.getSuccessSwal('Gateway updated successfully');
            } else {
              console.log("Failed to getEntitiesFuel")
              this.swalService.getErrorSwal('Failed to update gateway');
            }
          })

        } else {
          console.log("Select ATLEAST ONE VEHICLE VALUE");
          this.showVehicleInputMsg = true;
        }
      }
    }
  }

  getInputValue(i) {
    if (i === 4) {
      this.DriverScoreArray[5].value = this.inputValuesDriverScore._results[4].nativeElement.value;
    } else if (i === 5) {
      this.DriverScoreArray[4].value = this.inputValuesDriverScore._results[5].nativeElement.value;
    }
  }

  saveDriverScoreCard() {
    // console.log("inputValuesDriverScore== ", this.inputValuesDriverScore._results)
    for (let i = 0; i < this.inputValuesDriverScore._results.length; i++) {
      // console.log("this.inputValuesDriverScore._results[i].nativeElement.value== ", this.inputValuesDriverScore._results[i].nativeElement.value)
      if (this.inputValuesDriverScore._results[i].nativeElement.value != '') {
        this.DriverScoreArray[i].value = parseInt(this.inputValuesDriverScore._results[i].nativeElement.value);
      } else {
        this.DriverScoreArray[i].value = 0;
      }

    }
    // console.log("this.driverScoreCard== ", this.driverScoreCard)
    this.DriverScoreArray.forEach(element => {
      for (var key in this.driverScoreCard) {
        if (this.driverScoreCard.hasOwnProperty(key)) {
          if (key === element.paramKey) {
            this.driverScoreCard[key] = element.value;
          } else if (this.driverScoreCard[0] && this.driverScoreCard[0].addNew) {
            this.driverScoreCard[0][element.paramKey] = element.value;
          }
        }
      }
    });

    this.showIndeterminateProgress = true;
    if (this.driverScoreCard[0] && this.driverScoreCard[0].addNew) {
      this.driverScoreCard = this.driverScoreCard[0];
      delete this.driverScoreCard['addNew'];
      delete this.driverScoreCard['radius'];
    }
    this.formService.saveDriverScoreCardData(this.driverScoreCard).subscribe((data: any) => {
      this.showIndeterminateProgress = false;
      // console.log("getGatewayDropdownData ", data);
      if (data.status === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal('Score card updated successfully');
      } else {
        this.swalService.getErrorSwal('Failed to update score card');
      }
    })

  }

  typeDropdownChange(event) {   //SelectType dropdown change
    // console.log('dropdown change== ', event);
    this.varType = event;

    if (this.varType != undefined && this.varType != '') {
      // console.log("inside if")
      this.showInputErrorMsg = false;
    } else {
      // console.log("inside else")
      this.showInputErrorMsg = true;
    }

    this.formService.getGatewayData(this.varType).subscribe((data: any) => {
      // console.log("getGatewayDropdownData ", data);
      if (data.status === HttpStatusCodeEnum.Success) {
        // console.log("data.data= ", data.data);
        // console.log("this.inputValues._results= ", this.inputValues._results)

        if (data.data['id'] == undefined) {
          console.log("Data not found");

          if (this.inputValues._results.length > 0) {
            for (let l = 0; l < this.inputValues._results.length; l++) {
              this.inputValues._results[l].nativeElement.value = ''
            }
          }

        } else {
          console.log("Data found")
          if (this.inputValues._results.length > 0) {
            let count = 0;
            delete data.data.id
            delete data.data.vehicle_type
            for (let key in data.data) {
              this.inputValues._results[count++].nativeElement.value = data.data[key];
            }
          }
        }
      } else {
        console.log("Failed to getEntitiesFuel")
        this.swalService.getErrorSwal('Failed to update gateway');
      }
    })
  }


  saveGeozone() {
    if (this.inputValuesGeoZone._results.length > 0) {
      // console.log("RADIUS is entered by user")
      if (this.inputValuesGeoZone._results[0].nativeElement.value != '') {
        this.geoZoneArray[0].value = parseInt(this.inputValuesGeoZone._results[0].nativeElement.value);
      } else {
        this.geoZoneArray[0].value = 200;
      }
      let params = { 'radius': this.geoZoneArray[0].value }
      // console.log("params for save geozone=== ", params)
      this.showIndeterminateProgress = true;
      this.formService.saveDriverScoreCardData(params).subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        // console.log("Geozone save api response-- ", data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal('Geozone updated successfully');
        } else {
          this.swalService.getErrorSwal('Failed to update geozone');
        }
      })
    } else {
      console.log("RADIUS is empty");
      this.swalService.getWarningSwal('Please enter the radius');
    }
  }


  saveFuelThreshold() {
    if (this.inputValuesFuelThres._results.length > 0) {
      // console.log("RADIUS is entered by user")
      if (this.inputValuesFuelThres._results[0].nativeElement.value != '') {

        if (this.inputValuesFuelThres._results[0].nativeElement.value == '0' || this.inputValuesFuelThres._results[0].nativeElement.value == '1' || this.inputValuesFuelThres._results[0].nativeElement.value == '2' || this.inputValuesFuelThres._results[0].nativeElement.value == '3' || this.inputValuesFuelThres._results[0].nativeElement.value == '4') {
          this.inputValuesFuelThres._results[0].nativeElement.value = '';
          return;
        }

        if (parseInt(this.inputValuesFuelThres._results[0].nativeElement.value) == 0) {
          this.inputValuesFuelThres._results[0].nativeElement.value = '';
          return;
        }

        this.fuelThresholdArray[0].value = parseInt(this.inputValuesFuelThres._results[0].nativeElement.value);
      } else {
        this.fuelThresholdArray[0].value = 100;
      }
      let params = { 'fuel_threshold': this.fuelThresholdArray[0].value }
      // console.log("params for save geozone=== ", params)
      this.showIndeterminateProgress = true;

      this.formService.saveDriverScoreCardData(params).subscribe((data: any) => {
        this.showIndeterminateProgress = false;
        // console.log("Geozone save api response-- ", data);
        if (data.status === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal('Fuel Threshold updated successfully');
        } else {
          this.swalService.getErrorSwal('Failed to update fuel threshold');
        }
      })
    } else {
      console.log("FUEL THRESHOLD is empty");
      this.swalService.getWarningSwal('Please enter the fuel threshold');
    }
  }

  setAll(event, type) {
    // console.log("type + event++ ", type, event);

    if (type == "email") {
      this.emailAlert = event;
    } else if (type == 'notification') {
      this.notificationAlert = event;
    } else {
      // console.log("coming in 2222 ", event);
      this.SMSAlert = event;
    }

  }

  saveNotification() {
    let params = {
      sms: this.SMSAlert,
      email: this.emailAlert,
      notification: this.notificationAlert
    }

    // this.notifications.sms = this.SMSAlert;
    // this.notifications.email = this.emailAlert;
    // this.notifications.notification = this.notificationAlert;

    this.formService.saveNotifications(params).subscribe((data: any) => {
      if (data.status === HttpStatusCodeEnum.Success) {
        this.notifications = data.data[0];
        let u = JSON.parse(localStorage.getItem('user'))
        u.config_notification = this.notifications.notification;
        this.storageService.store('user', u);
        this.swalService.getSuccessSwal('Notification settings updated');
      } else {
        this.swalService.getErrorSwal('Error occured while updating notifications');
      }
    })

  }
  pageReload() {
    // console.log("coming");
    window.location.reload()
  }


}
