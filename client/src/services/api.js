import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8000';

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
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);
      console.error('Código de estado:', error.response.status);
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('Error de red:', error.request);
    } else {
      // Algo sucedió al configurar la solicitud
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
    const response = await api.get('/especialidades');
    return response.data;
  },

  // Obtener una especialidad por ID
  getById: async (id) => {
    const response = await api.get(`/especialidades/${id}`);
    return response.data;
  },

  // Crear nueva especialidad
  create: async (data) => {
    const response = await api.post('/especialidades', data);
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
// SERVICIOS DE MÉDICOS
// ========================================
export const medicosAPI = {
  // Obtener todos los médicos (con filtro opcional por especialidad)
  getAll: async (idEspecialidad = null) => {
    const url = idEspecialidad 
      ? `/medicos?id_especialidad=${idEspecialidad}`
      : '/medicos';
    const response = await api.get(url);
    return response.data;
  },

  // Obtener un médico por ID
  getById: async (id) => {
    const response = await api.get(`/medicos/${id}`);
    return response.data;
  },

  // Crear nuevo médico
  create: async (data) => {
    const response = await api.post('/medicos', data);
    return response.data;
  },

  // Actualizar médico
  update: async (id, data) => {
    const response = await api.put(`/medicos/${id}`, data);
    return response.data;
  },

  // Eliminar médico (soft delete)
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
    const response = await api.get('/usuarios');
    return response.data;
  },

  // Login (cuando lo implementes en el backend)
  login: async (email, password) => {
    const response = await api.post('/usuarios/login', { email, password });
    return response.data;
  },
};

// Exportar la instancia de axios por si se necesita en algún lugar
export default api;