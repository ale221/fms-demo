import {Customer} from './customer';
import {Module} from './module';


export class User {
  associated_client: any;
  associated_entity: any;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  token: string;
  customer: Customer;
  preferred_module: number;
  module: Module;
  user_role_id: number;
  user_entity_type: number;
  status: number;
  themeConfig: any;
}
