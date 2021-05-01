import { Component, OnInit, ViewChild } from '@angular/core';
import { AppLoader } from 'src/app/platform/data/model/app-loader';
import { GoogleMapModel } from 'src/app/model/GoogleMapModel';
import { DrawerService } from '../services/drawer.service';

@Component({
  selector: 'app-helppage',
  templateUrl: './helppage.component.html',
  styleUrls: ['./helppage.component.css']
})
export class HelppageComponent implements OnInit {

  mapLoader = new AppLoader();
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  sidebarCheck;
  constructor(private drawerService: DrawerService ) {

   }

  ngOnInit(): void {

    this.drawerService.getValue().subscribe(res=>{
      this.sidebarCheck=res;
      console.log("ressssssssssssss1",res);
    console.log("ressssssssssssss2",this.sidebarCheck);
  })
    const mapProp = GoogleMapModel.getMapProp();
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

  }



}
