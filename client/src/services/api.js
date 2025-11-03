import axios from 'axios';

// ConfiguraciÃ³n base de la API
const API_BASE_URL = (import.meta?.env?.VITE_API_URL) || '/api';

// Crear instancia de axios con configuraciÃ³n por defecto
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
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondiÃ³ con un cÃ³digo de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      console.error('CÃ³digo de estado:', error.response.status);
    } else if (error.request) {
      // La solicitud se realizÃ³ pero no se recibiÃ³ respuesta
      console.error('Error de red:', error.request);
    } else {
      // Algo sucediÃ³ al configurar la solicitud
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ========================================
// SERVICIOS DE ESPECIALIDADES
// ========================================
export const especialidadesAPI = {
  // Obtener todas las especialidades
  getAll: async () => {
    const response = await api.get('/especialidades/');
    return response.data;
  },

  // Obtener una especialidad por ID
  getById: async (id) => {
    const response = await api.get(`/especialidades/${id}`);
    return response.data;
  },

  // Crear nueva especialidad
  create: async (data) => {
    const response = await api.post('/especialidades/', data);
    return response.data;
  },

  // Actualizar especialidad
  update: async (id, data) => {
    const response = await api.put(`/especialidades/${id}`, data);
    return response.data;
  },

  // Eliminar especialidad (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/especialidades/${id}`);
    return response.data;
  },
};

// ========================================
// SERVICIOS DE MÃ‰DICOS
// ========================================
export const medicosAPI = {
  // Obtener todos los mÃ©dicos (con filtro opcional por especialidad)
  getAll: async (idEspecialidad = null) => {
    const url = idEspecialidad 
      ? `/medicos/?id_especialidad=${idEspecialidad}`
      : '/medicos/';
    const response = await api.get(url);
    return response.data;
  },

  // Obtener un mÃ©dico por ID
  getById: async (id) => {
    const response = await api.get(`/medicos/${id}`);
    return response.data;
  },

  // Crear nuevo mÃ©dico
  create: async (data) => {
    const response = await api.post('/medicos/', data);
    return response.data;
  },

  // Actualizar mÃ©dico
  update: async (id, data) => {
    const response = await api.put(`/medicos/${id}`, data);
    return response.data;
  },

  // Eliminar mÃ©dico (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/medicos/${id}`);
    return response.data;
  },
};

// ========================================
// SERVICIOS DE USUARIOS
// ========================================
export const usuariosAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/usuarios/');
    return response.data;
  },

  // Login (cuando lo implementes en el backend)
  login: async (email, password) => {
    const response = await api.post('/usuarios/login', { email, password });
    return response.data;
  },
  // Activar / Desactivar (requiere endpoints en backend)
  activate: async (id) => {
    const response = await api.post(`/usuarios/${id}/activate`);
    return response.data;
  },
  deactivate: async (id) => {
    const response = await api.post(`/usuarios/${id}/deactivate`);
    return response.data;
  },
};

// Exportar la instancia de axios por si se necesita en algÃºn lugar
export default api;

