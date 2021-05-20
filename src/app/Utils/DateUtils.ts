// Created by Mushahid on 06-11-2020.

import { format, addMinutes, subWeeks, subDays, subMonths, startOfToday, endOfToday, isValid, endOfYesterday, addDays } from 'date-fns';
import * as moment from 'moment';
import { subtract } from 'ngx-bootstrap/chronos';
import { isNullOrUndefined } from 'util';

export class DateUtils {

  static now(): Date {
    return new Date();
  }

  static addDa(date){
    return addDays(date, 1);
  }

  static isValid(date: any): Boolean {
    return isValid(new Date(date));
  }


  static getMMMMDY(date: string) {
    return format(date, 'MMM DD, YYYY');

  }

  static formatDate(date: string) {
    let lala = this.getLocalMMDDYYYYhhmmssA(date);
    return format(date, 'MMM DD, YYYY HH:mm:ss A');

  }


  static getLocalhhmmA(date: string): string {
    if (date) {
      date = date.replace('+00:00', '');
      try {

        const localDate = new Date(date);
        // const utcDate = Date.parse(date);
        // const localDate = addMinutes(utcDate, -(new Date().getTimezoneOffset()));
        return format(localDate, 'hh:mm A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }


  // input utc as '2017-12-04 07:23:56+00:00' or any valid parseable date as string
  // out local as '2017-12-04 02:23:56'
  static getLocalYYYYMMDDHHmmss(date: string): string {
    if (date) {
      date = date.replace('+00:00', '');
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, -(new Date().getTimezoneOffset()));
        return format(localDate, 'MMM, DD, YYYY, hh:mm:ss A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  // input utc as '2017-12-04 07:23:56+00:00' or any valid parseable date as string
  // out local as '2017-12-04 02:23:56'
  static getLocalMMDDYYYYhhmmssA(date: string): string {
    if (date) {
      date = date.replace('+00:00', '');
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, -(new Date().getTimezoneOffset()));
        return format(localDate, 'MMM, DD, YYYY, hh:mm:ss A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getLocalMMDDYYYYhhmmssATime(date: string): string {
    if (date) {
      date = date.replace('+00:00', '');
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, -(new Date().getTimezoneOffset()));
        return format(localDate, 'HH:mm:ss');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getLocalMMDDYYYYhhmmssATimee(date: string): string {
    if (date) {
      date = date.replace('+00:00', '');
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, -(new Date().getTimezoneOffset()));
        return format(localDate, 'hh:mm:ss A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  // input utc as '2017-12-04 07:23:56+00:00' or any valid parseable date as string
  // out local as '2017-12-04 02:23:56'
  static getLocalMMDDYYYYhhmmssAwithDay(date: string): string {
    if (date) {
      date = date.replace('+00:00', '');
      let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      };
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, -(new Date().getTimezoneOffset()));
        // return format(localDate, 'MMM, DD, YYYY, hh:mm:ss A');
        return localDate.toLocaleDateString('en-EN', options);
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  // input local as '2017-12-04 02:23:56' or any valid parseable date as string
  // out utc as '2017-12-04 07:23:56'  2018-01-01T01:00
  static getUTCYYYYMMDDHHmmsstemp(date: string): string {
    if (date) {
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, new Date().getTimezoneOffset());
        return format(localDate, 'YYYY-MM-DDTHH:mm');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getUTCYYYYMMDDHHmmss(date: string): string {
    if (date) {
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, new Date().getTimezoneOffset());
        return format(localDate, 'YYYY-MM-DD HH:mm:ss');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getLocalYYYYMMDDHHmmssA(date: string): string {
    if (date) {
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, -(new Date().getTimezoneOffset()));
        return format(localDate, 'YYYY:MM:DD : HH:mm:ss A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getLocalMMDDYYYYhhmmss(date: any) {
    if (date) {
      try {
      var local = moment(moment.unix(date).format('MMM DD, YYYY hh:mm:ss a'), ['MMM DD, YYYY hh:mm:ss a']);

      return (moment(local).format('MMM DD, YYYY, hh:mm:ss A'));

      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }


  static getMMDDYYYYhhmmssA(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'MMM DD, YYYY, hh:mm:ss A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static convertDateToLocal(date: any) {
    var local = moment(moment.unix(date).format('MMM DD, YYYY hh:mm a'), ['MMM DD, YYYY hh:mm a']);
    return moment(local).format('MMM DD, YYYY');
  }

  static convertDateTimeToLocal(date: any) {
    date = new Date(date).getTime() / 1000;
    var local = moment(moment.unix(date).format('MMM DD, YYYY hh:mm a'), ['MMM DD, YYYY hh:mm a']);
    return moment(local).format('MMM DD, YYYY, hh:mm:ss A');
  }

  static getYYYY(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'YYYY');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getMMM(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'MMM');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getDD(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'DD');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getMMMYY(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'MMM-YY');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getMMMYYYY(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'MMM-YYYY');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getDDMMM(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'DD-MMM');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static gethhmmssA(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        const utcDate = addMinutes(localDate, new Date().getTimezoneOffset());
        return format(utcDate, 'HH:mm:ss');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static gethhmmssAA(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        const utcDate = addMinutes(localDate, new Date().getTimezoneOffset());
        return format(utcDate, 'hh:mm:ss A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static gethhmmAA(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        const utcDate = addMinutes(localDate, new Date().getTimezoneOffset());
        return format(utcDate, 'hh:mm A');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }


  static gethhmmA(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'hh:mm:a');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  static getUTCtoLocalTimestamp(utcTimestamp: number): number {
    if (utcTimestamp) {
      try {
        const localDateTime = addMinutes(utcTimestamp, -(new Date().getTimezoneOffset()));
        return localDateTime.getTime();
      } catch (e) {
        console.log(e);
      }
    }
    return 0;
  }

  static getYYYYMMDD(date: string): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        return format(localDate, 'YYYY-MM-DD');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getDateAndTime(date: string, formatType?): string {
    if (date) {
      try {
        const localDate = Date.parse(date);
        if (formatType) {
          return format(localDate, formatType);
        } else {
          return format(localDate, 'DD-MMM-YYYY hh:mm:a');
        }
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getLastWeek() {
    return subWeeks(new Date(), 1);
  }

  static getStartOfThisMonth() {
    const today = new Date();
    today.setMinutes(0);
    today.setSeconds(0);
    today.setDate(1);
    today.setHours(0);
    // console.log(today);
    // const day = today.getDay(),
    //   diff = today.getDate() - day + (day === 0 ? -6 : 0);
    return new Date(today);
  }

  static getEndOfThisMonth() {
    const today = new Date();
    today.setMinutes(23);
    today.setSeconds(0);
    today.setHours(0);
    // console.log(today);
    // const day = today.getDay(),
    //   diff = today.getDate() - day + (day === 0 ? -6 : 0);
    return new Date(today);
  }

  static getStartOfThisWeek() {
    const today = new Date();
    today.setMinutes(0);
    today.setSeconds(0);
    const day = today.getDay(),
      diff = today.getDate() - day + (day === 0 ? -6 : 0); // adjust when day is sunday
    return new Date(today.setDate(diff));
  }

  static getStartOfLastWeek() {
    const today = new Date();
    today.setMinutes(0);
    today.setSeconds(0);
    const day = today.getDay(),
      diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(today.setDate(diff));
  }


  static getLastMonth() {
    return subMonths(new Date(), 1);
  }

  static getLastDay() {
    return subDays(startOfToday(), 1);
  }

  static getEndOfYesterday() {
    return endOfYesterday();
  }

  static getStartofToday() {
    return startOfToday();
  }

  static getEndofToday() {
    return endOfToday();
  }

  static getUtcDateTimeStart(date: string) {
    if (date) {
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, (new Date().getTimezoneOffset()));
        return format(localDate, 'YYYY-MM-DD HH:mm:ss');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }


  static getUtcDateTimeStart22(date: any) {
    if (date) {
      try {
        const utcDate = Date.parse(date);
        const localDate = addMinutes(utcDate, (new Date().getTimezoneOffset()));
        return format(localDate, 'YYYY-MM-DD HH:mm:ss');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getLocalDateTimeStart(date: string) {
    if (date) {
      try {
        const utcDate = Date.parse(date);
        // const localDate = addMinutes(utcDate, (new Date().getTimezoneOffset()));
        return format(utcDate, 'YYYY-MM-DD HH:mm:ss');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getUtcDateTimeEnd(date: string) {
    if (date) {
      try {
        const utcDate = Date.parse(date);
        // const localDate = addMinutes(utcDate, 1440);
        const resultDate = addMinutes(utcDate, new Date().getTimezoneOffset());
        return format(resultDate, 'YYYY-MM-DD HH:mm:ss');
      } catch (e) {
        console.log(e);
      }
    }
    return '';
  }

  static getDuration(time?) {
    if (time >= 60) {
      const hours = Number(Math.trunc(time / 60));

      const mins = Number(Math.trunc(time % 60));
      return hours + 'H ' + ' ' + mins + 'M';
    } else if (time < 60) {
      return (time).toFixed(2) + 'M';
    } else {
      return 0 + 'H ' + 0 + 'M';
    }
  }

  static getHoursFromMinutes(time?) {
    if (time) {
      let hours = (time / 60).toFixed(1);
      return hours;
    }
  }

  static sortDates(dates) {
    dates.sort(function (a, b) {
      let number: any;
      var dateA = +new Date(a);
      var dateB = +new Date(b);
      number = (dateA - dateB);
      return number;
    });


  }

  static DifferenceInYears(date1, date2) {
    const _MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365;
    if (!isNullOrUndefined(date1) && isNullOrUndefined(date2)) {
      let a = new Date(date1);
      let b = new Date(date2);
      const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
      // console.log(utc1, utc2, utc1 - utc2);
      let timeDiff = Math.floor((utc1 - utc2) / _MS_PER_YEAR);
      return timeDiff;
    }
  }
}
