declare var google: any;
export  class GoogleMapModel {
   private static mapProp = {
    center: {lat: 25.3548, lng: 51.1839},
    zoom: 9,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scaleControl: false,
    fullscreenControl: true,
    zoomControl: true,
    mapTypeControl: true,
    controlSize: 30,
    streetViewControl: false,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },
  };
  static getMapProp() {
    return GoogleMapModel.mapProp;

  }

}
