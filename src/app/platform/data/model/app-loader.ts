export class AppLoader {
  visibility = false;
  dataError = false;

  constructor(visibility?: boolean, dataError?: boolean) {
    this.visibility = visibility;
    this.dataError = dataError;
  }
}
