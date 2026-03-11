
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user:any
}
export interface User {
  id: number;
  name: string;
  email: string;
}
