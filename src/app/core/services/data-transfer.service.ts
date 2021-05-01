import {EventEmitter, Injectable, Output} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {

  public data: any;
  @Output() dataUpdated:EventEmitter<any> = new EventEmitter();

  constructor() { }


  setData(data) {
    this.data = data;
    this.dataUpdated.emit(data);
  }

  getData() {
    return this.data;
  }

}
