import { api } from "./client.js";

export const studentService = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await api.get(`/students?${queryParams}`);
  },

  getById: async (id) => {
    return await api.get(`/students/${id}`);
  },

  create: async (studentData) => {
    return await api.post("/students", studentData);
  },

  update: async (id, studentData) => {
    return await api.put(`/students/${id}`, studentData);
  },

  delete: async (id) => {
    return await api.delete(`/students/${id}`);
  },
};
