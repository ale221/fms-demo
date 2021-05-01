import {AfterContentInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { DatatableService } from '../../services/datatable.service';

@Component({
  selector: 'app-table-search',
  templateUrl: './table-search.component.html',
  styleUrls: ['./table-search.component.css']
})
export class TableSearchComponent implements OnInit, OnChanges {

  /** Search-bar above listing tables which filter out the rows (array of objects)
   @INPUT
   rows:Array<Objects> = table rows, it is recommended to create a temporary variable storing all rows and not the actual variable being used in listing
   args: Array<Strings> = array of keys to search
   disableLoader:boolean = disables text-box based on this value,
   tooltipArray:Array<String> = Array of items to display on text-box,
   @OUTPUT
   filter= a function that returns the filtered rows
   !IMPORTANT this will not have any effect if the output function isn't implemented in the parent component
   **/

  inputValue;
  @Input() rows = [];
  @Input() args = [];
  @Input() disableTextBox? = false;
  @Input() tooltipArray;
  @Output() filter: EventEmitter<any> = new EventEmitter();

  constructor(private datatableService: DatatableService) {
  }

  ngOnInit() {
  }

  /**
   * Resets value on every change
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.inputValue = null;
  }

  updateFilter() {
    const filteredRows = this.datatableService.updateFilter(this.inputValue, this.rows, this.args);
    this.filter.emit(filteredRows);
  }

}
