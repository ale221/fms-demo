import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class XlsPdfService {

  constructor() { }

  downloadXlsPdf(param?,params?){
    var fileLink = document.createElement('a');
      fileLink.href = param
      fileLink.download = params
      fileLink.click();

  }
}
