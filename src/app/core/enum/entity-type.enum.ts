export enum EntityType {
  JOB = 1,
  FLEET = 2,
  TRUCK = 3,
  COMPARTMENT = 4,
  DRIVER = 5,
  TERRITORY = 6,
  DEPOT = 7,
  VESSEL = 8,
  MAINTENANCE_TYPE = 9,
  PLAYER = 16,
  TEAM = 17,
  MATCH = 18,
  COMPETITION = 19,
  VENUE = 20,
  BIN = 21,
  FREEZER = 22,
  ANIMAL = 30,
  HERD = 31,
  RFID_SCANNER = 40,
  CLIENT = 36,
  DUMP_SITE = 37,
  AREA = 38,
  CUSTOMER_DEVICE = 39,
  CONTRACT = 42,
  SUPERVISOR = 44,
  RFID_TAG = 47,
  RFID_CARD = 48,
  SORTING_FACILITY = 51,
  ZONE = 55,
  EMPLOYEE = 54,
  LOCATION = 65,
  LABOUR = 46,
  Workshop_Technician = 67,
  IMEI_DEVICE = 213,
  TRUCK_TYPE = 10,
}


export enum EntityStatusEnum {
  Active = 1,
  Inactive = 2,
  Delete = 12
}

export enum TerritoryTypeEnum {
  RED = 56,
  GREEN = 57,
  BLUE = 58
}


export enum FFPViolationEnum {
  OUT_OF_ZONE = 1506,
  IN_ZONE = 1509,
  IN_SITE = 1510,
  OUT_OF_SITE = 1511,
}


export enum VesselTypeEnum {
  Tank = 8,
  Container = 9,
}

export enum MaterialTypeEnum {
  PLASTIC = 120,
  GALVANIZED_METAL_OR_PLASTIC = 121,
  GALVANIZED_METAL = 122,
  METAL = 134,
  MEDICAL_WASTE = 182
}

export const MaritalStatusEnum = {
  6: 'Married',
  7: 'Single',
  8: 'Divorced',
};

export enum SkipSizeEnum {
  SKIP_SIZE_2 = 158,
  SKIP_SIZE_3 = 147,
  SKIP_SIZE_4 = 148,
  SKIP_SIZE_5 = 149,
  SKIP_SIZE_6 = 150,
  SKIP_SIZE_7 = 151,
  SKIP_SIZE_8 = 152,
  SKIP_SIZE_9 = 153,
  SKIP_SIZE_10 = 154,
  SKIP_SIZE_11 = 155,
  SKIP_SIZE_12 = 156,
  SKIP_SIZE_1 = 157,
  SKIP_SIZE_13 = 175,
}

export enum SkipSizeToMaterialEnum {
  _158 = 'Galvanized Metal or Plastic',
  _147 = 'Galvanized Metal',
  _148 = 'Metal',
  _149 = 'Metal',
  _150 = 'Metal',
  _151 = 'Metal',
  _152 = 'Metal',
  _153 = 'Metal',
  _154 = 'Metal',
  _155 = 'Metal',
  _156 = 'Metal',
  _157 = 'Plastic',
  _175 = 'Metal',
  _182 = 'Medical Waste',
}

export enum ActivityStatusEnum {
  COLLECTED = 92,
  UNCOLLECTED = 93,
  STARTED = 94,
  REVIEWED = 95,
  CONFLICTING = 96,
  COLLECT_WASTE = 97,
  WASTE_COLLECTED = 98,
  PICKUP_BIN = 99,
  DROPOFF_BIN = 100,
  START_SHIFT = 101,
  END_SHIFT = 102,
  VERIFY_COLLECTION = 103,
  ABORT_COLLECTION = 104,
  BIN_PICKED_UP = 111,
  SKIP_VERIFITCATION = 116,
  UPDATE_SKIP_WEIGHT = 135,
  REPORT_MAINTENANCE = 171,
  CONTRACT_TERMINATION = 176,
  MAINTENANCE_PICKUP = 177,

  UPDATE_SKIP_DETAILS = 178,
  WORKSHOP_DROP = 179,
  SPARE_SKIP_DEPOSIT = 180,
  ACCEPTED = 74,
  REJECTED = 75,
  RUNNING = 52,
  PENDING = 53,
  ABORTED = 54,
  COMPLETED = 55,
  SUSPENDED = 78,
  RESUMED = 79,
  FAILED = 117,
}


export enum LeasedOwnedEnum {
  OWNED = 50,
  LEASED = 51,
}


export enum CBMEnum {
  _240litres = '240 litres',
  _1cbm = '1.1 cbm',
  _2cbm = '2.5 cbm',
  _5cbm = '5 cbm',
  _8cbm = '8 cbm',
  _10cbm = '10 cbm',
  _12cbm = '12 cbm',
  _14cbm = '14 cbm',
  _18cbm = '18 cbm',
  _20cbm = '20 cbm',
  _26cbm = '26 cbm',
  _30cbm = '30 cbm',
  _40cbm = '40 cbm',
  _MedicalWaste = '40 cbm',
}

export enum GraphTypesEnum {
  VERTICAL_BAR = 1,
  HOTIZONTAL_BAR = 2,
  LINE = 3,
  PIE = 4,
  DONUT = 5,
  MULTI_DONUT = 6,
  SPEEDO_METER = 7,
  CONE = 8,
  TREE = 9,
  AREA = 10
}