import { Component, OnInit } from '@angular/core';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { SwalService } from 'src/app/core/services/swal.service';
import { FormService } from '../../services/FormService';
import { GetUsecaseService } from '../../services/get-usecase.service';
import { AuthService } from 'src/app/Services/auth.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { User } from 'src/app/core/model/user';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-admin-card-form',
  templateUrl: './admin-card-form.component.html',
  styleUrls: ['./admin-card-form.component.css']
})

export class AdminCardFormComponent implements OnInit {

  usecases;
  dashboards;
  usecasesDashboard;
  selectedUsecase;
  setCardObj = [];
  selectedUsecaseObj;
  selectedDashboardObj;
  useCaseId = 0;
  isAuthorized = false;
  loggedInUser;
  packageType: any;
  sidebarCheck: any;
  lastUpdatedobject: any;
  idOfChangedDropDown: any;

  constructor(private formService: FormService,
    private swalService: SwalService,
    private getUsecase: GetUsecaseService,
    private authService: AuthService,
    private drawerService: DrawerService) {
    this.useCaseId = getUsecase.getUsecaseId();
    this.packageType = PackageType;
  }

  isAuthorizedUser(value) {
    const u = this.authService.getUser() as User;
    if (u['package'][0].package_id === this.packageType.standard) {
      this.isAuthorized = value;
    } else if (u['package'][0].package_id === this.packageType.png) {
      this.isAuthorized = false;
    }
  }

  ngOnInit(): void {
    this.drawerService.getValue().subscribe(res => {
      this.sidebarCheck = res;
    })

    this.loggedInUser = this.authService.getUser();
    this.getUserCases();
  }

  getUserCases() {
    this.formService.getUsecases('false').subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.usecases = apiResponse['data'];
        if (this.usecases && this.usecases.length > 0) {
          this.usecases.forEach(element => {
            if (element.id === this.useCaseId) {
              this.selectedUsecase = element.name;
              this.selectedUsecaseObj = element;
              this.dashboards = element.dashboard;
              this.selectedDashboardObj = element.dashboard[0];
              let event = { value: { id: element.id } }
              this.idOfChangedDropDown = event.value.id;
              this.dashboardChange(event)
            }
          });
        }
      } else {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });
  }

  usecaseChange(event) {
    this.selectedUsecase = event.value.name;
    this.dashboards = [];
    this.dashboards = event.value.dashboard
    this.usecasesDashboard = [];
  }

  dashboardChange(event) {
    this.idOfChangedDropDown = event.value.id;
    this.formService.getUsecasesDashboards(event.value.id).subscribe(apiResponse => {
      this.usecasesDashboard = [];
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.usecasesDashboard = apiResponse['data'];
        this.setCardObj = [];
        this.usecasesDashboard.forEach(element => {
          this.setCardObj.push({ card_id: element.id, is_selected: element.is_selected });
        });
      } else {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });
  }

  setCardId(card, event, index) {
    if (event.target.checked) {
      this.setCardObj.forEach(element => {
        if (card.id === element.card_id) {
          element.is_selected = true;
          this.lastUpdatedobject = { card_id: card.id, is_selected: element.is_selected };
        }
      });
    } else {
      this.setCardObj.forEach(element => {
        if (card.id === element.card_id) {
          element.is_selected = false;
          this.lastUpdatedobject = { card_id: card.id, is_selected: element.is_selected };
        }
      });
    }
  }

  saveCardSettings() {
    let count = 0;
    if (this.setCardObj.length) {
      this.setCardObj.forEach(element => {
        if (element.is_selected) {
          count++;
        }
      });

      if (count > 2) {
        if (count > 8) {
          this.swalService.getErrorSwal('You can select maximum eight cards!');
          this.resetTheGraphs(this.idOfChangedDropDown)
          return;
        }
      } else {
        this.swalService.getErrorSwal('Please select atleast three cards!');
        return;
      }

    }

    this.formService.saveCards(this.setCardObj).subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.swalService.getSuccessSwal(apiResponse['message']);
      } else {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });
  }


  resetTheGraphs(id) {
    this.formService.getUsecasesDashboards(id).subscribe(apiResponse => {
      this.usecasesDashboard = [];
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.usecasesDashboard = apiResponse['data'];
        this.setCardObj = [];
        this.usecasesDashboard.forEach(element => {
          this.setCardObj.push({ card_id: element.id, is_selected: element.is_selected });
        });
      } else {
        this.swalService.getErrorSwal(apiResponse['message']);
      }
    });
  }

}
