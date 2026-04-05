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

  // Get metadata for all students in a class (one-shot preload)
  async getMetadataByClass(classLevel, term, year) {
    return await api.get(
      `/results/metadata?classLevel=${encodeURIComponent(
        classLevel
      )}&term=${encodeURIComponent(term)}&year=${encodeURIComponent(year)}`
    );
  },

  // Save result metadata
  async saveResultMetadata(studentId, term, year, data) {
    const response = await api.put(`/results/metadata/${studentId}`, {
      term,
      year,
      ...data,
    });
    return response;
  },
};
