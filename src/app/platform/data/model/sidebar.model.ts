
const basicUrl = '../../../assets/images/iol/';


const array1 = [
  // {
  //   name: 'Templates & Routesfff',
  //   route: 'templates',
  //   icon: basicUrl + 'icon_jobs.png',
  //   tooltip: false
  // },
  // {
  //   name: 'My Tools',
  //   route: 'tools',
  //   icon: basicUrl + 'icon_scanner.png',
  //   tooltip: false
  // },
  // {
  //   name: 'Areas',
  //   route: 'area',
  //   icon: basicUrl + 'icon_area.png',
  //   tooltip: false
  // },


  // {
  //   name: 'Dump Sites',
  //   route: 'dump',
  //   icon: basicUrl + 'icon_dump.png',
  //   tooltip: false
  // },
  // {
  //   name: 'Location',
  //   route: 'location',
  //   icon: basicUrl + 'icon_area.png',
  //   tooltip: false
  // },
  // {
  //   name: 'Maintenances',
  //   route: 'maintenance',
  //   icon: 'ri-tools-line',
  //   tooltip: false
  // },
  // {
  //   name: 'Clients',
  //   route: 'client',
  //   icon: 'ri-user-line',
  //   tooltip: false

  // }, {
  //   name: 'Contracts',
  //   route: 'contract',
  //   icon: 'ri-file-text-line',
  //   tooltip: false
  // },
  // {
  //   name: 'Schedules & Activities',
  //   route: 'schedule',
  //   icon: basicUrl + 'icon_jobs.png',
  //   tooltip: false
  // },
  // {
  //   name: 'Jobs',
  //   route: 'templates',
  //   icon: 'ri-file-list-3-line',
  //   tooltip: false
  // },
  // {
  //   name: 'Client Reps',
  //   route: 'supervisor',
  //   icon: basicUrl + 'icon_supervisor.png',
  //   tooltip: false
  // },
  //  {
  //   name: 'Geozones',
  //   route: 'territories',
  //   icon: 'ri-flag-2-line',
  //   tooltip: false
  // },
   {
    name: 'Violations',
    route: 'violations',
    icon: 'ri-file-warning-line',
    tooltip: false
  },
  // {
  //   name: 'Chat/Messages',
  //   route: 'messages',
  //   icon: 'ri-message-2-line',
  //   tooltip: false
  // },
  // {
  //   name: 'Invoices',
  //   route: 'invoice',
  //   icon: basicUrl + 'icon_invoice.png',
  //   tooltip: false
  // },
  // {
  //   name: 'TripSheets',
  //   route: 'tripsheet',
  //   icon: basicUrl + 'icon_contract.png',
  //   tooltip: false
  // }

];

