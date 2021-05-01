import { Injectable } from '@angular/core';
import swal from 'sweetalert2';
import { EntityStatusEnum } from '../enum/entity-type.enum';

@Injectable({
  providedIn: 'root'
})
export class SwalService {

  constructor() {
  }

  // swal for success
  getSuccessSwal(message, timer = 1500) {
    return swal({
      type: 'success',
      title: 'Success!',
      text: message,
      showConfirmButton: false,
      timer: timer
    });
  }

  getSwalWithOKButton(type, title, message) {
    return swal({
      type: type,
      title: title,
      text: message,
      showConfirmButton: true,
    });
  }

  // Swal for error
  getErrorSwal(message = 'Something went wrong!', footerMsg?) {
    swal({
      type: 'error',
      title: 'Error',
      customClass: 'swal-wide',
      text: footerMsg || message,
      // footer: footerMsg? footerMsg : '',
    });
  }
  getErrorSwalforDocument(message = 'Document Record Already Exists.', footerMsg?) {
    swal({
      type: 'error',
      title: 'Error',
      customClass: 'swal-wide',
      text: footerMsg || message,
      // footer: footerMsg? footerMsg : '',
    });
  }

  // swal for info
  getInfoSwal(message, timeout = 1500) {
    return swal({
      type: 'info',
      text: message,
      customClass: 'issue',

      showConfirmButton: false,
      timer: timeout
    });
  }

  // swal for warning
  getWarningSwal(message?) {
    swal({
      type: 'warning',
      title: 'Warning',
      text: message,
      customClass: 'issue',

    });
  }

  val;

  async getDeleteSwal(objToDelete?, title = 'What do you want to do with ' + objToDelete.name + ' ?') {
    return new Promise((resolve, reject) => {

      swal({
        title: 'You won\'t be able to revert this!',
        text: title,
        type: 'warning',
        customClass: 'issue',
        showCancelButton: (objToDelete.status_id === EntityStatusEnum.Active) || ((objToDelete.status === EntityStatusEnum.Active)),
        confirmButtonText: 'Delete Record',
        cancelButtonText: 'Mark as Inactive',
        confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        buttonsStyling: false,
        showCloseButton: true,
        allowOutsideClick: false,
      })
        .then((result) => {
          if (result.value) {
            resolve(EntityStatusEnum.Delete);
          } else if (result.dismiss === swal.DismissReason.cancel) {
            resolve(EntityStatusEnum.Inactive);
          } else {
            resolve(null);
          }
        });

    });

  }
  async getDeleteSwalBulk(objToDelete?, title = 'Do you want to delete this record?') {
    return new Promise((resolve, reject) => {

      swal({
        title: 'You won\'t be able to revert this!',
        text: title,
        type: 'warning',
        customClass: 'issue',
        showCancelButton: (objToDelete.status_id === EntityStatusEnum.Active) || ((objToDelete.status === EntityStatusEnum.Active)),
        confirmButtonText: 'Delete Record',
        cancelButtonText: 'Mark as Inactive',
        confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        buttonsStyling: false,
        showCloseButton: true,
        allowOutsideClick: false,
      })
        .then((result) => {
          if (result.value) {
            resolve(EntityStatusEnum.Delete);
          } else if (result.dismiss === swal.DismissReason.cancel) {
            resolve(EntityStatusEnum.Inactive);
          } else {
            resolve(null);
          }
        });

    });

  }
  async getDeleteSwalBulk2(objToDelete?, title = 'Do you want to delete these record(s)') {
    return new Promise((resolve, reject) => {

      swal({
        title: 'You won\'t be able to revert this!',
        text: title,
        type: 'warning',
        customClass: 'issue',
        showCancelButton: (objToDelete.status_id === EntityStatusEnum.Active) || ((objToDelete.status === EntityStatusEnum.Active)),
        confirmButtonText: 'Delete record(s)',
        cancelButtonText: 'Mark as Inactive',
        confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        buttonsStyling: false,
        showCloseButton: true,
        allowOutsideClick: false,
      })
        .then((result) => {
          if (result.value) {
            resolve(EntityStatusEnum.Delete);
          } else if (result.dismiss === swal.DismissReason.cancel) {
            resolve(EntityStatusEnum.Inactive);
          } else {
            resolve(null);
          }
        });

    });

  }

  async getMultipleDeleteSwal(arr, showInactive, title = 'What do you want to do with ' + length + ' records?', type = 'info') {
    return new Promise((resolve, reject) => {

      swal({
        text: 'What do you want to do with ' + (arr.length > 2 ? arr.length + ' records' : arr) + ' ?',
        title: 'You won\'t be able to revert this!',
        type: 'warning',
        customClass: 'issue',
        showCancelButton: showInactive,
        showCloseButton: true,
        allowOutsideClick: true,
        confirmButtonText: 'Delete Records',
        cancelButtonText: 'Mark as Inactive',
        confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        cancelButtonClass: 'btn btn-sm btn-warning margin-5',
        buttonsStyling: false,
      })
        .then((result) => {
          if (result.value) {
            resolve(EntityStatusEnum.Delete);
          } else if (result.dismiss === swal.DismissReason.cancel) {

            resolve(EntityStatusEnum.Inactive);
          } else {
            resolve(null);
          }
        });
    });

  }

  getConfirmSwal() {
    return new Promise((resolve, reject) => {

      swal({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        type: 'warning',
        customClass: 'issue',
        showCancelButton: true,

        cancelButtonText: 'Cancel',
        confirmButtonText: 'Delete Record',

        cancelButtonClass: 'btn btn-sm btn-default margin-5',
        confirmButtonClass: 'btn btn-sm btn-danger margin-5',

        buttonsStyling: false,
        showCloseButton: true,
        allowOutsideClick: false,
      })
        .then((result) => {
          if (result.value) {
            resolve(true);
          } else {
            resolve(false);
          }
        });





    });
  }


  async askForDeletion(message) {

    return new Promise((resolve, reject) => {

      this.showSwal(message)
        .then((result) => {
          if (result.value) {
            resolve(true);
          } else {
            resolve(false);
          }
        });


    });
  }


  showSwal(message, confirmMessageText = 'Delete!') {
    return swal({
      title: 'Confirmation',
      text: message,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmMessageText,
      cancelButtonText: 'No',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: 'issue',
      confirmButtonClass: 'btn btn-sm btn-danger margin-5',
      cancelButtonClass: 'btn btn-sm btn-warning margin-5',
    });
  }


  async getDeleteSwal2(objToDelete?, title = 'What do you want to do with ' + objToDelete.name + ' ?') {
    return new Promise((resolve, reject) => {

      swal({
        title: 'You won\'t be able to revert this!',
        text: title,
        type: 'warning',
        customClass: 'issue',
        confirmButtonText: 'Delete Record',
        confirmButtonClass: 'btn btn-sm btn-danger margin-5',
        buttonsStyling: false,
        showCloseButton: true,
        allowOutsideClick: false,
      })
        .then((result) => {
          if (result.value) {
            resolve(EntityStatusEnum.Delete);
          } else {
            resolve(null);
          }
        });

    });

  }

}


export enum swalTypes {
  SUCCESS = 'success',
}
