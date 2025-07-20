import axios from 'axios';
import { LoginModel, RegisterModel, AuthResponse } from '../models/auth';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Обновляем заголовок Authorization динамически
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const login = async (model: LoginModel): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', model);
    return response.data;
  } catch (error: any) {
    // Перебрасываем ошибку с данными ответа
    throw error;
  }
};

export const register = async (model: RegisterModel): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', model);
  return response.data;
};