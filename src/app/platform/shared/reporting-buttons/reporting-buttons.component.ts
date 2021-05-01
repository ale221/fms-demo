import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { isNullOrUndefined } from 'util';
import {
  differenceInDays,
  endOfDay,
  isSameDay,
  isSameWeek,
  isThisWeek,
  isToday,
  isYesterday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYesterday
} from 'date-fns';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { BrandingService } from '../services/branding.service';

@Component({
  selector: 'app-reporting-buttons',
  templateUrl: './reporting-buttons.component.html',
  styleUrls: ['./reporting-buttons.component.css']
})
export class ReportingButtonsComponent implements OnInit {

  dateRange: Date[];
  dateRangeStart: Date;
  dateRangeEnd: Date;
  maxDate = new Date();
  go = false;

  todayBtn = 'today';
  currentDate = new Date();

  ranges: any = [{
    value: [DateUtils.getStartofToday(), DateUtils.getEndofToday()],
    label: 'Today'
  }, {
    value: [DateUtils.getLastDay(), DateUtils.getEndOfYesterday()],
    label: 'Yesterday'
  }, {
    value: [DateUtils.getStartOfThisWeek(), DateUtils.getEndofToday()],
    label: 'This Week'
  }, {
    value: [DateUtils.getStartOfThisMonth(), DateUtils.getEndofToday()],
    label: 'This Month'
  },
  ];

  isToday: boolean;

  @Input() type?: string; // type of report.
  @Input() search?; // show search bar
  @Input() selected?: string; // selected button
  @Input() calendarDimension = 'col-sm-3';
  @Input() btnsDimension = 'col-sm-5';
  @Input() hideBtn = ''; // hides a  button
  @Input() showGenerateReport?= false; // Show Generate PDF option
  @Input() buttonGroupSize?= ''; // Show Generate PDF option
  @Input() buttonGroupColor?= ' btn-default'; // Show Generate PDF option
  @Input() timeRange?= false;
  @Input() calendarType?= 'range';
  @Input() showLabel?= false;
  @Input() hideCalendar?= false;
  @Input() btnsPosition?= 'pull-right margin-right-20';

  date1: Date;

  @Output() btnClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchKeyword: EventEmitter<any> = new EventEmitter<any>();
  @Output() generate: EventEmitter<any> = new EventEmitter<any>();
  message = 'Please select end date';
  messageOnEndDate: string = '';

  // rangeType: any = this.selected;
  theme;
  constructor(private brandingService: BrandingService) {
    this.theme = this.brandingService.styleObject();
  }


  ngOnInit() {
    if (this.selected) {
      if (this.selected === DaysRange.today) {
        this.todayClicked(this.type);
      }
      if (this.selected === DaysRange.yesterday) {
        this.yesterdayClicked(this.type);
      }
      if (this.selected === DaysRange.week) {
        this.weekClicked(this.type);
      }
      if (this.type === 'violation') {
        console.log(this.type);
      }
      if (this.type === 'driverDetail') {
        console.log(this.type);
      }
      if (this.selected === DaysRange.month) {
        this.monthClicked(this.type);
      }
    }
  }

  todayClicked(type) {
    this.selected = 'today';
    if (this.calendarType === 'basic') {
      this.date1 = DateUtils.getStartofToday();
    }

    // this.checkDateDurationinWords(this.dateRange);
    this.dateRange = [DateUtils.getStartofToday(), DateUtils.getEndofToday()];
    if (this.timeRange) {
      this.dateRangeStart = this.dateRange[0];
      this.dateRangeEnd = this.dateRange[1];
    }
    this.goBtnClicked();
  }

  yesterdayClicked(type) {
    if (this.calendarType === 'basic') {
      this.date1 = DateUtils.getLastDay();
    }
    this.dateRange = [DateUtils.getLastDay(), DateUtils.getEndOfYesterday()];
    this.selected = 'yesterday';
    this.checkDateDurationinWords(this.dateRange);
    if (this.timeRange) {
      this.dateRangeStart = this.dateRange[0];
      this.dateRangeEnd = this.dateRange[1];
    }
    this.goBtnClicked();

  }

  weekClicked(type) {
    this.dateRange = [DateUtils.getStartOfThisWeek(), DateUtils.getEndofToday()];
    this.checkDateDurationinWords(this.dateRange);
    if (this.timeRange) {
      this.dateRangeStart = this.dateRange[0];
      this.dateRangeEnd = this.dateRange[1];
    }
    this.goBtnClicked();
  }

  monthClicked(type) {
    const startMonth = DateUtils.now();
    startMonth.setDate(1);
    startMonth.setHours(0);
    startMonth.setMinutes(0);
    startMonth.setSeconds(0);
    this.dateRange = [startMonth, DateUtils.getEndofToday()];
    this.selected = "month";
    // this.checkDateDurationinWords(this.dateRange);
    if (this.timeRange) {
      this.dateRangeStart = this.dateRange[0];
      this.dateRangeEnd = this.dateRange[1];
    }
    this.goBtnClicked();
  }


