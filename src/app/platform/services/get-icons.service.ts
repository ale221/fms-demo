import {Injectable} from '@angular/core';
import {DropDownItem} from '../data/model/dropdown-item';
import {ActivityStatusEnum, MaterialTypeEnum, SkipSizeToMaterialEnum} from '../../core/enum/entity-type.enum';
import {PrimengDropdownItem} from '../data/model/primng-dropdown-item';

@Injectable({
  providedIn: 'root'
})
export class GetIconsService {
  ActivityStatusEnum = ActivityStatusEnum;

  constructor() {
  }

  getBinIcon(size, status?) {
    if (size == 157 && status != null) {
      return 'assets/images/iol/activity/icon-map-bin-240liters-' + status + '.png';
    } else if (size == 158 && status != null) {
      return 'assets/images/iol/activity/icon-map-bin-1.1cbm-' + status + '.png';
    } else if (size == 147 && status != null) {
      return 'assets/images/iol/activity/icon-map-bin-2.5cbm-' + status + '.png';
    } else if (size == 148 && status != null) {
      return 'assets/images/iol/activity/icon-map-bin-5cbm-' + status + '.png';
    } else if (status != null && status != null) {
      return 'assets/images/iol/activity/icon-map-bin-8cbm-' + status + '.png';
    } else {
      if (size == 157) {
        return 'assets/images/iol/icon-map-bin-240liters.png';
      } else if (size == 158) {
        return 'assets/images/iol/icon-map-bin-1.1cbm.png';
      } else if (size == 147) {
        return 'assets/images/iol/icon-map-bin-2.5cbm.png';
      } else if (size == 148) {
        return 'assets/images/iol/icon-map-bin-5cbm.png';
      } else {
        return 'assets/images/iol/icon-map-bin-8cbm.png';
      }
    }
  }

  getMaterialLabel(response) {
    if (response == 'Metal') {
      return new DropDownItem(MaterialTypeEnum.METAL, response);
    } else if (response == 'Plastic') {
      return new DropDownItem(MaterialTypeEnum.PLASTIC, response);
    } else if (response == 'Galvanized Metal or Plastic') {
      return new DropDownItem(MaterialTypeEnum.GALVANIZED_METAL_OR_PLASTIC, response);
    } else if (response == 'Galvanized Metal') {
      return new DropDownItem(MaterialTypeEnum.GALVANIZED_METAL, response);
    } else if (response == 'Medical Waste') {
      return new DropDownItem(MaterialTypeEnum.MEDICAL_WASTE, response);
    }
  }


  getActivtyEventIcons(status, binFlag = false, skip_size?) {
    if (binFlag) {
      if (status === this.ActivityStatusEnum.COMPLETED) {
        return 'assets/images/iol/activity/Completed.png';
      }
      if (status === this.ActivityStatusEnum.STARTED) {
        return 'assets/images/iol/activity/Started.png';
      }
      if (status === this.ActivityStatusEnum.FAILED) {
        return this.getBinIcon(skip_size, 'failed');
      }
      if (status === this.ActivityStatusEnum.ACCEPTED) {
        return this.getBinIcon(skip_size, 'accepted');
      }
      if (status === this.ActivityStatusEnum.SUSPENDED || this.ActivityStatusEnum.PENDING === status) {
        return this.getBinIcon(skip_size, 'suspended');
      }
      if (status === this.ActivityStatusEnum.RESUMED) {
        return this.getBinIcon(skip_size, 'resumed');
      }
      if (status === this.ActivityStatusEnum.WASTE_COLLECTED) {
        return this.getBinIcon(skip_size, 'waste');
      }
      if (status === this.ActivityStatusEnum.UNCOLLECTED) {
        return 'assets/images/iol/activity/icon-map-bin-overflow.png';
        // return this.getBinIcon(skip_size, 'overflow');
      }
      if (status === this.ActivityStatusEnum.COLLECT_WASTE) {
        return this.getBinIcon(skip_size, 'waste');
      }
      if (status === this.ActivityStatusEnum.DROPOFF_BIN) {
        return this.getBinIcon(skip_size, 'dropoff');
      }
      if (status === this.ActivityStatusEnum.SKIP_VERIFITCATION) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.BIN_PICKED_UP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.PICKUP_BIN) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.WORKSHOP_DROP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.MAINTENANCE_PICKUP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.REVIEWED) {
        return 'assets/images/iol/activity/Reviewed.png';
      }
      if (status === this.ActivityStatusEnum.RESUMED) {
        return 'assets/images/iol/activity/Resumed.png';
      }
      if (status === this.ActivityStatusEnum.WORKSHOP_DROP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.STARTED) {
        return 'assets/images/iol/activity/Started.png';
      }
      return this.getBinIcon(skip_size, null);
    } else {
      if (status === this.ActivityStatusEnum.COMPLETED) {
        return 'assets/images/iol/activity/Completed.png';
      }
      if (status === this.ActivityStatusEnum.STARTED) {
        return 'assets/images/iol/activity/Started.png';
      }
      if (status === this.ActivityStatusEnum.FAILED) {
        return 'assets/images/iol/activity/Failed.png';
      }
      if (status === this.ActivityStatusEnum.REVIEWED) {
        return 'assets/images/iol/activity/Reviewed.png';
      }
      if (status === this.ActivityStatusEnum.ACCEPTED) {
        return 'assets/images/iol/activity/Accepted.png';
      }
      if (status === this.ActivityStatusEnum.SUSPENDED) {
        return 'assets/images/iol/activity/Suspended.png';
      }
      if (status === this.ActivityStatusEnum.RESUMED) {
        return 'assets/images/iol/activity/Resumed.png';
      }
      if (status === this.ActivityStatusEnum.WASTE_COLLECTED) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.UNCOLLECTED) {
        return 'assets/images/iol/activity/icon-map-bin-overflow.png';
        // return this.getBinIcon(skip_size, 'overflow');
      }
      if (status === this.ActivityStatusEnum.COLLECT_WASTE) {
        return 'assets/images/iol/activity/collect_waste.png';
      }
      if (status === this.ActivityStatusEnum.DROPOFF_BIN) {
        return 'assets/images/iol/activity/Bin Dropoff.png';
      }
      if (status === this.ActivityStatusEnum.SKIP_VERIFITCATION) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.BIN_PICKED_UP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.PICKUP_BIN) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.WORKSHOP_DROP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.MAINTENANCE_PICKUP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.REVIEWED) {
        return 'assets/images/iol/activity/Reviewed.png';
      }
      if (status === this.ActivityStatusEnum.RESUMED) {
        return 'assets/images/iol/activity/Resumed.png';
      }
      if (status === this.ActivityStatusEnum.WORKSHOP_DROP) {
        return 'assets/images/iol/activity/default.png';
      }
      if (status === this.ActivityStatusEnum.STARTED) {
        return 'assets/images/iol/activity/Started.png';
      }
      return 'assets/images/iol/activity/default.png';
    }


  }
}
