import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class DatatableService {

  temp: any[];

  constructor() {
  }

  updateFilter(value, data, args = ['name']) {
    let temp = [];
    let condition;
    if (isNullOrUndefined(value)) {
      return data;
    }
    const val = value.toString().toLowerCase();

    temp = data.filter(item => {
      if (args[0] in item && !isNullOrUndefined(item[args[0]])) {
        condition = item[args[0]].toString().toLowerCase().indexOf(val) >= 0;
      } else {
        condition = false;
      }
      if (args.length > 1) {
        for (let i = 0; i < args.length; i++) {
          if (args[i] in item) {
            if (!isNullOrUndefined(item[args[i]])) {
              condition = condition || (item[args[i]].toString().toLowerCase().indexOf(val) >= 0);
            }
          }
        }
      }
      return condition;
    });
    return temp;
  }


  updateNumericFilter(value, data, args?) {
    const val = value;
    let temp;

    if (args) {
      let firstCondition;
      temp = data.filter(function (d) {
        if (!isNullOrUndefined(d[args[0]])) {
          firstCondition = d[args[0]] === val;
        }
        for (let i = 1; i < args.length; i++) {
          if (!isNullOrUndefined(d[args[i]])) {
            firstCondition = firstCondition || (d[args[i]] === val);
          }
        }
        return (firstCondition);
      });


    } else {
      // filter our data
      temp = data.filter(function (d) {
        return d.name.toLowerCase().indexOf(val) !== -1 || !val;
      });
    }
    return temp;

    // update the rows

  }

  //  Filter for multiple rows with and condition
  myMultiFilter(array, filters) {
    const filterKeys = Object.keys(filters);

    const c = array.filter((item) => {
      const b = filterKeys.every((key) => {
        if (!(key in item)) {
          return false;
        } else {
          if (typeof (item[key]) === 'string') {
            return (item[key].toLowerCase().indexOf(filters[key].toLowerCase()) > -1);
          } else {
            return (item[key] === filters[key]);
          }
        }
      });
      return b;

    });
    return c;

  }


  multipleFilter(array, filters) {
    const filterKeys = Object.keys(filters);
    // filters all elements passing the criteria
    const c = array.filter((item) => {
      // dynamically validate all filter criteria
      const b = filterKeys.every(key => {
        // ignores an empty filter
        if (filters[key] === 'string' && !filters[key].length) {
          return true;
        }
        if (typeof item[key] === 'string') {
          // return filters[key].indexOf(this.toLowerCase(item[key])) !== -1;
          return this.toLowerCase(item[key]).indexOf(this.toLowerCase(filters[key])) > -1;
        } else {
          return filters[key] == (item[key]);

        }


      });
      return b;
    });
    return c;
  }

  toLowerCase(value) {
    if (!isNullOrUndefined(value)) {
      return value.toString().toLowerCase();
    } else {
      return '';
    }
  }

  updateClientFilter(value, data) {
    const val = value.toLowerCase();

    // filter our data
    const temp1 = data.filter(function (d) {
      return d.label.toLowerCase().indexOf(val) !== -1 || !val;
    });
    return temp1;

    // update the rows

  }

  updateTestFilter(valueToSearch, dataToSearchFrom, keysToSearch) {
    // filter our data
    const rowsToReturned = dataToSearchFrom.filter(function (obj) {
        if (obj.hasOwnProperty(keysToSearch)) {
          return obj[keysToSearch] === valueToSearch;
        } else {
          return false;
        }
      }
    );
    return rowsToReturned;


  }

}
