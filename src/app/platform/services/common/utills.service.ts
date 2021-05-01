import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtillsService {

  // parameters
  private paramValue: any;
  // parameter end

  constructor(private activatedRoute: ActivatedRoute) {
  }

  // this function is used to get params by passing param name
  public getParams(param: string) {
    this.paramValue = this.activatedRoute.snapshot.data[param];
    return this.paramValue;
  }

  // this function is used with map, its purpose is to get placeId from lat/long
  getPlaceIdFromLatlng(geocoder, lat, lng) {
    let promise = new Promise((resolve, reject) => {
      //TODO
      let latitude = lat;
      let longitude = lng;
      var latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

      geocoder.geocode({ 'location': latlng }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            resolve(results[1].place_id)
          } else {
            // window.alert('No results found');
            reject("there's a problem with your request.")
          }
        } else {
          //window.alert('Geocoder failed due to: ' + status);
          reject("there's a problem with your request.")
        }
      });
    });
    return promise;

  }

  public exportToCsv(csvCoumns, filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const keyss = this.filterData(csvCoumns);
    console.log(keys)
    const csvData =
      keyss.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          // console.log("ashdka",cell);
          // cell = cell instanceof Date
          //   ? cell.toLocaleString()
          //   : cell.toString().replace(/"/g, '""');
          // if (cell.search(/("|,|\n)/g) >= 0) {
          //   cell = `"${cell}"`;
          //   console.log(cell,'akshdlkashld')
          // }
          return cell;
        }).join(separator);
      }).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }


  public exportToExcel(csvCoumns, filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const keyss = this.filterData(csvCoumns);
    console.log(keys)
    const csvData = keyss.join(separator) + '\n' + rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        return cell;
      }).join(separator);
    }).join('\n');
    const blob = new Blob([csvData], { type: 'text/xlsx;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  public filterData(csvCols, key?) {
    return csvCols.map(({ header }) => header)
  }
  public addId(arr) {
    return arr.map(function (obj, index) {
      return Object.assign({}, obj, { id: index + 1 });
    });
  };
}
