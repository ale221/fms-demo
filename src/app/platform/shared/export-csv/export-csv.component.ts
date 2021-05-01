import { AfterContentInit, Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateUtils } from 'src/app/Utils/DateUtils';

@Component({
  selector: 'app-export-csv',
  templateUrl: './export-csv.component.html',
  styleUrls: ['./export-csv.component.css'],
  providers: [DatePipe]

})
export class ExportCsvComponent implements OnInit, AfterContentInit {
  @Input() cols;
  @Input() rows;
  @Input() fileName = 'Report';
  @Input() dateGenerated?= new Date().toString();
  @Input() btnSize = 'btn-sm';

  constructor(private datePipe: DatePipe) {
  }

  ngOnInit() {
    console.log("THIS.ROWS= ", this.rows)
    if ((this.dateGenerated)) {
      this.dateGenerated = DateUtils.getMMMMDY(this.dateGenerated);
      this.fileName = this.fileName + '_' + this.dateGenerated;
    }
  }


  ngAfterContentInit(): void {
    const timeFields = this.cols.filter(item => {
      return item.time === true;
    });
    this.rows.forEach(item => {
      for (let i = 0; i < timeFields.length; i++) {
        const date = timeFields[i].format ? timeFields[i].format : 'd-MMM-yy';
        item[timeFields[i].field] = this.datePipe.transform(item[timeFields[i].field], date);
        // console.log(date, item[timeFields[i].field]);
      }
    });
  }
}
