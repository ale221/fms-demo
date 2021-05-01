import { ModuleWithProviders, NgZone } from '@angular/core';
import { SignalR } from '../services/signalr';
import { SignalRConfiguration } from '../services/signalr.configuration';
import * as ɵngcc0 from '@angular/core';
export declare function createSignalr(configuration: SignalRConfiguration, zone: NgZone): SignalR;
export declare class SignalRModule {
    static forRoot(getSignalRConfiguration: Function): ModuleWithProviders<SignalRModule>;
    static forChild(): ModuleWithProviders;
    static ɵmod: ɵngcc0.ɵɵNgModuleDefWithMeta<SignalRModule, never, never, never>;
    static ɵinj: ɵngcc0.ɵɵInjectorDef<SignalRModule>;
    // static ɵmod: ɵngcc0.ɵɵNgModuleDefWithMeta<SignalRModule, never, never, never>;
    // static ɵinj: ɵngcc0.ɵɵInjectorDef<SignalRModule>;
}

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmFsci1tb2R1bGUuZC50cyIsInNvdXJjZXMiOlsic2lnbmFsci1tb2R1bGUuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxrQ0FBbUI7QUFDMUU7Ozs7O0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgU2lnbmFsUiB9IGZyb20gJy4uL3NlcnZpY2VzL3NpZ25hbHInO1xyXG5pbXBvcnQgeyBTaWduYWxSQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uL3NlcnZpY2VzL3NpZ25hbHIuY29uZmlndXJhdGlvbic7XHJcbmV4cG9ydCBkZWNsYXJlIGZ1bmN0aW9uIGNyZWF0ZVNpZ25hbHIoY29uZmlndXJhdGlvbjogU2lnbmFsUkNvbmZpZ3VyYXRpb24sIHpvbmU6IE5nWm9uZSk6IFNpZ25hbFI7XHJcbmV4cG9ydCBkZWNsYXJlIGNsYXNzIFNpZ25hbFJNb2R1bGUge1xyXG4gICAgc3RhdGljIGZvclJvb3QoZ2V0U2lnbmFsUkNvbmZpZ3VyYXRpb246IEZ1bmN0aW9uKTogTW9kdWxlV2l0aFByb3ZpZGVycztcclxuICAgIHN0YXRpYyBmb3JDaGlsZCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzO1xyXG59XHJcbiJdfQ==