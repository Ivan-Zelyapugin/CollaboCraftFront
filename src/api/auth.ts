import { api } from './baseUrl'
import { LoginModel, RegisterModel, AuthResponse } from '../models/auth';

export const login = async (model: LoginModel): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', model);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const register = async (model: RegisterModel): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', model);
  return response.data;
};