import { environment } from '../environments/environment';

export class AppConfig {
  public static readonly DEBUG = true;
  public static readonly FRONTEND_URL = 'http://hypernet.westeurope.cloudapp.azure.com/';
  public static readonly NUMBER_PRECISION = 2;
  private static readonly URL_PROD = 'http://localhost:8000';

  private static readonly URL_DEV = environment.baseUrl;

  private static _URL = '';
  public static _selectedMarkerURl = 'assets/images/iol/icon-map-bin-selected.png';

  private static _ioaUrlList = {
    // Animal
    'total_animals': '/animal/get_total_animals/',
    'get_animal_groups': '/animal/get_animal_groups/',
    'animal_detail': '/animal/get_animal_detail/',
    'herd_information': '/animal/get_herd_information/',
    'animal_dropdown': '/animal/get_entity_type_dropdown/',
    'get_statistics': '/animal/get_statistics/',
    'save_animal': '/animal/save_animal/',
    // Activity
    'activities_status': '/activity/get_activities_status/',
    'save_scheduled_activity': '/activity/schedule_activity/',
    'get_activity_groups': '/activity/get_activity_groups/',
    'get_scheduled_activities': '/activity/schedule_activity/',
    'activity_statistics': '/activity/get_activity_statistics/',
    'get_activity': '/activity/get_activity/',
    'activity_graph_statistics': '/activity/get_activity_graph_statistics/',
    // Staff
    'get_staff_list': '/staff/get_staff_list/',
    'staff_roles': '/ioa/staff/get_staff_roles/ ',
    'staff_dropdown': '/staff/get_staff_dropdown/',
    'save_staff': '/staff/add_caretaker/',
    // Aggregations
    'milk_yield_monthly_detail': '/aggregation/get_milk_yield_monthly/',
    'get_top_milk_yielder': '/aggregation/get_top_milk_yielder/',
    'expected_milk': '/aggregation/get_customer_milk_yield_monthly/',
    'feed_yield_monthly': '/aggregation/get_herd_feed_yield_monthly/',
    'customer_feed_consumed': '/aggregation/get_customer_feed/',
    'feed_consumed': '/aggregation/get_feed_consumed_monthly/',
    // Options
    'dropdown_data': '/options/get_values/',
    // Other
    'recent_alerts_detail': '/get_recent_alerts_detail/',
    'alert_graph_data': '/get_alert_graph_data/',
    'alerts_count': '/get_alerts_count/',
    'get_recent_alerts_pi': '/get_recent_alerts_pi/',
    'recent_alerts_count': '/get_user_alerts_dropdown/',


    'perform_activity': '/activity/perform_activity/',
    'change_alert': '/update_alert_statues/',
    'update_profile': '/staff/update_caretaker/',
    'search': '/ioa/tests/search_bar/',
    'search_iol': '/hypernet/entity/hypernet_search_bar/',
    'get_drivers': '/hypernet/entity/get_drivers_list/',
    'add_job': '/hypernet/entity/add_new_entity/',
    'unassigned_trucks': '/hypernet/entity/get_unassigned_trucks/',
    'job_detail': '/iof/get_job_details/',
    'jobs_summary': '/iof/get_jobs_details_list/',
    'get_entity_dropdown': '/hypernet/entity/get_entity_type_dropdown/',
    'get_area_bins': '/hypernet/entity/get_area_bins/',
    'get_bins_dropdown': '/hypernet/entity/get_bins_list/',
    'get_contracts_from_clients': '/hypernet/entity/get_contracts_from_clients/',
    'get_areas_from_contracts': '/hypernet/entity/get_areas_from_contracts/',
    'get_bins_contract_dropdown': '/hypernet/entity/get_bins_witout_contract/',
    'delete_assignment': '/hypernet/entity/delete_assignment/',
    'get_iol_notifications': '/iof/get_notifications/',
    'reset_count': '/hypernet/notifications/update_notifications_count/',
    'get_review_activity': '/iof/get_review_form_data/',
    'get_bin_contracts': '/hypernet/entity/get_contracts_listing/',
    'get_supervisor_contracts': '/hypernet/entity/get_contracts_list/',
    'get_client_contracts': '/hypernet/entity/get_contract_details_dropdown/',
    'get_invoice': '/iof/invoice_reporting/',
    'get_tripsheet': '/iof/trip_sheet_reporting/',
    'download_invoice': '/ioa/tests/zenath_report/',
    'download_tripsheet': '/ioa/tests/zenath_trips_report/',
    'update_running_activity': '/hypernet/entity/V2/update_running_activity/',


    'single_site': '/ffp/get_site_details',
    'single_zone': '/ffp/get_zone_details',
    'get_entity': '/iof/entities/',
    'get_subordinates': '/ffp/employee_subordinates',
    'get_violations': '/ffp/violations_dashboard',
    'get_sites_listing': '/ffp/get_sites_listing_dashboard',
    'get_site_zone_dropdown': '/ffp/site_zone_dropdown',
    'violations_dashboard': '/ffp/violations_dashboard',
    'get_counts_listing': '/hypernet/entity/get_counts_listing',
    'get_maintenance_status_count': '/hypernet/entity/get_maintenance_summary_counts',
    'invoice_listing': '/iof/invoice_listing/'
  };

  static initialize() {
    AppConfig._URL = (AppConfig.DEBUG) ? AppConfig.URL_DEV : AppConfig.URL_PROD;
  }

  static get URL(): string {
    return this._URL;
  }

  static APIHandler(key): string {
    return '/ioa' + AppConfig._ioaUrlList[key];
  }

  static APIOptionsHandler(key): string {
    return AppConfig._ioaUrlList[key];
  }

  // static iolAPIHandler(key): string {
  //   return this._URL + AppConfig._iolUrlList[key];
  // }
}

AppConfig.initialize();
