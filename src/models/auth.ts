export interface RegisterModel {
  email: string;
  username: string;
  password: string;
  name: string;
  surname: string;
}

export interface LoginModel {
  login: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}