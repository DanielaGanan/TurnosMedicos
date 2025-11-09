import api from './api.js';

// ========================================
// SERVICIOS DE TURNOS
// ========================================
export const turnosAPI = {
  // Obtener todos los turnos (con filtros opcionales)
  getAll: async ({ id_usuario = null, id_doctor = null } = {}) => {
    const params = new URLSearchParams();
    if (id_usuario) params.append("id_usuario", id_usuario);
    if (id_doctor) params.append("id_doctor", id_doctor);
    const qs = params.toString();
    const url = qs ? `/turnos/?${qs}` : "/turnos/";
    const response = await api.get(url);
    return response.data;
  },

  // Obtener detalle (join de usuario y médico)
  getAllDetail: async ({ id_usuario = null, id_doctor = null } = {}) => {
    const params = new URLSearchParams();
    if (id_usuario) params.append("id_usuario", id_usuario);
    if (id_doctor) params.append("id_doctor", id_doctor);
    const qs = params.toString();
    const url = qs ? `/turnos/detalle?${qs}` : "/turnos/detalle";
    const response = await api.get(url);
    return response.data;
  },

  // Obtener un turno por ID
  getById: async (id) => {
    const response = await api.get(`/turnos/${id}`);
    return response.data;
  },

  // Crear nuevo turno
  create: async (data) => {
    //const response = await api.post('/turnos/', data);
    const response = await api.post("/turnos/reservar", data);
    return response.data;
  },

  // Obtener disponibilidad de horarios para un doctor en una fecha
  getDisponibilidad: async (id_doctor, fecha) => {
    // La fecha debe estar en formato YYYY-MM-DD para el Query Parameter
    const response = await api.get(`/turnos/${id_doctor}/disponibilidad`, {
      params: { fecha },
    });
    return response.data; // Devuelve una lista de strings ['HH:MM:SS']
  },

  // Actualizar turno
  update: async (id, data) => {
    const response = await api.put(`/turnos/${id}`, data);
    return response.data;
  },

  // Eliminar (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/turnos/${id}`);
    return response.data;
  },
};

export default turnosAPI;
