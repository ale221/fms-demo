import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UtillsService } from '../../../services/common/utills.service';


@Component({
  selector: 'app-google-map-driver-dashboard',
  templateUrl: './google-map-driver-dashboard.component.html',
  styleUrls: ['./google-map-driver-dashboard.component.css']
})
export class GoogleMapDriverDashboardComponent implements OnInit, AfterViewInit {

  // google map props
  private map: any;
  private originPlaceId = null;
  private destinationPlaceId = null;
  private travelMode = 'DRIVING';

  private directionsService: any;
  private directionsDisplay: any;
  private geocoder: any;

  @ViewChild('map') mapRef: ElementRef;
  // props that come from parent component
  @Input() mapHeight: any = 800;
  @Input() polylineStrokeColor: any;
  @Input() iconFillColor: any;
  @Input() iconRotationAngle: any;

  // prop parent component end
  // props end
  constructor(private srvUtillsService: UtillsService) { }


  ngOnInit(): void {

    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.geocoder = new google.maps.Geocoder();

  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {
    //var directionsDisplay = new google.maps.DirectionsRenderer;
    //var directionsService = new google.maps.DirectionsService;
    this.map = new google.maps.Map(this.mapRef.nativeElement, {
      zoom: 22,
      center: { lat: 25.3548, lng: 51.1839 }
    });
    this.directionsDisplay.setMap(this.map);

    var icon = { // car icon
      path: 'M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759   c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z    M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713   v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336   h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805',
      scale: 0.4,
      fillColor: "#427af4", //<-- Car Color, you can change it 
      fillOpacity: 1,
      strokeWeight: 1,
      anchor: new google.maps.Point(0, 5),
      //rotation: data.val().angle //<-- Car angle
    };
    var uluru = { lat: 12.9577129, lng: 77.6764937  };
    var marker = new google.maps.Marker({
      position: uluru,
      icon: icon,
      map: this.map
    });

    this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay,marker);
    //document.getElementById('mode').addEventListener('change', function () {
    //  calculateAndDisplayRoute(directionsService, directionsDisplay);
    //});
  }

  calculateAndDisplayRoute(directionsService, directionsDisplay,marker) {
    //var selectedMode = document.getElementById('mode').value;


    directionsService.route({
      origin: { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() },  // Haight.
      destination: { lat: 12.9630167, lng: 77.6268656 },  // Domlur.
      // Note that Javascript allows us to access the constant
      // using square brackets and a string value as its
      // "property."
      travelMode: google.maps.TravelMode.DRIVING
      //waypoints: waypts
    }, function (response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });

  }
}
