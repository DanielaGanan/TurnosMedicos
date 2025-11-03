import axios from 'axios';

// Base URL: usa VITE_API_URL si existe; si no, fallback a 127.0.0.1:8000
const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://127.0.0.1:8000';

// Crear instancia de axios con configuración por defecto
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para agregar el token si existe (para futuro login)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Código de estado:', error.response.status);
    } else if (error.request) {
      console.error('Error de red:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ========================================
// SERVICIOS DE ESPECIALIDADES
// ========================================
export const especialidadesAPI = {
  getAll: async () => (await api.get('/especialidades/')).data,
  getById: async (id) => (await api.get(`/especialidades/${id}`)).data,
  create: async (data) => (await api.post('/especialidades/', data)).data,
  update: async (id, data) => (await api.put(`/especialidades/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/especialidades/${id}`)).data,
};

// ========================================
// SERVICIOS DE MÉDICOS
// ========================================
export const medicosAPI = {
  getAll: async (idEspecialidad = null) => {
    const url = idEspecialidad ? `/medicos/?id_especialidad=${idEspecialidad}` : '/medicos/';
    return (await api.get(url)).data;
  },
  getById: async (id) => (await api.get(`/medicos/${id}`)).data,
  create: async (data) => (await api.post('/medicos/', data)).data,
  update: async (id, data) => (await api.put(`/medicos/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/medicos/${id}`)).data,
};

// ========================================
// SERVICIOS DE USUARIOS
// ========================================
export const usuariosAPI = {
  getAll: async () => (await api.get('/usuarios/')).data,
  login: async (email, password) => (await api.post('/usuarios/login', { email, password })).data,
  activate: async (id) => (await api.post(`/usuarios/${id}/activate`)).data,
  deactivate: async (id) => (await api.post(`/usuarios/${id}/deactivate`)).data,
};

export default api;
