import axios from 'axios';
import * as signalR from '@microsoft/signalr';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - возможно, токен истёк');
    }
    return Promise.reject(error);
  }
);