import axios from 'axios';

// Base URL: usa VITE_API_URL si existe; si no, fallback a 127.0.0.1:8000
const API_BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://127.0.0.1:8000';

// Normalizador de mensajes de error (Pydantic v2 y genéricos)
function normalizeDetail(detail) {
  if (!detail) return '';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((e) => (e && e.msg) ? e.msg : String(e));
    return parts.join('; ');
  }
  if (typeof detail === 'object') return detail.msg || JSON.stringify(detail);
  try { return String(detail); } catch { return ''; }
}

// Crear instancia de axios con configuración por defecto
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Interceptor para agregar el token si existe (para futuro login)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente y normalizar "detail"
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response) {
      const data = error.response.data || {};
      const msg = normalizeDetail(data.detail) || error.message || '';
      try { error.response.data.detail = msg; } catch {}
      console.error('Error de respuesta:', data);
      console.error('Codigo de estado:', error.response.status);
    } else if (error && error.request) {
      console.error('Error de red:', error.request);
    } else {
      console.error('Error:', error ? error.message : 'desconocido');
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
