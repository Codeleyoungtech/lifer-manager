import { api } from "./client.js";

export const resultService = {
  getResults: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await api.get(`/results?${queryParams}`);
  },

  saveResult: async (resultData) => {
    return await api.post("/results", resultData);
  },

  batchSaveResults: async (batchData) => {
    return await api.post("/results/batch", batchData);
  },

  calculatePositions: async (data) => {
    return await api.post("/results/calculate-positions", data);
  },
};
