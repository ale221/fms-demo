/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { InjectionToken, NgModule, NgZone } from "@angular/core";
import { SignalR } from "./signalr";
import * as ɵngcc0 from '@angular/core';
var /** @type {?} */ SIGNALR_CONFIGURATION = new InjectionToken('SIGNALR_CONFIGURATION');
export var /** @type {?} */ SIGNALR_JCONNECTION_TOKEN = new InjectionToken('SIGNALR_JCONNECTION_TOKEN');
/**
 * @param {?} configuration
 * @param {?} zone
 * @return {?}
 */
export function createSignalr(configuration, zone) {
    var /** @type {?} */ jConnectionFn = getJConnectionFn();
    return new SignalR(configuration, zone, jConnectionFn);
}
/**
 * @return {?}
 */
export function getJConnectionFn() {
    var /** @type {?} */ jQuery = getJquery();
    var /** @type {?} */ hubConnectionFn = (/** @type {?} */ (window)).jQuery.hubConnection;
    if (hubConnectionFn == null) {
        throw new Error('Signalr failed to initialize. Script \'jquery.signalR.js\' is missing. Please make sure to include \'jquery.signalR.js\' script.');
    }
    return hubConnectionFn;
}
/**
 * @return {?}
 */
function getJquery() {
    var /** @type {?} */ jQuery = (/** @type {?} */ (window)).jQuery;
    if (jQuery == null) {
        throw new Error('Signalr failed to initialize. Script \'jquery.js\' is missing. Please make sure to include jquery script.');
    }
    return jQuery;
}
var ɵ0 = SignalR;
var SignalRModule = (function () {
    function SignalRModule() {
    }
    /**
     * @param {?} getSignalRConfiguration
     * @return {?}
     */
    SignalRModule.forRoot = /**
     * @param {?} getSignalRConfiguration
     * @return {?}
     */
    function (getSignalRConfiguration) {
        return {
            ngModule: SignalRModule,
            providers: [
                {
                    provide: SIGNALR_JCONNECTION_TOKEN,
                    useFactory: getJConnectionFn
                },
                {
                    provide: SIGNALR_CONFIGURATION,
                    useFactory: getSignalRConfiguration
                },
                {
                    deps: [SIGNALR_JCONNECTION_TOKEN, SIGNALR_CONFIGURATION, NgZone],
                    provide: SignalR,
                    useFactory: (createSignalr)
                }
            ]
        };
    };
    /**
     * @return {?}
     */
    SignalRModule.forChild = /**
     * @return {?}
     */
    function () {
        throw new Error('forChild method not implemented');
    };
    /** @nocollapse */
    SignalRModule.ctorParameters = function () { return []; };
SignalRModule.ɵmod = ɵngcc0.ɵɵdefineNgModule({ type: SignalRModule });
SignalRModule.ɵinj = ɵngcc0.ɵɵdefineInjector({ factory: function SignalRModule_Factory(t) { return new (t || SignalRModule)(); }, providers: [{
            provide: SignalR,
            useValue: ɵ0
        }] });
/*@__PURE__*/ (function () { ɵngcc0.ɵsetClassMetadata(SignalRModule, [{
        type: NgModule,
        args: [{
                providers: [{
                        provide: SignalR,
                        useValue: ɵ0
                    }]
            }]
    }], function () { return []; }, null); })();
    return SignalRModule;
}());
export { SignalRModule };
function SignalRModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    SignalRModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    SignalRModule.ctorParameters;
}
export { ɵ0 };

//# sourceMappingURL=signalr.module.js.map