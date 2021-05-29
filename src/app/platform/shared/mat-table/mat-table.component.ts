import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { TableService } from 'src/app/core/services/table.service';

@Component({
  selector: 'app-mat-table',
  templateUrl: './mat-table.component.html',
  styleUrls: ['./mat-table.component.css']
})
export class MatTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns;
  dataSource = [];
  totalCount;
  tablePage;
  tableNumber;

  constructor(private tableService: TableService) { }

  ngOnInit(): void {
    this.tableService.getValue().subscribe(data => {
      if (data) {
        this.dataSource = data.tableData.data;
        this.totalCount = data.tableData.count;
        this.tablePage = data.tablePage;
        this.tableNumber = data.tableNumber;
        this.displayedColumns = data.tableHeaders

        // {header:"Vehicle", field_name:'vehicle'},
        // {header:"Current Speed", field_name:'currentSpeed'},
        // {header:"Driver", field_name:'driver'},
        // {header:"KM/Day", field_name:"perDayKM"},
        // {header:"POI", field_name:"poi"},
        // {header:"POI Time", field_name:"poiTime"},

        //Generate Fleet Table 
        if (this.tablePage === 'fleets' && this.tableNumber === 1) {
          if(data.tableData.data && data.tableData.data.length > 0) {
            data.tableData.data.forEach((element, i) => {
              let tableData = { columnDef: null, header: null, cell: (element: Element) => `${data.tableHeaders[i].field_name}`, data: null };
              if (data.tableHeaders[i]) {
                tableData.header = data.tableHeaders[i].header;
                tableData.columnDef = data.tableHeaders[i].field_name;
                // tableData.data = element[data.tableHeaders[i].field_name];
                // this.dataSource.push(tableData);
              }
            });
            this.displayedColumns = this.dataSource.map(col => col.columnDef);
            // console.log(this.dataSource)
            // console.log(this.displayedColumns)
          }
        }
      }
    })
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

}
