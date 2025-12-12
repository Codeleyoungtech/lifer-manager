import { api } from "./client.js";

export const subjectService = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await api.get(`/subjects?${queryParams}`);
  },

  getByCode: async (code) => {
    return await api.get(`/subjects/${code}`);
  },

  create: async (subjectData) => {
    return await api.post("/subjects", subjectData);
  },

  update: async (code, subjectData) => {
    return await api.put(`/subjects/${code}`, subjectData);
  },

  delete: async (code) => {
    return await api.delete(`/subjects/${code}`);
  },
};
