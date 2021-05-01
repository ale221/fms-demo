import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DriverJobVehicleDetails } from '../../../model/drivers entities/driver-job-dashboard/driverJobVehicleDetails';
import { UtillsService } from '../../services/common/utills.service';

@Component({
  selector: 'app-driver-job-dashboard',
  templateUrl: './driver-job-dashboard.component.html',
  styleUrls: ['./driver-job-dashboard.component.css']
})
export class DriverJobDashboardComponent implements OnInit {

  // component parameters
  private connection: any  // use for signalR connection
  private driverId: any  // initialize from params driver id value that come from driver dashboard
  public driverJobVehicleDetailsObj: DriverJobVehicleDetails;
  public mapHeight: any = 800;
  public dMapPolylineStrokeColor: any = "#FF0000";
  public dMapIconFillColor: any = "#427af4";
  // component parameter end
  // Radical graph data
  // graphsData  will be pass to childeren graphs component it include pGraphSeries, pGraphLabels come from api
  public graphsData: any; 
  public currentSpeedGraphDataLabelsNameFontSize: any = '16px';
  public currentSpeedGraphDataLabelsNameFontSizeColor: any = undefined;
  public currentSpeedGraphDataLabelsNameFontOffsetY: number = 120;
  public currentSpeedGraphDataLabelsValueFontSize: any = '22px';
  public currentSpeedGraphDataLabelsValueFontSizeColor: any = undefined;
  public currentSpeedPGraphDataLabelsValueFontOffsetY: number = 76; 
  public currentGraphDataLabelsValueFontFormattor: string = 'KM';
  public currentSpeedGraphDataStrokeDashArray: number = 4;
  public currentSpeedGraphDataChartHeight: number = 350;
  // trip complete graph props
  public tripCompleteGraphDataLabelsNameFontSize: any;
  public tripCompleteGraphDataLabelsNameFontSizeColor: any;
  public tripCompleteGraphDataLabelsNameFontOffsetY: any;
  public tripCompleteGraphDataLabelsValueFontSize: any;
  public tripCompleteGraphDataLabelsValueFontSizeColor: any;
  public tripCompleteGraphDataLabelsValueFontOffsetY: any;
  public tripCompleteGraphDataStrokeDashArray: any;
  public tripCompleteGraphDataChartHeight: any = 250;
  // trip complete graph props end
  // Radical graph data end

  constructor(private route: ActivatedRoute, private srvUtillsService: UtillsService) {
    this.connection = this.route.snapshot.data['connection']; // we are passing connection in route param
    this.driverId = this.srvUtillsService.getParams('id');

  }

  ngOnInit(): void {
    this.driverJobVehicleDetailsObj = new DriverJobVehicleDetails();

    this.getGraphsData();
  }

  // this function is used to get data for graphs
  getGraphsData() {
    // replace with api data
    this.graphsData = {
      currentSpeed: {
        series: [67],
        labels: ['Current Speed']
      },
      tripComplete: {
        series: [70],
        labels: ['Trip Complete']
      },
    }
    // response for vehical details
    this.driverJobVehicleDetailsObj = {
      speedLimit: 40,
      harshAccelaration: 8,
      harshBreaking: 5,
      overSpeeding: 3,
      distanceTravelled: 1000,
      weightage: 500,
      fuelLevel: 65,
      currentMpg: 7
    }
  }

  configureSignalR() {

  }

}
