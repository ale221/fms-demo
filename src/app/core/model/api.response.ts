export class ApiResponse<T> {
  message: string;
  response: T;
  status: boolean;
}
export class ApiResponseNew<T> {
  message: string;
  response: T;
  status: number;
}
export class LoginApiResponse<T> {
  message: string;
  response: T;
  status: number;
}
export class TestApiResponse<T> {
  message: string;
  response: T;
  status: number;
  remaining: boolean;
}
