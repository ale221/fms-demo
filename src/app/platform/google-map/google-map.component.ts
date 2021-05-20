/* tslint:disable:member-ordering */
/// <reference types="@types/googlemaps" />
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { AppConfig } from '../../app.config';
import { Observable, forkJoin } from 'rxjs';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { Colors } from '../colors';
import { Item } from '../data/model/item';
import { environment } from 'src/environments/environment';
import { SwalService } from 'src/app/core/services/swal.service';

declare var google;
declare var MarkerClusterer: any;
declare var $: any;


@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})
export class GoogleMapComponent implements OnInit {
  @Input() currentpage;
  @ViewChild('gmap') gmapElement: any;
  public _markers = [];
  @Input() disableGenerate = true;
  @Input() height;
  @Input() markers?;
  @Input() infowindow?;
  @Input() cords?;
  @Input() markerLimit?;
  @Input() showSearchBar?= false;
  @Input() showExportImage?= false;
  @Input() center?= { lat: 25.3548, lng: 51.1839 };
  @Input() zoom_level?= 9;
  @Input() mapType: boolean = true;

  @Input() poiLocations: any;
  @Input() trucks: any;
  @Input() signalRstarted: any;

  @Output() click: EventEmitter<any> = new EventEmitter<any>();
  @Output() imageUrlGenerated: EventEmitter<any> = new EventEmitter<any>();

  infoWindows = {};


  constructor(private httpCLient: HttpClient, private sanitizer: DomSanitizer, public swalService: SwalService) {
  }

  map;
  marker2;
  _directionsDisplay = new google.maps.DirectionsRenderer();
  _polyline = new google.maps.Polyline();
  imageUrl;
  myInfowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  snappedCoordinates;
  snappedPolyline;
  snappedCoodinatesFormatted = [];
  totalSnapToRoadCalls = 0;
  totalSnapToRoadResponses = 0;
  // dict_map = {};
  // allInfoWindows = []
  circleShape;
  osrmLatLng;

  playBack = false;

  ngOnInit() {}


  ngAfterViewInit() {
    this.initMap();
    this.map.addListener('click', (e) => {
      if (this._markers.length < this.markerLimit) {
        this.click.emit(e);
      }
    });
    if (this.cords) {
      console.log("cords",this.cords)
      this.drawTerritory(this.cords);
    }
  }

