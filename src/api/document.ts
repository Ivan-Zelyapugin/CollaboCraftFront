import axios from 'axios';
import { UserDocumentDto, DocumentDetails } from '../models/document';
import { DocumentRole } from '../models/document';

const api = axios.create({
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

export const getMyDocuments = async (): Promise<UserDocumentDto[]> => {
  const res = await api.get<UserDocumentDto[]>('/document/my');
  return res.data;
};

export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/document/${id}`);
};

export const getDocumentDetails = async (id: number): Promise<DocumentDetails> => {
  const res = await api.get<DocumentDetails>(`/document/${id}`);
  return res.data;
};
