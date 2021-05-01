
// export interface Validator {
//     name: string;
//     validator: any;
//     message: string;
//     }
    
export interface FieldConfig {
    label?: string;
    name?: string;
    inputType?: string;
    options?: any;
    collections?: any;
    type: string;
    value?: any;
    validations?: any;
    bootstrapGridClass?:string;
    data_live_search?:boolean;
    row?:boolean;
    searchable?:boolean;
    required?:boolean;
    }