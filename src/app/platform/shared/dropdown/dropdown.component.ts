import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {


  @Input() optionsList? = [];
  @Input() placeHolder?: string;
  @Input() toolTip?: string;
  @Input() liveSearch? = false;
  @Input() multiSelect? = false;
  @Output() select: EventEmitter<any> = new EventEmitter<any>();
  public selectedVal: any;

  constructor() { }

  ngOnInit() {
  }

  onSelect(val) {
    this.select.emit(this.selectedVal);
  }
  onSelectSingle(val) {
    this.select.emit(val);
  }

}
