import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {iolModules} from '../model/module';
import {log} from 'util';
import { UserRoleEnum } from 'src/app/platform/enum/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  basicUrl = '../../../../assets/images/iol/';
  array1 = [
    {
      name: 'My Tools',
      route: 'tools',
      icon: this.basicUrl + 'icon_scanner.png',
      tooltip: false
    },
    {
      name: 'Areas',
      route: 'area',
      icon: this.basicUrl + 'icon_area.png',
      tooltip: false
    },


    {
      name: 'Dump Sites',
      route: 'dump',
      icon: this.basicUrl + 'icon_dump.png',
      tooltip: false
    },
    {
      name: 'Location',
      route: 'location',
      icon: this.basicUrl + 'icon_area.png',
      tooltip: false
    },
    {
      name: 'Maintenances',
      route: 'maintenances',
      icon: this.basicUrl + 'icon_maintenances.png',
      tooltip: false
    },
    {
      name: 'Customers',
      route: 'customer',
      icon: this.basicUrl + 'icon_client.png',
      tooltip: false

    }, {
      name: 'Contracts',
      route: 'contract',
      icon: this.basicUrl + 'icon_contract.png',
      tooltip: false
    },
    {
      name: 'Schedules & Activities',
      route: 'schedule',
      icon: this.basicUrl + 'icon_jobs.png',
      tooltip: false
    }, {
      name: 'Client Reps',
      route: 'supervisor',
      icon: this.basicUrl + 'icon_supervisor.png',
      tooltip: false
    },
    {
      name: 'Territories',
      route: 'territories',
      icon: this.basicUrl + 'icon_territory.png',
      tooltip: false
    },
    {
      name: 'Invoices',
      route: 'invoice',
      icon: this.basicUrl + 'icon_invoice.png',
      tooltip: false
    },
    {
      name: 'TripSheets',
      route: 'tripsheet',
      icon: this.basicUrl + 'icon_contract.png',
      tooltip: false
    }

  ];
  financeSidebar = [
    {
      name: 'Invoices',
      route: 'invoice',
      icon: this.basicUrl + 'icon_contract.png',
      tooltip: false
    },
    {
      name: 'TripSheets',
      route: 'tripsheet',
      icon: this.basicUrl + 'icon_contract.png',
      tooltip: false
    }];
  salesSidebar = [
    {
      name: 'Bins',
      route: 'bins',
      icon: this.basicUrl + 'icon_bins.png',
      tooltip: false
    },
    {
      name: 'Contracts',
      route: 'contract',
      icon: this.basicUrl + 'icon_contract.png',
      tooltip: false
    },
    {
      name: 'Vehicles',
      route: 'vehicles',
      icon: this.basicUrl + 'icon_trucks.png',
      tooltip: false
    }];
  private _customerClient = [
    // {
    //   name: 'Bins',
    //   route: 'bins',
    //   icon: this.basicUrl + 'icon_bins.png',
    //   tooltip: false
    // },
    {
      name: 'Customer',
      route: null,
      icon: this.basicUrl + 'icon_client.png',
      tooltip: false
    }
  ];
  private _technicianSidebar = {
    pages: [{
      name: 'Maintenances',
      route: 'maintenances',
      icon: this.basicUrl + 'icon_maintenances.png',
      tooltip: false
    }],
    assets: [],
    fleet_management: [],
    waste_management: []
  };

  private iolCombine = {
    pages: this.array1,
    assets: [{
      name: 'Bins',
      route: 'bins',
      icon: this.basicUrl + 'icon_bins.png',
      tooltip: false
    },
      {
        name: 'Vehicles',
        route: 'vehicles',
        icon: this.basicUrl + 'icon_trucks.png',
        tooltip: false
      },
      {
        name: 'Vessels',
        route: 'vessels',
        icon: this.basicUrl + 'vessel.png',
        tooltip: false
      },

      {
        name: 'Staff',
        route: 'staff',
        icon: this.basicUrl + 'icon_drivers.png',
        tooltip: false
      },
    ],
    fleet_management: [
      {
        name: 'Staff Form',
        route: 'admin/staff',
        icon: this.basicUrl + 'icon_drivers.png'
      },
      {
        name: 'Truck Form',
        route: 'admin/truck',
        icon: this.basicUrl + 'icon_trucks.png'
      },

      {
        name: 'Territory Form',
        route: 'admin/territory',
        icon: this.basicUrl + 'icon_territory.png'
      }, {
        name: 'Vessel Form',
        route: 'admin/vessel',
        icon: this.basicUrl + 'icon_trucks.png'
      },

      // {
      //   name: 'Maintenance Form',
      //   route: 'admin/maintenance',
      //   icon: this.basicUrl + 'icon_maintenances.png'
      // },
    ],
    waste_management: [
      {
        name: 'Area Form',
        route: 'admin/area',
      },
      {
        name: 'Bin Form',
        route: 'admin/bin',
      },
      {
        name: 'Customer Form',
        route: 'admin/customer',
      },
      {
        name: 'Customer Rep Form',
        route: 'admin/supervisor',
      },
      {
        name: 'Contract Form',
        route: 'admin/contract',
      },
      {
        name: 'Dump Form',
        route: 'admin/dump',
      },
      {
        name: 'RFID Scanner Form',
        route: 'admin/rfid',
      },
      {
        name: 'Location Form',
        route: 'admin/location',
      },
    ]
  };


  constructor() {
    this.iolCombine = {
      pages: this.array1,
      assets: [{
        name: 'Bins',
        route: 'bins',
        icon: this.basicUrl + 'icon_bins.png',
        tooltip: false
      },
        {
          name: 'Vehicles',
          route: 'vehicles',
          icon: this.basicUrl + 'icon_trucks.png',
          tooltip: false
        },
        {
          name: 'Vessels',
          route: 'vessels',
          icon: this.basicUrl + 'vessel.png',
          tooltip: false
        },

        {
          name: 'Staff',
          route: 'staff',
          icon: this.basicUrl + 'icon-employees-blue.png',
          tooltip: false
        },
      ],
      fleet_management: [
        {
          name: 'Staff Form',
          route: 'admin/staff',
          icon: this.basicUrl + 'icon_drivers.png'
        },
        {
          name: 'Truck Form',
          route: 'admin/truck',
          icon: this.basicUrl + 'icon_trucks.png'
        },

        {
          name: 'Territory Form',
          route: 'admin/territory',
          icon: this.basicUrl + 'icon_territory.png'
        }, {
          name: 'Vessel Form',
          route: 'admin/vessel',
          icon: this.basicUrl + 'icon_trucks.png'
        },

        // {
        //   name: 'Maintenance Form',
        //   route: 'admin/maintenance',
        //   icon: this.basicUrl + 'icon_maintenances.png'
        // },
      ],
      waste_management: [
        {
          name: 'Area Form',
          route: 'admin/area',
        },
        {
          name: 'Bin Form',
          route: 'admin/bin',
        },
        {
          name: 'Customer Form',
          route: 'admin/customer',
        },
        {
          name: 'Client Rep Form',
          route: 'admin/supervisor',
        },
        {
          name: 'Contract Form',
          route: 'admin/contract',
        },
        {
          name: 'Dump Form',
          route: 'admin/dump',
        },
        {
          name: 'RFID Scanner Form',
          route: 'admin/rfid',
        },
        {
          name: 'Location Form',
          route: 'admin/location',
        },
      ]
    };
  }

  getSidebarForIol(user_role_id?) {
    let sidebarToReturn = this.iolCombine;
    if (user_role_id === UserRoleEnum.Sales) {
      sidebarToReturn.pages = this.salesSidebar;
    } else if (user_role_id === UserRoleEnum.FinanceManager) {
      sidebarToReturn.pages = this.financeSidebar;
    } else if (user_role_id === UserRoleEnum.CustomerClient) {
      sidebarToReturn.pages = this._customerClient;
      sidebarToReturn.assets = [];
      sidebarToReturn.fleet_management = [];
      sidebarToReturn.waste_management = [];
    } else if (user_role_id === UserRoleEnum.WorkshopTechnician) {
      sidebarToReturn = this._technicianSidebar;
    } else {
      sidebarToReturn.pages = this.array1;
    }
    return sidebarToReturn;
  }


}


export class SidebarResponse {
  pages: any[];
  assets: any[];
  fleet_management: any[] = new Array(Object);
  waste_management: any[];
}
