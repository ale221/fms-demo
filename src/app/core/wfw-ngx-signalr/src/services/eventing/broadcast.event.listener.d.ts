import { Subject } from "rxjs";

export declare class BroadcastEventListener<T> extends Subject<T> {
    event: string;
    constructor(event: string);
}
