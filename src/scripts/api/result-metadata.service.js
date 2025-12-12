import { api } from "./client.js";

export default {
  // Get result metadata (conventional performance + comments)
  async getResultMetadata(studentId, term, year) {
    const data = await api.get(
      `/results/metadata/${studentId}?term=${encodeURIComponent(
        term
      )}&year=${encodeURIComponent(year)}`
    );

    return data;
  },

  // Save result metadata
  async saveResultMetadata(studentId, term, year, data) {
    const response = await api.put(`/results/metadata/${studentId}`, {
      term,
      year,
      ...data,
    });
    return response.data;
  },
};