  verifyDateRange(dateRange, type: string) {
    console.log(dateRange);
    if (!isNullOrUndefined(dateRange) && !isNullOrUndefined(dateRange[1])) {
      if (type === 'basic') {
        this.dateRange = [];
        this.dateRange.push(startOfDay(new Date(dateRange[0])));
        this.dateRange.push(endOfDay(new Date(dateRange[1])));
      }
      this.checkDateDurationinWords(dateRange);
      this.go = true;
      this.goBtnClicked();
    } else {
      this.go = false;
    }
  }

  verifyEndDate() {
    if (!isNullOrUndefined(this.dateRangeEnd)) {
      this.checkDateDurationinWords([this.dateRangeStart, this.dateRangeEnd]);
      if (!isNullOrUndefined(this.dateRangeEnd)) {
        if (this.dateRangeStart >= this.dateRangeEnd) {
          this.go = false;
        } else {
          if (this.dateRangeStart.getDate() === this.dateRangeEnd.getDate()) {
            const timeDiff = (this.dateRangeEnd.getTime() - this.dateRangeStart.getTime()) / 60000;
            // console.log(timeDiff,"time");
            if (timeDiff > 10) {
              this.go = true;
            } else {
              this.go = false;
            }
          } else {
            this.go = true;
          }
        }
      } else {
        this.go = false;
      }
    } else {
      this.go = false;
    }
  }

  verifyStartDate() {
    if (!this.dateRangeStart) {
      this.dateRangeEnd = null;
    } else {

    }
  }

  focusStart() {
    this.dateRangeStart = null;
    this.go = false;
  }

  checkDateDurationinWords(dateRange) {
    // if ( differenceInDays( new Date(dateRange[1]) , new Date(dateRange[0]) )  === 0) {
    //   this.selected = 'today';
    // }
    if (isToday(new Date(dateRange[1])) && isToday(new Date(dateRange[0]))) {
      this.selected = 'today';
    } else if (isYesterday(new Date(dateRange[1])) && isYesterday(new Date(dateRange[0]))) {
      this.selected = 'yesterday';
    } else if (differenceInDays(new Date(), new Date(dateRange[0])) === 7) {
      this.selected = 'week';
    } else if (differenceInDays(new Date(), new Date(dateRange[0])) >= 28 && differenceInDays(new Date(), new Date(dateRange[0])) <= 31) {
      this.selected = 'month';
    }
    // else if ( differenceInDays( new Date(dateRange[1]) , new Date(dateRange[0]) )  === 1) {
    //   this.selected = 'yesterday';
    // }
    else {
      this.selected = null;
    }

  }

  checkEndDate() {
    if (!isNullOrUndefined(this.dateRange) && !isNullOrUndefined(this.dateRange[0])) {
      this.message = 'Please select end date';
      return !isNullOrUndefined(this.dateRange[1]);
    } else {
      return true;
    }
  }

  checkRangeEndDate() {
    if (!isNullOrUndefined(this.dateRangeStart)) {
      if (this.timeRange && !isNullOrUndefined(this.dateRangeEnd)) {
        this.messageOnEndDate = '';
        // console.log("this.dateRangeStart= ", this.dateRangeStart)
        // console.log("this.dateRangeEnd= ", this.dateRangeEnd)
        if (this.dateRangeStart >= this.dateRangeEnd) {
          this.messageOnEndDate = '';
          this.message = 'End date should be greater than Start date';
          return false;
        } else {
          this.messageOnEndDate = '';
          if (this.dateRangeStart.getDate() == this.dateRangeEnd.getDate()) {
            const timeDiff = (this.dateRangeEnd.getTime() - this.dateRangeStart.getTime()) / 60000;
            // console.log(timeDiff,"time");
            if (timeDiff > 10) {
              return true;
            } else {
              this.message = 'Minimum difference Between End and Start date should be 10 mins';
              return false;
            }
          }
          return true;
        }
      } else {
        // this.message = 'Please select end date';
        this.messageOnEndDate = 'Please select end date';
        return !isNullOrUndefined(this.dateRangeEnd);
      }
    } else {
      this.messageOnEndDate = '';
      return true;
    }
  }

  goBtnClicked() {
    if (!this.timeRange && this.selected !== 'yesterday') {
      this.dateRange[1].setHours(23);
      this.dateRange[1].setMinutes(59);
      this.dateRange[1].setMinutes(59);
    }
    this.btnClicked.emit([this.dateRange, this.type]);
  }

  goBtnAlteredClicked() {
    this.btnClicked.emit([[this.dateRangeStart, this.dateRangeEnd], this.type]);
  }

  generateReportClicked() {
    this.generate.emit();
  }

  updateFilter(event) {
    this.searchKeyword.emit(event.target.value);
  }

}

enum DaysRange {
  today = 'today',
  yesterday = 'yesterday',
  week = 'week',
  month = 'month'
}
