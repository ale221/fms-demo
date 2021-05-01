import { PrimengDropdownItem } from 'src/app/platform/data/model/primng-dropdown-item';

export enum MonthEnum {
  January = 1,
  Febuary = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

export enum DaysEnum {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}


export const DaysEnumReverse = {
  0 : 'Mon',
  1 : 'Tue',
  2 : 'Wed',
  3 : 'Thu',
  4 : 'Fri',
  5 : 'Sat',
  6 : 'Sun',
};

export enum YearEnum {
  _2018 = 2018,
  _2019 = 2019,
  _2017 = 2017,
}

export class MonthDropdown {

  allOption = {label: 'All'};

  static getMonthDropdown(min = 2) {
    const monthDropdown = [
      {label: 'January', value: MonthEnum.January},
      {label: 'Febuary', value: MonthEnum.Febuary},
      {label: 'March', value: MonthEnum.March},
      {label: 'April', value: MonthEnum.April},
      {label: 'May', value: MonthEnum.May},
      {label: 'June', value: MonthEnum.June},
      {label: 'July', value: MonthEnum.July},
      {label: 'August', value: MonthEnum.August},
      {label: 'September', value: MonthEnum.September},
      {label: 'October', value: MonthEnum.October},
      {label: 'November', value: MonthEnum.November},
      {label: 'December', value: MonthEnum.December},
    ];
    return monthDropdown;
  }

  static getYearDropdown() {
    const currentyear = MonthDropdown.getCurrentYear();
    const yearDropDown = [];

    for (let i = 2017; i <= currentyear; i++) {
      yearDropDown.push(new PrimengDropdownItem(i, i.toString()));
    }
    return yearDropDown;
  }

  static getCurrentYear() {
    return new Date().getFullYear();
  }
}