  initMap() {
    const mapProp = {
      center: this.center,
      zoom: this.zoom_level,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
      },
      streetViewControl: true,
    };
    // this.map.fitBounds(worldBounds);

    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp); // this.gmapElement.nativeElement, mapProp);
    if (this.showSearchBar) {
      // Create the search box and link it to the UI element.
      const input = document.getElementById('pac-input');
      const searchBox = new google.maps.places.SearchBox(input);
      const map = this.map;
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      this.map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener('places_changed', function () {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
          return;
        }
        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
          if (!place.geometry) {
            console.log('Returned place contains no geometry');
            return;
          }
          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
        map.setZoom(20);
      });
    }


  }

  placeMarkerAndPanTo(latLng) {
    const position = new google.maps.LatLng(latLng.lat(), latLng.lng());
    const marker = new google.maps.Marker({
      position: position,
      map: this.map
    });
    this._markers.push(marker);
  }

  panTo(latlng, zoomLevel = 18) {
    if (typeof (latlng) === 'string') {
      latlng = this.getLatLngFromString(latlng);
    }
    const position = new google.maps.LatLng(latlng.lat(), latlng.lng());
    this.map.panTo(position);
    this.map.setZoom(zoomLevel);
  }

  panOut(bounds = this.bounds) {
    this.map.fitBounds(bounds);
  }

  createMarker(startPos, endPos?, iconUrl = null, info?, actionType = 'mouseover', zoom = null, reset = false, height = 50, width = 50) {

    if (reset) {
      this.resetMap();
    }
    let position;

    if (typeof (startPos) === 'string') {
      position = this.getLatLngFromString(startPos);
    } else {
      position = startPos;
    }

    const marker = new google.maps.Marker({
      position: position,
      map: this.map
    });
    this._markers.push(marker);

    if (iconUrl) {
      const icon = this.createIcon(iconUrl, height, width);
      marker.setIcon(icon);
    }
    if (info) {
      const infowindow = new google.maps.InfoWindow();
      marker.addListener(actionType, event => {
        infowindow.setContent((info));
        infowindow.open(this.map, marker);
      });
      if (actionType === 'mouseover') {
        marker.addListener('mouseout', event => {
          infowindow.close();
        });
      }

    }

    this.bounds.extend(marker.getPosition());
    this.map.fitBounds(this.bounds);
    if (zoom) {
      this.map.setZoom(zoom);
    }
    // this.map.panTo(marker.getPosition());
    return marker;
  }


  createMarkers(positions, iconUrl = null, info, actionType = 'mouseover', height = 50, width = 50, zoom?, markerHW?) {
    let position;
    for (let i = 0; i < positions.length; i++) {
      if (typeof (positions[i]) === 'string') {
        position = this.getLatLngFromString(positions[i]);
      } else {
        position = positions[i];
      }
      const marker = new google.maps.Marker({
        position: position,
        map: this.map
      });
      marker.addListener(actionType, event => {
        this.myInfowindow.setContent((info[i]));
        this.myInfowindow.open(this.map, marker);
      });
      // this.dict_map['infoWinObj'] = info[i];
      // this.dict_map['markerObj'] = marker;

      //push JSON dict in array
      // this.allInfoWindows.push(this.dict_map);

      if (actionType === 'mouseover') {
        marker.addListener('mouseout', event => {
          this.myInfowindow.close();
        });
      }
      marker.addListener(actionType, event => {
        this.myInfowindow.setContent((info[i]));
        this.myInfowindow.open(this.map, marker);
      });

      if (actionType === 'mouseover') {
        marker.addListener('mouseout', event => {
          this.myInfowindow.close();
        });
      }

      if (markerHW && markerHW.length > 0) {
        height = markerHW[i];
        width = markerHW[i];
      }

      this._markers.push(marker);
      this.bounds.extend(marker.getPosition());

      if (iconUrl instanceof Array) {
        const icon = this.createIcon(iconUrl[i], height, width);
        marker.setIcon(icon);
      } else if (iconUrl) {
        const icon = this.createIcon(iconUrl, height, width);
        marker.setIcon(icon);
      } else {
        marker.setIcon(null);
      }
    }

    // this.map.fitBounds(this.bounds);

    if (zoom) {
      this.map.setZoom(zoom);
    }
    // if (position.length < 2) {
    //   this.map.setZoom(12);
    // }
    // let z = this.getBoundsZoomLevel(bounds,{height: this.height, width: 390});
    // this.map.setZoom(z);
    // this.map.setCenter(this.bounds.getCenter());

    return this._markers;

  }

  createMarkersWithLabels(positions, labels1, info, actionType = 'mouseover', height = 50, width = 50, zoom?) {
    let position;
    for (let i = 0; i < positions.length; i++) {
      if (typeof (positions[i]) === 'string') {
        position = this.getLatLngFromString(positions[i]);
      } else {
        position = positions[i];
      }
      const marker = new google.maps.Marker({
        position: position,
        label: labels1[i].toString(),
        map: this.map
      });
      marker.addListener(actionType, event => {
        this.myInfowindow.setContent((info[i]));
        this.myInfowindow.open(this.map, marker);
      });

      if (actionType === 'mouseover') {
        marker.addListener('mouseout', event => {
          this.myInfowindow.close();
        });
      }
      marker.addListener(actionType, event => {
        this.myInfowindow.setContent((info[i]));
        this.myInfowindow.open(this.map, marker);
      });

      if (actionType === 'mouseover') {
        marker.addListener('mouseout', event => {
          this.myInfowindow.close();
        });
      }

      this._markers.push(marker);
      this.bounds.extend(marker.getPosition());


      // if (iconUrl instanceof Array) {
      //   const icon = this.createIcon(iconUrl[i], height, width);
      //   marker.setIcon(icon);
      // } else if (iconUrl) {
      //   const icon = this.createIcon(iconUrl, height, width);
      //   marker.setIcon(icon);
      // } else {
      //   marker.setIcon(null);
      // }
    }

    this.map.fitBounds(this.bounds);


    // if (zoom) {
    //   this.map.setZoom(zoom);
    // }
    // if (position.length < 2) {
    //   this.map.setZoom(12);
    // }
    // let z = this.getBoundsZoomLevel(bounds,{height: this.height, width: 390});
    // this.map.setZoom(z);
    // this.map.setCenter(this.bounds.getCenter());

    return this._markers;

  }

  createTrail(locations, info, showCircleMarkers = true, showMarkers = true, options?) {
    // this.resetMap();

    let trailMarker;
    const tempMarkersArr = [];
    const bounds = new google.maps.LatLngBounds();
    if (locations.length) {
      if (!showCircleMarkers && showMarkers) {
        const startIcon = 'assets/images/iol/icon-map-pin-start.png';
        const endIcon = 'assets/images/iol/icon-map-pin-end.png';
        const trailMarker1 = this.createDummyMarker(startIcon, locations[0].lat, locations[0].lng, info[0]);
        const trailMarker2 = this.createDummyMarker(endIcon, locations[locations.length - 1].lat, locations[locations.length - 1].lng, info[1]);
        tempMarkersArr.push(trailMarker1, trailMarker2);
        trailMarker1.setMap(this.map);
        trailMarker2.setMap(this.map);
        this._markers.push(trailMarker1, trailMarker2);
        this.bounds.extend(trailMarker1.getPosition());
        this.bounds.extend(trailMarker2.getPosition());


        // bounds.extend(trailMarker1.getPosition());
        // bounds.extend(trailMarker2.getPosition());

      } else {
        for (let i = 0; i < locations.length; i++) {
          if (i === 0 && showMarkers) {
            trailMarker = this.createDummyMarker('assets/images/iol/icon-map-pin-start.png', locations[i].lat, locations[i].lng);
          } else if (i === locations.length - 1 && showMarkers) {
            trailMarker = this.createDummyMarker('assets/images/iol/icon-map-pin-end.png', locations[locations.length - 1].lat, locations[locations.length - 1].lng);
          } else if (showCircleMarkers) {
            trailMarker = new google.maps.Marker({
              position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#46be8a',
                fillOpacity: 0.8,
                scale: 3,
                strokeColor: '#36ab7a',
                strokeWeight: 15

              },
            });
          }
          if (trailMarker) {
            tempMarkersArr.push(trailMarker);
            trailMarker.setMap(this.map);
            this._markers.push(trailMarker);
            bounds.extend(trailMarker.getPosition());
          }
        }
      }
      // for (let i = 0; i < tempMarkersArr.length; i++) {
      //   tempMarkersArr[i].addListener('mouseover', event => {
      //     this.infowindow.setContent(info[i]);
      //     this.infowindow.open(this.map,  tempMarkersArr[i]);
      //   });
      //   tempMarkersArr[i].addListener('mouseout', event => {
      //     this.infowindow.close();
      //   });
      // }
      const polyline = new google.maps.Polyline({
        path: locations,
        geodesic: true,
        strokeColor: '#36ab7a',
        strokeWeight: 3
      });
      // this._markers.push(polyline);
      this._polyline = polyline;
      polyline.setMap(this.map);

      polyline.getPath().forEach(function (element, index) {
        bounds.extend(element);
      });
      this.map.fitBounds(bounds);
      // this.map.fitBounds(this.bounds);
      return tempMarkersArr;
    }
  }

  createSnapToRoad(locations, info, zoom = null) {
    const tempMarkersArr = [];
    const bounds = new google.maps.LatLngBounds();
    if (locations.length) {
      if (this.snappedPolyline) {
        this.snappedPolyline.setMap(null);
      }
      let pathValues = [];
      let timeStamps = [];
      this.snappedCoordinates = [];
      this.snappedCoodinatesFormatted = [];
      let count = 0;
      this.totalSnapToRoadCalls = Math.ceil(locations.length / 100);
      const observables: Observable<any>[] = [];

      locations.forEach((element, index) => {
        // SnapToRoad only accept 100 paths, therefore we have to send multipe request to Google Roads Api
        if (count === 99 || (index + 1) === locations.length) {
          observables.push(this.sendSnapToRoadRequest(pathValues, locations, info, zoom));
          pathValues = [];
          count = 0;
        } else {
          count++;
          pathValues.push(element.lng + "," + element.lat);
          // timeStamps.push(element.times)
        }
      });


      const result1 = forkJoin(observables);
      result1.subscribe((result) => {
        let arrayToProcess = [];
        if (result && result.length) {
          result.forEach((element, i) => {
            if (element.code === 'Ok' && element.matchings && element.matchings.length > 0) {
              // Trail with OSRM Map 
              element.matchings.forEach (match => {
                  if (match.geometry && match.geometry.coordinates && match.geometry.coordinates.length > 0) {
                    match.geometry.coordinates.forEach(coords => {
                      arrayToProcess.push(coords);
                    });
                  }
              })

              // Trail with Google Map
              // element.matchings.forEach (match => {
              //   if (match.legs && match.legs.length > 0) {
              //     match.legs.forEach(legs => {
              //       if (legs.steps && legs.steps.length > 0) {
              //         legs.steps.forEach(steps => {
              //           if (steps.intersections && steps.intersections.length > 0) {
              //             steps.intersections.forEach(intersection => {
              //               arrayToProcess.push(intersection);
              //             });
              //           }
              //         });
              //       }
              //     });
              //   }
              // })
            }

            if ((i + 1) === result.length) {
              const tempMarkersArr = [];
              const bounds = new google.maps.LatLngBounds();
              const startIcon = 'assets/images/iol/icon-map-pin-start.png';
              const endIcon = 'assets/images/iol/icon-map-pin-end.png';

              // Actual Start and End Points
              // const trailMarker1 = this.createDummyMarker(startIcon, locations[0].lat, locations[0].lng, info[0]);
              // const trailMarker2 = this.createDummyMarker(endIcon, locations[locations.length - 1].lat, locations[locations.length - 1].lng, info[1]);
              // Snapped Start and End Points with Google
              // const trailMarker1 = this.createDummyMarker(startIcon, this.snappedCoordinates[0].lat(), this.snappedCoordinates[0].lng(), info[0]);
              // const trailMarker2 = this.createDummyMarker(endIcon, this.snappedCoordinates[this.snappedCoordinates.length - 1].lat(), this.snappedCoordinates[this.snappedCoordinates.length - 1].lng(), info[1]);
              // Snapped Start and End Points with OSRM with GeoJSON
              const trailMarker1 = this.createDummyMarker(startIcon, arrayToProcess[0][1], arrayToProcess[0][0], info[0]);
              const trailMarker2 = this.createDummyMarker(endIcon, arrayToProcess[arrayToProcess.length - 1][1], arrayToProcess[arrayToProcess.length - 1][0], info[1]);

              // Snapped Start and End Points with OSRM with Polyline
              // const trailMarker1 = this.createDummyMarker(startIcon, arrayToProcess[0].location[1], arrayToProcess[0].location[0], info[0]);
              // const trailMarker2 = this.createDummyMarker(endIcon, arrayToProcess[arrayToProcess.length - 1].location[1], arrayToProcess[arrayToProcess.length - 1].location[0], info[1]);

              tempMarkersArr.push(trailMarker1, trailMarker2);
              trailMarker1.setMap(this.map);
              trailMarker2.setMap(this.map);
              this._markers.push(trailMarker1, trailMarker2);
              this.bounds.extend(trailMarker1.getPosition());
              this.bounds.extend(trailMarker2.getPosition());
              this.processSnapToRoadResponse(arrayToProcess);
              this.drawSnappedPolyline(zoom);
            }


          });
        }


      },
      err => {
        if (err && err.status != 200) {
          this.swalService.getWarningSwal("Unable to find snapped route, Please select another time period");
          // this.createTrail(locations, info, false);
        }
      });


      // return tempMarkersArr;
    }
    return this.snappedCoordinates;
  }



  sendSnapToRoadRequest(pathValues, locations, info, zoom = null) {
    if (pathValues && pathValues.length) {
      // let url = "https://roads.googleapis.com/v1/snapToRoads?path=" + pathValues.join('|') + "&interpolate=true&key=AIzaSyASI7bo-I7oh_xwVX_IoEHI7fawh3VqSuE";
      // let url = environment.sanpToRoadUrl + pathValues.join(';') + "?overview=full&geometries=polyline6&steps=true";
      let url = environment.sanpToRoadUrl + pathValues.join(';') + "?overview=full&geometries=geojson&radius=all:15";
      return this.httpCLient.get(url);
      // .subscribe(res => {
      //   this.totalSnapToRoadResponses += 1;
      //   this.processSnapToRoadResponse(res);
      //   if (this.totalSnapToRoadResponses === this.totalSnapToRoadCalls) {
      //     const tempMarkersArr = [];
      //     const bounds = new google.maps.LatLngBounds();
      //     const startIcon = 'assets/images/iol/icon-map-pin-start.png';
      //     const endIcon = 'assets/images/iol/icon-map-pin-end.png';
      //     const trailMarker1 = this.createDummyMarker(startIcon, locations[0].lat, locations[0].lng, info[0]);
      //     const trailMarker2 = this.createDummyMarker(endIcon, locations[locations.length - 1].lat, locations[locations.length - 1].lng, info[1]);
      //     // const trailMarker1 = this.createDummyMarker(startIcon, this.snappedCoordinates[0].lat(), this.snappedCoordinates[0].lng(), info[0]);
      //     // const trailMarker2 = this.createDummyMarker(endIcon, this.snappedCoordinates[this.snappedCoordinates.length - 1].lat(), this.snappedCoordinates[this.snappedCoordinates.length - 1].lng(), info[1]);
      //     tempMarkersArr.push(trailMarker1, trailMarker2);
      //     trailMarker1.setMap(this.map);
      //     trailMarker2.setMap(this.map);
      //     this._markers.push(trailMarker1, trailMarker2);
      //     this.bounds.extend(trailMarker1.getPosition());
      //     this.bounds.extend(trailMarker2.getPosition());
      //     this.drawSnappedPolyline(zoom);
      //   }
      // });
    }
  }


  // Store snapped polyline returned by the snap-to-road service.
  // Bkp function is for OSRM with GeoJSON
  processSnapToRoadResponse(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i] && data[i] && data[i].length > 0) {
        var latlng = new google.maps.LatLng(
          data[i][1],
          data[i][0]);
        this.snappedCoordinates.push(latlng);

        var formatted_latlng = {
          lat: data[i][1], lng: data[i][0]
        }

        this.snappedCoodinatesFormatted.push(formatted_latlng);
      }
    }

    this.osrmLatLng = this.snappedCoodinatesFormatted;
  }


  // with osrm polyline
  processSnapToRoadResponse1(data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i] && data[i].location && data[i].location.length > 0) {
        var latlng = new google.maps.LatLng(
          data[i].location[1],
          data[i].location[0]);
        this.snappedCoordinates.push(latlng);

        var formatted_latlng = {
          lat: data[i].location[1], lng: data[i].location[0]
        }

        this.snappedCoodinatesFormatted.push(formatted_latlng);
      }
    }

    this.osrmLatLng = this.snappedCoodinatesFormatted;
  }

  // Draws the snapped polyline (after processing snap-to-road response).
  drawSnappedPolyline(zoom = null) {
    // console.log(this.snappedCoordinates);
    this.snappedPolyline = new google.maps.Polyline({
      path: this.snappedCoordinates,
      fillColor: '#46be8a',
      fillOpacity: 0.8,
      scale: 3,
      strokeColor: '#36ab7a',
      strokeWeight: 3
    });
    this.snappedPolyline.setMap(this.map);
    // if (zoom) {
    //   this.snappedPolyline.setZoom(zoom);
    // }
    this.totalSnapToRoadResponses = 0;
    this.totalSnapToRoadCalls = 0;
    const bounds = new google.maps.LatLngBounds();

    // this.snappedPolyline.getPath().forEach(function (element, index) {
    //   const obj = { lat: null, lng: null };
    //   bounds.extend(element);
    // });

    // this.map.fitBounds(bounds);

  }


  createDummyMarker(url, startPos, endPos?, info?) {
    const icon = this.createIcon(url);
    const marker = new google.maps.Marker({
      position: endPos ? new google.maps.LatLng(startPos, endPos) : startPos,
      icon: icon,
      anchor: new google.maps.Point(13, 41)
    });

    marker.addListener('mouseover', event => {
      this.myInfowindow.setContent((info));
      this.myInfowindow.open(this.map, marker);
    });

    marker.addListener('mouseout', event => {
      this.myInfowindow.close();
    });

    marker.setMap(this.map);
    this._markers.push(marker);
    this.bounds.extend(marker.getPosition());
    this.map.fitBounds(this.bounds);
    return marker;
  }

  createIcon(url, height = 50, width = 50) {
    let icon;
    if (this.playBack) {
      icon = {
        url: url,
        scaledSize: new google.maps.Size(width, height), // scaled size
        anchor: new google.maps.Point(23, 30)
      };
    } else {
      icon = {
        url: url,
        scaledSize: new google.maps.Size(width, height) // scaled size
      };
    }
    return icon;
  }

  createDummyMarkers(locations, info, iconUrl?, size = 50, zoom = 15) {
    this.resetMap();
    const bounds = new google.maps.LatLngBounds();
    let position;
    const infowindow = new google.maps.InfoWindow();

    // for (let i = 0; i < locations.length; i++) {
    //   if (typeof (locations[i]) === 'string') {
    //     position = this.getLatLngFromString(locations[i]);
    //   } else {
    //     position = locations[i];
    //   }
    // }

    for (let i = 0; i < locations.length; i++) {
      const icon = {
        scaledSize: new google.maps.Size(size, size), // scaled size
      };
      let marker;

      // if (icon.url) {
      //   marker = new google.maps.Marker({
      //     position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
      //   });
      // } else {
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude)
        });
      // }
      // let iw = this.createDummyInfoWindow(info[i]);
      marker.addListener('mouseover', event => {
        infowindow.setContent(this.createDummyInfoWindow(info[i]));
        infowindow.open(this.map, marker);
      });

      marker.addListener('mouseout', event => {
        infowindow.close();
      });

      this._markers.push(marker);
      marker.setMap(this.map);
      bounds.extend(marker.getPosition());
    }
    if (locations.length) {
      this.map.fitBounds(bounds);
      if (locations.length < 3) {
        this.map.setZoom(10);
      }
    }

    if (zoom) {
      this.map.setZoom(zoom);
    }

  }

  zoomToMarker(latLngObj, zoomLevel = 18) {
    let latlng;
    if (typeof (latLngObj) === 'string') {
      latlng = this.getLatLngFromString(latLngObj);
    } else {
      latlng = new google.maps.LatLng(latLngObj.lat, latLngObj.long);
    }
    this.map.setZoom(zoomLevel);
    this.map.panTo(latlng);
  }

  unZoomMarker(zoomlevel = 12) {
    this.map.fitBounds(this.bounds);
    this.map.setZoom(zoomlevel);
  }

  getZoomLevel() {
    return this.map.getZoom();
  }

  createDummyInfoWindow(infowindowArr) {
    let info = '';
    const array = infowindowArr;
    for (let i = 0; i < array.length; i++) {
      info += '<p><b>' + array[i].key + ': ' + '</b>' + array[i].value + '</p>';
    }
    return info;
  }

  resetMap() {
    if (!isNullOrUndefined(this._markers) && this._markers.length) {
      if (!isNullOrUndefined(this.markerCluster)) {
        this.markerCluster.clearMarkers();
        this.markerCluster.removeMarkers(this._markers);
        // this.markerCluster = new MarkerClusterer(this.map, []);
      }

      for (let i = 0; i < this._markers.length; i++) {
        this._markers[i].setMap(null);
      }
      this._markers = [];

      this.shapes = {};
      this.bounds = new google.maps.LatLngBounds();
    }
    this.map.setCenter({ lat: 25.3548, lng: 51.1839 });
    this.map.setZoom(9);

    if (this.snappedPolyline) {
      this.snappedPolyline.setMap(null);
    }

    if (this.circleShape) {
      this.circleShape.setMap(null);
    }

    this._directionsDisplay.setMap(null);
    this._polyline.setMap(null);
    this._directionsDisplay = new google.maps.DirectionsRenderer();
    this._polyline = new google.maps.Polyline();
  }

  getLatLngFromString(ll) {
    const latlng = ll.split(/, ?/);
    // console.log(ll);
    const loc = new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
    // console.log('Google loc:'+ loc.lat()+','+loc.lng());
    return new google.maps.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1]));
  }

  createRoute(directionsService, directionsDisplay, start, end, waypoints?) {
    let center;
    const bounds = new google.maps.LatLngBounds();
    if (typeof (start) === 'string') {
      start = this.getLatLngFromString(start);
    }
    if (typeof (end) === 'string') {
      end = this.getLatLngFromString(end);
    }
    directionsDisplay.setMap(this.map);
    directionsService.route({
      origin: start,
      destination: end,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        center = directionsDisplay.getDirections().routes[0].bounds.getCenter();

      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
    this.map.setCenter(center);
    bounds.extend(start);
    bounds.extend(end);
    this.map.fitBounds(bounds);
    // this._markers.push(directionsDisplay);
    this._directionsDisplay = directionsDisplay;
    if (this.map.getZoom() < 16) {
      this.map.setZoom(7);
    }

  }

  legs;
  routePath;

  createRouteWithMultipleWaypoints(directionsService, directionsDisplay, start, end, ref: any, waypoints?) {
    let center;
    const bounds = new google.maps.LatLngBounds();
    let waypoints_order;
    if (typeof (start) === 'string') {
      start = this.getLatLngFromString(start);
    }
    if (typeof (end) === 'string') {
      end = this.getLatLngFromString(end);
    }
    // if (!isNullOrUndefined(ref)) {
    //   this.createMarker(start, null, ref.Icons[ref.getTrucksIcons()], 'Starting Point', 'mouseover');
    // }
    // if (!isNullOrUndefined(ref)) {
    //   this.createMarker(end, null, 'assets/images/iol/icon-map-dump.png', 'Ending Point', 'mouseover');
    // }
    directionsDisplay.setMap(this.map);
    directionsService.route({
      origin: start,
      destination: end,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        waypoints_order = response.routes[0].waypoint_order;
        this.routePath = response.routes[0].overview_polyline;
        this.legs = response.routes[0].legs;
        // if (!isNullOrUndefined(ref)) {
        //   ref.setWaypoints(waypoints_order);
        // }
        this.waypoints_order = waypoints_order;
        center = directionsDisplay.getDirections().routes[0].bounds.getCenter();
      } else {
        // window.alert('Directions request failed due to ' + status);
        // if (!isNullOrUndefined(ref)) {
        //   ref.setWaypoints(waypoints_order);
        // }
        this.waypoints_order = waypoints_order;
      }
    });
    // bounds.extend(start);
    // bounds.extend(end);
    this.bounds.extend(start);
    this.bounds.extend(end);
    this.map.fitBounds(this.bounds);
    // this._markers.push(directionsDisplay);
    this._directionsDisplay = directionsDisplay;
    // console.log('this.waypoints_order', this.waypoints_order);
    return this.waypoints_order;

  }

  waypoints_order = [];

  lala(way_pts?) {
    if (way_pts) {
      this.waypoints_order = way_pts;
    } else {
      return this.waypoints_order;
    }
  }

  setCenter(position) {
    this.map.setCenter(position);
  }

  drawTerritory(cords, title?, opts?, height = 250) {
    const bounds = this.bounds;
    const arr = [];
    if (cords.radius) {
      const bounds = new google.maps.LatLngBounds();
      const obj = cords;

      // this.mapZone.setCenter(new google.maps.LatLng(obj.lat, obj.lng));
      let circleShape = new google.maps.Circle({
        paths: obj,
        strokeColor: "#000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#000",
        fillOpacity: 0.35,
        center: new google.maps.LatLng(obj.lat, obj.lng),
        radius: obj.radius
      });

      circleShape.setMap(this.map);

      if (title) {
        circleShape.addListener('click', event => {
          circleShape.setOptions({ fillColor: '#0000ff' });
          this.myInfowindow.setContent('Zone Name: ' + title);
          this.myInfowindow.setPosition(event.latLng);
          this.myInfowindow.open(this.map);
        });
        this.shapes[title] = circleShape;
        circleShape.addListener('mousemove', event => {
          this.myInfowindow.close();
          circleShape.setOptions({ fillColor: '#7799b3' });

        });

      }

      this.circleShape = circleShape;

      this._markers.push(circleShape);


      this.map.setCenter(new google.maps.LatLng(obj.lat, obj.lng));
      // this.map.setZoom(12);

    } else {
      let cordsArray = [];
      cordsArray = cordsArray.concat(cords);
      // if (title) {
      //   this.dict_map['infoWinObj'] = 'Territory Name: ' + title;
      //   this.dict_map['markerObj'] = null;
      // }
      for (let i = 0; i < cordsArray.length; i++) {
        const polygonShape = new google.maps.Polygon({
          paths: cordsArray,
        });
        if (opts) {
          polygonShape.setOptions(({strokeWeight: 1, strokeColor: opts[i].strokeColor, fillColor: opts[i].fillColor }));
        } else {
          polygonShape.setOptions(({strokeWeight: 1, strokeColor: '#000', fillColor: '#7799b3' }));
        }
        // polygonShape.setOptions(({ strokeColor: '#9999ff', fillColor: '#7799b3'}));

        polygonShape.setMap(this.map);
        polygonShape.getPath().forEach(function (element, index) {
          const obj = { lat: null, lng: null };
          bounds.extend(element);
          obj.lat = element.lat();
          obj.lng = element.lng();
          arr.push(obj);

        });

        if (title) {
          polygonShape.addListener('click', event => {
            polygonShape.setOptions({ fillColor: '#0000ff' });
            this.myInfowindow.setContent('Zone Name: ' + title);
            this.myInfowindow.setPosition(event.latLng);
            this.myInfowindow.open(this.map);
          });

        //push JSON dict in array
        // this.allInfoWindows.push(this.dict_map);
          // this.shapes[title.id[i]] = polygonShape;
          polygonShape.addListener('mouseout', event => {
            this.myInfowindow.close();
            polygonShape.setOptions({ fillColor: opts ? opts[i].fillColor : '#7799b3' });

          });

        }

        this._markers.push(polygonShape);
      }
      //
      this.map.fitBounds(bounds);
      const z = this.getBoundsZoomLevel(bounds, { height: height, width: 390 });
      this.map.setZoom(z);
      this.map.setCenter(bounds.getCenter());
      if (cordsArray.length === 1) {
        return this._markers[0];
      }
    }




  }

  shapes = {};

  removeTerritory(key) {
    const bounds = new google.maps.LatLngBounds();
    if (!isNullOrUndefined(key)) {
      this.shapes[key].setMap(null);
      delete this.shapes[key];
      const keys = Object.keys(this.shapes);
      for (let i = 0; i < keys.length; i++) {
        this.shapes[keys[i]].getPath().forEach(function (element, index) {
          bounds.extend(element);
        });
      }
      this.map.fitBounds(bounds);
      // let z = this.getBoundsZoomLevel(bounds,{height: 250, width: 390});
      // this.map.setZoom(z);
      this.map.setCenter(bounds.getCenter());
    } else {
      const keys = Object.keys(this.shapes);
      for (let i = 0; i < keys.length; i++) {
        this.shapes[keys[i]].setMap(null);
      }
      this.resetMap();
    }
  }

  getBoundsZoomLevel(bounds, mapDim) {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    function latRad(lat) {
      const sin = Math.sin(lat * Math.PI / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    const lngDiff = ne.lng() - sw.lng();
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  }

  openInfoWindow(marker) {
    google.maps.event.trigger(marker, 'mouseover');
  }

  closeInfoWindow(marker) {
    google.maps.event.trigger(marker, 'mouseout');
  }

  updateInfoWindowContent(info) {
    this.infowindow.setContent(info);
  }

  createInfoWindow(marker, info, actionType = 'mouseover') {
    const infowindow = new google.maps.InfoWindow();
    marker.addListener(actionType, event => {
      infowindow.setContent((info));
      infowindow.open(this.map, marker);
    });
    if (actionType === 'mouseover') {
      marker.addListener('mouseout', event => {
        infowindow.close();
      });
    }

    this.infowindow = infowindow;
    return infowindow;

  }

  markerCluster;

  createCluster(positions, info, iconUrl, binsId?, enableClickEvent = false) {
    let position;
    for (let i = 0; i < positions.length; i++) {
      if (typeof (positions[i]) === 'string') {
        position = this.getLatLngFromString(positions[i]);
      } else {
        position = positions[i];
      }
      let marker;
      if (isNullOrUndefined(binsId)) {
        marker = new google.maps.Marker({
          position: position,

        });
      } else {
        marker = new google.maps.Marker({
          position: position,
          customInfo: binsId[i],
        });
      }
      this.bounds.extend(marker.getPosition());
      marker.addListener('mouseover', event => {
        this.myInfowindow.setContent((info[i]));
        this.myInfowindow.open(this.map, marker);
      });


      marker.addListener('mouseout', event => {
        this.myInfowindow.close();
      });

      this._markers.push(marker);
      if (iconUrl) {
        if (typeof iconUrl === 'string') {
          const icon = this.createIcon(iconUrl);
          marker.setIcon(icon);
        } else {
          if (iconUrl[i]) {
            const icon = this.createIcon(iconUrl[i]);
            marker.setIcon(icon);
          } else {
            marker.setIcon(null);
          }
        }
      } else {
        marker.setIcon(null);
      }
    }

    this.markerCluster = new MarkerClusterer(this.map, this._markers,
      {
        imagePath: 'assets/images/iol/m',
        maxZoom: 17
      });
    this.map.fitBounds(this.bounds);

    return this.markerCluster;
  }


  createPolyLine() {
    const polyline = new google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: '#e9595b',
      strokeOpacity: 1.0,
      strokeWeight: 4
    });

    polyline.setMap(this.map);
    return polyline;

  }

  @ViewChild('totalimage') totalimage;

  private convertToImage() {
    // html2canvas($('#totalimage'), {
    //   useCORS: true,
    //   onrendered: function(canvas) {
    //     // console.log(canvas.toDataURL("image/png"));
    //     $('#img_val').val(canvas.toDataURL('image/png'));
    //     $('#show_img').append(canvas);
    //   }
    // });
    // const transform = $('.gm-style>div:first>div').css('transform');
    // const comp = transform.split(','); //split up the transform matrix
    // const mapleft = parseFloat(comp[4]); //get left value
    // const maptop = parseFloat(comp[5]);  //get top value
    // $('.gm-style>div:first>div').css({ //get the map container. not sure if stable
    //   'transform': 'none',
    //   'left': mapleft,
    //   'top': maptop,
    //  });
    // html2canvas(document.getElementById("totalimage"),
    //   {
    //     useCORS: true,
    //     onrendered: function(canvas)
    //     {
    //       var dataUrl= canvas.toDataURL('image/png');
    //       location.href=dataUrl //for testing I never get window.open to work
    //       $(".gm-style>div:first>div").css({
    //         left:0,
    //         top:0,
    //         "transform":transform
    //       })
    //     }
    //   });
    // html2canvas(document.getElementById('map'), {useCORS: true}).then((canvas) => {
    //   const img = canvas.toDataURL('image/png');
    //   console.log(img);
    //   const im = $('#imgMap');
    //   console.log(im);
    //   im.append(canvas);
    // });


    // const self = this;
    // html2canvas($("#totalimage"), {
    //   useCORS: true,
    //   onrendered: function(canvas) {
    //     // console.log(canvas.toDataURL("image/png"));
    //     $('#img_val').val(canvas.toDataURL("image/png"))
    //     $("#show_img").append(canvas);
    //   }
    // });
  }

  export() {
    const obj = {
      'assets/images/iol/activity/default.png': 'red',
    };
    const obj2 = {
      'assets/images/iol/activity/Started.png': 'blue',
      'assets/images/iol/activity/Completed.png': 'green',
      'assets/images/iol/activity/Resumed.png': 'purple',
      'assets/images/iol/activity/Reviewed.png': 'grey',
    };
    const obj3 = {
      'assets/images/iol/activity/icon-map-bin-8cbm-waste.png': 'assets/images/iol/activity/icon-map-bin-8cbm-waste.png',
    };
    const obj4 = {
      'assets/images/iol/activity/icon-map-bin-8cbm.png': 'assets/images/iol/activity/icon-map-bin-8cbm.png',
    };

    /*URL of Google Static Maps.*/
    let staticMapUrl = 'http://maps.googleapis.com/maps/api/staticmap';

    /*Set the Google Map Center.*/
    staticMapUrl += '?center=' + this.map.getCenter().lat() + ',' + this.map.getCenter().lng();

    /*Set the Google Map Size.*/
    staticMapUrl += '&size=600x600';

    /*Set the Google Map Zoom.*/
    // staticMapUrl += '&zoom=' + (this.map.getZoom());

    /*Set the Google Map Type.*/
    staticMapUrl += '&maptype=' + this.map.getMapTypeId();

    let defaultMarkers = '&markers=color:red';
    let _8cbmBinWasteMarker = '&markers=icon:' + AppConfig.FRONTEND_URL + 'assets/images/iol/activity/icon-map-bin-8cbm-waste.png';
    let _8cbmBinMarker = '&markers=icon:' + AppConfig.FRONTEND_URL + 'assets/images/iol/activity/icon-map-bin-8cbm.png';

    /*Loop and add Markers.*/
    for (let i = 0; i < this._markers.length; i++) {
      const markerIcon = this._markers[i].getIcon();

      if (!isNullOrUndefined(markerIcon)) {
        const markerIconURL = markerIcon.url;
        let icon;

        if (Object.keys(obj).indexOf(markerIconURL) > -1) {
          defaultMarkers += '|' + this._markers[i].getPosition().lat() + ',' + this._markers[i].getPosition().lng();
        } else if (Object.keys(obj3).indexOf(markerIconURL) > -1) {
          _8cbmBinWasteMarker += '|' + this._markers[i].getPosition().lat() + ',' + this._markers[i].getPosition().lng();
        } else if (Object.keys(obj4).indexOf(markerIconURL) > -1) {
          _8cbmBinMarker += '|' + this._markers[i].getPosition().lat() + ',' + this._markers[i].getPosition().lng();
        } else if (Object.keys(obj2).indexOf(markerIconURL) > -1) {
          icon = obj2[markerIconURL];
          staticMapUrl += '&markers=color:' + icon + '|' + this._markers[i].getPosition().lat() + ',' + this._markers[i].getPosition().lng();
        } else {
          icon = AppConfig.FRONTEND_URL + markerIconURL;
          staticMapUrl += '&markers=icon:' + icon + '|' + this._markers[i].getPosition().lat() + ',' + this._markers[i].getPosition().lng();
        }
      } else if (!isNullOrUndefined(this._markers[i].label)) {
        staticMapUrl += '&markers=color:blue|label:' + this._markers[i].label + '|' + this._markers[i].getPosition().lat() + ',' + this._markers[i].getPosition().lng();
      } else {
        staticMapUrl += '&markers=' + this._markers[i].getPosition().lat() + ',' + this._markers[i].getPosition().lng();
      }
    }
    // staticMapUrl += defaultMarkers;
    // staticMapUrl += _8cbmBinMarker;
    // staticMapUrl += _8cbmBinWasteMarker;
    //
    if (this.routePath) {
      staticMapUrl += '&path=weight:4%7Ccolor:blue%7Cenc:' + this.routePath;
    }
    staticMapUrl += '&key=' + 'AIzaSyASI7bo-I7oh_xwVX_IoEHI7fawh3VqSuE';


    const imgMap = document.getElementById('imgMap');
    // imgMap.src = staticMapUrl;
    this.imageUrl = (staticMapUrl);
    this.imageUrlGenerated.emit(this.imageUrl);
    return this.imageUrl;
    // this.getImageFromService(staticMapUrl);

  }

  private getImage(id: string): Observable<Blob> {
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.httpCLient.get(id, { responseType: 'blob', headers: myHeaders });
  }

  private getImageFromService(yourImageUrl) {
    this.getImage(yourImageUrl).subscribe(data => {
      // this.createImageFromBlob(data);
    }, error => {
      console.log(error);
    });
  }

  private createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  getPositonInCircle(centerPt, angle) {
    const loc = google.maps.geometry.spherical.computeOffset(centerPt, 1, angle);
    // console.log(loc+"loc");
    return loc;
  }

  LatLngObj(lat, lng) {
    const points = new google.maps.LatLng(lat, lng);
    return points;
  }

  getMap() {
    return this.map;
  }

  animatedMoveQ(marker, t, current, moveto, zoomLevel) {
    if (current != undefined && moveto != undefined) {
      const deltalat = (moveto.lat - current.lat) / 100;
      const deltalng = (moveto.lng - current.lng) / 100;
      const delay = .5 * t;
      const map = this.map;
      let lat = marker.getPosition().lat;
      let lng = marker.getPosition().lng;
      lat += deltalat;
      lng += deltalng;
      const latlng = new google.maps.LatLng(moveto.lat, moveto.lng);
      // let infoArr = [current.timestamp];
      // let info = this.createInfowindowTemplate(infoArr, current.title);
      // this.updateInfoWindowContent(info);
      // this.map.setZoom(zoomLevel);
      let point1 = new google.maps.LatLng(current.lat, current.lng);
      // console.log(current,moveto)
      let heading = google.maps.geometry.spherical.computeHeading(point1,latlng);
      // console.log(heading)
      marker.rotation = heading;
      if (marker.rotation != 0) {
        marker.setPosition(latlng);
        $('img[src="assets/images/iol/sedan.svg#markerOne"]').css({
          'transform': 'rotate('+heading+'deg)'
        });
      }
      // this.map.setCenter(latlng);
    }
  }

  animatedMove(marker, t, current, moveto, zoomLevel) {
    if (current != undefined && moveto != undefined) {
      const deltalat = (moveto.lat - current.lat) / 100;
      const deltalng = (moveto.lng - current.lng) / 100;
      const delay = .5 * t;
      const map = this.map;
      let lat = marker.getPosition().lat;
      let lng = marker.getPosition().lng;
      lat += deltalat;
      lng += deltalng;
      const latlng = new google.maps.LatLng(moveto.lat, moveto.lng);
      let infoArr = [current.timestamp];
      let info = this.createInfowindowTemplate(infoArr, current.title);
      this.updateInfoWindowContent(info);
      this.map.setZoom(zoomLevel);
      marker.setPosition(latlng);
      this.map.setCenter(latlng);
    }
  }

  animateMarker(arrayOfLatLng, newPos, iconUrl, zoomLevel = 15) {
    const marker = this.createMarker(newPos, null, iconUrl);
    const flightPath = new google.maps.Polyline({
      path: arrayOfLatLng,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    flightPath.setMap(this.map);
    for (let i = 0; i < arrayOfLatLng.length - 1; i++) {
      this.animatedMove(marker, 100000, arrayOfLatLng[i], arrayOfLatLng[i + 1], zoomLevel);

    }
  }

  handle;

  numDeltas = 100;
  delay = 1; // milliseconds
  i = 0;
  deltaLat;
  deltaLng;

  poly;
  _oldLatLng;
  marker;
  array;
  current_ind;

  animateMarkerWithoutPolylines(arrayOfLatLng, newPos, iconUrl, speed, zoomLevel = 15) {
    // console.log(this.snappedCoodinatesFormatted);
    //arrayOfLatLng = this.snappedCoodinatesFormatted;
    clearInterval(this.handle);
    if (this.marker != undefined)
      this.marker.setMap(null);

    this.playBack = true;
    this.marker = this.createMarker(newPos, null, iconUrl);

    arrayOfLatLng = this.osrmLatLng;

    // Play with snapped data
    if (arrayOfLatLng[0] != undefined) {
      //  let infoArr = [arrayOfLatLng[0].timestamp];
      //  let info = this.createInfowindowTemplate(infoArr, arrayOfLatLng[0].title);
      //  this.createInfoWindow(this.marker, info);

      let i = 0;

      this.handle = setInterval(() => {
        // let infoArr = [arrayOfLatLng[i].timestamp];
        // let info = this.createInfowindowTemplate(infoArr, arrayOfLatLng[0].title);
        // this.updateInfoWindowContent(info);
        this.animatedMoveQ(this.marker, 1000, arrayOfLatLng[i], arrayOfLatLng[i + 1], zoomLevel);
        this.array = arrayOfLatLng;
        this.current_ind = i;
        i++;
        if (arrayOfLatLng[i + 1] == undefined) {
          clearInterval(this.handle);
        }
      }, speed);
    }

    // Play with real data
    // if (arrayOfLatLng[0] != undefined) {
    //    let infoArr = [arrayOfLatLng[0].timestamp];
    //    let info = this.createInfowindowTemplate(infoArr, arrayOfLatLng[0].title);
    //    this.createInfoWindow(this.marker, info);

    //   let i = 0;

    //   this.handle = setInterval(() => {
    //     let infoArr = [arrayOfLatLng[i].timestamp];
    //     let info = this.createInfowindowTemplate(infoArr, arrayOfLatLng[0].title);
    //     this.updateInfoWindowContent(info);
    //     this.animatedMoveQ(this.marker, 1000, arrayOfLatLng[i], arrayOfLatLng[i + 1], zoomLevel);
    //     this.array = arrayOfLatLng;
    //     this.current_ind = i;
    //     i++;
    //     if (arrayOfLatLng[i + 1] == undefined) {
    //       clearInterval(this.handle);
    //     }
    //   }, speed);
    // }
  }



  resumeAnimation(zoomLevel = 15, speed) {
    this.handle = setInterval(() => {
      this.animatedMoveQ(this.marker, 1000, this.array[this.current_ind], this.array[this.current_ind + 1], zoomLevel);
      this.current_ind++;
      if (this.array[this.current_ind + 1] == undefined) {
        clearInterval(this.handle);
      }
    }, speed);
  }

  stopAnimation() {
    clearInterval(this.handle);
  }

  // pauseAnimation() {
  //   clearInterval(this.handle);
  //   this.marker.setMap(null);
  // }

  iterateThroughArray(arrayOfLatLng) {
    this._oldLatLng = arrayOfLatLng[0];
    this.marker = this.createMarker(this._oldLatLng);
    this.poly = new google.maps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: '#08b',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    for (let i = 0; i < arrayOfLatLng.length - 1; i++) {
      this.transition(arrayOfLatLng[i + 1]);
    }

  }

  transition(_newLatLng) {
    this.i = 0;
    if (isNullOrUndefined(this._oldLatLng)) {
      this._oldLatLng = [0, 0];
    }
    this.deltaLat = (_newLatLng[0] - this._oldLatLng.lat) / this.numDeltas;
    this.deltaLng = (_newLatLng[1] - this._oldLatLng.lng) / this.numDeltas;
    this.moveMarker();
  }

  private moveMarker() {
    let path;
    if (isNaN(this.deltaLat) || isNaN(this.deltaLng)) {
      this._oldLatLng.lat = this._oldLatLng.lat;
      this._oldLatLng.lng = this._oldLatLng.lng;
    } else {
      this._oldLatLng.lat += this.deltaLat;
      this._oldLatLng.lng += this.deltaLng;
    }
    const latlng = new google.maps.LatLng(this._oldLatLng.lat, this._oldLatLng.lng);
    if (!isNullOrUndefined(latlng) && !isNullOrUndefined(this.marker)) {
      // if (this.signalRstarted > 1) {
      path = this.poly.getPath();
      path.push(new google.maps.LatLng(latlng.lat(), latlng.lng()));
      this.poly.setPath(path);
      this.poly.setMap(this.map);
      // }
      this.marker.setPosition(latlng);

      this.map.setCenter(this.marker.position);
    }
    if (this.i !== this.numDeltas) {
      this.i++;
      setTimeout(() => {
        this.moveMarker();
      }, this.delay);
    }
  }


  createInfowindowTemplate(msg, title?) {
    // InfoWindow content
    let content = `<div id="iw-container"> <div class="iw-content">`;
    if (title) {
      content += '<div  class="iw-title">' + title + '</div>';
    }

    content += '<div class="padding-5"><span class="iw-subTitle">' + 'Timestamp:' + '</span> <span>' + DateUtils.getLocalMMDDYYYYhhmmssA(msg[0]) + '</span></div>';
    // content += '<div class="padding-5"><span class="iw-subTitle">' + 'Speed:' + '</span> <span>' + (msg[1]) + '</span></div>';
    return content;
  }


  calculateDistance(origin, destinations = []) {
    // console.log('origin', origin, 'destination', destinations);


    const sortedArray = destinations.sort((prev, cur) => {
      if (prev && cur) {
        const prev_pos = google.maps.geometry.spherical.computeDistanceBetween(this.getLatLngFromString(prev.location), this.getLatLngFromString(origin));
        const cur_pos = google.maps.geometry.spherical.computeDistanceBetween(this.getLatLngFromString(cur.location), this.getLatLngFromString(origin));
        // return prev_pos < cur_pos ? -1 : 1;
        if (prev_pos < cur_pos) {
          return -1;
        } else if (prev_pos > cur_pos) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return -1;
      }
    });

    // console.log('sortedArray', sortedArray);
    return sortedArray;
    // const service = new google.maps.DistanceMatrixService();
    // service.getDistanceMatrix(
    //   {
    //     origins: origin,
    //     destinations: destinations,
    //     travelMode: 'DRIVING',
    //   }, callback);
    //
    // function callback(response, status) {
    //   console.log(response, status);
    //   // See Parsing the Results for
    //   // the basics of a callback function.
    // }
  }

  trafficLayer () {
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(this.map);
  }

  // displayAllInfoWindows () {
  //   for (var i=0;i<this.allInfoWindows.length;i++) {
  //     if (this.allInfoWindows[i]['markerObj']){
  //       this.allInfoWindows[i]['infoWinObj'].open(this.map, this.allInfoWindows[i]['markerObj']);
  //     } else {
  //       this.allInfoWindows[i]['infoWinObj'].open(this.map);
  //     }
  //   }
  // }


  // copied from quickview component


  generateMapView(i?, trucks?, location?) {
    this.resetMap();
    if (location) {
      this.poiLocations = location;
    }
    if (trucks) {
      this.trucks = trucks;
    }
    const colors = Colors.getColors();
    let colorIndex = -1;
    if (i || i === 0) {
      const newPos = new google.maps.LatLng(this.poiLocations[i].latitude, this.poiLocations[i].longitude);
      this.updateInfoWindow(i);
      if (this.signalRstarted[i] > 1 && trucks[i].signalRresponse['spd'] > 5) {
        // this.markers[this.locations[i].entity_id].setMap(null);
        this.markers[this.poiLocations[i].entity_id].setPosition(newPos);
        const path = this.poly[i].getPath();
        this.markers[this.poiLocations[i].entity_id].setMap(null);
        //Hardcode angle set
        const marker = this.createMarkersPoi(newPos, i, 20);
        this.markers[this.poiLocations[i].entity_id] = marker;
        path.push(newPos);
        this.poly[i].setPath(path);
        this.poly[i].setMap(this.map);
      }
    } else {
      this.trafficLayer();
      for (let j = 0; j < this.poiLocations.length; j++) {
        if (this.poiLocations[j].entity_id && this.poiLocations[j].latitude && this.poiLocations[j].longitude) {
          const newPos = new google.maps.LatLng(this.poiLocations[j].latitude, this.poiLocations[j].longitude);
          this.updateInfoWindow(j);
          const marker = this.createMarkersPoi(newPos, j);
          this.markers[this.poiLocations[j].entity_id] = marker;
          this.bounds.extend(marker.getPosition());
          const poly = new google.maps.Polyline({
            map: this.map,
            strokeColor: colors[j],
          });
          poly.setPath([newPos]);
          if (this.poly) {
            this.poly[j] = poly;
          }
          this.map.fitBounds(this.bounds);
        }
      }
    }
  }

  updateLocation(i, signalRresponse, oldLatLng, trucks, checkDistance = true, signalRstarted?) {
    this.signalRstarted = signalRstarted;
    const newLatLng = new google.maps.LatLng(signalRresponse.lat, signalRresponse.lon);
    const differenceInDistance = (google.maps.geometry.spherical.computeDistanceBetween(newLatLng, oldLatLng));
    const tooLongOrtooShortDistance = 50 < differenceInDistance && differenceInDistance < 200000;
    if (checkDistance) {
      if (tooLongOrtooShortDistance || isNaN(differenceInDistance)) {
        this.poiLocations[i].last_longitude = this.poiLocations[i].longitude;
        this.poiLocations[i].last_latitude = this.poiLocations[i].latitude;
        this.poiLocations[i].latitude = this.poiLocations[i].signalRresponse.lat;
        this.poiLocations[i].longitude = this.trucks[i].signalRresponse.lon;
        this.generateMapView(i, trucks);
      }
    }

    this.poiLocations[i].infoList = [
      new Item('Name', this.trucks[i].name),
      new Item('Status', this.trucks[i].online_status),
      new Item('Speed', ((this.trucks[i].signalRresponse.spd > 5 && tooLongOrtooShortDistance) ? Math.round(this.trucks[i].signalRresponse.spd) : ((this.trucks[i].signalRresponse.spd && !signalRresponse.lat && !signalRresponse.lon) ? Math.round(this.trucks[i].signalRresponse.spd) : 0)) + ' km/h'),
      // new Item('Fuel', (this.trucks[i].signalRresponse.vol ? (this.trucks[i].signalRresponse.vol).toFixed(2) : 0) + ' gal'),
      // new Item('Temperature', ((this.trucks[i].signalRresponse.temp) ? this.trucks[i].signalRresponse.temp : 0) + ' °C'),
      // new Item('Net Weight', this.trucks[i].signalRresponse.nw + ' kg'),
      new Item('Truck Type', this.trucks[i]['vehicle_type']),
      new Item('Last Updated', DateUtils.getMMDDYYYYhhmmssA(this.trucks[i].signalRresponse.t)),
      new Item('Locations', (trucks[i]['location_address'] ? trucks[i]['location_address'] : '-'))
    ];
    this.updateInfoWindow(i);
  }

  createMarkersPoi(pos, i?, angle = 0) {
    let truckIcon = {
      url: this.trucks[i]['marker'],
      scaledSize: new google.maps.Size(50, 50), // scaled size
      anchor: new google.maps.Point(25, 40), // anchor
      rotation: angle
    };

    let info = '';
    let iValue = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
      '<tbody>';
    this.poiLocations[i].infoList.forEach((e) => {
      info += '<p><b>' + e.key + '</b> :' + e.value + '</p>';
      const key = e.key;
      let value = e.value;
      if (key != 'Name' && key != 'Status') {
        iValue += `<tr>
          <th> ${key} </th>
        <td class="text-left">${value}</td>
        </tr>`;
      } else if (key == 'Name') {
        iValue += `<thead> <tr> <th colspan=2>${value}`;
      } else if (key == 'Status') {
        let clas = null;
        if (value) {
          clas = 'label-success';
          value = 'Online';
        } else {
          clas = 'label-danger';
          value = 'Offline';
        }
        iValue += `&nbsp;<span ><span  class="label margin-top-3 ${clas} pull-right">${value}</span></span></th></tr></thead>`;
      }
    });
    iValue += '</tbody> </table>';
    const infowindow = new google.maps.InfoWindow({
      content: iValue
    });
    this.infoWindows[this.poiLocations[i].entity_id] = infowindow;

    const marker = new google.maps.Marker({
      position: pos,
      map: this.map,
      icon: truckIcon
    });

    //marker.addListener('mouseover', function () {
    //  infowindow.open(marker.map, this);
    //});
    //marker.addListener('mouseout', function () {
    //  infowindow.close();
    //});

    return marker;
  }


  updateInfoWindow(i) {
    let info = '';
    let iValue = '<table class="table font-size-12 no-border margin-bottom-0 table-sm">' +
      '<tbody>';
    this.poiLocations[i].infoList.forEach((e) => {
      info += '<p><b>' + e.key + '</b> :' + e.value + '</p>';
      const key = e.key;
      let value: string;
      value = e.value;

      // tslint:disable-next-line:triple-equals
      if (key != 'Name' && key != 'Status') {
        iValue += `<tr>
          <th> ${key} </th>
        <td class="text-left">${value}</td>
        </tr>`;
      } else if (key == 'Name') {
        iValue += `<thead> <tr> <th colspan=2>${value}`;
      } else if (key == 'Status') {
        let clas = null;
        if (value) {
          clas = 'label-success';
          value = 'Online';
        } else {
          clas = 'label-danger';
          value = 'Offline';
        }
        iValue += `&nbsp;<span ><span  class="label margin-top-3 ${clas} pull-right">${(value ? value : '-')}</span></span></th></tr></thead>`;
      }

    });
    iValue += '</tbody> </table>';
    if (this.infoWindows[this.poiLocations[i].entity_id]) {
      this.infoWindows[this.poiLocations[i].entity_id].setContent(iValue);
    }
  }

}