export const iolCombine = {
  pages: array1,
  assets: [
    //   {
    //   name: 'Bins',
    //   route: 'bins',
    //   icon: basicUrl + 'icon_bins.png',
    //   tooltip: false
    // },
    // {
    //   name: 'Vehicles',
    //   route: 'vehicles',
    //   icon: basicUrl + 'icon_trucks.png',
    //   tooltip: false
    // },
    {
      name: 'Fleets',
      route: 'fleets',
      icon: basicUrl + 'icon_trucks.png',
      tooltip: false
    },


    // {
    //   name: 'Staff',
    //   route: 'staff',
    //   icon: basicUrl + 'icon_drivers.png',
    //   tooltip: false
    // },
  ],
  staff: [
    {
      name: 'Drivers',
      route: 'drivers/dashboarddriver',
      icon: basicUrl + 'vessel.png',
      tooltip: false
    },
    {
      name: 'Maintenances',
      route: 'maintenance',
      icon: 'ri-tools-line',
      tooltip: false
    },
  ],
  fleet_management: [

    {
      name: 'User',
      route: 'admin/user',
      icon: basicUrl + 'icon_users.png'
    },
    {
      name: 'Staff Form',
      route: 'admin/staff',
      icon: basicUrl + 'icon_drivers.png'
    },
    {
      name: 'Role & Access',
      route: 'admin/permissions',
      icon: basicUrl + 'icon_users.png'
    },
    {
      name: 'Customer',
      route: 'admin/customer',
      icon: basicUrl + 'icon_users.png'
    },
    {
      name: 'Configuration',
      route: 'admin/configurations',
      icon: basicUrl + 'icon_users.png'
    },
    // {
    //   name: 'Fuel Fillup Form',
    //   route: 'admin/fuel',
    //   icon: basicUrl + 'icon_drivers.png'
    // },
    // {
    //   name: 'Fleet Form', //Vehicle Form
    //   route: 'admin/truck',
    //   icon: basicUrl + 'icon_trucks.png'
    // },
    // {
    //   name: 'Tool Form',
    //   route: '/admin/tool',
    //   icon: basicUrl + 'icon_trucks.png'
    // },
    // {
    //   name: 'Geozone Form', //Territory Form
    //   route: 'admin/territory',
    //   icon: basicUrl + 'icon_territory.png'
    // },

    // {
    //   name: 'Route Form',
    //   route: 'admin/route',
    //   icon: basicUrl + 'icon_drivers.png'
    // },
    // {
    //   name: 'Client Form',
    //   route: 'admin/client',
    // },
    {
      name: 'Contract Form',
      route: 'admin/contract',
    },
    {
      name: 'Master',
      route: 'admin/config',
    },
    // {
    //   name: 'Vessel Form',
    //   route: 'admin/vessel',
    //   icon: basicUrl + 'icon_trucks.png'
    // },

    // {
    //   name: 'Maintenance Form',
    //   route: 'admin/maintenance',
    //   icon: basicUrl + 'icon_maintenances.png'
    // },
  ],
  Audit_Form: [
    {
      name: 'Documents',
      route: 'audit/document',
      icon: basicUrl + 'icon_users.png'
    },
    {
      name: 'Audit Report',
      route: 'audit/',
      icon: basicUrl + 'icon_users.png'
    },

  ],
  waste_management: [
    // {
    //   name: 'Area Form',
    //   route: 'admin/area',
    // },
    // {
    //   name: 'Bin Form',
    //   route: 'admin/bin',
    // },
    // {
    //   name: 'Client Form',
    //   route: 'admin/client',
    // },
    // {
    //   name: 'Client Rep Form',
    //   route: 'admin/supervisor',
    // },
    // {
    //   name: 'Contract Form',
    //   route: 'admin/contract',
    // },
    // {
    //   name: 'Dump Form',
    //   route: 'admin/dump',
    // },
    // {
    //   name: 'RFID Scanner Form',
    //   route: 'admin/rfid',
    // },
    // {
    //   name: 'Location Form',
    //   route: 'admin/location',
    // },
  ],
  reports: [
    {
      name: 'Driver Profile Report',
      route: 'reports',
    },
    {
      name: 'Driver Saftey Report',
      route: 'reports',
    },
    {
      name: 'Driver Vehicle Usage',
      route: 'reports',
    },
    {
      name: 'Driver Punctuality',
      route: 'reports',
    },
    {
      name: 'Fleet Maintenance',
      route: 'reports',
    },
    {
      name: 'Fleet Maintenance Jobs',
      route: 'reports',
    },
    {
    name: 'Driver Job Anomaly',
    route: 'reports',
  },

  ]
};


export const _salesSidebar = {
  pages: [
    // {
    //   name: 'Bins',
    //   route: 'bins',
    //   icon: basicUrl + 'icon_bins.png',
    //   tooltip: false
    // },
    // {
    //   name: 'Contracts',
    //   route: 'contract',
    //   icon: basicUrl + 'icon_contract.png',
    //   tooltip: false
    // },
    // {
    //   name: 'Trucks',
    //   route: 'trucks',
    //   icon: basicUrl + 'icon_trucks.png',
    //   tooltip: false
    // }
  ],
  assets: [],
  fleet_management: [],
  waste_management: []
};
export const _customerClientSidebar = {
  pages: [
    {
      name: 'Customer',
      route:
        null,
      icon:
        basicUrl + 'icon_client.png',
      tooltip:
        false
    }],
  assets: [],
  fleet_management: [],
  waste_management: []
};
export const _technicianSidebar = {
  pages: [{
    name: 'Maintenances',
    route: 'maintenance',
    icon: basicUrl + 'icon_maintenances.png',
    tooltip: false
  }],
  assets: [],
  fleet_management: [],
  waste_management: []
};
export const _financeSidebar = {
  pages: [{
    name: 'Invoices',
    route: 'invoice',
    icon: basicUrl + 'icon_contract.png',
    tooltip: false
  },
    // {
    //   name: 'TripSheets',
    //   route: 'tripsheet',
    //   icon: basicUrl + 'icon_contract.png',
    //   tooltip: false
    // }
  ],
  assets: [],
  fleet_management: [],
  waste_management: []
};

export class SidebarModel {
  pages: any;
  assets: any;
  fleet_management: any;
  waste_management: any;
  dashboard?: any;
}
