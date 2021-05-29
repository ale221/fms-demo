import { Observer } from 'rxjs';

export abstract class HttpController<T> implements Observer<T> {

  constructor(protected context: any = null) {
    this.initialize();
  }

  private initialize(): void {

    // if (this.isError) {
    //   // hide error layout
    // }
  }

  next(t: T): void {
    this.onNext(t);
    // // console.log(t);
  }

  error(err: any): void {
    let errorMessage = 'There is some issue, your request cannot be processed.'; // change to let
    // errorMessage = err.error.message;
    this.onError(errorMessage, err);
    
  }

  complete(): void {
    this.onComplete();
  }

  abstract onNext(t: T): void;

  abstract onError(errorMessage: string, err: any): void;

  abstract onComplete(): void;
}
