import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private data = {};  
  
  setOption(option, value) {      
    this.data[option] = value;  
  }  
  
  getOption() {  
    return this.data;  
  }  

}
